import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupNextPreview } from '../case/next-preview.js';
import { setupZoom } from '../case/lightbox.js';

// Home page preview cover uses the title slide's empty sky as its backdrop.
setupCover('/calmxr/assets/sky.webp');
setupFooterYear();
setupNextPreview();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Session flow: the step crossing the middle of the viewport becomes active, and the
// sticky lens swaps to its screen.
const steps = [...document.querySelectorAll('.flow-step')];
const screens = [...document.querySelectorAll('.flow-screen img')];
const progress = document.querySelector('.flow-progress');
let activeStep = 0;
function updateFlow() {
  const line = window.innerHeight * 0.5;
  let current = 0;
  steps.forEach((step, i) => { if (step.getBoundingClientRect().top < line) current = i; });
  if (current === activeStep) return;
  activeStep = current;
  steps.forEach((step, i) => step.classList.toggle('is-active', i === current));
  screens.forEach((screen, i) => screen.classList.toggle('is-active', i === current));
  progress?.style.setProperty('--progress', (current + 1) / steps.length);
}
// The pinned screen opens the lightbox on the step in view, via that step's own
// (mobile) screenshot, so the viewer can swipe through the whole flow.
const flowScreen = document.querySelector('.flow-screen');
const openFlow = () => steps[activeStep]?.querySelector('.flow-shot')?.click();
flowScreen?.addEventListener('click', openFlow);
flowScreen?.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  openFlow();
});
window.addEventListener('scroll', updateFlow, { passive: true });
window.addEventListener('resize', updateFlow);
updateFlow();

// Session recordings: the tabbed pair loads lazily (preload="none") and only the selected
// recording plays, muted, while the frame is on screen. The concept film keeps its
// controls and waits to be played.
const sessions = document.querySelector('.clip-sessions .switcher');
if (sessions) {
  const radios = [...sessions.querySelectorAll('input')];
  const panels = [...sessions.querySelectorAll('.session-panel')];
  let onScreen = false;
  const sync = () => panels.forEach((panel, i) => {
    const active = onScreen && radios[i].checked && !reducedMotion;
    panel.querySelectorAll('video').forEach(clip => (active ? clip.play().catch(() => {}) : clip.pause()));
  });
  // The blurred backdrop follows the square recording it frames.
  panels.forEach(panel => {
    const [bg, fg] = panel.querySelectorAll('video');
    fg.addEventListener('timeupdate', () => {
      if (Math.abs(bg.currentTime - fg.currentTime) > 0.3) bg.currentTime = fg.currentTime;
    });
  });
  radios.forEach(radio => radio.addEventListener('change', sync));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }, { threshold: 0.5 }).observe(sessions);
  }
}

// Concept film: the centred play button starts it and hands over to the native controls.
document.querySelector('.film-play')?.addEventListener('click', event => {
  const video = event.currentTarget.parentElement.querySelector('video');
  video.controls = true;
  video.play().catch(() => {});
  event.currentTarget.remove();
});

// Zoomable images open full screen; the flow screenshots swipe as one group (case/lightbox.js).
setupZoom();
