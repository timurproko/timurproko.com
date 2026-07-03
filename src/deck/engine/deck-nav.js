// Deck navigation engine (shared): scroll sync, keyboard, swipe, chrome, notes.
export function initDeckNav(config) {
  /*
    OD iframe-safe deck nav (simple-deck seed).
    Body/documentElement is the scroller — not a nested div inside a scaled canvas.
  */
  var STORAGE_KEY = config.storageKey;
  var PREVIEW_MODE = new URLSearchParams(window.location.search).get('preview') === 'cover';
  var slides = document.querySelectorAll('.slide');
  var notesEl = document.getElementById('notes');
  var active = 0;
  var programmaticTarget = null;
  var programmaticTimer = null;
  var deckSlidingTimer = null;
  var lastDeckScrollLeft = 0;
  var extendDeckNavHideTimer = function () {};

  function isMobileLayout() {
    return window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
  }

  function scrollContainers() {
    return [document.scrollingElement, document.documentElement, document.body]
      .filter(Boolean)
      .filter(function (el, idx, arr) { return arr.indexOf(el) === idx; });
  }
  function overflowX(el) {
    if (!el) return 0;
    return Math.max(0, (el.scrollWidth || 0) - (el.clientWidth || 0));
  }
  function scrollLeftOf(el) {
    if (!el) return 0;
    try { return Number(el.scrollLeft) || 0; } catch (_) { return 0; }
  }
  function activeScrollLeft() {
    var candidates = scrollContainers();
    var best = 0;
    for (var i = 0; i < candidates.length; i++) {
      var offset = scrollLeftOf(candidates[i]);
      if (Math.abs(offset) > Math.abs(best)) best = offset;
    }
    return best;
  }
  function scroller() {
    var candidates = scrollContainers();
    var best = candidates[0] || document.documentElement;
    var bestScore = -1;
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      var score = overflowX(el) + Math.abs(scrollLeftOf(el)) * 2;
      if (score > bestScore) {
        best = el;
        bestScore = score;
      }
    }
    return best;
  }
  function slideWidth() {
    return window.innerWidth || document.documentElement.clientWidth || 1920;
  }
  function scrollToLeft(left, behavior) {
    var candidates = scrollContainers();
    for (var i = 0; i < candidates.length; i++) {
      try { candidates[i].scrollLeft = left; } catch (_) {}
      try { candidates[i].scrollTo({ left: left, behavior: behavior || 'smooth' }); } catch (_) {}
    }
  }
  function scrollToSlide(i, behavior) {
    scrollToLeft(i * slideWidth(), behavior || 'smooth');
  }
  function updateNotes() {
    if (!notesEl || !notesEl.classList.contains('on')) return;
    var n = slides[active].dataset.notes || '';
    var l = slides[active].dataset.screenLabel || '';
    notesEl.innerHTML = n ? '<b>' + l + '</b>' + n : '';
  }
  function clearProgrammaticNavigation() {
    programmaticTarget = null;
    if (programmaticTimer) {
      clearTimeout(programmaticTimer);
      programmaticTimer = null;
    }
  }
  function markDeckSliding(settleDelay) {
    if (PREVIEW_MODE) return;
    document.body.classList.add('deck-is-sliding');
    if (deckSlidingTimer) clearTimeout(deckSlidingTimer);
    deckSlidingTimer = setTimeout(function () {
      document.body.classList.remove('deck-is-sliding');
      deckSlidingTimer = null;
      window.dispatchEvent(new CustomEvent('deck-slide-settled'));
    }, settleDelay || 180);
  }
  function beginProgrammaticNavigation(i) {
    programmaticTarget = i;
    markDeckSliding(920);
    if (programmaticTimer) clearTimeout(programmaticTimer);
    programmaticTimer = setTimeout(clearProgrammaticNavigation, 900);
  }
  function applyChromeTheme(i) {
    var slideEl = slides[i];
    var isDark = slideEl && slideEl.classList.contains('dark');
    document.body.classList.toggle('chrome-on-dark', !!isDark);
    var wasChromeBooting = document.body.classList.contains('chrome-boot');
    document.body.classList.remove('chrome-boot');
    if (wasChromeBooting) {
      window.dispatchEvent(new CustomEvent('deck-chrome-ready'));
    }
  }

  function applySlideChrome(i) {
    var dc = document.getElementById('deckCounter');
    var mh = document.getElementById('mobileSwipeHint');
    var cr = document.getElementById('deckCredit');
    var dt = document.getElementById('deckTag');
    var db = document.getElementById('deckBack');
    var slideEl = slides[i];
    var isHero = slideEl && slideEl.classList.contains('hero');
    var inSlideTag = slideEl && slideEl.querySelector(':scope > .slide-tag');

    // Update content silently — no fade between slides.
    var n = String(i + 1);
    if (n.length < 2) n = '0' + n;
    var t = String(slides.length);
    if (t.length < 2) t = '0' + t;
    if (dc) {
      var dcNum = dc.querySelector('.num');
      var dcTotal = dc.querySelector('.total');
      if (dcNum) dcNum.textContent = n;
      if (dcTotal) dcTotal.textContent = t;
    }
    if (mh) {
      var counter = mh.querySelector('.swipe-counter');
      if (counter) {
        var mhNum = counter.querySelector('.num');
        var mhTotal = counter.querySelector('.total');
        if (mhNum) mhNum.textContent = n;
        if (mhTotal) mhTotal.textContent = t;
      }
    }
    if (dt && !isHero && inSlideTag) {
      dt.textContent = inSlideTag.textContent;
    }
    if (db) {
      var isCover = i === 0;
      var dbLabel = db.querySelector('.nav-action-label');
      if (dbLabel) dbLabel.textContent = isCover ? 'TimurProko.com' : 'Home';
      else db.textContent = isCover ? 'TimurProko.com' : 'Home';
      db.setAttribute('aria-label', isCover ? 'Back to TimurProko.com' : 'Go to first slide');
      db.setAttribute('href', isCover ? '../' : '#cover');
    }

    // Text/counter updates immediately, and chrome color now eases between
    // light/dark themes instead of snapping or waiting until after the slide.
    applyChromeTheme(i);
    if (dc) dc.classList.toggle('is-hidden', i === 0);
    if (cr) cr.classList.toggle('is-hidden', i === 0);
    if (dt) dt.classList.toggle('is-hidden', isHero || !inSlideTag);
  }

  function setActive(i) {
    active = i;
    updateNotes();

    applySlideChrome(i);

    if (!PREVIEW_MODE) {
      try { localStorage.setItem(STORAGE_KEY, String(i)); } catch (_) {}
    }
  }
  function go(i, behavior) {
    var previous = active;
    var next = Math.max(0, Math.min(slides.length - 1, i));
    beginProgrammaticNavigation(next);
    setActive(next);
    scrollToSlide(next, behavior || 'smooth');
    if (previous === 0 && next === 1) extendDeckNavHideTimer();
  }
  function syncFromScroll() {
    var left = activeScrollLeft();
    if (Math.abs(left - lastDeckScrollLeft) > 1) markDeckSliding(180);
    lastDeckScrollLeft = left;

    var i = Math.round(left / slideWidth());
    if (programmaticTarget !== null) {
      if (i === programmaticTarget) clearProgrammaticNavigation();
      else return;
    }
    if (i !== active && i >= 0 && i < slides.length) {
      setActive(i);
    }
  }
  function isInteractiveKeyboardTarget(t) {
    if (!t) return false;
    if (t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.tagName === 'BUTTON') return true;
    if (t.tagName !== 'INPUT') return false;

    // Hidden deck-local radio controls can receive focus after their labels are
    // clicked. They should not trap the global slide keyboard shortcuts.
    if (t.type === 'radio' && t.tabIndex < 0) return false;

    return true;
  }
  function onKey(e) {
    if (e.defaultPrevented) return;
    var t = e.target;
    if (isInteractiveKeyboardTarget(t)) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      go(active + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      go(active - 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      go(0, 'instant');
    } else if (e.key === 'End') {
      e.preventDefault();
      go(slides.length - 1);
    } else if (e.key === 'n' || e.key === 'N') {
      if (notesEl) {
        notesEl.classList.toggle('on');
        updateNotes();
      }
    } else if (e.key === 'p' || e.key === 'P') {
      if (!(e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        window.print();
      }
    }
  }

  var deckBack = document.getElementById('deckBack');
  if (deckBack) {
    deckBack.addEventListener('click', function (e) {
      if (active === 0) return;
      e.preventDefault();
      go(0, 'instant');
    });
  }

  document.querySelectorAll('[data-deck-action]').forEach(function (button) {
    button.addEventListener('click', function () {
      var action = button.getAttribute('data-deck-action');
      if (action === 'prev') go(active - 1);
      if (action === 'next') go(active + 1);
    });
  });

  setupDeckNavigationAutoHide();
  setupHoverVideoPreviews();
  setupMeshComparePreviews();
  setupHeartStateTabs();
  setupBreakdownMobileDetails();

  window.addEventListener('keydown', onKey, true);
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('scroll', syncFromScroll, { passive: true, capture: true });
  window.addEventListener('scroll', syncFromScroll, { passive: true });

  if (!PREVIEW_MODE) {
    document.body.setAttribute('tabindex', '-1');
    document.body.style.outline = 'none';
    function focusDeck() {
      try { window.focus(); document.body.focus({ preventScroll: true }); } catch (_) {}
    }
    document.addEventListener('mousedown', focusDeck);
    document.addEventListener('pointerdown', focusDeck, { passive: true });
    if (document.readyState === 'complete') { focusDeck(); } else { window.addEventListener('load', focusDeck); }
    focusDeck();
  }

  function setupHeartStateTabs() {
    var slide = document.querySelector('[data-screen-label="09 Heart States"]');
    if (!slide) return;

    var grid = slide.querySelector('.state-grid');
    if (!grid || grid.querySelector('.state-tabs')) return;

    var states = Array.from(grid.querySelectorAll('.state'));
    if (!states.length) return;

    var tabs = document.createElement('div');
    tabs.className = 'state-tabs';
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Heart condition');
    tabs.setAttribute('data-anim', 'fadeUp');
    tabs.style.setProperty('--anim-name', 'fadeUp');
    tabs.style.setProperty('--anim-delay', '110ms');

    function playVideo(video) {
      if (!video) return;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('preload', 'auto');
      try {
        if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') promise.catch(function () {});
      } catch (_) {}
    }

    function pauseVideo(video) {
      if (!video) return;
      video.removeAttribute('autoplay');
      video.pause();
      try { video.currentTime = 0; } catch (_) {}
    }

    function selectState(index) {
      states.forEach(function (state, i) {
        var selected = i === index;
        var video = state.querySelector('video');
        state.classList.toggle('is-active', selected);
        state.setAttribute('aria-hidden', selected ? 'false' : 'true');
        if (tabs.children[i]) {
          tabs.children[i].classList.toggle('is-active', selected);
          tabs.children[i].setAttribute('aria-selected', selected ? 'true' : 'false');
          tabs.children[i].setAttribute('tabindex', selected ? '0' : '-1');
        }
        if (selected) playVideo(video);
        else pauseVideo(video);
      });
    }

    states.forEach(function (state, i) {
      var label = state.querySelector('.state-label');
      var title = label ? label.textContent.trim() : ('Condition ' + (i + 1));
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'state-tab';
      button.setAttribute('role', 'tab');
      button.textContent = title
        .replace('Normal heart', 'Normal')
        .replace('Aortic stenosis', 'Stenosis')
        .replace('Atrial fibrillation', 'Fibrillation');
      button.addEventListener('click', function () { selectState(i); });
      tabs.appendChild(button);
    });

    grid.parentNode.insertBefore(tabs, grid);
    selectState(0);
  }

  function setupBreakdownMobileDetails() {
    document.querySelectorAll('.breakdown-stage').forEach(function (stage) {
      var svg = stage.querySelector('.breakdown-svg');
      if (!svg || stage.querySelector('.breakdown-mobile-detail')) return;

      var detail = document.createElement('div');
      detail.className = 'breakdown-mobile-detail';
      detail.setAttribute('aria-live', 'polite');
      stage.appendChild(detail);

      var hotspots = Array.from(stage.querySelectorAll('.breakdown-hotspot'));
      if (!hotspots.length) return;

      function textFrom(hotspot, selector) {
        var node = hotspot.querySelector(selector);
        return node ? node.textContent.trim().replace(/\s+/g, ' ') : '';
      }

      function selectHotspot(hotspot) {
        hotspots.forEach(function (item) { item.classList.toggle('is-selected', item === hotspot); });
        var title = textFrom(hotspot, '.tip-title') || hotspot.getAttribute('aria-label') || 'Details';
        var copy = textFrom(hotspot, '.tip-copy');
        detail.innerHTML = '<strong>' + escapeHtml(title) + '</strong>' + (copy ? '<span>' + escapeHtml(copy) + '</span>' : '');
      }

      hotspots.forEach(function (hotspot) {
        hotspot.addEventListener('click', function () { selectHotspot(hotspot); });
        hotspot.addEventListener('focus', function () { selectHotspot(hotspot); });
      });
      selectHotspot(hotspots[0]);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char] || char;
    });
  }

  function setupHoverVideoPreviews() {
    document.querySelectorAll('.media-ph video').forEach(function (video) {
      var host = video.closest('.media-ph');
      if (!host) return;
      var trigger = video.closest('.state') || video.closest('.col-media') || host;

      video.muted = true;
      video.playsInline = true;
      video.pause();
      try { video.currentTime = 0; } catch (_) {}

      function playPreview() {
        try {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') promise.catch(function () {});
        } catch (_) {}
      }

      function pausePreview() {
        video.pause();
        try { video.currentTime = 0; } catch (_) {}
      }

      trigger.addEventListener('pointerenter', playPreview);
      trigger.addEventListener('pointerleave', pausePreview);
      trigger.addEventListener('mouseenter', playPreview);
      trigger.addEventListener('mouseleave', pausePreview);
      trigger.addEventListener('focusin', playPreview);
      trigger.addEventListener('focusout', pausePreview);
    });
  }

  function setupMeshComparePreviews() {
    document.querySelectorAll('[data-mesh-compare]').forEach(function (host) {
      var compare = host.querySelector('.mesh-compare');
      if (!compare) return;
      var activePointerId = null;

      function setComparePosition(clientX) {
        var rect = host.getBoundingClientRect();
        if (!rect.width) return;
        var percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        compare.style.setProperty('--compare-pos', percent.toFixed(2) + '%');
      }

      function resetComparePosition() {
        if (activePointerId !== null) return;
        compare.style.setProperty('--compare-pos', '50%');
      }

      host.addEventListener('pointerenter', function (event) {
        setComparePosition(event.clientX);
      });
      host.addEventListener('pointermove', function (event) {
        if (activePointerId !== null && event.pointerId !== activePointerId) return;
        setComparePosition(event.clientX);
      });
      host.addEventListener('pointerdown', function (event) {
        activePointerId = event.pointerId;
        try { host.setPointerCapture(event.pointerId); } catch (_) {}
        setComparePosition(event.clientX);
      });
      function endPointer(event) {
        if (activePointerId !== event.pointerId) return;
        activePointerId = null;
        try { host.releasePointerCapture(event.pointerId); } catch (_) {}
      }
      host.addEventListener('pointerup', endPointer);
      host.addEventListener('pointercancel', endPointer);
      host.addEventListener('pointerleave', resetComparePosition);
      host.addEventListener('blur', resetComparePosition);
    });
  }

  function setupDeckNavigationAutoHide() {
    if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

    var hideTimer = null;
    var showTimer = null;
    var hiddenPointer = null;
    var isIdle = false;
    var isHoveringChrome = false;
    var idleDelay = 4200;
    var revealDelay = 180;
    var revealDistance = 10;

    extendDeckNavHideTimer = function () {
      isIdle = false;
      hiddenPointer = null;
      clearShowTimer();
      document.body.classList.remove('deck-nav-idle');
      scheduleHide();
    };

    function clearShowTimer() {
      if (!showTimer) return;
      clearTimeout(showTimer);
      showTimer = null;
    }

    function scheduleHide() {
      if (hideTimer) clearTimeout(hideTimer);
      if (isHoveringChrome) return;
      hideTimer = setTimeout(function () {
        if (isHoveringChrome) return;
        isIdle = true;
        hiddenPointer = null;
        clearShowTimer();
        document.body.classList.add('deck-nav-idle');
      }, idleDelay);
    }

    function showNow() {
      isIdle = false;
      hiddenPointer = null;
      clearShowTimer();
      document.body.classList.remove('deck-nav-idle');
      scheduleHide();
    }

    function scheduleReveal() {
      if (showTimer) return;
      showTimer = setTimeout(showNow, revealDelay);
    }

    function onPointerMove(e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;

      if (!isIdle) {
        scheduleHide();
        return;
      }

      if (!hiddenPointer) {
        hiddenPointer = { x: e.clientX, y: e.clientY };
        return;
      }

      var dx = e.clientX - hiddenPointer.x;
      var dy = e.clientY - hiddenPointer.y;
      if (Math.hypot(dx, dy) < revealDistance) return;
      scheduleReveal();
    }

    function isDeckNavigationKey(e) {
      return e.key === 'ArrowRight' ||
        e.key === 'ArrowLeft' ||
        e.key === ' ' ||
        e.key === 'PageDown' ||
        e.key === 'PageUp' ||
        e.key === 'Home' ||
        e.key === 'End';
    }

    function onKeyReveal(e) {
      if (isDeckNavigationKey(e)) {
        // Slide navigation keys should not keep the chrome alive. If the top
        // bar is already visible, let the existing idle timer finish hiding it;
        // if it is hidden, keep it hidden until intentional pointer movement.
        clearShowTimer();
        return;
      }
      showNow();
    }

    document.querySelectorAll('.deck-back, .nav-hint').forEach(function (chrome) {
      chrome.addEventListener('mouseenter', function () {
        isHoveringChrome = true;
        if (hideTimer) clearTimeout(hideTimer);
        showNow();
      });
      chrome.addEventListener('mouseleave', function () {
        isHoveringChrome = false;
        scheduleHide();
      });
      chrome.addEventListener('focusin', function () {
        isHoveringChrome = true;
        if (hideTimer) clearTimeout(hideTimer);
        showNow();
      });
      chrome.addEventListener('focusout', function () {
        isHoveringChrome = false;
        scheduleHide();
      });
    });

    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerdown', showNow, { passive: true });
    document.addEventListener('keydown', onKeyReveal, true);
    document.addEventListener('focusin', showNow);
    scheduleHide();
  }

  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartActive = 0;
  document.addEventListener('touchstart', function (e) {
    if (!isMobileLayout() || !e.touches || e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartActive = active;
  }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (!isMobileLayout() || !e.changedTouches || e.changedTouches.length !== 1) return;
    if (active !== touchStartActive) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    go(touchStartActive + (dx < 0 ? 1 : -1));
  }, { passive: true });

  if (PREVIEW_MODE) {
    setActive(0);
    scrollToSlide(0, 'instant');
  } else {
    try {
      var saved = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
      if (!isNaN(saved) && saved >= 0 && saved < slides.length) {
        scrollToSlide(saved, 'instant');
        setActive(saved);
      } else {
        setActive(0);
      }
    } catch (_) {
      setActive(0);
    }
  }

  lastDeckScrollLeft = activeScrollLeft();
  setTimeout(function () { lastDeckScrollLeft = activeScrollLeft(); }, 0);

  window.addEventListener('resize', function () {
    scrollToSlide(active, 'instant');
    lastDeckScrollLeft = activeScrollLeft();
  });
}
