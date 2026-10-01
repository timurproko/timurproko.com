import { renderGallery } from '../case/gallery.js';
import { setupZoom } from '../case/lightbox.js';
import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import coverImage from './cover.webp';

// Drop numbered files into src/minecare/images/ — 01 is the hero, the rest form the thumbnail strip.
const images = import.meta.glob('./images/*.{jpg,jpeg,png,webp,avif,gif,mp4,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});
renderGallery(images, document.getElementById('gallery'), { pair: false });
setupCover(coverImage);
setupZoom(document.querySelector('article'));
setupFooterYear();

// ---- 3D pit: loads when the section comes near the viewport --------------------
const stage = document.querySelector('[data-mine]');
let hud = null;
let pendingTruck = null;

if (stage && !document.documentElement.classList.contains('preview-cover')) {
  const loaderBar = stage.querySelector('.mine-loader-bar');
  const loaderLabel = stage.querySelector('.mine-loader-label');
  let mine = null;
  let visible = false;

  const boot = async () => {
    try {
      const [{ createMine }, { createHud }] = await Promise.all([import('./mine3d.js'), import('./mine-hud.js')]);
      mine = await createMine(stage, {
        onProgress: p => { loaderBar.style.width = `${Math.round(p * 100)}%`; },
        onFrame: (api, dt) => hud?.frame(api, dt),
      });
      hud = createHud(stage, mine);
      stage.classList.add('is-ready');
      if (pendingTruck) hud.show(pendingTruck);
      if (visible) mine.start();
    } catch (error) {
      console.error(error);
      loaderLabel.textContent = 'The 3D pit could not load on this device.';
      stage.classList.add('is-failed');
    }
  };

  let booted = false;
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !booted) { booted = true; boot(); }
  }, { rootMargin: '600px 0px' }).observe(stage);

  // Render only while on screen and the tab is visible.
  const sync = () => {
    if (!mine) return;
    if (visible && !document.hidden) mine.start(); else mine.stop();
  };
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(stage);
  document.addEventListener('visibilitychange', sync);
}

// Scenario: jump to the truck with the alert.
document.querySelectorAll('[data-show-truck]').forEach(button => button.addEventListener('click', () => {
  stage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (hud) hud.show(button.dataset.showTruck); else pendingTruck = button.dataset.showTruck;
}));

// ---- Navigation model: hover or tap a screen -------------------------------------
document.querySelectorAll('[data-nav-model]').forEach(model => {
  const screens = [...model.querySelectorAll('.nav-screen')];
  const copy = [...model.querySelectorAll('.nav-copy li')];
  const select = id => {
    screens.forEach(s => s.classList.toggle('is-active', s.dataset.screen === id));
    copy.forEach(c => c.classList.toggle('is-active', c.dataset.screen === id));
  };
  screens.forEach(s => {
    s.addEventListener('mouseenter', () => select(s.dataset.screen));
    s.addEventListener('focus', () => select(s.dataset.screen));
    s.addEventListener('click', () => select(s.dataset.screen));
  });
  copy.forEach(c => c.addEventListener('mouseenter', () => select(c.dataset.screen)));
  select('dashboard');
});

// ---- User journey -------------------------------------------------------------
const ROLE = {
  SYS: 'System', MD: 'Maintenance Dispatcher', MP: 'Maintenance Planner', S: 'Supervisor', MT: 'Maintenance Technician',
};
const JOURNEY = [
  { title: 'Receive OEM event', role: 'SYS', items: ['An on-board system reports a sensor event', 'Event processing logic creates or updates a notification', 'All new events are grouped under that notification'] },
  { title: 'Pre-configured actions', role: 'SYS', items: ['Send a text or email', 'Create a work order', 'Start real-time monitoring', 'Show the notification'] },
  { title: 'Perform diagnosis', role: 'MD', items: ['Launch RTM and attach it to the diagnosis', 'Attach trending charts', 'Load and attach oil analysis data', 'Verify and compare snapshots, also against live RTM', 'Check historical events and their diagnoses', 'Open the diagnostics guide'] },
  { title: 'Diagnosis concluded', role: 'MD', items: ['Enter the diagnosis report and attachments', 'Associate failure modes, system and subsystem', 'Enter root causes and the event source', 'Every change lands in an audit log'] },
  { title: 'Create work order', role: 'MD', items: ['Create the work order', 'Create multiple tasks and add comments'] },
  { title: 'Plan & assign', role: 'MP', alt: 'S', items: ['Planner identifies the parts required', 'Verifies availability and orders them', 'Supervisor assigns tasks and adds comments'] },
  { title: 'Fix the truck', role: 'MT', items: ['Technician completes the tasks', 'Adds comments for the record'] },
  { title: 'Close', role: 'MD', items: ['Complete the work order and the notification'] },
];

