// Light / dark theme. Loaded as a classic (blocking) script in <head> so the
// theme is applied before first paint, then adds the toggle button to the nav.
// Until the visitor picks a theme it follows their local time: dark at night,
// light during the day. A pick is stored in localStorage, always wins, and is
// shared with every page (and the home page's preview iframes) via the storage event.
(function () {
  var KEY = 'theme';
  var root = document.documentElement;
  // Local hours counted as night: from NIGHT_START until DAY_START
  var NIGHT_START = 20;
  var DAY_START = 7;

  function saved() {
    try {
      var value = localStorage.getItem(KEY);
      return value === 'dark' || value === 'light' ? value : null;
    } catch (_) {
      return null;
    }
  }

  function preferred() {
    return saved() || byTime();
  }

  function byTime() {
    var hour = new Date().getHours();
    return hour >= NIGHT_START || hour < DAY_START ? 'dark' : 'light';
  }

  function syncMeta(theme) {
    var metas = document.querySelectorAll('meta[name="theme-color"]');
    for (var i = 0; i < metas.length; i++) {
      var meta = metas[i];
      if (!meta.hasAttribute('data-light')) meta.setAttribute('data-light', meta.content);
      meta.content = theme === 'dark' ? '#121418' : meta.getAttribute('data-light');
    }
  }

  function syncButton(theme) {
    var button = document.querySelector('.theme-toggle');
    if (!button) return;
    var next = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', 'Switch to ' + next + ' theme');
    button.title = 'Switch to ' + next + ' theme';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    syncMeta(theme);
    syncButton(theme);
  }

  function toggle() {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (_) {}
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !reduce) {
      document.startViewTransition(function () { apply(next); });
    } else {
      apply(next);
    }
  }

  var SUN = '<svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/></svg>';
  var MOON = '<svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/></svg>';

  function mountButton() {
    var links = document.querySelector('nav .nav-links');
    if (!links || links.querySelector('.theme-toggle')) return;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.innerHTML = SUN + MOON;
    button.addEventListener('click', toggle);
    links.appendChild(button);
    syncButton(root.getAttribute('data-theme'));
  }

  apply(preferred());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(preferred()); mountButton(); });
  } else {
    mountButton();
  }

  window.addEventListener('storage', function (event) {
    if (event.key === KEY) apply(preferred());
  });
  // A page left open across sunset or sunrise switches over on its own
  function followClock() {
    if (!saved() && root.getAttribute('data-theme') !== byTime()) apply(byTime());
  }
  setInterval(followClock, 60 * 1000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) followClock();
  });
})();
