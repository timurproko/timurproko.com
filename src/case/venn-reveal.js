// Venn diagrams (.venn): hidden by case.css from the first paint, then rings, labels
// and core play the deck's staggered reveal once scrolled into view. Per-element
// delays come from inline --vd styles in the SVG; the animation lives in case.css.
export function setupVennReveal(root = document) {
  const venns = root.querySelectorAll('.venn');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) {
    venns.forEach(venn => venn.classList.add('is-visible'));
    return;
  }

  venns.forEach(venn => {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      venn.classList.add('is-visible');
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(venn);
  });
}
