import { renderGallery } from '../case/gallery.js';
import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';

// Drop numbered files into src/starkit/images/ — they appear here in filename order.
const images = import.meta.glob('./images/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});

renderGallery(images, document.getElementById('gallery'));

// Recordings live in src/starkit/videos/ and fill their own grid at the bottom of the page.
const videos = import.meta.glob('./videos/*.{mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});
renderGallery(videos, document.getElementById('videos'), { columns: 3 });
// Home page preview cover uses this gallery image as its backdrop.
setupCover(images['./images/06.webp'] ?? Object.values(images)[0]);
setupFooterYear();
