/* ─────────────────────────────────────────────────────────────────────────
   GSAP EFFECTS — The Paradox Academy
   Image preview · Proximity scale · ScrollTrigger parallax
   Requires: gsap.min.js + ScrollTrigger.min.js loaded before this file.
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var noMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch  = window.matchMedia('(hover: none)').matches;

  /* ── 0a. Page loader ─────────────────────────────────────────────────── */
  initLoader();

  /* ── Inject preview styles ──────────────────────────────────────────────── */
  var s = document.createElement('style');
  s.textContent =
    '#px-layer{position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:visible;}' +
    '.px-preview{position:absolute;top:0;left:0;}' +
    '.px-preview-inner{background:#1a1410;color:#F4EFE4;padding:12px 20px;' +
      'border-left:3px solid #C9A24A;min-width:130px;' +
      'box-shadow:0 6px 24px rgba(0,0,0,.22);}' +
    '.px-tag{display:block;font-family:var(--mono);font-size:9px;letter-spacing:.24em;' +
      'text-transform:uppercase;color:#C9A24A;margin-bottom:5px;}' +
    '.px-name{display:block;font-family:var(--display);font-style:italic;font-size:18px;' +
      'line-height:1.2;white-space:nowrap;}';
  document.head.appendChild(s);

  /* ── 0. Pulse fix ─────────────────────────────────────────────────────── */
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

  /* ── ScrollTrigger runs for everyone ─────────────────────────────────── */
  initScrollTrigger();

  if (noMotion || isTouch) return;

  /* ── Delay cursor init past the body pageEnter animation (550 ms) ──────── */
  gsap.delayedCall(0.65, initCursorLayer);

  /* ════════════════════════════════════════════════════════════════════════
     Cursor layer
     ════════════════════════════════════════════════════════════════════════ */
  function initCursorLayer() {

    var layer = document.createElement('div');
    layer.id = 'px-layer';
    document.body.appendChild(layer);

    /* ── 1. Cursor preview ──────────────────────────────────────────────── */
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

    /* Stage cards */
    document.querySelectorAll('.stage').forEach(function (card) {
      var enEl   = card.querySelector('.en');
      var name   = enEl ? enEl.textContent.trim() : ((card.querySelector('h3') || {}).textContent || '');
      var agesEl = card.querySelector('.ages');
      var ages   = agesEl ? agesEl.textContent.trim() : '';
      card.addEventListener('mouseenter', function () { showPreview(ages, name); });
      card.addEventListener('mouseleave', hidePreview);
    });

    /* Pillar cards */
    document.querySelectorAll('.pillar').forEach(function (card) {
      var h3     = card.querySelector('h3');
      var itEl   = h3 ? h3.querySelector('.it') : null;
      var italic = itEl ? itEl.textContent.trim() : '';
      var lhEl   = card.querySelector('.head .latin');
      var latin  = lhEl ? lhEl.childNodes[0].textContent.replace(/\s+/g, ' ').trim() : '';
      card.addEventListener('mouseenter', function () { showPreview(latin, italic); });
      card.addEventListener('mouseleave', hidePreview);
    });

    /* ── 2. Proximity scale ─────────────────────────────────────────────── */
    var proxEls = Array.from(document.querySelectorAll('.pillar, .stage'));

    document.addEventListener('mousemove', function (e) {
      var cx = e.clientX;
      var cy = e.clientY;

      pxTo(cx + 30);
      pyTo(cy + 18);

      proxEls.forEach(function (el) {
        var r    = el.getBoundingClientRect();
        var dist = Math.hypot(cx - (r.left + r.width / 2), cy - (r.top + r.height / 2));
        var t    = Math.max(0, 1 - dist / 300);
        gsap.to(el, { scale: 1 + t * 0.026, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
    });

    document.addEventListener('mouseleave', function () {
      proxEls.forEach(function (el) {
        gsap.to(el, { scale: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     Page loader
     ════════════════════════════════════════════════════════════════════════ */
  function initLoader() {
    var loader  = document.getElementById('loader');
    if (!loader) return;

    /* The body has animation:pageEnter which starts at opacity:0.
       That makes the loader (a body child) invisible for the first 550ms.
       Kill it immediately so the loader is fully opaque from the first frame. */
    document.body.style.animation = 'none';
    document.body.style.opacity   = '1';
    document.body.style.transform = 'none';

    var crest   = loader.querySelector('.loader-crest');
    var title   = loader.querySelector('.loader-title');
    var academy = loader.querySelector('.loader-academy');
    var rule    = loader.querySelector('.loader-rule');
    var locale  = loader.querySelector('.loader-locale');

    /* Set initial hidden states */
    gsap.set([crest, title, academy, locale], { opacity: 0 });
    gsap.set(crest,  { scale: 0.82 });
    gsap.set(title,  { y: 18 });
    gsap.set(rule,   { scaleX: 0 });

    function exitLoader() {
      gsap.to(loader, {
        yPercent: -100,
        duration: 0.78,
        ease: 'power3.inOut',
        onComplete: function () { loader.remove(); }
      });
    }

    if (noMotion) {
      gsap.set([crest, title, academy, locale], { opacity: 1 });
      gsap.set([crest, rule], { scale: 1, scaleX: 1 });
      gsap.set(title, { y: 0 });
      gsap.delayedCall(0.5, exitLoader);
      return;
    }

    gsap.timeline({ onComplete: exitLoader })
      .to(crest,   { opacity: 1, scale: 1, duration: 0.55, ease: 'power2.out' },  0.15)
      .to(title,   { opacity: 1, y: 0,    duration: 0.55, ease: 'power3.out' },   0.4)
      .to(academy, { opacity: 1,           duration: 0.4,  ease: 'power2.out' },   0.62)
      .to(rule,    { scaleX: 1,            duration: 0.5,  ease: 'power2.inOut' }, 0.78)
      .to(locale,  { opacity: 1,           duration: 0.35, ease: 'power2.out' },   0.98)
      .to({},      { duration: 1.1 }); /* hold — all elements visible */
  }

  /* ════════════════════════════════════════════════════════════════════════
     ScrollTrigger
     ════════════════════════════════════════════════════════════════════════ */
  function initScrollTrigger() {

    var pillarImg = document.querySelector('#story > img[aria-hidden]');
    if (pillarImg) {
      gsap.to(pillarImg, {
        y: 70, ease: 'none',
        scrollTrigger: { trigger: '#story', start: 'top bottom', end: 'bottom top', scrub: 1.2 }
      });
    }

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

    document.querySelectorAll('.testi .mark').forEach(function (mark) {
      gsap.from(mark, {
        scale: 0.4, opacity: 0, duration: 0.8, ease: 'back.out(1.4)',
        scrollTrigger: { trigger: mark, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });

    var gcseBadge = document.querySelector('.gcse .badge');
    if (gcseBadge) {
      gsap.from(gcseBadge, {
        x: -24, opacity: 0, duration: 0.7, ease: 'power3.out',
        scrollTrigger: { trigger: '.gcse', start: 'top 82%', toggleActions: 'play none none none' }
      });
    }
  }

}());
