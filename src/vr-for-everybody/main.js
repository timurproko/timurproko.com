import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupNextPreview } from '../case/next-preview.js';
import { setupStatReveal } from '../case/stat-reveal.js';
import { setupZoom } from '../case/lightbox.js';
import { setupChapterNav } from '../case/chapter-nav.js';

// Home page preview cover uses the deck's title artwork as its backdrop.
setupCover('/vr-for-everybody/assets/hero.webp');
setupFooterYear();
setupNextPreview();
setupStatReveal();

// Deck clips load lazily (preload="none") and play muted only while on screen.
const videos = [...document.querySelectorAll('.feature video')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.5 });
  videos.forEach(video => observer.observe(video));
}

// Zoomable images ([data-zoom]) open full screen and swipe through their photo grid
// (case/lightbox.js). The infographic's hint opens it too.
setupZoom();
document.querySelector('.zoom-hint')?.addEventListener('click', event => {
  event.currentTarget.parentElement.querySelector('img[data-zoom]').click();
});

// Chapter artwork: fades up the first time its chapter scrolls into view, then
// floats gently — only while on screen. Skipped entirely for reduced motion.
if (!reducedMotion && 'IntersectionObserver' in window) {
  const artObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.classList.add('is-visible');
      target.classList.toggle('is-onscreen', isIntersecting);
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('.lens.chapter').forEach(chapter => artObserver.observe(chapter));
  // The hero bust floats the same way; its loop rests while scrolled away.
  const heroArt = document.querySelector('.hero-art');
  if (heroArt) {
    new IntersectionObserver(([entry]) => heroArt.classList.toggle('is-offscreen', !entry.isIntersecting)).observe(heroArt);
  }
} else if (!reducedMotion) {
  // No IntersectionObserver: show the art straight away (case-page.css hides it until then)
  document.querySelectorAll('.lens.chapter').forEach(chapter => chapter.classList.add('is-visible'));
}

// Pinned chapter nav: appears once the index cards scroll away (shared case/chapter-nav.js)
setupChapterNav(document.getElementById('chapter-nav'), document.querySelector('.chapter-index'));
