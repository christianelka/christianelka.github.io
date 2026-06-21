# SEEDER-UI-SYNC-RULE — Surat Terakhir

> Aturan sinkronisasi antara data (DB/JSON) dan UI. Field mapping, validation, edge cases.

---

## 1. PRINSIP SYNC

**Single Source of Truth (SSOT):** SQLite database (`data/db/surat-terakhir.sqlite`) adalah sumber utama. JSON snapshot (`data/snapshot.json`) adalah backup volatile-safe. UI hanya **read-only display** dari data yang dikirim server.

**Arah sinkronisasi:**
- Server → Client (via Socket.io) → UI update
- Client → Server (input/aksi) → Server process → Server → Client (broadcast)
- **TIDAK ADA** direct client-to-client atau client-to-DB

---

## 2. FIELD MAPPING

### 2.1 Player Object

**Server (DB):**
```typescript
{
  id: string,             // socket id (e.g., "sock_abc123")
  session_id: string,     // room code (e.g., "PUNK26")
  name: string,           // "Anak A"
  role: 'pembawa' | 'agen' | 'abu-abu' | 'moderator',
  joined_at: number,      // epoch ms
  last_seen: number,      // epoch ms
  is_connected: boolean
}
```

**Client (UI):**
```typescript
{
  id: string,
  name: string,
  role: string,           // displayed as label
  isSelf: boolean,        // computed: id === currentPlayer.id
  isConnected: boolean,   // dot indicator color
  joinedAt: string        // formatted (e.g., "14:30")
}
```

