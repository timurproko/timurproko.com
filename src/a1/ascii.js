// ASCII fields, adapted from agentnumberone.dev/script.js. Decorative canvases
// driven by a scene name; no data involved. Each field draws a still frame at
// rest and only animates while play() is active and motion is allowed.
const RAMP = ' .·:;-=+*%#@';
const FPS = 24;
const MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';

// Deterministic per-cell noise so dissolve and dot patterns are stable between frames.
function hash(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}
const smooth = (edge0, edge1, x) => {
  const k = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return k * k * (3 - 2 * k);
};

// Sparse background of faint, slowly blinking dots behind every scene.
function dots(s, t) {
  for (let r = 0; r < s.rows; r += 1) {
    for (let c = 0; c < s.cols; c += 1) {
      const d = hash(c * 0.37, r * 0.91);
      if (d > 0.84 && Math.sin(d * 40 + t * 0.9) > -0.2) s.glyph(c, r, '·', 0);
    }
  }
}

const scenes = {
  // The pi symbol dissolves into the a1 mark and back.
  morph: {
    hold: 2.6, span: 1.9,
    setup(s) {
      const sample = (text, weight, size) => {
        const off = document.createElement('canvas');
        off.width = s.cols; off.height = s.rows;
        const o = off.getContext('2d');
        o.fillStyle = '#fff';
        o.textAlign = 'center';
        o.textBaseline = 'middle';
        if ('letterSpacing' in o) o.letterSpacing = text.length > 1 ? '-0.08em' : '0px';
        o.font = `${weight} ${Math.round(size)}px ${MONO}`;
        o.fillText(text, s.cols / 2, s.rows / 2 + s.rows * 0.04);
        const data = o.getImageData(0, 0, s.cols, s.rows).data;
        const out = new Float32Array(s.cols * s.rows);
        for (let i = 0; i < out.length; i += 1) out[i] = data[i * 4 + 3] / 255;
        return out;
      };
      s.shapeA = sample('π', 700, Math.min(s.rows * 1.42, s.cols * 1.3));
      s.shapeB = sample('a1', 600, Math.min(s.rows * 1.02, s.cols * 0.76));
      s.noise = new Float32Array(s.cols * s.rows);
      for (let r = 0; r < s.rows; r += 1) for (let c = 0; c < s.cols; c += 1) s.noise[r * s.cols + c] = hash(c, r);
    },
    staticTime() { return this.hold + this.span * 0.5; },
    draw(s, t) {
      const cycle = (this.hold + this.span) * 2;
      const local = ((t % cycle) + cycle) % cycle;
      let p, forward;
      if (local < this.hold) { p = 0; forward = true; }
      else if (local < this.hold + this.span) { p = (local - this.hold) / this.span; forward = true; }
      else if (local < this.hold * 2 + this.span) { p = 1; forward = false; }
      else { p = 1 - (local - this.hold * 2 - this.span) / this.span; forward = false; }
      const morphing = p > 0 && p < 1;
      for (let r = 0; r < s.rows; r += 1) {
        for (let c = 0; c < s.cols; c += 1) {
          const i = r * s.cols + c;
          const a = s.shapeA[i], b = s.shapeB[i];
          const sweep = forward ? c / s.cols : 1 - c / s.cols;
          const threshold = sweep * 0.55 + s.noise[i] * 0.45;
          const mix = smooth(threshold - 0.18, threshold + 0.18, p);
          let value = a + (b - a) * mix;
          value *= 0.78 + 0.22 * Math.sin(c * 0.55 + t * 1.1) * Math.cos(r * 0.6 - t * 0.9);
          if (morphing && mix > 0.08 && mix < 0.92 && s.noise[i] > 0.35 && (a > 0.05 || b > 0.05)) {
            const scramble = hash(c + Math.floor(t * 18), r);
            s.glyph(c, r, RAMP[1 + Math.floor(scramble * (RAMP.length - 1))], 8);
          } else if (value * RAMP.length >= 1) {
            s.plot(c, r, value, 2 + Math.round(value * 6));
          } else {
            const d = hash(c * 0.37, r * 0.91);
            if (d > 0.84 && Math.sin(d * 40 + t * 0.9) > -0.2) s.glyph(c, r, '·', 0);
          }
        }
      }
    },
  },

  // A slowly turning wireframe sphere with a light sweeping across it.
  sphere: {
    staticTime() { return 2.4; },
    draw(s, t) {
      dots(s, t);
      const cx = s.cols / 2, cy = s.rows / 2;
      const radius = Math.min(s.cols, s.rows) * 0.42;
      const tilt = 0.42, spin = t * 0.3;
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      const cs = Math.cos(spin), ss = Math.sin(spin);
      for (let r = 0; r < s.rows; r += 1) {
        for (let c = 0; c < s.cols; c += 1) {
          const x = c - cx + 0.5, y = r - cy + 0.5;
          if (Math.hypot(x, y) >= radius) continue;
          const nx = x / radius, ny = y / radius;
          const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
          const py = ny * ct - nz * st, pz = ny * st + nz * ct;
          const qx = nx * cs + pz * ss, qz = pz * cs - nx * ss;
          const lat = Math.asin(Math.max(-1, Math.min(1, py)));
          const lon = Math.atan2(qx, qz);
          const meridians = Math.pow(Math.abs(Math.sin(lon * 4)), 18);
          const parallels = Math.pow(Math.abs(Math.sin(lat * 4)), 18);
          const light = Math.max(0, -nx * 0.35 - ny * 0.45 + nz * 0.8);
          const band = 0.5 + 0.5 * Math.sin(lat * 3 + lon * 2 - t * 1.3);
          const value = 0.05 + light * (0.5 + 0.5 * band) * 0.62 + Math.max(meridians, parallels) * 0.45;
          if (value * RAMP.length >= 1) s.plot(c, r, value, 2 + Math.round(nz * 6));
        }
      }
    },
  },
};

