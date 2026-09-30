// Shared full-screen viewer for case-page galleries. Opens one item of a group and
// lets the viewer move through the rest: swipe on touch (the media follows the
// finger), arrow keys, or the side buttons. Media still loading shows the landing
// cards' rainbow sweep. A tap or click that is not a swipe closes it, as does Esc.
//
// Items: { src, alt?, video?, long? } — long opens a tall image at full width and
// scrolls it (swiping is off there, so the page can be read).

const SWIPE = 50; // px of horizontal travel that counts as a swipe

export function createLightbox() {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.tabIndex = -1; // takes focus on open, so no button starts with a focus ring
  dialog.innerHTML = `
    <div class="lightbox-stage"></div>
    <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous">←</button>
    <button type="button" class="lightbox-nav lightbox-next" aria-label="Next">→</button>
    <span class="lightbox-count" aria-live="polite"></span>`;
  document.body.append(dialog);

  const stage = dialog.querySelector('.lightbox-stage');
  const count = dialog.querySelector('.lightbox-count');
  let items = [];
  let index = 0;

  function show(i, direction = 0) {
    index = (i + items.length) % items.length;
    const item = items[index];
    const media = item.video ? document.createElement('video') : document.createElement('img');
    media.src = item.src;
    if (item.video) {
      Object.assign(media, { autoplay: true, muted: true, loop: true, playsInline: true, controls: true });
      media.setAttribute('aria-label', item.alt || 'Video');
    } else {
      media.alt = item.alt || '';
    }
    markLoading(stage, media);
    stage.replaceChildren(media);
    stage.style.setProperty('--enter', direction);
    stage.classList.remove('is-entering');
    void stage.offsetWidth; // restart the slide-in
    if (direction) stage.classList.add('is-entering');
    dialog.classList.toggle('is-long', Boolean(item.long));
    dialog.classList.toggle('is-single', items.length < 2);
    count.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : '';
    dialog.scrollTop = 0;
  }

  const step = direction => { if (items.length > 1) show(index + direction, direction); };
  dialog.querySelector('.lightbox-prev').addEventListener('click', event => { event.stopPropagation(); step(-1); });
  dialog.querySelector('.lightbox-next').addEventListener('click', event => { event.stopPropagation(); step(1); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
  dialog.addEventListener('close', () => stage.replaceChildren());

  // Swipe: the stage follows the pointer horizontally; release past the threshold to
  // move, otherwise it springs back. A press that barely moves is a click (closes).
  let start = null;
  let moved = false;
  dialog.addEventListener('pointerdown', event => {
    if (event.target.closest('.lightbox-nav') || dialog.classList.contains('is-long')) return;
    start = { x: event.clientX, y: event.clientY };
    moved = false;
  });
  dialog.addEventListener('pointermove', event => {
    if (!start || items.length < 2) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
      moved = true;
      stage.classList.add('is-dragging');
      stage.style.translate = `${dx}px 0`;
    }
  });
  function endDrag(event) {
    if (!start) return;
    const dx = event.clientX - start.x;
    start = null;
    stage.classList.remove('is-dragging');
    stage.style.translate = '';
    if (moved && Math.abs(dx) > SWIPE) step(dx < 0 ? 1 : -1);
  }
  dialog.addEventListener('pointerup', endDrag);
  dialog.addEventListener('pointercancel', endDrag);
  dialog.addEventListener('click', event => {
    if (moved) { moved = false; return; }
    if (event.target.closest('.lightbox-nav, video')) return;
    if (dialog.classList.contains('is-long') && event.target !== dialog) return;
    dialog.close();
  });

  return {
    open(group, i = 0) {
      items = group;
      show(i);
      dialog.showModal();
      dialog.focus();
    },
  };
}

// Shows the rainbow loading sweep on `host` until `media` has something to show.
export function markLoading(host, media) {
  const done = () => host.classList.remove('is-media-loading');
  if (media.tagName === 'VIDEO') {
    if (media.readyState >= 2) return done();
    host.classList.add('is-media-loading');
    media.addEventListener('loadeddata', done, { once: true });
  } else {
    if (media.complete && media.naturalWidth) return done();
    host.classList.add('is-media-loading');
    media.addEventListener('load', done, { once: true });
  }
  media.addEventListener('error', done, { once: true });
}

// Makes every img[data-zoom] under `root` open in one shared lightbox. Images are
// grouped with their neighbours (same photo grid or section) so the viewer can
// swipe through them. data-zoom may name a larger file to show instead;
// data-zoom-long marks a tall image that opens at full width and scrolls.
export function setupZoom(root = document) {
  const lightbox = createLightbox();
  const images = [...root.querySelectorAll('img[data-zoom]')];
  const groupOf = img => img.closest('[data-zoom-group], .photo-grid, .specimens, section, .block') || root;
  images.forEach(img => {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Enlarge: ${img.alt}`);
    markLoading(img, img);
    const open = () => {
      const group = images.filter(other => groupOf(other) === groupOf(img));
      lightbox.open(group.map(other => ({
        src: other.dataset.zoom || other.currentSrc || other.src,
        alt: other.alt,
        long: other.hasAttribute('data-zoom-long'),
      })), group.indexOf(img));
    };
    img.addEventListener('click', open);
    img.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      open();
    });
  });
  return lightbox;
}
