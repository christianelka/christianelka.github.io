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

  // ---- Lightbox galeri portofolio ----
  var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery .g-item'));
  var lightbox = document.getElementById('lightbox');
  if (galleryItems.length && lightbox) {
    var lbImg = document.getElementById('lbImg');
    var lbCaption = document.getElementById('lbCaption');
    var lbCounter = document.getElementById('lbCounter');
    var lbClose = document.getElementById('lbClose');
    var lbPrev = document.getElementById('lbPrev');
    var lbNext = document.getElementById('lbNext');
    var lbIndex = 0, lastFocus = null;

    function showLb(i) {
      lbIndex = (i + galleryItems.length) % galleryItems.length;
      var img = galleryItems[lbIndex].querySelector('img');
      var cap = galleryItems[lbIndex].querySelector('figcaption');
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt;
      lbCaption.textContent = cap ? cap.textContent : '';
      lbCounter.textContent = (lbIndex + 1) + ' / ' + galleryItems.length;
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      showLb(i);
      lightbox.hidden = false;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { lightbox.classList.add('open'); });
      });
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    }
    function closeLb() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(function () { lightbox.hidden = true; }, 260);
      if (lastFocus) lastFocus.focus();
    }
    galleryItems.forEach(function (item, i) {
      var cap = item.querySelector('figcaption');
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'Lihat detail: ' + (cap ? cap.textContent : 'foto portofolio'));
      item.addEventListener('click', function () { openLb(i); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
      });
    });
    lbClose.addEventListener('click', closeLb);
    lbPrev.addEventListener('click', function (e) { e.stopPropagation(); showLb(lbIndex - 1); });
    lbNext.addEventListener('click', function (e) { e.stopPropagation(); showLb(lbIndex + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
      else if (e.key === 'ArrowRight') showLb(lbIndex + 1);
    });
    var touchX = null;
    lightbox.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
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