**Mapping rules:**
- `role === 'moderator'` → hidden from player list (only in moderator view)
- `role === 'agen'` → NEVER show this role to other players
- `role === 'abu-abu'` → NEVER show this role (it's between target and agent)
- `isSelf === true` → display differently (highlighted card)

### 2.2 Fragmen Object

**Server (DB):**
```typescript
{
  id: number,
  kitab: string,
  tema: string,
  teks: string,
  gaya_bahasa: string,
  sumber: 'seed' | 'ai',
  created_at: number,
  is_active: boolean
}
```

**Client (UI - Player):**
```typescript
{
  id: number,
  teks: string,           // displayed in big text
  kitab: string,          // small label below (hanya untuk "fragmenKamu", not for guessing)
  gaya: string            // optional, untuk UI hint
}
```

**⚠️ PENTING:** UI player **TIDAK BOLEH** menampilkan `kitab` atau `gaya` kepada pemain — itu yang harus ditebak!

**Client (UI - Moderator):**
```typescript
{
  id, kitab, tema, teks, gaya_bahasa, sumber, created_at, is_active
  // Full data visible
}
```

### 2.3 Round Object

**Server (DB):**
```typescript
{
  id: number,
  game_id: string,
  round_number: number,
  kitab_target: string,
  kitab_abu: string,
  kitab_agen: string,
  distrib_data: { [playerName: string]: number },  // playerName -> fragmenId
  mystery_data: { [playerName: string]: string[] }, // 3 colors
  opened_mystery: { [playerName: string]: string }, // color or null
  vote_data: { [voterName: string]: string },
  result: 'pembawa_win' | 'agen_win' | 'abu_win' | null,
  score_pembawa: number,
  score_agen: number,
  started_at: number,
  ended_at: number
}
```

**Client (UI - Moderator, during round):**
```typescript
{
  number: number,
  kitabTarget: string,
  kitabAbu: string,
  kitabAgen: string,
  players: {
    [playerName]: {
      fragmenId: number,
      fragmenText: string,
      role: 'pembawa' | 'agen' | 'abu-abu',
      mysteryColors: string[],
      openedMystery: string | null,
      voteFrom: string[],    // who voted for this player
      voteTo: string | null  // who this player voted for
    }
  },
  phase: 'baca' | 'diskusi' | 'voting' | 'reveal',
  phaseEndsAt: number,
  totalScores: { pembawa: number, agen: number }
}
```

**Client (UI - Player, during round):**
```typescript
{
  number: number,
  myFragmen: { id, teks, kitab?, gaya? },  // kitab/gaya hidden
  myMysteryColors: string[],
  phase: string,
  phaseEndsAt: number,
  voteReceived: boolean
}
```

**Client (UI - Display, public):**
```typescript
{
  number: number,
  kitabTarget: string,         // REVEALED at end of round
  players: [{ name, role?, isRevealed }],  // role hidden until reveal
  totalScores: { pembawa, agen }
}
```

### 2.4 Vote Object

**Server:**
```typescript
{
  roundId: number,
  voterName: string,
  targetName: string,
  castAt: number
}
```

**Client (UI - Moderator):**
```typescript
{
  votes: { [voterName]: targetName },
  leader: string | null,         // name with most votes
  voteCount: { [targetName]: number }
}
```

**Client (UI - Player):**
```typescript
{
  myVote: { targetName: string } | null,
  voteSubmitted: boolean
}
```

---

## 3. STATE TRANSITIONS

### 3.1 Round Phase State Machine

```
[lobby] --moderator:startRound--> [baca]
[baca] --timerEnd OR moderator:advance--> [diskusi]
[diskusi] --timerEnd OR moderator:advance--> [voting]
[voting] --timerEnd OR allVoted--> [reveal]
[reveal] --moderator:openMystery--> [reveal-complete]
[reveal-complete] --moderator:nextRound--> [lobby OR next round]
```

**Validasi:**
- Tidak bisa loncat fase (harus sequential)
- Tidak bisa mundur fase
- Timer auto-advance bisa di-disable oleh moderator

### 3.2 Player Connection State

```
[connecting] --connect--> [connected]
[connected] --disconnect--> [disconnected]  (last_seen updated, is_connected = false)
[disconnected] --reconnect with same id--> [connected]  (restored state)
[disconnected] --30 min timeout--> [removed]  (deleted from room)
```

**UI indicator:**
- `connected` → green dot
- `disconnected` → yellow/orange dot, faded card
- `removed` → removed from list

### 3.3 Game State

```
[no-game] --moderator:createGame--> [lobby]
[lobby] --moderator:startRound (>= 3 players)--> [playing]
[playing] --moderator:endGame--> [ended]
[ended] --moderator:resetGame--> [lobby]
```

---

## 4. REAL-TIME SYNC EVENTS

### 4.1 From Server to Client (broadcaster pattern)

| Event | Trigger | Recipients | Payload |
|---|---|---|---|
| `player:joined` | new player join room | all in room | new player + updated list |
| `player:left` | player disconnect | all in room | player id + updated list |
| `game:state` | state change (any) | all in room | full game state |
| `phase:changed` | moderator advances phase | all in room | new phase + duration |
| `timer:tick` | every 1s during phase | all in room | remaining ms |
| `fragmen:assigned` | new fragmen to player | specific player | fragmen + mystery colors |
| `mystery:opened` | moderator opens mystery | all in room | player + color + effect |
| `vote:casted` | player casts vote | moderator only | voter + target |
| `vote:result` | all votes collected | all in room | leader + counts |
| `round:ended` | moderator ends round | all in room | results + scores |
| `game:ended` | moderator ends game | all in room | winner + final scores |
| `ai:status` | AI request sent/done | moderator only | status update |
| `ai:generated` | new fragmen added | moderator only | added count + total |
| `error` | server error | affected client | code + message |

### 4.2 From Client to Server (command pattern)

| Event | From | Validation |
|---|---|---|
| `player:join` | player | name length, room exists |
| `player:rejoin` | player | session token valid |
| `player:leave` | player | - |
| `moderator:createGame` | moderator | tier valid, totalRounds 1-10 |
| `moderator:startRound` | moderator | currentRound <= totalRounds |
| `moderator:advancePhase` | moderator | current phase allows next |
| `moderator:openMystery` | moderator | playerId valid, color valid |
| `moderator:castVote` | moderator | for AI test mode |
| `moderator:triggerAI` | moderator | kitab valid, count 1-20 |
| `player:castVote` | player | targetName valid, no double vote |
| `chat:send` | any | message length 1-200 |

---

## 5. UI RENDERING RULES

### 5.1 Conditional Visibility

| Component | Player view | Moderator view | Display view |
|---|---|---|---|
| Other players' fragmen | ❌ Hidden | ✅ Visible | ❌ Hidden (until reveal) |
| Other players' role | ❌ Hidden | ✅ Visible | ❌ Hidden (until reveal) |
| Own fragmen text | ✅ Visible | ✅ Visible | ❌ N/A |
| Own fragmen kitab | ❌ Hidden (until reveal) | ✅ Visible | ❌ N/A |
| Mystery colors (own) | ✅ Visible (sealed) | ✅ Visible (all) | ✅ Visible (sealed) |
| Mystery effect (opened) | ✅ Visible (when opened) | ✅ Visible | ✅ Visible (when opened) |
| Timer | ✅ Visible | ✅ Visible | ✅ Visible (small) |
| Score | ✅ Visible (own team) | ✅ Visible (both) | ✅ Visible (both) |
| AI panel | ❌ Hidden | ✅ Visible | ❌ Hidden |
| Round control buttons | ❌ Hidden | ✅ Visible | ❌ Hidden |
| Log timeline | ❌ Hidden | ✅ Visible | ✅ Visible (limited) |

### 5.2 Animation Trigger Points

| Event | UI Animation |
|---|---|
| Player joined | fade in card, scale 0.9→1.0 |
| Player left | fade out, scale 1.0→0.9 |
| Fragmen distributed | slide up from bottom, 600ms |
| Phase changed | pulse on phase indicator |
| Timer < 30s | pulse red, scale pulse |
| Mystery opened | flip card animation, 800ms |
| Vote casted | check icon appear, fade |
| Round ended | score number tween, 1s |
| Game ended | confetti burst (optional) |

### 5.3 Sound Triggers (Optional)

| Event | Sound |
|---|---|
| Player joined | soft chime |
| Fragmen distributed | whoosh |
| Phase changed | subtle tick |
| Timer < 10s | ticking |
| Timer end | bell |
| Mystery opened | reveal horn |
| Vote casted | soft click |
| Round ended | success chime |
| Game ended | fanfare |

**Note:** Sound OFF by default. User can enable in settings.

---

## 6. DATA VALIDATION SYNC

### 6.1 Server-side Validation (Authoritative)

```js
function validateFragmenRequest({ kitab, tema, count }) {
  if (!KITAB_WHITELIST.includes(kitab)) {
    throw new AppError('Kitab tidak dikenal', 400, 'KITAB_INVALID');
  }
  if (typeof tema !== 'string' || tema.length < 1 || tema.length > 100) {
    throw new AppError('Tema harus 1-100 karakter', 400, 'TEMA_INVALID');
  }
  if (count < 1 || count > 20) {
    throw new AppError('Count harus 1-20', 400, 'COUNT_INVALID');
  }
  // Sanitize tema (no XSS, no SQL injection)
  const cleanTema = tema.replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, '');
  return { kitab, tema: cleanTema, count };
}
```

### 6.2 Client-side Validation (UX only, NOT authoritative)

```js
// Player name
function validateName(name) {
  if (!name || name.length < 1) return 'Nama tidak boleh kosong';
  if (name.length > 20) return 'Nama maksimal 20 karakter';
  if (!/^[\w\s\u00C0-\u024F\u1E00-\u1EFF]+$/.test(name)) return 'Nama hanya boleh huruf, angka, spasi';
  return null; // valid
}
```

### 6.3 State Mismatch Recovery

Kalau client menerima state yang "tidak mungkin" (e.g., score turun drastis), **refresh state**:

```js
socket.on('game:state', (state) => {
  if (isStateInconsistent(localState, state)) {
    console.warn('State mismatch, refreshing');
    showRefreshBanner();
    applyFullState(state); // Replace local, don't merge
  } else {
    applyDeltaState(state); // Apply changes only
  }
});
```

---

## 7. EDGE CASES

### 7.1 Player Bergabung di Tengah Ronde

**Scenario:** Ronde sudah jalan, player baru join.
**Action:**
- Player tidak terima fragmen ronde ini
- Player ditambahkan ke `lobby` (visible di list tapi belum main)
- Saat ronde selesai, player baru ikut ronde berikutnya

### 7.2 Moderator Disconnect

**Scenario:** Moderator kehilangan koneksi di tengah ronde.
**Action:**
- Timer di-pause otomatis
- Server broadcast "moderator reconnecting..." ke semua player
- Saat moderator reconnect (same session), state di-restore
- Moderator bisa continue dari phase terakhir

### 7.3 Semua Player Diskonek

**Scenario:** Semua player leave (HP mati, dll).
**Action:**
- Game state di-pause
- Snapshot di-flush
- Saat player reconnect (dengan session ID yang sama), game resume
- Jika > 30 menit, game di-end otomatis

### 7.4 Fragmen Habis

**Scenario:** Semua fragmen di kitab target sudah dipakai.
**Action:**
- Trigger AI generation (background)
- Selama menunggu, pakai fragmen dari kitab "mirip" (abu-abu atau kitab terkait)
- Notifikasi ke moderator: "Auto-generating 5 fragmen untuk kitab Mazmur..."

### 7.5 Round Terlalu Lama

**Scenario:** Diskusi molor > 10 menit.
**Action:**
- Moderator bisa extend timer atau langsung lanjut ke voting
- Auto-warning di menit ke-8

### 7.6 Vote Seri (Multiple Leaders)

**Scenario:** 2 pemain sama-sama dapat 2 suara.
**Action:**
- Tidak ada yang di-koreksi
- Semua fragmen tetap "aman" untuk ronde ini
- Skor Pembawa +2, Agen +5 (semi-win untuk Agen karena tidak tertangkap)

---

## 8. CLIENT-SIDE STATE MANAGEMENT

### 8.1 Architecture

```js
// Simple state object (no library)
const state = {
  session: { name, role },
  room: { code, tier, totalRounds, currentRound },
  players: [],
  myFragmen: null,
  myMystery: [],
  phase: 'lobby',
  phaseEndsAt: null,
  vote: null,
  scores: { pembawa: 0, agen: 0 }
};

// Update function (immutable)
function setState(updates) {
  Object.assign(state, updates);
  render(); // Re-render relevant parts
}

// Socket handlers update state
socket.on('phase:changed', ({ phase, durationMs }) => {
  setState({ phase, phaseEndsAt: Date.now() + durationMs });
});
```

### 8.2 Render Strategy

- **Selective re-render:** jangan re-render seluruh UI, hanya bagian yang berubah
- **Use direct DOM updates** untuk performance (vanilla JS, no React/Vue)
- **Debounce** input handlers (vote, chat)

### 8.3 State Persistence (Client)

- `sessionStorage` untuk auth (survive refresh, not across tabs)
- TIDAK persist game state (server-authoritative)

---

## 9. ACCESSIBILITY SYNC

### 9.1 Screen Reader Announcements

| Event | Announcement |
|---|---|
| Player joined | "[name] telah bergabung" |
| Phase changed | "Fase sekarang: [phase]" |
| Fragmen assigned | "Fragmen kamu: [text]" (read aloud) |
| Mystery opened | "[player] membuka amplop [color]" |
| Vote submitted | "Vote kamu untuk [target] telah dicatat" |
| Round ended | "Ronde [n] selesai. Skor: Pembawa [n], Agen [n]" |

### 9.2 Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | focus next interactive element |
| `Shift+Tab` | focus previous |
| `Enter` | activate button (vote, open mystery) |
| `Esc` | close modal |
| `Space` | next phase (moderator only) |
| `?` | open help modal |

### 9.3 Focus Management

- Saat modal buka → focus ke first input
- Saat modal close → return focus to trigger
- Saat phase change → focus ke action button (vote, etc.)

---

*Dibuat otomatis oleh build pipeline.*
