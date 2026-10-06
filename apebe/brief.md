# Project Brief: Hotel Lock System & Keycard Website

---

## 1. Project Overview
* **Project Name:** Hotel Lock System & Keycard B2B Catalog Website
* **Business Model:** B2B (*Business-to-Business*) Hardware Sales, System Integration & Consumable Supplies (Keycard)
* **Primary Objective:** 
  * Membangun website katalog profesional untuk mempromosikan 3 brand utama sistem smart lock hotel beserta software pendukungnya.
  * Menyediakan kanal pemesanan cepat dan repeat order untuk produk keycard RFID (kartu cetak custom maupun kartu polos).
  * Menghasilkan lead terverifikasi (*qualified leads*) melalui formulir RFQ (*Request for Quote*) dan integrasi WhatsApp Sales.
* **Infrastructure Strategy:** 100% *Serverless & Static Hosting* (Zero server maintenance cost, kompatibel dengan GitHub Pages / Cloudflare Pages / Vercel).

---

## 2. Target Audience
* **Hotel Owners & Investors:** Mencari solusi sistem penguncian aman, modern, dan terjangkau untuk properti baru atau renovasi.
* **Procurement / Purchasing Division:** Membutuhkan suplai rutin kartu kunci RFID, wristband, dan sakelar hemat energi (*energy saving switch*).
* **Engineering & IT Managers:** Memastikan kompatibilitas mortise pintu, software encoder, integrasi PMS (*Property Management System*), dan after-sales support.
* **General Contractors & Interior Designers:** Kontraktor yang membutuhkan sub-distributor pengadaan perangkat keras pintu komersial.

---

## 3. Product Scope & Classification

### A. Hotel Lock Systems (Hardware & Software)
* **Brand Coverage:** 3 brand utama (dengan arsitektur katalog siap ekspansi).
* **Fitur Kunci:**
  * Standar mortise (ANSI / European / Stainless Steel 304).
  * Metode akses: RFID Card, Bluetooth Mobile Key (BLE), Password, dan Mechanical Backup Key.
  * Software manajemen resepsionis (audit trail, pembatasan durasi kamar, checkout otomatis).
* **Aksesoris Sistem:**
  * USB RFID Encoder / Card Issuer.
  * Energy Saving Switch (Mifare / Optical / RF Card).
  * Handheld Data Programmer / Data Collector.

### B. Keycard & Consumables
* **Tipe Chip RFID:**
  * Mifare 1k S50 (13.56 MHz) - Standar hotel modern.
  * Temic T5577 / EM4100 (125 kHz) - Standar hotel legacy.
  * Ultralight / NTAG (NFC-enabled).
* **Finishing & Kustomisasi:**
  * Blank White Card (Kartu Polos Siap Cetak).
  * Custom Full Color Offset Printing (Logo hotel, visual kamar, panduan tamu).
  * Material alternatif: Standard PVC, Bio-PVC ramah lingkungan, dan Wooden Keycard (kayu).
  * RFID Wristband / Silicone Band (untuk fasilitas resort, gym, dan kolam renang).

---

## 4. Website Architecture (Sitemap)

```text
├── Home
│   ├── Hero Banner (Highlight 3 Brand & Promo Keycard)
│   ├── Brand Portfolio / Ecosystem
│   ├── Featured Products (Best Seller Locks & Keycard Packages)
│   ├── System Workflow Diagram (Card -> Lock -> Energy Saver)
│   ├── Client / Project Showcase
│   └── Quick RFQ Form & WhatsApp CTA
│
├── Hotel Lock Systems
│   ├── Filter by Brand (Brand A, Brand B, Brand C)
│   ├── Filter by Door Type (Wooden, Aluminum, Glass, Metal)
│   └── Product Detail Page (Spesifikasi, Ukuran Mortise, Brosur PDF)
│
├── Keycard Solutions
│   ├── RFID Hotel Keycards (13.56 MHz vs 125 kHz)
│   ├── Custom Printing & Mockup Request
│   └── Energy Saving Switches & Encoders
│
├── Software & Integrations
│   ├── Front-Desk Management Software
│   └── PMS Compatibility (Integrasi Sistem Hotel)
│
├── Request for Quote (RFQ) / Sample
│   ├── Project Consultation Form (Jumlah kamar, tipe pintu)
│   └── Free Physical Sample Card Request
│
└── Contact & Showroom
    ├── Direct WhatsApp Procurement
    └── Workshop / Showroom Address

```

