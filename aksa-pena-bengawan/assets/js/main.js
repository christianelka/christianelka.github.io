/* Aksa Pena Bengawan — main.js (vanilla, tanpa framework) */
(function () {
  'use strict';

  // ---- Mobile nav ----
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  var mobileClose = document.getElementById('mobileClose');
  if (hamburger && mobileNav) {
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-controls', 'mobileNav');
    hamburger.addEventListener('click', function () {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
      hamburger.setAttribute('aria-expanded', 'true');
    });
  }
  function closeMobile() {
    if (mobileNav) mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  }
  if (mobileClose) mobileClose.addEventListener('click', closeMobile);
  if (mobileNav) mobileNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMobile);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) closeMobile();
  });

  // ---- Accordion FAQ ----
  var accBtns = Array.prototype.slice.call(document.querySelectorAll('.acc-item .acc-btn'));
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
    // Navigasi keyboard ala WAI-ARIA accordion
    btn.addEventListener('keydown', function (e) {
      var idx = accBtns.indexOf(btn);
      var target = null;
      if (e.key === 'ArrowDown') target = accBtns[(idx + 1) % accBtns.length];
      else if (e.key === 'ArrowUp') target = accBtns[(idx - 1 + accBtns.length) % accBtns.length];
      else if (e.key === 'Home') target = accBtns[0];
      else if (e.key === 'End') target = accBtns[accBtns.length - 1];
      if (target) { e.preventDefault(); target.focus(); }
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
