/**
 * Touch My Heart — deck cover only.
 * The case page lives at /touch-my-heart/; this renders the 3D cover the home
 * page previews (/touch-my-heart/?preview=cover redirects to /touch-my-heart/cover/).
 */
import { createRoot } from 'react-dom/client';
import '../styles/deck.css';
import './page.css';
import '../styles/deck-common.css';
import { Deck, DeckConfig } from '../deck/Deck';
import { CoverArt3D, CoverSlide } from '../components';
import { initCover3d } from './cover3d.js';

const deckConfig: DeckConfig = {
  storageKey: 'touch-my-heart-deck-position',
  darkSlides: [0],
  tag: 'Trend',
  deckTitle: 'Touch My Heart',
  fx: [initCover3d],
};

createRoot(document.getElementById('root')!).render(
  <Deck config={deckConfig}>
    <CoverSlide
      key="cover"
      label="01 Cover"
      kicker="XR Experience · Magic Leap"
      title={<>Touch<br />My Heart</>}
      description="3D/UX Design · Technical Art · XR Development"
      art={<CoverArt3D />}
    />
  </Deck>,
);
