# ARCHITECTURE — Surat Terakhir (Pembawa Surat)

> Game Bible-themed social deduction untuk acara Youth Church.
> Multi-device real-time party game. Mobile-first. AI-augmented.

---

## 1. VISI PRODUK

**Surat Terakhir** adalah game social deduction ringan dengan nuansa Alkitab yang mengasyikkan untuk acara pemuda gereja. Setiap pemain berperan sebagai **"Pembawa Surat"** yang membawa fragmen ayat Alkitab. Mayoritas memegang fragmen dari kitab yang **sama** (surat target), sementara 1-2 pemain adalah **"Agen Terselubung"** yang memegang fragmen dari kitab berbeda. Tugas pemain: mendeteksi siapa yang nyasar, lewat diskusi, voting, dan insting gaya bahasa.

**Prinsip desain:**

- **Inklusif:** tidak ada "yang mati/tereliminasi". Yang divote hanya kehilangan "kartu amplop" — tetap main.
- **Edukatif:** pemain belajar gaya bahasa kitab Alkitab (Mazmur, Amsal, Injil, Surat Paulus) sambil bermain.
- **Tanpa폭력:** tema "pengkhianat" diganti "agen dengan konteks berbeda" — tidak glorify kecurangan.
- **Mobile-first:** dioptimasi untuk HP karena pemain youth pakai HP mereka sendiri.

---

## 2. TECH STACK

| Layer | Pilihan | Alasan |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Stabil, Railway-native, ekosistem Socket.io matang |
| **HTTP** | Express 4 | Minimal, battle-tested |
| **Realtime** | Socket.io 4 | Auto-fallback ke long-polling, dukungan mobile kuat |
| **Database** | SQLite via `better-sqlite3` | Synchronous, no setup, file-based, fast untuk skala kecil-menengah |
| **Frontend** | Vanilla HTML + Tailwind (CDN) + vanilla JS | Tidak perlu build step, ringan di HP |
| **AI** | Google Gemini 2.5 Flash (free tier) | Latest model, lebih pintar, 60 req/menit, kualitas tinggi untuk generasi fragmen |
| **Multi-key** | Round-robin dengan token bucket per key | Handle quota, failover otomatis |
| **Persistent state** | SQLite + JSON snapshot di `data/` | Volatile-safe untuk Railway ephemeral FS |
| **Auth** | Simple password gate via signed cookie | Tidak perlu OAuth, cukup untuk party game |
| **Static serve** | Express `express.static` | Frontend served oleh backend yang sama |

---

## 3. ARSITEKTUR SISTEM

