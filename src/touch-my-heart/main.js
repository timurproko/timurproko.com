import { renderGallery } from '../case/gallery.js';
import { setupFooterYear } from '../case/footer-year.js';

// Media lives in public/touch-my-heart/assets (shared with the sections below), so the
// gallery gets it listed here instead of via import.meta.glob. Keys set the order.
const A = '/touch-my-heart/assets/';
renderGallery({
  '01.mp4': `${A}heart-hero.mp4`,
  '02.mp4': `${A}render.mp4`,
  '03.webp': `${A}mixed-reality-heart.webp`,
  '04.webp': `${A}heart-slicing-hands.webp`,
  '05.mp4': `${A}wireframe.mp4`,
  '06.mp4': `${A}condition_normal.mp4`,
  '07.mp4': `${A}condition_as.mp4`,
  '08.mp4': `${A}condition_af.mp4`,
  '09.png': `${A}research.png`,
  '10.png': `${A}prototype.png`,
}, document.getElementById('gallery'), { pair: false });
setupFooterYear();

// Heart states: each condition clip rests on its first frame and plays only
// while hovered (or focused). Touch screens have no hover, so a tap toggles it
// and pauses the others.
const stateFrames = [...document.querySelectorAll('.states .frame')];
const stateVideo = frame => frame.querySelector('video');
const playState = frame => {
  stateVideo(frame).play().catch(() => {});
  frame.classList.add('is-playing');
};
const pauseState = frame => {
  stateVideo(frame).pause();
  frame.classList.remove('is-playing');
};
stateFrames.forEach(frame => {
  frame.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') playState(frame); });
  frame.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') pauseState(frame); });
  // Keyboard focus only — a tap also focuses the frame and is handled by pointerup below.
  frame.addEventListener('focus', () => { if (frame.matches(':focus-visible')) playState(frame); });
  frame.addEventListener('blur', () => pauseState(frame));
  frame.addEventListener('pointerup', event => {
    if (event.pointerType === 'mouse') return;
    const playing = frame.classList.contains('is-playing');
    stateFrames.forEach(pauseState);
    if (!playing) playState(frame);
  });
});
