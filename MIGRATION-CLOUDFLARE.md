# Panduan Migrasi: GitHub Pages -> Cloudflare Pages

Dokumen ini panduan step-by-step untuk migrasi `christianelka.github.io/escalation-chatbot/` dari GitHub Pages (public) ke Cloudflare Pages (dengan repo private).

**Status sebelum migrasi:**
- Repo `christianelka.github.io` public di GitHub
- Auto-deploy ke `https://christianelka.github.io/escalation-chatbot/`
- Source code visible ke siapapun via `git clone`

**Status setelah migrasi:**
- Repo private di GitHub (source code tertutup)
- Deploy ke `https://escbot-XXX.pages.dev/` (URL dari Cloudflare)
- Source code hanya bisa diakses oleh kamu + collaborator yang diundang
- Tester akses tetap via URL public, tapi tidak bisa lihat source di GitHub

**Estimasi waktu:** 30-45 menit total

---

## Step 0: Backup data sebelum mulai

Sebelum apa-apa, backup dulu:

1. Buka https://christianelka.github.io/escalation-chatbot/
2. Login dengan sandi
3. Sidebar -> Pembelajaran -> Export (kalau ada koreksi)
4. Sidebar -> Riwayat Chat -> Export (kalau ada thread)
5. Simpan kedua file JSON di tempat aman

Kalau belum ada data, skip step ini.

---

## Step 1: Setup akun Cloudflare (5 menit)

1. Buka https://dash.cloudflare.com/sign-up
2. Daftar pakai email yang kamu mau
3. Verifikasi email
4. Masuk ke dashboard
5. Skip step "Add a website" - tidak perlu untuk Pages

---

## Step 2: Privatekan repo GitHub (2 menit)

**PENTING:** Step ini akan membuat `christianelka.github.io/escalation-chatbot/` (URL lama) **offline**. Pastikan tester sudah dapat URL baru sebelum lakukan ini, ATAU lakukan setelah Step 5 (deploy Cloudflare berhasil).

Saya saranin urutan: **Step 3-5 dulu (deploy Cloudflare)**, baru Step 2 di akhir.

Skip dulu, lanjut Step 3.

---

## Step 3: Connect GitHub ke Cloudflare Pages (10 menit)

1. Di Cloudflare Dashboard, klik **Workers & Pages** (sidebar kiri)
2. Klik tab **Pages**
3. Klik **Create a project** -> **Connect to Git**
4. Pilih **GitHub**, klik **Connect GitHub**
5. Authorize Cloudflare di GitHub:
   - Pilih **Only select repositories** (lebih aman dari "All repositories")
   - Pilih repo `christianelka.github.io`
   - Klik **Install & Authorize**
6. Kembali ke Cloudflare, repo `christianelka.github.io` sekarang muncul di list
7. Klik **Begin setup** di samping repo

---

## Step 4: Configure build settings (5 menit)

Di halaman setup project:

**Project name:** `escbot` (atau apa saja yang kamu mau, akan jadi subdomain `xxx.pages.dev`)

**Production branch:** `main` (atau `master`, sesuai branch utama kamu)

**Build settings:**
- **Framework preset:** None
- **Build command:** *(kosongkan, project ini static HTML)*
- **Build output directory:** `/` *(slash saja, root folder)*
- **Root directory (advanced):** *(biarkan default)*

**Environment variables:** Tidak perlu

Klik **Save and Deploy**

Tunggu 1-2 menit. Cloudflare akan clone repo dan deploy.

Setelah selesai, kamu akan dapat URL seperti:
- `https://escbot.pages.dev/escalation-chatbot/`
- atau `https://escbot-abc.pages.dev/escalation-chatbot/`

**Test URL ini di browser** - pastikan situs jalan, password gate muncul, semua fitur OK.

---

## Step 5: Privatekan repo GitHub (2 menit)

Setelah Cloudflare Pages confirmed jalan:

1. Buka https://github.com/christianelka/christianelka.github.io
2. Klik **Settings** (tab di repo)
3. Scroll paling bawah ke **Danger Zone**
4. Klik **Change visibility** -> **Make private**
5. Ketik nama repo untuk konfirmasi
6. Klik **I understand, change repository visibility**

**Yang terjadi:**
- Repo sekarang private, hanya kamu yang bisa lihat source
- `https://christianelka.github.io/escalation-chatbot/` (URL lama) **akan offline** dalam 5-30 menit
- Cloudflare Pages tetap jalan karena dia sudah punya akses via OAuth (di-grant Step 3)
- Push ke main branch tetap auto-deploy ke Cloudflare

