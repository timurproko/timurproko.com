import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { mountAscii } from './ascii.js';
import { setupStage } from './stage.js';

if (document.documentElement.classList.contains('preview-cover')) {
  // Home page preview cover: a turning ASCII sphere that only moves while the card is hovered.
  const sphere = mountAscii(document.querySelector('.cover .ascii-field'), { autoplay: false });
  setupCover(null, { onStart: sphere.play, onStop: sphere.pause });
} else {
  setupStage(document.querySelector('.a1-stage'));
  mountAscii(document.querySelector('.a1-stage .ascii-field'));
}
setupFooterYear();
