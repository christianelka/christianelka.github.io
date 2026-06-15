# 📖 PANDUAN PENGGUNAAN — VITTORIO WEDDING ORGANIZER

Selamat datang di panduan singkat untuk calon client dan operator yang akan menggunakan salah satu template undangan digital kami.

> **Versi:** Edition I &middot; 2026
> **WA Admin:** 0813-5188-0960
> **Status:** 9 template siap pakai

---

## 🚀 CARA ORDER (untuk Client)

### Step 1: Pilih Template
Buka halaman utama → scroll ke grid → klik "Buka" untuk preview, atau klik **Order** untuk langsung chat WhatsApp admin.

### Step 2: Siapkan Materi
Sebelum kontak admin, pastikan Anda sudah punya:

- [ ] Nama lengkap pengantin pria & wanita
- [ ] Tanggal + jam akad nikah
- [ ] Tanggal + jam resepsi
- [ ] Alamat venue (untuk tautan Google Maps)
- [ ] Rekening bank / e-wallet untuk amplop digital (1-2 nomor)
- [ ] 6-8 foto prewedding (minimal 4, akan ditata sesuai template)
- [ ] Pilihan 2-3 musik latar (atau pilih default kami)
- [ ] Ucapan terima kasih / quote pilihan
- [ ] Daftar tamu + jumlah per tamu (untuk generate link unik)

### Step 3: Generate Link per Tamu
Setiap tamu mendapat link unik berisi namanya. Admin yang generate (bukan client). Format:
```
https://vittorioweddingsolo.com/invitation/undangan_X.html?to=Nama+Tamu&token=ABC123
```
### Step 4: Test

Sebelum blast ke tamu:

#### 🧪 CARA TESTER/PROD AKSES WEBSITE (Tanpa Token)

Website ini **default-nya terbuka untuk semua** (mode preview/demo) — perfect untuk presentasi dan testing. Token validation hanya aktif jika admin mengaktifkan mode production. Untuk testing/preview, gunakan salah satu cara:

**Cara cepat (Recommended):** Tambahkan `?preview=1` ke URL
```
http://localhost/invitation/undangan_marigold.html?preview=1
http://localhost/invitation/undangan_marigold.html?preview=Andi+Saputra
http://localhost/invitation/undangan_marigold.html?dev=1
```
- `?preview=1` → masuk sebagai "Tamu Tester"
- `?preview=Andi+Saputra` → masuk sebagai "Andi Saputra" (custom display name)
- `?dev=1` atau `?admin=1` → masuk sebagai "Developer"
- Banner kuning muncul: "MODE PREVIEW — Data RSVP tidak dihitung sebagai tamu resmi"

**Cara panjang (test whitelist asli):** Pakai token yang ada di `guest-list.js`
```
http://localhost/invitation/undangan_marigold.html?to=Andi+Saputra&token=sh1a2n3d4i5s6a7p
```
(Ini simulasi tamu resmi "Andi Saputra" — RSVP disimpan dengan nama ini)

**Production:** Untuk blast ke tamu sungguhan, **edit `guest-list.js` → set `production: true`** di konfigurasi atas file:
```js
window.GUEST_CONFIG = {
  production: true  // ← ubah dari false ke true
};
```
Setelah set `true`, barulah **blast link + token** ke tamu. Tanpa token valid, tamu akan melihat gate "Akses Ditolak".

---

#### ✅ Test Checklist

1. ☐ Buka link di **incognito/private window** (supaya localStorage bersih)
2. ☐ Cek cover → hero → countdown → gallery → RSVP
3. ☐ Test submit RSVP → download QR e-ticket
4. ☐ Test voice note (Chrome/Firefox/Safari)
5. ☐ Buka di mobile (Pixel 5 viewport)

---

## 🛡️ FITUR KEAMANAN (Anti-Bypass)

### ✅ URL dengan Token
Setiap link undangan mengandung **token** yang terdaftar di `guest-list.js`. Tanpa token yang valid, halaman menampilkan pesan "Tidak Terdaftar" dan memblokir semua form.

