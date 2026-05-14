/* ─────────────────────────────────────────────────────────────────────────
   PARADOXUM — icons.js
   A single sprite of inline SVGs, injected into the document on load.
   Each icon is a <symbol> in the sprite; reference them in markup as
   <svg class="ico"><use href="#ico-quill"/></svg>.

   All icons share a 24×24 viewBox and use currentColor for stroke so they
   inherit the surrounding text colour. A few have multiple paths with
   distinct classes (.ink, .gold, .draw) so the animations can target them.
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  // Define each symbol's inner markup. Keep stroke-width and linecap consistent.
  // The .draw class on a path opts into the stroke-dashoffset draw-on animation.
  var icons = {
    // The quill — a Paradoxum signature, mirroring the crest scroll
    quill: '\
<path class="draw" d="M19 4 L 7 16 L 5 19 L 8 17 L 20 5 Z" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>\
<path class="draw" d="M5 19 L 4 20" stroke-width="1.4" stroke-linecap="round"/>\
<path class="draw" d="M14.5 8.5 L 17 11" stroke-width="1.4" stroke-linecap="round"/>',

    // Open book — for programmes, library, prose
    book: '\
<path class="draw" d="M3 6 C 6 5, 9 5, 12 7 C 15 5, 18 5, 21 6 L 21 19 C 18 18, 15 18, 12 19.5 C 9 18, 6 18, 3 19 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M12 7 L 12 19.5" stroke-width="1.3"/>',

    // Flask — science, lab
    flask: '\
<path class="draw" d="M10 3 L 14 3" stroke-width="1.3" stroke-linecap="round"/>\
<path class="draw" d="M10.5 3 L 10.5 9 L 5.5 18 C 5 19, 5.5 20, 6.5 20 L 17.5 20 C 18.5 20, 19 19, 18.5 18 L 13.5 9 L 13.5 3" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M7.5 14 L 16.5 14" stroke-width="1.3"/>\
<circle class="draw" cx="10" cy="17" r="0.8" stroke-width="1.1"/>\
<circle class="draw" cx="14" cy="16" r="0.6" stroke-width="1.1"/>',

    // Palette — arts
    palette: '\
<path class="draw" d="M12 3 C 7 3, 3 7, 3 12 C 3 16, 6 18, 9 18 C 10.5 18, 10.5 16, 11 15 C 11.5 14, 13 14, 14 14 L 17 14 C 19.5 14, 21 12, 21 10 C 21 6, 17 3, 12 3 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<circle class="draw" cx="7" cy="10" r="1" stroke-width="1.1"/>\
<circle class="draw" cx="10" cy="6.5" r="1" stroke-width="1.1"/>\
<circle class="draw" cx="14" cy="6.5" r="1" stroke-width="1.1"/>\
<circle class="draw" cx="17" cy="10" r="1" stroke-width="1.1"/>',

    // Trophy — sports, athletica, prize-giving
    trophy: '\
<path class="draw" d="M8 4 L 16 4 L 16 11 C 16 13, 14.5 14.5, 12 14.5 C 9.5 14.5, 8 13, 8 11 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M8 6 L 5 6 L 5 9 C 5 10.5, 6 11, 7.5 11" stroke-width="1.3"/>\
<path class="draw" d="M16 6 L 19 6 L 19 9 C 19 10.5, 18 11, 16.5 11" stroke-width="1.3"/>\
<path class="draw" d="M12 14.5 L 12 18 M 9 20 L 15 20 M 10 18 L 14 18" stroke-width="1.3" stroke-linecap="round"/>',

    // Leaf — environment, eco-warriors, nature
    leaf: '\
<path class="draw" d="M20 4 C 14 4, 5 7, 5 14 C 5 18, 8 20, 12 20 C 18 20, 20 13, 20 4 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M5 19.5 L 14 11" stroke-width="1.3" stroke-linecap="round"/>',

    // Code brackets — ICT, coding
    code: '\
<path class="draw" d="M8 7 L 3 12 L 8 17" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>\
<path class="draw" d="M16 7 L 21 12 L 16 17" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"/>\
<path class="draw" d="M14 5 L 10 19" stroke-width="1.4" stroke-linecap="round"/>',

    // Two-people — community, team, mentorship
    people: '\
<circle class="draw" cx="9" cy="8" r="3" stroke-width="1.3"/>\
<circle class="draw" cx="16" cy="9" r="2.3" stroke-width="1.3"/>\
<path class="draw" d="M3 19 C 3 15.5, 5.5 13.5, 9 13.5 C 12.5 13.5, 15 15.5, 15 19" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M15 14.5 C 16 14, 17 13.8, 18 13.8 C 20 13.8, 21 15.5, 21 17.5 L 21 19" stroke-width="1.3" stroke-linejoin="round"/>',

    // Compass — navigation, exploration, careers guidance
    compass: '\
<circle class="draw" cx="12" cy="12" r="9" stroke-width="1.3"/>\
<path class="draw" d="M12 6 L 14 12 L 12 18 L 10 12 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<circle class="draw" cx="12" cy="12" r="1" stroke-width="1.1"/>',

    // Calendar — events, term dates
    calendar: '\
<rect class="draw" x="3.5" y="5" width="17" height="15" rx="1" stroke-width="1.3"/>\
<path class="draw" d="M3.5 9 L 20.5 9" stroke-width="1.3"/>\
<path class="draw" d="M8 3 L 8 7 M 16 3 L 16 7" stroke-width="1.3" stroke-linecap="round"/>\
<circle class="draw" cx="8" cy="13" r="0.7" stroke-width="1"/>\
<circle class="draw" cx="12" cy="13" r="0.7" stroke-width="1"/>\
<circle class="draw" cx="16" cy="13" r="0.7" stroke-width="1"/>',

    // Heart with rays — pastoral care, wellbeing
    heart: '\
<path class="draw" d="M12 19 C 8 16, 3 13, 3 9 C 3 6.5, 5 5, 7 5 C 9 5, 11 6.5, 12 8.5 C 13 6.5, 15 5, 17 5 C 19 5, 21 6.5, 21 9 C 21 13, 16 16, 12 19 Z" stroke-width="1.3" stroke-linejoin="round"/>',

    // Globe — international, GCSE pathway
    globe: '\
<circle class="draw" cx="12" cy="12" r="9" stroke-width="1.3"/>\
<path class="draw" d="M12 3 C 9 6, 8 9, 8 12 C 8 15, 9 18, 12 21" stroke-width="1.3"/>\
<path class="draw" d="M12 3 C 15 6, 16 9, 16 12 C 16 15, 15 18, 12 21" stroke-width="1.3"/>\
<path class="draw" d="M3 12 L 21 12" stroke-width="1.3"/>',

    // Shield — safety, integrity
    shield: '\
<path class="draw" d="M12 3 L 20 5.5 L 20 12 C 20 17, 16 20, 12 21 C 8 20, 4 17, 4 12 L 4 5.5 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M9 12 L 11 14 L 15 10" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',

    // Microphone — debate, oratory
    mic: '\
<rect class="draw" x="9" y="3" width="6" height="12" rx="3" stroke-width="1.3"/>\
<path class="draw" d="M5.5 11 C 5.5 14.5, 8 17, 12 17 C 16 17, 18.5 14.5, 18.5 11" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M12 17 L 12 21 M 9 21 L 15 21" stroke-width="1.3" stroke-linecap="round"/>',

    // Note (music) — choir, music programme
    note: '\
<path class="draw" d="M8 17 L 8 6 L 19 4 L 19 15" stroke-width="1.3" stroke-linejoin="round"/>\
<ellipse class="draw" cx="6" cy="17.5" rx="2.5" ry="1.8" stroke-width="1.3"/>\
<ellipse class="draw" cx="17" cy="15.5" rx="2.5" ry="1.8" stroke-width="1.3"/>',

    // Sun-rays — sports day, athletics, morning
    sun: '\
<circle class="draw" cx="12" cy="12" r="4" stroke-width="1.3"/>\
<path class="draw" d="M12 3 L 12 5 M12 19 L 12 21 M3 12 L 5 12 M19 12 L 21 12 M5.5 5.5 L 7 7 M17 17 L 18.5 18.5 M5.5 18.5 L 7 17 M17 7 L 18.5 5.5" stroke-width="1.3" stroke-linecap="round"/>',

    // Star — achievement, champion
    star: '\
<path class="draw" d="M12 3 L 14.5 9 L 21 9.5 L 16 14 L 17.5 20.5 L 12 17 L 6.5 20.5 L 8 14 L 3 9.5 L 9.5 9 Z" stroke-width="1.3" stroke-linejoin="round"/>',

    // Pin / map marker — location, contact, visit
    pin: '\
<path class="draw" d="M12 3 C 8 3, 5 6, 5 10 C 5 15, 12 21, 12 21 C 12 21, 19 15, 19 10 C 19 6, 16 3, 12 3 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<circle class="draw" cx="12" cy="10" r="2.5" stroke-width="1.3"/>',

    // Mail — contact, email
    mail: '\
<rect class="draw" x="3" y="5.5" width="18" height="13" rx="1" stroke-width="1.3"/>\
<path class="draw" d="M3.5 6.5 L 12 13 L 20.5 6.5" stroke-width="1.3" stroke-linejoin="round"/>',

    // Phone
    phone: '\
<path class="draw" d="M5 3 L 9 3 L 11 8 L 8.5 9.5 C 9.5 12.5, 11.5 14.5, 14.5 15.5 L 16 13 L 21 15 L 21 19 C 21 20, 20 21, 19 21 C 11 21, 3 13, 3 5 C 3 4, 4 3, 5 3 Z" stroke-width="1.3" stroke-linejoin="round"/>',

    // Cap (mortarboard) — graduation, JSS, Senior secondary
    cap: '\
<path class="draw" d="M12 4 L 22 9 L 12 14 L 2 9 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M6 11 L 6 17 C 6 18, 9 19, 12 19 C 15 19, 18 18, 18 17 L 18 11" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M22 9 L 22 14" stroke-width="1.3" stroke-linecap="round"/>',

    // Hand-pen — write, application form
    pen: '\
<path class="draw" d="M14 4 L 20 10 L 9 21 L 3 21 L 3 15 Z" stroke-width="1.3" stroke-linejoin="round"/>\
<path class="draw" d="M12 6 L 18 12" stroke-width="1.3"/>'
  };

  // Compose all symbols into a single sprite
  var parts = [];
  for (var key in icons) {
    parts.push(
      '<symbol id="ico-' + key + '" viewBox="0 0 24 24" fill="none" stroke="currentColor">' +
      icons[key] +
      '</symbol>'
    );
  }

  // Inject the sprite at the top of <body>, hidden, on DOM ready.
  function inject() {
    var s = document.createElement('div');
    s.id = '__ico-sprite';
    s.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;';
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">' +
      parts.join('') +
      '</svg>';
    document.body.insertBefore(s, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
