// Experience card illustrations, adapted from agentnumberone.dev/script.js.
// They rest still and only play while their card is hovered.
export function setupFeatures(root) {
  if (!root) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  setupHistory(root.querySelector('.a1-mini-history'), reducedMotion);
  setupSuggest(root.querySelector('.a1-mini-suggest'), reducedMotion);
}

const keysOf = el => Object.fromEntries([...el.querySelectorAll('kbd[data-key]')].map(kbd => [kbd.dataset.key, kbd]));

// Prompt history: walk the selection up to the oldest prompt and back down,
// flashing ↑ or ↓ for each step and recalling each prompt into the editor at
// its own length.
function setupHistory(mini, reducedMotion) {
  if (!mini) return;
  const card = mini.closest('.win');
  const rows = [...mini.querySelectorAll('.a1-mini-row')];
  const recalled = mini.querySelector('.is-recalled');
  const keys = keysOf(mini);
  const resting = rows.findIndex(row => row.classList.contains('is-active'));
  let walk = 0;
  let release = 0;
  const select = index => {
    rows.forEach((row, n) => row.classList.toggle('is-active', n === index));
    recalled.style.setProperty('--w', rows[index].querySelector('.a1-skel').style.getPropertyValue('--w'));
  };
  const press = key => {
    clearTimeout(release);
    keys[key].classList.add('is-pressed');
    release = setTimeout(() => keys[key].classList.remove('is-pressed'), 220);
  };
  card.addEventListener('mouseenter', () => {
    if (reducedMotion.matches) return;
    let index = resting;
    let step = -1;
    walk = setInterval(() => {
      if (index + step < 0 || index + step >= rows.length) step = -step;
      index += step;
      press(step < 0 ? 'up' : 'down');
      select(index);
    }, 700);
  });
  card.addEventListener('mouseleave', () => {
    clearInterval(walk);
    clearTimeout(release);
    Object.values(keys).forEach(kbd => kbd.classList.remove('is-pressed'));
    select(resting);
  });
}

// Next step: loop accept (Tab) → send (Enter) → the agent streams a reply →
// a fresh suggestion, like a short a1 session.
function setupSuggest(suggest, reducedMotion) {
  if (!suggest) return;
  const card = suggest.closest('.win');
  const chat = card.querySelector('.a1-mini-chat');
  const ghost = suggest.querySelector('.is-suggested');
  const keys = keysOf(suggest);
  const restingChat = chat.innerHTML;
  const restingWidth = ghost.style.getPropertyValue('--w');
  let run = 0;
  let timer = 0;
  const pause = ms => new Promise(resolve => { timer = setTimeout(resolve, ms); });
  const width = (min, max) => `${Math.round(min + Math.random() * (max - min))}%`;
  const bar = w => Object.assign(document.createElement('i'), { className: 'a1-skel', style: `--w: ${w}` });

  async function press(key) {
    keys[key].classList.add('is-pressed');
    await pause(220);
    keys[key].classList.remove('is-pressed');
  }

  async function loop(id) {
    const live = () => id === run;
    while (live()) {
      await pause(1100);
      if (!live()) return;
      await press('tab');
      if (!live()) return;
      suggest.classList.add('is-accepted');
      await pause(900);
      if (!live()) return;
      await press('enter');
      if (!live()) return;
      // The accepted prompt moves into the transcript and the editor empties
      const prompt = document.createElement('div');
      prompt.className = 'a1-mini-chat-prompt';
      prompt.innerHTML = '<span class="a1-glyph">❯</span>';
      prompt.append(bar(ghost.style.getPropertyValue('--w')));
      chat.append(prompt);
      suggest.classList.remove('is-accepted');
      suggest.classList.add('is-empty');
      for (let line = 0, lines = 6 + Math.floor(Math.random() * 7); line < lines; line++) {
        await pause(180);
        if (!live()) return;
        chat.append(bar(line === lines - 1 ? width(30, 55) : width(70, 92)));
      }
      while (chat.children.length > 24) chat.firstElementChild.remove();
      await pause(500);
      if (!live()) return;
      ghost.style.setProperty('--w', width(40, 64));
      suggest.classList.remove('is-empty');
    }
  }

  card.addEventListener('mouseenter', () => {
    if (reducedMotion.matches) return;
    loop(++run);
  });
  card.addEventListener('mouseleave', () => {
    run += 1;
    clearTimeout(timer);
    Object.values(keys).forEach(kbd => kbd.classList.remove('is-pressed'));
    suggest.classList.remove('is-accepted', 'is-empty');
    ghost.style.setProperty('--w', restingWidth);
    chat.innerHTML = restingChat;
  });
}
