# VITTORIO Wedding Organizer — Progres & To-Do

> File rangkuman untuk melanjutkan session berikutnya. Update file ini di akhir setiap session agar konteks tidak hilang.

---

## 🎯 Visi Proyek

**VITTORIO Wedding Organizer** — platform undangan digital, **9 template**:
Classic White, Tropical, Chinese Christian, Editorial, Ethereal, Intimate, VIP, Marigold, Memphis Pop.

Saat ini **prototype static (HTML/CSS/JS only)**. Nanti jadi **full CMS** dengan:
- Admin dashboard (CRUD tamu, edit template, monitoring RSVP)
- Venue check-in operator (scan QR, validasi, audit log)
- Real-time RSVP dashboard
- Multi-device state sync
- Voice note persisted ke storage

---

## ✅ Yang Sudah Selesai (Last Session)

### 1. Guest-Guard (Token Validation)
- **Opt-in default = OPEN** (no gate by default, perfect untuk preview/demo)
- **Production mode = opt-in** via `GUEST_CONFIG.production = true` di `guest-list.js`
- Tanpa token + production=true → tampil **gate "Akses Ditolak"** dengan link WhatsApp admin
- Token validation cek `window.GUEST_LIST[token]`
- File: `invitation/guest-guard.js` (110 lines, clean FA CDN approach)

### 2. My-Ticket State (Post-RSVP)
- Setelah RSVP submit, RSVP section berganti jadi "Tiket Anda"
- Anti multi-submit per device (localStorage)
- Auto-saved state
- File: `invitation/my-ticket.js`

### 3. Icons
- **FA CDN**: `cdnjs.cloudflare.com/.../font-awesome/6.5.1/css/all.min.css`
- HTML uses `<i class="fas fa-X">` standard
- 0 console errors
- File: `invitation/guest-guard.js` (`ensureFontAwesome()` function auto-injects CDN)

### 4. PANDUAN Documentation (Updated)
- **invitation/PANDUAN.md** + **invitation/PANDUAN.html** + **invitation/panduan-data.js** (modal source)
- Updated dari "offline-first / self-contained / zero backend" ke "**prototype**"
- Tambah section **ROADMAP KE VERSI CMS** di PANDUAN.html
- Tambah **Operator Page (Venue Check-in)** di roadmap
- Tambah benefit list (multi-device state, voice note persisted, real-time counter, audit trail)
- Footer updated: "9 template · Prototype HTML/CSS/JS · CMS coming soon"

### 5. Test & Artifacts Cleanup
- Deleted semua `test-*.js` di `invitation/`
- Deleted semua `*.png` screenshot di root & `invitation/`
- Folder clean, hanya file production

---

## 📁 Struktur File Saat Ini

```
C:\laragon\www\christianelka.github.io\
├── invitation\
│   ├── index.html                    # Template selector (welcome page)
│   ├── PANDUAN.md                    # Markdown guide
│   ├── PANDUAN.html                  # HTML guide (mirrors .md)
│   ├── panduan-data.js               # Modal content data source
│   ├── panduan-modal.js              # Modal builder + injector
│   ├── guest-list.js                 # Guest registry + GUEST_CONFIG
│   ├── guest-guard.js                # Token validation + FA CDN loader
│   ├── my-ticket.js                  # Post-RSVP ticket state
│   ├── generate-tokens.html          # Admin tool untuk generate tokens
│   ├── undangan_classic-white.html   # 9 template files
│   ├── undangan_tropical.html
│   ├── undangan_chinese-christian.html
│   ├── undangan_editorial.html
│   ├── undangan_ethereal.html
│   ├── undangan_intimate.html
│   ├── undangan_vip.html
│   ├── undangan_marigold.html
│   └── undangan_memphis-pop.html
└── (root files: README, _config.yml, PROGRESS.md, dll.)
```

---

## 🔑 Konsep Kunci

