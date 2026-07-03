import { CSSProperties, ReactNode } from 'react';

export type AccentTone = 'blue' | 'teal' | 'green' | 'red' | 'pink' | 'neutral';

export type DeckChip = {
  label: ReactNode;
  href?: string;
  icon?: 'link' | 'external' | 'none';
  tone?: AccentTone | 'neutral';
};

export type DeckTag = {
  label: ReactNode;
  tone?: AccentTone | 'neutral';
};

export type DeckListItem = {
  label: ReactNode;
  index?: string | number;
  description?: ReactNode;
  muted?: boolean;
  active?: boolean;
  chips?: DeckChip[];
  tags?: DeckTag[];
};

export type DeckCard = {
  eyebrow?: ReactNode;
  index?: string | number;
  title?: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  mediaPosition?: 'top' | 'left' | 'right' | 'background';
  mediaAspect?: 'wide' | 'square' | 'portrait' | string;
  chips?: DeckChip[];
  tags?: DeckTag[];
  items?: DeckListItem[];
  variant?: CardVariant;
  tone?: AccentTone;
};

export type CardVariant = 'plain' | 'elevated' | 'soft' | 'accent' | 'active' | 'target' | 'dark';
export type ListVariant = 'bullet' | 'numbered' | 'rows' | 'compact';
export type CardDensity = 'normal' | 'compact' | 'loose';

