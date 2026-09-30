import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupStatReveal } from '../case/stat-reveal.js';
import { setupZoom } from '../case/lightbox.js';

// Home page preview cover uses the deck's title artwork as its backdrop.
setupCover('/vr-for-everybody/assets/hero.webp');
setupFooterYear();
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
  document.querySelectorAll('.lens.chapter').forEach(chapter => {
    chapter.classList.add('is-armed');
    artObserver.observe(chapter);
  });
}

// Pinned chapter nav: appears once the index cards scroll away, hides again at
// the "next project" footer, and marks the chapter currently being read.
const chapterNav = document.getElementById('chapter-nav');
const navLinks = [...chapterNav.querySelectorAll('a')];
const chapters = navLinks.map(link => document.querySelector(link.hash));
const index = document.querySelector('.chapter-index');
const next = document.querySelector('.next');
let indexAbove = false;
let nextVisible = false;
const updateNav = () => chapterNav.classList.toggle('is-visible', indexAbove && !nextVisible);
new IntersectionObserver(([entry]) => {
  indexAbove = !entry.isIntersecting && entry.boundingClientRect.top < 0;
  updateNav();
}).observe(index);
new IntersectionObserver(([entry]) => {
  nextVisible = entry.isIntersecting;
  updateNav();
}).observe(next);

// A chapter stays current from its header until the next chapter's header.
let shown;
function markCurrent() {
  const line = window.innerHeight * 0.4;
  let current = -1;
  chapters.forEach((chapter, i) => {
    if (chapter.getBoundingClientRect().top < line) current = i;
  });
  if (current === shown) return;
  shown = current;
  navLinks.forEach((link, i) => {
    if (i === current) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
  // On narrow screens the pill scrolls sideways — keep the current chapter centred in it.
  const link = navLinks[current];
  if (link && chapterNav.scrollWidth > chapterNav.clientWidth) {
    chapterNav.scrollTo({ left: link.offsetLeft - (chapterNav.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
  }
}
window.addEventListener('scroll', markCurrent, { passive: true });
markCurrent();