document.querySelectorAll('[data-journey]').forEach(root => {
  const list = root.querySelector('.journey-steps');
  const detail = root.querySelector('.journey-detail');
  const buttons = JOURNEY.map((step, i) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.role = step.role;
    b.innerHTML = `<span class="journey-n">${String(i + 1).padStart(2, '0')}</span><span class="journey-t">${step.title}</span><span class="journey-roles">${[step.role, step.alt].filter(Boolean).map(r => `<span class="journey-r" data-role="${r}">${r === 'SYS' ? 'System' : r}</span>`).join('')}</span>`;
    b.addEventListener('click', () => select(i));
    li.append(b);
    list.append(li);
    return b;
  });
  function select(i) {
    const step = JOURNEY[i];
    buttons.forEach((b, k) => {
      b.setAttribute('aria-selected', String(k === i));
      b.classList.toggle('is-done', k < i);
    });
    const who = [ROLE[step.role], step.alt && ROLE[step.alt]].filter(Boolean).join(' & ');
    detail.innerHTML = `
      <p class="journey-who">${[step.role, step.alt].filter(Boolean).map(r => `<span class="persona-badge" data-role="${r}">${r === 'SYS' ? '⚙' : r}</span>`).join('')}${step.role === 'SYS' ? 'Performed by the system' : 'Performed by ' + who}</p>
      <p class="journey-title">${step.title}</p>
      <ul class="points">${step.items.map(t => `<li>${t}</li>`).join('')}</ul>`;
  }
  select(0);
});

// ---- Information architecture ---------------------------------------------------
const IA = [
  { id: '1.0', name: 'Event Handling', items: [
    ['1.1', 'Event configuration', ['MD'], 3, 'Snapshot · parameters · SMS/email'],
    ['1.2', 'Event triggering', ['MD'], 2, 'Event details · history'],
    ['1.3', 'Real-time monitoring', ['MD'], 1, 'RTM session'],
    ['1.4', 'Work order creation', ['MD'], 2, 'Work order · list'],
    ['1.5', 'Spare parts order', ['MP'], 1, ''],
    ['1.6', "Supervisor's activity", ['S'], 2, "Technicians' workload · assign"],
    ['1.7', 'Receiving work order', ['MT'], 1, ''],
    ['1.8', 'Monitoring request config', ['MD'], 1, ''],
  ] },
  { id: '2.0', name: 'Real-Time Monitoring', items: [
    ['2.1', 'Parameter request config', ['RE'], 1, ''],
    ['2.2', 'Historic monitoring data', ['MD', 'MT'], 1, ''],
    ['2.3', 'Parameter data gathering', ['MT'], 2, 'Configure · view'],
  ] },
  { id: '3.0', name: 'Reliability', items: [
    ['3.1', 'FMEA configuration', ['RE'], 3, 'System · worksheet · detection logic'],
    ['3.2', 'FMEA monitoring', ['RE', 'MD'], 2, 'Dashboard · FM details'],
    ['3.3', 'Historic events', ['RE'], 2, 'History · associate with FMEA'],
  ] },
  { id: '4.0', name: 'Trending', items: [
    ['4.1', 'Data capturing config', ['RE'], 1, ''],
    ['4.2', 'Monitoring collected data', ['RE'], 1, ''],
    ['4.3', 'Trending categories', ['RE'], 1, ''],
    ['4.4', 'Historical trends', ['RE'], 1, ''],
  ] },
  { id: '5.0', name: 'Time Tracking', items: [
    ['5.1', 'Equipment status', ['RE', 'MD'], 2, 'Dashboard · equipment details'],
    ['5.2', 'Reports', ['RE'], 3, 'Create · details · history'],
    ['5.3', 'Performance loss criteria', ['RE'], 1, ''],
    ['5.4', 'Performance loss monitoring', ['RE'], 1, ''],
    ['5.5', 'Standard task', ['MP'], 1, ''],
    ['5.6', 'Task template', ['MD'], 1, 'Based on a standard task'],
  ] },
];