type PrimitiveProps = {
  className?: string;
  style?: CSSProperties;
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function toneClass(tone?: AccentTone | 'neutral') {
  return tone ? `deck-tone-${tone}` : undefined;
}

function linkGlyph(icon?: DeckChip['icon']) {
  if (icon === 'none') return null;
  if (icon === 'external') return '↗';
  if (icon === 'link') return '🔗';
  return null;
}

export function Chip(props: DeckChip & PrimitiveProps) {
  const cls = cx('deck-chip', toneClass(props.tone), props.className);
  const content = (
    <>
      <span className="deck-chip-label">{props.label}</span>
      {linkGlyph(props.icon) && <span className="deck-chip-icon" aria-hidden="true">{linkGlyph(props.icon)}</span>}
    </>
  );

  return props.href ? (
    <a className={cls} href={props.href} target="_blank" rel="noreferrer" style={props.style}>{content}</a>
  ) : (
    <span className={cls} style={props.style}>{content}</span>
  );
}

export function ChipGroup({ chips, children, className, style }: PrimitiveProps & { chips?: DeckChip[]; children?: ReactNode }) {
  return (
    <div className={cx('deck-chip-group', className)} style={style}>
      {chips?.map((chip, i) => <Chip key={`${String(chip.label)}-${i}`} {...chip} />)}
      {children}
    </div>
  );
}

export function Tag(props: DeckTag & PrimitiveProps) {
  return <span className={cx('deck-tag-pill', toneClass(props.tone), props.className)} style={props.style}>{props.label}</span>;
}

export function TagGroup({ label, tags, children, className, style }: PrimitiveProps & { label?: ReactNode; tags?: DeckTag[]; children?: ReactNode }) {
  return (
    <div className={cx('deck-tag-group', className)} style={style}>
      {label && <span className="deck-tag-group-label">{label}</span>}
      {tags?.map((tag, i) => <Tag key={`${String(tag.label)}-${i}`} {...tag} />)}
      {children}
    </div>
  );
}

export function DeckList(props: PrimitiveProps & {
  variant?: ListVariant;
  items?: DeckListItem[] | ReactNode[];
  children?: ReactNode;
  sectionLabel?: ReactNode;
  tight?: boolean;
  marker?: ReactNode;
}) {
  const variant = props.variant ?? 'bullet';
  const ordered = variant === 'numbered' || variant === 'rows';
  const ListTag = ordered ? 'ol' : 'ul';
  const legacyClass = variant === 'bullet' ? 'arrow-list' : variant === 'rows' || variant === 'numbered' ? 'progression' : 'deck-list-compact';

  return (
    <>
      {props.sectionLabel && <div className="deck-section-label">{props.sectionLabel}</div>}
      <ListTag className={cx('deck-list', `deck-list-${variant}`, legacyClass, props.tight && 'tight', props.className)} style={props.style}>
        {props.items?.map((item, i) => {
          const normalized: DeckListItem = isDeckListItem(item) ? item : { label: item };
          return (
            <li key={i} className={cx('deck-list-item', normalized.muted && 'is-muted', normalized.active && 'is-active', normalized.active && 'here', legacyClass === 'progression' && 'step')}>
              {ordered && <span className="idx deck-list-index">{normalized.index ?? String(i + 1).padStart(2, '0')}</span>}
              {!ordered && props.marker && <span className="deck-list-marker" aria-hidden="true">{props.marker}</span>}
              <span className="deck-list-content">
                <span className="deck-list-label">{normalized.label}</span>
                {normalized.description && <span className="deck-list-description">{normalized.description}</span>}
                {normalized.chips && <ChipGroup chips={normalized.chips} />}
                {normalized.tags && <TagGroup tags={normalized.tags} />}
              </span>
            </li>
          );
        })}
        {props.children}
      </ListTag>
    </>
  );
}

function isDeckListItem(item: ReactNode | DeckListItem): item is DeckListItem {
  return typeof item === 'object' && item !== null && 'label' in item;
}

export function BulletList(props: Omit<Parameters<typeof DeckList>[0], 'variant'>) {
  return <DeckList {...props} variant="bullet" />;
}

export function Card(props: DeckCard & PrimitiveProps & {
  children?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  as?: 'article' | 'div' | 'li' | 'section';
  density?: CardDensity;
}) {
  const Element = props.as ?? 'article';
  const variant = props.variant ?? 'plain';
  const mediaPosition = props.mediaPosition ?? (props.media ? 'top' : undefined);
  const hasContent = props.eyebrow || props.index !== undefined || props.title || props.description || props.chips?.length || props.tags?.length || props.items?.length || props.children || props.footer || props.actions;

  return (
    <Element
      className={cx(
        'deck-card',
        `deck-card-${variant}`,
        mediaPosition && `deck-card-media-${mediaPosition}`,
        props.mediaAspect && `deck-card-aspect-${props.mediaAspect}`,
        props.density && `deck-card-density-${props.density}`,
        toneClass(props.tone),
        props.className,
      )}
      style={props.style}
    >
      {props.media && <div className="deck-card-media">{props.media}</div>}
      {hasContent && (
        <div className="deck-card-body">
          {(props.eyebrow || props.index !== undefined) && (
            <div className="deck-card-meta">
              {props.index !== undefined && <span className="deck-card-index">{typeof props.index === 'number' ? String(props.index).padStart(2, '0') : props.index}</span>}
              {props.eyebrow && <span className="deck-card-eyebrow">{props.eyebrow}</span>}
            </div>
          )}
          {props.title && <h3 className="deck-card-title">{props.title}</h3>}
          {props.description && <p className="deck-card-description">{props.description}</p>}
          {props.chips && <ChipGroup chips={props.chips} />}
          {props.tags && <TagGroup tags={props.tags} />}
          {props.items && <DeckList variant="compact" items={props.items} />}
          {props.children}
          {(props.footer || props.actions) && <div className="deck-card-footer">{props.footer}{props.actions}</div>}
        </div>
      )}
    </Element>
  );
}

export function CardGrid(props: PrimitiveProps & {
  cards?: DeckCard[];
  children?: ReactNode;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'sm' | 'md' | 'lg';
  equalHeight?: boolean;
  density?: CardDensity;
}) {
  const style = {
    ...props.style,
    ...(props.columns ? { '--deck-card-grid-columns': props.columns === 'auto' ? 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))' : `repeat(${props.columns}, minmax(0, 1fr))` } : {}),
  } as CSSProperties;

  return (
    <div className={cx('deck-card-grid', props.gap && `deck-card-grid-gap-${props.gap}`, props.equalHeight && 'deck-card-grid-equal', props.density && `deck-card-density-${props.density}`, props.className)} style={style}>
      {props.cards?.map((card, i) => <Card key={`${String(card.title ?? card.eyebrow ?? 'card')}-${i}`} {...card} density={props.density} />)}
      {props.children}
    </div>
  );
}

export function CardList(props: PrimitiveProps & {
  cards?: DeckCard[];
  items?: DeckListItem[];
  children?: ReactNode;
  variant?: ListVariant;
  card?: DeckCard;
}) {
  if (props.card || props.items) {
    return (
      <Card {...(props.card ?? {})} className={props.className} style={props.style}>
        <DeckList variant={props.variant ?? 'compact'} items={props.items} />
        {props.children}
      </Card>
    );
  }

  return (
    <div className={cx('deck-card-list', props.className)} style={props.style}>
      {props.cards?.map((card, i) => <Card key={`${String(card.title ?? card.eyebrow ?? 'card')}-${i}`} {...card} />)}
      {props.children}
    </div>
  );
}
