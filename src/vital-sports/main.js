import { renderGallery } from '../case/gallery.js';
import { markLoading } from '../case/lightbox.js';
import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupNextPreview } from '../case/next-preview.js';
import { setupBiofeedback } from './biofeedback.js';
import { createCoverPulse } from './cover-pulse.js';

// Drop numbered files into src/vital-sports/images/ — they appear here in filename order.
const images = import.meta.glob('./images/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});

renderGallery(images, document.getElementById('gallery'), { columns: 4 });
// Home page preview cover: a live heartbeat trace instead of an image.
const pulse = createCoverPulse(document.querySelector('.cover'));
setupCover(null, { onStart: pulse.start, onStop: pulse.stop });
setupFooterYear();
setupNextPreview();

// Hero: the same heartbeat trace, low across the photo, running while it's on screen.
const hero = document.querySelector('.hero');
markLoading(hero, hero.querySelector('.hero-photo'));
const heroPulse = createCoverPulse(hero, { baseline: 0.88, amplitude: 0.2 });
new IntersectionObserver(([entry]) => (entry.isIntersecting ? heroPulse.start() : heroPulse.stop()))
  .observe(hero);
setupBiofeedback(document.querySelector('[data-vital]'));

// Session recording: load the video only when asked to.
document.querySelector('.promo-play')?.addEventListener('click', event => {
  const button = event.currentTarget;
  const video = document.createElement('video');
  Object.assign(video, { src: button.dataset.src, controls: true, autoplay: true, playsInline: true });
  video.setAttribute('aria-label', 'VITAL Sports session recording');
  button.replaceWith(video);
});
