import { setupFooterYear } from '../case/footer-year.js';
import { setupVennReveal } from '../case/venn-reveal.js';

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

setupVennReveal();
setupFooterYear();
