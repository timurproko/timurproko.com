/**
 * CorelDRAW for macOS — deck cover only.
 * The case page lives at /corel-for-mac/; this renders the balloon cover the
 * home page previews (/corel-for-mac/?preview=cover redirects here).
 */
import { createRoot } from 'react-dom/client';
import '../styles/deck.css';
import './page.css';
import '../styles/deck-common.css';
import { Deck, DeckConfig } from '../deck/Deck';
import { CoverArt3D, CoverSlide } from '../components';
import { initCoverBalloon } from './cover-balloon.js';

const deckConfig: DeckConfig = {
  storageKey: 'coreldraw-macos-deck-position',
  darkSlides: [0],
  tag: 'Overview',
  deckTitle: 'CorelDRAW for macOS',
  fx: [initCoverBalloon],
};

createRoot(document.getElementById('root')!).render(
  <Deck config={deckConfig}>
    <CoverSlide
      key="cover"
      label="01 Cover"
      kicker="UX Case Study · Graphics Suite"
      title={<>CorelDRAW<br />for macOS</>}
      description="DESIGN STRATEGY · UX/UI DESIGN"
      art={
        <CoverArt3D>
        <svg className="cover-balloon" viewBox="0 0 300 400" role="img" aria-label="Hot-air balloon">
          <defs>
            <linearGradient id="gBody" x1="0.28" y1="0.02" x2="0.66" y2="1">
              <stop offset="0" stopColor="#0a4a2b" />
              <stop offset="0.26" stopColor="#0f8347" />
              <stop offset="0.54" stopColor="#1cb463" />
              <stop offset="0.8" stopColor="#3fe084" />
              <stop offset="1" stopColor="#9bf7c6" />
            </linearGradient>
            <radialGradient id="gShine" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.07" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gBasket" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#22c55e" />
              <stop offset="1" stopColor="#8ff3bf" />
            </linearGradient>
            <clipPath id="balloonClip"><path d="M150 336 C106 316 32 250 32 150 C32 54 92 12 150 12 C208 12 268 54 268 150 C268 250 194 316 150 336 Z" /></clipPath>
          </defs>
          {/* body */}
          <path d="M150 336 C106 316 32 250 32 150 C32 54 92 12 150 12 C208 12 268 54 268 150 C268 250 194 316 150 336 Z" fill="url(#gBody)" />
          {/* glossy highlights, clipped to the canopy */}
          <g clipPath="url(#balloonClip)">
            <ellipse cx="118" cy="132" rx="62" ry="112" transform="rotate(-24 118 132)" fill="url(#gShine)" />
          </g>
          {/* subtle edge */}
          <path d="M150 336 C106 316 32 250 32 150 C32 54 92 12 150 12 C208 12 268 54 268 150 C268 250 194 316 150 336 Z" fill="none" stroke="rgba(5,40,22,0.28)" strokeWidth="1.4" />
          {/* ropes + basket */}
          <path d="M146 336 L138 360 M154 336 L162 360" stroke="rgba(200,250,220,0.5)" strokeWidth="2.2" fill="none" />
          <path d="M135 360 L165 360 L171 390 L129 390 Z" fill="url(#gBasket)" stroke="rgba(6,45,26,0.25)" strokeWidth="1" />
          <ellipse cx="150" cy="363" rx="15" ry="3" fill="#ffffff" opacity="0.28" />
        </svg>
        </CoverArt3D>
      }
    />
  </Deck>,
);
