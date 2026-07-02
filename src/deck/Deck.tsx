import { ReactNode, useEffect, useRef, Children } from 'react';
import { initChromeBoot } from './engine/chrome-boot.js';
import { initAnimations } from './engine/animations.js';
import { initVenn } from './engine/venn.js';
import { initDeckNav } from './engine/deck-nav.js';
import { initPageMeta } from './engine/page-meta.js';

export interface DeckConfig {
  /** localStorage key that remembers the deck position (page-unique). */
  storageKey: string;
  /** Slide indices that use the dark chrome theme (cover, sections, end). */
  darkSlides: number[];
  /** Initial deck tag shown top-left before the engine takes over. */
  tag: string;
  /** Deck title shown next to the speaker in the credit line. */
  deckTitle: string;
  /** Credit line speaker. */
  speaker?: string;
  /**
   * Page-specific effects (hero canvas, three.js cover object, ...).
   * Each is called once after the deck markup is mounted.
   */
  fx?: Array<() => void>;
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Standard deck layout: fixed chrome (back link, tag, counter, credit,
 * swipe hint, nav buttons, notes) around an ordered list of <Slide> children.
 * Boots the shared deck engine (navigation, animations, chrome theme) once.
 */
export function Deck({ config, children }: { config: DeckConfig; children: ReactNode }) {
  const total = Children.count(children);
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return; // engine binds global listeners — boot once
    booted.current = true;
    initChromeBoot({ storageKey: config.storageKey, darkSlides: config.darkSlides });
    (config.fx || []).forEach((run) => run());
    initAnimations();
    initVenn();
    initDeckNav({ storageKey: config.storageKey });
    initPageMeta();
  }, []);

  return (
    <>
      <a className="deck-back" id="deckBack" href="../" aria-label="Back to main site">
        <span className="nav-action-label">Back</span>
      </a>
      <div className="deck-tag is-hidden" id="deckTag">{config.tag}</div>
      <div className="deck-counter" id="deckCounter">
        <span className="num">01</span>
        <span className="sep"> / </span>
        <span className="total">{pad(total)}</span>
      </div>
      <div className="deck-credit is-hidden" id="deckCredit">
        <span className="speaker">{config.speaker ?? 'Timur Prokopiev'}</span>
        <span className="deck-credit-extra"> &nbsp;·&nbsp; {config.deckTitle}</span>
      </div>
      <div className="mobile-swipe-hint" id="mobileSwipeHint" aria-hidden="true">
        <span className="swipe-prev"><span className="swipe-arrow">←</span><span className="swipe-label">Swipe</span></span>
        <span className="swipe-counter"><span className="num">01</span> / <span className="total">{pad(total)}</span></span>
        <span className="swipe-next"><span className="swipe-label">Swipe</span><span className="swipe-arrow">→</span></span>
      </div>
      <div className="nav-hint" aria-label="Slide navigation">
        <button type="button" data-deck-action="prev" aria-label="Previous slide">←</button>
        <button type="button" data-deck-action="next" aria-label="Next slide">→</button>
        <span className="nav-action-label">Slides</span> <span className="sep">·</span>
        <button type="button" className="key-space" data-deck-action="next" aria-label="Next slide">Space</button>
        <span className="nav-action-label">Next</span>
      </div>
      {children}
      <aside className="notes" id="notes"></aside>
    </>
  );
}
