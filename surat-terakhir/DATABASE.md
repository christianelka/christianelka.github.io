# DATABASE — Surat Terakhir

> Skema SQLite + relasi + strategi persistence untuk Railway ephemeral FS.

---

## 1. SQLite Schema

File: `data/db/surat-terakhir.sqlite`

### Tabel `config`

```sql
CREATE TABLE config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

Single-row storage untuk runtime config yang bisa berubah tanpa redeploy.

| key | value (contoh) | deskripsi |
|---|---|---|
| `current_room_code` | `PUNK26` | Room code sesi yang sedang berjalan |
| `current_tier` | `2` | Tier diskusi aktif (1/2/3) |
| `current_round` | `1` | Ronde aktif |
| `current_kitab_target` | `Mazmur` | Kitab target ronde aktif |
| `game_status` | `lobby` | `lobby` / `playing` / `paused` / `ended` |
| `started_at` | `1719000000000` | Epoch ms |

### Tabel `fragmen_bank`

```sql
CREATE TABLE fragmen_bank (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  kitab         TEXT    NOT NULL,
  tema          TEXT    NOT NULL,
  teks          TEXT    NOT NULL,
  gaya_bahasa   TEXT    NOT NULL,   -- puitis | naratif | argumentatif | pastoral | profetis
  sumber        TEXT    NOT NULL DEFAULT 'seed',  -- 'seed' | 'ai'
  created_at    INTEGER NOT NULL,
  is_active     INTEGER NOT NULL DEFAULT 1,
  UNIQUE(kitab, teks)
);

CREATE INDEX idx_fragmen_kitab_active ON fragmen_bank(kitab, is_active);
CREATE INDEX idx_fragmen_tema         ON fragmen_bank(tema);
```

| kolom | tipe | catatan |
|---|---|---|
| `id` | INTEGER PK | auto-increment |
| `kitab` | TEXT | nama kitab (Mazmur, Amsal, dst) |
| `tema` | TEXT | tema sentral fragmen |
| `teks` | TEXT | isi fragmen (3-15 kata) |
| `gaya_bahasa` | TEXT | puitis/naratif/argumentatif/pastoral/profetis |
| `sumber` | TEXT | `seed` (manual) atau `ai` (digenerate) |
| `created_at` | INTEGER | epoch ms saat ditambah |
| `is_active` | INTEGER | 1 = aktif, 0 = soft-delete (kalau ada fragmen yang controversial) |

### Tabel `fragmen_used`

```sql
CREATE TABLE fragmen_used (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  fragmen_id   INTEGER NOT NULL,
  session_id   TEXT    NOT NULL,   -- room code sesi
  round_number INTEGER NOT NULL,
  player_name  TEXT    NOT NULL,
  used_at      INTEGER NOT NULL,
  FOREIGN KEY (fragmen_id) REFERENCES fragmen_bank(id),
  UNIQUE(fragmen_id, session_id)  -- 1 fragmen max 1x per sesi
);

CREATE INDEX idx_used_session ON fragmen_used(session_id);
CREATE INDEX idx_used_round   ON fragmen_used(session_id, round_number);
```

**Aturan bisnis:** 1 fragmen TIDAK BOLEH dipakai 2x dalam sesi yang sama. Kalau sesi baru (room code baru), fragmen boleh dipakai lagi.

### Tabel `players`

```sql
CREATE TABLE players (
  id           TEXT    PRIMARY KEY,   -- socket id
  session_id   TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  role         TEXT    NOT NULL DEFAULT 'pembawa',  -- pembawa | agen | abu-abu
  team         TEXT,                              -- optional, untuk mode tim
  joined_at    INTEGER NOT NULL,
  last_seen    INTEGER NOT NULL,
  is_connected INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_players_session ON players(session_id);
```

### Tabel `games`

```sql
CREATE TABLE games (
  id             TEXT    PRIMARY KEY,   -- room code 6 char
  tier           INTEGER NOT NULL,
  total_rounds   INTEGER NOT NULL DEFAULT 5,
  current_round  INTEGER NOT NULL DEFAULT 0,
  status         TEXT    NOT NULL DEFAULT 'lobby',  -- lobby | playing | ended
  created_by     TEXT,                              -- moderator name/IP
  started_at     INTEGER,
  ended_at       INTEGER,
  winner_team    TEXT,                              -- 'pembawa' | 'agen' | null
  total_score_pembawa INTEGER NOT NULL DEFAULT 0,
  total_score_agen     INTEGER NOT NULL DEFAULT 0
);
```

### Tabel `rounds`

```sql
CREATE TABLE rounds (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id         TEXT    NOT NULL,
  round_number    INTEGER NOT NULL,
  kitab_target    TEXT    NOT NULL,
  kitab_abu       TEXT,
  kitab_agen      TEXT    NOT NULL,
  distrib_data    TEXT    NOT NULL,  -- JSON: {playerName: fragmenId}
  mystery_data    TEXT    NOT NULL,  -- JSON: {playerName: [color1, color2, color3]}
  opened_mystery  TEXT,             -- JSON: {playerName: color}
  vote_data       TEXT,             -- JSON: {voterName: targetName}
  result          TEXT,             -- 'pembawa_win' | 'agen_win' | 'abu_win'
  score_pembawa   INTEGER NOT NULL DEFAULT 0,
  score_agen      INTEGER NOT NULL DEFAULT 0,
  started_at      INTEGER,
  ended_at        INTEGER,
  FOREIGN KEY (game_id) REFERENCES games(id),
  UNIQUE(game_id, round_number)
);

CREATE INDEX idx_rounds_game ON rounds(game_id);
```

### Tabel `ai_generation_log`

```sql
CREATE TABLE ai_generation_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  kitab       TEXT    NOT NULL,
  tema        TEXT    NOT NULL,
  prompt      TEXT    NOT NULL,
  response    TEXT    NOT NULL,
  api_key_idx INTEGER NOT NULL,
  status      TEXT    NOT NULL,  -- 'success' | 'rate_limited' | 'error' | 'invalid'
  created_at  INTEGER NOT NULL
);

