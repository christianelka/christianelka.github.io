# PANDUAN SIMULASI & CARA MAIN — Surat Terakhir

> Dokumen ini untuk **moderator/panitia** yang mau tes manual atau main beneran.
> Dua mode: **Full Digital** (semua di HP) atau **Hybrid** (HP + kertas).

---

## PERSIAPAN

### Yang Dibutuhkan

| Item | Full Digital | Hybrid (Kertas) |
|---|---|---|
| HP moderator (1) | ✅ | ✅ |
| HP pemain (3-12) | ✅ | ❌ (opsional) |
| Laptop/TV display (1) | opsional | opsional |
| Kertas kecil (sejumlah pemain) | ❌ | ✅ |
| Pulpen | ❌ | ✅ |
| Amplop warna 3 (merah/kuning/hijau) | ❌ | ✅ (beneran) |
| WiFi / internet | ✅ | ✅ (mod saja) |

### Buka Server

Kalau lokal:
```
cd surat-terakhir
npm start
```
Buka `http://localhost:3000/` di browser.

Kalau Railway:
```
https://youthgame-palinggayeng-punkora.up.railway.app/
```

---

## MODE 1: FULL DIGITAL (Semua di HP)

### Langkah Tes Manual (1 orang simulasi)

> Butuh 4 tab/browser berbeda (atau 3 HP + 1 laptop).

#### Tab 1 — Moderator (laptop/HP utama)

1. Buka `http://localhost:3000/`
2. Isi password: `PalingGayeng2026`
3. Nama: `Mod1` (bebas)
4. Role: **Moderator** → klik **Masuk**
5. Pilih Tier: **Menengah** (default)
6. Ronde: **3** (untuk tes cepat)
7. Klik **Buat Sesi** → muncul kode 6 huruf (misal `JGUS11`)
8. Catat/salin kode

#### Tab 2, 3, 4 — Pemain (incognito/browser lain)

> PENTING: Setiap pemain harus di browser/profil/incognito BERBEDA (cookie beda).

1. Buka `http://localhost:3000/`
2. Password: `PalingGayeng2026`
3. Nama: `Budi` / `Citra` / `Dani`
4. Role: **Pemain** → klik **Masuk**
5. Masukkan kode room (6 huruf dari moderator)
6. Klik **Masuk** → tampil "Menunggu moderator..."

#### Moderator — Mulai Game

1. Di tab Moderator, buka tab **Lobby**
2. Pastikan 3 pemain muncul (Budi, Citra, Dani)
3. Klik **Mulai Ronde 1**

#### Per Ronde (ulangi 3x untuk 3 ronde)

| Fase | Moderator | Pemain |
|---|---|---|
| **Baca** (1 menit) | Lihat fragmen di Mod View. Setiap pemain dapat ayat berbeda. | Baca fragmen di layar masing-masing. Bacakan keras ke grup. |
| **Diskusi** (4 menit) | Klik **Mulai Diskusi**. Pantau timer. Boleh tanya dari daftar pertanyaan (tab Game, sidebar kanan). | Diskusi siapa yang "beda" dari gaya bahasa fragmennya. |
| **Voting** (30 detik) | Klik **Mulai Voting**. | Klik **Vote Sekarang** → pilih 1 nama. |
| **Reveal** | Klik nama pemain di panel **Buka Amplop** untuk buka misteri. | Lihat popup amplop (merah/kuning/hijau). |
| **Akhiri** | Klik **Akhiri** ronde. Skor update. | Lihat skor di floating pill bawah. |

#### Setelah Ronde Terakhir
- Tab moderator auto-pindah ke **Selesai**
- Muncul pemenang + confetti
- Klik **Sesi Baru** untuk ulang

### Yang Harus Diverifikasi (Checklist Tes Manual)

- [ ] Welcome page load tanpa error
- [ ] Password salah → muncul "Sandi salah"
- [ ] Password benar → redirect ke moderator/player
- [ ] Moderator bisa create game, muncul kode 6 huruf
- [ ] Pemain join pakai kode → muncul di lobby moderator
- [ ] Mulai Ronde → pemain terima fragmen berbeda-beda
- [ ] Advance phase: baca → diskusi → voting (timer jalan)
- [ ] Vote: pemain pilih 1 nama, tidak bisa vote diri sendiri
- [ ] Buka amplop: popup muncul (merah/kuning/hijau)
- [ ] End round: skor update di kedua sisi
- [ ] Setelah ronde terakhir: "Selesai" + pemenang + confetti
- [ ] Display page: skor live + reveal feed terupdate

