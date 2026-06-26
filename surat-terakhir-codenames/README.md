# Surat Terakhir — Bible Codenames

> Game tebak kata Alkitab berbasis tim. Terinspirasi dari board game *Codenames*.
> *"Surat Terakhir" — untuk Youth Church.*

---

## Tentang Game

**Surat Terakhir (Bible Codenames)** adalah game party hybrid di mana 2 tim saling berlomba menemukan kata-kata Alkitab di grid 5×5 masing-masing, total **50 kata unik** (25 per tim). Setiap tim punya **Spymaster** yang kasih clue secara verbal, dan **Operative** yang menebak kata.

### Mode Hybrid

Clue dan tebakan diucapkan langsung (tidak diinput ke sistem). GUI hanya sebagai alat bantu visual untuk konfirmasi tebakan — seru, cepat, dan muka-muka tegang khas Codenames.

**Keunikan:** Setiap tim punya **grid independen** sendiri — tidak ada keterikatan atau kebocoran state antar tim. Kata yang dipilih Tim A tidak akan muncul di grid Tim B.

---

## Cara Main

### 1. Setup

1. Buka `index.html` di browser
2. Pilih **jumlah pemain** (minimal 4, maksimal 10)
3. Input **nama pemain** satu per satu
4. **Voting kapten** — setiap pemain memilih 2 kapten secara bergiliran
5. Review **pembagian tim & urutan Spymaster** (otomatis berdasarkan vote)
6. Klik **MULAI GAME**

### 2. Game Loop

```
GILIRAN TIM MERAH:

1. Spymaster kasih clue secara verbal
   Contoh: "Pejuang 3"

2. Tim menebak secara verbal
   Contoh: "DAUD, GOLIAT, PAULUS"

3. Spymaster KLIK kata yang berhasil ditebak di grid

4. Klik SELESAI GILIRAN (atau PASS kalau mau akhiri lebih awal)

5. Giliran pindah ke Tim Biru
```

### 3. Fitur

| Fitur | Fungsi |
|-------|--------|
| **Spymaster View** | Toggle untuk lihat warna asli (hanya Spymaster) |
| **Visual Selection** | Kartu terpilih punya efek scale + glow + badge centang |
| **Undo** | Batalkan pilihan kata sebelum konfirmasi |
| **Pass** | Akhiri giliran lebih awal |
| **Timer** | Countdown 2 menit per giliran |
| **Sound Effects** | Sound saat reveal, ganti tim, menang |
| **Punishment Roulette** | Roda hukuman dramatis di akhir setiap ronde |
| **Round History** | Riwayat skor tiap ronde + total kemenangan |
| **🏳️ Menyerah** | Tombol untuk menyerah apabila tim benar-benar stuck |
| **Auto-Surrender** | Otomatis menyerah jika 3 giliran berturut-turut tanpa tebakan benar |

### 4. Akhir Ronde

Setelah ronde selesai (salah satu tim menang):

1. Layar menampilkan **statistik ronde** (skor akhir, pemenang, riwayat ronde)
2. Tim yang kalah harus menjalani **Punishment Roulette**
3. Klik **PUTAR RODA** — roda berputar dengan efek deceleration
4. Kartu hukuman terungkap — tim yang kalah menjalankan hukuman
5. Klik **LANGSUNG RONDE BERIKUTNYA** untuk mulai ronde baru

### 5. Menang / Kalah

| Kondisi | Hasil |
|---------|-------|
| Tim temukan semua kata (15 kata) | ✅ **MENANG** |
| Tim lawan kena Assassin 2x | ✅ **MENANG** |
| Tim lawan menyerah / auto-surrender | ✅ **MENANG** |
| Kena peringatan Assassin 1x | ⚠️ Peringatan |
| Kena Assassin 2x | ❌ **KALAH** |
| Memutuskan menyerah (tombol MENYERAH) | ❌ **KALAH** |
| 3 giliran berturut-turut tanpa tebakan benar | ❌ **KALAH (auto-surrender)** |
| Menangkan ronde terbanyak di akhir game | 🏆 **JUARA** |

---

## Grid & Warna

Setiap tim punya **grid 5×5 sendiri (25 kata)**, total **50 kata unik** untuk 2 tim.

### Grid A (Tim Merah)
| Warna | Jumlah |
|-------|--------|
| 🔴 Merah (milik Tim A) | 15 kata |
| ⚪ Netral | 8 kata |
| ⚫ Assassin | 2 kata |

### Grid B (Tim Biru)
| Warna | Jumlah |
|-------|--------|
| 🔵 Biru (milik Tim B) | 15 kata |
| ⚪ Netral | 8 kata |
| ⚫ Assassin | 2 kata |

> **Tidak ada kata tim lawan** di grid tim lain. Masing-masing grid benar-benar independen.

---

## Strategi Spymaster

