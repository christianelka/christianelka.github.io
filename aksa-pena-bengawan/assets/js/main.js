/* Aksa Pena Bengawan — main.js (vanilla, tanpa framework) */
(function () {
  'use strict';

  // ---- Mobile nav ----
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  var mobileClose = document.getElementById('mobileClose');
  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', function () {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  function closeMobile() {
    if (mobileNav) mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (mobileClose) mobileClose.addEventListener('click', closeMobile);
  if (mobileNav) mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMobile);
  });

  // ---- Accordion FAQ ----
  document.querySelectorAll('.acc-item').forEach(function (item) {
    var btn = item.querySelector('.acc-btn');
    var panel = item.querySelector('.acc-panel');
    if (!btn || !panel) return;
    if (item.classList.contains('open')) panel.style.maxHeight = panel.scrollHeight + 'px';
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.acc-item.open').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.acc-panel').style.maxHeight = null;
        other.querySelector('.acc-btn').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ---- Reveal on scroll ----
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // ---- FAB WhatsApp ----
  var fab = document.getElementById('wa-fab');
  if (fab) fab.addEventListener('click', function () {
    if (typeof waFabOpen === 'function') waFabOpen();
  });

  // ---- RFQ form ----
  var form = document.getElementById('rfq-wa-form');
  if (form && typeof rfqSendWhatsApp === 'function') {
    form.addEventListener('submit', rfqSendWhatsApp);
  }
})();
