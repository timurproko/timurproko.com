import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Interactive open pit: the Bingham Canyon terrain (real scale, metres) with a
// fleet of Komatsu HD785-7 haul trucks running spiral ramps between the shovel
// at the pit floor and the crusher on the rim. Haul roads are traced along the
// terrain's own contour lines, so they hug the benches.

const MINE_URL = '/minecare/models/bingham-canyon.glb';
const TRUCK_URL = '/minecare/models/komatsu-hd785.glb';
const EXCAVATOR_URL = '/minecare/models/excavator.glb';
const EXCAVATOR_LENGTH = 20; // m — a large mining excavator, drawn at the same 4× as the trucks

const TRUCK_LENGTH = 10.3;   // real HD785-7 length, m
const TRUCK_EXAGGERATION = 4; // trucks are drawn 4× so they read from the rim
const TIME_SCALE = 6;         // simulation runs 6× real time
const LANE = 17;              // lane offset from the road centre, m
const ROAD_WIDTH = 64;
const ROAD_LIFT = 1.5; // road surface above its graded profile, m

const SPEED_EMPTY = 11.5;  // m/s real (≈41 km/h downhill empty)
const SPEED_LOADED = 4.6;  // m/s real (≈17 km/h uphill loaded)
const LOAD_TIME = 9;       // s (simulated, already scaled)
const DUMP_TIME = 7;

