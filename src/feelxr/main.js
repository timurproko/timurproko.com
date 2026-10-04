import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupNextPreview } from '../case/next-preview.js';
import { setupZoom } from '../case/lightbox.js';
import { setupOrb } from './orb.js';

// Home page preview cover: hands on the Blush orb.
setupCover('/feelxr/assets/cover.webp');
setupFooterYear();
setupNextPreview();

// The live orb is skipped on the cover-only preview, which shows just the image.
const orbFigure = document.querySelector('.orb-hero');
const orb = orbFigure && !document.documentElement.classList.contains('preview-cover') ? setupOrb(orbFigure) : null;

// Session flow: the step crossing the middle of the viewport becomes active, and the
// sticky screen swaps to its screenshot.
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
progress?.style.setProperty('--progress', 1 / steps.length);
window.addEventListener('scroll', updateFlow, { passive: true });
window.addEventListener('resize', updateFlow);
updateFlow();

// Pilot film: the centred play button starts it and hands over to the native controls.
// It carries the same score, so the hero's music stops while the film plays.
const film = document.querySelector('.clip-film video');
document.querySelector('.film-play')?.addEventListener('click', event => {
  film.controls = true;
  film.play().catch(() => {});
  event.currentTarget.remove();
});
film?.addEventListener('play', () => orb?.pause());
document.querySelector('.orb-audio')?.addEventListener('play', () => film?.pause());

// Zoomable images open full screen; the flow screenshots swipe as one group (case/lightbox.js).
setupZoom();

// Data cards: hidden by case-page.css until scrolled into view, then they rise in one
// after another and their numbers count up from 0 (the rest of the text, e.g. "×" or
// "–5", stays as a suffix).
const metrics = document.querySelector('.metrics');
if (metrics && !('IntersectionObserver' in window)) metrics.classList.add('is-visible');
if (metrics && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const cards = [...metrics.querySelectorAll('li')];
  cards.forEach((card, i) => card.style.setProperty('--delay', `${i * 110}ms`));
  const countUp = (el, delay) => {
    const [, target, suffix = ''] = el.textContent.match(/^(\d+)(.*)$/) || [];
    if (!Number(target)) return;
    el.textContent = `0${suffix}`;
    setTimeout(() => {
      const start = performance.now();
      const tick = now => {
        const progress = Math.min((now - start) / 900, 1);
        el.textContent = `${Math.round((1 - Math.pow(1 - progress, 3)) * Number(target))}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
  };
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    metrics.classList.add('is-visible');
    cards.forEach((card, i) => countUp(card.querySelector('.metric-value'), 200 + i * 110));
  }, { threshold: 0.35 });
  observer.observe(metrics);
}