### Kasih clue yang:
- ✅ Terkait beberapa kata sekaligus
- ✅ Tidak terlalu spesifik (bisa kena netral/assassin)
- ✅ Kreatif dan tidak terduga

### Hindari clue yang:
- ❌ Terlalu umum (bisa kena kata lawan)
- ❌ Terlalu spesifik (hanya 1 kata)
- ❌ Menggunakan kata yang ada di grid

### Contoh Clue

```
Grid: DAUD, LAUT, GOLIAT, MAHKOTA, DOA, BAHTERA, GURUN, SALIB, ...

Clue bagus: "Pejuang 3"
  → DAUD (pejuang), GOLIAT (pejuang), PAULUS (pejuang)

Clue buruk: "Daud 1"
  → Terlalu spesifik, hanya 1 kata

Clue berisiko: "Air 2"
  → Bisa kena LAUT (netral) atau AWAH (biru)
```

---

## Database Kata

Game menggunakan **250+ kata Alkitab** dari berbagai kategori — kata-kata umum yang mudah dikenal, dengan beberapa kata tingkat sulit sesekali untuk variasi:

| Kategori | Contoh |
|----------|--------|
| **Tokoh** | DAUD, MUSA, PAULUS, ABRAHAM, ESTER |
| **Tempat** | YERUSALEM, BABEL, BETLEHEM, ROMA |
| **Benda** | PEDANG, SALIB, BAHTERA, MAHKOTA |
| **Konsep** | IMAN, KASIH, DOA, HUKUM, ANUGERAH |
| **Peristiwa** | BANJIR, KEBANGKITAN, PENTAKOSTA |
| **Hewan** | SINGA, DOMBA, MERPATI, ELANG |
| **Alam** | GUNUNG, LAUT, MATAHARI, BINTANG |

---

## Punishment Roulette

### Cara Kerja
1. Di akhir setiap ronde, tim yang kalah mendapat giliran hukuman
2. Roda berisi **10 hukuman ringan** yang diacak tiap game
3. Klik **PUTAR RODA** — roda berputar dengan animasi deceleration
4. Roda berhenti di satu hukuman
5. Kartu hukuman terungkap — tim yang kalah menjalankan

### Daftar Hukuman
| # | Hukuman | Deskripsi |
|---|---------|-----------|
| 1 | 📸 Story IG/WA | Buat Story IG atau Status WA tentang momen lucu di game ini! |
| 2 | 🔍 Cari Benda K | Cari 3 benda yang diawali huruf K di sekitar ruangan! |
| 3 | 📞 Telpon Teman | Telepon 1 teman dan bilang "Aku kangen kamu"! |
| 4 | 💪 Push-up 10x | Push-up 10x sambil menyebutkan nama tim lawan! |
| 5 | 🎤 Nyanyi Lagu | Nyanyi 1 lagu anak-anak di depan semua orang! |
| 6 | 💬 3 Pujian | Bilang 3 hal baik tentang anggota tim lawan! |
| 7 | 🕺 Dance 15dtk | Dance 15 detik dengan gaya bebas! |
| 8 | 📝 Puisi 2 Baris | Buat puisi 2 baris tentang kekalahan tim barusan! |
| 9 | 🦀 Jalan Kepiting | Berjalan seperti kepiting dari ujung ke ujung ruangan! |
| 10 | 🗣️ Aksen Daerah | Berbicara dengan aksen daerah tertentu selama 1 giliran! |

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Vanilla HTML + Tailwind CSS (CDN) + Google Fonts (Geist) |
| **State** | Alpine.js 3.x |
| **Sound** | Web Audio API (built-in, tanpa library eksternal) |
| **Testing** | Playwright (E2E, 12 test cases) |
| **Data** | `words.json` — 200+ kata Alkitab |
| **Offline** | File lokal (tidak perlu server) |

---

## File Structure

```
surat-terakhir-codenames/
├── index.html                  # Main game (single-page app)
├── words.json                  # Database 200+ kata Alkitab
├── playwright.config.cjs       # Konfigurasi E2E testing
├── codenames-e2e.spec.cjs      # Test spec Playwright (12 test cases)
└── README.md                   # Dokumentasi ini
```

---

## Quick Start

```bash
# Buka langsung di browser
start index.html

# Atau pake HTTP server biar aman (recommended)
npx serve .
# Buka http://localhost:3000

# Atau pake Python
python -m http.server 8000
# Buka http://localhost:8000
```

### Testing

```bash
# Install Playwright (sekali aja, kalo belum punya)
npm init -y
npm install -D @playwright/test
npx playwright install chromium

# Jalankan semua E2E test (12 test cases)
npx playwright test

# Run dengan UI mode (debugging)
npx playwright test --ui

# Run specific test
npx playwright test -g "Punishment Roulette"
```

---

## License

MIT

---

*v2.0.0 — Bible Codenames untuk Youth Church. Surat Terakhir: 2 Timotius 4:7-8.*