```
┌──────────────────────────────────────────────────────────────┐
│                        BROWSER (HP)                          │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐│
│  │ index.html │  │moderator   │  │  player    │  │ display  ││
│  │ (welcome + │  │  .html     │  │  .html     │  │  .html   ││
│  │  password) │  │ (dashboard)│  │ (gameplay) │  │ (spectator││
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘│
│        │               │               │              │     │
│        └───────────────┴───────────────┴──────────────┘     │
│                              │                              │
│              HTTP + WebSocket (Socket.io client)            │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  NODE.JS SERVER (Railway)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Express HTTP server                                    │ │
│  │ ├─ GET  /            → public/index.html              │ │
│  │ ├─ GET  /moderator   → public/moderator.html          │ │
│  │ ├─ GET  /player      → public/player.html             │ │
│  │ ├─ GET  /display     → public/display.html            │ │
│  │ ├─ POST /api/auth    → set signed cookie              │ │
│  │ ├─ POST /api/logout  → clear cookie                   │ │
│  │ ├─ GET  /api/health  → health check                   │ │
│  │ └─ GET  /api/fragmen/stats → fragmen counters        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Socket.io (real-time event bus)                        │ │
│  │ ├─ player:join / player:leave                        │ │
│  │ ├─ game:create / game:start / game:next              │ │
│  │ ├─ fragmen:distribute                                │ │
│  │ ├─ vote:cast / vote:result                           │ │
│  │ ├─ mystery:open                                     │ │
│  │ └─ chat:broadcast (moderator announcement)          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Service layer (pure logic, no I/O langsung)           │ │
│  │ ├─ GameService    — orchestration ronde, scoring      │ │
│  │ ├─ FragmenService — pick, mark used, validate unik   │ │
│  │ ├─ AIService      — round-robin Gemini, retry, cache │ │
│  │ ├─ AuthService    — bcrypt compare, signed cookie    │ │
│  │ └─ PersistenceService — SQLite + JSON fallback       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Data layer                                             │ │
│  │ ├─ SQLite (data/db/surat-terakhir.sqlite)             │ │
│  │ │  • sessions   • players   • games   • fragmen_used  │ │
│  │ ├─ JSON snapshot (data/snapshot.json) — backup        │ │
│  │ ├─ Config (data/config.json) — password, AI keys     │ │
│  │ └─ Fragmen bank (data/fragmen.json) — seed initial    │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  EXTERNAL: Google Gemini API                 │
│                  (round-robin across N keys)                 │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. ALUR GAME END-TO-END

```
[1] MODERATOR BUKA DASHBOARD
    └─> Input password (PalingGayeng2026) → cookie session
    └─> Dashboard tampil: pilih tier (Pemula/Menengah/Mahir)
    └─> Klik "Mulai Sesi" → sistem generate room code (6 char)

[2] PEMAIN JOIN
    └─> Buka /player → input password → input room code → input nama
    └─> Socket.io "player:join" → server catat di DB
    └─> Moderator lihat live player list

[3] MODERATOR KLIK "MULAI RONDE 1"
    └─> Server: FragmenService.pick(kitab=Ronde1.target, count=6)
    └─> Acak distribusi (server-side random):
        • 4 Pembawa dapat fragmen kitab target (mis: Mazmur)
        • 1 Pembawa dapat fragmen kitab abu-abu (mis: Amsal)
        • 1 Agen dapat fragmen kitab agen (mis: Kidung Agung)
    └─> Push fragmen via Socket.io ke tiap HP
    └─> Tiap HP tampil: fragmen + 3 amplop misteri (warna random)
    └─> Timer Fase Pembacaan mulai (1 menit)

[4] FASE PEMBACAAN
    └─> Tiap pemain BACA fragmennya keras-keras (bergantian)
    └─> Tidak boleh diskusi
    └─> Timer beep saat habis

[5] FASE DISKUSI
    └─> Bebas bicara, 3 pertanyaan Y/T ke moderator (cap per pemain)
    └─> Moderator bisa buka "pertanyaan tersimpan" (Tier 1/2/3)
    └─> Timer 4 menit

[6] FASE VOTING
    └─> Tiap pemain vote 1 pemain (dropdown di HP)
    └─> Server kumpulkan, hitung suara
    └─> Yang paling banyak di-vote = "koreksi ronde ini"

[7] FASE KOREKSI
    └─> Yang dikoreksi pilih 1 amplop misteri untuk dibuka
    └─> Server random pilih 1 dari 3 → push reveal ke semua
    └─> Arti warna amplop = dinamis per ronde (lihat MODERATOR-DASHBOARD)
    └─> Server hitung skor ronde:
        • Agen kena vote: Pembawa +5, Agen -10
        • Agen tidak kena: Pembawa +2, Agen +10
        • Amplop Merah bocor: identitas agen terungkap
        • Amplop Kuning: bonus info untuk player
        • Amplop Hijau: safe (no effect)
    └─> Fragmen ditandai "used" → tidak akan muncul lagi

[8] RONDE SELANJUTNYA
    └─> Fragmen BARU dari kitab berbeda (5 ronde total)
    └─> Agen diacak ulang (orang berbeda bisa jadi agen tiap ronde)
    └─> Loop ke Step 3

