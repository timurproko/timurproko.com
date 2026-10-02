import { renderGallery } from '../case/gallery.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupStatReveal } from '../case/stat-reveal.js';
import { setupVennReveal } from '../case/venn-reveal.js';
import { setupChapterNav } from '../case/chapter-nav.js';

// Drop numbered files into src/corel-for-mac/images/ — 01 is the hero, the rest form the thumbnail strip.
const images = import.meta.glob('./images/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});
renderGallery(images, document.getElementById('gallery'), { pair: false });

// UI breakdown: hover tips work on desktop; on touch screens the tips are
// hidden and the tapped region's text shows in a panel under the graph.
document.querySelectorAll('.breakdown-stage').forEach(stage => {
  const hotspots = [...stage.querySelectorAll('.breakdown-hotspot')];
  if (!hotspots.length) return;

  const detail = document.createElement('div');
  detail.className = 'breakdown-mobile-detail';
  detail.setAttribute('aria-live', 'polite');
  const title = document.createElement('strong');
  const copy = document.createElement('span');
  detail.append(title, copy);
  stage.append(detail);

  // SVG text wraps via <tspan> lines with no spaces between them — join them with one.
  const text = (hotspot, selector) => {
    const node = hotspot.querySelector(selector);
    if (!node) return '';
    const lines = node.children.length ? [...node.children].map(line => line.textContent) : [node.textContent];
    return lines.join(' ').trim().replace(/\s+/g, ' ');
  };

  function select(hotspot) {
    hotspots.forEach(item => item.classList.toggle('is-selected', item === hotspot));
    title.textContent = text(hotspot, '.tip-title') || hotspot.getAttribute('aria-label');
    copy.textContent = text(hotspot, '.tip-copy');
  }

  hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', () => select(hotspot));
    hotspot.addEventListener('focus', () => select(hotspot));
  });
  select(hotspots[0]);
});

setupVennReveal();
setupStatReveal();
setupFooterYear();
// Section tabs appear once the gallery has scrolled away
setupChapterNav(document.getElementById('chapter-nav'), document.getElementById('gallery'));
