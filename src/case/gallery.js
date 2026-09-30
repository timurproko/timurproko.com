import { createLightbox, markLoading } from './lightbox.js';

// Shared case-study gallery: renders every image/video in a case's images/
// folder, ordered by filename (01, 02, 03 ...). No manifest — each page passes
// the result of its own import.meta.glob (globs must be static per page).
//
// Filename conventions:
//   01.webp               -> no caption
//   02 Admin panel.webp   -> caption "Admin panel"
//   03-hand-control.jpg   -> caption "hand control"

const VIDEO = /\.(mp4|webm)$/i;

function captionFrom(path) {
  const name = path.split('/').pop().replace(/\.[^.]+$/, '');
  const text = name.replace(/^\d+[\s._-]*/, '').replace(/[-_]+/g, ' ').trim();
  return text || '';
}

export function renderGallery(modules, container, { pair = true } = {}) {
  const items = Object.keys(modules)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map(path => ({ src: modules[path], caption: captionFrom(path), video: VIDEO.test(path) }));

  if (!items.length) {
    container.hidden = true;
    return;
  }

  const lightbox = createLightbox();
  const slides = items.map(item => ({ src: item.src, alt: item.caption, video: item.video }));

  // Progressive rows: one hero image, then a 50/50 pair (unless pair: false),
  // then everything else shares a single strip of smaller thumbnails.
  const stripStart = pair ? 3 : 1;
  const rows = [items.slice(0, 1), items.slice(1, stripStart), items.slice(stripStart)];
  const rowOf = [];
  rows.forEach((row, index) => {
    if (!row.length) return;
    const el = document.createElement('div');
    el.className = index === 2 ? 'gallery-row gallery-strip' : 'gallery-row';
    el.style.setProperty('--cols', row.length);
    container.append(el);
    row.forEach(() => rowOf.push(el));
  });

  items.forEach((item, index) => {
    const figure = document.createElement('figure');
    figure.className = 'shot';

    const media = item.video ? document.createElement('video') : document.createElement('img');
    media.src = item.src;
    if (item.video) {
      Object.assign(media, { autoplay: true, muted: true, loop: true, playsInline: true });
      media.setAttribute('aria-label', item.caption || 'Project video');
    } else {
      media.alt = item.caption || '';
      media.decoding = 'async';
      if (index > 1) media.loading = 'lazy';
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'shot-open';
    button.setAttribute('aria-label', item.caption ? `Enlarge: ${item.caption}` : 'Enlarge');
    button.append(media);
    markLoading(button, media);
    button.addEventListener('click', () => lightbox.open(slides, index));
    figure.append(button);

    if (item.caption) {
      const caption = document.createElement('figcaption');
      caption.textContent = item.caption;
      figure.append(caption);
    }
    rowOf[index].append(figure);
  });
}