const OPERATORS = ['Jacob Wilson', 'Maria Lopez', 'Dan Becker', 'Ivy Chen', 'Sam Ortega', 'Ruth Hale'];

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export async function createMine(container, { onProgress, onFrame } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.className = 'mine-canvas';
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const sky = new THREE.Color('#c9d6e3');
  scene.background = sky;
  scene.fog = new THREE.Fog(sky, 7000, 17000);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.HemisphereLight('#dfe9f5', '#7a6450', 1.1));
  const sun = new THREE.DirectionalLight('#fff3df', 2.4);
  sun.position.set(-0.6, 1, 0.35);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(42, 1, 5, 40000);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 350;
  controls.maxDistance = 11000;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.25;

  // ---- Load models ----------------------------------------------------------
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const progress = { mine: 0, truck: 0, excavator: 0 };
  const report = () => onProgress?.(progress.mine * 0.25 + progress.truck * 0.5 + progress.excavator * 0.25);
  const load = (url, key) => new Promise((resolve, reject) => loader.load(url, resolve, e => {
    if (e.total) { progress[key] = e.loaded / e.total; report(); }
  }, reject));
  const [mineGltf, truckGltf, excavatorGltf] = await Promise.all([load(MINE_URL, 'mine'), load(TRUCK_URL, 'truck'), load(EXCAVATOR_URL, 'excavator')]);

  const terrain = mineGltf.scene;
  terrain.traverse(o => {
    if (o.isMesh) {
      o.material.toneMapped = false;
      o.material.fog = true;
    }
  });
  scene.add(terrain);
  terrain.updateMatrixWorld(true);

  // ---- Heightmap: rasterise the terrain triangles into a grid --------------
  const hm = buildHeightmap(terrain, 1024);
  const height = hm.sample;

  // Pit floor = the lowest point in the central basin.
  let floor = { x: 0, z: 0, y: Infinity };
  for (let j = 0; j < hm.n; j++) for (let i = 0; i < hm.n; i++) {
    const x = hm.minX + (i + 0.5) * hm.cell, z = hm.minZ + (j + 0.5) * hm.cell;
    if (Math.hypot(x, z) > 3800) continue;
    const y = hm.data[j * hm.n + i];
    if (y < floor.y) floor = { x, z, y };
  }
  const center = new THREE.Vector3(floor.x, floor.y, floor.z);

  // Radius at which a ray from the pit floor first climbs to height h.
  const R_MAX = 3600;
  const contour = (theta, h) => {
    const dx = Math.cos(theta), dz = Math.sin(theta);
    for (let r = 30; r < R_MAX; r += 8) if (height(center.x + dx * r, center.z + dz * r) >= h) return r;
    return R_MAX;
  };
  let rimTop = Infinity;
  for (let a = 0; a < 180; a++) {
    const theta = (a / 180) * Math.PI * 2;
    let top = -Infinity;
    for (let r = 30; r < 3200; r += 20) top = Math.max(top, height(center.x + Math.cos(theta) * r, center.z + Math.sin(theta) * r));
    rimTop = Math.min(rimTop, top);
  }
  const rampTop = center.y + (rimTop - center.y) * 0.92;
  const rimHeight = rimTop;

  // floorLift: how far above the pit floor the ramp ends — a higher value stops it on an upper bench.
  function traceRamp(theta0, turns, dir, floorLift = 22) {
    const samples = 520, pts = [];
    let rs = [];
    for (let k = 0; k <= samples; k++) {
      const t = k / samples;
      const theta = theta0 + dir * t * turns * Math.PI * 2;
      const h = THREE.MathUtils.lerp(rampTop, center.y + floorLift, Math.pow(t, 0.92));
      rs.push({ theta, r: Math.max(90, contour(theta, h) - 18) });
    }
    for (let pass = 0; pass < 6; pass++) {
      rs = rs.map((p, k) => {
        let sum = 0, cnt = 0;
        for (let o = -6; o <= 6; o++) { const q = rs[k + o]; if (q) { sum += q.r; cnt++; } }
        return { theta: p.theta, r: sum / cnt };
      });
    }
    for (const { theta, r } of rs) pts.push(new THREE.Vector2(center.x + Math.cos(theta) * r, center.z + Math.sin(theta) * r));
    // Out over the rim to the crusher, and in across the floor to the shovel.
    const first = pts[0], dirOut = first.clone().sub(new THREE.Vector2(center.x, center.z)).normalize();
    const crusher = first.clone().addScaledVector(dirOut, 520);
    const lead = [];
    for (let k = 8; k >= 1; k--) lead.push(first.clone().lerp(crusher, k / 8));
    const last = pts[pts.length - 1];
    // On the floor the loading point is out in the open; on a bench it carries on along the bench.
    const toC = new THREE.Vector2(center.x, center.z).sub(last);
    const along = last.clone().sub(pts[pts.length - 6]).normalize();
    const shovel = floorLift > 60
      ? last.clone().addScaledVector(along, 140)
      : last.clone().addScaledVector(toC.normalize(), Math.min(140, Math.max(0, last.distanceTo(new THREE.Vector2(center.x, center.z)) - 50)));
    const tail = [];
    for (let k = 1; k <= 5; k++) tail.push(last.clone().lerp(shovel, k / 5));
    return { line: [...lead, ...pts, ...tail], crusher, shovel };
  }

  // Two loading faces: ramp A down to the pit floor, ramp B to a bench higher up.
  const ramps = [traceRamp(0.6, 1.15, 1), traceRamp(0.6 + Math.PI, 0.85, 1, 170)];

  // ---- Haul roads ------------------------------------------------------------
  const roadMatDust = liftTowardsCamera(new THREE.MeshBasicMaterial({ color: '#efe2c8', transparent: true, opacity: 0.6, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  const roadMatHeat = liftTowardsCamera(new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
  // Each haul road is graded: flat across, as high as the highest ground under it, smoothed along.
  const profiles = ramps.map(ramp => gradeRoad(resample(ramp.line, 5), hm.peak));
  const roads = profiles.map((profile, i) => {
    const mesh = new THREE.Mesh(roadGeometry(profile, i), roadMatDust);
    mesh.renderOrder = 2;
    scene.add(mesh);
    return mesh;
  });

  // ---- Truck template --------------------------------------------------------
  const template = prepareTruck(truckGltf.scene);
  const truckScale = (TRUCK_LENGTH * TRUCK_EXAGGERATION) / template.userData.length;
  const shadowTex = radialTexture();

  const routes = ramps.map((ramp, i) => buildRoute(ramp.line, profiles[i]));
  const trucks = [];
  const IDS = ['T-101', 'T-102', 'T-103', 'T-104', 'T-105', 'T-106'];
  IDS.forEach((id, i) => {
    const routeIndex = i % 2;
    const route = routes[routeIndex];
    const root = template.clone(true);
    root.scale.setScalar(truckScale);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.55, toneMapped: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.scale.set(template.userData.width * 1.5, template.userData.length * 1.25, 1);
    shadow.position.y = 0.01;
    root.add(shadow);
    scene.add(root);
    const t = {
      id, index: i, root, route, routeIndex,
      wheels: [], ladle: root.getObjectByName('pivot_ladle'), load: root.getObjectByName('payload-holder'),
      s: (route.length / 3) * Math.floor(i / 2) + (routeIndex ? route.length * 0.17 : 0),
      speed: 0, phase: 'empty', wait: 0, tip: 0, loaded: false,
      quat: new THREE.Quaternion(), operator: OPERATORS[i],
      payload: 0, engine: 86 + Math.random() * 4, oil: 410 + Math.random() * 30, fuel: 62 + Math.random() * 30,
      alert: id === 'T-102', history: [],
    };
    root.traverse(o => { if (o.name.startsWith('pivot_wheel')) t.wheels.push(o); });
    t.loaded = t.s > route.forwardLength;
    t.phase = t.loaded ? 'loaded' : 'empty';
    t.payload = t.loaded ? 88 + Math.random() * 3 : 0;
    trucks.push(t);
  });

  // ---- Excavators: one at the foot of each ramp, facing where trucks spot ------
  const excavatorTemplate = prepareExcavator(excavatorGltf.scene);
  const excavatorScale = (EXCAVATOR_LENGTH * TRUCK_EXAGGERATION) / excavatorTemplate.userData.length;
  const excavators = ramps.map((ramp, i) => {
    const line = ramp.line;
    const approach = ramp.shovel.clone().sub(line[Math.max(0, line.length - 8)]).normalize();
    const at = ramp.shovel.clone().addScaledVector(approach, 48);
    const root = excavatorTemplate.clone(true);
    root.scale.setScalar(excavatorScale);
    root.position.set(at.x, height(at.x, at.y) + 1, at.y);
    root.lookAt(ramp.shovel.x, root.position.y, ramp.shovel.y);
    scene.add(root);
    return { root, upper: root.getObjectByName('pivot_upper'), route: routes[i], swing: Math.PI, phase: i * 1.7 };
  });

  // ---- Points of interest ----------------------------------------------------
  const poiAt = (v2, lift = 0) => new THREE.Vector3(v2.x, height(v2.x, v2.y) + lift, v2.y);
  const workshopDir = ramps[0].crusher.clone().sub(new THREE.Vector2(center.x, center.z)).rotateAround(new THREE.Vector2(), 0.9);
  const workshop = new THREE.Vector2(center.x, center.z).add(workshopDir.multiplyScalar(1.05));
  const dispatchDir = ramps[1].crusher.clone().sub(new THREE.Vector2(center.x, center.z)).rotateAround(new THREE.Vector2(), -0.7);
  const dispatch = new THREE.Vector2(center.x, center.z).add(dispatchDir.multiplyScalar(1.02));
  const pois = [
    { id: 'shovel', label: 'Shovel S-04', kind: 'Loading', pos: excavators[0].root.position.clone().setY(excavators[0].root.position.y + 70) },
    { id: 'shovel-b', label: 'Shovel S-07', kind: 'Loading', pos: excavators[1].root.position.clone().setY(excavators[1].root.position.y + 70) },
    { id: 'crusher', label: 'Crusher C-1', kind: 'Dump', pos: poiAt(ramps[0].crusher, 30) },
    { id: 'stockpile', label: 'Stockpile P-2', kind: 'Dump', pos: poiAt(ramps[1].crusher, 30) },
    { id: 'workshop', label: 'Truck shop', kind: 'Maintenance', pos: poiAt(workshop, 30) },
    { id: 'dispatch', label: 'Dispatch office', kind: 'Control room', pos: poiAt(dispatch, 30) },
  ];
  // Pulsing rings mark each point of interest on the ground.
  const ringGeo = new THREE.RingGeometry(0.82, 1, 48);
  ringGeo.rotateX(-Math.PI / 2);
  const rings = pois.map(p => {
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#6d5efc', transparent: true, opacity: 0.8, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    ring.position.set(p.pos.x, height(p.pos.x, p.pos.z) + 4, p.pos.z);
    ring.renderOrder = 3;
    scene.add(ring);
    return ring;
  });

  // ---- Camera rig ------------------------------------------------------------
  const view = { mode: 'overview', truck: trucks[1], poi: null };
  const cam = { from: new THREE.Vector3(), fromTarget: new THREE.Vector3(), t: 1, dur: 1.6, target: new THREE.Vector3() };
  const look = { yaw: 0, pitch: 0 };
  const birdAlt = { value: 1400 };

  // Home framing: close over the pit floor, looking down the ramps.
  const HOME_DIR = new THREE.Vector3(0.3, 0.78, 0.55).normalize();
  const HOME_DIST = 2700;
  const homeTarget = center.clone().setY(center.y + 80);
  camera.position.copy(homeTarget).addScaledVector(HOME_DIR, HOME_DIST);
  controls.target.copy(homeTarget);
  cam.target.copy(controls.target);

  function desired(out, outTarget) {
    const t = view.truck;
    if (view.mode === 'overview') {
      out.copy(camera.position); outTarget.copy(controls.target);
      return;
    }
    if (view.mode === 'bird') {
      const p = t ? t.root.position : center;
      out.set(p.x + 1, p.y + birdAlt.value, p.z + birdAlt.value * 0.08);
      outTarget.copy(p);
      return;
    }
    const m = t.root.matrixWorld;
    if (view.mode === 'follow') {
      out.set(0, 0.95 * template.userData.length, -1.9 * template.userData.length).applyMatrix4(m);
      out.y = Math.max(out.y, height(out.x, out.z) + 12);
      outTarget.set(0, 0.25 * template.userData.length, 0.9 * template.userData.length).applyMatrix4(m);
      return;
    }
    // In-cab: driver's eye behind the steering wheel, free look with drag.
    const eye = template.userData.eye;
    out.copy(eye).applyMatrix4(m);
    const dir = new THREE.Vector3(Math.sin(look.yaw) * Math.cos(look.pitch), Math.sin(look.pitch) - 0.12, Math.cos(look.yaw) * Math.cos(look.pitch));
    outTarget.copy(eye).add(dir).applyMatrix4(m);
  }

  function setMode(mode, opts = {}) {
    if (opts.truck) view.truck = opts.truck;
    if (mode !== 'overview' && !view.truck) view.truck = trucks[1];
    const prev = view.mode;
    view.mode = mode;
    view.poi = opts.poi || null;
    cam.from.copy(camera.position);
    cam.fromTarget.copy(cam.target);
    cam.t = 0;
    cam.dur = prev === 'cab' || mode === 'cab' ? 1.4 : 1.7;
    look.yaw = 0; look.pitch = 0;
    controls.enabled = false;
    controls.autoRotate = false;
    if (mode === 'overview') {
      // Fly the orbit to a point of interest, or back out to the whole pit.
      const goal = opts.poi ? opts.poi.pos.clone() : homeTarget.clone();
      const dist = opts.poi ? 1300 : HOME_DIST;
      const offset = opts.poi
        ? new THREE.Vector3().subVectors(camera.position, goal).setY(0).normalize().multiplyScalar(dist * 0.75).setY(dist * 0.62)
        : HOME_DIR.clone().multiplyScalar(dist);
      cam.overviewGoal = { pos: goal.clone().add(offset), target: goal };
    }
    container.dataset.view = mode;
  }

  // ---- Interaction -----------------------------------------------------------
  let drag = null;
  renderer.domElement.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw: look.yaw, pitch: look.pitch, moved: false }; });
  window.addEventListener('pointerup', () => { drag = null; });
  renderer.domElement.addEventListener('pointermove', e => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) drag.moved = true;
    if (view.mode === 'cab') {
      look.yaw = THREE.MathUtils.clamp(drag.yaw - (e.clientX - drag.x) * 0.005, -1.9, 1.9);
      look.pitch = THREE.MathUtils.clamp(drag.pitch + (e.clientY - drag.y) * 0.004, -0.6, 0.5);
    }
  });
  // A plain wheel scrolls the page; Ctrl/⌘ + wheel (and trackpad pinch) zooms.
  // Caught on the way down so OrbitControls never sees the plain wheel.
  container.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) e.stopPropagation();
  }, { capture: true });
  renderer.domElement.addEventListener('wheel', e => {
    if (view.mode !== 'bird') return;
    e.preventDefault();
    birdAlt.value = THREE.MathUtils.clamp(birdAlt.value * (1 + Math.sign(e.deltaY) * 0.12), 250, 5000);
  }, { passive: false });
  controls.addEventListener('start', () => { controls.autoRotate = false; api.userMoved = true; });

  // Click a truck in the 3D view to select it.
  const raycaster = new THREE.Raycaster();
  renderer.domElement.addEventListener('click', e => {
    if (drag?.moved) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(trucks.map(t => t.root), true);
    if (hits.length) {
      const hit = trucks.find(t => hits[0].object.parent && isDescendant(hits[0].object, t.root));
      if (hit) api.onSelectTruck?.(hit);
    }
  });

  // ---- Simulation ------------------------------------------------------------
  const tmp = { p: new THREE.Vector3(), f: new THREE.Vector3(), b: new THREE.Vector3(), n: new THREE.Vector3(), x: new THREE.Vector3(), z: new THREE.Vector3(), m: new THREE.Matrix4(), q: new THREE.Quaternion() };
  const halfLen = (TRUCK_LENGTH * TRUCK_EXAGGERATION) / 2;

  function stepTruck(t, dt, time) {
    const r = t.route;
    if (t.wait > 0) {
      t.wait -= dt;
      t.speed = 0;
      if (t.phase === 'loading') t.payload = Math.min(91, t.payload + dt * (91 / LOAD_TIME));
      if (t.phase === 'dumping') {
        t.tip = Math.min(1, t.tip + dt / (DUMP_TIME * 0.4));
        if (t.wait < DUMP_TIME * 0.45) t.payload = Math.max(0, t.payload - dt * 40);
      }
      if (t.wait <= 0) {
        if (t.phase === 'loading') { t.phase = 'loaded'; t.loaded = true; }
        else if (t.phase === 'dumping') { t.phase = 'empty'; t.loaded = false; t.payload = 0; }
      }
    } else {
      const toStop = t.loaded ? r.length - t.s : r.forwardLength - t.s;
      const cruise = (t.loaded ? SPEED_LOADED : SPEED_EMPTY) * (t.alert ? 0.85 : 1);
      const target = cruise * Math.min(1, Math.max(0.12, toStop / 160));
      t.speed += (target - t.speed) * Math.min(1, dt * 1.5);
      const ds = t.speed * TIME_SCALE * dt;
      if (ds >= toStop) {
        t.s = t.loaded ? 0 : r.forwardLength;
        t.speed = 0;
        if (t.loaded) { t.phase = 'dumping'; t.wait = DUMP_TIME; t.tip = 0; }
        else { t.phase = 'loading'; t.wait = LOAD_TIME; }
      } else {
        t.s += ds;
      }
      t.tip = Math.max(0, t.tip - dt * 0.6);
    }

    // Pose: centre, front and rear on the graded road — pitch with the grade, no roll (the road is flat across).
    r.at(t.s, tmp.p);
    r.at(t.s + halfLen, tmp.f);
    r.at(t.s - halfLen, tmp.b);
    tmp.z.subVectors(tmp.f, tmp.b).normalize();
    tmp.n.set(0, 1, 0);
    tmp.x.crossVectors(tmp.n, tmp.z).normalize();
    tmp.n.crossVectors(tmp.z, tmp.x).normalize();
    tmp.m.makeBasis(tmp.x, tmp.n, tmp.z);
    tmp.q.setFromRotationMatrix(tmp.m);
    if (!t.placed) { t.quat.copy(tmp.q); t.placed = true; }
    t.quat.slerp(tmp.q, Math.min(1, dt * 6));
    t.root.quaternion.copy(t.quat);
    // Sit on the road surface (see ROAD_LIFT).
    t.root.position.set(tmp.p.x, Math.max(tmp.p.y, (tmp.f.y + tmp.b.y) / 2) + ROAD_LIFT + 0.4, tmp.p.z);

    const spin = (t.speed * TIME_SCALE * dt) / (template.userData.wheelRadius * truckScale);
    for (const w of t.wheels) w.rotation.x += spin;
    if (t.ladle) t.ladle.rotation.x = -ease(t.tip) * 0.85;
    if (t.load) t.load.visible = t.payload > 4;
    if (t.load) t.load.scale.setScalar(0.4 + 0.6 * Math.min(1, t.payload / 91));

    // Telemetry (simulated).
    const uphill = t.loaded && t.wait <= 0;
    t.engine += ((uphill ? 98 : 86) + Math.sin(time * 0.3 + t.index) * 1.5 - t.engine) * dt * 0.08;
    const oilGoal = t.alert ? 205 + Math.sin(time * 0.9) * 55 + (Math.sin(time * 3.1) > 0.92 ? -70 : 0) : 420 + Math.sin(time * 0.5 + t.index) * 18 + t.speed * 3;
    t.oil += (oilGoal - t.oil) * Math.min(1, dt * 1.6);
    t.fuel = Math.max(8, t.fuel - dt * 0.004 * (uphill ? 3 : 1));
  }

  let lastSample = 0;
  function sampleHistory(time) {
    if (time - lastSample < 0.5) return;
    lastSample = time;
    for (const t of trucks) {
      t.history.push(t.oil);
      if (t.history.length > 90) t.history.shift();
    }
  }

  // ---- Hotspot projection ----------------------------------------------------
  const proj = new THREE.Vector3();
  function project(world, el, lift = 0) {
    proj.copy(world); proj.y += lift;
    proj.project(camera);
    const visible = proj.z < 1 && Math.abs(proj.x) < 1.15 && Math.abs(proj.y) < 1.15;
    el.style.display = visible ? '' : 'none';
    if (!visible) return;
    const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight;
    el.style.transform = `translate(${Math.round(((proj.x + 1) / 2) * w)}px, ${Math.round(((1 - proj.y) / 2) * h)}px)`;
  }

  // ---- Loop ------------------------------------------------------------------
  const clock = new THREE.Clock();
  let running = false, raf = 0, time = 0;

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(container);
  resize();

  const goalPos = new THREE.Vector3(), goalTarget = new THREE.Vector3();
  function frame() {
    raf = requestAnimationFrame(frame);
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.05);
    const camDt = Math.min(raw, 0.25); // camera moves on wall-clock time, even at low frame rates
    time += dt;
    for (const t of trucks) stepTruck(t, dt, time);
    // Excavators swing between the dig face (behind) and the truck being loaded (front);
    // with no truck under the bucket they keep digging with a small swing.
    for (const ex of excavators) {
      const loading = trucks.some(t => t.route === ex.route && t.phase === 'loading');
      const goal = loading
        ? (Math.PI / 2) * (1 - Math.cos(time * 1.3 + ex.phase)) // 0 over the truck, π at the dig face
        : Math.PI + Math.sin(time * 0.5 + ex.phase) * 0.35;
      ex.swing += (goal - ex.swing) * Math.min(1, dt * 2.5);
      if (ex.upper) ex.upper.rotation.y = ex.swing;
    }
    for (const t of trucks) t.root.updateMatrixWorld(true);
    sampleHistory(time);
    const pulse = (time * 0.6) % 1;
    rings.forEach((ring, i) => {
      const s = 60 + 90 * ((pulse + i * 0.17) % 1);
      ring.scale.setScalar(s);
      ring.material.opacity = 0.85 * (1 - ((pulse + i * 0.17) % 1));
    });

    // Camera: ease from where we were to where the current view wants to be.
    if (view.mode === 'overview' && cam.overviewGoal && cam.t < 1) {
      goalPos.copy(cam.overviewGoal.pos); goalTarget.copy(cam.overviewGoal.target);
    } else {
      desired(goalPos, goalTarget);
    }
    if (cam.t < 1) {
      cam.t = Math.min(1, cam.t + camDt / cam.dur);
      const k = ease(cam.t);
      // Arc the flight up over the terrain instead of cutting through it.
      const lift = Math.sin(Math.PI * k) * Math.min(1200, cam.from.distanceTo(goalPos) * 0.35);
      camera.position.lerpVectors(cam.from, goalPos, k).y += lift;
      cam.target.lerpVectors(cam.fromTarget, goalTarget, k);
      camera.lookAt(cam.target);
      if (cam.t === 1 && view.mode === 'overview') {
        controls.target.copy(goalTarget);
        controls.enabled = true;
        cam.overviewGoal = null;
      }
    } else if (view.mode === 'overview') {
      controls.update();
      cam.target.copy(controls.target);
    } else {
      const k = view.mode === 'cab' ? 1 : Math.min(1, camDt * 4);
      camera.position.lerp(goalPos, k);
      cam.target.lerp(goalTarget, k);
      camera.lookAt(cam.target);
    }
    const near = view.mode === 'cab' ? 0.15 : view.mode === 'follow' ? 1 : 5;
    if (camera.near !== near) { camera.near = near; camera.updateProjectionMatrix(); }
    roads.forEach(r => { r.material = view.mode === 'bird' ? roadMatHeat : roadMatDust; });

    onFrame?.(api, dt);
    renderer.render(scene, camera);
  }

  const api = {
    trucks, pois, view, camera, project,
    setMode,
    // Hold the overview's auto-rotate while the pointer is on a hotspot, so it stays put.
    holdRotation(hold) { if (view.mode === 'overview' && controls.enabled) controls.autoRotate = !hold && !api.userMoved; },
    userMoved: false,
    focusPoi(poi) { setMode('overview', { poi }); },
    start() { if (running) return; running = true; clock.getDelta(); frame(); },
    stop() { running = false; cancelAnimationFrame(raf); },
    onSelectTruck: null,
    stats: { rimHeight, depth: rimHeight - center.y },
  };
  setMode('overview');
  cam.t = 0.0;
  cam.from.copy(camera.position).add(new THREE.Vector3(1500, 2500, 1500));
  cam.fromTarget.copy(controls.target);
  return api;
}

