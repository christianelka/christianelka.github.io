// guest-guard.js — Validates URL token against GUEST_LIST whitelist.
// Must be loaded AFTER guest-list.js.
//
// Also injects FontAwesome CSS if not already present (some pages lack it).

(function () {
  function ensureFontAwesome() {
    if (document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]')) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
    l.crossOrigin = 'anonymous';
    document.head.appendChild(l);
  }

  ensureFontAwesome();

  if (!window.GUEST_LIST) {
    console.warn('[guest-guard] GUEST_LIST not loaded — guard inactive');
    return;
  }

  const params = new URLSearchParams(location.search);
  const token = (params.get('token') || '').trim();
  const urlName = (params.get('to') || '').trim();

  function fail(reason) {
    document.body.classList.add('is-blocked');
    const gate = document.createElement('div');
    gate.id = 'guestGate';
    gate.innerHTML = `
      <div class="gg-card">
        <div class="gg-icon"><i class="fas fa-lock"></i></div>
        <div class="gg-eyebrow">Akses Ditolak</div>
        <h1 class="gg-title">Anda tidak termasuk dalam daftar tamu</h1>
        <p class="gg-dek">${reason}</p>
        <p class="gg-hint">Undangan ini bersifat personal. Silakan hubungi pengantin atau admin jika Anda merasa ini keliru.</p>
        <a class="gg-cta" href="https://wa.me/6281351880960?text=${encodeURIComponent('Halo Admin, saya menerima link undangan tapi sepertinya link-nya tidak valid. Mohon dicek.')}" target="_blank" rel="noopener">
          <i class="fab fa-whatsapp"></i> Hubungi Admin
        </a>
        <p class="gg-foot">VITTORIO WEDDING ORGANIZER</p>
      </div>
    `;
    document.body.appendChild(gate);
    // Block any open-btn clicks
    const openBtns = document.querySelectorAll('#openBtn, .open-btn, [data-role="open"]');
    openBtns.forEach(b => b.addEventListener('click', e => e.preventDefault(), true));
    // Block RSVP submit
    document.addEventListener('submit', e => {
      if (e.target.matches('form')) e.preventDefault();
    }, true);
  }

  function injectCSS() {
    if (document.getElementById('guestGateCSS')) return;
    const s = document.createElement('style');
    s.id = 'guestGateCSS';
    s.textContent = `
      body.is-blocked { overflow: hidden; }
      #guestGate { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(20, 18, 14, 0.92); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); font-family: "Outfit", system-ui, sans-serif; }
      .gg-card { max-width: 460px; width: 100%; background: #FAF9F6; color: #1A1A1A; padding: 48px 32px; border-radius: 8px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
      .gg-icon { font-size: 48px; color: #C5A880; margin-bottom: 16px; }
      .gg-eyebrow { font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; color: #9A9A95; margin-bottom: 12px; }
      .gg-title { font-size: 22px; font-weight: 500; margin-bottom: 12px; line-height: 1.3; font-family: "Outfit", serif; }
      .gg-dek { font-size: 14px; color: #5A5A5A; margin-bottom: 16px; line-height: 1.55; }
      .gg-hint { font-size: 12px; color: #9A9A95; margin-bottom: 24px; }
      .gg-cta { display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 12px 24px; border-radius: 4px; text-decoration: none; font-size: 13px; font-weight: 500; letter-spacing: 0.05em; transition: background 0.2s; }
      .gg-cta:hover { background: #1FB957; }
      .gg-foot { font-size: 10px; letter-spacing: 0.3em; color: #9A9A95; margin-top: 32px; }
    `;
    document.head.appendChild(s);
  }

  function isPreviewMode() {
    return token === 'preview' || token === 'dev' || urlName.toLowerCase() === 'preview' || urlName.toLowerCase() === 'dev';
  }

  const config = window.GUEST_CONFIG || {};
  const production = !!config.production;

  if (production) {
    injectCSS();
    if (!token) {
      fail('Token akses tidak ditemukan di URL. Silakan gunakan link undangan lengkap yang diberikan admin.');
      return;
    }
    const entry = window.GUEST_LIST[token];
    if (!entry) {
      fail('Token "' + token + '" tidak terdaftar. Mungkin link sudah kadaluarsa atau salah ketik.');
      return;
    }
    window.__GUARD_MODE__ = 'production';
    window.__INVITED_GUEST__ = entry;
    console.log('[guest-guard] OK:', entry.name);
  } else {
    window.__GUARD_MODE__ = 'open';
    const fallbackGuest = { name: urlName || 'Tamu Undangan', token: token || 'preview' };
    window.__INVITED_GUEST__ = fallbackGuest;
    console.log('[guest-guard] open mode (no token required)');
  }
})();
