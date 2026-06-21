# Surat Terakhir — Pembawa Surat

> Game Bible-themed social deduction untuk acara Youth Church.
> Multi-device real-time party game. Mobile-first. AI-augmented.

**Live URL:** https://youthgame-palinggayeng-punkora.up.railway.app

> **UI/UX Style Guide:** [`public/image_4e3d3c.jpg`](./public/image_4e3d3c.jpg) — referensi visual final (purple mobile app dengan kartu bertumpuk isometric).

---

## 🎮 Tentang Game

**Surat Terakhir** adalah game social deduction ringan dengan nuansa Alkitab. Pemain berperan sebagai **"Pembawa Surat"** yang membawa fragmen ayat Alkitab. Mayoritas memegang fragmen dari kitab yang **sama** (surat target), sementara 1-2 pemain adalah **"Agen Terselubung"** yang memegang fragmen dari kitab berbeda. Tugas pemain: mendeteksi siapa yang nyasar, lewat diskusi, voting, dan insting gaya bahasa kitab.

**5 ronde × 6 pemain** = total ~30 menit per sesi.

---

## ✨ Fitur Unggulan

- 🎨 **Modern Purple Mobile** — UI clean, vibrant `#8A2BE2` primary, mobile-first, adopsi pola kartu "Rewards/Referrals" dari image_4e3d3c.jpg
- 📱 **Multi-device** — moderator di laptop, pemain di HP masing-masing
- 🤖 **AI-powered fragmen** — Gemini 2.5 Flash generate fragmen baru otomatis (tidak pernah kehabisan)
- 🔄 **Multi-key round-robin** — 5 API key untuk quota 300 req/menit
- 🎯 **3 Tier pertanyaan** — Pemula, Menengah, Mahir (selector di dashboard)
- 📊 **Live scoreboard** — pantau skor real-time
- 🎭 **Amplop misteri** — efek dinamis per ronde (merah/kuning/hijau)
- 🔒 **Password gate** — akses aman via signed cookie
- 💾 **Volatile-safe** — Railway ephemeral FS aman (auto-flush snapshot)
- 📺 **Display mode** — untuk TV/proyektor (read-only spectator)

---

## 🚀 Quick Start

### Untuk Pemain (Youth)

1. Buka `https://youthgame-palinggayeng-punkora.up.railway.app/`
2. Masukkan password: **`PalingGayeng2026`**
3. Masukkan nama + role (player/moderator)
4. Masukkan room code (dari moderator)
5. Main!

### Untuk Moderator

1. Login sebagai moderator
2. Pilih tier (Pemula/Menengah/Mahir)
3. Generate room code
4. Share code ke pemain
5. Klik "Mulai Ronde 1"
6. Kontrol flow ronde (baca → diskusi → voting → reveal)
7. Lanjut ke ronde berikutnya

### Untuk Penonton

1. Buka `https://youthgame-palinggayeng-punkora.up.railway.app/display`
2. Tonton live state tanpa login

---

## 📚 Dokumentasi

| Dokumen | Isi |
|---|---|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Tech stack, alur game, design patterns |
| [DATABASE.md](./DATABASE.md) | Schema SQLite + relasi + persistence strategy |
| [FRONTEND.md](./FRONTEND.md) | Design system, halaman, komponen, animasi |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | File structure, dependencies, coding conventions |
| [PROVISIONING.md](./PROVISIONING.md) | Deploy guide Railway + env vars |
| [ROUTING.md](./ROUTING.md) | URL paths + Socket.io events + access control |
| [SEEDER.md](./SEEDER.md) | Initial data + fragmen bank + kitab matrix |
| [SEEDER-UI-SYNC-RULE.md](./SEEDER-UI-SYNC-RULE.md) | Aturan sync data ↔ UI |
| [QA-TEST-REPORT.md](./QA-TEST-REPORT.md) | Manual testing checklist + acceptance criteria |
| [E2E-TEST-REPORT.md](./E2E-TEST-REPORT.md) | Hasil E2E testing lengkap |
| [TEMPLATE-BUILD-LESSONS-LEARNED.md](./TEMPLATE-BUILD-LESSONS-LEARNED.md) | Build retrospective + ide "wow" untuk evolusi |

---

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| **Backend** | Node.js 20 + Express 4 + Socket.io 4 |
| **Database** | SQLite (better-sqlite3) + JSON snapshot |
| **Frontend** | Vanilla HTML + Tailwind CSS (CDN) + vanilla JS |
| **AI** | Google Gemini 2.5 Flash (multi-key round-robin) |
| **Deploy** | Railway.app dengan persistent volume |
| **Auth** | Password gate (bcrypt) + signed cookie |

---

## 🎯 Cara Main (Ringkas)

### Setup
1. Moderator create room → dapat kode 6 karakter
2. 3-8 pemain join pakai kode

### Per Ronde (3-4 menit)
1. **Pembacaan (1 min):** Tiap pemain baca fragmen keras-keras
2. **Diskusi (4 min):** Bebas bicara, max 3 pertanyaan Y/T ke moderator
3. **Voting (30 sec):** Vote 1 pemain yang "paling beda"
4. **Reveal:** Yang divote buka 1 amplop misteri, efek dinamis

### Scoring
- Agen kena vote: Pembawa +5, Agen -10
- Agen tidak kena: Pembawa +2, Agen +10
- 5 ronde total, skor agregat di akhir

---

## 🔐 Default Credentials

- **Password:** `PalingGayeng2026` (ganti di Railway env vars: `PASSWORD`)
- **Cookie secret:** Auto-generate on first boot (atau set manual: `COOKIE_SECRET`)

---

## 📦 Project Structure

```
surat-terakhir/
├── server.js              # Express + Socket.io main server
├── package.json           # Dependencies
├── railway.json           # Railway config
├── public/                # Static frontend
│   ├── index.html         # Welcome + login
│   ├── moderator.html     # Moderator dashboard
│   ├── player.html        # Mobile game UI
│   ├── display.html       # TV/projector display
│   ├── css/styles.css     # Custom styles
│   └── js/                # Client logic
├── data/                  # Persistent storage (Railway volume)
│   ├── config.json        # Password, AI keys
│   ├── fragmen.json       # Initial 60+ fragmen
│   ├── snapshot.json      # Volatile-safe backup (auto)
│   └── db/                # SQLite files
├── scripts/               # CLI tools
│   ├── seed.js            # Initial data seeder
│   └── verify.js          # Health check
└── *.md                   # 12 documentation files
```

---

## 🤝 Contributing

Saat ini v1.0.0 MVP. Ide-ide evolusi ada di [TEMPLATE-BUILD-LESSONS-LEARNED.md](./TEMPLATE-BUILD-LESSONS-LEARNED.md#4-ide-wow-untuk-evolusi).

Top priorities:
- Theme customization (logo + color gereja)
- Custom kitab packs (Natal, Paskah)
- Achievement system
- AI moderator mode

---

## 📄 License

MIT

---

## 🙏 Credits

Dibuat dengan ❤️ untuk pemuda gereja Indonesia.
Tema Alkitab: TB (Terjemahan Baru), dengan modifikasi parafrase untuk variasi.

---

**v1.0.0** — siap untuk acara Youth Church
