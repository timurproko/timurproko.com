import { setupCover } from '../case/cover.js';
import { setupFooterYear } from '../case/footer-year.js';
import { createCoverTerminal } from './cover-terminal.js';
import { setupStage } from './stage.js';

setupStage(document.querySelector('.a1-stage'));
// Home page preview cover: an animated terminal session instead of an image.
const terminal = createCoverTerminal(document.querySelector('.cover-terminal'));
setupCover(null, { onStart: terminal.start, onStop: terminal.stop });
setupFooterYear();
