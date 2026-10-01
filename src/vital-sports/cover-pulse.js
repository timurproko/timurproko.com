// VITAL cover: a heartbeat trace in place of an image. Beats land at irregular
// intervals — that beat-to-beat variation is what heart-rate variability measures —
// and the trace scrolls like a monitor while the home page card is hovered, with a
// glow behind the title on every beat. At rest it draws one still frame, so static
// posters and paused previews still read well.

const WINDOW = 5.5; // seconds of trace across the cover
const HEAD = 0.84; // the newest point sits this far across
const BEAT_GLOW = 0.6; // seconds a beat's glow takes to fade

const gauss = (x, mu, sigma) => Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));

// One heartbeat (P, QRS, T) as a function of seconds from its R peak.
function beatShape(dt) {
  return 0.12 * gauss(dt, -0.2, 0.035)
    - 0.14 * gauss(dt, -0.035, 0.012)
    + 1 * gauss(dt, 0, 0.013)
    - 0.24 * gauss(dt, 0.035, 0.014)
    + 0.22 * gauss(dt, 0.26, 0.06);
}

// R peaks with a slow, breathing-like swing in the interval plus a little jitter.
function makeBeats(until) {
  const beats = [-2];
  while (beats[beats.length - 1] < until) {
    const t = beats[beats.length - 1];
    beats.push(t + 0.86 + 0.16 * Math.sin(t * 0.55) + (Math.random() - 0.5) * 0.08);
  }
  return beats;
}

// baseline / amplitude are fractions of the canvas height, so a page can move the trace.
export function createCoverPulse(cover, { baseline = 0.6, amplitude = 0.3 } = {}) {
  const canvas = cover?.querySelector('.cover-pulse');
  if (!canvas) return { start() {}, stop() {} };
  const ctx = canvas.getContext('2d');
  let beats = makeBeats(600);
  let frame = 0;
  let origin = 0;
  let t = 2.6; // still frame: just after a beat, so the glow and a peak show

  function resize() {
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = Math.round(canvas.clientHeight * ratio);
    draw();
  }

  function signal(time) {
    let v = 0;
    for (const r of beats) {
      if (r > time + 0.4) break;
      if (r > time - 0.5) v += beatShape(time - r);
    }
    return v;
  }

  function draw() {
    const { width: w, height: h } = canvas;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    const head = w * HEAD;
    const pxPerSec = head / WINDOW;
    const base = h * baseline;
    const amp = h * amplitude;

    const fade = ctx.createLinearGradient(0, 0, head, 0);
    fade.addColorStop(0, 'rgba(111, 141, 255, 0)');
    fade.addColorStop(0.35, 'rgba(111, 141, 255, 0.55)');
    fade.addColorStop(1, 'rgba(150, 175, 255, 1)');

    ctx.beginPath();
    const step = Math.max(1, w / 900);
    for (let x = 0; x <= head; x += step) {
      const y = base - signal(t - (head - x) / pxPerSec) * amp;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, h / 260);
    ctx.strokeStyle = fade;
    ctx.shadowColor = 'rgba(111, 141, 255, 0.85)';
    ctx.shadowBlur = h / 40;
    ctx.stroke();

    // Leading dot
    const y = base - signal(t) * amp;
    ctx.beginPath();
    ctx.arc(head, y, Math.max(3, h / 120), 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(150, 175, 255, 1)';
    ctx.shadowBlur = h / 25;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Glow behind the title, strongest right after each R peak
    const last = beats.findLast(r => r <= t) ?? -10;
    const glow = Math.max(0, 1 - (t - last) / BEAT_GLOW);
    cover.style.setProperty('--beat', glow.toFixed(3));
  }

  function tick(now) {
    t = (now - origin) / 1000;
    if (t > beats[beats.length - 1] - 1) {
      beats = makeBeats(600);
      origin = now;
    }
    draw();
    frame = requestAnimationFrame(tick);
  }

  new ResizeObserver(resize).observe(canvas);

  return {
    start() {
      cancelAnimationFrame(frame);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      origin = performance.now() - t * 1000;
      frame = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(frame);
    },
  };
}
