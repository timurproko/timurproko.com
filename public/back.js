// Back button on case pages and the CV. When the visitor got here from another
// page of this site it steps back like the browser's Back, so moving between
// cases unwinds the way they came. Opened from elsewhere (a shared link, a new
// tab) it keeps its plain href and goes to the portfolio.
(function () {
  function cameFromThisSite() {
    try {
      return history.length > 1 && !!document.referrer && new URL(document.referrer).origin === location.origin;
    } catch (_) {
      return false;
    }
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a.back-shortcut');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    // Let modified clicks open the portfolio in a new tab as usual
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!cameFromThisSite()) return;
    event.preventDefault();
    history.back();
  });
})();