// Mounts the scene named by field.dataset.ascii. With `autoplay` it animates
// while on screen; otherwise it waits for play() (e.g. the home page hover).
export function mountAscii(field, { autoplay = true } = {}) {
  const scene = scenes[field?.dataset.ascii];
  const canvas = field?.querySelector('canvas');
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!scene || !ctx) return { play() {}, pause() {} };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const rgb = getComputedStyle(field).getPropertyValue('--ascii-rgb').trim() || '255, 255, 255';
  const colors = [];
  for (let i = 0; i <= 8; i += 1) colors.push(`rgba(${rgb}, ${(0.14 + (i / 8) * 0.86).toFixed(3)})`);

  const s = { cols: 0, rows: 0, cell: 12, width: 0, height: 0, offsetX: 0, offsetY: 0 };
  s.glyph = (c, r, ch, level) => {
    ctx.fillStyle = colors[Math.max(0, Math.min(8, level))];
    ctx.fillText(ch, s.offsetX + (c + 0.5) * s.cell, s.offsetY + (r + 0.5) * s.cell);
  };
  s.plot = (c, r, value, level) => {
    const index = Math.min(RAMP.length - 1, Math.floor(value * RAMP.length));
    if (index > 0) s.glyph(c, r, RAMP[index], level);
  };

  let raf = 0, last = 0, elapsed = scene.staticTime(), resumedAt = 0;
  let wanted = autoplay, visible = true;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    s.width = Math.max(field.clientWidth, 1);
    s.height = Math.max(field.clientHeight, 1);
    s.cell = s.width >= 480 ? 11 : s.width >= 320 ? 9 : 8;
    // At least one cell, so a hidden field never samples an empty canvas
    s.cols = Math.max(1, Math.floor(s.width / s.cell));
    s.rows = Math.max(1, Math.floor(s.height / s.cell));
    s.offsetX = (s.width - s.cols * s.cell) / 2;
    s.offsetY = (s.height - s.rows * s.cell) / 2;
    canvas.width = Math.round(s.width * dpr);
    canvas.height = Math.round(s.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `500 ${Math.round(s.cell * 0.98)}px ${MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    scene.setup?.(s);
  }

  function draw(t) {
    ctx.clearRect(0, 0, s.width, s.height);
    scene.draw(s, t);
  }

  // Time only advances while playing, so a paused field holds its frame and
  // picks up from there next time instead of jumping.
  const now = () => elapsed + (raf ? (performance.now() - resumedAt) / 1000 : 0);

  function frame(time) {
    if (time - last >= 1000 / FPS) {
      last = time;
      draw(elapsed + (time - resumedAt) / 1000);
    }
    raf = requestAnimationFrame(frame);
  }
  function sync() {
    const run = wanted && visible && !document.hidden && !reducedMotion.matches;
    if (run && !raf) {
      resumedAt = performance.now();
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      elapsed = now();
      cancelAnimationFrame(raf);
      raf = 0;
    }
    if (reducedMotion.matches) draw(scene.staticTime());
  }
  function redraw() {
    resize();
    draw(reducedMotion.matches ? scene.staticTime() : now());
  }

  redraw();
  field.classList.add('is-live');
  document.fonts?.ready.then(redraw);
  if ('ResizeObserver' in window) new ResizeObserver(redraw).observe(field);
  else window.addEventListener('resize', redraw);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      sync();
    }, { rootMargin: '120px 0px' }).observe(field);
  }
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);
  sync();

  return {
    play() { wanted = true; sync(); },
    pause() { wanted = false; sync(); },
  };
}
