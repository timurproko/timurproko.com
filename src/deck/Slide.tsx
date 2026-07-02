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
  children?: ReactNode;
}

/** Standard slide: section.slide + optional tag + headline + subhead, then content. */
export function Slide({ label, notes, className, tag, headline, subhead, children }: SlideProps) {
  return (
    <section
      className={className ? `slide ${className}` : 'slide'}
      data-screen-label={label}
      data-notes={notes}
    >
      {tag && <span className="slide-tag">{tag}</span>}
      {headline && <h2 className="deck-headline">{headline}</h2>}
      {subhead && <p className="deck-subhead">{subhead}</p>}
      {children}
    </section>
  );
}
