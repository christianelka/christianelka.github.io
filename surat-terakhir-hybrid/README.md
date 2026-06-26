# Surat Terakhir — Hybrid Mode

> Game Bible-themed social deduction untuk Youth Church.
> **Mode Hybrid:** Moderator pakai HP/laptop, pemain pakai kertas. Tanpa server. Offline-capable.

---

## Tentang Game

**Surat Terakhir Hybrid** adalah versi sederhana dari game social deduction Surat Terakhir. Moderator mengontrol seluruh flow game dari 1 device (HP/laptop), sementara pemain menerima fragmen ayat Alkitab dalam bentuk **kartu kertas** yang sudah dicetak sebelumnya.

**Perbedaan dengan versi digital:**
| | Digital (surat-terakhir) | Hybrid (surat-terakhir-hybrid) |
|---|---|---|
| Server | Node.js + Socket.io | Tidak perlu (static HTML) |
| Player device | Setiap pemain pakai HP | Pemain pakai kertas |
| Moderator | Dashboard di laptop | Dashboard di 1 HP/laptop |
| Koneksi | Butuh internet | Offline-capable |
| Setup | Deploy ke Railway | Buka file HTML langsung |

---

## Fitur

- **Zero server** — buka `index.html` langsung di browser, jalan offline
- **Moderator dashboard** — kontrol penuh: timer, fase, voting, skor, amplop misteri
- **Kartu cetak** — `cetak.html` generate kartu fragmen siap potong (A4, 4 kolom)
- **Auto-distribusi** — moderator pilih jumlah pemain, sistem acak kartu otomatis
- **Timer built-in** — fase baca (60s), diskusi (4min), voting (30s)
- **Scoring otomatis** — skor dihitung berdasarkan voting + amplop
- **5 ronde** — kitab berbeda tiap ronde (Mazmur, Matius, Amsal, Markus, Galatia)
- **Purple modern UI** — sama dengan versi digital

---

## Quick Start

### 1. Persiapan (sebelum acara)

```
surat-terakhir-hybrid/
├── cetak.html      ← Buka di browser → Print → Potong kartu
├── index.html      ← Dashboard moderator (buka di HP/laptop)
└── data/
    └── fragmen.json ← Data fragmen (embedded di HTML)
```

1. Buka `cetak.html` di browser
2. Pilih ronde yang mau dicetak
3. Klik "Print" → potong kartu sesuai garis
4. Masukkan kartu ke amplop (opsional)

### 2. Hari H (saat acara)

1. Moderator buka `index.html` di HP/laptop
2. Pilih tier (Pemula/Menengah/Mahir) + jumlah ronde
3. Input nama pemain (3-8 orang)
4. Klik "Mulai Ronde 1"
5. Distribusikan kartu kertas ke pemain (acak, tertutup)
6. Jalankan flow: Baca → Diskusi → Voting → Reveal
7. Input voting di dashboard → skor otomatis
8. Lanjut ronde berikutnya

---

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arsitektur, tech stack, alur game |
| [CARA-MAIN.md](./CARA-MAIN.md) | Panduan lengkap moderator + pemain |
| [PERSIAPAN-CETAK.md](./PERSIAPAN-CETAK.md) | Panduan cetak kartu fragmen |
| [SCORING.md](./SCORING.md) | Aturan skor + tabel perhitungan |

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Vanilla HTML + Tailwind CSS (CDN) + Alpine.js |
| State | In-memory (browser) |
| Data | Embedded JSON (tidak perlu server) |
| Print | CSS @media print |
| Offline | Service Worker (opsional) |

---

## Default Credentials

Tidak ada. Game ini tidak butuh login. Cukup buka file HTML.

---

## License

MIT

---

*v1.0.0 — Hybrid mode untuk Youth Church*
