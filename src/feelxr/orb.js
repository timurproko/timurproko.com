import * as THREE from 'three';

// Hero orb: the experience's central orb rebuilt in WebGL. The pilot film's score runs
// through a Web Audio analyser. Bass swells the surface, mids and highs ripple it, and
// onsets send soft colour blooms into the sky. Touching the orb dents it, sends a ripple
// and plays a gentle pentatonic note, as touching it does in the headset.

// The eight palettes from the colour step, each as [highlight, shadow band, body, base].
// Each colour also has its own touch voice: the same pentatonic notes, but a different
// register (octave), partials as [frequency ratio, waveform, level], envelope in seconds,
// low-pass brightness (Hz) and how much of the note goes into the room (wet).
export const PALETTES = [
  { name: 'Mist', colors: ['#fbd3ec', '#b7a3ea', '#86c9ee', '#eef8ff'],
    voice: { octave: 2, partials: [[1, 'sine', 1], [2, 'sine', 0.12]], attack: 0.08, decay: 3.8, cutoff: 7000, wet: 0.75 } },
  { name: 'Ember', colors: ['#ffeaa6', '#f5a33c', '#e0512b', '#ff9b6b'],
    voice: { octave: 1, partials: [[1, 'triangle', 1], [1.004, 'sawtooth', 0.12]], attack: 0.01, decay: 2.2, cutoff: 1800, wet: 0.35 } },
  { name: 'Iris', colors: ['#efdcff', '#7f4ee8', '#6a4fe0', '#f2b66b'],
    voice: { octave: 1, partials: [[1, 'sine', 1], [2.76, 'sine', 0.3], [5.4, 'sine', 0.1]], attack: 0.004, decay: 3.4, cutoff: 9000, wet: 0.5 } },
  { name: 'Haze', colors: ['#f7e3b6', '#4f1f4c', '#8b3d8d', '#f4e4a2'],
    voice: { octave: 0.5, partials: [[1, 'sawtooth', 0.5], [1.006, 'sawtooth', 0.5]], attack: 0.18, decay: 3.6, cutoff: 1100, wet: 0.6 } },
  { name: 'Drift', colors: ['#d4ecff', '#1d3d98', '#3b7fe2', '#eef3ff'],
    voice: { octave: 2, partials: [[1, 'sine', 1], [3, 'sine', 0.18]], attack: 0.005, decay: 2.6, cutoff: 8000, wet: 0.55 } },
  { name: 'Verdant', colors: ['#ffe8a4', '#1d6a43', '#4aae48', '#d8f36a'],
    voice: { octave: 1, partials: [[1, 'sine', 1], [4, 'sine', 0.25]], attack: 0.003, decay: 1.4, cutoff: 5000, wet: 0.3 } },
  { name: 'Dusk', colors: ['#f6d39b', '#11444a', '#1e8985', '#ea8b5a'],
    voice: { octave: 0.5, partials: [[1, 'sine', 1], [1.003, 'triangle', 0.35]], attack: 0.04, decay: 3, cutoff: 900, wet: 0.5 } },
  { name: 'Blush', colors: ['#ffdca6', '#4b1f40', '#ee7fb6', '#fff0f3'],
    voice: { octave: 1, partials: [[1, 'sine', 1], [2, 'sine', 0.22], [1.002, 'triangle', 0.18]], attack: 0.02, decay: 3, cutoff: 6000, wet: 0.45 } },
];
const DEFAULT_PALETTE = 'Mist';

// D major pentatonic: any run of touches sounds consonant.
const NOTES = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.26, 739.99];

const RADIUS = 0.75;
const ORB_Y = -0.08;

