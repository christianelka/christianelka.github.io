# IMPLEMENTATION — Surat Terakhir

> File structure, dependencies, coding conventions, build steps.

---

## 1. FILE STRUCTURE FINAL

```
surat-terakhir/
├── server.js                       # Express + Socket.io main server
├── package.json                    # Dependencies
├── package-lock.json               # (auto-generated)
├── railway.json                    # Railway deploy config
├── .env.example                    # Template env vars
├── .gitignore
├── README.md                       # Overview
├── ARCHITECTURE.md                 # System architecture
├── DATABASE.md                     # DB schema
├── E2E-TEST-REPORT.md              # E2E test results (filled after testing)
├── FRONTEND.md                     # UI/UX spec
├── IMPLEMENTATION.md               # ← you are here
├── PROVISIONING.md                 # Deploy guide
├── QA-TEST-REPORT.md               # QA checklist + results
├── ROUTING.md                      # URL paths
├── SEEDER.md                       # Seed data spec
├── SEEDER-UI-SYNC-RULE.md          # Data ↔ UI sync rules
├── TEMPLATE-BUILD-LESSONS-LEARNED.md  # Build retrospective
│
├── data/
│   ├── config.json                 # Password, AI keys, settings
│   ├── fragmen.json                # Initial 60+ fragmen (seed)
│   ├── snapshot.json               # Volatile-safe backup (auto-generated)
│   └── db/
│       └── surat-terakhir.sqlite   # SQLite file (auto-generated)
│
├── public/
│   ├── index.html                  # Welcome + password
│   ├── moderator.html              # Moderator dashboard
│   ├── player.html                 # Mobile game UI
│   ├── display.html                # TV/projector display
│   ├── css/
│   │   └── styles.css              # Custom styles (Tailwind via CDN)
│   ├── js/
│   │   ├── common.js               # Shared utilities
│   │   ├── moderator.js            # Moderator logic
│   │   ├── player.js               # Player logic
│   │   └── display.js              # Display logic
│   └── assets/
│       └── (icons via CDN)
│
└── scripts/
    ├── seed.js                     # Initial data seeder
    ├── generate-fragmen.js         # CLI tool for AI generation
    └── verify.js                   # Health check script
```

---

## 2. DEPENDENCIES (`package.json`)

### Production
| Package | Version | Purpose |
|---|---|---|
| `express` | ^4.19.2 | HTTP server, routing, static serve |
| `socket.io` | ^4.7.5 | WebSocket realtime |
| `better-sqlite3` | ^11.3.0 | Synchronous SQLite client |
| `bcryptjs` | ^2.4.3 | Password hashing (pure JS, no native deps) |
| `cookie-parser` | ^1.4.6 | Parse signed cookies |
| `cookie-signature` | ^1.2.1 | Sign cookies |
| `dotenv` | ^16.4.5 | Load .env files |
| `express-rate-limit` | ^7.4.0 | Rate limit middleware |
| `helmet` | ^7.1.0 | Security headers |
| `nanoid` | ^5.0.7 | Random ID generation (room code, etc) |

### Development
| Package | Version | Purpose |
|---|---|---|
| `nodemon` | ^3.1.0 | Auto-restart on file change |

### Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seed.js",
    "generate": "node scripts/generate-fragmen.js",
    "verify": "node scripts/verify.js"
  }
}
```

---

## 3. CODING CONVENTIONS

### 3.1 JavaScript Style

- **ES Modules** (`import` / `export`), Node.js 20 native support
- **2 spaces** indent
- **Single quotes** untuk string
- **Semicolons** required
- **Arrow functions** preferred untuk inline, **regular functions** untuk methods
- **const** by default, **let** kalau perlu reassign, **no var**
- **JSDoc** untuk public functions (no TypeScript, tapi kasih type hints via JSDoc)

### 3.2 Naming

| Type | Convention | Example |
|---|---|---|
| Variable | camelCase | `currentRound` |
| Constant | UPPER_SNAKE | `MAX_PLAYERS` |
| Function | camelCase, verb-first | `getFragmenById()` |
| Class | PascalCase | `FragmenService` |
| File (JS) | kebab-case | `fragmen-service.js` |
| File (route) | kebab-case | `auth-routes.js` |
| DB column | snake_case | `fragmen_id` |
| JSON field | snake_case | `created_at` |
| CSS class | kebab-case | `glass-card` |
| HTML id | kebab-case | `player-name` |

### 3.3 Error Handling

```js
// Custom error classes
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Async wrapper (catch errors automatically)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/api/players', asyncHandler(async (req, res) => {
  const players = await playerService.list();
  res.json({ success: true, data: players });
}));

