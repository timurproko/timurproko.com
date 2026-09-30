// Stat blocks (.stat): hidden until scrolled into view, then numbers count up
// from 0 and the caption / list items fade up in sequence. Plays once.
// Any element with data-count counts up to the number in its text, keeping
// the rest of the text (e.g. "%") as a suffix.
const DURATION = 1100;
const ease = t => 1 - Math.pow(1 - t, 3);

function countUp(el, delay) {
  const [, target, suffix = ''] = el.textContent.match(/^(\d+)(.*)$/) || [];
  if (!target) return;
  el.textContent = `0${suffix}`;
  setTimeout(() => {
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / DURATION, 1);
      el.textContent = `${Math.round(ease(progress) * Number(target))}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, delay);
}

export function setupStatReveal(root = document) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.querySelectorAll('.stat').forEach(stat => {
    stat.classList.add('is-armed');
    stat.querySelectorAll('.points li').forEach((li, i) => li.style.setProperty('--sd', `${380 + i * 110}ms`));

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      stat.classList.add('is-visible');
      stat.querySelectorAll('[data-count]').forEach(el => {
        const li = el.closest('li');
        countUp(el, li ? parseInt(li.style.getPropertyValue('--sd'), 10) : 80);
      });
    }, { threshold: 0.4 });
    observer.observe(stat);
  });
}
