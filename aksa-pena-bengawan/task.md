# Task Audit Interface & Desain Anti-AI-Slop — Aksa Pena Bengawan

## Status Proyek & Ringkasan Audit
- **Target Direktori**: `aksa-pena-bengawan/`
- **Fokus Utama**: Eliminasi AI Slop (klise AI, inkonsistensi token CSS, generic bento/cards, unmotivated animation, SVG/iconography murahan, copy halusinasi/templat, a11y contrast fail, variable CSS undefined).
- **Hasil Akhir**: Interface berkarakter otentik, presisi industri percetakan hospitality, performa tinggi, dan standar aksesibilitas WCAG AA.

---

## 1. Fase Audit Fondasi & Desain Sistem (CSS & Token)
- [ ] **Audit Token & Variabel CSS (`base.css` & `visualizer.css`)**
  - [ ] Perbaiki variabel CSS yang hilang/undefined (`--green`, `--emerald-700`, `--hl-shadow-lg`, `--aksa-ff-heading`).
  - [ ] Standarisasi corner radius skala tunggal (hapus benturan `10px`, `12px`, `14px`, `18px`, `24px`).
  - [ ] Sinkronkan palet warna Forest Emerald dan hapus warna ad-hoc hardcoded di `visualizer.css`.
  - [ ] Audit rasio kontras WCAG AA pada teks kecil (`.eyebrow`, `.breadcrumb`, `.muted` pada background gelap).
- [ ] **Pembersihan Efek AI Slop Global**
  - [ ] Hapus `@keyframes floaty` (kartu melayang di hero) yang merupakan klise AI template.
  - [ ] Hapus animasi `@keyframes fabpulse` agresif pada WhatsApp FAB; ganti dengan interaksi hover mikro yang tenang.
  - [ ] Evaluasi atau tata ulang `.marquee` ticker agar fungsional dan tidak terkesan sebagai pengisi ruang kosong murahan.
  - [ ] Ganti seluruh raw emoji (🎨, 🔍, 💳, ✏️, 📱, ✉️, 📍, ⏰) dengan set SVG icon profesional yang konsisten (`stroke-width: 1.5/2.0`).

---

## 2. Fase Audit Halaman & Komponen (HTML & Layout)

### A. `index.html` (Beranda)
- [ ] Hilangkan repetisi bento/card generik 3-kolom standar.
- [ ] Rapikan visual hero agar tidak menumpuk floaty card palsu; tampilkan visual produk nyata dengan komposisi asimetris/editorial.
- [ ] Ganti emoji di bagian "Kenapa Kami" dengan semantic SVG icons.
- [ ] Kurangi frekuensi `.eyebrow` (maksimal 1 per 3 seksi sesuai kaidah desain anti-slop).
- [ ] Ubah CTA Band bawah agar memiliki headline kontekstual dan tidak sama persis di setiap halaman.

### B. `mockup.html` (Interactive Keycard Visualizer)
- [ ] Audit kontras warna swatch selector (`#ffffff` di atas background terang).
- [ ] Bersihkan styling inline yang diinjeksi via JavaScript ke dalam file CSS terstruktur.
- [ ] Pastikan fallback jika library PDF/Canvas gagal termuat (`html2canvas`, `jspdf`).
- [ ] Perbaiki aksesibilitas form kontrol (label for, aria-live untuk preview perubahan kartu).
- [ ] Tambahkan indikator visual material finishing (Glossy, Matte, Frosted, Wood, Gold) yang lebih realistis dan elegan.

### C. `layanan.html` (Halaman Layanan)
- [ ] Hancurkan pola zigzag membosankan (kiri-teks/kanan-gambar berulang 3 kali berturut-turut).
- [ ] Buat layout hierarki teknis spesifikasi kartu (Mifare vs Temic vs Wooden) dengan perbandingan fitur yang tajam.
- [ ] Perbaiki seksi "Layanan Pendukung" agar tidak menggunakan card template kosong.

### D. `harga.html` (Halaman Harga / Pricing Tiers)
- [ ] Audit kartu harga agar tidak menggunakan badge "Paling Populer" tiruan AI yang mengambang canggung.
- [ ] Berikan kalkulator perkiraan biaya atau tabel tier yang transparan dan profesional untuk hotel procurement.
- [ ] Bedakan penawaran kuantitas 500 pcs vs 1.000 pcs vs 5.000+ pcs dengan spesifikasi teknis yang jelas.