// ---- Helpers ---------------------------------------------------------------

function isDescendant(obj, root) {
  for (let o = obj; o; o = o.parent) if (o === root) return true;
  return false;
}

function buildHeightmap(root, n) {
  const box = new THREE.Box3().setFromObject(root);
  const minX = box.min.x, minZ = box.min.z;
  const cell = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / n;
  const data = new Float32Array(n * n).fill(-Infinity);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    const pos = mesh.geometry.attributes.position, index = mesh.geometry.index;
    const count = index ? index.count : pos.count;
    const world = new Float32Array(pos.count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      world[i * 3] = (v.x - minX) / cell - 0.5; world[i * 3 + 1] = v.y; world[i * 3 + 2] = (v.z - minZ) / cell - 0.5;
    }
    for (let k = 0; k < count; k += 3) {
      const ia = index ? index.getX(k) : k, ib = index ? index.getX(k + 1) : k + 1, ic = index ? index.getX(k + 2) : k + 2;
      a.set(world[ia * 3], world[ia * 3 + 1], world[ia * 3 + 2]);
      b.set(world[ib * 3], world[ib * 3 + 1], world[ib * 3 + 2]);
      c.set(world[ic * 3], world[ic * 3 + 1], world[ic * 3 + 2]);
      const x0 = Math.max(0, Math.ceil(Math.min(a.x, b.x, c.x))), x1 = Math.min(n - 1, Math.floor(Math.max(a.x, b.x, c.x)));
      const z0 = Math.max(0, Math.ceil(Math.min(a.z, b.z, c.z))), z1 = Math.min(n - 1, Math.floor(Math.max(a.z, b.z, c.z)));
      const d = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z);
      if (Math.abs(d) < 1e-9) continue;
      for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
        const w1 = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / d;
        const w2 = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / d;
        const w3 = 1 - w1 - w2;
        if (w1 < -1e-4 || w2 < -1e-4 || w3 < -1e-4) continue;
        const y = w1 * a.y + w2 * b.y + w3 * c.y;
        const idx = z * n + x;
        if (y > data[idx]) data[idx] = y;
      }
    }
  });
  // Fill any holes from their neighbours.
  for (let pass = 0; pass < 8; pass++) {
    let holes = 0;
    for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) {
      const idx = z * n + x;
      if (data[idx] !== -Infinity) continue;
      let sum = 0, cnt = 0;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x + dx, zz = z + dz;
        if (xx < 0 || zz < 0 || xx >= n || zz >= n) continue;
        const h = data[zz * n + xx];
        if (h !== -Infinity) { sum += h; cnt++; }
      }
      if (cnt) data[idx] = sum / cnt; else holes++;
    }
    if (!holes) break;
  }
  for (let i = 0; i < data.length; i++) if (data[i] === -Infinity) data[i] = 0;

  const sample = (x, z) => {
    const gx = THREE.MathUtils.clamp((x - minX) / cell - 0.5, 0, n - 1.001);
    const gz = THREE.MathUtils.clamp((z - minZ) / cell - 0.5, 0, n - 1.001);
    const ix = Math.floor(gx), iz = Math.floor(gz), fx = gx - ix, fz = gz - iz;
    const h00 = data[iz * n + ix], h10 = data[iz * n + ix + 1], h01 = data[(iz + 1) * n + ix], h11 = data[(iz + 1) * n + ix + 1];
    return (h00 * (1 - fx) + h10 * fx) * (1 - fz) + (h01 * (1 - fx) + h11 * fx) * fz;
  };
  const peak = (x, z) => {
    const gx = THREE.MathUtils.clamp((x - minX) / cell - 0.5, 0, n - 1.001);
    const gz = THREE.MathUtils.clamp((z - minZ) / cell - 0.5, 0, n - 1.001);
    const ix = Math.floor(gx), iz = Math.floor(gz);
    return Math.max(data[iz * n + ix], data[iz * n + ix + 1], data[(iz + 1) * n + ix], data[(iz + 1) * n + ix + 1]);
  };
  return { data, n, minX, minZ, cell, sample, peak };
}

