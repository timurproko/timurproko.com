// Keeps the very first paint dark for dark entry slides. Prevents the white
// overlay flash when refreshing on the cover or final end slide.
export function initChromeBoot(config) {
  try {
    var params = new URLSearchParams(window.location.search);
    var preview = params.get('preview') === 'cover';
    var saved = parseInt(localStorage.getItem(config.storageKey) || '0', 10);
    var startsOnDarkSlide = preview || isNaN(saved) || config.darkSlides.indexOf(saved) !== -1;
    document.body.classList.toggle('chrome-on-dark', startsOnDarkSlide);
  } catch (_) {
    document.body.classList.add('chrome-on-dark');
  }
}
