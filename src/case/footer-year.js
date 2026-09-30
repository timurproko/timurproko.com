// Footer year count-up — same behaviour as the home and CV page footers.
export function setupFooterYear() {
  const footerYear = document.querySelector('[data-footer-year]');
  if (!footerYear) return;

  const footer = footerYear.closest('footer');
  const targetYear = new Date().getFullYear();
  const targetText = String(targetYear);
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let hasAnimated = false;

  footerYear.textContent = '0'.repeat(targetText.length);
  footerYear.setAttribute('aria-label', targetText);

  function finish() {
    footer?.classList.add('is-visible');
    footerYear.textContent = targetText;
  }

  function reveal() {
    if (hasAnimated) return;
    hasAnimated = true;
    footer?.classList.add('is-visible');

    if (reducedMotion) {
      footerYear.textContent = targetText;
      return;
    }

    const duration = 1400;
    const startTime = performance.now();
    const easeOutCubic = progress => 1 - Math.pow(1 - progress, 3);

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.round(targetYear * easeOutCubic(progress));
      footerYear.textContent = String(value).padStart(targetText.length, '0');

      if (progress < 1) {
        requestAnimationFrame(tick);
        return;
      }

      finish();
    }

    requestAnimationFrame(tick);
  }

  if (!('IntersectionObserver' in window) || !footer) {
    reveal();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    reveal();
  }, { threshold: 0.35 });

  observer.observe(footer);
}