const NOISE = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const VERTEX = /* glsl */ `
uniform float uTime;
uniform float uBass;
uniform float uMid;
uniform float uHigh;
uniform float uTouch;
uniform vec3 uTouchDir;
uniform float uRipple;
uniform float uRippleAge;
uniform float uAmp;
varying vec3 vNormalW;
varying vec3 vPosW;
varying float vShape;
${NOISE}
// Radial offset of the unit-sphere point p
float shape(vec3 p) {
  float t = uTime;
  float n = snoise(p * 0.9 + vec3(0.0, t * 0.16, t * 0.1)) * (0.022 + uBass * 0.085);
  n += snoise(p * 1.9 + vec3(t * 0.3)) * (0.003 + uMid * 0.012 + uHigh * 0.02);
  // A soft dent where the hand is
  float facing = max(dot(p, uTouchDir), 0.0);
  float dent = smoothstep(0.5, 1.0, facing);
  n -= dent * dent * uTouch * 0.16;
  // A ripple running out from the last touch
  float angle = acos(clamp(dot(p, uTouchDir), -1.0, 1.0));
  n += sin(angle * 11.0 - uRippleAge * 9.0) * uRipple * 0.018 * smoothstep(3.1, 0.2, angle);
  return n * uAmp;
}
void main() {
  vec3 p = normalize(position);
  vec3 helper = abs(p.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(p, helper));
  vec3 bitangent = cross(p, tangent);
  float s = shape(p);
  vec3 p1 = normalize(p + tangent * 0.012);
  vec3 p2 = normalize(p + bitangent * 0.012);
  vec3 a = p * (1.0 + s);
  vec3 b = p1 * (1.0 + shape(p1));
  vec3 c = p2 * (1.0 + shape(p2));
  vec3 n = normalize(cross(b - a, c - a));
  vShape = s;
  vNormalW = normalize(mat3(modelMatrix) * n);
  vec4 world = modelMatrix * vec4(a, 1.0);
  vPosW = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const FRAGMENT = /* glsl */ `
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform float uBass;
uniform float uTime;
varying vec3 vNormalW;
varying vec3 vPosW;
varying float vShape;
${NOISE}
void main() {
  vec3 n = normalize(vNormalW);
  vec3 v = normalize(cameraPosition - vPosW);
  // Vertical gradient as in the headset: warm highlight on top, a deep band, the body
  // colour, then a pale base. The surface's own movement swirls the bands.
  float y = n.y + vShape * 1.2 + snoise(n * 1.6 + vec3(uTime * 0.07)) * 0.12;
  vec3 col = mix(uC3, uC2, smoothstep(-0.95, -0.2, y));
  col = mix(col, uC1, smoothstep(0.08, 0.52, y));
  col = mix(col, uC0, smoothstep(0.66, 0.96, y));
  vec3 light = normalize(vec3(0.15, 1.0, 0.55));
  float wrap = dot(n, light) * 0.5 + 0.5;
  col *= 0.86 + 0.2 * wrap;
  // Peach sky caught in the rim, like the soft translucent orb in the experience
  float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.6);
  col = mix(col, mix(vec3(0.99, 0.84, 0.64), uC3, 0.35), fresnel * 0.5);
  float spec = pow(max(dot(reflect(-light, n), v), 0.0), 14.0);
  col += vec3(1.0, 0.92, 0.75) * spec * 0.22;
  col += uC2 * uBass * 0.1;
  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToVec(hex) {
  const value = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// A short, soft room so touch notes bloom instead of clicking.
function makeImpulse(ctx, seconds = 2.6) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3);
  }
  return buffer;
}

