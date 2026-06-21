# PROVISIONING — Surat Terakhir

> Deploy guide untuk Railway. Environment variables, secrets, CI/CD.

---

## 1. OVERVIEW

**Target deployment:** Railway.app
**Repo:** `christianelka/christianelka.github.io` (sudah di-connect ke Railway)
**Subdirectory:** `surat-terakhir/`
**Auto-deploy:** setiap push ke branch `master` / `main`

---

## 2. RAILWAY PROJECT SETUP

### 2.1 Create Project

1. Login ke [railway.app](https://railway.app)
2. Klik **New Project** → **Deploy from GitHub repo**
3. Pilih repo: `christianelka/christianelka.github.io`
4. **Root Directory:** set ke `surat-terakhir` (bukan root repo)
5. Railway akan detect Node.js otomatis

### 2.2 Build Configuration

File `railway.json` (sudah di-include di project):

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### 2.3 Custom Domain (Optional)

1. Klik project → **Settings** → **Domains**
2. Railway kasih default: `youthgame-palinggayeng-punkora.up.railway.app`
3. Custom domain (jika ada): tambah di **Custom Domain** field

---

## 3. ENVIRONMENT VARIABLES

Set di **Railway Dashboard** → **Variables** tab.

### 3.1 Required

| Variable | Value | Contoh | Sensitive? |
|---|---|---|---|
| `NODE_ENV` | `production` | `production` | No |
| `PORT` | Auto-set by Railway | `3000` (default) | No |
| `PASSWORD` | `PalingGayeng2026` | (sama dengan config.json) | YES |
| `GEMINI_API_KEYS` | Comma-separated API keys | `key1,key2,key3,key4,key5` | YES |
| `COOKIE_SECRET` | Random 32+ char | `abc123xyz789...` (generate) | YES |

### 3.2 Optional (dengan default)

| Variable | Default | Description |
|---|---|---|
| `AI_GENERATION_ENABLED` | `true` | Set `false` untuk disable AI |
| `AI_GENERATION_THRESHOLD` | `3` | Trigger auto-gen kalau fragmen < N |
| `AI_GENERATION_TIMEOUT_MS` | `30000` | Timeout per AI request |
| `SNAPSHOT_INTERVAL_MS` | `30000` | Flush interval (30s) |
| `MAX_PLAYERS_PER_ROOM` | `12` | Batas pemain per room |
| `ROUND_DURATION_BACA_S` | `60` | Durasi fase baca |
| `ROUND_DURATION_DISKUSI_S` | `240` | Durasi fase diskusi |
| `ROUND_DURATION_VOTING_S` | `30` | Durasi fase voting |
| `RATE_LIMIT_AUTH_MAX` | `5` | Max percobaan auth per window |
| `RATE_LIMIT_AUTH_WINDOW_MS` | `300000` | 5 menit |
| `LOG_LEVEL` | `info` | `debug` / `info` / `warn` / `error` |
| `PUBLIC_URL` | Auto-detect | Override jika perlu |

### 3.3 How to Set in Railway

**Via Dashboard:**
1. Klik project → tab **Variables**
2. Klik **+ New Variable**
3. Masukkan name + value
4. Klik **Add**

**Via CLI:**
```bash
railway variables set PASSWORD=PalingGayeng2026
railway variables set GEMINI_API_KEYS=key1,key2,key3
```

---

## 4. SECRETS MANAGEMENT

### 4.1 Gemini API Keys

**Dapatkan dari:** https://aistudio.google.com/app/apikey

1. Login ke Google AI Studio
2. Klik **Get API Key** → **Create API Key**
3. Copy key
4. Untuk **multi-key** (recommended untuk high quota):
   - Buat 3-5 akun Google (atau pakai workspace)
   - Generate 1 key per akun
   - Paste semua ke Railway (comma-separated)

**Free tier Gemini 2.5 Flash:**
- 60 requests per minute per key
- 1500 requests per day per key
- 1 million tokens per minute per key

**5 keys × 60 rpm = 300 req/menit (cukup untuk 50+ ronde paralel)**

### 4.2 Generate Cookie Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Output contoh: `a3f4b2c1d5e6f7...` (64 char hex)

Set di Railway sebagai `COOKIE_SECRET`.

### 4.3 Password Hashing

Password di-hash pakai bcrypt saat pertama kali server boot (kalau belum di-hash di config.json).

Atau set manual di `data/config.json`:
```json
{
  "password_hash": "$2a$10$..."  // bcrypt hash
}
```

Generate hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('PalingGayeng2026', 10))"
```

---

## 5. PERSISTENT STORAGE (Volatile-Safe)

### 5.1 Railway Ephemeral Filesystem

**Problem:** Setiap deploy/redeploy, file system di-reset. SQLite DB dan snapshot JSON akan hilang.

**Solution:** Pakai **Railway Volume** untuk persistent storage.

### 5.2 Setup Volume

1. Klik project di Railway → **+ New** → **Volume**
2. Mount path: `/app/data`
3. Size: minimal 1 GB (cukup untuk ribuan fragmen + log)
4. Klik **Create**

**Atau via `railway.toml` di root project:**
```toml
[deploy]
mount = "/app/data"
```

### 5.3 Verify Mount

Setelah deploy, cek di Railway Shell:
```bash
ls -la /app/data/
# Harus ada: config.json, fragmen.json, db/, snapshot.json
```

### 5.4 Data Flow

```
┌─────────────────────────────────┐
│ /app/data/  (persistent volume) │
│ ├─ config.json                  │
│ ├─ fragmen.json                 │
│ ├─ snapshot.json                │
│ └─ db/                          │
│    └─ surat-terakhir.sqlite     │
└─────────────────────────────────┘
         ▲
         │ read/write
         │
