(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var header = document.getElementById('site-header');
  var toggle = header && header.querySelector('.menu-toggle');
  if (toggle) {
    var setOpen = function (open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
    header.querySelectorAll('.md-nav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  }

  // E-mail links: the address is assembled here so it is not in the HTML as plain text.
  document.querySelectorAll('[data-email-user]').forEach(function (node) {
    var address = node.getAttribute('data-email-user') + '@' + node.getAttribute('data-email-domain');
    var subject = node.getAttribute('data-email-subject');
    if (node.tagName === 'A') node.href = 'mailto:' + address + (subject ? '?subject=' + encodeURIComponent(subject) : '');
    node.querySelectorAll('[data-email-text]').forEach(function (t) { t.textContent = address + t.getAttribute('data-email-text'); });
  });

  // Typed roles in the hero: "I'm Mathias, <role>"
  var typed = document.querySelector('[data-roles]');
  if (typed) {
    var roles;
    try { roles = JSON.parse(typed.getAttribute('data-roles')); } catch (e) { roles = []; }
    if (roles.length) {
      var ri = 0, n = roles[0].length, deleting = false;
      var show = function () { typed.textContent = roles[ri].slice(0, n); };
      if (reduce) {
        setInterval(function () { ri = (ri + 1) % roles.length; n = roles[ri].length; show(); }, 2600);
      } else {
        n = 0;
        var tick = function () {
          var delay = 85, word = roles[ri];
          if (!deleting) {
            if (n < word.length) n++; else { deleting = true; delay = 1700; }
          } else if (n > 0) { n--; delay = 40; } else { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
          show();
          setTimeout(tick, delay);
        };
        show();
        setTimeout(tick, 600);
      }
    }
  }

  // Highlight the menu item of the section in view.
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.md-nav a[href*="#"]'));
  var sections = navLinks.map(function (a) { return document.getElementById(a.getAttribute('href').split('#')[1]); });
  if (sections.some(Boolean)) {
    var current = null, queued = false;
    var update = function () {
      queued = false;
      var id = null;
      sections.forEach(function (s) {
        if (s && s.getBoundingClientRect().top <= window.innerHeight * 0.4) id = s.id;
      });
      if (id === current) return;
      current = id;
      navLinks.forEach(function (a) {
        if (id && a.getAttribute('href').split('#')[1] === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }
})();
