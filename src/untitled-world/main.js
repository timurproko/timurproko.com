import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { setupZoom } from '../case/lightbox.js';

// Home page preview cover uses the title scene as its backdrop.
setupCover('/untitled-world/assets/scene-balloon.webp');
setupFooterYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// On phones the manifesto is plain text you scroll past (case-page.css unpins it too).
const staticManifesto = reducedMotion || window.matchMedia('(max-width: 760px)').matches;

// Hero HUD timecode — hh:mm:ss:ff since the page opened, like a camera readout.
const timecode = document.querySelector('[data-timecode]');
if (timecode) {
  const start = performance.now();
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const t = (performance.now() - start) / 1000;
    const frames = Math.floor((t % 1) * 24);
    timecode.textContent = `${pad(Math.floor(t / 3600))}:${pad(Math.floor(t / 60) % 60)}:${pad(Math.floor(t) % 60)}:${pad(frames)}`;
    if (!reducedMotion) requestAnimationFrame(tick);
  };
  tick();
}

// Viewfinder parallax (hero and sightings): the photo drifts against the pointer,
// as if looking through a headset.
if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('[data-parallax]').forEach(view => {
    view.addEventListener('pointermove', event => {
      const rect = view.getBoundingClientRect();
      view.style.setProperty('--px', (((event.clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
      view.style.setProperty('--py', (((event.clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
    });
    view.addEventListener('pointerleave', () => {
      view.style.setProperty('--px', 0);
      view.style.setProperty('--py', 0);
    });
  });
}

// Manifesto: split into words, then light them in reading order as the pinned
// section scrolls through the viewport.
const manifesto = document.querySelector('.manifesto');
const words = [];
document.querySelectorAll('[data-scrub]').forEach(paragraph => {
  const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node => {
    const fragment = document.createDocumentFragment();
    node.textContent.split(/(\s+)/).forEach(part => {
      if (!part.trim()) return fragment.append(part);
      const span = document.createElement('span');
      span.className = 'word';
      span.textContent = part;
      words.push(span);
      fragment.append(span);
    });
    node.replaceWith(fragment);
  });
});
// Cloud text: each letter starts as a large, faint blur drifting slightly off its
// place, then condenses into sharp ink. Letters resolve roughly in reading order with
// overlapping timings, so the line clears like mist. Returns render(progress 0…1).
const smooth = x => x * x * (3 - 2 * x);
function materialize(el) {
  const glyphs = [];
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  const letters = text.replace(/\s+/g, '').length;
  text.split(/(\s+)/).forEach(part => {
    if (!part.trim()) return el.append(part);
    const word = document.createElement('span');
    word.className = 'glyph-word';
    word.setAttribute('aria-hidden', 'true');
    [...part].forEach(char => {
      const glyph = document.createElement('span');
      glyph.className = 'glyph';
      glyph.textContent = char;
      const angle = Math.random() * Math.PI * 2;
      const distance = 16 + Math.random() * 36;
      const order = glyphs.length / Math.max(1, letters - 1);
      glyphs.push({ el: glyph, delay: order * 0.65 + Math.random() * 0.35, dx: Math.cos(angle) * distance, dy: Math.sin(angle) * distance * 0.7 });
      word.append(glyph);
    });
    el.append(word);
  });
  return progress => glyphs.forEach(g => {
    // Each letter gets half the timeline, offset by its delay.
    const e = smooth(Math.min(1, Math.max(0, (progress - g.delay * 0.5) / 0.5)));
    const rest = 1 - e;
    g.el.style.transform = `translate(${(g.dx * rest).toFixed(1)}px, ${(g.dy * rest).toFixed(1)}px) scale(${(1 + rest * 0.4).toFixed(3)})`;
    g.el.style.filter = rest > 0.01 ? `blur(${(rest * 16).toFixed(1)}px)` : '';
    g.el.style.opacity = e.toFixed(3);
  });
}

// The manifesto's closing line assembles with scroll.
const closing = document.querySelector('.manifesto [data-materialize]');
const renderGlyphs = closing ? materialize(closing) : () => {};

// Scroll progress (0…1) through a pinned section's travel.
function pinProgress(section) {
  const rect = section.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  return travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 1;
}
const finale = document.querySelector('.manifesto-finale');
function scrubManifesto() {
  // Words light over most of the manifesto's pinned scroll.
  const lit = Math.round(Math.min(1, pinProgress(manifesto) / 0.85) * words.length);
  words.forEach((word, i) => word.classList.toggle('is-lit', i < lit));
  // The closing line pins centred while still scattered, then assembles as scrolling continues.
  if (finale) renderGlyphs(Math.min(1, Math.max(0, (pinProgress(finale) - 0.08) / 0.72)));
}
if (!staticManifesto) {
  window.addEventListener('scroll', scrubManifesto, { passive: true });
  window.addEventListener('resize', scrubManifesto);
  scrubManifesto();
} else {
  words.forEach(word => word.classList.add('is-lit'));
  renderGlyphs(1);
}

// Sightings lock on when scrolled into view: the reticle closes in on the
// hologram and the log readout types in row by row.
if (!reducedMotion && 'IntersectionObserver' in window) {
  const lockObserver = new IntersectionObserver(entries => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      target.classList.add('is-locked');
      lockObserver.unobserve(target);
    });
  }, { threshold: 0.45 });
  document.querySelectorAll('.sighting').forEach(sighting => {
    sighting.querySelectorAll('.log > div').forEach((row, i) => row.style.setProperty('--i', i));
    sighting.classList.add('is-armed');
    lockObserver.observe(sighting);
  });
} else {
  document.querySelectorAll('.sighting').forEach(sighting => sighting.classList.add('is-locked'));
}
document.querySelectorAll('.specimens li').forEach((item, i) => item.style.setProperty('--i', i));

// Film: load the YouTube player only when asked to.
document.querySelector('.film-play')?.addEventListener('click', event => {
  const button = event.currentTarget;
  const frame = document.createElement('iframe');
  frame.src = `https://www.youtube-nocookie.com/embed/${button.dataset.video}?autoplay=1&rel=0&vq=hd1080`;
  frame.title = 'Untitled World — film';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  button.parentElement.querySelector('.hud')?.remove();
  button.replaceWith(frame);
});

// Zoomable images open full screen and swipe through their group (case/lightbox.js).
setupZoom();

// Pinned sighting strip: a compact copy of the contact sheet that appears once the
// sheet scrolls away, hides again after the last sighting, and marks the one in view.
const sheet = document.querySelector('.contact-sheet');
const sightingList = document.querySelector('.sightings');
const strip = sheet.cloneNode(true);
strip.className = 'sighting-strip';
strip.setAttribute('aria-label', 'Sightings, pinned');
strip.querySelectorAll('img').forEach(img => img.removeAttribute('loading'));
document.body.append(strip);
const stripLinks = [...strip.querySelectorAll('a')];
const sightingEls = stripLinks.map(link => document.querySelector(link.hash));
let shownSighting;
function updateStrip() {
  const past = sheet.getBoundingClientRect().bottom < 76;
  const listBottom = sightingList.getBoundingClientRect().bottom;
  strip.classList.toggle('is-visible', past && listBottom > window.innerHeight * 0.4);
  const line = window.innerHeight * 0.45;
  let current = -1;
  sightingEls.forEach((el, i) => { if (el.getBoundingClientRect().top < line) current = i; });
  if (current === shownSighting) return;
  shownSighting = current;
  stripLinks.forEach((link, i) => {
    if (i === current) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', updateStrip, { passive: true });
window.addEventListener('resize', updateStrip);
updateStrip();
