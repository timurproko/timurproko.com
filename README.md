# timurproko.com

Static personal site for `timurproko.com`.

The content decks are authored in React components and built as plain static files with Vite. There is no server or SSR runtime; GitHub Pages serves the generated `dist/` folder.

## Main npm commands

Install dependencies:

```bash
npm install
```

Run the local Vite dev server:

```bash
npm run dev
```

If deck styling looks unstyled/broken after large CSS changes, restart Vite with cache invalidation:

```bash
npm run dev:force
```

Build the complete static site into `dist/`:

```bash
npm run build
```

Preview the built static site locally:

```bash
npm run preview
```

Generate regular social preview images and update source page metadata:

```bash
npm run social:build
```

Generate lightweight cover posters for mobile deck previews. Run `npm run build` first because screenshots are captured from `dist/`:

```bash
npm run previews:build
```

Generate optimized 1080×1080 LinkedIn JPG previews for the AI for Unity presentation. Run `npm run build` first because screenshots are captured from `dist/`:

```bash
npm run linkedin:square
```

By default, LinkedIn previews are written to:

```text
C:\Users\tprokopiev\Desktop\LinkedIn
```

To export them somewhere else:

```bash
LINKEDIN_OUT_DIR="./exports/linkedin" npm run linkedin:square
```

## Project structure

- `public/` — static passthrough assets copied into `dist/` verbatim
    - `public/assets/social/` — generated social preview images
  - `public/assets/previews/` — generated deck cover posters
  - `public/avatars/assets/`, `public/touch-my-heart/assets/` — deck media kept at their original public URLs
- `src/index.html` — portfolio home page served at `/`
- `src/cv/index.html` — CV page served at `/cv/`
- `src/deck/` — shared deck chrome, navigation engine, and slide wrapper
- `src/components/` — reusable content/layout primitives for deck pages
- `src/styles/` — shared deck CSS extracted from the legacy pages
- `src/starkit/`, `src/a1/`, `src/ai-for-unity/`, `src/avatars/`, `src/corel-for-mac/`, `src/minecare/`, `src/touch-my-heart/` — case pages (static HTML + `src/case/` styles; a page can set `--hue` to retheme); each deck-born page keeps a cover-only deck at `/<page>/cover/` (`cover.tsx`) for the home page preview
- `legacy/` — original monolithic deck HTML retained as migration reference
- `scripts/` — preview/social generation and one-time migration helpers

## Deployment

GitHub Pages deployment is handled by `.github/workflows/pages.yml`:

1. `npm ci`
2. `npm run build`
3. upload `dist/` as a Pages artifact
4. deploy with `actions/deploy-pages`

In the repository settings, configure Pages to use **GitHub Actions** as the source. The custom domain `CNAME` is copied from `public/CNAME` into `dist/` during the build.
