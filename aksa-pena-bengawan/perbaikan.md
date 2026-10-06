# Rekomendasi & Tindakan Perbaikan Anti-AI-Slop

Dokumen ini memuat detail teknis dari kelemahan sistem antarmuka pada proyek Aksa Pena Bengawan dan instruksi spesifik untuk menghapus *AI Slop*, meningkatkan performa, aksesibilitas, serta memantapkan karakter desain level industrial.

## 1. Perbaikan Design System & Variabel CSS (`base.css` & `visualizer.css`)

### Masalah Teridentifikasi:
1. **Undefined Variables**: `visualizer.css` menggunakan `var(--green)`, `var(--emerald-700)`, `var(--hl-shadow-lg)`, `var(--aksa-ff-heading)`, dan `var(--bg-soft,#f7faf9)` yang tidak dideklarasikan di `base.css` `:root`.
2. **Inkonsistensi Nilai Radius**: `border-radius` tersebar dari `10px`, `12px`, `var(--radius) (14px)`, `16px`, `18px`, hingga `24px`. Ini adalah gejala *AI generation* yang kurang memiliki desain sistem solid.
3. **Low Contrast A11y (WCAG Fail)**: `.eyebrow` warna `--emerald-600` di atas `--paper` tidak lolos WCAG AA. Teks `.breadcrumb` warna `#8FA89A` di atas latar gelap `--forest-950` gagal tes rasio kontras 4.5:1.

### Tindakan Perbaikan (CSS):
- Buka `base.css` dan tambahkan variabel yang kurang di dalam `:root`:
  ```css
  --emerald-700: #047857; /* Fallback green yang aman */
  --green: var(--emerald-500);
  --bg-soft: #F0F4F2;
  --hl-shadow-lg: 0 20px 40px -12px rgba(12, 31, 26, 0.35);
  ```
- Normalisasi `border-radius`: Gunakan 3 ukuran pasti: `--radius-sm: 8px;`, `--radius-md: 12px;`, `--radius-lg: 16px;`. Ganti semua nilai *hardcoded* di `visualizer.css` menjadi *CSS variables*.
- **Perbaikan Kontras Warna**:
  - Ubah warna `.eyebrow` di light mode menjadi `--emerald-700`.
  - Ubah warna `.breadcrumb` di dark mode menjadi `#B4CBBF` agar kontras meningkat di atas background `#0C1F1A`.

---

## 2. Penghapusan AI Slop Visual & Interaksi

### Masalah Teridentifikasi:
1. **Animasi Murahan (Generic Float & Pulse)**: `@keyframes floaty` di hero dan `@keyframes fabpulse` di tombol WhatsApp. Animasi ini sangat *cliché* dan membuat web terkesan murah (AI-generated template).
2. **Penggunaan Raw Emoji**: Menggunakan 🎨, 🔍, 💳, ✏️, 📱, ✉️, 📍, ⏰ secara literal alih-alih set SVG yang kohesif.
3. **Marquee Ticker Spam**: Ticker "MIFARE 13.56 MHz • TEMIC..." di bawah hero `index.html` tidak memiliki fungsi yang jelas selain mengisi ruang kosong.
4. **Card / Bento Grid Berulang**: Semua list disajikan dalam grid 3-kolom dengan ikon centang `✓` dan CTA yang persis sama.
5. **Zigzag Layout (Image-Text-Image)**: Pada `layanan.html`, format selang-seling ini diulang tiga kali berturut-turut tanpa variasi komposisi, melanggar *anti-zigzag rules*.

### Tindakan Perbaikan (HTML & Layout):
- Hapus `@keyframes floaty` dan ganti dengan *magnetic hover* mikro yang elegan (GSAP/Framer Motion atau transformasi rotasi CSS statis ringan saat hover).
- Hapus animasi *pulse* yang berkedip terus pada tombol WhatsApp. Gunakan `transform: scale(1.05);` hanya saat `:hover` atau `:active`.
- Hapus teks emoji dan gunakan **Lucide Icons** atau **Phosphor Icons** (SVG murni dengan `stroke-width: 1.5` atau `2`).
- Ubah layout `.marquee` menjadi section klien (logo jaringan hotel yang pernah dicetak), yang jauh lebih krusial secara B2B hospitality.
- Rombak format zigzag di `layanan.html` menjadi: (1) Hero Feature Split, (2) Grid 2-kolom Technical Specifications (CR80, ketebalan, offset printing), (3) Full-width image break / showcase mockup.
- Pangkas `.eyebrow`! Label atas "Produk Kami", "Cara Order", dsb. tidak perlu ada di semua section. Cukup sertakan headline <h2> utamanya saja.

