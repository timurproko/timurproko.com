// HUD over the 3D pit: view modes, fleet list, hotspots and a telemetry panel
// styled after the mining platform UI (white cards, indigo accent, live KPIs).

// Touch-only grab handle that expands / collapses the panel (hidden on desktop).
const SHEET_HANDLE = '<button type="button" class="mine-sheet-handle" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg></button>';

const PHASE = {
  empty: { label: 'Returning empty', tone: 'ok' },
  loading: { label: 'Loading at shovel', tone: 'info' },
  loaded: { label: 'Hauling loaded', tone: 'ok' },
  dumping: { label: 'Dumping', tone: 'info' },
};

const POI_COPY = {
  shovel: { text: 'Hydraulic mining excavator loading the fleet on the pit floor. It swings between the dig face and the truck — each one leaves with ~91 t of ore.', stats: [['Bucket', '56 t'], ['Passes', '2'], ['Spot time', '41 s']] },
  'shovel-b': { text: 'Second excavator at the foot of the opposite ramp — a dispatcher balances trucks between both loading units.', stats: [['Bucket', '56 t'], ['Passes', '2'], ['Spot time', '38 s']] },
  crusher: { text: 'Primary crusher on the rim. Loaded trucks climb the ramp and tip here before heading back down empty.', stats: [['Throughput', '4,200 t/h'], ['Queue', '1 truck'], ['Status', 'Running']] },
  stockpile: { text: 'Run-of-mine stockpile served by the second ramp.', stats: [['Today', '38,600 t'], ['Queue', '0 trucks'], ['Status', 'Open']] },
  workshop: { text: 'Where MineCare work orders end up: planners order parts, supervisors assign tasks, technicians close them out.', stats: [['Open WOs', '7'], ['In bay', '2 trucks'], ['Parts ETA', '4 h']] },
  dispatch: { text: 'Dave, the maintenance dispatcher, watches fleet health here on a multi-monitor desk — the seat MineCare 3.0 was designed for.', stats: [['Alerts today', '23'], ['Critical', '1'], ['Avg. response', '3 min']] },
};

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