---

## 5. Technical Stack & Serverless Infrastructure

* **Base Template:** ThemeForest HTML5 / CSS3 / Vanilla JS / Bootstrap 5 (Rekomendasi: *Securex*, *Securico*, atau *Electro*).
* **Environment & Tooling:** Node.js (untuk manajemen aset, minifikasi, testing lokal, atau npm scripts jika diperlukan).
* **Hosting Platforms (Zero Server Cost):**
* **Tahap 1 (Development / Testing):** GitHub Pages / Cloudflare Pages.
* **Tahap 2 (Production):** Vercel atau Cloudflare Pages (dihubungkan ke custom domain dengan proteksi SSL gratis).


* **Asset Optimization:** Seluruh gambar katalog dikonversi ke format WebP untuk memastikan skor Google PageSpeed optimal di atas hosting statis.

---

## 6. Lead Capture & Form Handling Strategy (No PHP Backend)

Karena sistem menggunakan *static / serverless hosting*, skrip konvensional seperti `mail.php` ditiadakan dan diganti dengan salah satu dari metode berikut:

1. **Direct WhatsApp Lead Router (Primary):**
* Formulir RFQ diolah langsung di sisi klien (*client-side JavaScript*).
* Data isian (nama hotel, jumlah kamar, brand lock, tipe kartu) otomatis diformat menjadi pesan teks siap kirim via WhatsApp API (`https://wa.me/...`).


2. **Third-Party Serverless Form API (Secondary / Fallback):**
* Menggunakan layanan Web3Forms atau Formspree untuk mengirim detail RFQ langsung ke inbox email resmi perusahaan tanpa butuh server email sendiri.


3. **Node.js Serverless Function (Optional via Vercel/Netlify):**
* Endpoint mini di `/api/rfq.js` yang memanfaatkan SDK Resend atau Nodemailer jika membutuhkan konfirmasi otomatis ke email calon pembeli.



---

## 7. Functional Requirements

| Fitur | Keterangan & Tujuan |
| --- | --- |
| **Multi-Brand Filtering** | Navigasi berbasis tab / dataset JS untuk menyaring produk 3 brand secara instan di sisi browser. |
| **Download Datasheet (PDF)** | Link langsung ke file statis PDF spesifikasi teknis untuk lampiran arsitek & purchasing. |
| **Client-Side RFQ Calculator** | Formulir ringkas pemilihan frekuensi kartu dan kuantiti kamar tanpa reload halaman. |
| **Floating Action Button** | Tombol sticky WhatsApp dengan template pesan kontekstual sesuai halaman yang sedang dibuka. |
| **Sample Request Capture** | Validasi input form sampel kartu sebelum diteruskan ke WhatsApp Sales atau email sales. |

---

## 8. Deliverables & Execution Timeline

* **Tahap 1: Data Gathering (Minggu 1)**
* Finalisasi data spek teknis & foto katalog 3 brand kunci.
* Foto sampel fisik keycard polos, cetak, dan aksesoris.


* **Tahap 2: Setup Template & Pembersihan Backend Legacy (Minggu 2)**
* Instalasi template HTML ThemeForest terpilih.
* Menghapus file skrip PHP bawaan template dan merestrukturisasi path aset.
* Setup repositori Git lokal dan remote di GitHub.


* **Tahap 3: Implementasi Logika Serverless & Input Data (Minggu 3)**
* Input katalog produk, link datasheet PDF, dan penataan navigasi brand.
* Implementasi JS WhatsApp RFQ generator dan/atau endpoint Web3Forms.


* **Tahap 4: Testing & Deployment (Minggu 4)**
* Deploy ke GitHub Pages / Cloudflare Pages / Vercel.
* Uji alur pesan WhatsApp di smartphone dan desktop.
* Integrasi Google Search Console dan setup custom domain.