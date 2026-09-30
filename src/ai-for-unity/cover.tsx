/**
 * AI for Unity Development — deck cover only.
 * The case page lives at /ai-for-unity/; this renders the 3D scene-view cover the
 * home page previews (/ai-for-unity/?preview=cover redirects to /ai-for-unity/cover/).
 */
import { createRoot } from 'react-dom/client';
import '../styles/deck.css';
import './page.css';
import '../styles/deck-common.css';
import { Deck, DeckConfig } from '../deck/Deck';
import { CoverArt3D, CoverSlide } from '../components';
import { initCover3d } from './cover3d.js';

const deckConfig: DeckConfig = {
  storageKey: 'ai-unity-deck-position',
  darkSlides: [0],
  tag: 'Trend',
  deckTitle: 'AI for Unity Development',
  fx: [initCover3d],
};

createRoot(document.getElementById('root')!).render(
  <Deck config={deckConfig}>
    <CoverSlide
      key="cover"
      label="01 Cover"
      kicker="From hype to production"
      title={<>AI for Unity<br />development</>}
      description="Engineering · Tooling · Workflows"
      art={<CoverArt3D />}
    />
  </Deck>,
);