---

## MODE 2: HYBRID (HP Moderator + Kertas Pemain)

> Mode ini cocok kalau WiFi terbatas atau mau suasana lebih seru pakai kertas fisik.
> Moderator tetap pakai HP/laptop. Pemain TIDAK perlu HP.

### Persiapan Tambahan

1. **Cetak/tulis fragmen di kertas kecil** (ukuran kartu nama)
   - Moderator buka HP → login → create game
   - Klik **Mulai Ronde** → lihat **Mod View** (panel kanan)
   - Tulis setiap fragmen di kertas terpisah
   - Lipat kertas, bagikan random ke pemain

2. **Siapkan 3 amplop warna beneran** (merah, kuning, hijau)
   - Isi setiap amplop dengan kertas efek:
     - **Merah**: "TERUNGKAP! Identitasmu terbuka."
     - **Kuning**: "BONUS CLUE! Kamu dapat petunjuk tambahan."
     - **Hijau**: "AMAN! Tidak ada efek."

3. **Papan skor** (whiteboard/kertas besar)
   - Kolom: Pembawa | Agen
   - Update manual setiap akhir ronde

### Flow Hybrid Per Ronde

```
┌─────────────────────────────────────────────────────┐
│  MODERATOR (HP)              PEMAIN (kertas)        │
│                                                      │
│  1. Klik "Mulai Ronde"       -                      │
│  2. Lihat Mod View →         Terima kertas fragmen  │
│     tulis fragmen di kertas   (dilipat, random)     │
│  3. Klik "Mulai Diskusi"     Baca fragmen keras     │
│     (timer di HP mod)         Diskusi verbal        │
│  4. "Mulai Voting"           Angkat tangan/         │
│                               tulis nama di kertas  │
│  5. Hitung suara manual      -                      │
│  6. Yang terpilih ambil      Buka amplop fisik      │
│     1 amplop dari meja                              │
│  7. Klik "Akhiri" di HP      Lihat papan skor      │
│     → catat skor ke papan                           │
└─────────────────────────────────────────────────────┘
```

### Detail Setiap Langkah

#### 1. Moderator Create & Start

```
HP Moderator:
  → Login sebagai moderator
  → Buat Sesi (tier: Menengah, ronde: 5)
  → Mulai Ronde 1
  → Lihat "Mod View" di panel kanan
```

**Mod View** menampilkan:
- Nama setiap pemain (virtual)
- Fragmen masing-masing
- Role (pembawa/agen/abu-abu)
- Kitab target vs kitab agen

#### 2. Tulis & Bagikan Fragmen

Moderator tulis di kertas kecil:

```
┌─────────────────────────┐
│ "Biarlah segenap tanah  │
│  menyembah dan bermazmur│
│  kepada-Mu"             │
│                         │
│        [LIPAT]          │
└─────────────────────────┘
```

- Tulis sebanyak jumlah pemain
- Lipat semua kertas
- Kocok
- Bagikan random (jangan kasih tahu siapa dapat apa)

#### 3. Baca & Diskusi

- Setiap pemain buka kertas, baca keras fragmennya
- Timer di HP moderator (fase diskusi = 4 menit)
- Pemain bebas tanya: "Fragmenmu terasa puitis atau instruktif?"
- Moderator boleh bantu dengan pertanyaan dari daftar (lihat panel Pertanyaan di HP)

#### 4. Voting

- Moderator bilang: "Waktunya voting!"
- Setiap pemain tulis 1 nama di kertas (atau angkat tangan)
- Moderator hitung suara
- Yang paling banyak suara = "terkoreksi"

#### 5. Amplop Misteri (Fisik)

- Pemain yang terkoreksi ambil 1 amplop dari meja (pilih sendiri: merah/kuning/hijau)
- Buka di depan semua orang
- Baca efeknya keras-keras

#### 6. Skor

Moderator update di HP (klik **Akhiri** ronde) + papan skor fisik:

| Kondisi | Pembawa | Agen |
|---|---|---|
| Agen kena vote | +5 | -10 |
| Agen tidak kena | +2 | +5 |
| Abu-abu kena vote | +2 | +5 |

#### 7. Ulangi 5 Ronde

Setiap ronde, moderator klik **Mulai Ronde** berikutnya di HP → Mod View update fragmen baru → tulis kertas baru → bagikan.

