import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const srcDir = path.join(rootDir, 'src');
const socialDir = path.join(publicDir, 'assets', 'social');
const markerStart = '<!-- social-preview:start -->';
const markerEnd = '<!-- social-preview:end -->';
// Rendered at 2x (2400x1260) so the text stays crisp after LinkedIn rescales it.
const scale = 2;

const SKIP_DIRS = new Set(['.git', 'node_modules', 'assets', 'dist', 'work', 'legacy']);

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getSiteUrl() {
  if (process.env.SITE_URL) {
    return normalizeBaseUrl(process.env.SITE_URL);
  }

  const cnamePath = path.join(publicDir, 'CNAME');
  if (await pathExists(cnamePath)) {
    const cname = (await fs.readFile(cnamePath, 'utf8')).trim();
    if (cname) return normalizeBaseUrl(`https://${cname}`);
  }

  return normalizeBaseUrl('https://example.com');
}

function normalizeBaseUrl(value) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  const url = new URL(withProtocol);
  url.pathname = '/';
  url.search = '';
  url.hash = '';
  return url.toString();
}

async function findIndexPages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const pages = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      pages.push(...await findIndexPages(path.join(dir, entry.name)));
      continue;
    }

    if (entry.isFile() && entry.name === 'index.html') {
      pages.push(path.join(dir, entry.name));
    }
  }

  return pages.sort((a, b) => a.localeCompare(b));
}

async function findSourceIndexPages() {
  const publicPages = await findIndexPages(publicDir);
  const deckPages = [];
  const homePath = path.join(srcDir, 'index.html');
  if (await pathExists(homePath)) deckPages.push(homePath);
  for (const entry of await fs.readdir(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const indexPath = path.join(srcDir, entry.name, 'index.html');
    if (await pathExists(indexPath)) deckPages.push(indexPath);
  }
  return [...publicPages, ...deckPages].sort((a, b) => pageRoute(a).localeCompare(pageRoute(b)));
}

function getMetaContent(html, name) {
  const pattern = new RegExp(`<meta\\s+[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i');
  const reversedPattern = new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["'][^>]*>`, 'i');
  const match = html.match(pattern) ?? html.match(reversedPattern);
  return match ? decodeEntities(match[1].trim()) : '';
}

function getTitle(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].replace(/\s+/g, ' ').trim()) : 'Untitled page';
}

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");
}

function pageRoute(filePath) {
  if (filePath.startsWith(publicDir)) {
    const relativeDir = path.relative(publicDir, path.dirname(filePath)).replaceAll(path.sep, '/');
    return relativeDir === '' ? '/' : `/${relativeDir}/`;
  }

  if (filePath.startsWith(srcDir)) {
    const relativeDir = path.relative(srcDir, path.dirname(filePath)).replaceAll(path.sep, '/');
    return relativeDir === '' ? '/' : `/${relativeDir}/`;
  }

  const relativeDir = path.relative(rootDir, path.dirname(filePath)).replaceAll(path.sep, '/');
  return relativeDir === '' ? '/' : `/${relativeDir}/`;
}

