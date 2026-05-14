/* ─────────────────────────────────────────────────────────────────────────
   GSAP EFFECTS — The Paradox Academy
   Site-wide motion. Detect-and-apply: each effect bails if its targets
   aren't on the page, so this file is safe to load everywhere.

   Requires: gsap, ScrollTrigger, and lenis-gsap.js to have run first.
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger === 'undefined') return;

  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch  = window.matchMedia('(hover: none)').matches;

  /* ── Always run ─────────────────────────────────────────────────────────── */
  initLoader();                          /* homepage only — bails if no loader */
  initPulseDot();                        /* hero eyebrow dot, if present       */
  initGsapReveals();                     /* universal [data-gsap] reveals       */
  initPillarScrubDraw();                 /* SVG strokes ink-in on scroll        */
  initStageSweep();                      /* gold wipe behind stage cards        */
  initCampusParallax();                  /* image pans inside cell frames       */
  initStoryPillarScrub();                /* watermark breathes through section  */
  initMottoVelocity();                   /* marquee speeds up with scroll       */
  initHeroCarouselCrossfade();           /* opacity transitions, not hard cuts  */
  initTestimonials();                    /* existing homepage stagger           */
  initSecHeadReveal();                   /* universal — every page has .sec-head*/
  initLegacyScrollTrigger();             /* existing numbers/apply parallax     */

  /* ── Pointer-only enhancements ──────────────────────────────────────────── */
  if (!noMotion && !isTouch) {
    initPillarTilt();                    /* 3D tilt on hover                    */
    gsap.delayedCall(0.65, initCursorLayer);   /* preview tag for .stage cards  */
  }

  /* ════════════════════════════════════════════════════════════════════════
     1. Universal `data-gsap` reveals
     Markup:
       <h2 data-gsap="fade-up">…</h2>
       <div data-gsap="mask-up" data-gsap-delay="0.1">…</div>
       <div data-gsap="stagger" data-gsap-stagger="0.08">
         <div>…</div><div>…</div>
       </div>
     Presets: fade-up · mask-up · mask-right · scale · clip-down · stagger
     ════════════════════════════════════════════════════════════════════════ */
  function initGsapReveals() {
    var els = document.querySelectorAll('[data-gsap]');
    if (!els.length) return;

    /* Pre-state — set BEFORE ScrollTrigger so there's no flash */
    els.forEach(function (el) {
      var p = el.dataset.gsap;
      if (noMotion) return;
      if (p === 'fade-up')    gsap.set(el, { opacity: 0, y: 28 });
      if (p === 'scale')      gsap.set(el, { opacity: 0, scale: 0.92 });
      if (p === 'clip-down')  gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
      if (p === 'mask-up' || p === 'mask-right') {
        gsap.set(el, {
          clipPath: p === 'mask-up'
            ? 'inset(100% 0 0 0)'
            : 'inset(0 100% 0 0)',
          y: p === 'mask-up' ? 22 : 0
        });
      }
      if (p === 'stagger') {
        gsap.set(el.children, { opacity: 0, y: 22 });
      }
    });

    els.forEach(function (el) {
      var preset = el.dataset.gsap;
      var delay  = parseFloat(el.dataset.gsapDelay)   || 0;
      var stagAm = parseFloat(el.dataset.gsapStagger) || 0.08;

      ScrollTrigger.create({
        trigger: el,
        start: 'top 84%',
        once: true,
        onEnter: function () {
          /* Mark revealed early so CSS .gsap-in fallback opens regardless
             of how the tween finishes (or whether one runs at all). */
          el.classList.add('gsap-in');

          if (noMotion) {
            gsap.set(el, { clearProps: 'all' });
            if (preset === 'stagger') gsap.set(el.children, { clearProps: 'all' });
            return;
          }

          if (preset === 'fade-up') {
            gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: delay });
          } else if (preset === 'scale') {
            gsap.to(el, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out', delay: delay });
          } else if (preset === 'clip-down') {
            gsap.to(el, { clipPath: 'inset(0 0 0 0)', duration: 1.05, ease: 'power3.out', delay: delay });
          } else if (preset === 'mask-up') {
            gsap.to(el, { clipPath: 'inset(0 0 0 0)', y: 0, duration: 1.0, ease: 'power3.out', delay: delay });
          } else if (preset === 'mask-right') {
            gsap.to(el, { clipPath: 'inset(0 0 0 0)', duration: 1.05, ease: 'power3.out', delay: delay });
          } else if (preset === 'stagger') {
            gsap.to(el.children, {
              opacity: 1, y: 0,
              duration: 0.8,
              ease: 'power3.out',
              stagger: { amount: stagAm * Math.max(1, el.children.length - 1) },
              delay: delay
            });
          }
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     2. Pillar SVG strokes — draw on scroll-scrub
     Replaces the one-shot CSS dashoffset reveal with a progressive ink-in
     tied to scroll position. The page is being penciled as you read.
     ════════════════════════════════════════════════════════════════════════ */
  function initPillarScrubDraw() {
    var pillars = document.querySelectorAll('.pillar');
    if (!pillars.length || noMotion) return;

    pillars.forEach(function (pillar) {
      var strokes = pillar.querySelectorAll(
        '.glyph svg path, .glyph svg circle, .glyph svg rect:not(:first-child)'
      );
      if (!strokes.length) return;

      /* Override the CSS transition; we own these properties now */
      strokes.forEach(function (s) {
        s.style.transition = 'none';
        var len;
        try { len = (s.getTotalLength && s.getTotalLength()) || 600; }
        catch (e) { len = 600; }
        s.style.strokeDasharray  = len;
        s.style.strokeDashoffset = len;
      });

      gsap.to(strokes, {
        strokeDashoffset: 0,
        ease: 'none',
        stagger: { each: 0.05, from: 'start' },
        scrollTrigger: {
          trigger: pillar,
          start: 'top 78%',
          end:   'bottom 55%',
          scrub: 1.1
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     3. Pillar 3D tilt on hover
     Pointer-only. Adds gold edge accent via CSS variable when active.
     ════════════════════════════════════════════════════════════════════════ */
  function initPillarTilt() {
    var pillars = document.querySelectorAll('.pillar');
    if (!pillars.length) return;

    pillars.forEach(function (p) {
      var rx = gsap.quickTo(p, 'rotateX', { duration: 0.45, ease: 'power2.out' });
      var ry = gsap.quickTo(p, 'rotateY', { duration: 0.45, ease: 'power2.out' });

      p.style.transformPerspective = '900px';
      p.style.transformStyle = 'preserve-3d';

      p.addEventListener('pointermove', function (e) {
        var r = p.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width  - 0.5;
        var dy = (e.clientY - r.top)  / r.height - 0.5;
        ry(dx * 6);
        rx(-dy * 6);
        p.style.setProperty('--tilt-x', dx.toFixed(3));
        p.style.setProperty('--tilt-y', dy.toFixed(3));
      });

      p.addEventListener('pointerleave', function () {
        rx(0); ry(0);
        p.style.setProperty('--tilt-x', 0);
        p.style.setProperty('--tilt-y', 0);
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     4. Stage card sweep reveal
     A gold-tinted gradient wipes left→right behind each stage as it enters,
     while the roman numeral scales in. Works on home + programmes page.
     ════════════════════════════════════════════════════════════════════════ */
  function initStageSweep() {
    var stages = document.querySelectorAll('.stage');
    if (!stages.length || noMotion) return;

    stages.forEach(function (stage) {
      if (!stage.querySelector('.stage-sweep')) {
        var sw = document.createElement('span');
        sw.className = 'stage-sweep';
        /* Set position immediately so the grid never allocates a column
           for this element between injection and gsap.set(). */
        sw.style.position = 'absolute';
        stage.appendChild(sw);
      }
      var sweep = stage.querySelector('.stage-sweep');
      var roman = stage.querySelector('.roman');

      gsap.set(sweep, { scaleX: 0, transformOrigin: 'left center' });
      if (roman) gsap.set(roman, { opacity: 0, scale: 0.7, x: -16 });

      ScrollTrigger.create({
        trigger: stage,
        start: 'top 80%',
        once: true,
        onEnter: function () {
          gsap.timeline()
            .to(sweep, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' })
            .to(sweep, { scaleX: 0, transformOrigin: 'right center', duration: 0.65, ease: 'power3.inOut' }, '+=0.05');

          if (roman) {
            gsap.to(roman, {
              opacity: 1, scale: 1, x: 0,
              duration: 0.85, ease: 'back.out(1.6)', delay: 0.2
            });
          }
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     5. Campus cell image parallax
     Each cell's image is taller than its frame; we shift it on Y as the
     cell crosses the viewport. Per-cell speed for variation.
     ════════════════════════════════════════════════════════════════════════ */
  function initCampusParallax() {
    var cells = document.querySelectorAll('.campus-cell img');
    if (!cells.length || noMotion) return;

    cells.forEach(function (img, i) {
      /* Give the image headroom inside its overflow:hidden frame.
         Then we translate within that headroom on scroll.                */
      img.style.height       = '130%';
      img.style.objectFit    = 'cover';
      img.style.position     = 'relative';
      img.style.willChange   = 'transform';

      /* yPercent here is of the IMAGE's own height. ±10% within 30% slack. */
      var speeds = [-10, -14, -8, -16, -12];
      var amt = speeds[i % speeds.length];

      gsap.fromTo(img,
        { yPercent: -((-amt) / 2) },          /* start a touch below center */
        {
          yPercent: ((-amt) / 2),             /* end above */
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.campus-cell') || img,
            start: 'top bottom',
            end:   'bottom top',
            scrub: 1.0
          }
        }
      );
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     6. Story-section pillar PNG — scrubbed Y + opacity breath
     ════════════════════════════════════════════════════════════════════════ */
  function initStoryPillarScrub() {
    var pillarImg = document.querySelector('#story > img[aria-hidden]');
    if (!pillarImg || noMotion) return;

    gsap.fromTo(pillarImg,
      { y: -40, opacity: 0.08 },
      {
        y: 90, opacity: 0.22,
        ease: 'none',
        scrollTrigger: {
          trigger: '#story',
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.4
        }
      }
    );
  }

  /* ════════════════════════════════════════════════════════════════════════
     7. Motto strip — velocity reactor
     CSS sets base animation durations (42s / 56s). We modulate
     animation-duration in response to Lenis velocity, then settle back.
     ════════════════════════════════════════════════════════════════════════ */
  function initMottoVelocity() {
    if (noMotion || !window.lenis) return;
    var rows = document.querySelectorAll('.motto-row');
    if (!rows.length) return;

    var baseDur = [42, 56];
    var settleId;

    function apply(dur) {
      rows.forEach(function (r, i) {
        r.style.animationDuration = (dur[i] || baseDur[i]) + 's';
      });
    }
    apply(baseDur);

    window.lenis.on('scroll', function (e) {
      var v = Math.min(Math.abs(e.velocity || 0), 40);
      /* factor: at v=0 → 1 (base speed). at v=40 → ~0.28 (fast). */
      var factor = 1 - Math.min(v / 50, 0.72);
      apply([baseDur[0] * factor, baseDur[1] * factor]);

      clearTimeout(settleId);
      settleId = setTimeout(function () { apply(baseDur); }, 240);
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     8. Hero carousel crossfade
     Watches `.active` class on each `.carousel.hero-photo .carousel-slide`
     and crossfades instead of letting CSS hard-swap them.
     ════════════════════════════════════════════════════════════════════════ */
  function initHeroCarouselCrossfade() {
    var carousel = document.querySelector('.carousel.hero-photo');
    if (!carousel) return;
    var slides = carousel.querySelectorAll('.carousel-slide');
    if (!slides.length) return;

    var track = carousel.querySelector('.carousel-track');
    if (track) {
      track.style.position = 'relative';
      slides.forEach(function (s) {
        s.style.position = 'absolute';
        s.style.inset = '0';
        s.style.opacity = s.classList.contains('active') ? '1' : '0';
        s.style.willChange = 'opacity';
      });
    }

    var mo = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.attributeName !== 'class') return;
        var el = m.target;
        if (el.classList.contains('active')) {
          gsap.to(el, { opacity: 1, duration: 0.85, ease: 'power2.out' });
          var ph = el.querySelector('.ph');
          if (ph && !noMotion) {
            gsap.fromTo(ph, { scale: 1.0 }, { scale: 1.06, duration: 5.0, ease: 'sine.out' });
          }
        } else {
          gsap.to(el, { opacity: 0, duration: 0.6, ease: 'power2.in' });
        }
      });
    });
    slides.forEach(function (s) { mo.observe(s, { attributes: true }); });
  }

  /* ════════════════════════════════════════════════════════════════════════
     Universal section-header reveal
     Every page uses `.sec-head h2` for its section titles. We mask-reveal
     the h2 from below, and slide the small `.label` ("§ 01 · Our story")
     in from the left. Composes cleanly with the existing `.reveal` CSS
     on the parent — the parent fades up, the children animate on top.
     ════════════════════════════════════════════════════════════════════════ */
  function initSecHeadReveal() {
    var heads = document.querySelectorAll('.sec-head');
    if (!heads.length || noMotion) return;

    heads.forEach(function (head) {
      var h2    = head.querySelector('h2');
      var label = head.querySelector('.label');

      if (h2)    gsap.set(h2,    { clipPath: 'inset(0 0 100% 0)' });
      if (label) gsap.set(label, { opacity: 0, x: -24 });

      ScrollTrigger.create({
        trigger: head,
        start: 'top 82%',
        once: true,
        onEnter: function () {
          var tl = gsap.timeline();
          if (label) {
            tl.to(label, { opacity: 1, x: 0, duration: 0.7, ease: 'power2.out' });
          }
          if (h2) {
            tl.to(h2, {
              clipPath: 'inset(0 0 0 0)',
              duration: 1.0, ease: 'power3.out'
            }, label ? '-=0.45' : 0);
          }
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     Hero eyebrow dot — pulse
     ════════════════════════════════════════════════════════════════════════ */
  function initPulseDot() {
    document.querySelectorAll('.hero-eyebrow .dot').forEach(function (dot) {
      dot.style.animation = 'none';
      dot.style.display   = 'block';
      if (!noMotion) {
        gsap.to(dot, {
          scale: 2.2, opacity: 0.15,
          duration: 1.25, ease: 'sine.inOut',
          yoyo: true, repeat: -1
        });
      }
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     Testimonials (homepage)
     ════════════════════════════════════════════════════════════════════════ */
  function initTestimonials() {
    var grid  = document.querySelector('.testi-grid');
    var cards = document.querySelectorAll('.testi');
    var marks = document.querySelectorAll('.testi .mark');
    if (!grid || !cards.length || noMotion) return;

    gsap.set(cards, { opacity: 0, y: 44 });
    gsap.set(marks, { opacity: 0, scale: 0.3 });

    ScrollTrigger.create({
      trigger: grid,
      start: 'top 76%',
      once: true,
      onEnter: function () {
        gsap.timeline()
          .to(cards, {
            opacity: 1, y: 0,
            duration: 0.9, ease: 'power3.out',
            stagger: { amount: 0.5 }
          })
          .to(marks, {
            opacity: 1, scale: 1,
            duration: 0.65, ease: 'back.out(2.2)',
            stagger: { amount: 0.35 }
          }, '-=0.55')
          .add(function () {
            marks.forEach(function (mark, i) {
              gsap.to(mark, {
                y: -9,
                duration: 2.1 + i * 0.28,
                ease: 'sine.inOut',
                yoyo: true, repeat: -1,
                delay: i * 0.42
              });
            });
          }, '+=0.1');
      }
    });

    var all = Array.from(cards);
    all.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        gsap.to(all.filter(function (c) { return c !== card; }), {
          opacity: 0.35, scale: 0.97,
          duration: 0.38, ease: 'power2.out',
          overwrite: 'auto'
        });
      });
      card.addEventListener('mouseleave', function () {
        gsap.to(all, {
          opacity: 1, scale: 1,
          duration: 0.45, ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     Cursor preview tag (homepage .stage cards)
     ════════════════════════════════════════════════════════════════════════ */
  function initCursorLayer() {
    var stages = document.querySelectorAll('.stage');
    if (!stages.length) return;

    if (!document.getElementById('px-cursor-style')) {
      var st = document.createElement('style');
      st.id = 'px-cursor-style';
      st.textContent =
        '#px-layer{position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:visible;}' +
        '.px-preview{position:absolute;top:0;left:0;}' +
        '.px-preview-inner{background:#1a1410;color:#F4EFE4;padding:12px 20px;' +
          'border-left:3px solid #C9A24A;min-width:130px;' +
          'box-shadow:0 6px 24px rgba(0,0,0,.22);}' +
        '.px-tag{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.24em;' +
          'text-transform:uppercase;color:#C9A24A;margin-bottom:5px;}' +
        '.px-name{display:block;font-family:var(--display);font-style:italic;font-size:18px;' +
          'line-height:1.2;white-space:nowrap;}';
      document.head.appendChild(st);
    }

    var layer = document.createElement('div');
    layer.id = 'px-layer';
    document.body.appendChild(layer);

    var preview = document.createElement('div');
    preview.className = 'px-preview';
    preview.innerHTML =
      '<div class="px-preview-inner">' +
        '<span class="px-tag"></span>' +
        '<span class="px-name"></span>' +
      '</div>';
    gsap.set(preview, { opacity: 0, scale: 0.88 });
    layer.appendChild(preview);

    var pTag  = preview.querySelector('.px-tag');
    var pName = preview.querySelector('.px-name');
    var pxTo  = gsap.quickTo(preview, 'x', { duration: 0.22, ease: 'power2.out' });
    var pyTo  = gsap.quickTo(preview, 'y', { duration: 0.22, ease: 'power2.out' });

    function showPreview(tag, name) {
      pTag.textContent  = tag;
      pName.textContent = name;
      gsap.killTweensOf(preview);
      gsap.to(preview, { opacity: 1, scale: 1, duration: 0.28, ease: 'back.out(1.6)' });
    }
    function hidePreview() {
      gsap.to(preview, { opacity: 0, scale: 0.88, duration: 0.18, ease: 'power2.in' });
    }

    stages.forEach(function (card) {
      var enEl   = card.querySelector('.en');
      var name   = enEl ? enEl.textContent.trim() : ((card.querySelector('h3') || {}).textContent || '');
      var agesEl = card.querySelector('.ages');
      var ages   = agesEl ? agesEl.textContent.trim() : '';
      card.addEventListener('mouseenter', function () { showPreview(ages, name); });
      card.addEventListener('mouseleave', hidePreview);
    });

    /* Proximity scale — gentler now that we have full 3D tilt elsewhere */
    var proxEls = Array.from(document.querySelectorAll('.stage'));

    document.addEventListener('mousemove', function (e) {
      pxTo(e.clientX + 30);
      pyTo(e.clientY + 18);

      proxEls.forEach(function (el) {
        var r    = el.getBoundingClientRect();
        var dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
        var t    = Math.max(0, 1 - dist / 300);
        gsap.to(el, { scale: 1 + t * 0.018, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    document.addEventListener('mouseleave', function () {
      proxEls.forEach(function (el) {
        gsap.to(el, { scale: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     Page loader (homepage)
     ════════════════════════════════════════════════════════════════════════ */
  function initLoader() {
    var loader = document.getElementById('loader');
    if (!loader) return;

    document.body.style.animation = 'none';
    document.body.style.opacity   = '1';
    document.body.style.transform = 'none';

    var crest   = loader.querySelector('.loader-crest');
    var title   = loader.querySelector('.loader-title');
    var academy = loader.querySelector('.loader-academy');
    var rule    = loader.querySelector('.loader-rule');
    var locale  = loader.querySelector('.loader-locale');
    var bar     = loader.querySelector('.loader-bar-fill');
    var glow    = loader.querySelector('.loader-glow');
    var corners = loader.querySelectorAll('.loader-corner');

    gsap.set([crest, title, academy, locale], { opacity: 0 });
    gsap.set(corners, { opacity: 0 });
    gsap.set(crest,  { scale: 0.9 });
    gsap.set(title,  { y: 14 });
    gsap.set(rule,   { scaleX: 0 });

    function exitLoader() {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power3.inOut',
        onComplete: function () {
          loader.remove();
          ScrollTrigger.refresh();
        }
      });
    }

    if (noMotion) {
      gsap.set([crest, title, academy, locale, corners], { opacity: 1 });
      gsap.set([crest, rule], { scale: 1, scaleX: 1 });
      gsap.set(title, { y: 0 });
      if (glow) gsap.set(glow, { opacity: 1 });
      if (bar)  gsap.set(bar,  { width: '100%' });
      gsap.delayedCall(0.5, exitLoader);
      return;
    }

    gsap.timeline({ delay: 0.3 })
      .to(glow, { opacity: 1,    duration: 1.2,  ease: 'sine.out' })
      .to(glow, { opacity: 0.38, scale: 1.22,    duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    gsap.timeline({ onComplete: exitLoader })
      .to(corners,  { opacity: 1,           duration: 1.0,  ease: 'sine.out' },        0.1)
      .to(crest,    { opacity: 1, scale: 1, duration: 1.1,  ease: 'power1.out' },      0.3)
      .to(title,    { opacity: 1, y: 0,    duration: 1.0,  ease: 'power1.out' },       0.9)
      .to(academy,  { opacity: 1,           duration: 0.8,  ease: 'sine.out' },         1.45)
      .to(rule,     { scaleX: 1,            duration: 0.9,  ease: 'power2.inOut' },     1.8)
      .to(locale,   { opacity: 1,           duration: 0.7,  ease: 'sine.out' },         2.2)
      .to({},       { duration: 1.0 })
      .to(bar,      { width: '100%',        duration: 3.5,  ease: 'power1.inOut' }, 0);
  }

  /* ════════════════════════════════════════════════════════════════════════
     Legacy ScrollTrigger — preserved from previous version
     (the story-section pillar PNG is now owned by initStoryPillarScrub)
     ════════════════════════════════════════════════════════════════════════ */
  function initLegacyScrollTrigger() {
    if (noMotion) return;

    var numBlocks = document.querySelectorAll('.numbers-grid > div');
    numBlocks.forEach(function (el, idx) {
      gsap.fromTo(el,
        { y: 10 + idx * 4 },
        { y: -(10 + idx * 4), ease: 'none',
          scrollTrigger: { trigger: '.numbers', start: 'top bottom', end: 'bottom top', scrub: 1 } }
      );
    });

    var applyH2 = document.querySelector('.apply h2');
    if (applyH2) {
      gsap.fromTo(applyH2,
        { y: 20 },
        { y: -20, ease: 'none',
          scrollTrigger: { trigger: '.apply', start: 'top bottom', end: 'center top', scrub: 1 } }
      );
    }

    var gcseBadge = document.querySelector('.gcse .badge');
    if (gcseBadge) {
      gsap.from(gcseBadge, {
        x: -24, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.gcse', start: 'top 82%', toggleActions: 'play none none none' }
      });
    }
  }

}());
