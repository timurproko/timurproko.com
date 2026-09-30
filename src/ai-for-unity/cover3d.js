// Cover 3D object (three.js), page-specific.
//
// Unity Development deck: a miniature scene view — a ground grid receding to
// the horizon, three wireframe primitives standing on it, and a camera frustum
// looking down at them. It is the deck's thesis as one image: an engine is a
// world, a clock and a camera pointed at it.
//
// The home page shows this cover rendered at desktop size and scaled down to a
// small card, so plain WebGL lines (always 1px) end up a fraction of a pixel
// wide and strobe as the scene sways. So shapes are solid faceted steel, and all
// lines are "fat" screen-space lines (LineSegments2) that get thicker — and the
// grid sparser — in that preview mode. Depth is faked with per-vertex colour
// (lines darken toward the background) rather than fog, so the renderer can
// stay alpha:true over the page gradient.
import * as THREE from 'three';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

const PREVIEW = new URLSearchParams(window.location.search).get('preview') === 'cover';
// Line width in CSS px of the rendered page; the preview is shown at ~1/4–1/5 scale.
const LINE_WIDTH = PREVIEW ? 3.4 : 1.2;
// Fat-line materials need the canvas size; initCover3d keeps it up to date.
const lineMaterials = [];

/** Screen-space thick line segments. `colors` (per vertex) or a flat `color`. */
function fatLines(positions, { colors, color = 0xffffff, opacity = 1, width = 1 }) {
  const geometry = new LineSegmentsGeometry();
  geometry.setPositions(positions);
  if (colors) geometry.setColors(colors);
  const material = new LineMaterial({
    color: colors ? 0xffffff : color,
    vertexColors: Boolean(colors),
    linewidth: LINE_WIDTH * width,
    transparent: opacity < 1,
    opacity,
    worldUnits: false,
  });
  lineMaterials.push(material);
  return new LineSegments2(geometry, material);
}

const STEEL = {
  bright: new THREE.Color(0xe7ecf3),
  line: new THREE.Color(0x9aa8bd),
  dim: new THREE.Color(0x5b6c86),
  fade: new THREE.Color(0x0e141d),
};

/** Lerp toward the background colour so distant geometry sinks into the cover. */
function depthFade(base, t) {
  return base.clone().lerp(STEEL.fade, Math.min(Math.max(t, 0), 1));
}

/**
 * Ground plane grid. Each line is emitted in short segments so the fade can run
 * along its length — the plane then reads as infinite without needing fog.
 */
function buildGrid(half, step, y) {
  const positions = [];
  const colors = [];
  const push = (x1, z1, x2, z2, major) => {
    const base = major ? STEEL.line : STEEL.dim;
    const a = depthFade(base, Math.hypot(x1, z1) / (half * 1.2));
    const b = depthFade(base, Math.hypot(x2, z2) / (half * 1.2));
    positions.push(x1, y, z1, x2, y, z2);
    colors.push(a.r, a.g, a.b, b.r, b.g, b.b);
  };

  for (let i = -half; i <= half; i += step) {
    const major = Math.abs(i % (step * 4)) < 1e-6;
    for (let s = -half; s < half; s += step) {
      push(i, s, i, s + step, major);
      push(s, i, s + step, i, major);
    }
  }

  return fatLines(positions, { colors, opacity: 0.85, width: 0.8 });
}

/** Wireframe edges of a geometry, in a flat steel tone. */
function wire(geometry, color, opacity) {
  const edges = new THREE.EdgesGeometry(geometry, 18);
  return fatLines(Array.from(edges.attributes.position.array), { color, opacity });
}

/** Solid faceted steel body with its edges traced on top — reads at any size. */
function solid(geometry, color, edgeOpacity) {
  const group = new THREE.Group();
  group.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color, roughness: 0.42, metalness: 0.35, flatShading: true,
    emissive: 0x0b1220, emissiveIntensity: 0.6,
  })));
  const edges = wire(geometry, 0xf2f5fa, edgeOpacity);
  edges.scale.setScalar(1.004);
  group.add(edges);
  return group;
}

/**
 * The camera: a small body plus the frustum it projects. The frustum is the
 * recognisable part, so its near edges get the brightest lines and the far
 * rectangle fades into the scene.
 *
 * Built along +Z on purpose: Object3D.lookAt() points the +Z axis at the target
 * for everything that is not a camera or a light, so a -Z frustum aims backwards.
 */
function buildFrustum(near, far, halfW, halfH) {
  const group = new THREE.Group();

  const corners = (d) => [
    [-halfW * d, -halfH * d, d],
    [halfW * d, -halfH * d, d],
    [halfW * d, halfH * d, d],
    [-halfW * d, halfH * d, d],
  ];
  const n = corners(near);
  const f = corners(far);

  const positions = [];
  const colors = [];
  const seg = (a, b, ca, cb) => {
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    colors.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
  };
  const farTone = depthFade(STEEL.line, 0.3);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    seg(n[i], n[j], STEEL.bright, STEEL.bright);
    seg(f[i], f[j], farTone, farTone);
    seg(n[i], f[i], STEEL.bright, farTone);
  }

  group.add(fatLines(positions, { colors, opacity: 0.9 }));

  // Translucent sides of the view cone, so it reads as a volume even when small
  const cone = [];
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    cone.push(...n[i], ...n[j], ...f[j], ...n[i], ...f[j], ...f[i]);
  }
  const coneGeometry = new THREE.BufferGeometry();
  coneGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cone, 3));
  group.add(new THREE.Mesh(coneGeometry, new THREE.MeshBasicMaterial({
    color: 0x9fb3d1, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthWrite: false,
  })));

  const body = solid(new THREE.BoxGeometry(0.66, 0.48, 0.78), 0x8a9ab3, 0.95);
  body.position.z = -0.4;
  group.add(body);

  const lens = solid(new THREE.CylinderGeometry(0.18, 0.18, 0.22, 16), 0x5b6c86, 0.8);
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 0.08;
  group.add(lens);

  return group;
}