// Even spacing along a 2D polyline.
function resample(line, step) {
  const out = [line[0].clone()];
  let carry = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i];
    const len = a.distanceTo(b);
    let d = step - carry;
    while (d <= len) { out.push(a.clone().lerp(b, d / len)); d += step; }
    carry = len - (d - step);
  }
  out.push(line[line.length - 1].clone());
  return out;
}

function smoothClosed(pts, passes, win) {
  let cur = pts;
  for (let p = 0; p < passes; p++) {
    cur = cur.map((_, i) => {
      const acc = new THREE.Vector2();
      for (let o = -win; o <= win; o++) acc.add(cur[(i + o + cur.length) % cur.length]);
      return acc.divideScalar(win * 2 + 1);
    });
  }
  return cur;
}

// A closed loop: down the ramp in the right-hand lane, back up in the other.
function buildRoute(line, profile) {
  const base = resample(line, 6);
  const offset = (pts) => pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const d = b.clone().sub(a).normalize();
    return p.clone().add(new THREE.Vector2(-d.y, d.x).multiplyScalar(LANE));
  });
  const fwd = offset(base);
  const back = offset(base.slice().reverse());
  const loop = smoothClosed(resample([...fwd, ...back, fwd[0]], 4), 3, 4);
  const cum = [0];
  for (let i = 1; i <= loop.length; i++) cum.push(cum[i - 1] + loop[i - 1].distanceTo(loop[i % loop.length]));
  const length = cum[loop.length];
  // Forward half ends where the lane turns back at the shovel.
  let forwardLength = 0, best = Infinity;
  const shovel = line[line.length - 1];
  for (let i = 0; i < loop.length; i++) {
    const d = loop[i].distanceTo(shovel);
    if (d < best) { best = d; forwardLength = cum[i]; }
  }
  // Height of each loop point = the graded road at the nearest station.
  const heights = loop.map(p => {
    let best = Infinity, h = 0;
    for (const q of profile) {
      const d = (q.x - p.x) ** 2 + (q.z - p.y) ** 2;
      if (d < best) { best = d; h = q.y; }
    }
    return h;
  });
  let hint = 0;
  const at = (s, out) => {
    s = ((s % length) + length) % length;
    // Walk from the last lookup — trucks move a little each frame.
    let i = hint;
    if (cum[i] > s || cum[i + 1] < s) {
      let lo = 0, hi = loop.length;
      while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (cum[mid] <= s) lo = mid; else hi = mid; }
      i = lo;
    }
    hint = i;
    const a = loop[i], b = loop[(i + 1) % loop.length];
    const f = (s - cum[i]) / Math.max(1e-6, cum[i + 1] - cum[i]);
    const ha = heights[i], hb = heights[(i + 1) % loop.length];
    return out.set(a.x + (b.x - a.x) * f, ha + (hb - ha) * f, a.y + (b.y - a.y) * f);
  };
  return { at, length, forwardLength };
}