### Production Toggle
`guest-list.js` punya:
```js
window.GUEST_CONFIG = {
  production: true  // ubah dari false ke true untuk aktifkan gate
};
```
- `false` (default) → open mode, semua bisa akses, banner "Tamu Tester" muncul
- `true` → strict mode, token required, gate untuk yang tidak punya

### Test URL Patterns
- `?preview=1` → masuk sebagai "Tamu Tester"
- `?preview=Nama` → preview dengan nama custom
- `?token=g1h2i3j4k5l6m7n8` → real guest (Galih Pratama)
- Tanpa token + `production=true` → gate "Akses Ditolak"

### Icon System
- FA CDN loaded by `guest-guard.js` (only if not already present)
- HTML uses `<i class="fas fa-X">` standard
- 39 icon classes supported: `fa-lock`, `fa-whatsapp`, `fa-qrcode`, `fa-rocket`, `fa-clipboard-list`, `fa-shield-halved`, `fa-list-check`, `fa-palette`, `fa-wand-magic-sparkles`, `fa-vial`, `fa-user`, `fa-calendar-check`, `fa-map-marker-alt`, `fa-credit-card`, `fa-camera`, `fa-music`, `fa-quote-right`, `fa-users`, `fa-keyboard`, `fa-link`, `fa-eye`, `fa-hourglass-half`, `fa-images`, `fa-pen-to-square`, `fa-microphone`, `fa-gift`, `fa-ticket`, `fa-mobile-screen`, `fa-universal-access`, `fa-bolt`, `fa-key`, `fa-fingerprint`, `fa-database`, `fa-shield-virus`, `fa-user-shield`, `fa-flask`, `fa-pen`, `fa-times`, `fa-check-circle`, `fa-book-open`, `fa-ticket-alt`

---

## 🗺️ Roadmap CMS (Future)

### Phase 1: Backend Foundation
- **Node.js / Next.js API** untuk token validation, RSVP persistence
- **PostgreSQL** (Supabase / Neon) simpan: guest list, RSVP, voice note metadata
- **S3 / Cloudflare R2** untuk: voice note files, foto prewedding
- **Auth** (Lucia/Auth.js/Supabase Auth) untuk admin + operator

### Phase 2: Admin Dashboard
- CRUD tamu (tambah, edit, hapus, bulk import)
- Edit template config (preview live)
- Monitoring RSVP real-time
- Export data (CSV/Excel)
- Blast link via WA per tamu
- Voice note viewer

### Phase 3: Operator Page (Venue Check-in)
- Login sebagai operator
- Scanner QR via camera (webcam/HP)
- Validasi token + tampil data tamu
- Tombol "Check-in" → update DB `status = 'hadir'`
- Real-time counter (47/200 hadir)
- Audit log (operator X scan tamu Y jam Z)
- Anti-duplicate (warning kalau sudah scan)
- Anti-forgery (warning kalau token invalid)

### Phase 4: Public Site Migration
- Server-render undangan dari template config
- Dynamic values per tamu
- `?token=X` → API validation → render
- SEO optimization
- WebSocket untuk real-time updates

### Phase 5: Additional Features
- Email/WhatsApp notification saat RSVP masuk (webhook)
- Multi-device RSVP state sync
- Voice note playback dari server (bukan localStorage)
- Analytics dashboard

---

## ❓ To-Do / Pertanyaan Belum Terjawab

### Immediate (belum selesai di session terakhir)
1. **Verify WhatsApp icon rendering** — User bilang icon "Order" WhatsApp di panduan error. Sudah buka modal di browser tapi belum konfirmasi visual. **Action item**: buka modal, scroll ke "Cara Order", verify `fa-whatsapp` icon visible. **Status: unverified, kemungkinan OK karena FA CDN standard**.

2. **Verify All 9 Templates** — Manual check 9 template files untuk pastikan tidak ada broken icon atau JS error. **Status: not done in last session**.

