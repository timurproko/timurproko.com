// "Next project" thumbnail: the same preview the home page cards show.
// Touch / small screens get the project's static cover poster (light or dark, following
// the theme). Desktop layers the live cover page on top of it, in a scaled iframe
// (`/<slug>/?preview=cover`, as on the home page), loaded once the block comes near the
// viewport. Its title sweep and motion run only while the block is hovered or focused.
const VIEWPORT = { width: 1920, height: 1080 };

function posterUrl(slug, theme = document.documentElement.getAttribute('data-theme')) {
  return `/assets/previews/${slug}${theme === 'dark' ? '-dark' : ''}.jpg`;
}

// Freeze/thaw all motion inside the same-origin preview: CSS animations via
// animation-play-state, canvas loops by holding requestAnimationFrame callbacks.
// Same approach as the home page cards.
function motionControl(iframe) {
  let win;
  let doc;
  try {
    win = iframe.contentWindow;
    doc = win?.document;
  } catch {
    return null;
  }
  if (!win || !doc?.head) return null;
  const style = doc.createElement('style');
  style.textContent = 'html.preview-motion-paused, html.preview-motion-paused *, html.preview-motion-paused *::before, html.preview-motion-paused *::after { animation-play-state: paused !important; }';
  doc.head.append(style);
  const rawRAF = win.requestAnimationFrame.bind(win);
  let paused = false;
  let queued = [];
  win.requestAnimationFrame = callback => {
    if (!paused) return rawRAF(callback);
    queued.push(callback);
    return 0;
  };
  return {
    pause() {
      if (paused) return;
      paused = true;
      doc.documentElement.classList.add('preview-motion-paused');
    },
    resume() {
      doc.documentElement.classList.remove('preview-motion-paused');
      if (!paused) return;
      paused = false;
      const pending = queued;
      queued = [];
      pending.forEach(callback => rawRAF(callback));
    },
  };
}

export function setupNextPreview() {
  const link = document.querySelector('a.next');
  const thumb = link?.querySelector('.thumb');
  if (!thumb || document.documentElement.classList.contains('preview-cover')) return;
  const slug = new URL(link.href, location.href).pathname.split('/').filter(Boolean)[0];
  if (!slug) return;

  // Poster: always present, so there is something to see before (or without) the live cover.
  let poster = thumb.querySelector('img');
  if (!poster) {
    poster = document.createElement('img');
    poster.alt = '';
    poster.loading = 'lazy';
    thumb.append(poster);
  }
  const showPoster = () => { poster.style.display = ''; poster.src = posterUrl(slug); };
  // No dark poster yet: fall back to the light one.
  poster.addEventListener('error', () => {
    if (poster.src.includes('-dark.jpg')) poster.src = posterUrl(slug, 'light');
    else poster.style.display = 'none';
  });
  showPoster();
  new MutationObserver(showPoster).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const staticOnly = matchMedia('(hover: none), (pointer: coarse), (max-width: 760px)').matches;
  if (staticOnly || !('IntersectionObserver' in window)) return;

  let iframe = null;
  let motion = null;
  let pauseTimer = 0;
  const post = type => { try { iframe?.contentWindow?.postMessage({ type }, '*'); } catch {} };
  const fit = () => { if (iframe) iframe.style.transform = `scale(${thumb.clientWidth / VIEWPORT.width})`; };

  function load() {
    iframe = document.createElement('iframe');
    iframe.title = `Preview of ${link.querySelector('.name')?.textContent?.trim() || slug}`;
    iframe.tabIndex = -1;
    iframe.setAttribute('aria-hidden', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.src = `/${slug}/?preview=cover`;
    iframe.addEventListener('load', () => {
      thumb.classList.add('is-live');
      motion = motionControl(iframe);
      // Let the cover finish its first reveal, then hold still until hovered.
      setTimeout(() => { if (!link.matches(':hover')) motion?.pause(); }, 1600);
    }, { once: true });
    thumb.append(iframe);
    fit();
    new ResizeObserver(fit).observe(thumb);
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    load();
  }, { rootMargin: '400px 0px' });
  observer.observe(thumb);

  const start = () => {
    clearTimeout(pauseTimer);
    motion?.resume();
    post('preview-cover:start');
  };
  // Give the cover a moment to drop its motion class before freezing it, as on the home page.
  const stop = () => {
    clearTimeout(pauseTimer);
    post('preview-cover:stop');
    pauseTimer = setTimeout(() => motion?.pause(), 700);
  };
  link.addEventListener('pointerenter', start);
  link.addEventListener('pointerleave', stop);
  link.addEventListener('focus', start);
  link.addEventListener('blur', stop);
}
