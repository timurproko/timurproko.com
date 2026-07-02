// One-time migration tool: converts a legacy deck page's slide markup
// (work/<page>.body.html) into a React slides.tsx content file.
// Chrome elements are dropped (provided by <Deck>), each <section> becomes a <Slide>.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'), '..');

const PAGES = {
  'ai-for-unity': {
    storageKey: 'ai-unity-deck-position',
    darkSlides: [0, 18],
    tag: 'Trend',
    deckTitle: 'AI for Unity Development',
    fx: ['hero'],
  },
  'corel-for-mac': {
    storageKey: 'coreldraw-macos-deck-position',
    darkSlides: [0, 3, 7, 12, 17, 19],
    tag: 'Overview',
    deckTitle: 'CorelDRAW for macOS',
    fx: ['hero'],
  },
  'touch-my-heart': {
    storageKey: 'touch-my-heart-deck-position',
    darkSlides: [0, 11],
    tag: 'Trend',
    deckTitle: 'Touch My Heart',
    fx: ['hero', 'cover3d'],
  },
};

const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'source', 'track', 'wbr', 'col', 'embed', 'area', 'base', 'meta', 'link']);
const BOOL_ATTRS = new Set(['muted', 'loop', 'autoplay', 'playsinline', 'controls', 'disabled', 'checked', 'hidden', 'defer', 'async', 'required', 'readonly', 'multiple', 'selected', 'open']);
const RENAME = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', crossorigin: 'crossOrigin',
  autoplay: 'autoPlay', playsinline: 'playsInline', srcset: 'srcSet', autocomplete: 'autoComplete',
  spellcheck: 'spellCheck', contenteditable: 'contentEditable', 'xlink:href': 'xlinkHref',
};

function attrName(name) {
  if (RENAME[name]) return RENAME[name];
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  if (name.includes('-')) {
    // SVG kebab-case attributes → camelCase (stroke-width → strokeWidth)
    return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }
  return name;
}

function styleToJsx(style) {
  const entries = style.split(';').map((s) => s.trim()).filter(Boolean).map((decl) => {
    const i = decl.indexOf(':');
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    const key = prop.startsWith('--') ? `'${prop}'` : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    return `${key}: '${value.replace(/'/g, "\\'")}'`;
  });
  return `{{ ${entries.join(', ')} }}`;
}

function convertOpenTag(tag) {
  // tag like `<div class="x" style="a:b" data-anim>` (no trailing > handling of /)
  const m = tag.match(/^<([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:="[^"]*")?)*)\s*(\/?)>$/s);
  if (!m) throw new Error('Unparseable tag: ' + tag.slice(0, 120));
  const [, name, attrStr, selfClose] = m;
  const attrs = [];
  const attrRe = /([^\s=>/]+)(?:="([^"]*)")?/g;
  let am;
  while ((am = attrRe.exec(attrStr))) {
    const [, rawName, rawVal] = am;
    const jsxName = attrName(rawName);
    if (rawVal === undefined) {
      if (BOOL_ATTRS.has(rawName)) attrs.push(jsxName);
      else attrs.push(`${jsxName}=""`);
    } else if (rawName === 'style') {
      const obj = styleToJsx(rawVal);
      attrs.push(rawVal.includes('--') ? `style={${obj.slice(1, -1).trim()} as CSSProperties}` : `style=${obj}`);
    } else if (rawName === 'tabindex') {
      attrs.push(`tabIndex={${Number(rawVal)}}`);
    } else if (rawName === 'draggable') {
      attrs.push(`draggable={${rawVal === 'true'}}`);
    } else if (BOOL_ATTRS.has(rawName)) {
      attrs.push(rawVal === 'false' ? `${jsxName}={false}` : jsxName);
    } else {
      attrs.push(`${jsxName}="${rawVal}"`);
    }
  }
  const attrsOut = attrs.length ? ' ' + attrs.join(' ') : '';
  const close = selfClose || VOID_TAGS.has(name.toLowerCase()) ? ' /' : '';
  return `<${name}${attrsOut}${close}>`;
}

export function htmlToJsx(html) {
  let out = '';
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) { out += html.slice(i); break; }
    out += html.slice(i, lt);
    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt);
      out += `{/*${html.slice(lt + 4, end).replace(/\*\//g, '*\\/')}*/}`;
      i = end + 3;
      continue;
    }
    const gt = html.indexOf('>', lt);
    const tag = html.slice(lt, gt + 1);
    if (tag[1] === '/') out += tag; // closing tag unchanged
    else out += convertOpenTag(tag);
    i = gt + 1;
  }
  return out;
}

