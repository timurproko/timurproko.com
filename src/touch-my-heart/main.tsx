import { createRoot } from 'react-dom/client';
import '../styles/deck.css';
import './page.css';
import '../styles/deck-common.css';
import { Deck } from '../deck/Deck';
import { slides, deckConfig } from './slides';

createRoot(document.getElementById('root')!).render(<Deck config={deckConfig}>{slides}</Deck>);
