# Rincón Literario

Sitio estático para publicar poemas propios en formato de libro.

## Editar poemas

Cada poema vive en `poems.jsx` dentro de un objeto:

```js
{
  title: 'Titulo ',
  author: '',
  year: '',
  lines: [
    'Texto crudo del poema',
  ],
}
```

Para agregar otro, duplicá un objeto y pegá el texto dentro de `lines` sin corregirlo ni reformatearlo.

## Publicación

El workflow `.github/workflows/pages.yml` publica el contenido estático con GitHub Pages cuando hay cambios en `main`.