3. **HTML Linter Cleanup** — Ada beberapa console.log statements di file JS yang mungkin bisa dibersihkan.

### Future Considerations
1. **Templating System** — 9 template = 9 file HTML terpisah. Nanti di CMS, bisa jadi 1 template engine + config JSON. Atau tetap static + dynamic injection.

2. **Form Action Endpoint** — RSVP form submit handler perlu diubah dari localStorage ke API call (saat migrasi ke CMS).

3. **QR Generation Library** — Saat ini pakai inline JS untuk QR. Nanti bisa pakai `qrcode` npm package di backend.

4. **Voice Note Storage** — Saat ini audio blob di localStorage. Nanti upload ke S3/R2.

5. **Admin Training Docs** — PANDUAN untuk admin (bukan tamu) perlu dibuat terpisah.

---

## 💡 Catatan Penting untuk Session Selanjutnya

1. **Production toggle** masih `false` (default). Untuk demo ke client, set `true` di `guest-list.js` SEBELUM blast link.

2. **Token generation** masih manual via `invitation/generate-tokens.html` (admin tool). Nanti di-CMS-kan.

3. **Guest list sample** di `guest-list.js` cuma ada beberapa nama. Untuk real wedding, admin harus edit file ini (atau nanti di CMS dashboard).

4. **Panduan modal** pakai `fa-whatsapp` icon di section "Cara Order". Icon ini di FA CDN standard, harusnya work. Kalau user bilang error, mungkin FA CDN gagal load (offline?), icon tertutup CSS lain, atau visual issue yang perlu screenshot.

5. **Tidak ada backend saat ini** — semua client-side. Prototype cocok untuk wedding < 100 tamu. Untuk 200+ tamu, butuh CMS.

6. **Bahasa komunikasi**: User pakai bahasa Indonesia campur English (code/tech terms). Style: santai, to-the-point, no formal preamble.

7. **Laptop di-shutdown** — session ditutup, semua progress tersimpan di file. Buka sesi baru dan bilang "lanjut dari PROGRESS.md" untuk resume.

---

## 🚀 Quick Start untuk Lanjut Session

```bash
# Lihat file structure
dir "C:\laragon\www\christianelka.github.io\invitation"

# Test manual
# Start server: python -m http.server 8765
# Open: http://localhost:8765/invitation/index.html

# Production toggle
# Edit: C:\laragon\www\christianelka.github.io\invitation\guest-list.js
# Set: window.GUEST_CONFIG = { production: true };
```

---

## 📌 Prioritas untuk Session Berikutnya (jika ada)

1. Apakah WhatsApp icon di modal benar-benar error? (Butuh screenshot konfirmasi)
2. Apakah ada template tertentu yang perlu diperbaiki?
3. Apakah ada section PANDUAN yang masih outdated?
4. Apakah perlu setup backend/CMS sekarang atau lanjut prototype dulu?

---

## 📝 Log Session

### Session 1 (latest)
- Update PANDUAN.md/html + panduan-data.js dari "offline-first" ke "prototype" terminology
- Tambah section ROADMAP CMS di PANDUAN.html dengan admin + operator roles
- Cleanup test files & screenshots
- Confirm FA CDN approach works (0 console errors)
- User decide: lanjut ke CMS atau refine prototype dulu

### Earlier sessions
- Reverted from inline-SVG approach back to FA CDN (user requested simplicity)
- Replaced broken `ICON_PATHS` lookup table with standard `<i class="fas fa-X">`
- Added `ensureFontAwesome()` to auto-inject CDN link
- Removed MutationObserver, `vtUpgradeFAIcons`, ICON_PATHS table
- Added production toggle via `GUEST_CONFIG.production`
- Updated PANDUAN to explain opt-in model

---

*Laptop aman untuk shutdown. Progress file ada di `C:\laragon\www\christianelka.github.io\PROGRESS.md`. Buka sesi baru dan bilang "lanjut dari PROGRESS.md" untuk resume.*
