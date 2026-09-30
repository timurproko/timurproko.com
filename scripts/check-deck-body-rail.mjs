import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const HOST = '127.0.0.1';
const PORT = Number(process.env.DECK_RAIL_PORT || 5178);
const BASE_URL = `http://${HOST}:${PORT}`;
const ROUTES = ['/ai-for-unity/'];
const VIEWPORT = { width: 1192, height: 929 };
const TOLERANCE_PX = 2;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL, { cache: 'no-store' });
      if (res.ok) return;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }
    await wait(250);
  }
  throw new Error(`Timed out waiting for ${BASE_URL}: ${lastError?.message ?? 'unknown error'}`);
}

const viteArgs = ['vite', '--host', HOST, '--port', String(PORT), '--strictPort'];
const server = process.platform === 'win32'
  ? spawn('cmd.exe', ['/c', 'npx', ...viteArgs], { stdio: ['ignore', 'pipe', 'pipe'] })
  : spawn('npx', viteArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

try {
  await waitForServer();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  const failures = [];

  for (const route of ROUTES) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(250);

    const rows = await page.$$eval('.slide', (slides) => slides.map((slide, index) => {
      const body = slide.querySelector(':scope > .deck-body');
      const rect = body?.getBoundingClientRect();
      return {
        route: window.location.pathname,
        index: index + 1,
        label: slide.getAttribute('data-screen-label'),
        className: slide.className,
        hasBody: Boolean(body),
        hasSubhead: Boolean(slide.querySelector(':scope > .deck-subhead')),
        bodyVariant: body?.getAttribute('data-body-variant') ?? null,
        bodyTop: rect ? Number(rect.top.toFixed(2)) : null,
      };
    }));

    const standardSlides = rows.filter((row) => (
      row.hasBody && !/(?:^|\s)(?:hero|slide-section|slide-zx-end|pdf-page-slide)(?:\s|$)/.test(row.className)
    ));

    if (!standardSlides.length) {
      failures.push(`${route}: no standard .deck-body slides found`);
      continue;
    }

    const referenceTop = standardSlides[0].bodyTop;
    const badRows = standardSlides.filter((row) => Math.abs(row.bodyTop - referenceTop) > TOLERANCE_PX);
    if (badRows.length) {
      failures.push(
        `${route}: body rail drift from ${referenceTop}px\n` +
        badRows.map((row) => `  ${row.index} ${row.label}: ${row.bodyTop}px (${row.bodyVariant})`).join('\n'),
      );
    }

    console.log(`${route} ${standardSlides.length} standard slides: body rail ${referenceTop}px`);
  }

  await browser.close();

  if (failures.length) {
    console.error('\nDeck body rail check failed:\n' + failures.join('\n\n'));
    process.exit(1);
  }

  console.log(`\nDeck body rail check passed (±${TOLERANCE_PX}px).`);
} catch (error) {
  console.error(error);
  if (serverOutput.trim()) {
    console.error('\nVite output:\n' + serverOutput.trim());
  }
  process.exit(1);
} finally {
  server.kill();
}
