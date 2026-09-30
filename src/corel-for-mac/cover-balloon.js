// Cover balloon motion for the home page preview card (?preview=cover).
export function initCoverBalloon() {
  var previewCoverMode = new URLSearchParams(window.location.search).get('preview') === 'cover';
  if (!previewCoverMode) return;

  var balloon = document.querySelector('.cover-balloon');
  if (!balloon || balloon.dataset.previewMotionReady) return;
  balloon.dataset.previewMotionReady = '1';

  var returnTimer = 0;
  var initialTransform = 'translate(-50%,-53%)';
  var easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';

  function clearReturn() {
    window.clearTimeout(returnTimer);
    returnTimer = 0;
    balloon.style.transition = '';
    balloon.style.animation = '';
    balloon.style.transform = '';
  }

  function startPreviewMotion() {
    clearReturn();
  }

  function stopPreviewMotion() {
    window.clearTimeout(returnTimer);
    var currentTransform = getComputedStyle(balloon).transform;
    if (!currentTransform || currentTransform === 'none') currentTransform = initialTransform;

    balloon.style.transition = 'none';
    balloon.style.animation = 'none';
    balloon.style.transform = currentTransform;
    void balloon.getBoundingClientRect();
    balloon.style.transition = 'transform 560ms ' + easeOut;
    balloon.style.transform = initialTransform;

    returnTimer = window.setTimeout(function () {
      returnTimer = 0;
      balloon.style.transition = '';
      balloon.style.transform = '';
      // Keep the CSS keyframe disabled while the card is not hovered, so the
      // parent iframe pause cannot freeze the balloon at a random offset.
      balloon.style.animation = 'none';
    }, 580);
  }

  window.addEventListener('preview-cover-motion-start', startPreviewMotion);
  window.addEventListener('preview-cover-motion-stop', stopPreviewMotion);
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'preview-cover:start') startPreviewMotion();
    if (event.data && event.data.type === 'preview-cover:stop') stopPreviewMotion();
  });
}
