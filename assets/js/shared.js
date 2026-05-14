/* ─────────────────────────────────────────────────────────────────────────
   PARADOXUM — shared.js
   Vanilla JS interactions used on every page.
   Self-initialising. No build step, no dependencies.
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // ─── Nav scroll state ───────────────────────────────────────────────────
  // Adds .scrolled to .nav once the page has scrolled, which deepens shadow.
  function initNavScroll() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    function update() { nav.classList.toggle('scrolled', window.scrollY > 8); }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // ─── Nav active highlight ───────────────────────────────────────────────
  // <body data-page="about"> + <a data-page="about"> are matched here so the
  // current page's nav link gets .active. No need to hand-edit each HTML.
  function initNavActive() {
    var page = document.body.dataset.page;
    if (!page) return;
    var links = document.querySelectorAll('a[data-page]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].dataset.page === page) links[i].classList.add('active');
    }
  }

  // ─── Reveal observer ────────────────────────────────────────────────────
  // Any element with .reveal (or .reveal-left/right/scale) fades into view
  // once it crosses ~12% into view. .reveal.stagger fades direct children
  // in sequence.
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('in');
          io.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // ─── Pillar SVG draw observer ───────────────────────────────────────────
  // Used on the home page. When a .pillar scrolls into view its glyph's
  // path/circle/rect strokes draw in via stroke-dashoffset CSS.
  function initPillarsReveal() {
    var els = document.querySelectorAll('.pillar');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('in');
          io.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.3 });
    els.forEach(function (el) { io.observe(el); });
  }

  // ─── Char reveal ────────────────────────────────────────────────────────
  // Markup:  <span data-reveal="char">Ubi</span>
  // Optional delay (ms before the .in trigger fires after entering view):
  //          <span data-reveal="char" data-delay="200">Propugnatores</span>
  //
  // We wrap each character in a <span> with --i for its stagger index so the
  // CSS transition-delay does the per-char timing.
  function initCharReveal() {
    var els = document.querySelectorAll('[data-reveal="char"]');
    if (!els.length) return;
    els.forEach(function (el) {
      var text = el.textContent;
      el.classList.add('char-reveal');
      el.textContent = '';
      var chars = Array.from(text);
      for (var i = 0; i < chars.length; i++) {
        var s = document.createElement('span');
        s.textContent = chars[i] === ' ' ? '\u00A0' : chars[i];
        s.style.setProperty('--i', i);
        el.appendChild(s);
      }
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var delay = parseInt(e.target.dataset.delay || '0', 10);
        setTimeout(function () { e.target.classList.add('in'); }, delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.char-reveal').forEach(function (el) { io.observe(el); });
  }

  // ─── Word reveal ────────────────────────────────────────────────────────
  // Same idea, but per word. Good for ledes and paragraphs where char-by-char
  // would be too busy.
  // Markup: <p data-reveal="word">Long paragraph here.</p>
  function initWordReveal() {
    var els = document.querySelectorAll('[data-reveal="word"]');
    if (!els.length) return;
    els.forEach(function (el) {
      var text = el.textContent;
      el.classList.add('word-reveal');
      el.textContent = '';
      var parts = text.split(/(\s+)/);
      var wi = 0;
      for (var i = 0; i < parts.length; i++) {
        if (/^\s+$/.test(parts[i])) {
          el.appendChild(document.createTextNode(parts[i]));
        } else if (parts[i].length) {
          var s = document.createElement('span');
          s.className = 'w';
          s.textContent = parts[i];
          s.style.setProperty('--i', wi++);
          el.appendChild(s);
        }
      }
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var delay = parseInt(e.target.dataset.delay || '0', 10);
        setTimeout(function () { e.target.classList.add('in'); }, delay);
        io.unobserve(e.target);
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.word-reveal').forEach(function (el) { io.observe(el); });
  }

  // ─── Magnetic buttons ───────────────────────────────────────────────────
  // Markup: <a class="btn" data-magnetic>...</a>     (default strength)
  //         <a class="btn" data-magnetic="14">...</a> (custom strength in px)
  // Disabled on touch devices where hover doesn't exist.
  function initMagnetic() {
    if (window.matchMedia('(hover: none)').matches) return;
    var els = document.querySelectorAll('[data-magnetic]');
    els.forEach(function (el) {
      var strength = parseInt(el.dataset.magnetic, 10);
      if (!strength || isNaN(strength)) strength = 10;
      var raf = 0;
      el.classList.add('magnetic');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        var dx = (e.clientX - cx) / r.width;
        var dy = (e.clientY - cy) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = 'translate(' + (dx * strength) + 'px, ' + (dy * strength) + 'px)';
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ─── Count up ───────────────────────────────────────────────────────────
  // Markup: <span data-count-to="100" data-suffix="%">0</span>
  //         <span data-count-to="11" data-suffix=" stages">0</span>
  // Starts when the element enters the viewport, eases out, ends at target.
  function initCountUp() {
    var els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;
    function animate(el) {
      var to = parseFloat(el.dataset.countTo);
      var dur = parseInt(el.dataset.countDuration, 10) || 1600;
      var suffix = el.dataset.suffix || '';
      var prefix = el.dataset.prefix || '';
      var start = 0;
      function step(t) {
        if (!start) start = t;
        var p = Math.min(1, (t - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = Math.round(to * eased);
        el.textContent = prefix + val + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  // ─── Reading progress bar ───────────────────────────────────────────────
  // Add <div class="progress"><i></i></div> at top of body to enable.
  function initReadingProgress() {
    var bar = document.querySelector('.progress > i');
    if (!bar) return;
    var raf = 0;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop / max) * 100 : 0;
      bar.style.width = p + '%';
    }
    update();
    window.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
  }

  // ─── Smooth scroll for in-page anchor links ────────────────────────────
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', href);
    });
  }

  // ─── Footer year auto-update ───────────────────────────────────────────
  // Add <span data-year></span> anywhere in the markup.
  function initFooterYear() {
    var els = document.querySelectorAll('[data-year]');
    var y = new Date().getFullYear();
    els.forEach(function (el) { el.textContent = y; });
  }

  // ─── Page transition (body fade-out on internal link click) ────────────
  // Lets the same-origin navigation feel less jarring. CSS handles the
  // fade-in animation on the next page automatically.
  function initPageTransition() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href) return;
      // Skip hash links, mailto, tel, modifier-clicks, new-tab, download
      if (href.charAt(0) === '#') return;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var url;
      try { url = new URL(href, location.href); } catch (err) { return; }
      if (url.origin !== location.origin) return;
      // Same-page anchor: let the smooth-scroll handler deal with it.
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(function () { location.href = href; }, 260);
    });
    // If the user navigates back, undo the fade-out class.
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) document.body.classList.remove('page-leaving');
    });
  }

  // ─── Carousels ──────────────────────────────────────────────────────────
  // Markup:
  //   <div class="carousel" data-carousel data-interval="4500">
  //     <div class="carousel-track">
  //       <div class="carousel-slide active">...</div>
  //       <div class="carousel-slide">...</div>
  //     </div>
  //     <div class="carousel-dots">
  //       <button data-i="0" class="active"></button>
  //       <button data-i="1"></button>
  //     </div>
  //     <button class="carousel-nav prev">‹</button>
  //     <button class="carousel-nav next">›</button>
  //   </div>
  // Auto-plays on the interval; pauses while hovered.
  function initCarousels() {
    var carousels = document.querySelectorAll('[data-carousel]');
    if (!carousels.length) return;
    carousels.forEach(function (c) {
      var slides = c.querySelectorAll('.carousel-slide');
      var dots   = c.querySelectorAll('.carousel-dots button');
      var prev   = c.querySelector('.carousel-nav.prev');
      var next   = c.querySelector('.carousel-nav.next');
      var interval = parseInt(c.dataset.interval, 10) || 4500;
      if (!slides.length) return;

      var current = 0;
      // Find any pre-marked active slide so the first frame matches markup.
      slides.forEach(function (s, i) { if (s.classList.contains('active')) current = i; });

      var timer = 0;
      function show(i) {
        slides[current].classList.remove('active');
        if (dots[current]) dots[current].classList.remove('active');
        current = (i + slides.length) % slides.length;
        slides[current].classList.add('active');
        if (dots[current]) dots[current].classList.add('active');
      }
      function step() { show(current + 1); }
      function start() { stop(); timer = setInterval(step, interval); }
      function stop()  { if (timer) { clearInterval(timer); timer = 0; } }

      dots.forEach(function (d) {
        d.addEventListener('click', function () { show(parseInt(d.dataset.i, 10)); start(); });
      });
      if (prev) prev.addEventListener('click', function () { show(current - 1); start(); });
      if (next) next.addEventListener('click', function () { show(current + 1); start(); });
      c.addEventListener('mouseenter', stop);
      c.addEventListener('mouseleave', start);

      // Only auto-play once the carousel is on screen so we don't burn
      // requestAnimationFrame budget off-viewport.
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
        }, { threshold: 0.1 });
        io.observe(c);
      } else {
        start();
      }
    });
  }

  // ─── Hero cursor spotlight ──────────────────────────────────────────────
  // The .hero element has a CSS radial gradient anchored at --mx/--my.
  // We update those properties to follow the pointer. Pointer-only — touch
  // devices skip this entirely so we don't fight scroll on mobile.
  function initHeroSpotlight() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    if (window.matchMedia('(hover: none)').matches) return;
    var raf = 0;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width) * 100;
      var y = ((e.clientY - r.top)  / r.height) * 100;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        hero.style.setProperty('--mx', x + '%');
        hero.style.setProperty('--my', y + '%');
      });
    });
  }

  // ─── Parallax ──────────────────────────────────────────────────────────
  // Markup: <img class="crest-architecture" data-parallax="0.3">
  // The element's CSS --parallax variable is set to (scrollY * factor) so
  // CSS transforms can compose it. (Component CSS picks where to apply it.)
  function initParallax() {
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length) return;
    var raf = 0;
    function update() {
      var y = window.scrollY;
      els.forEach(function (el) {
        var f = parseFloat(el.dataset.parallax) || 0.3;
        // Only apply while the element's section is in or near the viewport,
        // otherwise we'd shove it out of place for users who land deep.
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        el.style.setProperty('--parallax', (y * f * -0.4) + 'px');
      });
    }
    update();
    window.addEventListener('scroll', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }, { passive: true });
  }

  // ─── Nav drawer (mobile / tablet hamburger menu) ─────────────────────────
  // The burger button toggles body.nav-open which the CSS uses to slide the
  // drawer in and dim the scrim. Esc, scrim click, and any link inside the
  // drawer close it. Body scroll is locked while open.
  function initNavDrawer() {
    var burger = document.querySelector('.nav-burger');
    var drawer = document.querySelector('.nav-drawer');
    var scrim  = document.querySelector('.nav-scrim');
    var closeBtn = document.querySelector('.nav-drawer-close');
    if (!burger || !drawer) return;
    function open()  { document.body.classList.add('nav-open'); burger.setAttribute('aria-expanded', 'true'); }
    function close() { document.body.classList.remove('nav-open'); burger.setAttribute('aria-expanded', 'false'); }
    function toggle(){ document.body.classList.contains('nav-open') ? close() : open(); }
    burger.addEventListener('click', toggle);
    if (scrim) scrim.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', function (e) {
      // Close on link tap (anchor or button)
      if (e.target.closest('a')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) close();
    });
    // Close if the viewport crosses back above the drawer breakpoint
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (ev) {
      if (ev.matches) close();
    });
  }

  // ─── Init all ───────────────────────────────────────────────────────────
  function init() {
    initFooterYear();
    initNavScroll();
    initNavActive();
    initCharReveal();
    initWordReveal();
    initReveal();
    initPillarsReveal();
    initMagnetic();
    initCountUp();
    initReadingProgress();
    initSmoothScroll();
    initPageTransition();
    initCarousels();
    initNavDrawer();
    initHeroSpotlight();
    initParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
