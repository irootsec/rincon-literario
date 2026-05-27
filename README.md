# Rincón Literario

Sitio estático para publicar poemas propios en formato de libro.

## Editar poemas

Cada poema vive en `index.html` dentro de un bloque:

```html
<article class="sheet poem-sheet" aria-label="Titulo">
  <h2>Titulo </h2>
  <pre>Texto crudo del poema</pre>
</article>
```

Para agregar otro, duplicá un bloque `poem-sheet` y pegá el texto dentro de `pre` sin corregirlo ni reformatearlo. Después actualizá la lista `labels` en `script.js` para que el contador incluya la nueva hoja.

## Publicación

El workflow `.github/workflows/pages.yml` publica el contenido estático con GitHub Pages cuando hay cambios en `main`.
