import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const deckPath = path.join(rootDir, 'ai-for-unity', 'index.html');
const outDir = process.env.LINKEDIN_OUT_DIR || String.raw`C:\Users\tprokopiev\Desktop\LinkedIn`;
const width = 1080;
const height = 1080;

function safeSlug(value) {
  return String(value || 'slide')
    .toLowerCase()
    .replace(/^\d+\s*/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'slide';
}

async function cleanOldGeneratedFiles() {
  await fs.mkdir(outDir, { recursive: true });
  const entries = await fs.readdir(outDir);
  await Promise.all(entries
    .filter(entry => /linkedin-(?:4x5|square)\.jpg$/i.test(entry))
    .map(entry => fs.unlink(path.join(outDir, entry))));
}

async function main() {
  await cleanOldGeneratedFiles();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: 'reduce' });

  const deckUrl = new URL(pathToFileURL(deckPath).href);
  deckUrl.searchParams.set('layout', 'square');
  await page.goto(deckUrl.href, { waitUntil: 'load' });

  await page.addStyleTag({ content: `
    html, body { scroll-behavior: auto !important; }
    *, *::before, *::after { animation: none !important; transition: none !important; }
    .deck-back, .nav-hint, .deck-counter, .deck-credit, .deck-tag, .mobile-swipe-hint, .notes { display: none !important; }
    .deck-animations-pending .slide > *:not(.notes),
    .deck-animations-pending .cover-year,
    .animations-ready [data-anim],
    .animations-ready .venn-rings circle,
    .animations-ready .venn-core-glow,
    .animations-ready .venn-core-circle,
    .animations-ready .venn-intersection,
    .animations-ready .venn-label text,
    .animations-ready .venn-core,
    .animations-ready .orbit-dot,
    .animations-ready .flow-node,
    .animations-ready .flow-arrow,
    .animations-ready .flow-loop,
    .animations-ready .flow-loop-label,
    .animations-ready .flow-loop-dot,
    .animations-ready .mcp-mark path,
    .animations-ready .mcp-wordmark,
    .animations-ready .zx-cube-canvas,
    .animations-ready .zx-word { opacity: 1 !important; transform: none !important; }
    .cover-year { opacity: 1 !important; clip-path: inset(0 0 0 0) !important; transform: none !important; }
  ` });

  await page.evaluate(() => {
    try { localStorage.removeItem('ai-unity-deck-position'); } catch {}
    document.body.classList.remove('deck-animations-pending', 'deck-is-sliding', 'deck-nav-idle');
    document.body.classList.add('animations-ready');
    document.querySelectorAll('.slide').forEach(slide => slide.classList.add('is-visible'));
  });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await page.waitForTimeout(500);

  const slides = await page.locator('.slide').evaluateAll(nodes => nodes.map((node, index) => ({
    index: index + 1,
    label: node.getAttribute('data-screen-label') || `Slide ${index + 1}`,
  })));

  for (const slide of slides) {
    await page.evaluate(({ index, width }) => {
      const left = (index - 1) * width;
      for (const el of [document.scrollingElement, document.documentElement, document.body].filter(Boolean)) {
        el.scrollLeft = left;
      }
      const slides = Array.from(document.querySelectorAll('.slide'));
      slides.forEach((slideEl, slideIndex) => slideEl.classList.toggle('is-visible', slideIndex === index - 1));
      document.body.classList.toggle('chrome-on-dark', slides[index - 1]?.classList.contains('dark'));
    }, { index: slide.index, width });

    await page.waitForTimeout(120);
    const fileName = `${String(slide.index).padStart(2, '0')}-${safeSlug(slide.label)}-linkedin-square.jpg`;
    await page.screenshot({ path: path.join(outDir, fileName), type: 'jpeg', quality: 92, fullPage: false });
    console.log(`created ${fileName}`);
  }

  await browser.close();
  console.log(`Done: ${slides.length} JPG previews at ${outDir} (${width}x${height}, square layout)`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