CREATE INDEX idx_ai_log_created ON ai_generation_log(created_at);
```

Tracking penggunaan API key + debugging kalau ada error.

---

## 2. RELASI ANTAR TABEL

```
games (1) ──< (N) rounds
games (1) ──< (N) players
rounds (1) ──< (N) fragmen_used
fragmen_bank (1) ──< (N) fragmen_used
```

---

## 3. JSON SNAPSHOT (Volatile-Safe Backup)

File: `data/snapshot.json`

Di-flush setiap 30 detik + setiap event kritis (end of round, AI gen, dll).

```json
{
  "version": "1.0.0",
  "flushed_at": 1719000000000,
  "config": { ... },
  "active_game": { ... },
  "current_round": { ... },
  "players": [...],
  "fragmen_used_ids": [1, 5, 12, 27, ...],
  "scoreboard": { "pembawa": 45, "agen": 30 }
}
```

**Strategi restore saat Railway restart:**

1. Cek `data/snapshot.json` exists → load ke memory
2. Sync SQLite dari snapshot (insert/update)
3. Lanjut dari state terakhir

---

## 4. SEEDER INITIAL DATA

Lihat `SEEDER.md` untuk strategi seed.

---

## 5. INDEX UNTUK PERFORMA

| Query | Index yang digunakan |
|---|---|
| `SELECT * FROM fragmen_bank WHERE kitab = ? AND is_active = 1 ORDER BY RANDOM() LIMIT 6` | `idx_fragmen_kitab_active` |
| `SELECT * FROM fragmen_used WHERE session_id = ?` | `idx_used_session` |
| `SELECT * FROM players WHERE session_id = ? AND is_connected = 1` | `idx_players_session` |
| `SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number` | `idx_rounds_game` |
| `SELECT * FROM ai_generation_log ORDER BY created_at DESC LIMIT 50` | `idx_ai_log_created` |

---

## 6. MIGRATIONS

Versi schema disimpan di `config` table dengan key `schema_version`. Saat startup, server cek dan run migration kalau perlu.

| Version | Perubahan |
|---|---|
| 1.0.0 | Initial schema (semua tabel di atas) |

---

## 7. BACKUP & CLEANUP

- **Auto-backup:** snapshot JSON setiap 30 detik.
- **Manual backup:** moderator bisa trigger "Export Session" → download JSON.
- **Auto-cleanup:** session > 24 jam otomatis di-archive (move ke tabel `archive_games`).
- **Retention:** fragmen_used di-keep selama 30 hari untuk analytics.

---

## 8. PRIVACY & DATA

- **Nama pemain** disimpan plain text (untuk display). Bisa di-hash kalau perlu GDPR compliance.
- **IP address** tidak disimpan permanen (cuma untuk rate limit, di-memory).
- **Fragmen AI-generated** disimpan di `fragmen_bank` untuk reuse (efisiensi quota).
- **Export user request:** moderator bisa download semua data sesi dalam JSON.

---

*Dibuat otomatis oleh build pipeline.*