function pageSlug(filePath) {
  const route = pageRoute(filePath);
  if (route === '/') return 'home';
  return route.replace(/^\//, '').replace(/\/$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

function socialMetaBlock({ title, description, url, imageUrl, siteName }) {
  return `${markerStart}
  <link rel="canonical" href="${escapeAttr(url)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeAttr(siteName)}" />
  <meta property="og:title" content="${escapeAttr(title)}" />
  <meta property="og:description" content="${escapeAttr(description)}" />
  <meta property="og:url" content="${escapeAttr(url)}" />
  <meta property="og:image" content="${escapeAttr(imageUrl)}" />
  <meta property="og:image:width" content="${1200 * scale}" />
  <meta property="og:image:height" content="${630 * scale}" />
  <meta property="og:image:alt" content="${escapeAttr(`${title} — social preview`)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeAttr(title)}" />
  <meta name="twitter:description" content="${escapeAttr(description)}" />
  <meta name="twitter:image" content="${escapeAttr(imageUrl)}" />
  ${markerEnd}`;
}

function injectSocialMeta(html, block) {
  const markerPattern = new RegExp(`\\s*${escapeRegExp(markerStart)}[\\s\\S]*?${escapeRegExp(markerEnd)}`, 'm');
  if (markerPattern.test(html)) {
    return html.replace(markerPattern, `\n  ${block}`);
  }

  const descriptionMatch = html.match(/\n\s*<meta\s+name=["']description["'][^>]*>/i);
  if (descriptionMatch?.index != null) {
    const insertAt = descriptionMatch.index + descriptionMatch[0].length;
    return `${html.slice(0, insertAt)}\n  ${block}${html.slice(insertAt)}`;
  }

  return html.replace(/<head>\s*/i, match => `${match}\n  ${block}\n`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// "Name – Role" titles render as a large name over a smaller role line.
function titleLines(title) {
  const [main, ...rest] = title.split(/\s+[–—]\s+/);
  if (!rest.length) return escapeHtml(title);
  return `<span>${escapeHtml(main)}</span><span class="subtitle">${escapeHtml(rest.join(' – '))}</span>`;
}

function buildCardHtml({ title, description, url, siteName }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=1200, height=630">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background:
        radial-gradient(circle at 14% 18%, rgba(58, 134, 255, 0.20), transparent 30%),
        radial-gradient(circle at 84% 18%, rgba(181, 23, 255, 0.18), transparent 28%),
        radial-gradient(circle at 78% 86%, rgba(61, 220, 151, 0.18), transparent 28%),
        #f8f9fb;
      color: #111827;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      padding: 40px;
    }
    .card {
      position: relative;
      width: 100%;
      height: 100%;
      border: 1px solid rgba(17, 24, 39, 0.08);
      border-radius: 40px;
      background: rgba(255, 255, 255, 0.86);
      box-shadow: 0 32px 96px rgba(15, 23, 42, 0.14);
      padding: 50px 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .brand {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
      color: #8a93a1;
      font: 500 20px/1.1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .brand::after {
      content: "";
      flex: 1;
      max-width: 360px;
      height: 8px;
      border-radius: 999px;
      background: linear-gradient(90deg, #ff4d6d, #ffb703, #3ddc97, #3a86ff, #b517ff);
    }
    /* The title is the only thing that must survive LinkedIn's ~160px thumbnail,
       so it is large; the label, description, and URL stay quiet. */
    h1 {
      margin: 0;
      font-size: 84px;
      font-weight: 700;
      line-height: 1;
      letter-spacing: -0.045em;
      text-wrap: balance;
    }
    h1 span { display: block; }
    h1 .subtitle {
      margin-top: 10px;
      color: #1f2937;
      font-size: 62px;
      letter-spacing: -0.035em;
    }
    p {
      margin: 22px 0 0;
      max-width: 960px;
      color: #8a93a1;
      font-size: 24px;
      line-height: 1.3;
      letter-spacing: -0.01em;
    }
    .url {
      color: #2563eb;
      font: 500 22px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      letter-spacing: 0.02em;
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="brand"><span>${escapeHtml(siteName)}</span></div>
    <section>
      <h1>${titleLines(title)}</h1>
      <p>${escapeHtml(description)}</p>
    </section>
    <div class="url">${escapeHtml(url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</div>
  </main>
</body>
</html>`;
}

async function renderPreviews(pages) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (error) {
    throw new Error('The "playwright" package is required to render PNG social previews. Run `npm install`, then retry.', { cause: error });
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: scale });

  try {
    for (const pageData of pages) {
      await page.setContent(buildCardHtml(pageData), { waitUntil: 'load' });
      await page.screenshot({ path: pageData.imagePath, type: 'png' });
    }
  } finally {
    await browser.close();
  }
}

async function main() {
  const siteUrl = await getSiteUrl();
  const siteName = process.env.SITE_NAME || 'Timur Prokopiev';
  const pages = [];

  await fs.mkdir(socialDir, { recursive: true });

  for (const filePath of await findSourceIndexPages()) {
    const html = await fs.readFile(filePath, 'utf8');
    const title = getTitle(html);
    const description = getMetaContent(html, 'description') || title;
    const route = pageRoute(filePath);
    const slug = pageSlug(filePath);
    const url = new URL(route, siteUrl).toString();
    // ?v= changes whenever the card does, so LinkedIn refetches instead of reusing its cached copy.
    const version = createHash('sha1').update(`${scale}:${buildCardHtml({ title, description, url, siteName })}`).digest('hex').slice(0, 8);
    const imageUrl = new URL(`/assets/social/${slug}.png?v=${version}`, siteUrl).toString();
    const imagePath = path.join(socialDir, `${slug}.png`);
    const nextHtml = injectSocialMeta(html, socialMetaBlock({ title, description, url, imageUrl, siteName }));

    if (nextHtml !== html) {
      await fs.writeFile(filePath, nextHtml);
    }

    pages.push({ title, description, url, siteName, imagePath });
  }

  await renderPreviews(pages);

  const manifest = pages.map(page => ({
    title: page.title,
    url: page.url,
    image: pathToFileURL(page.imagePath).href.replace(pathToFileURL(publicDir).href, ''),
  }));
  await fs.writeFile(path.join(socialDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`Generated ${pages.length} social preview image(s) in ${path.relative(rootDir, socialDir)}`);
}

main().catch(error => {
  console.error(error.message);
  if (error.cause) console.error(error.cause.message);
  process.exit(1);
});
