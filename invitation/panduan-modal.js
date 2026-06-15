// panduan-modal.js — injects universal "Panduan Penggunaan" modal into any page
// Usage: include this script after the page DOM. Optionally pass ?panduan=open to auto-open.

(function () {
  if (!window.PANDUAN) return;

  const P = window.PANDUAN;
  const currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const isIndex = currentFile === 'index.html' || currentFile === '';
  const templateKey = isIndex ? null : currentFile;
  const tpl = templateKey ? P.templates[templateKey] : null;

  // Build modal HTML
  const css = `
    .pdn-trigger {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 16px;
      font-family: inherit;
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.32em; text-transform: uppercase;
      color: #FAF9F6;
      background: #1A1A1A;
      border: none;
      border-radius: 9999px;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      transition: all 0.3s var(--ease, ease);
    }
    .pdn-trigger:hover { background: #C5A880; color: #1A1A1A; transform: translateY(-1px); }
    .pdn-trigger i { color: #C5A880; }
    .pdn-trigger:hover i { color: #1A1A1A; }

    .pdn-modal {
      position: fixed; inset: 0;
      z-index: 100000;
      background: rgba(15, 12, 8, 0.82);
      backdrop-filter: blur(14px);
      display: none;
      align-items: center; justify-content: center;
      padding: 20px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    .pdn-modal.is-open { display: flex; opacity: 1; }
    .pdn-card {
      background: #FAF9F6;
      width: 100%;
      max-width: 760px;
      max-height: 92vh;
      overflow-y: auto;
      border-radius: 12px;
      position: relative;
      box-shadow: 0 40px 100px rgba(0,0,0,0.5);
      animation: pdnIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes pdnIn { from { transform: translateY(20px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
    .pdn-close {
      position: sticky; top: 12px; float: right;
      margin: 12px 12px 0 0;
      width: 36px; height: 36px;
      background: #1A1A1A; color: #FAF9F6;
      border: none; border-radius: 50%;
      font-size: 18px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 10;
      transition: background 0.2s;
    }
    .pdn-close:hover { background: #C5A880; color: #1A1A1A; }

    .pdn-inner { padding: clamp(28px, 5vw, 48px); }
    .pdn-eyebrow {
      display: inline-flex; align-items: center; gap: 8px;
      font-size: 9.5px; font-weight: 600;
      letter-spacing: 0.4em; text-transform: uppercase;
      color: #1A1A1A;
      background: #C5A880;
      padding: 5px 12px;
      border-radius: 9999px;
      margin-bottom: 12px;
    }

    .pdn-header {
      display: flex; align-items: flex-end; gap: 18px;
      padding-bottom: 24px;
      margin-bottom: 28px;
      border-bottom: 2px solid #1A1A1A;
    }
    .pdn-header-icon {
      width: 64px; height: 64px;
      background: #1A1A1A; color: #C5A880;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 26px;
      flex-shrink: 0;
      box-shadow: 6px 6px 0 #C5A880;
    }
    .pdn-header-text h1 {
      font-size: clamp(24px, 4vw, 32px);
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #1A1A1A;
      margin: 0;
      line-height: 1.1;
    }
    .pdn-header-text p {
      font-size: 13px; line-height: 1.6;
      color: #5A5A5A;
      margin: 6px 0 0;
    }
    @media (max-width: 480px) {
      .pdn-header { flex-direction: column; align-items: flex-start; gap: 12px; }
    }

    /* TOC badges */
    .pdn-toc {
      display: flex; flex-wrap: wrap; gap: 8px;
      padding: 18px;
      background: #1A1A1A;
      border-radius: 10px;
      margin-bottom: 28px;
    }
    .pdn-toc-pill {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px;
      font-size: 11px; font-weight: 500;
      color: #FAF9F6;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .pdn-toc-pill:hover { background: rgba(255,255,255,0.15); }
    .pdn-toc-pill i { font-size: 11px; }
    .pdn-toc-pill .pdn-toc-num {
      width: 18px; height: 18px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 700;
      color: #1A1A1A;
      flex-shrink: 0;
    }

    .pdn-h2 {
      display: flex; align-items: center; gap: 10px;
      font-size: 14px; font-weight: 600;
      letter-spacing: 0.2em; text-transform: uppercase;
      color: #1A1A1A;
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #C5A880;
    }
    .pdn-h2-num {
      width: 28px; height: 28px;
      border-radius: 50%;
      color: #FAF9F6;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .pdn-h2 i { color: #1A1A1A; font-size: 14px; }

    /* Quick-start numbered steps */
    .pdn-steps {
      list-style: none;
      counter-reset: pdnStep;
      padding: 0; margin: 0;
      display: grid; gap: 12px;
    }
    .pdn-step {
      counter-increment: pdnStep;
      display: flex; align-items: flex-start; gap: 14px;
      padding: 14px 16px;
      background: #fff;
      border: 1px solid #E5E2D9;
      border-radius: 8px;
      position: relative;
    }
    .pdn-step::before {
      content: counter(pdnStep);
      flex-shrink: 0;
      width: 28px; height: 28px;
      background: #1A1A1A; color: #C5A880;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700;
    }
    .pdn-step-icon {
      flex-shrink: 0;
      width: 32px; height: 32px;
      background: #C5A880;
      color: #1A1A1A;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
    }
    .pdn-step-text { flex: 1; font-size: 13px; line-height: 1.55; color: #1A1A1A; }
    .pdn-step-text strong { display: block; font-weight: 600; margin-bottom: 2px; }

    /* Tips with icons */
    .pdn-tips {
      list-style: none;
      padding: 0; margin: 0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    @media (max-width: 540px) { .pdn-tips { grid-template-columns: 1fr; } }
    .pdn-tip {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 14px;
      background: #fff;
      border-left: 3px solid #4D96FF;
      border-radius: 0 6px 6px 0;
      font-size: 12.5px;
      line-height: 1.4;
      color: #1A1A1A;
    }
    .pdn-tip i {
      width: 20px; height: 20px;
      background: #4D96FF; color: #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px;
      flex-shrink: 0;
    }

    /* Test mode cards */
    .pdn-test-grid {
      display: grid; gap: 10px;
    }
    .pdn-test {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 14px;
      background: #fff;
      border: 1px solid #E5E2D9;
      border-radius: 8px;
    }
    .pdn-test-badge {
      width: 36px; height: 36px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; font-weight: 700;
      color: #1A1A1A;
      flex-shrink: 0;
    }
    .pdn-test-body { flex: 1; min-width: 0; }
    .pdn-test-body strong { display: block; font-size: 12.5px; color: #1A1A1A; margin-bottom: 2px; }
    .pdn-test-body code {
      font-family: "SF Mono", Menlo, monospace;
      font-size: 10.5px;
      background: #F5F0E5;
      padding: 1px 5px;
      border-radius: 3px;
      color: #C5A880;
      word-break: break-all;
    }
    .pdn-test-body p { font-size: 11.5px; color: #5A5A5A; margin: 4px 0 0; line-height: 1.5; }

    /* Feature grid with big icon boxes */
    .pdn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    @media (max-width: 540px) { .pdn-grid { grid-template-columns: 1fr; } }
    .pdn-feat {
      display: flex; gap: 12px;
      padding: 14px;
      background: #fff;
      border: 1px solid #E5E2D9;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .pdn-feat:hover { border-color: #C5A880; transform: translateY(-2px); }
    .pdn-feat-icon {
      flex-shrink: 0;
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #1A1A1A, #2A2A2A);
      color: #C5A880;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    }
    .pdn-feat-text strong {
      display: block;
      font-size: 13px; font-weight: 600;
      color: #1A1A1A;
      margin-bottom: 3px;
    }
    .pdn-feat-text span {
      font-size: 11.5px;
      line-height: 1.5;
      color: #5A5A5A;
    }

    /* Security list with green check */
    .pdn-security {
      display: grid; gap: 8px;
    }
    .pdn-sec-item {
      display: flex; gap: 12px; align-items: flex-start;
      padding: 12px 14px;
      background: linear-gradient(90deg, rgba(76, 175, 80, 0.06), transparent);
      border-left: 3px solid #4CAF50;
      border-radius: 0 6px 6px 0;
    }
    .pdn-sec-icon {
      flex-shrink: 0;
      width: 28px; height: 28px;
      background: #4CAF50;
      color: #fff;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px;
    }
    .pdn-sec-item strong { display: block; font-size: 13px; color: #1A1A1A; margin-bottom: 2px; }
    .pdn-sec-item span { font-size: 12px; color: #5A5A5A; line-height: 1.5; }

    /* Template cards with palette swatches */
    .pdn-tpl-card {
      padding: 18px;
      background: #fff;
      border: 1px solid #E5E2D9;
      border-radius: 10px;
      margin-bottom: 12px;
    }
    .pdn-tpl-card .pdn-tpl-head {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 8px;
    }
    .pdn-tpl-card .pdn-tag {
      display: inline-block;
      padding: 3px 10px;
      background: #1A1A1A;
      color: #C5A880;
      font-size: 9.5px; font-weight: 600;
      letter-spacing: 0.2em; text-transform: uppercase;
      border-radius: 9999px;
    }
    .pdn-tpl-card h3 { font-size: 18px; font-weight: 600; margin: 0; color: #1A1A1A; }
    .pdn-tpl-card .pdn-palette {
      display: flex; align-items: center; gap: 6px;
      margin: 8px 0 10px;
      font-size: 11px; color: #5A5A5A;
    }
    .pdn-palette-swatch {
      width: 18px; height: 18px;
      border-radius: 50%;
      border: 1.5px solid #1A1A1A;
    }
    .pdn-tpl-card .pdn-meta {
      font-size: 11px; color: #5A5A5A;
      font-family: "SF Mono", Menlo, monospace;
      background: #F5F0E5;
      padding: 4px 8px;
      border-radius: 3px;
      display: inline-block;
      margin-bottom: 10px;
    }
    .pdn-tpl-card p { font-size: 12.5px; line-height: 1.6; color: #1A1A1A; margin-bottom: 10px; }
    .pdn-tpl-card p strong { color: #C5A880; }
    .pdn-tpl-card ul { list-style: none; padding: 0; margin: 0; }
    .pdn-tpl-card li {
      display: flex; align-items: flex-start; gap: 8px;
      font-size: 12px; line-height: 1.55;
      color: #1A1A1A;
      padding: 4px 0;
    }
    .pdn-tpl-card li i { color: #4CAF50; margin-top: 3px; flex-shrink: 0; }

    /* CTA */
    .pdn-cta-wrap {
      text-align: center;
      margin-top: 36px;
      padding: 28px 20px;
      background: #1A1A1A;
      border-radius: 12px;
      color: #FAF9F6;
    }
    .pdn-cta-wrap p {
      font-size: 13px;
      color: rgba(250, 249, 246, 0.7);
      margin: 0 0 16px;
    }
    .pdn-cta {
      display: inline-flex; align-items: center; gap: 10px;
      padding: 14px 28px;
      background: #25D366;
      color: #fff;
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.16em; text-transform: uppercase;
      text-decoration: none;
      border: none; cursor: pointer;
      border-radius: 9999px;
      box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
      transition: all 0.2s;
    }
    .pdn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37, 211, 102, 0.5); }
    .pdn-cta i { font-size: 18px; }
    .pdn-cta-meta {
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      font-size: 10px; letter-spacing: 0.32em; text-transform: uppercase;
      color: rgba(250, 249, 246, 0.5);
    }
  `;

  const triggerHTML = `<button type="button" class="pdn-trigger" id="pdnOpen" aria-label="Buka panduan"><i class="fas fa-book-open"></i> Panduan</button>`;
  const closeHTML = `<button type="button" class="pdn-close" id="pdnClose" aria-label="Tutup">&times;</button>`;

  function buildModal() {
    let body = '';

    // Header with icon
    const headerIcon = tpl ? 'fa-wand-magic-sparkles' : 'fa-book-open';
    body += `
      <div class="pdn-header">
        <div class="pdn-header-icon"><i class="fas ${headerIcon}"></i></div>
        <div class="pdn-header-text">
          <span class="pdn-eyebrow">${P.edition}</span>
          <h1>${tpl ? `Panduan: ${tpl.name}` : 'Panduan Penggunaan'}</h1>
          <p>${P.intro}</p>
        </div>
      </div>
    `;

    // TOC pills
    body += `<div class="pdn-toc">`;
    P.sections.forEach((s, i) => {
      body += `<a class="pdn-toc-pill" href="#pdn-s-${s.id}">
        <span class="pdn-toc-num" style="background:${s.color};">${i + 1}</span>
        <i class="fas ${s.icon}" style="color:${s.color};"></i>
        <span>${s.label}</span>
      </a>`;
    });
    body += `</div>`;

    // Per-template overview
    if (tpl) {
      const paletteHTML = (tpl.palette || []).map(c =>
        `<span class="pdn-palette-swatch" style="background:${c};" title="${c}"></span>`
      ).join('');
      const highlightHTML = (tpl.highlights || []).map(h =>
        `<li><i class="fas fa-check-circle"></i>${h}</li>`
      ).join('');
      body += `
        <div class="pdn-tpl-card" id="pdn-s-templates">
          <div class="pdn-tpl-head">
            <span class="pdn-tag">${tpl.tag}</span>
            <h3>${tpl.name}</h3>
          </div>
          <div class="pdn-palette">
            ${paletteHTML}
            <span>${(tpl.palette || []).length} warna utama</span>
          </div>
          <div class="pdn-meta">${tpl.typography}</div>
          <p><strong>Cocok untuk:</strong> ${tpl.forWho}</p>
          <ul>${highlightHTML}</ul>
        </div>
      `;
    }

    // Quick start (only on index)
    if (isIndex) {
      body += `
        <h2 class="pdn-h2" id="pdn-s-quickstart">
          <span class="pdn-h2-num" style="background:#C5A880;">1</span>
          <i class="fas fa-rocket"></i>Cara Order & Generate Link Tamu
        </h2>
        <ol class="pdn-steps">
          ${P.howToOrder.map(s => `<li class="pdn-step">
            <div class="pdn-step-icon"><i class="fas ${s.icon}"></i></div>
            <div class="pdn-step-text">${s.text}</div>
          </li>`).join('')}
        </ol>

        <h2 class="pdn-h2" id="pdn-s-prep">
          <span class="pdn-h2-num" style="background:#4D96FF;">2</span>
          <i class="fas fa-clipboard-list"></i>${P.tipsTitle}
        </h2>
        <ul class="pdn-tips">
          ${P.tips.map(t => `<li class="pdn-tip">
            <i class="fas ${t.icon}"></i>
            <span>${t.text}</span>
          </li>`).join('')}
        </ul>

        <h2 class="pdn-h2" id="pdn-s-test">
          <span class="pdn-h2-num" style="background:#6BCB77;">3</span>
          <i class="fas fa-vial"></i>Cara Test Website (5 Mode URL)
        </h2>
        <div class="pdn-test-grid">
          ${P.testModes.map(t => `<div class="pdn-test">
            <div class="pdn-test-badge" style="background:${t.badgeColor}; color:#fff;">${t.badge}</div>
            <div class="pdn-test-body">
              <strong>${t.label}</strong>
              <code>${t.url}</code>
              <p>${t.desc}</p>
            </div>
          </div>`).join('')}
        </div>
      `;
    }

    // Security section
    body += `
      <h2 class="pdn-h2" id="pdn-s-security">
        <span class="pdn-h2-num" style="background:#4CAF50;">${isIndex ? '4' : '1'}</span>
        <i class="fas fa-shield-halved"></i>Keamanan Anti-Bypass
      </h2>
      <div class="pdn-security">
        ${P.security.map(s => `<div class="pdn-sec-item">
          <div class="pdn-sec-icon"><i class="fas ${s.icon}"></i></div>
          <div>
            <strong>${s.label}</strong>
            <span>${s.desc}</span>
          </div>
        </div>`).join('')}
      </div>
    `;

    // Features
    body += `
      <h2 class="pdn-h2" id="pdn-s-features">
        <span class="pdn-h2-num" style="background:#FF3D7F;">${isIndex ? '5' : '2'}</span>
        <i class="fas fa-list-check"></i>${tpl ? 'Fitur ' + tpl.name : 'Fitur Universal'}
      </h2>
      <div class="pdn-grid">
        ${P.features.map(f => `<div class="pdn-feat">
          <div class="pdn-feat-icon"><i class="fas ${f.icon}"></i></div>
          <div class="pdn-feat-text">
            <strong>${f.title}</strong>
            <span>${f.desc}</span>
          </div>
        </div>`).join('')}
      </div>
    `;

    // All templates (only on index)
    if (isIndex) {
      body += `
        <h2 class="pdn-h2" id="pdn-s-templates">
          <span class="pdn-h2-num" style="background:#FFD93D;">6</span>
          <i class="fas fa-palette"></i>Semua Template
        </h2>
        ${Object.values(P.templates).map(t => {
          const paletteHTML = (t.palette || []).map(c =>
            `<span class="pdn-palette-swatch" style="background:${c};" title="${c}"></span>`
          ).join('');
          return `<div class="pdn-tpl-card">
            <div class="pdn-tpl-head">
              <span class="pdn-tag">${t.tag}</span>
              <h3>${t.name}</h3>
            </div>
            <div class="pdn-palette">${paletteHTML}</div>
            <p>${t.forWho}</p>
          </div>`;
        }).join('')}
      `;
    }

    // CTA footer
    const waText = encodeURIComponent(`Halo ${P.contactName}, saya ingin order template undangan dan butuh informasi lengkap.`);
    body += `
      <div class="pdn-cta-wrap">
        <p><i class="fab fa-whatsapp" style="color:#25D366; margin-right:6px;"></i>Ada pertanyaan atau mau order sekarang?</p>
        <a class="pdn-cta" href="https://wa.me/${P.whatsapp}?text=${waText}" target="_blank" rel="noopener">
          <i class="fab fa-whatsapp"></i> Hubungi Admin
        </a>
        <div class="pdn-cta-meta">${P.brand} &middot; ${P.edition} &middot; 9 template siap pakai</div>
      </div>
    `;

    return `
      <div class="pdn-modal" id="pdnModal" role="dialog" aria-modal="true" aria-labelledby="pdnTitle">
        <div class="pdn-card">
          ${closeHTML}
          <div class="pdn-inner" id="pdnTitle">
            ${body}
          </div>
        </div>
      </div>
    `;
  }

  // Inject CSS once
  if (!document.getElementById('pdnModalStyle')) {
    const s = document.createElement('style');
    s.id = 'pdnModalStyle';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // Inject modal HTML at end of body
  const wrap = document.createElement('div');
  wrap.innerHTML = buildModal();
  const modal = wrap.firstElementChild;
  document.body.appendChild(modal);

  // Inject trigger button — find a sensible place
  function injectTrigger() {
    if (document.getElementById('pdnOpen')) return;
    // Try common targets in priority order
    const targets = [
      document.querySelector('.hdr'),
      document.querySelector('header'),
      document.querySelector('.app-container')
    ];
    let host = null;
    let placement = 'append';
    for (const t of targets) {
      if (t) { host = t; break; }
    }
    if (!host) {
      host = document.body;
      placement = 'prepend';
    }
    const btn = document.createElement('div');
    btn.innerHTML = triggerHTML;
    const btnEl = btn.firstElementChild;
    btnEl.style.cssText = 'position:fixed; bottom: 24px; left: 24px; z-index: 99999;';
    document.body.appendChild(btn);
  }
  injectTrigger();

  function open() { modal.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
  function close() { modal.classList.remove('is-open'); document.body.style.overflow = ''; }

  document.getElementById('pdnOpen').addEventListener('click', open);
  document.getElementById('pdnClose').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    // Also support keyboard shortcut: ? key when not typing in input
    if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target.tagName || ''))) {
      e.preventDefault();
      modal.classList.contains('is-open') ? close() : open();
    }
  });

  // Auto-open if URL has ?panduan=open
  if (new URLSearchParams(location.search).get('panduan') === 'open') {
    setTimeout(open, 300);
  }
})();