// Centralized error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  console.error(`[${err.code}] ${err.message}`, err.stack);
  res.status(status).json({
    success: false,
    error: { code: err.code, message: err.message }
  });
});
```

### 3.4 Logging

```js
// Levels: ERROR, WARN, INFO, DEBUG
const logger = {
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  warn:  (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
  info:  (msg, ...args) => console.info(`[INFO] ${msg}`, ...args),
  debug: (msg, ...args) => process.env.DEBUG && console.log(`[DEBUG] ${msg}`, ...args)
};
```

Log ke stdout (Railway capture otomatis). No log file (volatile FS).

### 3.5 Validation

- **Input validation** pakai custom validator (no library) atau `zod` kalau perlu
- **Sanitize** semua input user (nama, tema request) sebelum diproses
- **Whitelist** kitab names (tidak terima arbitrary string)

### 3.6 Async Patterns

```js
// Parallel
const [players, games] = await Promise.all([
  playerService.list(),
  gameService.list()
]);

// Sequential kalau ada dependency
const user = await userService.find(id);
const posts = await postService.findByUser(user.id);

// Timeout
const result = await Promise.race([
  aiService.generate(prompt),
  new Promise((_, reject) => setTimeout(() => reject(new Error('AI timeout')), 30000))
]);
```

---

## 4. SERVICE LAYER PATTERN

Setiap domain entity punya service file:

```
services/
├── auth.service.js     — login, logout, validate session
├── game.service.js     — create game, advance round, end game
├── player.service.js   — join, leave, reconnect
├── fragmen.service.js  — pick, mark used, validate
├── ai.service.js       — generate, round-robin, retry
├── scoring.service.js  — calculate round score, aggregate
└── persistence.service.js — SQLite + JSON snapshot
```

Setiap service:
- Single responsibility
- Pure functions where possible
- No direct HTTP/Socket.io handling (terima req → return data)
- No console.log (return result, biarkan caller yang log)

---

## 5. SOCKET.IO EVENT CONVENTION

### 5.1 Client → Server

| Event | Payload | Handler |
|---|---|---|
| `player:join` | `{ sessionId, name, role }` | register player |
| `player:rejoin` | `{ playerId, sessionId }` | restore session |
| `moderator:startRound` | `{ roundNumber }` | trigger round |
| `moderator:advancePhase` | `{ phase }` | next phase |
| `moderator:openMystery` | `{ playerId, envelopeColor }` | reveal mystery |
| `moderator:castVote` | `{ targetId }` | record vote (for moderator-triggered vote) |
| `player:castVote` | `{ targetName }` | player casts vote |
| `moderator:triggerAI` | `{ kitab, tema, count }` | generate fragmen |
| `chat:send` | `{ message }` | broadcast (jika di-enable) |

### 5.2 Server → Client

| Event | Payload | Audience |
|---|---|---|
| `player:joined` | `{ players, newPlayer }` | all in room |
| `player:left` | `{ playerId }` | all in room |
| `game:started` | `{ gameId, tier, totalRounds }` | all in room |
| `round:started` | `{ roundNumber, kitab }` | all in room |
| `phase:changed` | `{ phase, durationMs }` | all in room |
| `fragmen:distributed` | `{ fragmen, kitab, gaya }` | specific player only |
| `timer:tick` | `{ remainingMs }` | all in room (every 1s) |
| `vote:collected` | `{ voteCount, leading }` | moderator only |
| `round:ended` | `{ result, scores }` | all in room |
| `mystery:opened` | `{ playerId, color, effect }` | all in room |
| `game:ended` | `{ winner, finalScores }` | all in room |
| `ai:status` | `{ status, remaining, keys }` | moderator only |

### 5.3 Ack Pattern

```js
// Client
socket.emit('player:join', { name: 'Anak A' }, (response) => {
  if (response.success) {
    console.log('Joined as', response.playerId);
  } else {
    alert(response.error);
  }
});

// Server
socket.on('player:join', (data, ack) => {
  try {
    const player = await playerService.create(data);
    ack({ success: true, playerId: player.id });
  } catch (err) {
    ack({ success: false, error: err.message });
  }
});
```

---

## 6. PERSISTENCE LAYER

### 6.1 SQLite (better-sqlite3)

```js
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../data/db/surat-terakhir.sqlite'));
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// Prepared statements (cached)
const stmtGetFragmen = db.prepare('SELECT * FROM fragmen_bank WHERE id = ?');
const stmtMarkUsed = db.prepare(`
  INSERT INTO fragmen_used (fragmen_id, session_id, round_number, player_name, used_at)
  VALUES (?, ?, ?, ?, ?)
`);

// Transaction
const txFn = db.transaction((data) => {
  // multiple statements here
});

txFn(payload);
```

### 6.2 JSON Snapshot

```js
// Flush every 30s
setInterval(() => {
  const snapshot = {
    version: '1.0.0',
    flushed_at: Date.now(),
    config: getConfigSnapshot(),
    active_game: getActiveGameSnapshot(),
    current_round: getCurrentRoundSnapshot(),
    players: getActivePlayersSnapshot(),
    fragmen_used_ids: getFragmenUsedIds(),
    scoreboard: getScoreboardSnapshot()
  };
  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
}, 30000);
```

### 6.3 Restore on Startup

```js
function restoreFromSnapshot() {
  if (!fs.existsSync(SNAPSHOT_PATH)) return null;
  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
  
  // Validate version
  if (snapshot.version !== SCHEMA_VERSION) {
    logger.warn('Snapshot version mismatch, ignoring');
    return null;
  }
  
  return snapshot;
}
```

---

## 7. AI SERVICE (Gemini 2.5 Flash)

### 7.1 Multi-Key Round-Robin

```js
class AIService {
  constructor() {
    this.keys = process.env.GEMINI_API_KEYS.split(',').filter(Boolean);
    this.keyStates = this.keys.map(() => ({
      lastUsed: 0,
      requestCount: 0,
      rateLimitedUntil: 0
    }));
    this.currentKeyIdx = 0;
  }
  
  getNextKey() {
    const now = Date.now();
    const startIdx = this.currentKeyIdx;
    
    do {
      const state = this.keyStates[this.currentKeyIdx];
      if (now > state.rateLimitedUntil) {
        const key = this.keys[this.currentKeyIdx];
        this.currentKeyIdx = (this.currentKeyIdx + 1) % this.keys.length;
        return { key, idx: this.currentKeyIdx };
      }
      this.currentKeyIdx = (this.currentKeyIdx + 1) % this.keys.length;
    } while (this.currentKeyIdx !== startIdx);
    
    throw new Error('All API keys rate limited');
  }
  
  async generate(prompt, opts = {}) {
    const { key, idx } = this.getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json'
          }
        })
      });
      
      if (response.status === 429) {
        this.keyStates[idx].rateLimitedUntil = Date.now() + 60000; // 1 min
        // Retry with next key
        return this.generate(prompt, opts);
      }
      
      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      this.keyStates[idx].requestCount++;
      this.keyStates[idx].lastUsed = Date.now();
      
      return JSON.parse(data.candidates[0].content.parts[0].text);
    } catch (err) {
      logger.error('AI generate failed', err);
      throw err;
    }
  }
}
```

### 7.2 Prompt Engineering

System prompt untuk fragmen generation:

```
Kamu adalah penulis fragmen Alkitab untuk game rohani pemuda.

