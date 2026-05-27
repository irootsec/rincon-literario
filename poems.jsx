// Texto crudo de los poemas. Para agregar otro, duplicar un objeto.

(() => {
  const POEMS = [
    {
      title: 'Tiempo eterno ',
      author: '',
      year: '',
      lines: [
        'Tardaste tanto en venir',
        'que el tiempo se comió al tiempo ',
        'nada reemplaza esa sensación ',
        'del abrazo y beso tan ansiado y que no fue',
      ],
    },
    {
      title: 'Volverte a encontrar ',
      author: '',
      year: '',
      lines: [
        'Un día te encontré y fue todo ',
        'Tiempo después fue nada ',
        'Esa sensación de vacío ',
        'Cuando menos lo necesitaba ',
        'Quiero perderme otra vez ',
        'Encontrarte de nuevo ',
        'Abrazarte tan profundo como el mar ',
        'Tan caliente como el sol ',
        'sin posibilidad de separación atómica ',
      ],
    },
    {
      title: 'Silencio abrumador  ',
      author: '',
      year: '',
      lines: [
        'El silencio era abrumador ',
        'Solo permanecía el eco de otros tiempos ',
        'Duró tanto, que el tiempo se olvidó de sí mismo ',
        'El ruido se convirtió en un mero recuerdo ',
        'Y el vacío colmo todo a su paso',
        'Nada fue igual, todo permaneció callado para siempre',
      ],
    },
  ];

  window.POEMS = POEMS;
})();