### Tips Hybrid

1. **Siapkan kertas pre-cut** sebelum acara (potong kertas A4 jadi 8 bagian)
2. **Tulis cepat**: cukup tulis fragmen, tidak perlu nama pemain di kertas
3. **Amplop bisa reuse**: masukkan kembali kertas efek setelah dibuka
4. **Kalau WiFi mati**: moderator masih bisa lanjut dari Mod View terakhir yang terbuka di HP (data sudah di-load)
5. **Display di TV**: kalau ada TV, buka `/display` untuk tamu/penonton lihat skor live

---

## SCORING CHEAT SHEET

```
┌──────────────────────────────────────────┐
│  AGEN KENA VOTE (terdeteksi):            │
│    Pembawa  +5                           │
│    Agen     -10                          │
│                                          │
│  AGEN TIDAK KENA (lolos):                │
│    Pembawa  +2                           │
│    Agen     +5                           │
│                                          │
│  ABU-ABU KENA VOTE (salah target):       │
│    Pembawa  +2                           │
│    Agen     +5                           │
│                                          │
│  SERI (tidak ada majority):              │
│    Pembawa  +2                           │
│    Agen     +5                           │
│                                          │
│  5 RONDE SELESAI:                        │
│    Skor Pembawa > Agen = PEMBAWA MENANG  │
│    Skor Agen > Pembawa = AGEN MENANG     │
└──────────────────────────────────────────┘
```

---

## DISTRIBUSI PERAN (by player count)

| Pemain | Pembawa | Abu-abu | Agen |
|--------|---------|---------|------|
| 3 | 2 | 0 | 1 |
| 4 | 3 | 0 | 1 |
| 5 | 3 | 1 | 1 |
| 6 | 4 | 1 | 1 |
| 7 | 4 | 2 | 1 |
| 8 | 5 | 2 | 1 |
| 9 | 6 | 2 | 1 |
| 10 | 7 | 2 | 1 |
| 11 | 7 | 3 | 1 |
| 12 | 8 | 3 | 1 |

> **Pembawa** = dapat fragmen dari kitab TARGET (sama semua).
> **Agen** = dapat fragmen dari kitab BERBEDA (nyasar).
> **Abu-abu** = dapat fragmen dari kitab ketiga (pengecoh tambahan).

---

## CONTOH SKENARIO (6 pemain, Tier 2)

```
Ronde 1:
  Kitab Target: Mazmur
  Kitab Abu-abu: Amsal
  Kitab Agen:   Kidung Agung

  Pembawa (4 orang):
    Andi  → "Biarlah segenap tanah menyembah dan bermazmur kepada-Mu"
    Bella → "Firman-Mu itu pelita bagi kakiku, terang bagi jalanku"
    Clara → "Tuhan adalah gembalaku, takkan kekurangan aku"
    Deni  → "Daud memuji Tuhan dengan segala hatinya"

  Abu-abu (1 orang):
    Eka   → "Siapa menjaga mulutnya, menjaga nyawanya"

  Agen (1 orang):
    Fani  → "Air yang banyak tak dapat memadamkan cinta"

  Diskusi:
    - "Fragmen Fani kok beda ya? Kayak puisi cinta"
    - "Tapi Eka juga agak beda, kayak pepatah"
    - Tanya: "Apakah fragmenmu terasa seperti pujian?"
      Andi: "Ya!" / Fani: "Hmm... iya juga sih" (bohong)

  Voting:
    - Fani dapat 3 suara → TERKOREKSI
    - Fani buka amplop MERAH → "TERUNGKAP!"
    - Skor: Pembawa +5, Agen -10
```

---

## FAQ

**Q: Bisa main tanpa internet sama sekali?**
A: Mode Hybrid bisa. Moderator cukup buka Mod View 1x (butuh internet sesaat), lalu tulis fragmen ke kertas. Setelah itu bisa offline.

**Q: Kalau pemain kurang dari 3?**
A: Minimal 3 pemain. Kurang dari itu, game tidak bisa start.

**Q: Fragmen habis?**
A: Ada 115 fragmen bawaan + AI generate fragmen baru (kalau API key diset). Cukup untuk 10+ sesi tanpa repeat.

**Q: Bisa ganti password?**
A: Set environment variable `PASSWORD` di Railway (atau `.env` lokal).

**Q: Display page butuh login?**
A: Tidak. Buka langsung `/display` tanpa password. Read-only.