// Stations along a road centreline, each at the highest ground across the road's
// width, then smoothed along it (never dropping below that ground).
function gradeRoad(pts, peak) {
  const raw = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const d = b.clone().sub(a).normalize();
    const nx = -d.y, nz = d.x;
    let h = -Infinity;
    for (let k = -4; k <= 4; k++) {
      const o = (k / 4) * (ROAD_WIDTH / 2 + 4);
      h = Math.max(h, peak(p.x + nx * o, p.y + nz * o));
    }
    return { x: p.x, z: p.y, nx, nz, y: h };
  });
  const win = (arr, i, r, fn) => { let acc = fn === 'max' ? -Infinity : 0, n = 0; for (let o = -r; o <= r; o++) { const v = arr[i + o]; if (v === undefined) continue; acc = fn === 'max' ? Math.max(acc, v) : acc + v; n++; } return fn === 'max' ? acc : acc / n; };
  const base = raw.map(q => q.y);
  const crest = base.map((_, i) => win(base, i, 3, 'max'));
  const smooth = crest.map((_, i) => win(crest, i, 6, 'avg'));
  return raw.map((q, i) => ({ ...q, y: Math.max(smooth[i], base[i]) }));
}

function roadGeometry(profile, seed) {
  const pts = profile;
  const positions = [], colors = [], indices = [];
  const heat = [new THREE.Color('#22c55e'), new THREE.Color('#facc15'), new THREE.Color('#f97316'), new THREE.Color('#ef4444')];
  const col = new THREE.Color();
  pts.forEach((p, i) => {
    for (const side of [-1, 1]) {
      positions.push(p.x + p.nx * side * ROAD_WIDTH / 2, p.y + ROAD_LIFT, p.z + p.nz * side * ROAD_WIDTH / 2);
    }
    // Road-quality style heat along the ramp (like the grader report).
    const v = 0.5 + 0.5 * Math.sin(i * 0.0225 + seed * 2.1) * Math.cos(i * 0.0065 + seed);
    const k = Math.min(heat.length - 1.001, Math.max(0, v * (heat.length - 1)));
    col.copy(heat[Math.floor(k)]).lerp(heat[Math.floor(k) + 1], k % 1);
    colors.push(col.r, col.g, col.b, col.r, col.g, col.b);
    if (i) { const o = (i - 1) * 2; indices.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(indices);
  return g;
}

// Pull a surface towards the camera in view space so it never sinks into the
// terrain (polygonOffset does nothing with a logarithmic depth buffer).
function liftTowardsCamera(material) {
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
      vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
      float camDist = length( mvPosition.xyz );
      // Small lift close up (stays under the tyres), more from far away.
      mvPosition.xyz -= normalize( mvPosition.xyz ) * ( 0.3 + camDist * 0.01 );
      gl_Position = projectionMatrix * mvPosition;`);
  };
  return material;
}

function radialTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,0.9)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Normalise the truck: front faces +Z, wheels and the dump body get their own
// pivots so they can spin and tip, and a driver's-eye point is found in the cab.
// Normalise the excavator: boom faces +Z, tracks on the ground, and the upper
// structure (cab, boom, bucket) gets a pivot over the tracks so it can swing.
function prepareExcavator(model) {
  const root = new THREE.Group();
  const oriented = new THREE.Group();
  oriented.add(model);
  root.add(oriented);
  const lower = [], upper = [];
  model.traverse(o => {
    if (o.isMesh) (/chassis|track/i.test(o.material?.name || '') ? lower : upper).push(o);
  });
  const boxOf = list => list.reduce((box, o) => box.expandByObject(o), new THREE.Box3());
  root.updateMatrixWorld(true);
  const hub = boxOf(lower.length ? lower : upper).getCenter(new THREE.Vector3());
  const all = new THREE.Box3().setFromObject(model);
  const size = all.getSize(new THREE.Vector3()), mid = all.getCenter(new THREE.Vector3());
  // The boom reaches out on the long side, past the tracks; point it along +Z.
  const alongZ = size.z >= size.x;
  const sign = alongZ ? Math.sign(mid.z - hub.z) || 1 : Math.sign(mid.x - hub.x) || 1;
  oriented.rotation.y = alongZ ? (sign > 0 ? 0 : Math.PI) : (sign > 0 ? -Math.PI / 2 : Math.PI / 2);
  root.updateMatrixWorld(true);
  const hub2 = boxOf(lower.length ? lower : upper).getCenter(new THREE.Vector3());
  oriented.position.set(-hub2.x, -new THREE.Box3().setFromObject(model).min.y, -hub2.z);
  root.updateMatrixWorld(true);
  const pivot = new THREE.Group();
  pivot.name = 'pivot_upper';
  root.add(pivot);
  pivot.updateMatrixWorld(true);
  upper.forEach(o => pivot.attach(o));
  const fsize = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
  root.userData = { length: Math.max(fsize.x, fsize.z) };
  return root;
}

function prepareTruck(model) {
  const root = new THREE.Group();
  const oriented = new THREE.Group();
  oriented.add(model);
  root.add(oriented);
  root.updateMatrixWorld(true);

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()), mid = box.getCenter(new THREE.Vector3());
  const cabin = model.getObjectByName('Cabine') || model.getObjectByName('Cabin');
  const cabMid = cabin ? new THREE.Box3().setFromObject(cabin).getCenter(new THREE.Vector3()) : mid;
  const alongZ = size.z >= size.x;
  const sign = alongZ ? Math.sign(cabMid.z - mid.z) || 1 : Math.sign(cabMid.x - mid.x) || 1;
  oriented.rotation.y = alongZ ? (sign > 0 ? 0 : Math.PI) : (sign > 0 ? -Math.PI / 2 : Math.PI / 2);
  root.updateMatrixWorld(true);
  // Centre on the ground under the body.
  const b2 = new THREE.Box3().setFromObject(model);
  const c2 = b2.getCenter(new THREE.Vector3());
  oriented.position.set(-c2.x, -b2.min.y, -c2.z);
  root.updateMatrixWorld(true);
  const final = new THREE.Box3().setFromObject(model);
  const fsize = final.getSize(new THREE.Vector3());

  model.traverse(o => {
    if (!o.isMesh) return;
    const name = o.material?.name || '';
    if (name === 'GlassMat') { o.material.transparent = true; o.material.opacity = 0.18; o.material.depthWrite = false; }
    if (/Cabin|Inter|Dashboard/.test(name)) o.material.side = THREE.DoubleSide;
  });

  const pivot = (node, name, at) => {
    const p = new THREE.Group();
    p.name = name;
    p.position.copy(at);
    root.add(p);
    p.updateMatrixWorld(true);
    p.attach(node);
    return p;
  };

  let wheelRadius = fsize.y * 0.25;
  const wheels = model.getObjectByName('Wheels');
  const wheelNodes = wheels ? [...wheels.children] : [];
  wheelNodes.forEach((w, i) => {
    const wb = new THREE.Box3().setFromObject(w);
    wheelRadius = (wb.max.y - wb.min.y) / 2;
    pivot(w, `pivot_wheel_${i}`, wb.getCenter(new THREE.Vector3()));
  });

  const ladle = model.getObjectByName('Ladle');
  if (ladle) {
    const lb = new THREE.Box3().setFromObject(ladle);
    const hinge = new THREE.Vector3((lb.min.x + lb.max.x) / 2, lb.min.y + (lb.max.y - lb.min.y) * 0.12, lb.min.z + (lb.max.z - lb.min.z) * 0.06);
    const p = pivot(ladle, 'pivot_ladle', hinge);
    // Ore heaped in the body while loaded.
    const ore = new THREE.Mesh(
      new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#8a6a4c', roughness: 1, flatShading: true }),
    );
    ore.name = 'payload';
    const ls = lb.getSize(new THREE.Vector3());
    const holder = new THREE.Group();
    holder.position.set(0, ls.y * 0.42, ls.z * 0.42);
    ore.scale.set(ls.x * 0.4, ls.y * 0.38, ls.z * 0.36);
    holder.add(ore);
    holder.name = 'payload-holder';
    holder.visible = false;
    p.add(holder);
  }

  // Driver's eye: just behind and above the steering wheel.
  const wheel = model.getObjectByName('Steering_wheel');
  const eye = new THREE.Vector3();
  if (wheel) {
    const wb = new THREE.Box3().setFromObject(wheel);
    wb.getCenter(eye);
    eye.y = wb.max.y + fsize.y * 0.06;
    eye.z -= fsize.z * 0.06;
  } else {
    eye.set(fsize.x * 0.2, fsize.y * 0.8, fsize.z * 0.3);
  }

  root.userData = { length: fsize.z, width: fsize.x, height: fsize.y, wheelRadius, eye };
  return root;
}
