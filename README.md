# timurproko.com

Static personal site and presentation deck for `timurproko.com`.

## Main npm commands

Install dependencies:

```bash
npm install
```

Generate regular social preview images and update page metadata:

```bash
npm run social:build
```

Generate optimized 1080×1080 LinkedIn JPG previews for the AI for Unity presentation:

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

## Content

- `index.html` — home page
- `cv/` — CV page
- `ai-for-unity/` — presentation deck
- `assets/social/` — generated social preview images
- `scripts/` — generation scripts