export function createHud(stage, mine) {
  const hotspots = stage.querySelector('.mine-hotspots');
  // On touch the tabs live just above the stage until it opens full screen (main.js).
  const modes = [...(stage.closest('.mine-hero') || stage).querySelectorAll('[data-mode]')];
  const fleet = stage.querySelector('.mine-fleet-list');
  const panel = stage.querySelector('.mine-panel');
  let selected = null, selectedPoi = null, accepted = false;
  // On touch the panel opens as a peek (just its head) so it does not cover the
  // scene; the chevron handle slides the details up. Desktop always shows it all.
  let sheetOpen = false;

  // Hotspot pills for trucks and points of interest.
  const truckPins = mine.trucks.map(t => {
    const b = el('button', `mine-pin mine-pin-truck${t.alert ? ' is-alert' : ''}`, `<span class="mine-pin-dot"></span>${t.id}`);
    b.type = 'button';
    b.setAttribute('aria-label', `Truck ${t.id}${t.alert ? ' — critical alert' : ''}`);
    b.addEventListener('click', () => selectTruck(t));
    hotspots.append(b);
    return b;
  });
  const poiPins = mine.pois.map(p => {
    const b = el('button', 'mine-pin mine-pin-poi', `<span class="mine-pin-kind">${p.kind}</span>${p.label}`);
    b.type = 'button';
    b.addEventListener('click', () => selectPoi(p));
    hotspots.append(b);
    return b;
  });

  hotspots.addEventListener('pointerover', e => { if (e.target.closest('.mine-pin')) mine.holdRotation(true); });
  hotspots.addEventListener('pointerout', e => { if (e.target.closest('.mine-pin') && !e.relatedTarget?.closest?.('.mine-pin')) mine.holdRotation(false); });

  // Fleet list.
  const rows = mine.trucks.map(t => {
    const row = el('button', 'mine-fleet-row', `
      <span class="mine-status-dot"></span>
      <span class="mine-fleet-id">${t.id}</span>
      <span class="mine-fleet-phase"></span>
      <span class="mine-fleet-speed"></span>`);
    row.type = 'button';
    row.addEventListener('click', () => selectTruck(t));
    fleet.append(row);
    return row;
  });

  modes.forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.mode;
    if (mode !== 'overview' && !selected) selectTruck(mine.trucks[1], { keepView: true });
    selectedPoi = null;
    mine.setMode(mode, { truck: selected });
    syncModes();
  }));

  function syncModes() {
    modes.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mine.view.mode)));
  }

  function selectTruck(t, { keepView = false } = {}) {
    if (selected !== t) sheetOpen = false;
    selected = t;
    selectedPoi = null;
    if (!keepView && mine.view.mode !== 'overview') mine.setMode(mine.view.mode, { truck: t });
    else if (!keepView) mine.setMode('follow', { truck: t });
    syncModes();
    renderTruckPanel();
  }

  function selectPoi(p) {
    selected = null;
    selectedPoi = p;
    sheetOpen = false;
    mine.focusPoi(p);
    syncModes();
    const copy = POI_COPY[p.id];
    panel.innerHTML = `
      ${SHEET_HANDLE}
      <div class="mine-panel-head">
        <div><p class="mine-eyebrow">${p.kind}</p><p class="mine-panel-title">${p.label}</p></div>
        <button type="button" class="mine-close" aria-label="Close">✕</button>
      </div>
      <p class="mine-panel-copy">${copy.text}</p>
      <dl class="mine-kpis mine-kpis-3">${copy.stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
    panel.hidden = false;
    panel.querySelector('.mine-close').addEventListener('click', closePanel);
    mountSheet();
  }

  function mountSheet() {
    const handle = panel.querySelector('.mine-sheet-handle');
    const sync = () => {
      panel.classList.toggle('is-peek', !sheetOpen);
      handle.setAttribute('aria-expanded', String(sheetOpen));
      handle.setAttribute('aria-label', sheetOpen ? 'Hide details' : 'Show details');
      panel.scrollTop = 0;
    };
    handle.addEventListener('click', () => { sheetOpen = !sheetOpen; sync(); });
    sync();
  }

  function closePanel() {
    selected = null;
    selectedPoi = null;
    panel.hidden = true;
    syncModes();
  }

  function renderTruckPanel() {
    const t = selected;
    panel.innerHTML = `
      ${SHEET_HANDLE}
      <div class="mine-panel-head">
        <div>
          <p class="mine-eyebrow">Komatsu HD785-7 · ${t.routeIndex ? 'Ramp B' : 'Ramp A'}</p>
          <p class="mine-panel-title">${t.id} <span class="mine-chip" data-phase></span></p>
          <p class="mine-panel-sub">Operator: ${t.operator}</p>
        </div>
        <button type="button" class="mine-close" aria-label="Close">✕</button>
      </div>
      ${t.alert ? `
      <div class="mine-alert${accepted ? ' is-accepted' : ''}">
        <p class="mine-alert-title">${accepted ? 'Diagnosis in progress' : 'Critical · Oil pressure abnormal'}</p>
        <p class="mine-alert-copy">${accepted
          ? 'Accepted by Dave. Real-time monitoring session attached to the diagnosis; native and custom snapshots ready to compare.'
          : 'Hydraulic oil pressure sensor transmits abnormal values. New critical event every 10 s, grouped under one notification.'}</p>
        ${accepted ? '' : '<div class="mine-alert-actions"><button type="button" data-accept>Accept</button><button type="button" data-snooze>Snooze</button></div>'}
      </div>` : ''}
      <dl class="mine-kpis">
        <div><dt>Speed</dt><dd data-k="speed"></dd></div>
        <div><dt>Payload</dt><dd data-k="payload"></dd></div>
        <div><dt>Engine</dt><dd data-k="engine"></dd></div>
        <div><dt>Oil pressure</dt><dd data-k="oil"></dd></div>
      </dl>
      <div class="mine-chart">
        <div class="mine-chart-head"><span>Oil pressure, kPa</span><span class="mine-chart-legend"><i></i>Actual <i class="is-target"></i>Min 300</span></div>
        <canvas class="mine-spark" width="300" height="72"></canvas>
      </div>
      <div class="mine-views">
        <button type="button" data-go="follow">Follow</button>
        <button type="button" data-go="cab">In-cab</button>
        <button type="button" data-go="bird">Bird's-eye</button>
      </div>`;
    panel.hidden = false;
    panel.querySelector('.mine-close').addEventListener('click', closePanel);
    panel.querySelector('[data-accept]')?.addEventListener('click', () => { accepted = true; renderTruckPanel(); });
    panel.querySelector('[data-snooze]')?.addEventListener('click', () => {
      const alertBox = panel.querySelector('.mine-alert');
      alertBox.querySelector('.mine-alert-title').textContent = 'Snoozed for 15 min';
      alertBox.querySelector('.mine-alert-actions').remove();
    });
    panel.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      mine.setMode(b.dataset.go, { truck: t });
      syncModes();
    }));
    mountSheet();
    updatePanel();
  }

  function updatePanel() {
    const t = selected;
    if (!t || panel.hidden) return;
    const kmh = Math.round(t.speed * 3.6);
    const set = (k, v, warn) => {
      const node = panel.querySelector(`[data-k="${k}"]`);
      if (!node) return;
      node.innerHTML = v;
      node.classList.toggle('is-warn', !!warn);
    };
    set('speed', `${kmh}<small>km/h</small>`);
    set('payload', `${Math.round(t.payload)}<small>/ 91 t</small>`);
    set('engine', `${Math.round(t.engine)}<small>°C</small>`, t.engine > 96);
    set('oil', `${Math.round(t.oil)}<small>kPa</small>`, t.oil < 300);
    const chip = panel.querySelector('[data-phase]');
    if (chip) {
      chip.textContent = PHASE[t.phase].label;
      chip.dataset.tone = PHASE[t.phase].tone;
    }
    drawSpark(panel.querySelector('.mine-spark'), t.history);
  }

  function drawSpark(canvas, data) {
    if (!canvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth || 300, h = canvas.clientHeight || 72;
    if (canvas.width !== w * dpr) { canvas.width = w * dpr; canvas.height = h * dpr; }
    const g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const min = 100, max = 520;
    const y = v => h - 4 - ((v - min) / (max - min)) * (h - 8);
    g.strokeStyle = 'rgba(17,17,40,0.08)';
    g.lineWidth = 1;
    for (const v of [200, 300, 400, 500]) { g.beginPath(); g.moveTo(0, y(v)); g.lineTo(w, y(v)); g.stroke(); }
    g.setLineDash([4, 4]);
    g.strokeStyle = '#f97316';
    g.beginPath(); g.moveTo(0, y(300)); g.lineTo(w, y(300)); g.stroke();
    g.setLineDash([]);
    if (data.length < 2) return;
    const step = w / 89;
    const x0 = w - (data.length - 1) * step;
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(91,79,245,0.28)');
    grad.addColorStop(1, 'rgba(91,79,245,0)');
    g.beginPath();
    data.forEach((v, i) => (i ? g.lineTo(x0 + i * step, y(v)) : g.moveTo(x0, y(v))));
    g.lineTo(w, h); g.lineTo(x0, h); g.closePath();
    g.fillStyle = grad; g.fill();
    g.beginPath();
    data.forEach((v, i) => (i ? g.lineTo(x0 + i * step, y(v)) : g.moveTo(x0, y(v))));
    g.strokeStyle = '#5b4ff5'; g.lineWidth = 1.8; g.stroke();
  }

  function updateFleet() {
    mine.trucks.forEach((t, i) => {
      const row = rows[i];
      row.classList.toggle('is-selected', t === selected);
      row.dataset.tone = t.alert && !accepted ? 'alert' : PHASE[t.phase].tone;
      row.querySelector('.mine-fleet-phase').textContent = t.alert && !accepted ? 'Oil pressure' : PHASE[t.phase].label;
      row.querySelector('.mine-fleet-speed').textContent = `${Math.round(t.speed * 3.6)} km/h`;
    });
  }

  let acc = 0;
  mine.onSelectTruck = t => selectTruck(t);
  const inCab = () => mine.view.mode === 'cab';
  function frame(_, dt) {
    const hideTrucks = inCab();
    mine.trucks.forEach((t, i) => {
      const pin = truckPins[i];
      pin.classList.toggle('is-selected', t === selected);
      pin.classList.toggle('is-alert', t.alert && !accepted);
      if (hideTrucks && t === selected) { pin.style.display = 'none'; return; }
      mine.project(t.root.position, pin, 62);
    });
    const showPois = mine.view.mode === 'overview' || mine.view.mode === 'bird';
    mine.pois.forEach((p, i) => {
      if (!showPois) { poiPins[i].style.display = 'none'; return; }
      poiPins[i].classList.toggle('is-selected', p === selectedPoi);
      mine.project(p.pos, poiPins[i], 40);
    });
    acc += dt;
    if (acc > 0.2) { acc = 0; updateFleet(); updatePanel(); }
  }

  syncModes();
  updateFleet();
  return {
    frame,
    show(id, mode = 'follow') {
      const t = mine.trucks.find(x => x.id === id);
      if (!t) return;
      selected = t;
      mine.setMode(mode, { truck: t });
      syncModes();
      renderTruckPanel();
    },
  };
}
