import { setupFooterYear } from '../case/footer-year.js';
import { setupNextPreview } from '../case/next-preview.js';
import { setupVennReveal } from '../case/venn-reveal.js';
import { setupChapterNav } from '../case/chapter-nav.js';

// The agentic loop: a dot travels the dashed feedback path once the graph is on
// screen (the SMIL motion starts paused so it doesn't run while off-screen).
const loop = document.querySelector('.flow-graph');
const motion = loop && loop.querySelector('animateMotion');
if (motion && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const start = () => motion.beginElement();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      start();
    }, { threshold: 0.3 });
    observer.observe(loop);
  } else {
    start();
  }
}

// Hero trend panels: armed hidden, then play the staggered reveal (case-page.css) once in view.
const trend = document.querySelector('.trend');
if (trend && 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  trend.classList.add('is-armed');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    trend.classList.add('is-visible');
  }, { threshold: 0.3 });
  observer.observe(trend);
}

setupVennReveal();
setupFooterYear();
setupNextPreview();
// Section tabs appear once the trend panels have scrolled away
setupChapterNav(document.getElementById('chapter-nav'), trend);