| Aksi tanpa token | Hasil |
|---|---|
| Buka link tanpa `?token=` | ❌ Akses ditolak |
| Isi nama sendiri di URL | ❌ Tidak ada efek (token wajib) |
| Random token guessing | ❌ Token 16-char hex (collision-resistant) |
| Edit localStorage `rsvp_submitted` | ❌ Tidak berguna (venue scan QR, bukan cek localStorage) |

### ✅ QR E-Ticket Anti-Palsu
QR yang di-generate oleh sistem mengandung **token** tamu, bukan cuma nama. Venue bisa scan dan cross-check ke `guest-list.js` yang sama dengan yang admin pakai untuk distribute link. Tamu yang print QR sendiri dengan token random akan gagal verifikasi.

### ✅ Data Tamu di Server
Daftar tamu lengkap (`guest-list.js`) ada di server. Tamu hanya menerima URL dengan token mereka. Tamu tidak punya akses ke daftar lengkap.

### ✅ RSVP Lokal (Prototype)
- RSVP + voice note flag disimpan di **localStorage** device tamu
- Saat ini **prototype** masih static (HTML/CSS/JS only) — tanpa backend, tanpa database
- Setelah submit, RSVP section berubah jadi **"Tiket Anda"** (tidak bisa submit ulang)
- Nanti (versi CMS): RSVP akan disinkronkan ke server sehingga admin bisa pantau real-time dari dashboard admin

---

## 📋 FITUR YANG TERSEDIA DI SEMUA 9 TEMPLATE

| # | Fitur | Cara Pakai |
|---|---|---|
| 1 | **Countdown otomatis** | Otomatis hitung mundur ke tanggal pernikahan |
| 2 | **Hero + names + date** | Ditampilkan setelah cover dibuka |
| 3 | **Couple section** | Lihat biodata pengantin pria & wanita |
| 4 | **Story / Timeline** | Kisah cinta (hanya di Intimate + Memphis Pop + Editorial) |
| 5 | **Events** | Detail akad + resepsi + tanggal + jam + venue |
| 6 | **Gallery + Lightbox** | Klik foto → buka lightbox → panah kiri/kanan untuk navigate → Esc untuk tutup |
| 7 | **RSVP Form** | Isi nama + hadir/tidak + jumlah (maks 2) + pesan |
| 8 | **Voice Note (max 2 menit)** | Klik mic → mulai merekam. Auto-stop di 2 menit. Browser minta izin mikrofon. |
| 9 | **QR E-Ticket** | Otomatis muncul setelah RSVP sukses. Klik "Simpan Tiket" untuk download PNG. |
| 10 | **Amplop / Gift** | Klik kartu bank → nomor rekening disalin ke clipboard |
| 11 | **Musik Latar** | Tombol play/pause di pojok kanan bawah |
| 12 | **Personal URL per Tamu** | `?token=XXX` + `?to=Nama` di URL, nama tampil di cover & tiket |
| 13 | **My-Ticket State** | Setelah submit, RSVP section berganti jadi tampilan tiket (anti multi-submit) |
| 14 | **Reduced Motion** | Animasi disable otomatis untuk user yang setting-nya `prefers-reduced-motion` |
| 15 | **Keyboard A11y** | Tab navigasi, Esc tutup modal, ← → di lightbox |
| 16 | **Mobile-First** | Tested di 320-480px viewport, tombol cukup besar untuk jempol |
| 17 | **Prototype Static** | Saat ini 9 template adalah prototype HTML/CSS/JS — deploy ke mana saja tanpa setup server |
| 18 | **Privacy First** | localStorage only, no tracking, no analytics, no cookies |

---

## 🎨 9 TEMPLATE — Panduan Memilih

### 1. **Classic White** — `classic-white.html`
- **Cocok untuk:** Pasangan muda urban, kesan elegan & modern
- **Palette:** Cream + Navy + Gold
- **Font:** Cinzel + Cormorant Garamond + Great Vibes
- **Highlights:** Asymmetric editorial layout, voice note, QR, lightbox

### 2. **Tropical Modern** — `undangan_tropical.html`
- **Cocok untuk:** Wedding garden / villa Bali / outdoor
- **Palette:** Warm cream + forest green + sage
- **Font:** Playfair + Cormorant + Inter
- **Highlights:** Botanical SVG, snapshot download (html2canvas)

