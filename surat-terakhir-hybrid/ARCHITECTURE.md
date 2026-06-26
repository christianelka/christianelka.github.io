# ARCHITECTURE — Surat Terakhir Hybrid

> Arsitektur sistem untuk mode hybrid (kertas + digital moderator).

---

## 1. Visi Produk

Mode hybrid memungkinkan game Surat Terakhir dimainkan **tanpa internet** dan **tanpa device untuk setiap pemain**. Cukup 1 HP/laptop untuk moderator, sisanya pakai kartu kertas.

---

## 2. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| **Frontend** | Vanilla HTML + Tailwind CDN + Alpine.js | Zero build step, offline-capable |
| **State** | In-memory (JavaScript object) | Tidak perlu database, cukup untuk 1 sesi |
| **Data** | Embedded JSON di HTML | Tidak perlu fetch, langsung tersedia |
| **Print** | CSS `@media print` | Browser-native, tidak perlu library |
| **Offline** | File lokal | Buka dari file:// langsung jalan |

---

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────┐
│           MODERATOR DEVICE (HP/Laptop)       │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  index.html (Dashboard)             │    │
│  │  ├─ Setup (tier, ronde, pemain)     │    │
│  │  ├─ Lobby (daftar pemain)           │    │
│  │  ├─ Game (timer, fase, voting)      │    │
│  │  ├─ Reveal (amplop misteri)         │    │
│  │  └─ End (leaderboard)               │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  In-Memory State                    │    │
│  │  ├─ players[]                       │    │
│  │  ├─ currentRound                    │    │
│  │  ├─ currentPhase                    │    │
│  │  ├─ scores { pembawa, agen }        │    │
│  │  └─ roundData (distrib, mystery)    │    │
│  └─────────────────────────────────────┘    │
│                                              │
│  ┌─────────────────────────────────────┐    │
│  │  cetak.html (Print Tool)            │    │
│  │  ├─ Pilih ronde                     │    │
│  │  ├─ Generate kartu                  │    │
│  │  └─ Print (CSS @media print)        │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           PEMAIN (Kertas)                    │
│                                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │Kartu│ │Kartu│ │Kartu│ │Kartu│ ...        │
│  │  1  │ │  2  │ │  3  │ │  4  │            │
│  └─────┘ └─────┘ └─────┘ └─────┘            │
│                                              │
│  Setiap kartu berisi:                        │
│  - Fragmen ayat (3-15 kata)                  │
│  - Nomor kartu (untuk identifikasi)          │
│  - Tidak ada nama kitab (rahasia!)           │
└─────────────────────────────────────────────┘
```

---

## 4. Alur Game End-to-End

```
[1] PERSIAPAN (sebelum acara)
    └─> Buka cetak.html → pilih ronde → print → potong kartu
    └─> Masukkan kartu ke amplop (opsional)
    └─> Siapkan kertas + pensil untuk voting

[2] SETUP (moderator)
    └─> Buka index.html di HP/laptop
    └─> Pilih tier (Pemula/Menengah/Mahir)
    └─> Set jumlah ronde (default 5)
    └─> Input nama pemain (3-8 orang)

[3] DISTRIBUSI (moderator → pemain)
    └─> Klik "Mulai Ronde 1"
    └─> Sistem acak: siapa dapat kartu target, siapa agen
    └─> Moderator bagikan kartu kertas (tertutup) ke pemain
    └─> Moderator tahu siapa agen (rahasia!)

[4] FASE BACA (60 detik)
    └─> Timer mulai di dashboard moderator
    └─> Pemain buka kartu, baca fragmen keras-keras
    └─> Tidak boleh diskusi

[5] FASE DISKUSI (4 menit)
    └─> Bebas bicara
    └─> Moderator punya pertanyaan tier (Y/T)
    └─> Pemain bisa tanya moderator

[6] FASE VOTING (30 detik)
    └─> Pemain tulis nama di kertas (siapa yang "nyasar")
    └─> Moderator input voting di dashboard
    └─> Skor otomatis dihitung

[7] FASE REVEAL
    └─> Moderator buka amplop misteri (klik di dashboard)
    └─> Efek: Merah (terungkap), Kuning (bonus), Hijau (aman)
    └─> Skor update

[8] RONDE SELANJUTNYA
    └─> Moderator klik "Lanjut Ronde"
    └─> Distribusi kartu BARU (kitab berbeda)
    └─> Loop ke [4]

[9] ENDGAME
    └─> Setelah 5 ronde: leaderboard
    └─> Pemenang: Pembawa vs Agen (skor tertinggi)
```

---

## 5. State Management

Semua state disimpan di memory browser (JavaScript object). Tidak ada localStorage atau server.

```javascript
const gameState = {
  players: ['Ani', 'Budi', 'Citra', 'Dedi'],
  currentRound: 1,
  totalRounds: 5,
  currentPhase: 'baca',
  scores: { pembawa: 0, agen: 0 },
  roundData: {
    kitabTarget: 'Mazmur',
    kitabAbu: 'Amsal',
    kitabAgen: 'Kidung Agung',
    distribution: {
      'Ani': { kitab: 'Mazmur', role: 'pembawa' },
      'Budi': { kitab: 'Mazmur', role: 'pembawa' },
      'Citra': { kitab: 'Amsal', role: 'abu-abu' },
      'Dedi': { kitab: 'Kidung Agung', role: 'agen' },
    },
    mystery: {
      'Ani': ['merah', 'kuning', 'hijau'],
      'Budi': ['hijau', 'merah', 'kuning'],
      'Citra': ['kuning', 'hijau', 'merah'],
      'Dedi': ['merah', 'hijau', 'kuning'],
    },
    votes: {},
    openedMystery: {},
  },
};
```

---

## 6. Keterbatasan

- **State hilang saat refresh** — tidak ada persistence
- **Tidak ada multi-device** — hanya 1 moderator
- **Tidak ada AI generation** — fragmen dari bank tetap
- **Manual voting input** — moderator harus input suara satu-satu

---

*Dibuat untuk mode hybrid Youth Church.*