Tugas: Hasilkan fragmen ayat Alkitab (3-15 kata) yang:
- Style bahasa konsisten dengan kitab {kitab}
- Tema sentral: {tema}
- Tidak boleh mengutip ayat yang persis sama dari Alkitab (parafrase/modifikasi OK)
- Jangan sertakan referensi ayat (kitab + pasal + ayat)
- Output HANYA JSON: {"fragmen": ["...", "...", ...]}

Jumlah fragmen yang diminta: {count}
```

### 7.3 Anti-Duplicate Validation

Setelah AI return, validate tiap fragmen tidak ada di `fragmen_bank`:

```js
function validateUnique(generated, existingTexts) {
  const seen = new Set(existingTexts.map(t => t.toLowerCase().trim()));
  return generated.filter(f => {
    const normalized = f.toLowerCase().trim();
    if (seen.has(normalized)) return false;
    // Fuzzy check: similarity > 80% dianggap duplikat
    for (const existing of seen) {
      if (similarity(normalized, existing) > 0.8) return false;
    }
    return true;
  });
}
```

---

## 8. BUILD STEPS

### 8.1 Initial Setup

```bash
cd surat-terakhir
npm init -y
npm install express socket.io better-sqlite3 bcryptjs cookie-parser cookie-signature dotenv express-rate-limit helmet nanoid
npm install --save-dev nodemon
```

### 8.2 Local Development

```bash
# Set up env
cp .env.example .env
# Edit .env, add GEMINI_API_KEYS=key1,key2,key3

# Seed initial data
npm run seed

# Start dev server
npm run dev
# → http://localhost:3000
```

### 8.3 Production Build (Railway)

Railway auto-detect Node.js, run `npm start`. Tidak perlu build step (vanilla JS, no transpiler).

### 8.4 Deploy

```bash
git add surat-terakhir/
git commit -m "feat: tambah Surat Terakhir game"
git push origin main
# Railway auto-deploy
```

---

## 9. ERROR HANDLING CHECKLIST

- [x] DB connection error → graceful shutdown + log
- [x] JSON parse error → fallback to default
- [x] AI API timeout (30s) → fallback to seed fragmen
- [x] AI rate limit (429) → switch to next key
- [x] All keys rate limited → show "AI sedang sibuk, generate manual"
- [x] Player disconnect mid-round → mark inactive, keep in DB for rejoin
- [x] Moderator disconnect → game continues, moderator can rejoin
- [x] Invalid fragmen request → validation error, return 400
- [x] Duplicate fragmen (race condition) → catch unique constraint, retry
- [x] Snapshot file corrupt → log + continue with fresh state

---

## 10. TESTING STRATEGY

Lihat `QA-TEST-REPORT.md` dan `E2E-TEST-REPORT.md` (diisi setelah testing).

---

*Dibuat otomatis oleh build pipeline.*
