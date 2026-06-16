/* invitation-lock.js
 * CARA MEMBUKA PROTEKSI (owner):
 *   - URL:    ?nolock=1   (mis. undangan_x.html?to=A&token=B&nolock=1)
 *   - Console: invitation.unlock() lalu refresh
 *   - Hapus snippet injeksi di <head> file invitation
 *
 * CARA GANTI PASSWORD:
 *   1. Hitung hash baru dengan helper di bawah (paste di Node):
 *        function h(s){var H=0x811c9dc5;for(var i=0;i<s.length;i++){H^=s.charCodeAt(i);H=(H*0x01000193)>>>0;}var o='',S=H;for(var j=0;j<8;j++){S=(S*0x01000193+0x811c9dc5)>>>0;o+=S.toString(16).padStart(8,'0');}return o;}
 *        h('passwordBaru')
 *   2. Ganti PWD_HASH di bawah dengan outputnya
 *   3. Ganti 'anjaymabar' di baris isUnlocked() dengan password baru
 *   JANGAN pakai Math.imul — gunakan * saja agar konsisten dengan runtime browser.
 *
 * DISCLAIMER: client-side gate. File HTML tetap dikirim utuh ke browser
 * (network tab / view-source masih bisa lihat). Untuk 100% aman → private repo.
 */
(function () {
  'use strict';

  // FNV-1a 32-bit, deterministic. Plaintext password: "anjaymabar"
  var PWD_HASH = 'c64fcd5000bcd2b8625c556dc577185cb797f6981d55cf10bf3193f571288878';
  var STORAGE_KEY = 'invitation_unlock_v1';
  var SESSION_KEY = 'invitation_unlock_session_v1';

  function computeHash(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 0x01000193) >>> 0;
    }
    var out = '';
    var seed = h;
    for (var j = 0; j < 8; j++) {
      seed = (seed * 0x01000193 + 0x811c9dc5) >>> 0;
      out += seed.toString(16).padStart(8, '0');
    }
    return out;
  }

  function isUnlocked() {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') return true;
      if (localStorage.getItem(STORAGE_KEY) === computeHash('anjaymabar')) return true;
    } catch (e) {}
    try {
      var url = new URL(window.location.href);
      if (url.searchParams.get('nolock') === '1') {
        sessionStorage.setItem(SESSION_KEY, '1');
        return true;
      }
    } catch (e) {}
    return false;
  }

  function lock() {
    document.documentElement.style.overflow = 'hidden';

    var overlay = document.createElement('div');
    overlay.id = 'invitation-lock-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Akses terkunci');
    overlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:2147483647',
      'background:radial-gradient(ellipse at center,#1a1a2e 0%,#0a0a14 70%)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      'color:#e8e8f0', 'padding:20px', 'box-sizing:border-box'
    ].join(';');

    overlay.innerHTML = [
      '<div style="max-width:380px;width:100%;text-align:center">',
      '  <div style="font-size:48px;margin-bottom:12px;opacity:0.85">&#x1F512;</div>',
      '  <h1 style="font-size:22px;font-weight:600;margin:0 0 6px;letter-spacing:0.02em">Demo Dilindungi</h1>',
      '  <p style="font-size:14px;opacity:0.7;margin:0 0 28px;line-height:1.5">Masukkan kata sandi untuk membuka pratinjau undangan.</p>',
      '  <form id="invitation-lock-form" style="display:flex;flex-direction:column;gap:12px">',
      '    <input id="invitation-lock-input" type="password" autocomplete="off" autocapitalize="off" spellcheck="false"',
      '      placeholder="Kata sandi"',
      '      style="padding:14px 16px;font-size:15px;border:1px solid rgba(255,255,255,0.15);border-radius:10px;background:rgba(255,255,255,0.06);color:#fff;outline:none;text-align:center;letter-spacing:0.05em;transition:border-color 0.2s" />',
      '    <button type="submit"',
      '      style="padding:14px;font-size:14px;font-weight:600;border:none;border-radius:10px;background:linear-gradient(135deg,#6b7fff,#8b5cf6);color:#fff;cursor:pointer;letter-spacing:0.02em">Buka</button>',
      '    <div id="invitation-lock-error" style="font-size:13px;color:#ff6b6b;min-height:18px;opacity:0;transition:opacity 0.2s"></div>',
      '  </form>',
      '  <p style="font-size:11px;opacity:0.4;margin-top:32px;line-height:1.4">Akses terbatas &middot; Demo internal</p>',
      '</div>'
    ].join('\n');

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    var styleEl = document.createElement('style');
    styleEl.id = 'invitation-lock-blur';
    styleEl.textContent = 'body > *:not(#invitation-lock-overlay) { filter: blur(12px); pointer-events: none; user-select: none; }';
    document.head.appendChild(styleEl);

    var input = document.getElementById('invitation-lock-input');
    var error = document.getElementById('invitation-lock-error');
    var form = document.getElementById('invitation-lock-form');
    var submitted = false;

    setTimeout(function () { input.focus(); }, 50);

    input.addEventListener('input', function () {
      input.style.borderColor = 'rgba(255,255,255,0.15)';
      error.style.opacity = '0';
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitted) return;
      var val = input.value;
      if (computeHash(val) === PWD_HASH) {
        submitted = true;
        try {
          localStorage.setItem(STORAGE_KEY, PWD_HASH);
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch (err) {}
        overlay.style.transition = 'opacity 0.4s ease';
        overlay.style.opacity = '0';
        styleEl.remove();
        setTimeout(function () {
          overlay.remove();
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }, 400);
      } else {
        error.textContent = 'Kata sandi salah';
        error.style.opacity = '1';
        input.style.borderColor = '#ff6b6b';
        overlay.style.animation = 'none';
        // Force reflow agar animasi shake restart
        void overlay.offsetWidth;
        overlay.style.animation = 'invitation-shake 0.4s ease';
        input.value = '';
        input.focus();
      }
    });

    if (!document.getElementById('invitation-lock-keyframes')) {
      var kf = document.createElement('style');
      kf.id = 'invitation-lock-keyframes';
      kf.textContent = '@keyframes invitation-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }';
      document.head.appendChild(kf);
    }

    overlay.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    window.invitation = window.invitation || {};
    window.invitation.unlock = function () {
      try {
        localStorage.setItem(STORAGE_KEY, PWD_HASH);
        sessionStorage.setItem(SESSION_KEY, '1');
        location.reload();
      } catch (e) {}
    };
  }

  function init() {
    if (!isUnlocked()) {
      lock();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
