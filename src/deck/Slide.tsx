import { ReactNode } from 'react';

export interface SlideProps {
  /** Screen label used by tooling and previews, e.g. "04 Pipeline". */
  label: string;
  /** Speaker notes shown in the notes line / presenter tools. */
  notes?: string;
  /** Extra classes: "hero center dark", "slide-no-scroll", ... */
  className?: string;
  /** Slide tag rendered top-left, e.g. "Process · Face Reconstruction". */
  tag?: string;
  /** Standard slide headline (h2.deck-headline). */
  headline?: ReactNode;
  /** Standard slide subtitle/subheader (p.deck-subhead). */
  subhead?: ReactNode;
  /**
   * Wrap children in the shared slide body rail. Defaults to true for standard
   * content slides that use the shared headline/subhead slots. Legacy art slides
   * can opt out with body={false}.
   */
  body?: boolean;
  /** Reusable content-body variant hook for graph/grid/list/scroll styling. */
  bodyVariant?: 'default' | 'graph' | 'grid' | 'list' | 'scroll' | 'centered';
  /** Slightly denser shared header spacing for rare long-title slides. */
  compactHeader?: boolean;
  children?: ReactNode;
}

const SPECIAL_LAYOUT_CLASS = /(?:^|\s)(?:hero|slide-section|slide-zx-end|pdf-page-slide)(?:\s|$)/;

/** Standard slide: section.slide + optional tag + headline + subhead + shared body rail. */
export function Slide({
  label,
  notes,
  className,
  tag,
  headline,
  subhead,
  body,
  bodyVariant = 'default',
  compactHeader,
  children,
}: SlideProps) {
  const classNames = ['slide', className, subhead ? 'has-subhead' : '', compactHeader ? 'compact-header' : '']
    .filter(Boolean)
    .join(' ');
  const isSpecialLayout = className ? SPECIAL_LAYOUT_CLASS.test(className) : false;
  const shouldWrapBody = Boolean(children) && (body ?? (!isSpecialLayout && Boolean(headline || subhead)));
  const sectionClassName = shouldWrapBody ? `${classNames} has-body` : classNames;

  return (
    <section
      className={sectionClassName}
      data-screen-label={label}
      data-notes={notes}
      data-body-variant={shouldWrapBody ? bodyVariant : undefined}
    >
      {tag && <span className="slide-tag">{tag}</span>}
      {headline && <h2 className="deck-headline">{headline}</h2>}
      {subhead && <p className="deck-subhead">{subhead}</p>}
      {shouldWrapBody ? <div className="deck-body" data-body-variant={bodyVariant}>{children}</div> : children}
    </section>
  );
}
