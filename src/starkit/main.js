import { renderGallery } from '../case/gallery.js';
import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupNextPreview } from '../case/next-preview.js';

// Drop numbered files into src/starkit/images/ — they appear here in filename order.
const images = import.meta.glob('./images/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});

// Keep 06 as the home-page cover backdrop, but do not show it in the case gallery.
const galleryImages = { ...images };
delete galleryImages['./images/06.webp'];
renderGallery(galleryImages, document.getElementById('gallery'), { pair: false });

setupCover(images['./images/06.webp'] ?? Object.values(images)[0]);
setupFooterYear();
setupNextPreview();

// Promo: load the YouTube player only when asked to.
document.querySelector('.promo-play')?.addEventListener('click', event => {
  const button = event.currentTarget;
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?autoplay=1&rel=0&vq=hd1080`;
  frame.title = 'STARKIT SRD by AMERIA × Sony — promo';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  button.replaceWith(frame);
});

// LinkedIn posts: a compact carousel keeps one portrait video visible at a time.
const linkedinCarousel = document.querySelector('[data-linkedin-carousel]');
if (linkedinCarousel) {
  const track = linkedinCarousel.querySelector('.linkedin-carousel-track');
  const slides = [...linkedinCarousel.querySelectorAll('.linkedin-embed')];
  const currentLabel = linkedinCarousel.querySelector('[data-linkedin-current]');
  let current = 0;

  const show = index => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    currentLabel.textContent = current + 1;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.inert = !active;
      slide.setAttribute('aria-hidden', String(!active));
    });
  };

  linkedinCarousel.querySelector('[data-linkedin-prev]').addEventListener('click', () => show(current - 1));
  linkedinCarousel.querySelector('[data-linkedin-next]').addEventListener('click', () => show(current + 1));
  show(0);
}
