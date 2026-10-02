// Pinned section nav (.chapter-nav, styled in case.css): a floating pill that
// appears once `after` has scrolled away, hides again at the "next project"
// footer, and marks the section currently being read. Each link points at its
// section by hash: <a href="#users">Users</a>.
export function setupChapterNav(nav, after) {
  if (!nav || !after) return;
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.querySelector(link.hash));
  const next = document.querySelector('.next');

  let afterAbove = false;
  let nextVisible = false;
  const update = () => nav.classList.toggle('is-visible', afterAbove && !nextVisible);
  // `after` counts as scrolled away once it is up under the header and the pill
  // (the top 110px, the same as the sections' scroll-margin), so jumping to the
  // first section — which sits right below it — shows the pill. Checked on
  // scroll rather than observed: a jump lands `after` exactly on the 110px line
  // (give or take a subpixel), and an IntersectionObserver still reports that
  // edge-to-edge case as visible.
  function checkAfter() {
    const above = after.getBoundingClientRect().bottom <= 112;
    if (above === afterAbove) return;
    afterAbove = above;
    update();
  }
  if (next) {
    new IntersectionObserver(([entry]) => {
      nextVisible = entry.isIntersecting;
      update();
    }).observe(next);
  }

  // A section stays current from its header until the next section's header.
  let shown;
  function markCurrent() {
    const line = window.innerHeight * 0.4;
    let current = -1;
    sections.forEach((section, i) => {
      if (section && section.getBoundingClientRect().top < line) current = i;
    });
    if (current === shown) return;
    shown = current;
    links.forEach((link, i) => {
      if (i === current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    // On narrow screens the pill scrolls sideways — keep the current section centred in it.
    const link = links[current];
    if (link && nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({ left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
    }
  }
  function onScroll() {
    checkAfter();
    markCurrent();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
