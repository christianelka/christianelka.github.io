// my-ticket.js — Drop-in post-RSVP "Tiket Anda" state for all 9 templates.
//
// Behavior:
//   1. On page load, checks localStorage flag (per-template key).
//      If true, replaces the RSVP form with a "Tiket Anda" state.
//   2. Captures the next form submit, reads the name field, persists to
//      localStorage, and swaps the form for the my-ticket card.
//   3. Provides window.__myTicket.show(name) so templates can call it
//      explicitly from their own submit handler if they prefer.
//
// Usage: include this script before the closing </body> tag.
// No HTML attribute required — the script auto-discovers the RSVP form.

(function () {
  const form = document.querySelector('[data-myticket-key], form.rsvp-form, form#rsvpForm, form[id*="RSVP" i], #rsvpForm, #rsvpFormArea, #rsvpBox, .rsvp-form, .rsvp__form, [class*="rsvp-form"]');
  const target = form || document.querySelector('form');

  if (!target) return;

  const fileKey = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '');
  const STORAGE_KEY = 'wedding_rsvp_submitted_' + fileKey;
  const NAME_KEY = STORAGE_KEY + '_name';

  // Build the my-ticket display
  function buildTicket() {
    const name = (localStorage.getItem(NAME_KEY) || 'Tamu').trim() || 'Tamu';
    return `
      <div class="mt-wrap" data-myticket-display>
        <div class="mt-card">
          <div class="mt-icon"><i class="fas fa-ticket-alt"></i></div>
          <div class="mt-eyebrow">Konfirmasi Diterima</div>
          <h2 class="mt-title">Tiket Anda</h2>
          <p class="mt-guest">${escapeHtml(name)}</p>
          <p class="mt-sub">Tunjukkan QR ini di pintu masuk venue. Simpan tiket sebagai PNG dari menu sebelumnya atau buka ulang kapan saja.</p>
          <div class="mt-actions">
            <button type="button" class="mt-btn mt-btn--primary" data-mt-action="qr">
              <i class="fas fa-qrcode"></i> Lihat QR Code
            </button>
            <button type="button" class="mt-btn mt-btn--ghost" data-mt-action="edit">
              <i class="fas fa-pen"></i> Ubah Konfirmasi
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function injectCSS() {
    if (document.getElementById('myTicketCSS')) return;
    const s = document.createElement('style');
    s.id = 'myTicketCSS';
    s.textContent = `
      .mt-wrap {
        display: flex; align-items: center; justify-content: center;
        padding: 24px 12px;
        animation: mtIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes mtIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      .mt-card {
        text-align: center;
        max-width: 420px;
        padding: 32px 24px;
        background: #fff;
        border: 2px solid #1A1A1A;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
        position: relative;
        width: 100%;
      }
      .mt-card::before {
        content: '';
        position: absolute;
        top: -2px; left: -2px; right: -2px;
        height: 6px;
        background: linear-gradient(90deg, #C5A880, #FF3D7F, #4D96FF, #6BCB77, #C5A880);
        border-radius: 10px 10px 0 0;
      }
      .mt-icon {
        width: 72px; height: 72px;
        margin: 8px auto 16px;
        background: #1A1A1A;
        color: #C5A880;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 30px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }
      .mt-eyebrow {
        display: inline-block;
        padding: 4px 12px;
        background: #4CAF50;
        color: #fff;
        font-size: 10px; font-weight: 600;
        letter-spacing: 0.3em; text-transform: uppercase;
        border-radius: 9999px;
        margin-bottom: 12px;
      }
      .mt-title {
        font-size: 24px; font-weight: 600;
        color: #1A1A1A;
        margin: 0 0 6px;
      }
      .mt-guest {
        font-size: 18px; font-weight: 500;
        color: #1A1A1A;
        margin: 0 0 16px;
        font-style: italic;
      }
      .mt-sub {
        font-size: 12.5px; line-height: 1.6;
        color: #5A5A5A;
        margin: 0 0 20px;
      }
      .mt-actions {
        display: flex; flex-direction: column; gap: 10px;
      }
      .mt-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        padding: 12px 20px;
        font-size: 12px; font-weight: 600;
        letter-spacing: 0.16em; text-transform: uppercase;
        border: 2px solid #1A1A1A;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      .mt-btn--primary {
        background: #1A1A1A; color: #FAF9F6;
      }
      .mt-btn--primary:hover { background: #C5A880; color: #1A1A1A; }
      .mt-btn--ghost {
        background: transparent; color: #1A1A1A;
      }
      .mt-btn--ghost:hover { background: #1A1A1A; color: #FAF9F6; }
      .mt-btn i { font-size: 13px; }
    `;
    document.head.appendChild(s);
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function show() {
    if (!target) return;
    if (target.tagName === 'FORM') {
      target.style.display = 'none';
    } else {
      target.style.display = 'none';
    }
    document.querySelectorAll('[data-myticket-display]').forEach(el => el.remove());
    const wrap = document.createElement('div');
    wrap.innerHTML = buildTicket();
    const ticket = wrap.firstElementChild;
    target.parentNode.insertBefore(ticket, target.nextSibling);
    ticket.querySelector('[data-mt-action="qr"]').addEventListener('click', () => {
      const name = (localStorage.getItem(NAME_KEY) || '').trim();
      if (typeof window.openQRModal === 'function') {
        window.openQRModal(name);
      } else {
        alert('QR Code:\n\nSilakan buka menu QR di halaman ini untuk menampilkan tiket Anda.\n\nNama: ' + name);
      }
    });
    ticket.querySelector('[data-mt-action="edit"]').addEventListener('click', () => {
      if (confirm('Ubah konfirmasi kehadiran? Data RSVP yang tersimpan akan dihapus dan form akan muncul kembali.')) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(NAME_KEY);
        location.reload();
      }
    });
    setTimeout(() => ticket.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }

  window.__myTicket = {
    show: function (name) {
      if (name) localStorage.setItem(NAME_KEY, name);
      localStorage.setItem(STORAGE_KEY, 'true');
      show();
    },
    key: STORAGE_KEY
  };

  injectCSS();
  if (localStorage.getItem(STORAGE_KEY) === 'true') {
    show();
  }

  document.addEventListener('submit', function (e) {
    if (!target) return;
    if (e.target !== target && !target.contains(e.target)) return;
    setTimeout(function () {
      var nameInput = target.querySelector('input[name*="nama" i], input[name="name"], input[id*="name" i]');
      var name = nameInput ? nameInput.value.trim() : '';
      if (!name) return;
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(NAME_KEY, name);
      show();
    }, 50);
  }, true);
})();
