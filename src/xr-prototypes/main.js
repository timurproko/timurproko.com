import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';

// Home page preview cover uses the first prototype's frame as its backdrop.
setupCover('/xr-prototypes/assets/physics-playground.webp');
setupFooterYear();

// Prototype captures are long and heavy, so they load lazily (preload="none")
// and play muted only while on screen. Controls let a viewer unmute or scrub.
const videos = [...document.querySelectorAll('.proto video')];
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

// WebGL heart: the ~100 MB Unity build only loads once the viewer asks for it.
const HEART_URL = '/xr-prototypes/heart/index.html';
const stage = document.getElementById('webgl-stage');
function launchHeart() {
  if (stage.querySelector('iframe')) return;
  const iframe = document.createElement('iframe');
  iframe.src = HEART_URL;
  iframe.title = 'Heart Viewer — interactive WebGL prototype';
  iframe.allow = 'fullscreen';
  stage.replaceChildren(iframe);
  iframe.focus();
}
document.getElementById('webgl-launch')?.addEventListener('click', launchHeart);

// Full screen takes the whole frame — stage plus this button, which becomes the
// exit control — launching the build if needed. Where the Fullscreen API is
// missing (iPhone Safari) the build opens in its own tab instead.
const frame = document.getElementById('webgl-frame');
const fullscreenButton = document.getElementById('webgl-fullscreen');
fullscreenButton?.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen().then(syncFullscreen, syncFullscreen);
    return;
  }
  if (!frame.requestFullscreen) {
    window.open(HEART_URL, '_blank', 'noopener');
    return;
  }
  launchHeart();
  frame.requestFullscreen().catch(() => window.open(HEART_URL, '_blank', 'noopener'));
});
function syncFullscreen() {
  const active = document.fullscreenElement === frame;
  frame.classList.toggle('is-fullscreen', active);
  fullscreenButton.setAttribute('aria-label', active ? 'Exit full screen' : 'Open full screen');
  fullscreenButton.title = active ? 'Exit full screen' : 'Full screen';
  // Keep focus in the build on enter and exit: Unity pauses rendering while its
  // frame is unfocused, which would leave the just-resized canvas blank.
  stage.querySelector('iframe')?.focus({ preventScroll: true });
}
document.addEventListener('fullscreenchange', syncFullscreen);

// Pinned prototype nav: appears once the index cards scroll away, hides again at
// the "next project" footer, and marks the prototype currently in the middle of the screen.
const protoNav = document.getElementById('proto-nav');
const navLinks = [...protoNav.querySelectorAll('a')];
const sections = navLinks.map(link => document.querySelector(link.hash));
const index = document.querySelector('.proto-index');
const next = document.querySelector('.next');
let indexAbove = false;
let nextVisible = false;
const updateNav = () => protoNav.classList.toggle('is-visible', indexAbove && !nextVisible);
new IntersectionObserver(([entry]) => {
  indexAbove = !entry.isIntersecting && entry.boundingClientRect.top < 0;
  updateNav();
}).observe(index);
new IntersectionObserver(([entry]) => {
  nextVisible = entry.isIntersecting;
  updateNav();
}).observe(next);
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => {
    if (!isIntersecting) return;
    navLinks.forEach((link, i) => {
      if (sections[i] === target) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(section => sectionObserver.observe(section));