### 3. **Chinese Christian** — `undangan_chinese_christian.html`
- **Cocok untuk:** Pernikahan blended Tionghoa-Kristen
- **Palette:** Burgundy + Gold + Cream
- **Font:** Cinzel + Cormorant + Raleway
- **Highlights:** 4-slide cover carousel, Double Happiness 囍, Tea Pai ceremony, 3 events

### 4. **Editorial Art** — `undangan_editorial.html`
- **Cocok untuk:** Pasangan yang suka magazine / jurnalisme / desain
- **Palette:** Off-white + charcoal + tobacco
- **Font:** Fraunces + Inter + JetBrains Mono
- **Highlights:** "Volume One" issue markers, masthead-style countdown, story narrative

### 5. **Ethereal Glass** — `undangan_ethereal.html`
- **Cocok untuk:** Villa Bali, garden estate, sunset ceremony
- **Palette:** Warm cream + gold + blush
- **Font:** Fraunces (italic) + Inter
- **Highlights:** M3 glassmorphism, WebGL shader, monogram cover

### 6. **Intimate Silhouette** — `undangan_intimate.html`
- **Cocok untuk:** Wedding kecil (< 50 tamu), villa intimate dinner
- **Palette:** Paper-grain cream + deep sage
- **Font:** Fraunces (italic) + Inter + JetBrains Mono
- **Highlights:** Single-column mobile, paper grain, dress code, scroll progress

### 7. **VVIP Smart Digital** — `undangan_digital_vvip.html`
- **Cocok untuk:** Klien premium / VVIP / artis / eksekutif
- **Palette:** Obsidian + gold + alabaster
- **Font:** Cormorant Garamond + Cinzel + Inter
- **Highlights:** SVG film grain, gold-dust particles, boarding-pass ticket

### 8. **Marigold Mandala** — `undangan_marigold.html`
- **Cocok untuk:** Pernikahan adat Jawa / Jawa-Modern
- **Palette:** Marigold + maroon + parchment
- **Font:** Tangerine + Marcellus + Raleway
- **Highlights:** CSS kawung borders, wayang-gunungan, lotus monogram, salam ꦲꦺꦴꦩ꧀ꦱꦶꦪꦶꦠꦶꦁꦄꦭ꧀ꦭꦲꦶꦃ

### 9. **Memphis Pop** — `undangan_memphis_pop.html`
- **Cocok untuk:** Pasangan muda fun, anti-mainstream
- **Palette:** Hot pink + acid yellow + lime + electric blue
- **Font:** Archivo Black + Bungee + Caveat
- **Highlights:** Brutalist shadows, marquee ribbons, scattered confetti, confetti burst

---

## 🛠️ UNTUK OPERATOR / ADMIN

### File yang Perlu Anda Tahu

| File | Fungsi |
|---|---|
| `index.html` | Halaman utama — pilih template + generate link tamu |
| `undangan_*.html` | 9 template undangan |
| `guest-list.js` | **Daftar tamu + token** — EDIT INI untuk menambah/hapus tamu |
| `guest-guard.js` | Script validasi token — JANGAN EDIT kecuali perlu |
| `panduan-data.js` | Konten panduan (jangan edit kecuali tambah template baru) |
| `panduan-modal.js` | Komponen modal panduan |
| `generate-tokens.html` | Tools admin untuk generate token baru |
| `PANDUAN.md` | File ini — bisa dikirm via WA |

### Cara Tambah Tamu Baru

**Cara cepat (recommended):**
1. Buka `generate-tokens.html` di browser
2. Isi nama + pax + group
3. Klik "Generate" → dapat token 16-char + URL siap kirim
4. Copy entry ke `guest-list.js`:
   ```js
   "abc123def4567890": { name: "Andi Saputra", pax: 2, group: "Sahabat" },
   ```
5. Save `guest-list.js` → upload ke server

**Cara manual:**
```js
// Pake crypto.randomUUID() atau https://www.uuidgenerator.net/
"16-char-random": { name: "Nama Tamu", pax: 1, group: "Kategori" },
```

### Cara Generate URL Tamu

Format:
```
https://[domain]/invitation/[template].html?to=[Nama+Tamu]&token=[Token]
```