### E. `portofolio.html` (Galeri Portofolio)
- [ ] Ganti grid 3x2 repetitif dengan layout galeri editorial / masonry / studi kasus nyata.
- [ ] Tambahkan detail konteks untuk setiap kartu (tipe chip, finishing, jenis hotel, tahun produksi).
- [ ] Optimalkan tag `<img>` dengan `loading="lazy"`, `decoding="async"`, dan dimensi responsif.

### F. `faq.html` (Frequently Asked Questions)
- [ ] Terapkan keyboard navigation ARIA untuk accordion (Arrow keys, Home, End, Enter, Space).
- [ ] Hapus copy repetitif yang menyalin mentah-mentah dari halaman Layanan.
- [ ] Tambahkan kategori accordion (Teknis Chip, Proses Cetak & Mockup, Pengiriman & Garansi).

### G. `kontak.html` (Formulir RFQ & Kontak)
- [ ] Hapus atau konfigurasi fallback form `https://api.web3forms.com/submit` dengan placeholder `YOUR-WEB3FORMS-KEY`.
- [ ] Tambahkan validasi form real-time inline yang jelas tanpa merusak layout.
- [ ] Ganti data kontak placeholder (`+62 811-234-567`, `Indonesia`) dengan format kredibel dan profesional.

### H. `404.html` (Error Page)
- [ ] Ubah tampilan 404 dari teks polos menjadi halaman error yang rapi, kontekstual, dan selaras dengan tema Forest Emerald.

---

## 3. Fase Audit Skrip & Interaktivitas (JavaScript)
- [ ] **`assets/js/main.js`**:
  - [ ] Tambahkan handler tombol `Escape` untuk menutup menu mobile.
  - [ ] Tambahkan trap focus pada mobile nav saat terbuka (`aria-modal="true"`).
  - [ ] Implementasikan keyboard accessibility pada komponen accordion.
- [ ] **`assets/js/hotel-integrations.js`**:
  - [ ] Konsolidasikan konstanta nomor WhatsApp (`WA_PHONE`) agar tidak terduplikasi di inline HTML dan file JS.
  - [ ] Perbaiki fungsi sanitasi nomor WhatsApp dan validasi input.
  - [ ] Tangani fallback submission form Web3Forms secara elegan tanpa silent failure.
- [ ] **`assets/js/keycard-visualizer.js`**:
  - [ ] Pindahkan inline CSS `row.style.cssText` ke dalam class CSS utilitas di `visualizer.css`.
  - [ ] Optimalisasi performa canvas composite dan pencegahan memory leak saat manipulasi gambar berulang.

---

## 4. Fase Audit Copywriting & Brand Tone
- [ ] Hilangkan copy templat AI yang terdengar datar ("Mockup desain gratis. Respon penawaran kurang dari 24 jam via WhatsApp." diulang di semua footer).
- [ ] Sesuaikan tone of voice menjadi B2B Hospitality Professional (fokus ke ketahanan kartu, akurasi chip door lock VingCard/Onity/Salto/Dormakaba, presisi warna Pantone/CMYK offset).
- [ ] Perbaiki inkonsistensi penulisan istilah teknis (Mifare 13.56 MHz, Temic 125 kHz T5577, CR80 0.76mm, Offset Lithography).

---

## 5. Verifikasi & Pengujian Akhir
- [ ] **Cross-browser & Viewport Testing**: Uji pada mobile (360px, 390px, 414px), tablet (768px, 820px), desktop (1280px, 1440px, 1920px).
- [ ] **Lighthouse Audit**: Score Performance > 90, Accessibility = 100, Best Practices = 100, SEO = 100.
- [ ] **Prefers-Reduced-Motion Test**: Pastikan seluruh transisi dan animasi dinonaktifkan dengan bersih saat sistem meminta reduced motion.
- [ ] **W3C Validation & A11y Contrast Check**: Zero HTML errors, semua teks memenuhi rasio 4.5:1 (AA).
