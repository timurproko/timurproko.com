# Presentation primitives

All deck pages should compose repeated presentation UI from this folder instead of creating one-off card/list/chip/tag CSS in a page folder.

## Canonical taxonomy

- `DeckList` — bullets, numbered rows, compact rows, and muted/active list states.
- `BulletList` — convenience wrapper for `DeckList variant="bullet"`.
- `Card` — the single base for bordered panels, tiles, cards with lists, active/target cards, dark cards, and media/preview cards.
- `CardGrid` — layout-only wrapper for repeated cards.
- `CardList` — composition helper for lists of cards or a card containing a `DeckList`.
- `Chip` / `ChipGroup` — small rounded inline capsules, optionally links.
- `Tag` / `TagGroup` — uppercase/mono semantic label capsules using the same capsule geometry as chips.

Do **not** add a standalone `PreviewCard`. Preview/media cards are `Card` variants expressed through `media`, `mediaPosition`, and `mediaAspect` props.

## Recipes

### Simple bullet list

```tsx
<BulletList
  tight
  items={[
    'Agent keeps project context',
    'Tools run inside the current workflow',
    'Human reviews the diff before shipping',
  ]}
/>
```

### Numbered evolution list with active row

```tsx
<DeckList
  variant="rows"
  items={[
    { label: 'Pre-AI · autocomplete workflows' },
    { label: 'ChatGPT assistance · copy/paste workflows' },
    { label: 'IDE plugins / CLI tools · manual agent control', active: true },
    { label: 'Agentic systems · automated development lifecycle' },
  ]}
/>
```

Use `index` when the existing slide uses labels like `L1`, `P1`, or `/01`.

### Tool card grid with chips

```tsx
<CardGrid columns={3} equalHeight>
  <Card
    index="/01"
    title="CLI agents"
    description="Headless agents for automation and pipelines."
    chips={[{ label: 'OpenCode' }, { label: 'Hermes' }, { label: 'PI', href: 'https://pi.dev/', icon: 'external' }]}
  />
</CardGrid>
```

### Card containing a list

```tsx
<Card title="AI-driven UI" eyebrow="Pattern">
  <DeckList
    variant="compact"
    items={[
      { label: 'Reusable components' },
      { label: 'Layout engine', chips: [{ label: 'Flexbox' }] },
    ]}
  />
</Card>
```

### Media / preview card

```tsx
<Card
  variant="elevated"
  media={<img src="assets/preview.webp" alt="Interface preview" loading="lazy" />}
  mediaPosition="top"
  mediaAspect="wide"
  eyebrow="Preview"
  title="Generated interface"
  description="The media preview is still just a Card."
/>
```

### Target / highlight card

```tsx
<Card
  variant="target"
  eyebrow="Target"
  title="Magic Leap"
  description="Delivery device — design had to fit its optics."
/>
```

### Inline chips/tags inside list rows

```tsx
<DeckList
  variant="compact"
  items={[
    {
      label: 'Harness slide capsules',
      chips: [{ label: 'React' }, { label: 'Tailwind' }],
      tags: [{ label: 'Reusable' }],
    },
  ]}
/>
```

## Conventions

- Keep primitive styling in `presentation.css` and token-backed.
- Deck theme differences should come from deck variables such as `--accent`, `--surface`, `--border`, and the aliases in `presentation.css`.
- Page CSS may add layout-only positioning, but should not define new card/list/chip/tag visual systems.
- If a new visual need appears, add a prop or variant to the existing primitive first.
- Domain-specific wrappers are acceptable only when they render these primitives internally without adding new visual rules.
