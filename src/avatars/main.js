import { renderGallery } from '../case/gallery.js';
import { setupCompare } from '../case/compare.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupNextPreview } from '../case/next-preview.js';

// Media lives in public/avatars/assets (shared with the sections below), so the
// gallery gets it listed here instead of via import.meta.glob. Keys set the order.
const A = '/avatars/assets/';
renderGallery({
  '01.png': `${A}render.png`,
  '02.webm': `${A}jade.webm`,
  '03.webp': `${A}jade-fintech-festival.webp`,
  '04.webp': `${A}jade-realtime-screen.webp`,
  '05.mp4': `${A}avatar1.mp4`,
  '06.png': `${A}image-to-3d.png`,
  '07.webp': `${A}wrap-landmarks.webp`,
  '08.webp': `${A}character-creator.webp`,
}, document.getElementById('gallery'), { pair: false });
setupCompare();
setupFooterYear();
setupNextPreview();
