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
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'assets', 'previews');

// Keep this in sync with FALLBACK_PRESENTATIONS + PREVIEW_VIEWPORTS in index.html.
const PRESENTATIONS = [
  { slug: 'ai-for-unity', width: 1920, height: 1080 },
  { slug: 'touch-my-heart', width: 1920, height: 1080 },
  { slug: 'avatars', width: 1920, height: 1080 },
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

  const browser = await chromium.launch({ headless: true });
  try {
    for (const { slug, width, height } of PRESENTATIONS) {
      const indexPath = path.join(rootDir, slug, 'index.html');
      const url = `${pathToFileURL(indexPath).href}?preview=cover`;
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(SETTLE_MS);
      const outPath = path.join(outDir, `${slug}.jpg`);
      await page.screenshot({ path: outPath, type: 'jpeg', quality: 82 });
      await page.close();
      const { size } = await fs.stat(outPath);
      console.log(`  ${slug}.jpg  ${width}x${height}  ${(size / 1024).toFixed(0)} KB`);
    }
  } finally {
    await browser.close();
  }

  console.log(`Generated ${PRESENTATIONS.length} preview poster(s) in ${path.relative(rootDir, outDir)}`);
}

main().catch(error => {
  console.error(error.message);
  if (error.cause) console.error(error.cause.message);
  process.exit(1);
});
