# ROUTING — Surat Terakhir

> URL paths, HTTP methods, access control matrix, redirect rules.

---

## 1. URL STRUCTURE

Base URL: `https://youthgame-palinggayeng-punkora.up.railway.app`

| Path | Method | Halaman | Akses |
|---|---|---|---|
| `/` | GET | Welcome + login | Public |
| `/moderator` | GET | Dashboard moderator | Auth required (role: moderator) |
| `/player` | GET | Game UI pemain | Auth required (role: player) |
| `/display` | GET | Display spectator | Public (read-only) |
| `/api/auth` | POST | Login (set cookie) | Public |
| `/api/logout` | POST | Logout (clear cookie) | Auth |
| `/api/health` | GET | Health check | Public |
| `/api/fragmen/stats` | GET | Stats fragmen (total, used, per kitab) | Auth |
| `/api/ai/status` | GET | AI key status, request count | Auth (moderator) |
| `/api/ai/generate` | POST | Trigger AI generation | Auth (moderator) |
| `/socket.io/` | WS | Socket.io endpoint | Public (with handshake auth) |

---

## 2. HTTP ROUTES (Express)

### 2.1 Static Files

```
GET /css/styles.css    → public/css/styles.css
GET /js/common.js      → public/js/common.js
GET /js/moderator.js   → public/js/moderator.js
GET /js/player.js      → public/js/player.js
GET /js/display.js     → public/js/display.js
GET /assets/*          → public/assets/* (icons, images)
```

### 2.2 Page Routes

```js
// Welcome (public)
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Moderator (auth required)
app.get('/moderator', requireAuth('moderator'), (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'moderator.html'));
});

// Player (auth required)
app.get('/player', requireAuth('player'), (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'player.html'));
});

// Display (public)
app.get('/display', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'display.html'));
});
```

### 2.3 API Routes

```js
// Auth
app.post('/api/auth', rateLimit({ windowMs: 5*60*1000, max: 5 }), asyncHandler(async (req, res) => {
  const { password, name, role } = req.body;
  
  // Validate password
  const config = getConfig();
  const valid = await bcrypt.compare(password, config.password_hash);
  if (!valid) {
    throw new AppError('Password salah', 401, 'AUTH_INVALID');
  }
  
  // Validate name
  if (!name || name.length < 1 || name.length > 20) {
    throw new AppError('Nama harus 1-20 karakter', 400, 'NAME_INVALID');
  }
  
  // Set cookie
  const session = signSession({ name, role, id: nanoid() });
  res.cookie('session', session, { 
    httpOnly: true, 
    sameSite: 'lax', 
    maxAge: 24 * 60 * 60 * 1000,
    signed: true
  });
  
  res.json({ success: true, data: { name, role } });
}));

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('session');
  res.json({ success: true });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    rooms: gameService.activeRoomCount(),
    players: playerService.activeCount(),
    fragmen_total: fragmenService.totalCount(),
    fragmen_used_today: fragmenService.usedTodayCount(),
    ai_keys_active: aiService.activeKeyCount(),
    version: '1.0.0'
  });
});

// Fragmen stats
app.get('/api/fragmen/stats', requireAuth(), asyncHandler(async (req, res) => {
  const stats = await fragmenService.getStats();
  res.json({ success: true, data: stats });
}));

// AI status
app.get('/api/ai/status', requireAuth('moderator'), asyncHandler(async (req, res) => {
  const status = await aiService.getStatus();
  res.json({ success: true, data: status });
}));

// AI generate
app.post('/api/ai/generate', requireAuth('moderator'), asyncHandler(async (req, res) => {
  const { kitab, tema, count } = req.body;
  const result = await aiService.generateAndSave({ kitab, tema, count });
  res.json({ success: true, data: result });
}));
```

---

## 3. SOCKET.IO EVENTS

### 3.1 Connection Handshake

```js
io.use((socket, next) => {
  const session = parseSignedCookie(socket.handshake.headers.cookie, SECRET);
  if (!session) {
    return next(new Error('AUTH_REQUIRED'));
  }
  socket.data.session = session;
  next();
});
```

### 3.2 Namespace: `/` (default)

Semua game events di namespace default.

### 3.3 Event List

