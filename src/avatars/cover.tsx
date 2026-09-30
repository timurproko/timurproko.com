/**
 * Digital Human — deck cover only.
 * The case page lives at /avatars/; this renders the 3D cover the home page
 * previews (/avatars/?preview=cover redirects to /avatars/cover/).
 */
import { createRoot } from 'react-dom/client';
import '../styles/deck.css';
import './page.css';
import '../styles/deck-common.css';
import { Deck, DeckConfig } from '../deck/Deck';
import { CoverArt3D, CoverSlide } from '../components';
import { initCover3d } from './cover3d.js';

const deckConfig: DeckConfig = {
  storageKey: 'avatar-solutions-deck-position',
  darkSlides: [0],
  tag: 'Overview',
  deckTitle: 'Digital Human',
  fx: [initCover3d],
};

createRoot(document.getElementById('root')!).render(
  <Deck config={deckConfig}>
    <CoverSlide
      key="cover"
      label="01 Cover"
      kicker="Avatar Creation Pipeline"
      title={<>Digital<br />Human</>}
      description="3D Design · Technical Art · XR Development"
      art={<CoverArt3D />}
    />
  </Deck>,
);