document.querySelectorAll('[data-ia]').forEach(root => {
  const wrap = root.querySelector('.ia-modules');
  IA.forEach(mod => {
    const col = document.createElement('div');
    col.className = 'ia-module';
    col.innerHTML = `<p class="ia-module-head"><span>${mod.id}</span>${mod.name}</p>`;
    mod.items.forEach(([id, name, roles, count, sub]) => {
      const node = document.createElement('div');
      node.className = 'ia-node';
      node.dataset.roles = roles.join(' ');
      node.title = [sub, `${count} screen${count > 1 ? 's' : ''}`].filter(Boolean).join(' · ');
      node.innerHTML = `
        <span class="ia-node-top"><span class="ia-id">${id}</span><span class="ia-badges">${roles.map(r => `<span class="persona-badge" data-role="${r}">${r}</span>`).join('')}</span></span>
        <span class="ia-name">${name}</span>
        ${sub ? `<span class="ia-sub">${sub}</span>` : ''}
        <span class="ia-count">${count} screen${count > 1 ? 's' : ''}</span>`;
      col.append(node);
    });
    wrap.append(col);
  });
  const buttons = [...root.querySelectorAll('[data-role]')].filter(b => b.tagName === 'BUTTON');
  buttons.forEach(b => b.addEventListener('click', () => {
    const role = b.dataset.role;
    buttons.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    root.classList.toggle('is-filtered', role !== 'all');
    root.querySelectorAll('.ia-node').forEach(n => n.classList.toggle('is-match', role !== 'all' && n.dataset.roles.split(' ').includes(role)));
  }));
});

// ---- Snapshot wizard (states 3.2 → 3.4) --------------------------------------------
const PARAMS = [
  ['84082690', 'Brake Stroke'],
  ['84082692', 'Transmission Charge Filter'],
  ['84082694', 'Torque Converter Filter'],
  ['84082696', 'Hoist Screen'],
  ['84082698', 'Brake Temperature'],
  ['84082700', 'Aftercooler Temperature'],
  ['84082702', 'Hydraulic Oil Pressure'],
  ['84082704', 'Engine Coolant Temperature'],
];

document.querySelectorAll('[data-wizard]').forEach(root => {
  const q = s => root.querySelector(s);
  const panes = [...root.querySelectorAll('[data-pane]')];
  const steps = [...root.querySelectorAll('.wizard-steps li')];
  const next = q('[data-next]'), back = q('[data-back]'), reset = q('[data-reset]');
  const before = q('[data-before]'), after = q('[data-after]');
  const selected = new Set(['84082702']);
  let step = 1;

  const timeline = () => {
    q('[data-before-out]').textContent = before.value;
    q('[data-after-out]').textContent = after.value;
    const total = Number(before.value) + Number(after.value);
    q('.wizard-tl-before').style.flexGrow = before.value / total;
    q('.wizard-tl-after').style.flexGrow = after.value / total;
  };
  before.addEventListener('input', timeline);
  after.addEventListener('input', timeline);
  timeline();

  const list = q('[data-params]'), chosen = q('[data-selected]');
  const renderParams = () => {
    const term = q('[data-search]').value.trim().toLowerCase();
    list.innerHTML = PARAMS.filter(([id, name]) => !term || name.toLowerCase().includes(term) || id.includes(term)).map(([id, name]) => `
      <li><label><input type="checkbox" value="${id}" ${selected.has(id) ? 'checked' : ''} /><span class="wizard-pid">${id}</span>${name}</label></li>`).join('') || '<li class="wizard-empty">No parameters match</li>';
    chosen.innerHTML = [...selected].map(id => `<li><span class="wizard-pid">${id}</span>${PARAMS.find(p => p[0] === id)[1]}</li>`).join('');
    q('[data-count-selected]').textContent = selected.size;
    if (step === 2) next.disabled = selected.size === 0;
  };
  list.addEventListener('change', e => {
    if (e.target.checked) selected.add(e.target.value); else selected.delete(e.target.value);
    renderParams();
  });
  q('[data-search]').addEventListener('input', renderParams);
  renderParams();

  function go(n) {
    step = n;
    panes.forEach(p => { p.hidden = Number(p.dataset.pane) !== n; });
    steps.forEach(s => {
      const k = Number(s.dataset.step);
      s.classList.toggle('is-current', k === n);
      s.classList.toggle('is-done', k < n);
    });
    back.hidden = n !== 2;
    reset.hidden = n !== 3;
    next.hidden = n === 3;
    next.textContent = n === 1 ? 'Next step' : 'Create & Attach';
    next.disabled = n === 1 ? !q('[data-name]').value.trim() : selected.size === 0;
    if (n === 3) {
      const sampling = root.querySelector('input[name="sampling"]:checked').value;
      q('[data-summary-title]').textContent = `${q('[data-name]').value.trim()} attached`;
      q('[data-summary]').textContent = `${selected.size} parameter${selected.size > 1 ? 's' : ''} · ${before.value} s before and ${after.value} s after the event · sampled every ${sampling} s.`;
    }
  }
  q('[data-name]').addEventListener('input', () => { if (step === 1) next.disabled = !q('[data-name]').value.trim(); });
  next.addEventListener('click', () => go(step + 1));
  back.addEventListener('click', () => go(1));
  reset.addEventListener('click', () => go(1));
  go(1);
});

