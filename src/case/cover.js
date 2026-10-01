// Home page cards load case pages with ?preview=cover and post
// preview-cover:start/stop on hover, like the deck covers.
// Optional hooks let a page drive its own cover motion (e.g. A1's terminal).
export function setupCover(image, { onStart, onStop } = {}) {
  const root = document.documentElement;
  const cover = document.querySelector('.cover');
  if (cover && image) cover.style.setProperty('--cover-image', `url(${image})`);

  function play(active) {
    if (!root.classList.contains('preview-cover')) return false;
    root.classList.remove('cover-reveal', 'preview-cover-motion-active');
    void root.offsetWidth; // restart the reveal
    root.classList.add('cover-reveal');
    root.classList.toggle('preview-cover-motion-active', active);
    if (active) onStart?.();
    return true;
  }

  window.startPreviewCoverAnimation = () => play(true);
  window.stopPreviewCoverAnimation = () => {
    root.classList.remove('preview-cover-motion-active');
    onStop?.();
    return true;
  };
  window.addEventListener('message', event => {
    if (event.data?.type === 'preview-cover:start') window.startPreviewCoverAnimation();
    if (event.data?.type === 'preview-cover:stop') window.stopPreviewCoverAnimation();
  });
  play(false);
}
