// Slide reveal/animation engine (shared across all deck pages).
export function initAnimations() {
  'use strict';

  function mark(el, animName, delayMs) {
    el.setAttribute('data-anim', animName);
    el.style.setProperty('--anim-name', animName);
    el.style.setProperty('--anim-delay', delayMs + 'ms');
  }

  function setupPreviewLoadingStates() {
    document.querySelectorAll('.media-ph, .pdf-preview-block').forEach(function(host) {
      if (host.dataset.previewLoadingBound === '1') return;
      var media = Array.from(host.querySelectorAll('img, video'));
      if (!media.length) return;
      host.dataset.previewLoadingBound = '1';

      var minLoaderMs = 720;
      var loaderStartedAt = performance.now ? performance.now() : Date.now();
      var pending = new Set(media.filter(function(el) {
        if (el.tagName === 'IMG') return !(el.complete && el.naturalWidth > 0);
        if (el.tagName === 'VIDEO') return el.readyState < 2;
        return false;
      }));

      host.classList.add('is-loading');

      function clearWhenReady() {
        if (pending.size) return;
        var now = performance.now ? performance.now() : Date.now();
        var remaining = Math.max(0, minLoaderMs - (now - loaderStartedAt));
        window.setTimeout(function() { host.classList.remove('is-loading'); }, remaining);
      }

      function finish(el) {
        pending.delete(el);
        clearWhenReady();
      }

      pending.forEach(function(el) {
        if (el.tagName === 'IMG') {
          el.addEventListener('load', function() { finish(el); }, { once: true });
          el.addEventListener('error', function() { finish(el); }, { once: true });
        } else if (el.tagName === 'VIDEO') {
          el.addEventListener('loadeddata', function() { finish(el); }, { once: true });
          el.addEventListener('canplay', function() { finish(el); }, { once: true });
          el.addEventListener('error', function() { finish(el); }, { once: true });
          try { if (el.networkState === HTMLMediaElement.NETWORK_EMPTY) el.load(); } catch (_) {}
        }
      });

      clearWhenReady();
      window.setTimeout(function() { pending.clear(); host.classList.remove('is-loading'); }, 12000);
    });
  }

  function setupParallaxMedia() {
    var isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    document.querySelectorAll('.parallax-media').forEach(function (media) {
      var tapStart = null;

      function updatePan(e) {
        var rect = media.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        var nx = ((e.clientX - rect.left) / rect.width) - 0.5;
        var ny = ((e.clientY - rect.top) / rect.height) - 0.5;
        var multX = parseFloat(getComputedStyle(media).getPropertyValue('--pan-mult-x')) || 1;
        var multY = parseFloat(getComputedStyle(media).getPropertyValue('--pan-mult-y')) || 1;
        media.style.setProperty('--pan-x', (nx * -150 * multX).toFixed(1) + 'px');
        media.style.setProperty('--pan-y', (ny * -44 * multY).toFixed(1) + 'px');
      }

      function reset() {
        media.classList.remove('is-active');
        media.style.setProperty('--pan-x', '0px');
        media.style.setProperty('--pan-y', '0px');
      }

      if (isCoarsePointer) {
        media.addEventListener('pointerdown', function (e) {
          if (e.pointerType && e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
          tapStart = { x: e.clientX, y: e.clientY };
        }, { passive: true });

        media.addEventListener('pointerup', function (e) {
          if (e.pointerType && e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
          if (!tapStart) return;
          var dx = e.clientX - tapStart.x;
          var dy = e.clientY - tapStart.y;
          tapStart = null;
          if (Math.hypot(dx, dy) > 12) return;

          if (media.classList.contains('is-active')) {
            reset();
            return;
          }

          document.querySelectorAll('.parallax-media.is-active').forEach(function (activeMedia) {
            if (activeMedia !== media) {
              activeMedia.classList.remove('is-active');
              activeMedia.style.setProperty('--pan-x', '0px');
              activeMedia.style.setProperty('--pan-y', '0px');
            }
          });
          updatePan(e);
          media.classList.add('is-active');
        }, { passive: true });

        media.addEventListener('pointercancel', function () { tapStart = null; }, { passive: true });
        media.addEventListener('blur', reset);
        return;
      }

      function update(e) {
        updatePan(e);
        media.classList.add('is-active');
      }

      media.addEventListener('pointerenter', update);
      media.addEventListener('pointermove', update);
      media.addEventListener('pointerleave', reset);
      media.addEventListener('blur', reset);
    });
  }

  function setupHero(slide) {
    [ ['.kicker','fadeUp',2760],
      ['.cover-meta','fadeUp',3060] ]
      .forEach(function(r){ slide.querySelectorAll(r[0]).forEach(function(el){ mark(el,r[1],r[2]); }); });
  }

  function setupTrend(slide) {
    var hl = slide.querySelector(':scope > .deck-headline, .trend-intro .deck-headline');
    if (hl) mark(hl, 'fadeUp', 0);
    var labels = Array.from(slide.querySelectorAll('.trend-col-label'));
    var panels = Array.from(slide.querySelectorAll('.trend-panel'));
    var seps   = Array.from(slide.querySelectorAll('.trend-col-sep'));
    var d = 80;
    for (var i = 0; i < labels.length; i++) {
      mark(labels[i], 'fadeUp',  d);
      if (panels[i]) mark(panels[i], 'scaleIn', d + 40);
      d += 80;
      if (seps[i]) { mark(seps[i], 'fadeOnly', d); d += 40; }
    }
  }

  function setupEvolution(slide) {
    var hl = slide.querySelector('.deck-headline');
    if (hl) mark(hl, 'fadeUp', 0);
    slide.querySelectorAll('.progression .step').forEach(function(el, i) {
      mark(el, 'scaleIn', 100 + i * 75);
    });
  }

  function setupGeneric(slide) {
    var assigned = new Set();
    var hasTwoCol = !!slide.querySelector('.two-col');
    var rules = [
      { sel: '.deck-headline',      anim: 'fadeUp',   base: 0,   step: 0  },
      { sel: '.deck-subhead',       anim: 'fadeUp',   base: 80,  step: 0  },
      { sel: '.mcp-tags-label',     anim: 'fadeUp',   base: 140, step: 0  },
      { sel: '.mcp-tags',           anim: 'fadeUp',   base: 200, step: 0  },
      { sel: '.mcp-logo',           anim: 'fadeOnly', base: 240, step: 0  },
      { sel: '.mcp-prosconlabel',   anim: 'fadeUp',   base: 160, step: 80 },
      { sel: '.deck-section-label', anim: 'fadeUp',   base: 160, step: 60 },
      { sel: '.two-col > *',        anim: 'scaleIn',  base: 120, step: 90 },
      { sel: '.pillar-grid .pill',  anim: 'scaleIn',  base: 100, step: 65 },
      { sel: '.progression .step',  anim: 'scaleIn',  base: 120, step: 75 },
      { sel: '.ui-lane',            anim: 'scaleIn',  base: 120, step: 75 },
      { sel: '.cond-card',          anim: 'scaleIn',  base: 110, step: 90 },
      { sel: '.state-tabs',         anim: 'fadeUp',   base: 110, step: 0  },
      { sel: '.state-grid .state',  anim: 'scaleIn',  base: 120, step: 90 },
      { sel: '.split-media .col-media', anim: 'fadeOnly', base: 220, step: 0 },
      { sel: '.architecture-tab-controls', anim: 'fadeOnly', base: 120, step: 0 },
      { sel: '.architecture-stage', anim: 'scaleIn',  base: 180, step: 0  },
      { sel: '.breakdown-stage',    anim: 'scaleIn',  base: 180, step: 0  },
      { sel: '.pdf-preview-block',  anim: 'scaleIn',  base: 160, step: 0  },
      { sel: '.pillars-venn',       anim: 'fadeOnly', base: 160, step: 0  },
      { sel: '.lead',               anim: 'fadeUp',   base: 120, step: 0  },
      { sel: '.closing-stamp',      anim: 'fadeUp',   base: 200, step: 0  },
      { sel: '.cover-rule',         anim: 'fadeOnly', base: 280, step: 0  },
      { sel: '.arrow-list li',      anim: 'fadeUp',   base: 160, step: 50 },
      { sel: '.ui-note',            anim: 'fadeUp',   base: 320, step: 0  },
    ];
    rules.forEach(function(r) {
      var els = Array.from(slide.querySelectorAll(r.sel))
        .filter(function(el) { return !assigned.has(el); })
        .filter(function(el) { return !(hasTwoCol && r.sel === '.arrow-list li' && el.closest('.two-col')); });
      els.forEach(function(el, i) {
        mark(el, r.anim, r.base + i * r.step);
        assigned.add(el);
      });
    });
  }

  function prepareSlideTitles() {
    document.querySelectorAll('.slide .h-hero, .slide .deck-headline').forEach(function(el) {
      // Titles should travel with the slide immediately. The rest of the slide
      // waits for the fixed gradients/status chrome, then reveals with motion.
      el.removeAttribute('data-anim');
      el.style.removeProperty('--anim-name');
      el.style.removeProperty('--anim-delay');
      el.setAttribute('data-deck-title', '');
    });
  }

  function setupCoverYearAnimation() {
    var coverYear = document.querySelector('[data-cover-year]');
    var noopControls = { schedule: function () {}, reset: function () {} };
    if (!coverYear) return noopControls;

    var targetText = coverYear.getAttribute('aria-label') || coverYear.textContent.trim() || '2026';
    var targetYear = parseInt(targetText, 10) || 2026;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealTimer = null;
    var rafId = null;
    var hasAnimated = false;

    coverYear.setAttribute('aria-label', targetText);

    function hideYear() {
      coverYear.classList.remove('is-visible');
      coverYear.textContent = '0'.repeat(targetText.length);
      if (coverYear.parentElement) coverYear.parentElement.classList.remove('year-line-visible');
    }

    function clearScheduledReveal() {
      if (revealTimer) {
        window.clearTimeout(revealTimer);
        revealTimer = null;
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function resetCoverYear() {
      clearScheduledReveal();
      hasAnimated = false;
      hideYear();
    }

    function showYearLine() {
      if (coverYear.parentElement) coverYear.parentElement.classList.add('year-line-visible');
    }

    function finish() {
      coverYear.classList.add('is-visible');
      coverYear.textContent = targetText;
      showYearLine();
      rafId = null;
    }

    function revealCoverYear() {
      revealTimer = null;
      if (hasAnimated) return;
      hasAnimated = true;
      coverYear.classList.add('is-visible');
      showYearLine();

      if (reducedMotion) {
        finish();
        return;
      }

      var duration = 1400;
      var startTime = performance.now();
      var easeOutCubic = function(progress) { return 1 - Math.pow(1 - progress, 3); };

      function tick(now) {
        var progress = Math.min((now - startTime) / duration, 1);
        var value = Math.round(targetYear * easeOutCubic(progress));
        coverYear.textContent = String(value).padStart(targetText.length, '0');

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
          return;
        }

        finish();
      }

      rafId = requestAnimationFrame(tick);
    }

    function scheduleReveal(delayMs) {
      clearScheduledReveal();
      revealTimer = window.setTimeout(revealCoverYear, delayMs);
    }

    hideYear();
    return { schedule: scheduleReveal, reset: resetCoverYear };
  }

  function setupFlowLoopMotion() {
    var motion = document.getElementById('flowLoopMotion');
    var dot = motion ? motion.closest('.flow-loop-dot') : null;
    var flowSlide = dot ? dot.closest('.slide') : null;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var startTimer = null;
    var hasStarted = false;
    var revealDelay = 1940;

    function clearStartTimer() {
      if (!startTimer) return;
      window.clearTimeout(startTimer);
      startTimer = null;
    }

    function reset() {
      clearStartTimer();
      hasStarted = false;
      if (dot) dot.classList.remove('is-moving');
      if (motion && motion.endElement) {
        try { motion.endElement(); } catch (err) {}
      }
    }

    function start() {
      startTimer = null;
      if (hasStarted || !motion || !dot) return;
      hasStarted = true;
      dot.classList.add('is-moving');
      if (motion.beginElement) motion.beginElement();
    }

    function onVisible(slide) {
      if (!flowSlide || slide !== flowSlide || hasStarted || startTimer) return;
      if (reducedMotion) {
        if (dot) dot.classList.add('is-moving');
        return;
      }
      startTimer = window.setTimeout(start, revealDelay);
    }

    function onHidden(slide) {
      if (!flowSlide || slide !== flowSlide) return;
      reset();
    }

    return { onVisible: onVisible, onHidden: onHidden };
  }

  function updateScrollFadeMasks() {
    document.querySelectorAll('.slide-scroll-content').forEach(function(scroller) {
      var isScrollable = scroller.scrollHeight - scroller.clientHeight > 2;
      var isScrolled = scroller.scrollTop > 2;
      var owner = scroller.parentElement;
      var fade = owner && owner.querySelector(':scope > .slide-scroll-fade');
      scroller.classList.toggle('is-scrollable', isScrollable);
      scroller.classList.toggle('is-scrolled', isScrollable && isScrolled);
      if (owner) {
        owner.classList.toggle('is-content-scrollable', isScrollable);
        owner.classList.toggle('is-content-scrolled', isScrollable && isScrolled);
      }
      if (owner && fade) {
        var ownerRect = owner.getBoundingClientRect();
        var title = owner.querySelector('.deck-headline, .trend-intro .deck-headline, [data-deck-title]');
        var titleRect = title && title.getBoundingClientRect ? title.getBoundingClientRect() : null;
        var solidY = titleRect ? Math.max(0, titleRect.bottom - ownerRect.top + 8) : 96;
        var fadeTail = window.matchMedia && window.matchMedia('(max-width: 760px)').matches ? 78 : 92;
        fade.style.setProperty('--scroll-fade-solid-y', solidY + 'px');
        fade.style.setProperty('--scroll-fade-height', (solidY + fadeTail) + 'px');
      }
    });
  }

  function setupMobileScrollRegions() {
    document.querySelectorAll('.slide:not(.hero):not(.slide-section):not(.slide-zx-end):not(.pdf-page-slide)').forEach(function(slide) {
      if (slide.querySelector('.slide-scroll-content')) return;

      var title = slide.querySelector('.deck-headline, .h-hero');
      if (!title) return;

      var headerEnd = title;
      var owner = title.parentElement;

      // Some slides keep the title in a tiny intro wrapper while the real
      // content is a sibling of that wrapper. Treat that intro wrapper as the
      // pinned header so the behavior stays universal across slide layouts.
      if (owner !== slide && !title.nextElementSibling && owner.parentElement && slide.contains(owner.parentElement)) {
        headerEnd = owner;
        owner = owner.parentElement;
      }

      // Shared Slide renders a component-level body rail. Use it as the
      // scrollable content region directly so headline/subhead remain header
      // content and the body starts from the universal rail.
      if (!owner || !owner.contains(headerEnd)) return;

      var existingBody = owner.querySelector(':scope > .deck-body');
      if (existingBody) {
        existingBody.classList.add('slide-scroll-content');
        if (!owner.querySelector(':scope > .slide-scroll-fade')) {
          var existingFade = document.createElement('div');
          existingFade.className = 'slide-scroll-fade';
          existingFade.setAttribute('aria-hidden', 'true');
          owner.appendChild(existingFade);
        }
        owner.classList.add('scroll-split-owner');
        slide.classList.add('has-scroll-content');
        existingBody.addEventListener('scroll', function() { updateScrollFadeMasks(); }, { passive: true });
        return;
      }

      var nodesToMove = [];
      var node = headerEnd.nextSibling;
      while (node) {
        var nextNode = node.nextSibling;
        nodesToMove.push(node);
        node = nextNode;
      }

      var hasElementContent = nodesToMove.some(function(child) { return child.nodeType === 1; });
      if (!hasElementContent) return;

      var scroller = document.createElement('div');
      scroller.className = 'slide-scroll-content';
      nodesToMove.forEach(function(child) { scroller.appendChild(child); });
      owner.appendChild(scroller);
      if (!owner.querySelector(':scope > .slide-scroll-fade')) {
        var fade = document.createElement('div');
        fade.className = 'slide-scroll-fade';
        fade.setAttribute('aria-hidden', 'true');
        owner.appendChild(fade);
      }
      owner.classList.add('scroll-split-owner');
      slide.classList.add('has-scroll-content');
      function syncScrollerFade() { updateScrollFadeMasks(); }
      scroller.addEventListener('scroll', syncScrollerFade, { passive: true });
    });
    updateScrollFadeMasks();
    window.addEventListener('resize', updateScrollFadeMasks, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateScrollFadeMasks).catch(function() {});
    }
  }

  function setupAll() {
    setupPreviewLoadingStates();
    setupParallaxMedia();
    setupMobileScrollRegions();

    function currentDeckScrollLeft() {
      return Math.max(
        Math.abs(document.documentElement.scrollLeft || 0),
        Math.abs(document.body.scrollLeft || 0),
        Math.abs((document.scrollingElement && document.scrollingElement.scrollLeft) || 0)
      );
    }

    function isCoverInView() {
      return currentDeckScrollLeft() < (window.innerWidth || document.documentElement.clientWidth || 1920) * 0.5;
    }

    document.querySelectorAll('.slide').forEach(function(slide) {
      if (slide.classList.contains('hero'))            setupHero(slide);
      else if (slide.classList.contains('slide-trend'))  setupTrend(slide);
      else if (slide.classList.contains('slide-evolution')) setupEvolution(slide);
      else                                              setupGeneric(slide);
    });
    prepareSlideTitles();

    var coverYearAnimation = setupCoverYearAnimation();
    var flowLoopMotion = setupFlowLoopMotion();
    var coverYearRevealDelay = 3360;
    var animationsStarted = false;
    var previewCoverMode = new URLSearchParams(window.location.search).get('preview') === 'cover';

    function visibleSlideForCurrentScroll() {
      var visibleIndex = Math.round(currentDeckScrollLeft() / (window.innerWidth || document.documentElement.clientWidth || 1920));
      return document.querySelectorAll('.slide')[Math.max(0, visibleIndex)];
    }

    function showPreviewCoverStill() {
      if (!previewCoverMode || animationsStarted) return;
      document.body.classList.remove('deck-animations-pending');
      var visibleSlide = visibleSlideForCurrentScroll() || document.querySelector('.slide');
      if (visibleSlide) visibleSlide.classList.add('is-visible');
    }

    function startAnimations() {
      if (animationsStarted) return;
      animationsStarted = true;
      document.body.classList.remove('deck-animations-pending');
      document.body.classList.add('animations-ready');

      // Reveal only the slide that is actually in view. When the page restores
      // to a saved non-cover slide, pre-marking the cover as visible lets its
      // title animation finish offscreen, so it flashes instead of revealing
      // when navigating back to slide 1.
      var visibleSlide = visibleSlideForCurrentScroll();
      if (visibleSlide) {
        revealWhenOverlaysAreReady(visibleSlide);
        if (visibleSlide.matches('.hero') && isCoverInView()) coverYearAnimation.schedule(coverYearRevealDelay);
      }
    }

    function startPreviewCoverAnimation() {
      if (!previewCoverMode) return false;
      window.dispatchEvent(new CustomEvent('preview-cover-motion-start'));
      if (!animationsStarted) {
        startAnimations();
        return true;
      }
      var visibleSlide = visibleSlideForCurrentScroll() || document.querySelector('.slide.is-visible') || document.querySelector('.slide');
      if (visibleSlide) {
        visibleSlide.classList.remove('is-visible');
        void visibleSlide.offsetWidth;
        visibleSlide.classList.add('is-visible');
        flowLoopMotion.onVisible(visibleSlide);
      }
      return true;
    }

    function stopPreviewCoverAnimation() {
      if (!previewCoverMode) return false;
      animationsStarted = false;
      document.body.classList.remove('animations-ready');
      document.body.classList.remove('deck-animations-pending');
      var visibleSlide = visibleSlideForCurrentScroll() || document.querySelector('.slide.is-visible') || document.querySelector('.slide');
      if (visibleSlide) visibleSlide.classList.add('is-visible');
      window.dispatchEvent(new CustomEvent('preview-cover-motion-stop'));
      return true;
    }

    window.startPreviewCoverAnimation = startPreviewCoverAnimation;
    window.stopPreviewCoverAnimation = stopPreviewCoverAnimation;
    window.addEventListener('message', function (event) {
      if (event.data && event.data.type === 'preview-cover:start') startPreviewCoverAnimation();
      if (event.data && event.data.type === 'preview-cover:stop') stopPreviewCoverAnimation();
    });

    function startAfterChromePaint() {
      requestAnimationFrame(function () {
        requestAnimationFrame(previewCoverMode ? showPreviewCoverStill : startAnimations);
      });
    }

    window.addEventListener('deck-chrome-ready', startAfterChromePaint, { once: true });
    if (!document.body.classList.contains('chrome-boot')) startAfterChromePaint();
    window.setTimeout(previewCoverMode ? showPreviewCoverStill : startAnimations, 700);

    var pendingVisibleSlides = new Set();

    function revealWhenOverlaysAreReady(slide) {
      if (document.body.classList.contains('deck-is-sliding')) {
        slide.classList.remove('is-visible');
        flowLoopMotion.onHidden(slide);
        pendingVisibleSlides.add(slide);
        return;
      }
      slide.classList.add('is-visible');
      flowLoopMotion.onVisible(slide);
    }

    function flushPendingVisibleSlides() {
      if (!pendingVisibleSlides.size) return;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          pendingVisibleSlides.forEach(function (slide) {
            slide.classList.add('is-visible');
            flowLoopMotion.onVisible(slide);
          });
          pendingVisibleSlides.clear();
        });
      });
    }

    window.addEventListener('deck-slide-settled', flushPendingVisibleSlides);

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          revealWhenOverlaysAreReady(e.target);
          if (e.target.matches('.hero') && isCoverInView()) {
            coverYearAnimation.reset();
            coverYearAnimation.schedule(coverYearRevealDelay);
          }
        } else {
          pendingVisibleSlides.delete(e.target);
          e.target.classList.remove('is-visible');
          flowLoopMotion.onHidden(e.target);
          if (e.target.matches('.hero')) coverYearAnimation.reset();
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.slide').forEach(function(s) { io.observe(s); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAll);
  } else {
    setupAll();
  }
}