// ---- Personas: list on the left, the selected profile on the right ---------------
const CAST = {
  mike: { name: 'Mike', role: 'Supervisor', code: 'S', lede: 'Owns an area of the mine. When a diagnosis turns into a work order, it lands with the supervisor responsible for that area.', does: ['Views technicians’ workload', 'Assigns work order tasks to technicians', 'Adds comments for the dispatcher'], journey: 'Step 06 — Plan & assign', owns: ['1.6 Supervisor’s activity'] },
  john: { name: 'John', role: 'Maintenance Planner', code: 'MP', lede: 'Turns a diagnosis into work that can actually be done — the right parts, in stock, at the right shop.', does: ['Identifies the parts required', 'Verifies availability and orders them', 'Creates standard tasks for repeat jobs'], journey: 'Step 06 — Plan & assign', owns: ['1.5 Spare parts order', '5.5 Standard task'] },
  peter: { name: 'Peter', role: 'Maintenance Technician', code: 'MT', lede: 'Works in the truck shop and out on the haul road. Receives work orders and closes them with a record of what was done.', does: ['Receives and completes work order tasks', 'Gathers parameter data from the machine', 'Reviews historic monitoring data'], journey: 'Step 07 — Fix the truck', owns: ['1.7 Receiving work order', '2.2 Historic monitoring data', '2.3 Parameter data gathering'] },
  samuel: { name: 'Samuel', role: 'Reliability Engineer', code: 'RE', lede: 'Looks past the single failure to the pattern behind it — configuring FMEA, trends and performance-loss criteria so it doesn’t happen again.', does: ['Configures FMEA worksheets and detection logic', 'Builds trending categories and historical trends', 'Defines and monitors performance loss'], journey: 'Configuration behind every step', owns: ['2.1 Parameter requests', '3.x Reliability (FMEA)', '4.x Trending', '5.1–5.4 Time tracking'] },
};

document.querySelectorAll('[data-cast]').forEach(root => {
  const detail = root.querySelector('.cast-detail');
  const tabs = [...root.querySelectorAll('[data-persona]')];
  const dave = detail.querySelector('[data-pane-persona="dave"]');
  const other = document.createElement('div');
  other.className = 'cast-pane';
  other.hidden = true;
  detail.append(other);
  const select = id => {
    tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.persona === id)));
    dave.hidden = id !== 'dave';
    other.hidden = id === 'dave';
    if (id !== 'dave') {
      const p = CAST[id];
      other.innerHTML = `
        <h3 class="cast-title">${p.name}, ${p.role}</h3>
        <p class="cast-lede">${p.lede}</p>
        <div class="cast-grid">
          <div><p class="cast-h">In MineCare</p><ul class="points">${p.does.map(d => `<li>${d}</li>`).join('')}</ul></div>
          <div><p class="cast-h">Owns</p><ul class="points">${p.owns.map(d => `<li>${d}</li>`).join('')}</ul><p class="cast-h cast-h-gap">In the journey</p><p class="cast-note">${p.journey}</p></div>
        </div>`;
    }
    const pane = id === 'dave' ? dave : other;
    pane.classList.remove('is-in'); void pane.offsetWidth; pane.classList.add('is-in');
  };
  tabs.forEach(t => t.addEventListener('click', () => select(t.dataset.persona)));
  select('dave');
});

// ---- Pinned section nav: appears once the 3D pit scrolls away, hides at the
// "next project" footer, and marks the section currently being read. ---------------
const chapterNav = document.getElementById('chapter-nav');
if (chapterNav) {
  const navLinks = [...chapterNav.querySelectorAll('a')];
  const chapters = navLinks.map(link => document.querySelector(link.hash));
  let heroAbove = false, nextVisible = false;
  const updateNav = () => chapterNav.classList.toggle('is-visible', heroAbove && !nextVisible);
  new IntersectionObserver(([entry]) => {
    heroAbove = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    updateNav();
  }).observe(document.querySelector('.mine-hero'));
  new IntersectionObserver(([entry]) => { nextVisible = entry.isIntersecting; updateNav(); }).observe(document.querySelector('.next'));

  let shown;
  const markCurrent = () => {
    const line = window.innerHeight * 0.4;
    let current = -1;
    chapters.forEach((chapter, i) => { if (chapter.getBoundingClientRect().top < line) current = i; });
    if (current === shown) return;
    shown = current;
    navLinks.forEach((link, i) => (i === current ? link.setAttribute('aria-current', 'true') : link.removeAttribute('aria-current')));
    // On narrow screens the pill scrolls sideways — keep the current section centred in it.
    const link = navLinks[current];
    if (link && chapterNav.scrollWidth > chapterNav.clientWidth) {
      chapterNav.scrollTo({ left: link.offsetLeft - (chapterNav.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
    }
  };
  window.addEventListener('scroll', markCurrent, { passive: true });
  markCurrent();
}

