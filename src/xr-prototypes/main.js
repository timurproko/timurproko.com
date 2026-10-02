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
const launchButton = document.getElementById('webgl-launch');
// Phones and tablets (iPadOS reports itself as a Mac) usually can't hold the
// build in memory, so they get a warning first and must choose to try anyway.
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
let warned = false;
function launchHeart() {
  if (stage.querySelector('iframe')) return true;
  if (isMobile && !warned) {
    warned = true;
    launchButton.querySelector('.webgl-title').textContent = 'Try anyway';
    launchButton.querySelector('.webgl-note').textContent = 'Built for desktop — may not start on a phone';
    return false;
  }
  const iframe = document.createElement('iframe');
  iframe.src = HEART_URL;
  iframe.title = 'Heart Viewer — interactive WebGL prototype';
  iframe.allow = 'fullscreen';
  stage.replaceChildren(iframe);
  iframe.focus();
  return true;
}
launchButton?.addEventListener('click', launchHeart);

// Full screen takes the whole frame — stage plus this button, which becomes the
// exit control — launching the build if needed. Where the Fullscreen API is
// missing or refused (iPhone Safari), the frame instead covers the window with
// CSS, so the exit button stays in reach.
const frame = document.getElementById('webgl-frame');
const fullscreenButton = document.getElementById('webgl-fullscreen');
function setWindowFill(on) {
  frame.classList.toggle('is-window-fill', on);
  document.documentElement.classList.toggle('webgl-window-fill', on);
  syncFullscreen();
}
fullscreenButton?.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen().then(syncFullscreen, syncFullscreen);
    return;
  }
  if (frame.classList.contains('is-window-fill')) {
    setWindowFill(false);
    return;
  }
  if (!launchHeart()) return;
  if (!frame.requestFullscreen) {
    setWindowFill(true);
    return;
  }
  frame.requestFullscreen().catch(() => setWindowFill(true));
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && frame.classList.contains('is-window-fill')) setWindowFill(false);
});
function syncFullscreen() {
  const active = document.fullscreenElement === frame || frame.classList.contains('is-window-fill');
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
// The index counts as scrolled away once it is up under the header and the pill
// (the top 110px, give or take a subpixel). Checked on scroll rather than
// observed: jumping to the first prototype lands the index right on that line.
function checkIndex() {
  const above = index.getBoundingClientRect().bottom <= 112;
  if (above === indexAbove) return;
  indexAbove = above;
  updateNav();
}
window.addEventListener('scroll', checkIndex, { passive: true });
checkIndex();
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
    // On narrow screens the pill scrolls sideways — keep the current prototype centred in it.
    const link = navLinks[sections.indexOf(target)];
    if (protoNav.scrollWidth > protoNav.clientWidth) {
      protoNav.scrollTo({ left: link.offsetLeft - (protoNav.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(section => sectionObserver.observe(section));
