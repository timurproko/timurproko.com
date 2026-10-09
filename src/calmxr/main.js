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

// All three recordings share one player and autoplay silently while it is on screen.
// Browsers block autoplay with audio, so the sound button enables it after a user gesture.
const sessions = document.querySelector('.clip-sessions .switcher');
if (sessions) {
  const radios = [...sessions.querySelectorAll('input[type="radio"]')];
  const panels = [...sessions.querySelectorAll('.session-panel')];
  const playButton = sessions.querySelector('.session-play');
  const soundButton = sessions.querySelector('.session-sound');
  const progress = sessions.querySelector('.session-progress');
  let onScreen = false;
  let playing = !reducedMotion;
  let soundEnabled = false;
  let scrubbing = false;

  const selectedPanel = () => panels[radios.findIndex(radio => radio.checked)];
  const panelMedia = panel => ({
    bg: panel.querySelector('.session-bg'),
    fg: panel.querySelector('.session-fg'),
  });
  const updatePlayButton = () => {
    playButton?.classList.toggle('is-playing', playing);
    playButton?.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
  };
  const updateProgress = video => {
    if (!progress || scrubbing || !Number.isFinite(video.duration) || !video.duration) return;
    const value = Math.round((video.currentTime / video.duration) * Number(progress.max));
    progress.value = String(value);
    progress.style.setProperty('--session-progress', `${value / 10}%`);
  };
  const sync = () => panels.forEach((panel, i) => {
    const active = onScreen && radios[i].checked && playing;
    const { bg, fg } = panelMedia(panel);
    if (bg) bg.muted = true;
    fg.muted = !soundEnabled || !radios[i].checked;
    [bg, fg].filter(Boolean).forEach(clip => (active ? clip.play().catch(() => {}) : clip.pause()));
  });

  // The blurred backdrop follows the square recording it frames.
  panels.forEach((panel, i) => {
    const { bg, fg } = panelMedia(panel);
    fg.addEventListener('timeupdate', () => {
      if (bg && Math.abs(bg.currentTime - fg.currentTime) > 0.3) bg.currentTime = fg.currentTime;
      if (radios[i].checked) updateProgress(fg);
    });
    fg.addEventListener('loadedmetadata', () => {
      if (radios[i].checked) updateProgress(fg);
    });
    fg.addEventListener('ended', () => {
      if (!fg.loop && radios[i].checked) {
        playing = false;
        updatePlayButton();
      }
    });
  });
  playButton?.addEventListener('click', () => {
    playing = !playing;
    updatePlayButton();
    sync();
  });
  soundButton?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundButton.classList.toggle('is-on', soundEnabled);
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', soundEnabled ? 'Turn video audio off' : 'Turn video audio on');
    sync();
  });
  progress?.addEventListener('input', () => {
    scrubbing = true;
    const panel = selectedPanel();
    if (!panel) return;
    const { bg, fg } = panelMedia(panel);
    if (!Number.isFinite(fg.duration)) return;
    const time = (Number(progress.value) / Number(progress.max)) * fg.duration;
    [bg, fg].filter(Boolean).forEach(video => { video.currentTime = time; });
    progress.style.setProperty('--session-progress', `${Number(progress.value) / 10}%`);
  });
  progress?.addEventListener('change', () => { scrubbing = false; });
  radios.forEach(radio => radio.addEventListener('change', () => {
    const fg = selectedPanel()?.querySelector('.session-fg');
    if (fg) updateProgress(fg);
    sync();
  }));
  updatePlayButton();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; sync(); }, { threshold: 0.5 }).observe(sessions);
  } else {
    onScreen = true;
    sync();
  }
}

// Zoomable images open full screen; the flow screenshots swipe as one group (case/lightbox.js).
setupZoom();
