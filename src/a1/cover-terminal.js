// A1 cover: an illustrative session (from agentnumberone.dev) that plays line
// by line while the home page card is hovered. At rest it shows the full
// session so static posters and paused previews still read well.
const STEP_MS = 520;
const HOLD_MS = 2600;

export function createCoverTerminal(root) {
  const lines = [...(root?.querySelectorAll('.demo-line') ?? [])];
  let frame = 0;
  let start = 0;

  const show = count => lines.forEach((line, i) => line.classList.toggle('is-in', i < count));

  function tick(now) {
    const shown = Math.floor((now - start) / STEP_MS) + 1;
    if (shown > lines.length + HOLD_MS / STEP_MS) start = now;
    show(Math.max(1, Math.min(shown, lines.length)));
    frame = requestAnimationFrame(tick);
  }

  show(lines.length);

  return {
    start() {
      cancelAnimationFrame(frame);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      show(0);
      start = performance.now();
      frame = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(frame);
      show(lines.length);
    },
  };
}