**Verifikasi:**
- Setelah 10 menit, coba akses URL lama -> harus dapat 404 atau "site not found"
- Coba akses URL Cloudflare -> harus tetap jalan

---

## Step 6: Update tester (5 menit)

Kabari 3 tester via WA/email:

```
Hai [nama tester],

Update untuk EscBot - URL berubah dari:
  https://christianelka.github.io/escalation-chatbot/  (sudah offline)

Ke URL baru:
  https://escbot.pages.dev/escalation-chatbot/  (atau apapun URL Cloudflare kamu)

Sandi tetap sama.

Catatan: kalau sebelumnya sudah simpan koreksi/riwayat di tab lama,
mereka tersimpan di browser kamu, tidak ke-share. Kamu bisa lanjut
testing dari URL baru, atau import koreksi yang udah di-export.

Makasih bantuannya!
```

---

## Step 7: Test end-to-end (5 menit)

Buka URL Cloudflare baru di browser baru/incognito:

1. Password gate muncul -> input sandi -> masuk
2. Settings AI -> tambah API key -> Test Semua Key -> sukses
3. Kirim query test -> dapat hasil
4. Buka DevTools -> Network tab -> reload -> verify file di-load dari `xxx.pages.dev`, bukan `github.io`
5. Coba `git clone https://github.com/christianelka/christianelka.github.io.git` dari komputer lain (atau incognito GitHub) -> harus dapat error "Repository not found"

Kalau semua OK, migrasi selesai.

---

## Troubleshooting

### "Cloudflare deploy failed"

- Cek **Deployments** tab di Cloudflare project
- Klik latest deploy -> lihat **Build log**
- Biasanya karena build output directory salah. Pastikan `/` (root)

### "URL Cloudflare jalan, tapi assets 404"

- Cek path di `index.html` - harusnya pakai relative path (`<script src="ai.js">`), bukan absolute (`/ai.js`)
- Buka file via DevTools Network, copy URL yang 404, fix di kode, push ke GitHub, Cloudflare auto-redeploy

### "Tester bilang situs offline" setelah privatekan repo

- Cek apakah Cloudflare Pages masih jalan via dashboard
- Cek custom domain (kalau pakai) - mungkin ada DNS issue
- Verifikasi URL Cloudflare langsung (`xxx.pages.dev`)

### "Saya berubah pikiran, mau balik ke GitHub Pages"

- Settings -> Change visibility -> Make public
- GitHub Pages otomatis aktif lagi dalam 5-10 menit
- (Optional) Hapus project di Cloudflare Pages -> Settings -> Delete

### "Saya mau pakai custom domain"

Kalau nanti mau pakai domain sendiri (misal `escbot.yourname.com`):

1. Beli domain (Namecheap, Cloudflare Registrar, dll)
2. Cloudflare Pages -> project -> **Custom domains**
3. Klik **Set up a custom domain**
4. Ikuti instruksi DNS (lebih gampang kalau domain juga di Cloudflare)

---

## Yang BUKAN dilindungi oleh migrasi ini

Penting kamu paham, ini **tidak** mencegah:

1. **Tester yang sudah login lihat source via DevTools** - HTML/JS/CSS tetap download ke browser mereka. Bisa save & republish kalau mereka mau.
2. **Network scraping situs Cloudflare Pages** - tools seperti HTTrack tetap bisa scrape rendered HTML kalau lewat password gate.
3. **Screenshot data hashtag** - kalau tester punya akses, mereka bisa screenshot list hashtag.

Yang **dilindungi**:

1. **Source code di GitHub** - tidak bisa di-clone tanpa akses repo
2. **Pre-built data structures** - mereka tetap bisa lihat yang ter-render, tapi tidak bisa lihat raw `data.js` mentah dengan struktur internal komentar/komentar developer
3. **Future iterations** - changes yang belum di-deploy, branch eksperimen, dokumentasi internal aman di repo private

Plus combined dengan:
- LICENSE proprietary baru -> legal protection
- Copyright header per file -> ownership claim eksplisit

---

## Setelah migrasi selesai

Hapus dokumen ini (`MIGRATION-CLOUDFLARE.md`) atau pindah ke folder `docs/` kalau mau simpan untuk referensi.

Test pertama dengan kondisi nyata:
- Pastikan 3 tester bisa akses URL baru
- Coba lakukan testing flow seperti biasa
- Lihat data masuk ke tab Riwayat & Pembelajaran
- Export semua periodik biar tidak hilang