export function setupOrb(figure) {
  const stage = figure.querySelector('[data-orb-stage]');
  const canvas = figure.querySelector('.orb-canvas');
  const audio = figure.querySelector('.orb-audio');
  const playButton = figure.querySelector('.orb-play');
  const playLabel = figure.querySelector('.orb-play-label');
  const playTime = figure.querySelector('.orb-play-time');
  const blooms = figure.querySelector('.orb-blooms');
  const paletteRoot = figure.querySelector('.palette');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  // Render loop state; declared first because resize() and touches wake the loop.
  let visible = true;
  let frame = 0;
  let last = performance.now();
  let elapsed = 0;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    stage.classList.add('is-static');
    return { pause() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 16 / 9, 0.1, 50);
  camera.position.set(0, 0, 6);

  const start = PALETTES.find(p => p.name === DEFAULT_PALETTE).colors.map(hexToVec);
  const target = start.map(c => c.clone());
  const uniforms = {
    uTime: { value: 0 },
    uBass: { value: 0 },
    uMid: { value: 0 },
    uHigh: { value: 0 },
    uTouch: { value: 0 },
    uTouchDir: { value: new THREE.Vector3(0, 0, 1) },
    uRipple: { value: 0 },
    uRippleAge: { value: 0 },
    uAmp: { value: reducedMotion ? 0.45 : 1 },
    uC0: { value: start[0] },
    uC1: { value: start[1] },
    uC2: { value: start[2] },
    uC3: { value: start[3] },
  };
  const orb = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1, coarse ? 28 : 48),
    new THREE.ShaderMaterial({ uniforms, vertexShader: VERTEX, fragmentShader: FRAGMENT }),
  );
  orb.scale.setScalar(RADIUS);
  orb.position.y = ORB_Y;
  scene.add(orb);

  // ─── Palette ───────────────────────────────────────────────────────────
  let palette = PALETTES.find(p => p.name === DEFAULT_PALETTE);
  const swatches = PALETTES.map(entry => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch';
    button.setAttribute('role', 'radio');
    button.setAttribute('aria-checked', String(entry === palette));
    button.tabIndex = entry === palette ? 0 : -1;
    const dot = document.createElement('span');
    dot.className = 'swatch-dot';
    dot.setAttribute('aria-hidden', 'true');
    entry.colors.forEach((c, i) => dot.style.setProperty(`--c${i}`, c));
    const name = document.createElement('span');
    name.className = 'swatch-name';
    name.textContent = entry.name;
    button.title = entry.name;
    button.setAttribute('aria-label', entry.name);
    button.append(dot, name);
    button.addEventListener('click', () => choose(entry));
    paletteRoot.append(button);
    return button;
  });
  function choose(entry, focus = false) {
    palette = entry;
    entry.colors.forEach((c, i) => target[i].copy(hexToVec(c)));
    stage.style.setProperty('--orb-tint', entry.colors[2]);
    swatches.forEach((button, i) => {
      const on = PALETTES[i] === entry;
      button.setAttribute('aria-checked', String(on));
      button.tabIndex = on ? 0 : -1;
      if (on && focus) button.focus();
    });
    bloomBurst(0.5, 0.45, 4);
    playNote(0.5);
  }
  // Arrow keys move through the radio group
  paletteRoot.addEventListener('keydown', event => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = (PALETTES.indexOf(palette) + step + PALETTES.length) % PALETTES.length;
    choose(PALETTES[index], true);
  });
  stage.style.setProperty('--orb-tint', palette.colors[2]);

  // ─── Colour blooms in the sky ──────────────────────────────────────────
  function bloom(x, y, size, color, duration) {
    if (blooms.childElementCount > 26) return;
    const el = document.createElement('span');
    el.className = 'bloom';
    el.style.left = `${x * 100}%`;
    el.style.top = `${y * 100}%`;
    el.style.setProperty('--size', `${size}cqw`);
    el.style.setProperty('--color', color);
    blooms.append(el);
    const drift = (Math.random() - 0.5) * 3;
    el.animate([
      { opacity: 0, transform: 'scale(0.5)' },
      { opacity: 0.85, transform: `scale(1) translate(${drift}cqw, -1cqw)`, offset: 0.25 },
      { opacity: 0, transform: `scale(1.3) translate(${drift * 2}cqw, -3cqw)` },
    ], { duration, easing: 'ease-out' }).finished.then(() => el.remove(), () => el.remove());
  }
  function skyColor() {
    const pick = Math.random();
    return pick < 0.45 ? palette.colors[2] : pick < 0.75 ? palette.colors[0] : palette.colors[1];
  }
  function bloomBurst(cx, cy, count) {
    if (reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 0.22 + Math.random() * 0.25;
      bloom(cx + Math.cos(angle) * distance * 0.6, Math.min(0.62, cy + Math.sin(angle) * distance), 3 + Math.random() * 5, skyColor(), 2400 + Math.random() * 1800);
    }
  }
  function ambientBloom(strength) {
    if (reducedMotion) return;
    const side = Math.random() < 0.5 ? Math.random() * 0.3 : 0.7 + Math.random() * 0.3;
    bloom(side, 0.08 + Math.random() * 0.5, 2.5 + strength * 7 + Math.random() * 3, skyColor(), 3000 + Math.random() * 2500);
  }

  // ─── Audio ─────────────────────────────────────────────────────────────
  let ctx = null;
  let analyser = null;
  let bins = null;
  let dryBus = null;
  let roomBus = null;
  function ensureAudio() {
    if (ctx) return ctx;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.72;
    bins = new Uint8Array(analyser.frequencyBinCount);
    analyser.connect(ctx.destination);
    ctx.createMediaElementSource(audio).connect(analyser);
    // Touch notes: dry plus a soft room, both through the analyser so the orb hears them too.
    // Each note sets its own dry/room balance from the palette's voice.
    dryBus = ctx.createGain();
    roomBus = ctx.createGain();
    const reverb = ctx.createConvolver();
    reverb.buffer = makeImpulse(ctx);
    dryBus.connect(analyser);
    roomBus.connect(reverb).connect(analyser);
    return ctx;
  }

  // Plays one note in the current palette's voice; height (0–1) picks it from the scale.
  function playNote(height) {
    if (!ensureAudio()) return;
    ctx.resume();
    const voice = palette.voice;
    const index = Math.max(0, Math.min(NOTES.length - 1, Math.round(height * (NOTES.length - 1) + (Math.random() - 0.5) * 1.6)));
    const frequency = NOTES[index] * voice.octave;
    const now = ctx.currentTime;
    const end = now + voice.attack + voice.decay;
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(0.16, now + voice.attack);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = voice.cutoff;
    const dry = ctx.createGain();
    const room = ctx.createGain();
    dry.gain.value = 1 - voice.wet * 0.5;
    room.gain.value = voice.wet;
    envelope.connect(tone);
    tone.connect(dry).connect(dryBus);
    tone.connect(room).connect(roomBus);
    voice.partials.forEach(([ratio, type, level]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = frequency * ratio;
      gain.gain.value = level;
      osc.connect(gain).connect(envelope);
      osc.start(now);
      osc.stop(end + 0.1);
    });
  }

  let duration = 80;
  audio.addEventListener('loadedmetadata', () => { duration = audio.duration || duration; });
  function setPlaying(playing) {
    playButton.setAttribute('aria-pressed', String(playing));
    playLabel.textContent = playing ? 'Pause' : 'Play';
  }
  playButton.addEventListener('click', () => {
    if (!audio.paused) { audio.pause(); return; }
    ensureAudio();
    ctx?.resume();
    if (audio.ended) audio.currentTime = 0;
    audio.play().catch(() => setPlaying(false));
  });
  audio.addEventListener('play', () => { setPlaying(true); wake(); });
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => { setPlaying(false); playTime.textContent = formatTime(duration); });

  // ─── Touch ─────────────────────────────────────────────────────────────
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hitSphere = new THREE.Sphere(orb.position, RADIUS * 1.04);
  const hit = new THREE.Vector3();
  const touchDir = new THREE.Vector3(0, 0, 1);
  let hovering = false;
  let pressing = false;
  let lastNoteDir = new THREE.Vector3();
  let touchTarget = 0;

  function probe(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    if (!raycaster.ray.intersectSphere(hitSphere, hit)) return false;
    touchDir.copy(orb.worldToLocal(hit.clone())).normalize();
    return true;
  }
  function touchEffects() {
    const height = (touchDir.clone().applyQuaternion(orb.quaternion).y + 1) / 2;
    playNote(height);
    uniforms.uRipple.value = 1;
    uniforms.uRippleAge.value = 0;
    const screen = hit.clone().project(camera);
    bloomBurst((screen.x + 1) / 2, (1 - screen.y) / 2, 3);
    lastNoteDir.copy(touchDir);
    stage.classList.add('is-touched');
    wake();
  }
  canvas.addEventListener('pointermove', event => {
    const over = probe(event);
    hovering = over;
    canvas.classList.toggle('is-over', over);
    if (over) uniforms.uTouchDir.value.copy(touchDir);
    // Sliding across the surface strums new notes
    if (pressing && over && touchDir.angleTo(lastNoteDir) > 0.45) touchEffects();
    wake();
  });
  canvas.addEventListener('pointerleave', () => { hovering = false; canvas.classList.remove('is-over'); });
  canvas.addEventListener('pointerdown', event => {
    if (!probe(event)) return;
    pressing = true;
    canvas.classList.add('is-pressing');
    canvas.setPointerCapture?.(event.pointerId);
    uniforms.uTouchDir.value.copy(touchDir);
    touchEffects();
  });
  const release = () => { pressing = false; canvas.classList.remove('is-pressing'); };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  // ─── Size ──────────────────────────────────────────────────────────────
  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = Math.max(6, 4.4 / camera.aspect);
    camera.updateProjectionMatrix();
    wake();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  // ─── Loop ──────────────────────────────────────────────────────────────
  const level = { bass: 0, mid: 0, high: 0 };
  const peak = { bass: 0.3, mid: 0.3, high: 0.3 };
  let slowBass = 0;
  let lastOnset = 0;

  function band(from, to) {
    let sum = 0;
    for (let i = from; i < to; i++) sum += bins[i];
    return sum / ((to - from) * 255);
  }
  // Each band is normalised against its own slowly falling peak, so a quiet piano
  // passage moves the orb as clearly as a loud swell.
  function follow(key, raw, dt) {
    peak[key] = Math.max(raw, peak[key] - dt * 0.04, 0.12);
    const normalised = Math.pow(Math.min(raw / peak[key], 1), 1.6);
    const rate = normalised > level[key] ? 14 : 3.5;
    level[key] += (normalised - level[key]) * (1 - Math.exp(-dt * rate));
  }

  function tick(now) {
    frame = 0;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += dt;
    const playing = !audio.paused;

    if (analyser && (playing || uniforms.uRipple.value > 0.01)) {
      analyser.getByteFrequencyData(bins);
      follow('bass', band(1, 6), dt);
      follow('mid', band(6, 40), dt);
      follow('high', band(40, 170), dt);
    } else {
      // Resting: the orb breathes on its own
      const breath = 0.5 + 0.5 * Math.sin(elapsed * 0.55);
      level.bass += (breath * 0.35 - level.bass) * (1 - Math.exp(-dt * 2));
      level.mid += (0.12 - level.mid) * (1 - Math.exp(-dt * 2));
      level.high += (0.05 - level.high) * (1 - Math.exp(-dt * 2));
    }

    // Onsets in the music bloom across the sky
    slowBass += (level.bass - slowBass) * (1 - Math.exp(-dt * 2.5));
    if (playing && level.bass - slowBass > 0.16 && elapsed - lastOnset > 0.4) {
      lastOnset = elapsed;
      ambientBloom(level.bass);
      if (level.high > 0.55) ambientBloom(level.high);
    }

    uniforms.uTime.value += dt * (reducedMotion ? 0.4 : 1) * (1 + level.mid * 0.6);
    uniforms.uBass.value = level.bass;
    uniforms.uMid.value = level.mid;
    uniforms.uHigh.value = level.high;
    touchTarget = pressing ? 1 : hovering ? 0.3 : 0;
    uniforms.uTouch.value += (touchTarget - uniforms.uTouch.value) * (1 - Math.exp(-dt * (pressing ? 10 : 4)));
    uniforms.uRippleAge.value += dt;
    uniforms.uRipple.value *= Math.exp(-dt * 1.6);

    const ease = 1 - Math.exp(-dt * 5);
    ['uC0', 'uC1', 'uC2', 'uC3'].forEach((key, i) => uniforms[key].value.lerp(target[i], ease));

    if (!reducedMotion) orb.rotation.y += dt * (0.08 + level.mid * 0.12);
    const bob = reducedMotion ? 0 : Math.sin(elapsed * 0.8) * 0.035;
    orb.position.y = ORB_Y + bob;
    orb.scale.setScalar(RADIUS * (1 + level.bass * 0.05 * uniforms.uAmp.value));
    stage.style.setProperty('--energy', (level.bass * 0.6 + level.high * 0.4).toFixed(3));
    stage.style.setProperty('--shadow', (1 - bob * 2.5 + level.bass * 0.06).toFixed(3));
    if (playing) playTime.textContent = formatTime(duration - audio.currentTime);

    renderer.render(scene, camera);
    if (visible) frame = requestAnimationFrame(tick);
  }
  function wake() {
    if (frame || !visible) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    }).observe(stage);
  }
  wake();

  return { pause: () => audio.pause() };
}
