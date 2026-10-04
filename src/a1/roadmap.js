// Roadmap timeline, adapted from agentnumberone.dev/script.js. On wide screens
// it is a horizontal strip: arrows page through it, a mouse can drag it, and it
// opens on the current version.
export function setupRoadmap(roadmap) {
  if (!roadmap) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controls = roadmap.parentElement.querySelector('.a1-roadmap-controls');
  const arrows = [...controls.querySelectorAll('[data-roadmap-step]')];

  const syncArrows = () => {
    const max = roadmap.scrollWidth - roadmap.clientWidth - 1;
    arrows[0].disabled = roadmap.scrollLeft <= 1;
    arrows[1].disabled = roadmap.scrollLeft >= max;
    roadmap.classList.toggle('fade-start', !arrows[0].disabled);
    roadmap.classList.toggle('fade-end', !arrows[1].disabled);
  };

  controls.hidden = false;
  arrows.forEach(arrow => arrow.addEventListener('click', () => {
    const step = roadmap.querySelector('.a1-roadmap-item').offsetWidth * 2;
    roadmap.scrollBy({ left: step * Number(arrow.dataset.roadmapStep), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  }));
  roadmap.addEventListener('scroll', syncArrows, { passive: true });
  window.addEventListener('resize', syncArrows);

  // Mouse drag scrolls the strip. Touch and trackpads already scroll natively.
  let drag = null;
  roadmap.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || roadmap.scrollWidth <= roadmap.clientWidth) return;
    drag = { x: event.clientX, left: roadmap.scrollLeft };
    roadmap.setPointerCapture(event.pointerId);
    roadmap.classList.add('is-dragging');
  });
  roadmap.addEventListener('pointermove', event => {
    if (drag) roadmap.scrollLeft = drag.left - (event.clientX - drag.x);
  });
  const endDrag = () => {
    if (!drag) return;
    drag = null;
    roadmap.classList.remove('is-dragging');
  };
  roadmap.addEventListener('pointerup', endDrag);
  roadmap.addEventListener('pointercancel', endDrag);

  // Open on the current version, with the one before it still in view
  const current = roadmap.querySelector('.is-current');
  if (current) {
    roadmap.style.scrollBehavior = 'auto';
    roadmap.scrollLeft = Math.max(0, current.offsetLeft - current.offsetWidth);
    roadmap.style.scrollBehavior = '';
  }
  syncArrows();

  // Versions rise in one after another the first time the roadmap scrolls into view
  // (stage.css hides them until then; without IntersectionObserver they show at once)
  if (!('IntersectionObserver' in window)) roadmap.classList.add('is-revealed');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    roadmap.querySelectorAll('.a1-roadmap-item').forEach((item, index) => item.style.setProperty('--i', index));
    roadmap.classList.add('is-animated');
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      roadmap.classList.add('is-revealed');
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(roadmap);
  }
}