┌─────────────────────────────────┐
│ /app/server.js (ephemeral)      │
│  - buka file, write/read        │
│  - flush snapshot setiap 30s    │
│  - log semua perubahan ke JSON  │
└─────────────────────────────────┘
```

---

## 6. CI/CD

### 6.1 Auto-Deploy (Default)

Setiap `git push` ke branch `master`/`main` → Railway auto-detect → rebuild → deploy.

**Setup di Railway:**
- Settings → **Source** → Branch: `master`
- Settings → **Source** → **Auto Deploy**: ON

### 6.2 Manual Deploy (Fallback)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd surat-terakhir
railway up
```

### 6.3 Health Check

Endpoint: `GET /api/health`

Response:
```json
{
  "status": "ok",
  "uptime": 12345,
  "rooms": 0,
  "players": 0,
  "fragmen_total": 60,
  "fragmen_used_today": 5,
  "ai_keys_active": 5,
  "version": "1.0.0"
}
```

Railway health check akan ping endpoint ini tiap 30 detik. Kalau 3x gagal, auto-restart.

---

## 7. MONITORING

### 7.1 Logs

Lihat di Railway Dashboard → **Deployments** → klik deployment → **View Logs**.

Filter by:
- `[ERROR]` untuk error
- `[WARN]` untuk warning
- `[INFO]` untuk info normal

### 7.2 Custom Metrics (TODO: optional)

Bisa tambah Prometheus exporter atau pakai Railway Metrics (built-in).

### 7.3 Error Tracking (Optional, future)

Integrate Sentry:
```bash
npm install @sentry/node
```

---

## 8. SCALING

### 8.1 Free Tier Limits

- **RAM:** 512 MB
- **CPU:** shared
- **Ephemeral disk:** 1 GB
- **Persistent volume:** included
- **Bandwidth:** 100 GB/bulan
- **Build minutes:** 500/bulan

### 8.2 Upgrade Path

Kalau traffic naik:
- **Hobby plan ($5/mo):** 8 GB RAM, 8 CPU, no sleep
- **Pro plan ($20/mo):** 32 GB RAM, custom domain included

### 8.3 Multi-Instance (Not Yet)

Saat ini **1 instance only** (SQLite). Untuk scale horizontal, perlu migrasi ke Postgres. Lihat roadmap.

---

## 9. DISASTER RECOVERY

### 9.1 Backup Manual

```bash
# Via Railway CLI
railway run tar -czf /tmp/backup-$(date +%Y%m%d).tar.gz /app/data/
railway run cat /tmp/backup-*.tar.gz > backup.tar.gz
```

### 9.2 Restore

```bash
# Extract ke volume
railway run tar -xzf /tmp/backup.tar.gz -C /app/data/
```

### 9.3 Data Loss Scenarios

| Scenario | Recovery |
|---|---|
| Railway restart (no deploy) | Snapshot JSON auto-flush, loaded on boot |
| Railway deploy (with volume) | Data persists, no action needed |
| Volume corrupt / lost | Seed ulang dari `data/fragmen.json` (shipped in repo) |
| Snapshot corrupt | Fallback to SQLite only, continue |

---

## 10. SECURITY CHECKLIST

- [x] Password di-hash (bcrypt)
- [x] Signed cookie (`httpOnly`, `sameSite=lax`)
- [x] Helmet middleware (security headers)
- [x] Rate limit pada auth endpoint
- [x] Input sanitization
- [x] CORS configured
- [x] No secrets in git (.env in .gitignore)
- [x] AI API keys in env, not in code
- [x] SQL parameterized (no injection)
- [x] CSP header (via helmet)

---

## 11. POST-DEPLOY CHECKLIST

Setelah Railway deploy sukses, jalankan ini:

```bash
# 1. Health check
curl https://youthgame-palinggayeng-punkora.up.railway.app/api/health

# 2. Welcome page
curl -I https://youthgame-palinggayeng-punkora.up.railway.app/

# 3. Open in browser
# → https://youthgame-palinggayeng-punkora.up.railway.app/
# → Test password: PalingGayeng2026

# 4. Moderator dashboard
# → https://youthgame-palinggayeng-punkora.up.railway.app/moderator

# 5. Player page (different browser/HP)
# → https://youthgame-palinggayeng-punkora.up.railway.app/player
```

---

*Dibuat otomatis oleh build pipeline.*
