// Generates lightweight static cover posters for each presentation.
//
// The landing page normally previews each deck inside a live <iframe> loading
// the full presentation (WebGL/video). On mobile that is far too heavy —
// loading several full pages at once crashes iOS Safari. These posters let the
// landing page swap the iframe for a single small <img> on touch devices.
//
// Each poster is a screenshot of `<presentation>/index.html?preview=cover`
// (the exact cover the iframe shows), saved as an optimized JPEG.

import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const outDir = path.join(rootDir, 'public', 'assets', 'previews');

// Keep this in sync with FALLBACK_PRESENTATIONS + PREVIEW_VIEWPORTS in index.html.
const PRESENTATIONS = [
  { slug: 'ai-for-unity', width: 1920, height: 1080 },
  { slug: 'touch-my-heart', width: 1920, height: 1080 },
  { slug: 'avatars', width: 1920, height: 1080 },
  { slug: 'corel-for-mac', width: 1920, height: 1080 },
  { slug: 'starkit', width: 1920, height: 1080 },
  { slug: 'vital-sports', width: 1920, height: 1080 },
  { slug: 'xr-prototypes', width: 1920, height: 1080 },
  { slug: 'vr-for-everybody', width: 1920, height: 1080 },
  { slug: 'untitled-world', width: 1920, height: 1080 },
  { slug: 'calmxr', width: 1920, height: 1080 },
  { slug: 'minecare', width: 1920, height: 1080 },
  { slug: 'a1', width: 1920, height: 1080 },
  { slug: 'cv', width: 900, height: 900 },
];

// Time to let the cover reveal + first canvas frames settle before capture.
const SETTLE_MS = 2200;

async function main() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (error) {
    throw new Error('The "playwright" package is required. Run `npm install`, then retry.', { cause: error });
  }

  await fs.mkdir(outDir, { recursive: true });

  const server = await startStaticServer(distDir);
  const browser = await chromium.launch({ headless: true });
  try {
    // One poster per theme: <slug>.jpg (light) and <slug>-dark.jpg. theme.js
    // reads the stored pick before first paint, so seeding it picks the theme.
    for (const { slug, width, height } of PRESENTATIONS) {
      for (const theme of ['light', 'dark']) {
        const url = `${server.origin}/${encodeURIComponent(slug)}/?preview=cover`;
        const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
        await page.addInitScript(value => localStorage.setItem('theme', value), theme);
        await page.goto(url, { waitUntil: 'networkidle' });
        // Deck covers and the CV render .hero; case pages (StarKit, A1) render .cover.
        await page.waitForSelector('.slide.hero, .hero, .cover', { timeout: 10000 });
        await page.waitForTimeout(SETTLE_MS);
        const name = theme === 'dark' ? `${slug}-dark.jpg` : `${slug}.jpg`;
        const outPath = path.join(outDir, name);
        await page.screenshot({ path: outPath, type: 'jpeg', quality: 82 });
        await page.close();
        const { size } = await fs.stat(outPath);
        console.log(`  ${name}  ${width}x${height}  ${(size / 1024).toFixed(0)} KB`);
      }
    }

    // The CV as a ready-made PDF, for mobile browsers that ignore window.print()
    // (the CV page's Print button falls back to it).
    const cvPage = await browser.newPage();
    await cvPage.goto(`${server.origin}/cv/`, { waitUntil: 'networkidle' });
    await cvPage.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    const pdfPath = path.join(rootDir, 'public', 'cv', 'Timur_Prokopiev_CV.pdf');
    await cvPage.pdf({ path: pdfPath, preferCSSPageSize: true, printBackground: true });
    await cvPage.close();
    console.log(`  ${path.relative(rootDir, pdfPath)}`);
  } finally {
    await browser.close();
    await server.close();
  }

  console.log(`Generated ${PRESENTATIONS.length} preview poster(s) in ${path.relative(rootDir, outDir)}`);
}

async function startStaticServer(root) {
  const server = createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || '/', 'http://localhost');
      const pathname = decodeURIComponent(requestUrl.pathname);
      const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const filePath = path.resolve(root, `.${relativePath}`);

      if (!filePath.startsWith(root)) {
        res.writeHead(403).end('Forbidden');
        return;
      }

      const stat = await fs.stat(filePath).catch(() => null);
      if (!stat || !stat.isFile()) {
        res.writeHead(404).end('Not found');
        return;
      }

      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      res.end(await fs.readFile(filePath));
    } catch (error) {
      res.writeHead(500).end(error instanceof Error ? error.message : 'Server error');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Failed to start preview server');

  return {
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.mp4': 'video/mp4',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webm': 'video/webm',
    '.webp': 'image/webp',
  }[ext] || 'application/octet-stream';
}

main().catch(error => {
  console.error(error.message);
  if (error.cause) console.error(error.cause.message);
  process.exit(1);
});