[9] ENDGAME
    └─> Setelah 5 ronde: tampil leaderboard
    └─> Refleksi rohani (2 menit, bacaan di moderator dashboard)
    └─> Sesi bisa di-restart tanpa reload page
```

---

## 5. SKENARIO PENGGUNAAN

| Persona | Tujuan | Halaman |
|---|---|---|
| **Moderator** (1 orang) | Mengontrol sesi, pilih tier, lihat score, handle AI gen | `/moderator` |
| **Pemain** (5-8 orang) | Baca fragmen, diskusi, vote | `/player` |
| **Penonton** (0-10 orang) | Nonton live state tanpa partisipasi | `/display` |
| **Tamu** (belum login) | Lihat welcome + login | `/` |

---

## 6. ATURAN BISNIS KRITIS

1. **Fragmen tidak pernah重复.** Service `FragmenService.markUsed()` wajib dipanggil SETIAP fragmen yang ditampilkan. Sync ke SQLite + JSON snapshot.
2. **Pemain boleh quit & rejoin** dengan session ID yang sama. Fragmen di-restore dari snapshot server.
3. **Auto-generate AI** trigger kalau fragmen available di kitab target < `threshold` (default 3). Beri notifikasi ke moderator.
4. **Manual generate** via tombol di dashboard. Moderator bisa pilih kitab + tema + jumlah.
5. **Round-robin API key** — kalau satu key kena 429, pindah ke key berikutnya. Circuit breaker pattern.
6. **Session state persistent** — kalau Railway redeploy, state dipulihkan dari `data/snapshot.json` (terakhir flush).

---

## 7. KEAMANAN DASAR

- **Password gate** dengan bcrypt hash di `config.json`. Signed cookie (`httpOnly`, `sameSite=lax`).
- **Rate limit** untuk endpoint auth (5 percobaan / 5 menit per IP).
- **Sanitize input** untuk nama pemain (max 20 char, strip HTML, no emoji berlebihan).
- **CORS** — allow semua origin (game public) tapi validasi origin di Socket.io handshake.
- **AI prompt injection** — sanitasi input tema dari moderator sebelum dikirim ke Gemini.

---

## 8. KETERBATASAN YANG DISADARI

- **SQLite bukan untuk multi-replica.** Railway free tier = 1 instance, OK. Kalau scale up, migrasi ke Postgres.
- **File system volatile.** Snapshot JSON jadi backup utama. State kritis di-flush tiap 30 detik.
- **WebSocket di balik proxy** — Railway auto-handle, tapi untuk self-host perlu konfigurasi sticky session.
- **AI quota** — 5 Gemini keys × 60 req/min = 300 req/min. Cukup untuk 50 ronde.

---

## 9. ROADMAP EVOLUSI (Future Wow Ideas)

Lihat `TEMPLATE-BUILD-LESSONS-LEARNED.md` untuk ide-ide pengembangan lanjutan yang ditemukan selama build.

---

## 10. GLOSARIUM

| Istilah | Arti |
|---|---|
| **Pembawa** | Pemain mayoritas yang pegang fragmen kitab target |
| **Agen** | Pemain minoritas yang pegang fragmen kitab berbeda |
| **Kitab Target** | Kitab yang jadi "jawaban benar" ronde itu |
| **Kitab Abu-abu** | Kitab yang pegang 1 pemain (bukan mayoritas, bukan agen) |
| **Amplop Misteri** | 3 kertas warna (merah/kuning/hijau) yang efeknya dinamis per ronde |
| **Koreksi** | Aksi yang divote untuk membuka 1 amplop misteri |
| **Fragmen** | Potongan ayat Alkitab yang dipegang tiap pemain |
| **Tier** | Tingkat kesulitan pertanyaan diskusi (1=pemula, 3=mahir) |
| **Room** | Sesi game dengan kode 6 karakter |

---

*Dibuat otomatis oleh build pipeline. Update bersamaan dengan perubahan kode.*
