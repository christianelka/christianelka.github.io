/**
 * Surat Terakhir — Server (JSON-file persistence, no native deps)
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import signature from 'cookie-signature';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { config as loadEnv } from 'dotenv';
import rateLimit from 'express-rate-limit';

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const COOKIE_SECRET = process.env.COOKIE_SECRET || 'dev-cookie-secret-change-in-production-please';
const PASSWORD_PLAIN = process.env.PASSWORD || 'PalingGayeng2026';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const SNAPSHOT_PATH = path.join(DATA_DIR, 'snapshot.json');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const FRAGMEN_PATH = path.join(DATA_DIR, 'fragmen.json');

[DATA_DIR].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const logger = {
  error: (m, ...a) => console.error(`[ERR] ${m}`, ...a),
  warn:  (m, ...a) => LEVELS[LOG_LEVEL] >= 1 && console.warn(`[WARN] ${m}`, ...a),
  info:  (m, ...a) => LEVELS[LOG_LEVEL] >= 2 && console.log(`[INFO] ${m}`, ...a),
  debug: (m, ...a) => LEVELS[LOG_LEVEL] >= 3 && console.log(`[DBG] ${m}`, ...a),
};

let appConfig = {
  password_hash: '',
  ai_keys: [],
  ai_enabled: true,
  ai_threshold: 3,
  ai_timeout_ms: 30000,
  snapshot_interval_ms: 30000,
  max_players_per_room: 12,
  round_durations: { baca: 300, diskusi: 600, voting: 30 },
  rate_limit: { auth_max: 5, auth_window_ms: 300000 },
  round_config: [
    { target: 'Mazmur',       abu: 'Amsal',         agen: 'Kidung Agung' },
    { target: 'Matius',       abu: 'Markus',        agen: 'Kisah Para Rasul' },
    { target: 'Amsal',        abu: 'Pengkhotbah',   agen: 'Kidung Agung' },
    { target: 'Markus',       abu: 'Matius',        agen: 'Wahyu' },
    { target: 'Galatia',      abu: 'Efesus',        agen: '1 Timotius' },
  ],
};

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const f = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      appConfig = { ...appConfig, ...f };
    }
  } catch (e) { logger.error('config load', e.message); }
  if (process.env.GEMINI_API_KEYS) {
    appConfig.ai_keys = process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(Boolean);
  }
  if (process.env.AI_GENERATION_ENABLED !== undefined) {
    appConfig.ai_enabled = process.env.AI_GENERATION_ENABLED === 'true';
  }
  if (process.env.MAX_PLAYERS_PER_ROOM) {
    appConfig.max_players_per_room = parseInt(process.env.MAX_PLAYERS_PER_ROOM, 10);
  }
}

function saveConfig() {
  try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(appConfig, null, 2)); } catch (e) { logger.error('config save', e.message); }
}

function initPassword() {
  if (!appConfig.password_hash) {
    appConfig.password_hash = bcrypt.hashSync(PASSWORD_PLAIN, 10);
    saveConfig();
  }
}

let fragmenBank = [];
let usedBySession = new Map();

function loadFragmen() {
  if (!fs.existsSync(FRAGMEN_PATH)) {
    logger.error('fragmen.json missing');
    fragmenBank = [];
    return;
  }
  fragmenBank = JSON.parse(fs.readFileSync(FRAGMEN_PATH, 'utf8'));
  logger.info(`Loaded ${fragmenBank.length} fragmen`);
}

function loadUsed() {
  try {
    if (fs.existsSync(SNAPSHOT_PATH)) {
      const s = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
      if (s.used_by_session) {
        usedBySession = new Map(Object.entries(s.used_by_session).map(([k, v]) => [k, new Set(v)]));
      }
    }
  } catch (e) { logger.error('used load', e.message); }
}

function saveSnapshot() {
  try {
    const usedObj = {};
    for (const [k, v] of usedBySession) usedObj[k] = Array.from(v);
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify({
      version: '1.0.0', flushed_at: Date.now(),
      active_games: [...gameService.activeGames.values()].map(g => ({ id: g.id, tier: g.tier, totalRounds: g.totalRounds, currentRound: g.currentRound, status: g.status, scores: g.scores })),
      used_by_session: usedObj,
      fragmen_count: fragmenBank.length,
    }, null, 2));
  } catch (e) { logger.error('snapshot', e.message); }
}

const fragmenService = {
  computeDistribution(playerCount) {
    if (playerCount < 3) throw new Error('Minimal 3 pemain');
    const agen = 1;
    const target = Math.max(2, Math.floor((playerCount - agen) * 0.6));
    const abu = Math.max(0, playerCount - target - agen);
    return { target, abu, agen, total: target + abu + agen };
  },
  getAvailable(kitab, sessionId, count) {
    const used = usedBySession.get(sessionId) || new Set();
    return fragmenBank.filter(f => f.kitab === kitab && f.is_active !== false && !used.has(f.id || f.teks)).sort(() => Math.random() - 0.5).slice(0, count);
  },
  markUsed(fragmen, sessionId) {
    if (!usedBySession.has(sessionId)) usedBySession.set(sessionId, new Set());
    usedBySession.get(sessionId).add(fragmen.id || fragmen.teks);
  },
  insert(fragmen) {
    if (fragmenBank.some(f => f.teks === fragmen.teks && f.kitab === fragmen.kitab)) return null;
    const id = nanoid(8);
    const record = { id, ...fragmen, is_active: 1, created_at: Date.now() };
    fragmenBank.push(record);
    return id;
  },
  getStats() {
    const total = fragmenBank.length;
    const byKitab = {};
    for (const f of fragmenBank) byKitab[f.kitab] = (byKitab[f.kitab] || 0) + 1;
    return { total, by_kitab, sessions: usedBySession.size };
  },
};

const aiService = {
  keyStates: [],
  currentIdx: 0,
  init() {
    this.keyStates = appConfig.ai_keys.map(() => ({ rateLimitedUntil: 0, requests: 0 }));
    logger.info(`AI: ${this.keyStates.length} keys, ${appConfig.ai_enabled ? 'enabled' : 'disabled'}`);
  },
  getNextKey() {
    if (!appConfig.ai_enabled || this.keyStates.length === 0) throw new Error('AI not available');
    const now = Date.now();
    for (let i = 0; i < this.keyStates.length; i++) {
      const idx = (this.currentIdx + i) % this.keyStates.length;
      if (now > this.keyStates[idx].rateLimitedUntil) {
        this.currentIdx = (idx + 1) % this.keyStates.length;
        return { key: appConfig.ai_keys[idx], idx };
      }
    }
    throw new Error('All keys rate limited');
  },
  async generate(kitab, tema, count) {
    const { key, idx } = this.getNextKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const prompt = `Kamu adalah penulis fragmen ayat Alkitab untuk game rohani pemuda Indonesia. Hasilkan ${count} fragmen (3-15 kata per fragmen), gaya kitab ${kitab}, tema ${tema}, parafrase bukan kutipan, bahasa Indonesia natural. Output HANYA JSON: {"fragmen": ["...", ...]}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), appConfig.ai_timeout_ms);
    try {
      const res = await fetch(url, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 1024, responseMimeType: 'application/json' } }) });
      clearTimeout(timeout);
      if (res.status === 429) { this.keyStates[idx].rateLimitedUntil = Date.now() + 60000; return this.generate(kitab, tema, count); }
      if (!res.ok) throw new Error(`Gemini ${res.status}`);
      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts?.[0]?.text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(text);
      this.keyStates[idx].requests++;
      return parsed.fragmen || [];
    } catch (e) { clearTimeout(timeout); throw e; }
  },
  async generateAndSave(kitab, tema, count) {
    const generated = await this.generate(kitab, tema || 'umum', count);
    const saved = [];
    for (const teks of generated) {
      const t = teks.trim();
      const gaya = inferGaya(kitab);
      const id = fragmenService.insert({ kitab, tema: tema || 'umum', teks: t, gaya_bahasa: gaya, sumber: 'ai' });
      if (id) saved.push(fragmenBank[fragmenBank.length - 1]);
    }
    return { generated: saved, total: fragmenBank.length };
  },
  getStatus() {
    const now = Date.now();
    return { enabled: appConfig.ai_enabled, keys_total: this.keyStates.length, keys_active: this.keyStates.filter(s => now > s.rateLimitedUntil).length, keys_rate_limited: this.keyStates.filter(s => now <= s.rateLimitedUntil).length, requests_total: this.keyStates.reduce((s, x) => s + x.requests, 0) };
  },
};

function inferGaya(kitab) {
  const m = { 'Mazmur':'puitis', 'Kidung Agung':'puitis', 'Amsal':'argumentatif', 'Matius':'naratif', 'Markus':'naratif', 'Lukas':'naratif', 'Yohanes':'naratif', 'Kisah Para Rasul':'naratif', 'Galatia':'argumentatif', 'Efesus':'pastoral', 'Wahyu':'profetis', '1 Timotius':'pastoral', 'Pengkhotbah':'naratif' };
  return m[kitab] || 'naratif';
}

const gameService = {
  activeGames: new Map(),
  createGame({ tier, totalRounds }) {
    const id = nanoid(6).toUpperCase().replace(/[^A-Z0-9]/g, 'X').slice(0, 6);
    const game = { id, tier, totalRounds, currentRound: 0, status: 'lobby', players: new Map(), scores: { pembawa: 0, agen: 0 }, currentRoundData: null, phase: null, phaseEndsAt: null, phaseTimer: null };
    this.activeGames.set(id, game);
    logger.info(`Game created: ${id}`);
    return game;
  },
  getGame(id) { return this.activeGames.get(id); },
  addPlayer(gameId, player) {
    const g = this.getGame(gameId);
    if (!g || g.status === 'ended') return null;
    if (g.players.size >= appConfig.max_players_per_room) return null;
    g.players.set(player.id, player);
    return player;
  },
  startRound(gameId, roundNumber) {
    const game = this.getGame(gameId);
    if (!game) throw new Error('Game not found');
    const playerCount = game.players.size;
    if (playerCount < 3) throw new Error('Minimal 3 pemain');
    const cfg = appConfig.round_config[(roundNumber - 1) % appConfig.round_config.length];
    const dist = fragmenService.computeDistribution(playerCount);
    const targetPool = fragmenService.getAvailable(cfg.target, gameId, dist.target);
    const abuPool = dist.abu > 0 ? fragmenService.getAvailable(cfg.abu, gameId, dist.abu) : [];
    const agenPool = fragmenService.getAvailable(cfg.agen, gameId, dist.agen);
    if (targetPool.length < 2) throw new Error(`Pool ${cfg.target} habis (${targetPool.length} < ${dist.target}). Generate fragmen baru.`);
    if (targetPool.length < dist.target) {
      aiService.generateAndSave(cfg.target, 'umum', dist.target - targetPool.length + 2).then(r => logger.info(`Auto-gen ${r.generated.length} for ${cfg.target}`)).catch(e => logger.error('auto-gen', e.message));
    }
    const actualTarget = targetPool.slice(0, dist.target);
    const actualAbu = abuPool.slice(0, dist.abu);
    const actualAgen = agenPool.slice(0, dist.agen);
    const playerIds = [...game.players.keys()].sort(() => Math.random() - 0.5);
    const distrib = {}; const mysteryData = {}; const roleAssignments = {};
    let idx = 0;
    for (let i = 0; i < actualTarget.length && idx < playerIds.length; i++) { const pid = playerIds[idx++]; distrib[pid] = actualTarget[i].id || actualTarget[i].teks; mysteryData[pid] = ['merah','kuning','hijau'].sort(() => Math.random() - 0.5); roleAssignments[pid] = 'pembawa'; }
    for (let i = 0; i < actualAbu.length && idx < playerIds.length; i++) { const pid = playerIds[idx++]; distrib[pid] = actualAbu[i].id || actualAbu[i].teks; mysteryData[pid] = ['merah','kuning','hijau'].sort(() => Math.random() - 0.5); roleAssignments[pid] = 'abu-abu'; }
    for (let i = 0; i < actualAgen.length && idx < playerIds.length; i++) { const pid = playerIds[idx++]; distrib[pid] = actualAgen[i].id || actualAgen[i].teks; mysteryData[pid] = ['merah','kuning','hijau'].sort(() => Math.random() - 0.5); roleAssignments[pid] = 'agen'; }
    while (idx < playerIds.length) { const pid = playerIds[idx++]; const fb = actualTarget[0] || actualAgen[0]; distrib[pid] = fb.id || fb.teks; mysteryData[pid] = ['merah','kuning','hijau'].sort(() => Math.random() - 0.5); roleAssignments[pid] = 'pembawa'; }
    Object.entries(distrib).forEach(([pid, fkey]) => {
      const player = game.players.get(pid);
      if (player) {
        const frag = fragmenBank.find(f => (f.id || f.teks) === fkey);
        if (frag) fragmenService.markUsed(frag, gameId);
        player.role = roleAssignments[pid];
      }
    });
    const roundData = { id: nanoid(8), number: roundNumber, kitabTarget: cfg.target, kitabAbu: cfg.abu, kitabAgen: cfg.agen, distrib, mysteryData, roleAssignments, votes: {}, openedMystery: {}, phase: 'baca', phaseEndsAt: Date.now() + appConfig.round_durations.baca * 1000 };
    game.currentRound = roundNumber;
    game.currentRoundData = roundData;
    game.status = 'playing';
    return roundData;
  },
  advancePhase(gameId) {
    const g = this.getGame(gameId);
    if (!g || !g.currentRoundData) return null;
    const phases = ['baca','diskusi','voting','reveal'];
    const idx = phases.indexOf(g.currentRoundData.phase);
    const next = phases[idx + 1];
    if (!next) return null;
    if (g.phaseTimer) clearTimeout(g.phaseTimer);
    const dur = appConfig.round_durations[next];
    g.currentRoundData.phase = next;
    g.currentRoundData.phaseEndsAt = dur ? Date.now() + dur * 1000 : null;
    if (next !== 'reveal' && dur) g.phaseTimer = setTimeout(() => this.advancePhase(gameId), dur * 1000);
    return g.currentRoundData;
  },
  castVote(gameId, voterName, targetName) {
    const g = this.getGame(gameId);
    if (!g || !g.currentRoundData) return null;
    if (g.currentRoundData.phase !== 'voting') throw new Error('Bukan fase voting');
    if (voterName === targetName) throw new Error('Tidak bisa vote diri sendiri');
    if (![...g.players.values()].some(p => p.name === targetName)) throw new Error('Target tidak ditemukan');
    g.currentRoundData.votes[voterName] = targetName;
    return g.currentRoundData.votes;
  },
  endRound(gameId) {
    const g = this.getGame(gameId);
    if (!g || !g.currentRoundData) return null;
    if (g.phaseTimer) clearTimeout(g.phaseTimer);
    const rd = g.currentRoundData;
    const tally = {};
    Object.values(rd.votes).forEach(t => { tally[t] = (tally[t] || 0) + 1; });
    let leader = null, max = 0;
    Object.entries(tally).forEach(([n, c]) => { if (c > max) { leader = n; max = c; } });
    const tied = Object.values(tally).filter(c => c === max).length > 1;
    const leaderPlayer = leader ? [...g.players.values()].find(p => p.name === leader) : null;
    const leaderRole = leaderPlayer ? leaderPlayer.role : null;
    let result, sP, sA;
    if (tied) { result = 'seri'; sP = 2; sA = 5; }
    else if (leaderRole === 'agen') { result = 'pembawa_win'; sP = 5; sA = -10; }
    else { result = 'agen_win'; sP = 2; sA = 10; }
    g.scores.pembawa += sP; g.scores.agen += sA;
    rd.result = result; rd.scorePembawa = sP; rd.scoreAgen = sA; rd.voteTally = tally; rd.leader = leader; rd.leaderRole = leaderRole; rd.tiedAtTop = tied;
    return rd;
  },
  openMystery(gameId, playerName) {
    const g = this.getGame(gameId);
    if (!g || !g.currentRoundData) return null;
    const player = [...g.players.values()].find(p => p.name === playerName);
    if (!player) throw new Error('Pemain tidak ditemukan');
    const colors = g.currentRoundData.mysteryData[player.id];
    if (!colors) throw new Error('Pemain tidak ditemukan');
    if (g.currentRoundData.openedMystery[playerName]) return { playerName, color: g.currentRoundData.openedMystery[playerName], alreadyOpened: true };
    const color = colors[Math.floor(Math.random() * colors.length)];
    g.currentRoundData.openedMystery[playerName] = color;
    return { playerName, color, role: player ? player.role : null, mysteryColors: colors };
  },
  endGame(gameId) {
    const g = this.getGame(gameId);
    if (!g) return null;
    if (g.phaseTimer) clearTimeout(g.phaseTimer);
    const winner = g.scores.pembawa > g.scores.agen ? 'pembawa' : 'agen';
    g.status = 'ended';
    return { winner, scores: g.scores };
  },
  getPlayerState(gameId, playerId) {
    const g = this.getGame(gameId);
    if (!g) return null;
    const player = g.players.get(playerId);
    if (!player) return null;
    const rd = g.currentRoundData;
    if (!rd) return { player: { name: player.name, role: player.role }, round: null };
    const fkey = rd.distrib[playerId];
    const frag = fkey ? fragmenBank.find(f => (f.id || f.teks) === fkey) : null;
    return {
      player: { id: playerId, name: player.name, role: player.role },
      round: { number: rd.number, phase: rd.phase, phaseEndsAt: rd.phaseEndsAt, fragmen: frag ? { id: frag.id, teks: frag.teks } : null, mysteryColors: rd.mysteryData[playerId] || [], openedMystery: rd.openedMystery[player.name] || null },
      players: [...g.players.values()].map(p => ({ id: p.id, name: p.name, connected: p.connected })),
      scores: g.scores,
    };
  },
};

function getMysteryEffect(color, playerRole) {
  const e = {
    merah: { label: 'MERAH', icon: '🔴', title: 'TERUNGKAP!', messages: ['Rahasiamu terbuka untuk semua!', 'Identitasmu terungkap!', 'Semua tahu siapa kamu!'] },
    kuning: { label: 'KUNING', icon: '🟡', title: 'BONUS CLUE', messages: ['Kamu dapat petunjuk tambahan!', 'Gunakan untuk diskusi.', 'Tanya moderator tentang kitab.'] },
    hijau: { label: 'HIJAU', icon: '🟢', title: 'AMAN', messages: ['Kamu aman dari terungkap.', 'Lanjutkan misi undercover-mu.', 'Tidak ada efek samping.'] },
  };
  return e[color];
}

const app = express();
const httpServer = http.createServer(app);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser(COOKIE_SECRET));

// Serve static + routes under /surat-terakhir/ prefix (when hosted at repo root on Railway)
// and at root / (when Railway root directory = surat-terakhir/)
const PREFIX = '/surat-terakhir';
app.use(PREFIX, express.static(PUBLIC_DIR, { maxAge: '1h' }));
app.use('/', express.static(PUBLIC_DIR, { maxAge: '1h' }));

app.get([`${PREFIX}/`, `${PREFIX}`, `${PREFIX}/index.html`, '/', '/index.html'], (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
app.get([`${PREFIX}/moderator`, `${PREFIX}/moderator.html`, '/moderator', '/moderator.html'], (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'moderator.html')));
app.get([`${PREFIX}/player`, `${PREFIX}/player.html`, '/player', '/player.html'], (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'player.html')));
app.get([`${PREFIX}/display`, `${PREFIX}/display.html`, '/display', '/display.html'], (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'display.html')));

const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, max: 50,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Terlalu banyak percobaan.' } },
});

app.post('/api/auth', authLimiter, async (req, res) => {
  try {
    const { password, name, role } = req.body;
    if (!password || !name || !['moderator', 'player'].includes(role)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Data tidak lengkap' } });
    }
    if (!await bcrypt.compare(password, appConfig.password_hash)) {
      return res.status(401).json({ success: false, error: { code: 'AUTH_INVALID', message: 'Password salah' } });
    }
    const cleanName = name.trim().substring(0, 20).replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, '');
    if (cleanName.length < 1) return res.status(400).json({ success: false, error: { code: 'NAME_INVALID', message: 'Nama tidak valid' } });
    const id = nanoid();
    const session = { id, name: cleanName, role, createdAt: Date.now() };
    const raw = JSON.stringify(session);
    res.cookie('session', raw, { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true, data: { id, name: cleanName, role } });
  } catch (e) { logger.error('auth', e); res.status(500).json({ success: false, error: { code: 'INTERNAL', message: 'Server error' } }); }
});

app.post('/api/logout', (req, res) => { res.clearCookie('session'); res.json({ success: true }); });

const healthHandler = (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()), active_games: gameService.activeGames.size, active_players: [...gameService.activeGames.values()].reduce((s, g) => s + g.players.size, 0), fragmen_total: fragmenBank.length, ai: aiService.getStatus(), version: '1.0.0' });
};
// ponytail: /health for Coolify defaults; /api/health kept for existing clients
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

app.get('/api/fragmen/stats', (req, res) => res.json({ success: true, data: fragmenService.getStats() }));
app.get('/api/ai/status', (req, res) => res.json({ success: true, data: aiService.getStatus() }));
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { kitab, tema, count } = req.body;
    if (!appConfig.round_config.some(r => [r.target, r.abu, r.agen].includes(kitab))) {
      return res.status(400).json({ success: false, error: { code: 'KITAB_INVALID', message: 'Kitab tidak dikenal' } });
    }
    const result = await aiService.generateAndSave(kitab, tema || 'umum', Math.min(Math.max(parseInt(count) || 5, 1), 20));
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ success: false, error: { code: 'AI_ERROR', message: e.message } }); }
});

const io = new SocketIOServer(httpServer, { cors: { origin: '*' }, pingTimeout: 30000, pingInterval: 25000 });

io.use((socket, next) => {
  const cookies = Object.fromEntries((socket.handshake.headers.cookie || '').split(';').map(c => { const [k, v] = c.trim().split('='); return [k, decodeURIComponent(v || '')]; }));
  const c = cookies.session;
  if (!c) return next(new Error('NO_SESSION'));
  try {
    socket.data.session = JSON.parse(c);
    next();
  } catch { next(new Error('INVALID_SESSION')); }
});

const connected = new Map();

io.on('connection', (socket) => {
  const s = socket.data.session;
  if (!s) { socket.disconnect(); return; }
  logger.info(`Socket: ${s.name} (${s.role})`);

  socket.on('player:joinGame', async ({ gameId }, ack) => {
    try {
      const g = gameService.getGame(gameId);
      if (!g) throw new Error('Game tidak ditemukan');
      if (g.status === 'ended') throw new Error('Game sudah berakhir');
      const player = { id: s.id, name: s.name, role: s.role === 'moderator' ? 'moderator' : 'pembawa', connected: true, joinedAt: Date.now(), socketId: socket.id };
      gameService.addPlayer(gameId, player);
      connected.set(socket.id, { playerId: s.id, gameId, role: s.role });
      socket.join(`room:${gameId}`);
      socket.emit('player:state', gameService.getPlayerState(gameId, s.id));
      io.to(`room:${gameId}`).emit('players:update', { players: [...g.players.values()].map(p => ({ id: p.id, name: p.name, connected: p.connected, role: p.role === 'moderator' ? 'moderator' : null })) });
      if (ack) ack({ success: true, data: gameService.getPlayerState(gameId, s.id) });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'JOIN_FAILED', message: e.message } }); }
  });

  socket.on('moderator:createGame', ({ tier, totalRounds }, ack) => {
    try {
      if (s.role !== 'moderator') throw new Error('Hanya moderator');
      const game = gameService.createGame({ tier: [1,2,3].includes(tier) ? tier : 2, totalRounds: Math.min(Math.max(totalRounds || 5, 1), 10) });
      const mp = { id: s.id, name: s.name + ' (Mod)', role: 'moderator', connected: true, joinedAt: Date.now(), socketId: socket.id };
      game.players.set(mp.id, mp);
      connected.set(socket.id, { playerId: s.id, gameId: game.id, role: 'moderator' });
      socket.join(`room:${game.id}`);
      io.to(`room:${game.id}`).emit('game:created', { gameId: game.id, tier: game.tier, totalRounds: game.totalRounds });
      if (ack) ack({ success: true, data: { gameId: game.id, tier: game.tier, totalRounds: game.totalRounds } });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'CREATE_FAILED', message: e.message } }); }
  });

  socket.on('moderator:startRound', ({ roundNumber }, ack) => {
    try {
      if (s.role !== 'moderator') throw new Error('Hanya moderator');
      const conn = [...connected.values()].find(c => c.playerId === s.id);
      if (!conn) throw new Error('Moderator belum di game');
      const gameId = conn.gameId;
      const rd = gameService.startRound(gameId, roundNumber);
      const game = gameService.getGame(gameId);
      io.to(`room:${gameId}`).emit('round:started', { roundNumber: rd.number, phase: rd.phase, phaseEndsAt: rd.phaseEndsAt });
      for (const [playerId, player] of game.players) {
        if (player.role === 'moderator') continue;
        const fkey = rd.distrib[playerId];
        const frag = fkey ? fragmenBank.find(f => (f.id || f.teks) === fkey) : null;
        const playerConn = [...connected.entries()].find(([_, c]) => c.playerId === playerId);
        if (playerConn && player.socketId) {
          io.to(playerConn[0]).emit('fragmen:assigned', {
            fragmen: frag ? { id: frag.id, teks: frag.teks } : null,
            mysteryColors: rd.mysteryData[playerId], phase: rd.phase, phaseEndsAt: rd.phaseEndsAt,
          });
        }
      }
      const modData = {};
      for (const [playerId, fkey] of Object.entries(rd.distrib)) {
        const f = fragmenBank.find(ff => (ff.id || ff.teks) === fkey);
        const player = game.players.get(playerId);
        if (f && player) {
          modData[player.name] = { fragmenId: f.id, teks: f.teks, kitab: f.kitab, tema: f.tema, gaya_bahasa: f.gaya_bahasa, role: rd.roleAssignments[playerId], mysteryColors: rd.mysteryData[playerId] };
        }
      }
      const modConn = [...connected.entries()].find(([_, c]) => c.playerId === s.id);
      if (modConn) io.to(modConn[0]).emit('moderator:roundData', { roundNumber: rd.number, kitabTarget: rd.kitabTarget, kitabAbu: rd.kitabAbu, kitabAgen: rd.kitabAgen, players: modData });
      if (ack) ack({ success: true });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'START_FAILED', message: e.message } }); }
  });

  socket.on('moderator:advancePhase', (_, ack) => {
    try {
      if (s.role !== 'moderator') throw new Error('Hanya moderator');
      const conn = [...connected.values()].find(c => c.playerId === s.id);
      const updated = gameService.advancePhase(conn.gameId);
      if (!updated) throw new Error('Sudah di fase terakhir');
      io.to(`room:${conn.gameId}`).emit('phase:changed', { phase: updated.phase, phaseEndsAt: updated.phaseEndsAt });
      if (ack) ack({ success: true });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'ADVANCE_FAILED', message: e.message } }); }
  });

  socket.on('player:castVote', ({ targetName }, ack) => {
    try {
      const conn = [...connected.values()].find(c => c.playerId === s.id);
      const game = gameService.getGame(conn.gameId);
      gameService.castVote(conn.gameId, s.name, targetName);
      for (const [sockId, sock] of io.sockets.sockets) {
        if (sock.data.session?.role === 'moderator') io.to(sockId).emit('vote:casted', { voterName: s.name, targetName });
      }
      if (ack) ack({ success: true });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'VOTE_FAILED', message: e.message } }); }
  });

  socket.on('moderator:endRound', (_, ack) => {
    try {
      if (s.role !== 'moderator') throw new Error('Hanya moderator');
      const conn = [...connected.values()].find(c => c.playerId === s.id);
      const result = gameService.endRound(conn.gameId);
      const game = gameService.getGame(conn.gameId);
      io.to(`room:${conn.gameId}`).emit('round:ended', { result: result.result, scorePembawa: result.scorePembawa, scoreAgen: result.scoreAgen, leader: result.leader, leaderRole: result.leaderRole, tiedAtTop: result.tiedAtTop, voteTally: result.voteTally });
      io.to(`room:${conn.gameId}`).emit('scores:update', { scores: game.scores });
      if (ack) ack({ success: true, data: result });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'END_ROUND_FAILED', message: e.message } }); }
  });

  socket.on('moderator:openMystery', ({ playerName }, ack) => {
    try {
      if (s.role !== 'moderator') throw new Error('Hanya moderator');
      const conn = [...connected.values()].find(c => c.playerId === s.id);
      const game = gameService.getGame(conn.gameId);
      const result = gameService.openMystery(conn.gameId, playerName);
      const player = [...game.players.values()].find(p => p.name === playerName);
      const role = player ? player.role : null;
      const effect = getMysteryEffect(result.color, role);
      io.to(`room:${conn.gameId}`).emit('mystery:opened', { playerName, color: result.color, effect, role });
      if (game.currentRoundData.mysteryData[playerName]) game.currentRoundData.openedMystery[playerName] = result.color;
      if (ack) ack({ success: true, data: { ...result, effect, role } });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'OPEN_MYSTERY_FAILED', message: e.message } }); }
  });

  socket.on('moderator:endGame', (_, ack) => {
    try {
      if (s.role !== 'moderator') throw new Error('Hanya moderator');
      const conn = [...connected.values()].find(c => c.playerId === s.id);
      const result = gameService.endGame(conn.gameId);
      io.to(`room:${conn.gameId}`).emit('game:ended', { winner: result.winner, finalScores: result.scores });
      if (ack) ack({ success: true });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'END_GAME_FAILED', message: e.message } }); }
  });

  socket.on('moderator:triggerAI', async ({ kitab, tema, count }, ack) => {
    try {
      if (s.role !== 'moderator') throw new Error('Hanya moderator');
      const result = await aiService.generateAndSave(kitab, tema || 'umum', count || 5);
      if (ack) ack({ success: true, data: result });
    } catch (e) { if (ack) ack({ success: false, error: { code: 'AI_TRIGGER_FAILED', message: e.message } }); }
  });

  socket.on('disconnect', () => {
    const conn = connected.get(socket.id);
    if (conn) {
      const game = gameService.getGame(conn.gameId);
      if (game) {
        const player = game.players.get(conn.playerId);
        if (player) {
          player.connected = false;
          io.to(`room:${conn.gameId}`).emit('players:update', { players: [...game.players.values()].map(p => ({ id: p.id, name: p.name, connected: p.connected, role: p.role === 'moderator' ? 'moderator' : null })) });
        }
      }
      connected.delete(socket.id);
    }
  });
});

let snapshotTimer = null;
function startSnapshotLoop() {
  if (snapshotTimer) clearInterval(snapshotTimer);
  snapshotTimer = setInterval(saveSnapshot, appConfig.snapshot_interval_ms);
}

function shutdown(sig) {
  logger.info(`Received ${sig}, shutting down...`);
  if (snapshotTimer) clearInterval(snapshotTimer);
  saveSnapshot();
  httpServer.close(() => { logger.info('Shutdown complete'); process.exit(0); });
  setTimeout(() => process.exit(1), 8000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

async function startup() {
  loadConfig();
  initPassword();
  loadFragmen();
  loadUsed();
  aiService.init();
  startSnapshotLoop();
  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Password: ${PASSWORD_PLAIN === 'PalingGayeng2026' ? 'default' : 'custom'}`);
    logger.info(`AI keys: ${appConfig.ai_keys.length}`);
  });
}

startup().catch(e => { logger.error('Startup failed', e); process.exit(1); });