function escapeAttr(s) {
  return s.replace(/"/g, '&quot;');
}

function extractSlides(body) {
  const sections = [];
  const re = /<section class="slide([^"]*)"([^>]*)>([\s\S]*?)<\/section>/g;
  let m;
  while ((m = re.exec(body))) {
    const extraClass = m[1].trim();
    const attrs = m[2];
    const label = (attrs.match(/data-screen-label="([^"]*)"/) || [])[1] || '';
    const notes = (attrs.match(/data-notes="([^"]*)"/) || [])[1] || '';
    let inner = m[3];

    // lift leading slide-tag + plain-text deck-headline into props
    let tag;
    const tagM = inner.match(/^\s*<span class="slide-tag">([^<]*)<\/span>/);
    if (tagM) { tag = tagM[1]; inner = inner.slice(tagM.index + tagM[0].length); }
    let headline;
    const hM = inner.match(/^\s*<h2 class="deck-headline">([^<]*)<\/h2>/);
    if (hM) { headline = hM[1]; inner = inner.slice(hM.index + hM[0].length); }

    // Standardize direct slide subtitles: if a deck-subhead appears right after
    // the headline, lift it into <Slide subhead>. Subheads inside split columns
    // stay in the slide body because they describe local content, not the page header.
    let subhead;
    const subheadM = inner.match(/^\s*<p class="deck-subhead"[^>]*>([\s\S]*?)<\/p>/);
    if (subheadM) {
      subhead = subheadM[1];
      inner = inner.slice(subheadM.index + subheadM[0].length);
    } else {
      // Some legacy slides wrapped the whole body in a page-specific content
      // container and put the subtitle as that wrapper's first child. Lift it
      // too so the header/subheader position is shared across all decks.
      const wrappedSubheadM = inner.match(/^(\s*<div class="[^"]*-content">\s*)<p class="deck-subhead"[^>]*>([\s\S]*?)<\/p>/);
      if (wrappedSubheadM) {
        subhead = wrappedSubheadM[2];
        inner = inner.replace(wrappedSubheadM[0], wrappedSubheadM[1]);
      }
    }

    sections.push({ extraClass, label, notes, tag, headline, subhead, inner: inner.trim() });
  }
  return sections;
}

function indent(text, pad) {
  return text.split('\n').map((l) => (l.trim() ? pad + l : l)).join('\n');
}

export function generate(page, cfg) {
  const body = fs.readFileSync(path.join(root, 'work', `${page}.body.html`), 'utf8').replace(/\r\n/g, '\n');
  const slides = extractSlides(body);
  const fxImports = [];
  const fxNames = [];
  if (cfg.fx.includes('hero')) { fxImports.push(`import { initHeroCanvas } from './hero.js';`); fxNames.push('initHeroCanvas'); }
  if (cfg.fx.includes('cover3d')) { fxImports.push(`import { initCover3d } from './cover3d.js';`); fxNames.push('initCover3d'); }

  const rendered = slides.map((s, idx) => {
    const key = s.label ? s.label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `slide-${idx}`;
    const props = [
      `key="${key}"`,
      `label="${escapeAttr(s.label)}"`,
      s.notes ? `notes="${escapeAttr(s.notes)}"` : null,
      s.extraClass ? `className="${escapeAttr(s.extraClass)}"` : null,
      s.tag ? `tag="${escapeAttr(s.tag)}"` : null,
      s.headline ? (s.headline.includes('&') ? `headline={<>${s.headline}</>}` : `headline="${escapeAttr(s.headline)}"`) : null,
      s.subhead ? `subhead={<>${htmlToJsx(s.subhead)}</>}` : null,
    ].filter(Boolean);
    const jsx = s.inner ? htmlToJsx(s.inner) : '';
    if (!jsx) return `  <Slide\n    ${props.join('\n    ')}\n  />`;
    return `  <Slide\n    ${props.join('\n    ')}\n  >\n${indent(jsx, '    ')}\n  </Slide>`;
  });

  return `/**
 * ${cfg.deckTitle} — deck content.
 * This file is CONTENT ONLY: edit text, media and slide order here.
 * Layout and behavior come from src/deck and src/components.
 * (Generated from the legacy page markup; refactor slides into
 * src/components primitives incrementally as they get edited.)
 */
import { CSSProperties } from 'react';
import { DeckConfig } from '../deck/Deck';
import { Slide } from '../deck/Slide';
${fxImports.join('\n')}

export const deckConfig: DeckConfig = {
  storageKey: '${cfg.storageKey}',
  darkSlides: [${cfg.darkSlides.join(', ')}],
  tag: '${cfg.tag}',
  deckTitle: '${cfg.deckTitle.replace(/'/g, "\\'")}',
  fx: [${fxNames.join(', ')}],
};

export const slides = [
${rendered.join(',\n\n')},
];
`;
}

const only = process.argv[2];
for (const [page, cfg] of Object.entries(PAGES)) {
  if (only && page !== only) continue;
  const out = generate(page, cfg);
  fs.writeFileSync(path.join(root, 'src', page, 'slides.tsx'), out);
  console.log(page, 'slides.tsx written,', out.length, 'chars');
}
