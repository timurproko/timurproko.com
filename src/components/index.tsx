import { CSSProperties, ReactNode } from 'react';

/* ---------------------------------------------------------------- slides */

/**
 * Standard dark cover slide: kicker, hero title, rule, speaker meta.
 * Page-specific cover art (3D host, illustration) goes into `art`.
 */
export function CoverSlide(props: {
  label?: string;
  notes?: string;
  kicker?: string;
  title: ReactNode;
  description: string;
  speaker?: string;
  art?: ReactNode;
}) {
  return (
    <section className="slide hero center dark" data-screen-label={props.label ?? '01 Cover'} data-notes={props.notes}>
      {props.art}
      {props.kicker && <div className="kicker">{props.kicker}</div>}
      <h1 className="h-hero">{props.title}</h1>
      <div className="cover-rule"></div>
      <div className="cover-meta">
        <span className="speaker">{props.speaker ?? 'Timur Prokopiev'}</span>
        <span className="cover-desc">{props.description}</span>
      </div>
    </section>
  );
}

/** Host element for the three.js cover object (initCover3d targets it). */
export function CoverArt3D({ children }: { children?: ReactNode }) {
  return <div className="cover-heart" id="coverHeart" aria-hidden="true">{children}</div>;
}

/** Standard "Thank You" end slide with the animated canvas art. */
export function EndSlide(props: { label: string; notes?: string; subhead?: string; tapCompute?: boolean }) {
  return (
    <section className="slide slide-zx-end slide-no-scroll dark" data-screen-label={props.label} data-notes={props.notes}>
      <span className="slide-tag">The End</span>
      <h2 className="deck-headline">Thank You</h2>
      <p className="deck-subhead zx-end-subhead">{props.subhead ?? 'Questions?'}</p>
      <div className="zx-demo" aria-hidden="true">
        <div className="zx-cube-frame">
          <canvas className="zx-cube-canvas" id="zxCanvasCube" width="600" height="600"></canvas>
        </div>
        {props.tapCompute && (
          <div className="zx-tap-compute">
            <span className="desktop-label">CLICK TO COMPUTE</span>
            <span className="mobile-label">TAP TO COMPUTE</span>
          </div>
        )}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- layouts */

/** Two-column text + media slide body (text left, media right). */
export function SplitMedia({ text, media }: { text: ReactNode; media: ReactNode }) {
  return (
    <div className="split-media">
      <div className="col-text">{text}</div>
      <div className="col-media">{media}</div>
    </div>
  );
}

/* ------------------------------------------------------------ primitives */

/** Standard media frame. Wraps an image, video or custom content. */
export function Media(props: {
  ariaLabel?: string;
  parallax?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const cls = ['media-ph', props.parallax ? 'parallax-media' : '', props.className ?? '']
    .filter(Boolean)
    .join(' ');
  return <div className={cls} aria-label={props.ariaLabel}>{props.children}</div>;
}

/** Lazy still image inside a Media frame. */
export function Img({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} />;
}

/** Muted looping video; the deck engine plays it on hover/visibility. */
export function VideoLoop({ src }: { src: string }) {
  return <video src={src} muted loop playsInline preload="metadata" />;
}

/** Arrow bullet list. */
export function ArrowList({ tight, style, items }: { tight?: boolean; style?: CSSProperties; items: ReactNode[] }) {
  return (
    <ul className={tight ? 'arrow-list tight' : 'arrow-list'} style={style}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

/** Standard slide subhead paragraph. */
export function Subhead({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p className="deck-subhead" style={style}>{children}</p>;
}

/** Small note line under content. */
export function Note({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p className="ui-note" style={style}>{children}</p>;
}

/** Labelled tag row (e.g. "Delivered for" + tags). */
export function TagRow(props: { label?: string; tags?: string[]; style?: CSSProperties }) {
  return (
    <div className="mcp-tags" style={props.style}>
      {props.label && <span className="mcp-tags-label">{props.label}</span>}
      {(props.tags ?? []).map((t) => <span key={t} className="tag">{t}</span>)}
    </div>
  );
}

/* ----------------------------------------------------------- pipeline */

export interface PipelineStepData {
  title: string;
  desc: string;
  tools: string[];
}

/** Numbered pipeline rows with per-row reveal animation. */
export function Pipeline({ steps, baseDelayMs = 60, stepDelayMs = 50 }: {
  steps: PipelineStepData[];
  baseDelayMs?: number;
  stepDelayMs?: number;
}) {
  return (
    <div className="pipeline">
      {steps.map((s, i) => (
        <div
          key={s.title}
          className="pipe-step"
          data-anim=""
          style={{ '--anim-delay': `${baseDelayMs + i * stepDelayMs}ms` } as CSSProperties}
        >
          <div className="pipe-idx">{String(i + 1).padStart(2, '0')}</div>
          <div className="pipe-body">
            <div className="pipe-title">{s.title}</div>
            <div className="pipe-desc">{s.desc}</div>
          </div>
          <div className="pipe-tools">
            {s.tools.map((t) => <span key={t}>{t}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------- mesh compare */

/** Before/after image compare with a draggable divider (engine-driven). */
export function MeshCompare(props: {
  ariaLabel: string;
  before: { src: string; alt: string; label: string };
  after: { src: string; alt: string; label: string };
}) {
  return (
    <div className="media-ph mesh-compare-media" data-mesh-compare="" aria-label={props.ariaLabel} tabIndex={0}>
      <div className="mesh-compare">
        <img className="compare-before" src={props.before.src} alt={props.before.alt} loading="lazy" decoding="async" draggable={false} />
        <img className="compare-after" src={props.after.src} alt={props.after.alt} loading="lazy" decoding="async" draggable={false} />
        <span className="mesh-compare-label after">{props.after.label}</span>
        <span className="mesh-compare-label before">{props.before.label}</span>
        <span className="mesh-compare-line" aria-hidden="true"></span>
        <span className="mesh-compare-handle" aria-hidden="true"></span>
      </div>
    </div>
  );
}