---

## 3. Pembersihan Redundansi Konten & AI Copywriting

### Masalah Teridentifikasi:
1. `index.html`, `layanan.html`, `harga.html`, `portofolio.html`, dan `faq.html` diakhiri dengan komponen `.cta-band` yang kode, kalimat, dan dua tombolnya sama persis 100%.
2. Kontak placeholder (`+62-811-234-567`, `halo@aksapenabengawan.id`) dan wilayah yang buram.
3. Repetisi `var WA_PHONE = "62811234567";` di file HTML inline pada setiap file.

### Tindakan Perbaikan (Konten & Skrip):
- Hapus `<script>var WA_PHONE = "...";</script>` dari semua file HTML. Masukkan konstanta `const WA_PHONE = "62811234567";` hanya di `hotel-integrations.js` pada baris pertama.
- Buat penutup *CTA Band* menjadi kontekstual. 
  - Di `harga.html`: "Butuh penawaran custom untuk >10.000 pcs? Hubungi kami untuk harga khusus."
  - Di `layanan.html`: "Punya spesifikasi enkripsi khusus (VingCard, Salto, dsb)? Konsultasikan sistem door lock Anda."
  - Hindari satu *copypaste block* membosankan di 7 halaman.

---

## 4. Refaktor Kode Aksesibilitas (A11y) & JavaScript Flaws

### Masalah Teridentifikasi:
1. Menu Mobile tidak memiliki `aria-expanded` toggle dan tidak menjebak fokus (*focus trap*) serta tombol `Escape` untuk UX yang aman.
2. Accordion FAQ di `faq.html` dan `main.js` tidak mendukung aksesibilitas navigasi *Keyboard Arrow* (Home/End/ArrowUp/ArrowDown).
3. Visualizer Swatch Color (`#ffffff`) pada `.viz-swatches` tidak terlihat (putih di atas putih).
4. `hotel-integrations.js` mengeksekusi `fetch('https://api.web3forms.com/submit')` dengan fallback palsu (credential `YOUR-WEB3FORMS-KEY`). Ini akan men-trigger *Failed Request* di console browser klien.

### Tindakan Perbaikan (JavaScript & A11y):
- Di `main.js`, tambahkan pendeteksi tombol `Escape` untuk menu mobile:
  ```javascript
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileNav && mobileNav.classList.contains('open')) closeMobile();
  });
  ```
- Perbarui swatch warna `#ffffff` di `mockup.html` dengan CSS: `box-shadow: inset 0 0 0 1px #E3EAE3; border: 2px solid transparent;` agar bundaran putihnya tampak kontras dengan latar belakang putih.
- Pada fungsi `rfqSubmitFallback()` dalam `hotel-integrations.js`, segera hapus blok `fetch('https://api.web3forms.com/submit'...)` atau berikan log pemberitahuan jelas `console.warn("Fallback Web3Forms tidak terkonfigurasi");` ketimbang menembak endpoint mati.
- Hapus injeksi inline CSS pada `row.style.cssText` di dalam `keycard-visualizer.js`, pindahkan *style* itu menjadi kelas abstrak di dalam file CSS (`.viz-logo-row`).

---

## Panduan Eksekusi (Langkah demi Langkah)
1. **Buka `base.css`**: injeksikan semua root vars yang hilang dan ratakan skala border-radius.
2. **Buka `visualizer.css`**: Hapus pewarnaan manual, integrasikan ulang dengan CSS Variables `base.css`.
3. **Buka `index.html` dan `layanan.html`**: Hapus `@keyframes floaty`, hapus `<div class="marquee">`, rombak deret zig-zag, hapus raw emoji, dan turunkan `.eyebrow` spam menjadi 1-2 per halaman maksimum.
4. **Buka `hotel-integrations.js` & HTML Files**: Bersihkan spam variabel global inline `<script>`, rapikan fungsi fallback RFQ.
5. Jalankan Lighthouse Audit dan W3C HTML Validation pada halaman yang telah direfaktor untuk memastikan rasio kontras warna AA pass dan tidak ada error semantic tag.
