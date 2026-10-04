import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupNextPreview } from '../case/next-preview.js';
import { setupChapterNav } from '../case/chapter-nav.js';

// Home page preview cover uses the first prototype's frame as its backdrop.
setupCover('/xr-prototypes/assets/physics-playground.webp');
setupFooterYear();
setupNextPreview();

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
// build in memory, so they get a recording of it instead, played like the
// other prototype captures.
const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
if (isMobile && stage) {
  const video = document.createElement('video');
  Object.assign(video, { src: '/xr-prototypes/assets/heart-viewer.mp4', poster: '/xr-prototypes/assets/heart-viewer.webp', muted: true, loop: true, playsInline: true, controls: true, preload: 'none' });
  video.setAttribute('aria-label', 'Heart Viewer prototype: turning, slicing and X-raying the heart');
  stage.replaceChildren(video);
  document.getElementById('webgl-frame').classList.add('is-video');
  if (!reducedMotion && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? video.play().catch(() => {}) : video.pause()), { threshold: 0.5 }).observe(video);
  }
}
function launchHeart() {
  if (isMobile) return false;
  if (stage.querySelector('iframe')) return true;
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
// exit control. It does not launch the build: before it is played, full screen
// shows the same poster and play button, just larger. Where the Fullscreen API is
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

// Pinned prototype nav (shared case/chapter-nav.js): appears once the index cards
// scroll away, hides again at the "next project" footer, and marks the prototype in view.
setupChapterNav(document.getElementById('chapter-nav'), document.querySelector('.proto-index'));