Contoh:
```
https://vittorioweddingsolo.com/invitation/undangan_marigold.html?to=Andi+Saputra&token=g1h2i3j4k5l6m7n8
```

Atau gunakan **generate-tokens.html** → copy link langsung.

### Test Sebelum Live

1. Buka link di **incognito/private window** (supaya localStorage bersih)
2. Cek cover terbuka → hero → countdown → gallery lightbox
3. Test submit RSVP → QR muncul → download
4. Test voice note (Chrome/Firefox/Safari)
5. Test di **mobile** (Chrome DevTools device emulator)

### Audit Keamanan (untuk Admin Serius)

File-file ini **sudah** mencakup:

- ✅ `localStorage` untuk RSVP state (prototype, no backend)
- ✅ RSVP form punya `escapeHtml` helper (anti-XSS via message)
- ✅ `<a target="_blank" rel="noopener noreferrer">` (anti-tab-hijack)
- ✅ `prefers-reduced-motion` support
- ✅ `aria-label` di semua icon-only button

**Sudah ada (prototype level):**
- ✅ Guest-guard block akses tanpa token (client-side whitelist di `guest-list.js`)
- ✅ Token 16-char hex (collision-resistant, unguessable)
- ✅ Voice note real `getUserMedia` + `MediaRecorder` (bukan fake)
- ✅ QR berisi token (anti-forgery)
- ✅ XSS protection (escapeHtml di message)

**Akan datang di versi CMS (server-side):**
- 🔄 Token validation server-side (saat ini hanya client-side)
- 🔄 Rate limiting (orang spam submit 100x)
- 🔄 CSRF token
- 🔄 Real-time RSVP dashboard untuk admin

### Maintenance

Jika ada pertanyaan teknis:
- WhatsApp: 0813-5188-0960
- Atau balas pesan order Anda di WhatsApp

---

## 🐛 KNOWN LIMITATIONS (Prototype)

Saat ini 9 template adalah **prototype statis** (HTML/CSS/JS only). Beberapa limitasi akan teratasi otomatis di versi **CMS full**:

1. **Token client-side** — karena prototype static, technically savvy user bisa inspect `guest-list.js` dan lihat semua token. **CMS version**: server-side token validation via API endpoint, token tidak di-expose ke client.
2. **Voice note tidak disimpan permanen** — saat ini hanya flag `hasVoice` di localStorage. Audio blob tidak di-upload. **CMS version**: voice note di-upload ke object storage (S3/Cloudflare R2) dan di-link dari DB.
3. **No email/WhatsApp notification** — admin tidak otomatis dapat notif saat ada RSVP. **CMS version**: webhook trigger → kirim WA via WhatsApp Business API saat RSVP masuk.
4. **My-Ticket state per-device** — kalau tamu buka di device A, submit, lalu buka di device B, device B tidak tahu dia sudah submit. **CMS version**: state disinkronkan via server (device-agnostic).

## 🚀 ROADMAP KE VERSI CMS

Versi prototype ini adalah pondasi sebelum migrasi ke full CMS. Arsitektur target:

- **Backend**: Node.js / Next.js API (token validation, RSVP persistence)
- **Database**: PostgreSQL (Supabase / Neon) — simpan guest list, RSVP, voice note metadata
- **Storage**: S3 / Cloudflare R2 — simpan voice note, foto prewedding
- **Admin UI**: dashboard terlindungi (auth + role) untuk CRUD tamu, edit template, monitoring RSVP real-time, export data
- **Public site**: server-rendered undangan dari template config, dynamic values per tamu

Benefit migrasi ke CMS:
- Admin tidak perlu edit `guest-list.js` manual
- RSVP terkumpul di server, bukan hilang saat device di-clear
- Token aman (tidak bocor ke client)
- Voice note tersimpan permanen dan bisa di-replay
- Multi-device RSVP state konsisten

Untuk sekarang, **prototype sudah cukup untuk wedding kecil-menengah (< 100 tamu)** dengan admin yang comfortable edit file static + blast link via WA.

---

*Edition I &middot; 2026 &middot; VITTORIO WEDDING ORGANIZER &middot; 9 template &middot; Prototype HTML/CSS/JS &middot; CMS coming soon*
