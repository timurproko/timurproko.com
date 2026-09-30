// Venn diagrams (.venn): hidden until scrolled into view, then rings, labels and
// core play the deck's staggered reveal once. Per-element delays come from
// inline --vd styles in the SVG; the animation itself lives in case.css.
export function setupVennReveal(root = document) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  root.querySelectorAll('.venn').forEach(venn => {
    venn.classList.add('is-armed');
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      venn.classList.add('is-visible');
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(venn);
  });
}