export function initCover3d() {
  const host = document.getElementById('coverHeart');
  if (!host || host.dataset.ready) return;
  host.dataset.ready = '1';
  const w = host.clientWidth || 1200;
  const h = host.clientHeight || 800;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 200);
  camera.position.set(0, 3.9, 12.6);
  camera.lookAt(0, 0.2, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  // Everything sits in one group so the whole scene orbits as a unit.
  const rig = new THREE.Group();
  scene.add(rig);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fc2ff, 1.1);
  rim.position.set(-6, 3, -5);
  scene.add(rim);

  const groundY = -1.6;
  rig.add(buildGrid(16, PREVIEW ? 2 : 1, groundY));

  // Three primitives standing on the grid — the stand-in for scene content.
  const props = [
    { geo: new THREE.BoxGeometry(1.8, 1.8, 1.8), pos: [-3.4, groundY + 0.9, 0.7], tone: 0x7f90aa, opacity: 0.55 },
    { geo: new THREE.IcosahedronGeometry(1.12, 1), pos: [0.2, groundY + 1.12, -1.5], tone: 0x9aabc4, opacity: 0.45 },
    { geo: new THREE.CylinderGeometry(0.66, 0.66, 2.2, 14), pos: [3.4, groundY + 1.1, 1.0], tone: 0x6c7d96, opacity: 0.5 },
  ];
  for (const prop of props) {
    const mesh = solid(prop.geo, prop.tone, prop.opacity);
    mesh.position.set(prop.pos[0], prop.pos[1], prop.pos[2]);
    rig.add(mesh);
  }

  const frustum = buildFrustum(0.8, 4.6, 0.34, 0.22);
  frustum.position.set(-3.9, 2.7, 3.8);
  frustum.updateMatrixWorld();
  frustum.lookAt(-3.2, groundY + 0.8, 0.6);
  rig.add(frustum);

  const setLineResolution = (lw, lh) => lineMaterials.forEach(material => material.resolution.set(lw, lh));
  setLineResolution(w, h);

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const previewCoverMode = new URLSearchParams(window.location.search).get('preview') === 'cover';
  let previewMotionEnabled = !previewCoverMode;
  let t0 = performance.now();
  let motionFrame = 0;
  let returnFrame = 0;

  // A slow yaw sweep rather than a full spin: the grid should never read upside
  // down, and the frustum has to keep pointing into the scene.
  function poseAt(t) {
    return {
      ry: reduce ? -0.2 : Math.sin(t * 0.13) * 0.24 - 0.2,
      rx: reduce ? 0.05 : Math.sin(t * 0.2) * 0.035 + 0.05,
      y: reduce ? 0 : Math.sin(t * 0.46) * 0.07,
    };
  }
  let currentPose = poseAt(0);

  function applyPose(pose) {
    currentPose = pose;
    rig.rotation.y = pose.ry;
    rig.rotation.x = pose.rx;
    rig.position.y = pose.y;
    renderer.render(scene, camera);
  }
  function renderPose(t) {
    applyPose(poseAt(t));
  }
  function lerpPose(from, to, eased) {
    return {
      ry: from.ry + (to.ry - from.ry) * eased,
      rx: from.rx + (to.rx - from.rx) * eased,
      y: from.y + (to.y - from.y) * eased,
    };
  }
  function frame(now) {
    motionFrame = 0;
    if (!previewMotionEnabled && previewCoverMode) return;
    renderPose((now - t0) / 1000);
    if (!reduce && previewMotionEnabled) motionFrame = requestAnimationFrame(frame);
  }
  function startPreviewMotion() {
    if (!previewCoverMode || previewMotionEnabled || reduce) return;
    cancelAnimationFrame(returnFrame);
    returnFrame = 0;
    previewMotionEnabled = true;
    t0 = performance.now();
    if (!motionFrame) motionFrame = requestAnimationFrame(frame);
  }
  function stopPreviewMotion() {
    if (!previewCoverMode) return;
    previewMotionEnabled = false;
    cancelAnimationFrame(motionFrame);
    motionFrame = 0;
    cancelAnimationFrame(returnFrame);
    const from = currentPose;
    const to = poseAt(0);
    const startTime = performance.now();
    const duration = 560;
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      applyPose(lerpPose(from, to, eased));
      if (progress < 1) {
        returnFrame = requestAnimationFrame(tick);
        return;
      }
      returnFrame = 0;
      renderPose(0);
    }
    returnFrame = requestAnimationFrame(tick);
  }

  window.addEventListener('preview-cover-motion-start', startPreviewMotion);
  window.addEventListener('preview-cover-motion-stop', stopPreviewMotion);
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'preview-cover:start') startPreviewMotion();
    if (event.data && event.data.type === 'preview-cover:stop') stopPreviewMotion();
  });

  if (previewCoverMode || reduce) {
    renderPose(0);
  } else {
    motionFrame = requestAnimationFrame(frame);
  }

  function onResize() {
    const nw = host.clientWidth || w;
    const nh = host.clientHeight || h;
    camera.aspect = nw / nh;
    camera.updateProjectionMatrix();
    renderer.setSize(nw, nh);
    setLineResolution(nw, nh);
  }
  window.addEventListener('resize', onResize);
}
