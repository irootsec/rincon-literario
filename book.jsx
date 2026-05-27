(() => {
// Book.jsx — librito 3D con sistema de páginas pasables.
// Estado: `current` = índice de la próxima hoja (leaf) sin voltear.
// Cada leaf tiene recto (cara derecha al estar sin voltear) y verso
// (cara izquierda al estar volteada). Al voltear, la hoja rota -180°
// alrededor de su borde izquierdo.

const { useState, useEffect, useRef, useCallback } = React;

// Synthesize a quick "paper rustle" via WebAudio so we don't ship an mp3.
// Filtered noise burst ~280ms, very low volume. Lazy-inits the AudioContext
// on first user interaction (required by browsers).
let _audioCtx = null;
function playPageTurn() {
  try {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = _audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const dur = 0.28;
    // noise buffer
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      // shape: quick rise then decay
      const env = Math.sin(Math.PI * t) * (1 - t * 0.4);
      data[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2400;
    bp.Q.value = 0.8;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.10, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(hp).connect(bp).connect(gain).connect(ctx.destination);
    src.start(now);
    src.stop(now + dur);
  } catch (e) { /* audio not allowed yet; ignore */ }
}

function Book({ theme, poems, bookTitle, bookSubtitle, dedication, sound = true }) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(null); // leaf index currently flipping
  const [hint, setHint] = useState(true); // initial peel hint on first leaf
  const containerRef = useRef(null);
  const dragRef = useRef(null);

  const total = poems.length;
  const poemTotal = poems.filter((poem) => poem.kind !== 'dedication').length;
  const DURATION = 1050;

  const flip = useCallback((dir) => {
    if (animating !== null) return;
    setHint(false);
    const next = dir === 'fwd' ? current + 1 : current - 1;
    if (next < 0 || next > total) return;
    const animLeaf = dir === 'fwd' ? current : current - 1;
    if (sound) playPageTurn();
    setAnimating(animLeaf);
    setCurrent(next);
  }, [current, animating, total, sound]);

  // keyboard nav
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); flip('fwd'); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); flip('bwd'); }
    };
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('keydown', h);
    return () => el.removeEventListener('keydown', h);
  }, [flip]);

  // swipe / click
  const onPointerDown = (e) => {
    if (e.target.closest('button')) return;
    dragRef.current = { x: e.clientX, y: e.clientY, t: Date.now(), target: e.currentTarget };
  };
  const onPointerUp = (e) => {
    if (!dragRef.current) return;
    const { x, y, t } = dragRef.current;
    const dx = e.clientX - x;
    const dy = e.clientY - y;
    const dt = Date.now() - t;
    dragRef.current = null;
    if (Math.abs(dy) > Math.abs(dx) * 1.5) return; // mostly vertical, ignore
    if (Math.abs(dx) > 35) {
      flip(dx < 0 ? 'fwd' : 'bwd');
      return;
    }
    // small movement → treat as click
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    flip(relX > 0.5 ? 'fwd' : 'bwd');
  };

  return (
    <div
      className={`book book--${theme}`}
      ref={containerRef}
      tabIndex={0}
    >
      <div className="book__ambient" />
      <div className="book__candle" aria-hidden="true">
        <div className="book__candle-glow" />
        <div className="book__candle-stick" />
        <div className="book__candle-flame" />
      </div>

      <div className="book__stage">
        <div
          className="book__spread"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {/* hard cover board behind everything */}
          <div className="book__cover book__cover--left" />
          <div className="book__cover book__cover--right" />

          {/* inside front cover (title page) — visible at current=0 on the left */}
          <div
            className="book__inside-cover book__inside-cover--front"
            style={{ visibility: current === 0 ? 'visible' : 'hidden' }}
          >
            <InsideFrontCover title={bookTitle} subtitle={bookSubtitle} dedication={dedication} theme={theme} />
          </div>
          {/* inside back cover — visible at current=N on the right */}
          <div
            className="book__inside-cover book__inside-cover--back"
            style={{ visibility: current === total ? 'visible' : 'hidden' }}
          >
            <InsideBackCover theme={theme} />
          </div>

          {/* spine shadow */}
          <div className="book__binding" />
          <div className="book__binding-shadow-left" />
          <div className="book__binding-shadow-right" />

          {/* leaves */}
          <div className="book__leaves">
            {poems.map((poem, i) => {
              const isFlipped = i < current;
              const isAnimating = i === animating;
              let z;
              if (isAnimating) z = 500;
              else if (isFlipped) z = 100 + i; // more recently flipped → higher
              else z = 100 + (total - i); // closer to current → higher
              const showHint = hint && i === 0 && current === 0;
              return (
                <div
                  key={i}
                  className={[
                    'book__leaf',
                    isFlipped ? 'is-flipped' : '',
                    isAnimating ? 'is-animating' : '',
                    showHint ? 'is-hint' : '',
                  ].join(' ')}
                  style={{ zIndex: z, transitionDuration: `${DURATION}ms` }}
                  onTransitionEnd={(e) => {
                    if (e.currentTarget === e.target && e.propertyName === 'transform') {
                      setAnimating(null);
                    }
                  }}
                >
                  <div className="book__face book__face--recto">
                    <PageRecto poem={poem} pageNumber={poem.kind === 'dedication' ? null : i} theme={theme} />
                    <div className="book__sheen" />
                    {/* corner peel hint on first leaf at start */}
                    {showHint && <div className="book__peel" />}
                  </div>
                  <div className="book__face book__face--verso">
                    <PageVerso poem={poem} pageNumber={poem.kind === 'dedication' ? null : i} theme={theme} />
                    <div className="book__sheen book__sheen--verso" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* page counter */}
          <div className="book__counter">
            {current === 0 ? '—' : Math.min(current, poemTotal)} <span>/</span> {poemTotal}
          </div>

          {/* nav arrows */}
          <button
            className="book__nav book__nav--prev"
            onClick={(e) => { e.stopPropagation(); flip('bwd'); }}
            disabled={current === 0}
            aria-label="página anterior"
          >‹</button>
          <button
            className="book__nav book__nav--next"
            onClick={(e) => { e.stopPropagation(); flip('fwd'); }}
            disabled={current >= total}
            aria-label="página siguiente"
          >›</button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Page faces

function PageRecto({ poem, pageNumber, theme }) {
  if (poem.kind === 'dedication') {
    return <PageDedication lines={poem.lines} />;
  }

  const density = poem.lines.reduce((sum, line) => {
    if (line === '') return sum + 0.5;
    return sum + Math.max(1, Math.ceil(line.length / 48));
  }, 0);
  const densityClass = density >= 18 ? 'page--dense' : density >= 10 ? 'page--long' : '';

  return (
    <div className={`page page--recto ${densityClass}`}>
      <div className="page__inner">
        <header className="page__header">
          {poem.year && <div className="page__meta">{poem.year}</div>}
          <h2 className="page__title">{poem.title}</h2>
          {poem.author && <div className="page__author">{poem.author}</div>}
        </header>
        <div className="page__rule" />
        <div className="page__poem">
          {poem.lines.map((line, idx) =>
            line === '' ? (
              <div className="page__line page__line--break" key={idx} />
            ) : (
              <p className="page__line" key={idx}>{line}</p>
            )
          )}
        </div>
        <footer className="page__footer">
          <span className="page__num">{pageNumber}</span>
        </footer>
      </div>
    </div>
  );
}

function PageVerso({ poem, pageNumber, theme }) {
  if (poem.kind === 'dedication') {
    return <div className="page page--verso page--blank" />;
  }

  return (
    <div className="page page--verso">
      <div className="page__inner">
        <div className="page__verso-mark">
          <div className="page__verso-eyebrow">acabas de leer</div>
          <div className="page__verso-title">{poem.title}</div>
          <div className="page__verso-author">{poem.author}</div>
        </div>
        <footer className="page__footer page__footer--verso">
          <span className="page__num">{pageNumber}</span>
        </footer>
      </div>
    </div>
  );
}

function PageDedication({ lines }) {
  return (
    <div className="page page--dedication">
      <div className="page__inner">
        <div className="dedication-note">
          {lines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsideFrontCover({ title, subtitle, dedication, theme }) {
  return (
    <div className="page page--cover-front">
      <div className="page__inner">
        <div className="cover-front__plate">
          <div className="cover-front__eyebrow">colección</div>
          <h1 className="cover-front__title">{title}</h1>
          <div className="cover-front__rule" />
          <div className="cover-front__sub">{subtitle}</div>
          <div className="cover-front__dedication">{dedication}</div>
        </div>
      </div>
    </div>
  );
}

function InsideBackCover({ theme }) {
  return (
    <div className="page page--cover-back">
      <div className="page__inner">
        <div className="cover-back__mark">·</div>
        <div className="cover-back__fin">fin</div>
      </div>
    </div>
  );
}

window.Book = Book;
})();
