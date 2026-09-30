import { renderGallery } from '../case/gallery.js';
import { setupFooterYear } from '../case/footer-year.js';

// Media lives in public/touch-my-heart/assets (shared with the sections below), so the
// gallery gets it listed here instead of via import.meta.glob. Keys set the order.
const A = '/touch-my-heart/assets/';
renderGallery({
  '01.mp4': `${A}render.mp4`,
  '02.webp': `${A}mixed-reality-heart.webp`,
  '03.webp': `${A}heart-slicing-hands.webp`,
  '04.mp4': `${A}wireframe.mp4`,
  '05.mp4': `${A}condition_normal.mp4`,
  '06.mp4': `${A}condition_as.mp4`,
  '07.mp4': `${A}condition_af.mp4`,
  '08.png': `${A}research.png`,
  '09.png': `${A}prototype.png`,
}, document.getElementById('gallery'), { pair: false });
setupFooterYear();
