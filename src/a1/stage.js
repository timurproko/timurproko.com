// Terminal preview tabs + replay, adapted from agentnumberone.dev/script.js.
// Illustrative only: no commands run. The full transcript is always the default.
export function setupStage(stage) {
  if (!stage) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const tabs = [...stage.querySelectorAll('[role="tab"]')];
  const panels = [...stage.querySelectorAll('[role="tabpanel"]')];
  let replayTimer = 0;

  panels.forEach(panel => {
    panel.querySelectorAll('.a1-line').forEach((line, index) => line.style.setProperty('--line-index', index));
  });

  function stopReplay() {
    clearTimeout(replayTimer);
    panels.forEach(panel => panel.classList.remove('is-replaying'));
  }

  function replay() {
    stopReplay();
    if (reducedMotion.matches) return;
    const panel = panels.find(item => !item.hidden);
    void panel.offsetWidth; // restart the animation on repeated clicks
    panel.classList.add('is-replaying');
    replayTimer = setTimeout(stopReplay, 3200);
  }

  function select(tab) {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    });
    replay();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next]);
      tabs[next].focus();
    });
  });

  stage.querySelector('.a1-replay')?.addEventListener('click', replay);

  // Play the session once when it first scrolls into view.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      replay();
    }, { threshold: 0.4 });
    observer.observe(stage.querySelector('.a1-terminal'));
  }
}