| Event | Direction | Auth | Room | Payload |
|---|---|---|---|---|
| `player:join` | C→S | Player | - | `{ name, sessionId }` |
| `player:rejoin` | C→S | Player | - | `{ playerId, sessionId }` |
| `player:list` | S→C | All | yes | `[{ id, name, connected, joinedAt }]` |
| `game:create` | C→S | Moderator | - | `{ tier, totalRounds }` |
| `game:created` | S→C | All | yes | `{ gameId, roomCode, tier, totalRounds }` |
| `game:start` | C→S | Moderator | yes | `{ }` |
| `game:started` | S→C | All | yes | `{ round: 1, kitab }` |
| `round:start` | C→S | Moderator | yes | `{ roundNumber }` |
| `round:started` | S→C | All | yes | `{ roundNumber, kitab, phase, durationMs }` |
| `phase:change` | C→S | Moderator | yes | `{ phase: 'baca' | 'diskusi' | 'voting' | 'reveal' }` |
| `phase:changed` | S→C | All | yes | `{ phase, durationMs, startedAt }` |
| `fragmen:assigned` | S→C | Player | - | `{ fragmen, kitab, gaya, mysteryColors }` |
| `fragmen:distribute` | C→S | Moderator | yes | `{ }` |
| `fragmen:distributed` | S→C | All | yes | `{ count: 6 }` |
| `timer:tick` | S→C | All | yes | `{ phase, remainingMs }` |
| `vote:cast` | C→S | Player/Mod | yes | `{ targetName }` |
| `vote:casted` | S→C | Moderator | yes | `{ voterName, targetName }` |
| `vote:result` | S→C | All | yes | `{ votes, leader, threshold }` |
| `round:end` | C→S | Moderator | yes | `{ }` |
| `round:ended` | S→C | All | yes | `{ result, scores, totalScores }` |
| `mystery:open` | C→S | Moderator | yes | `{ playerId, color }` |
| `mystery:opened` | S→C | All | yes | `{ playerId, playerName, color, effect, message }` |
| `game:end` | C→S | Moderator | yes | `{ }` |
| `game:ended` | S→C | All | yes | `{ winner, finalScores, stats }` |
| `ai:generate` | C→S | Moderator | - | `{ kitab, tema, count }` |
| `ai:status` | S→C | Moderator | - | `{ status, remaining, keys }` |
| `ai:generated` | S→C | Moderator | - | `{ generated, added, total }` |
| `chat:send` | C→S | All | yes | `{ message }` |
| `chat:message` | S→C | All | yes | `{ from, message, timestamp }` |
| `error` | S→C | All | - | `{ code, message }` |

### 3.4 Room Naming

- `room:{roomCode}` — semua client di room yang sama
- `player:{playerId}` — direct message ke 1 player
- `moderator` — broadcast ke semua moderator (kalau ada lebih dari 1)

### 3.5 Example Handler

```js
socket.on('vote:cast', async ({ targetName }, ack) => {
  try {
    const room = getRoom(socket.data.roomCode);
    const result = await gameService.castVote(room, socket.data.playerName, targetName);
    io.to(`room:${room.code}`).emit('vote:casted', {
      voterName: socket.data.playerName,
      targetName
    });
    ack({ success: true });
  } catch (err) {
    ack({ success: false, error: err.message });
  }
});
```

---

## 4. ACCESS CONTROL MATRIX

| Resource | Public | Auth | Moderator | Admin |
|---|---|---|---|---|
| Welcome page (`/`) | ✅ | ✅ | ✅ | ✅ |
| Login (`POST /api/auth`) | ✅ | - | - | - |
| Player page (`/player`) | ❌ | ❌ | ✅ | ✅ |
| Moderator page (`/moderator`) | ❌ | ❌ | ❌ | ✅ |
| Display page (`/display`) | ✅ | ✅ | ✅ | ✅ |
| Health (`/api/health`) | ✅ | - | - | - |
| Fragmen stats | ❌ | ✅ | ✅ | ✅ |
| AI status | ❌ | ❌ | ✅ | ✅ |
| AI generate trigger | ❌ | ❌ | ✅ | ✅ |
| Join room (socket) | ❌ | ✅ | ✅ | ✅ |
| Start game (socket) | ❌ | ❌ | ✅ | ✅ |
| Open mystery (socket) | ❌ | ❌ | ✅ | ✅ |
| Cast vote (socket) | ❌ | ✅ | ✅ | ✅ |
| Chat send (socket) | ❌ | ✅ | ✅ | ✅ |

**Note:** "Auth" = logged in (player or moderator). "Moderator" = role-specific.

---

## 5. REDIRECT RULES

| From | To | Condition |
|---|---|---|
| `/` (already authed as moderator) | `/moderator` | Optional, biar gak login 2x |
| `/` (already authed as player) | `/player` | Optional |
| `/moderator` (not authed) | `/?redirect=/moderator` | After login, redirect back |
| `/player` (not authed) | `/?redirect=/player` | After login, redirect back |
| `/unknown-path` | `/` | 404 fallback to welcome |

---

## 6. MIDDLEWARE ORDER

```js
app.use(helmet());                          // 1. Security headers
app.use(express.json({ limit: '1mb' }));   // 2. Parse JSON body
app.use(cookieParser(SECRET));             // 3. Parse cookies
app.use(express.static(PUBLIC_DIR));       // 4. Static files (CSS, JS, assets)
app.use(rateLimit({ ... }));               // 5. Rate limit (global)

// Routes
app.get('/', ...);
app.post('/api/auth', rateLimit({ ... }));  // Stricter rate limit
app.get('/moderator', requireAuth('moderator'), ...);
// ...

// Error handler (must be last)
app.use(errorHandler);
```

---

## 7. CORS

```js
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Public game
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
```

Socket.io CORS:
```js
const io = new Server(httpServer, {
  cors: {
    origin: '*',  // Public
    methods: ['GET', 'POST']
  }
});
```

**Note:** karena game public, CORS allow all. Untuk production yang lebih strict, ganti `*` dengan specific origins.

---

## 8. RATE LIMITING

| Endpoint | Window | Max | Action |
|---|---|---|---|
| `POST /api/auth` | 5 min | 5 req | 429 Too Many Requests |
| `POST /api/ai/generate` | 1 min | 10 req | 429 (manual) |
| Socket events | per connection | adaptive | Disconnect if spam |

```js
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan. Coba lagi 5 menit.' } },
  keyGenerator: (req) => req.ip
});
```

---

*Dibuat otomatis oleh build pipeline.*
