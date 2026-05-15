/* ─────────────────────────────────────────────────────────────────────────
   LENIS + GSAP — boot · The Paradox Academy
   Single source of truth for smooth-scroll and the GSAP ticker handoff.

   Load order in every HTML page:
     1. gsap.min.js
     2. ScrollTrigger.min.js
     3. lenis.min.js
     4. lenis-gsap.js            ← this file
     5. icons.js
     6. shared.js
     7. gsap-effects.js
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  var hasGsap   = typeof gsap !== 'undefined';
  var hasST     = typeof ScrollTrigger !== 'undefined';
  var hasLenis  = typeof Lenis !== 'undefined';
  var noMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasGsap && hasST) gsap.registerPlugin(ScrollTrigger);

  /* Mark <html> so CSS knows GSAP is active. Pairs with .has-gsap rules
     in styles.css that pre-hide [data-gsap] elements to prevent a flash
     of un-revealed content during the brief moment between HTML parse
     and gsap.set() execution. */
  if (hasGsap && hasST) {
    document.documentElement.classList.add('has-gsap');
  }

  /* ── Lenis ─────────────────────────────────────────────────────────────── */
  if (hasLenis) {
    /* Config note: keep `duration` + `easing` OR `lerp` — not both. Lenis 1.x
       lets `duration` drive wheel easing while `lerp` damps the same channel;
       set together they fight each other, causing the scroll to overshoot and
       spring back ("jumps back"). We use duration+easing only, matching the
       original known-good config from the inline init this file replaced.   */
    window.lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: !noMotion,
      smoothTouch: false
    });

    /* Velocity bus — downstream effects (marquee speed, etc.) read this. */
    window.__lenisVelocity = 0;
    window.lenis.on('scroll', function (e) {
      window.__lenisVelocity = e.velocity || 0;
    });
  }

  /* ── GSAP ticker handoff ──────────────────────────────────────────────────
     Use ONE rAF source for everything. gsap.ticker becomes the heartbeat;
     Lenis advances on the same frame; ScrollTrigger gets every scroll.       */
  if (hasGsap && window.lenis) {
    /* tell ScrollTrigger about every Lenis scroll */
    if (hasST) window.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(function (time) {
      /* gsap.ticker passes seconds; Lenis expects ms */
      window.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else if (window.lenis) {
    /* GSAP absent — fall back to native rAF */
    var rafId;
    var loop = function (t) { window.lenis.raf(t); rafId = requestAnimationFrame(loop); };
    rafId = requestAnimationFrame(loop);
    window._lenisRaf = rafId;
  }

  /* ── Page-leave: stop Lenis so the body fade-out isn't fought by inertia.
     shared.js already pauses Lenis on internal nav clicks; this is a belt
     for back-forward cache restores and pagehide.                            */
  window.addEventListener('pagehide', function () {
    if (window.lenis) window.lenis.stop();
  });
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && window.lenis) window.lenis.start();
  });

  /* ── Layout-shift defence. Lazy-loaded images change page height as they
     paint into view; ScrollTrigger's anchor positions are computed once at
     init and get stale, causing triggers to fire at the wrong scroll
     positions ("the page skips"). Refresh once when window load completes,
     once after fonts settle, and on resize.                                  */
  if (hasGsap && hasST) {
    window.addEventListener('load', function () {
      ScrollTrigger.refresh();
    });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
})();
