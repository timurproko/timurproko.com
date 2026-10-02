// Terminal preview replay, adapted from agentnumberone.dev/script.js.
// Illustrative only: no commands run and nothing is generated — replay just
// re-reveals the authored transcript as if it were streaming. The full
// transcript is always the default (no JavaScript, reduced motion, hidden tab).
const SPINNER = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';

export function setupStage(stage) {
  if (!stage) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const panel = stage.querySelector('.a1-panel');
  const lines = [...panel.querySelectorAll('.a1-line')];
  const editor = stage.querySelector('.a1-editor');
  const editorText = editor.querySelector('.a1-editor-text');
  const working = stage.querySelector('.a1-working');
  const spinner = working.querySelector('.a1-spinner');
  const elapsed = working.querySelector('.a1-elapsed');
  const promptText = panel.querySelector('.a1-prompt-text').textContent;

  // Every text node with its full text, so a replay can blank and refill it
  const texts = [];
  const walker = document.createTreeWalker(panel, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) texts.push({ node: walker.currentNode, full: walker.currentNode.textContent });

  let run = 0;
  let timer = 0;
  let ticker = 0;
  const wait = ms => new Promise(resolve => { timer = setTimeout(resolve, ms); });

  // Keep the window on the latest lines, like a terminal following its output
  function follow(smooth) {
    const top = panel.scrollHeight - panel.clientHeight;
    panel.classList.toggle('is-scrolled', top > 0);
    panel.scrollTo({ top, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'auto' });
  }

  function setWorking(on) {
    clearInterval(ticker);
    working.classList.toggle('is-on', on);
    if (!on) return;
    elapsed.textContent = '0s';
    const startedAt = performance.now();
    let frame = 0;
    ticker = setInterval(() => {
      frame = (frame + 1) % SPINNER.length;
      spinner.textContent = SPINNER[frame];
      elapsed.textContent = `${Math.floor((performance.now() - startedAt) / 1000)}s`;
    }, 80);
  }

  // Refill an element's text nodes in chunks: characters, words or lines
  async function stream(el, chunk, delay, id) {
    const parts = texts.filter(part => el.contains(part.node));
    parts.forEach(part => { part.node.textContent = ''; });
    const pattern = { char: /[\s\S]/g, word: /\s*\S+/g, line: /[^\n]*\n?/g }[chunk];
    for (const part of parts) {
      for (const [piece] of part.full.matchAll(pattern)) {
        if (!piece) continue;
        part.node.textContent += piece;
        follow(false);
        await wait(delay);
        if (id !== run) return;
      }
    }
  }

  function show(el) {
    el.classList.remove('is-pending');
    follow(true);
  }

  function stopReplay() {
    run += 1;
    clearTimeout(timer);
    setWorking(false);
    editorText.textContent = '';
    texts.forEach(part => { part.node.textContent = part.full; });
    panel.classList.remove('is-replaying');
    panel.querySelectorAll('.is-pending').forEach(el => el.classList.remove('is-pending'));
    follow(false);
  }

  async function replay() {
    stopReplay();
    if (reducedMotion.matches) return;
    const id = run;
    const live = () => id === run;
    panel.classList.add('is-replaying');
    lines.forEach(line => line.classList.add('is-pending'));
    panel.querySelectorAll('.a1-out, .a1-took').forEach(el => el.classList.add('is-pending'));
    follow(false);

    // Type the prompt into the editor, then submit it to the transcript
    for (const char of promptText) {
      editorText.textContent += char;
      await wait(28);
      if (!live()) return;
    }
    await wait(380);
    if (!live()) return;
    editorText.textContent = '';
    show(lines[0]);
    setWorking(true);

    for (const line of lines.slice(1)) {
      if (line.classList.contains('a1-thought')) {
        await wait(650);
        if (!live()) return;
        show(line);
        await stream(line, 'word', 60, id);
      } else if (line.classList.contains('a1-tool')) {
        const cmd = line.querySelector('.a1-cmd');
        const out = line.querySelector('.a1-out');
        const took = line.querySelector('.a1-took');
        await wait(320);
        if (!live()) return;
        show(line);
        await stream(cmd, 'char', 14, id);
        if (!live()) return;
        // Pretend the command runs; the test run takes longest
        await wait(cmd.textContent.includes('npm test') ? 1700 : 550);
        if (!live()) return;
        show(out);
        await stream(out, 'line', 170, id);
        if (!live()) return;
        show(took);
      } else {
        await wait(600);
        if (!live()) return;
        show(line);
        await stream(line, 'word', 65, id);
      }
      if (!live()) return;
    }
    setWorking(false);
    panel.classList.remove('is-replaying');
  }

  stage.querySelector('.a1-replay')?.addEventListener('click', replay);
  reducedMotion.addEventListener('change', stopReplay);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopReplay();
  });
  window.addEventListener('resize', () => follow(false));
  document.fonts?.ready.then(() => follow(false));
  follow(false);

  // Play the session once when it first scrolls into view.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      replay();
    }, { threshold: 0.4 });
    observer.observe(stage.querySelector('.a1-terminal'));
  }
}
