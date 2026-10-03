import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { mountAscii } from './ascii.js';
import { setupFeatures } from './features.js';
import { setupRoadmap } from './roadmap.js';
import { setupStage } from './stage.js';

if (document.documentElement.classList.contains('preview-cover')) {
  // Home page preview cover: a turning ASCII sphere that only moves while the card is hovered.
  const sphere = mountAscii(document.querySelector('.cover .ascii-field'), { autoplay: false });
  setupCover(null, { onStart: sphere.play, onStop: sphere.pause });
} else {
  setupStage(document.querySelector('.a1-stage'));
  setupFeatures(document.querySelector('.a1-features'));
  setupRoadmap(document.querySelector('.a1-roadmap'));
  mountAscii(document.querySelector('.a1-stage .ascii-field'));
}
setupFooterYear();
