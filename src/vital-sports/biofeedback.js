// Live biofeedback demo: a box-breathing pacer (4s in / hold / out / hold) driving a
// simulated vHRV trace. As breathing coherence builds, the trace turns from noise into a
// smooth wave in step with the breath and the readout climbs towards high resilience.
// "Add pressure" knocks coherence down for a few seconds so it can recover again.
// Runs only while on screen; with reduced motion it renders one settled frame until played.

const PHASE = 4; // seconds per box-breathing phase
const CYCLE = PHASE * 4;
const SAMPLE_RATE = 10; // trace samples per second
const POINTS = 240; // 24 s of trace across the graph
const WIDTH = 600;
const MID = 60;
const SESSION = 15 * 60;

const ease = x => 0.5 - Math.cos(Math.PI * x) / 2;
const mod = (a, n) => ((a % n) + n) % n;

// Lung fill 0..1 at time t: rises on In, stays on Hold, falls on Out, rests on the last Hold.
function breathAt(t) {
  const phase = Math.floor(mod(t, CYCLE) / PHASE);
  const p = mod(t, PHASE) / PHASE;
  return [ease(p), 1, 1 - ease(p), 0][phase];
}

export function setupBiofeedback(root) {
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const pacer = $('.pacer');
  const count = $('[data-count]');
  const phases = [...root.querySelectorAll('.phase')];
  const hrv = $('[data-hrv]');
  const timer = $('[data-timer]');
  const line = $('[data-line]');
  const area = $('[data-area]');
  const head = $('[data-head]');
  const marker = $('[data-marker]');
  const toggle = $('[data-toggle]');
  const toggleLabel = $('[data-toggle-label]');
  const pressure = $('[data-pressure]');

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  let t = 0; // simulated seconds
  let coherence = reduceMotion ? 0.9 : 0.15;
  let pressureUntil = -1;
  let walk = 0;
  let sampleClock = 0;
  let readoutClock = 0;
  let paused = reduceMotion;
  let visible = false;
  let frame = 0;
  let last = 0;
  const samples = [];

  function sample() {
    const calm = coherence;
    walk = walk * 0.9 + (Math.random() - 0.5) * 9 * (1 - calm);
    const jitter = (Math.random() - 0.5) * 34 * (1 - calm) ** 1.5;
    const wave = (breathAt(t) - 0.5) * 2 * 30 * calm;
    const ripple = (Math.random() - 0.5) * 3;
    samples.push(MID - wave - walk - jitter - ripple);
    if (samples.length > POINTS) samples.shift();
  }

  function stepCoherence(dt) {
    const stressed = t < pressureUntil;
    const target = stressed ? 0.06 : 0.95;
    const rate = stressed ? 1.4 : 0.09; // falls apart fast, rebuilds slowly
    coherence += (target - coherence) * Math.min(1, dt * rate);
    if (!stressed && pressure.disabled) pressure.disabled = false;
  }

  function advance(dt) {
    t += dt;
    stepCoherence(dt);
    sampleClock += dt;
    while (sampleClock >= 1 / SAMPLE_RATE) {
      sampleClock -= 1 / SAMPLE_RATE;
      sample();
    }
  }

  // Fill the graph with the last 24 s so it never starts empty.
  t = -POINTS / SAMPLE_RATE;
  for (let i = 0; i < POINTS; i++) {
    t += 1 / SAMPLE_RATE;
    sample();
  }
  t = 0;

  function drawTrace() {
    const step = WIDTH / (POINTS - 1);
    const offset = POINTS - samples.length;
    let d = '';
    samples.forEach((y, i) => {
      d += `${i ? 'L' : 'M'}${((i + offset) * step).toFixed(1)} ${y.toFixed(1)}`;
    });
    line.setAttribute('d', d);
    area.setAttribute('d', `${d}L${WIDTH} 120L0 120Z`);
    head.setAttribute('cy', samples[samples.length - 1].toFixed(1));
  }

  function drawReadout() {
    const value = Math.round(40 + 40 * coherence + (Math.random() - 0.5) * 8 * (1 - coherence));
    hrv.textContent = value;
    const left = Math.max(0, SESSION - Math.floor(t));
    timer.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    marker.style.setProperty('--level', Math.min(0.92, Math.max(0.08, 1 - coherence)));

    root.dataset.mood = t < pressureUntil ? 'stressed' : coherence > 0.75 ? 'calm' : 'neutral';
  }

  function drawPacer() {
    const phase = Math.floor(mod(t, CYCLE) / PHASE);
    const within = mod(t, PHASE);
    pacer.style.setProperty('--breath', breathAt(t).toFixed(3));
    count.textContent = PHASE - Math.floor(within);
    phases.forEach((el, i) => {
      el.classList.toggle('is-active', i === phase);
      el.style.setProperty('--progress', i === phase ? (within / PHASE).toFixed(3) : 0);
    });
  }

  function render() {
    drawTrace();
    drawPacer();
  }

  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    advance(dt);
    readoutClock += dt;
    if (readoutClock >= 0.5) {
      readoutClock = 0;
      drawReadout();
    }
    render();
    frame = requestAnimationFrame(tick);
  }

  function sync() {
    const run = visible && !paused && !document.hidden;
    if (run && !frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    } else if (!run && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    root.classList.toggle('is-running', run);
  }

  // The button shows what a click does: Pause while running, Play while paused.
  function showPaused() {
    toggleLabel.textContent = paused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-pressed', String(paused));
    root.classList.toggle('is-paused', paused);
  }

  toggle.addEventListener('click', () => {
    paused = !paused;
    showPaused();
    sync();
  });

  pressure.addEventListener('click', () => {
    pressureUntil = t + 6;
    pressure.disabled = true;
    if (paused) toggle.click();
    drawReadout();
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { rootMargin: '100px 0px' }).observe(root);
  document.addEventListener('visibilitychange', sync);

  showPaused();
  render();
  drawReadout();
}
