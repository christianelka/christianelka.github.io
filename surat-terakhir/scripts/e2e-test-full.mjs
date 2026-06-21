// Full E2E test: 1 moderator + 3 players, 5 rounds, mystery envelopes
import { io } from 'socket.io-client';

const BASE = 'http://localhost:3000';
let log = [];
let pass = 0, fail = 0;
const note = (msg, data) => { log.push({ msg, data }); console.log(msg, data ? JSON.stringify(data) : ''); };
const ok = (label) => { pass++; console.log(`  ✓ ${label}`); };
const bad = (label, err) => { fail++; console.log(`  ✗ ${label} — ${err}`); };

async function authSession(name, role) {
  const res = await fetch(`${BASE}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: 'PalingGayeng2026', name, role }),
  });
  const cookie = res.headers.get('set-cookie')?.split(';')[0];
  const body = await res.json();
  return { cookie, body, status: res.status };
}

function connectSocket(cookie) {
  return new Promise((resolve, reject) => {
    const s = io(BASE, { reconnection: false, extraHeaders: { Cookie: cookie }, transports: ['websocket'] });
    s.on('connect', () => resolve(s));
    s.on('connect_error', (e) => reject(new Error(e.message)));
    setTimeout(() => reject(new Error('socket timeout')), 5000);
  });
}

function emit(sock, ev, data) {
  return new Promise((resolve) => {
    sock.emit(ev, data, (ack) => resolve(ack));
  });
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

function waitFor(sock, event, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), timeout);
    sock.once(event, (data) => { clearTimeout(t); resolve(data); });
  });
}

async function runOneRound(roundNum, mod, players, totalRounds) {
  console.log(`\n--- RONDE ${roundNum}/${totalRounds} ---`);
  const roundPromise = waitFor(mod, 'round:started', 3000);
  const startAck = await emit(mod, 'moderator:startRound', { roundNumber: roundNum });
  if (!startAck.success) { bad(`start round ${roundNum}`, startAck.error?.message); return null; }
  ok(`start round ${roundNum}`);

  const roundData = await roundPromise;
  ok(`round:started event`);
  await wait(500);

  // All players receive fragmen
  for (const p of players) {
    if (!p.fragmen) { bad(`player ${p.name} no fragmen`, 'missing'); return null; }
  }
  ok(`all 3 players received fragmen`);

  // Advance: baca → diskusi
  const diskusiPromise = waitFor(mod, 'phase:changed', 2000);
  const adv1 = await emit(mod, 'moderator:advancePhase', {});
  if (!adv1.success) { bad(`advance to diskusi`, adv1.error?.message); return null; }
  await diskusiPromise;
  ok(`advance baca → diskusi`);

  // Advance: diskusi → voting
  const votingPromise = waitFor(mod, 'phase:changed', 2000);
  const adv2 = await emit(mod, 'moderator:advancePhase', {});
  if (!adv2.success) { bad(`advance to voting`, adv2.error?.message); return null; }
  await votingPromise;
  ok(`advance diskusi → voting`);
  await wait(300);

  // Players vote (each votes a different other player — never self)
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    const target = players[(i + 1) % players.length].name;
    const voteAck = await emit(p.sock, 'player:castVote', { targetName: target });
    if (!voteAck.success) { bad(`vote ${p.name} → ${target}`, voteAck.error?.message); }
    else ok(`vote ${p.name} → ${target}`);
  }

  // Open mystery envelope for the first player (target of votes)
  const votedTarget = players[0].name;
  const mysteryPromise = waitFor(mod, 'mystery:opened', 2000);
  const m1 = await emit(mod, 'moderator:openMystery', { playerName: votedTarget });
  if (!m1.success) { bad(`open mystery ${votedTarget}`, m1.error?.message); return null; }
  const openedEvent = await mysteryPromise;
  ok(`mystery opened: ${openedEvent.playerName} = ${openedEvent.color}`);

  // End round
  const endPromise = waitFor(mod, 'round:ended', 3000);
  const endAck = await emit(mod, 'moderator:endRound', {});
  if (!endAck.success) { bad(`end round`, endAck.error?.message); return null; }
  const endedEvent = await endPromise;
  ok(`round ended — leader=${endedEvent.leader} (${endedEvent.leaderRole}), score P+${endedEvent.scorePembawa} A+${endedEvent.scoreAgen}`);
  return endedEvent;
}

(async () => {
  try {
    console.log('=== FULL E2E TEST: 5 Rounds, 3 Players, 1 Mod ===\n');

    // 1. Auth all
    console.log('--- Setup ---');
    const mod = await authSession('TestMod', 'moderator');
    if (mod.status !== 200) { bad('mod auth', JSON.stringify(mod.body)); return; }
    ok('mod auth');
    const playerAuths = [];
    for (const name of ['Budi', 'Citra', 'Dani']) {
      const a = await authSession(name, 'player');
      if (a.status !== 200) { bad(`auth ${name}`, JSON.stringify(a.body)); return; }
      playerAuths.push(a);
      ok(`auth ${name}`);
    }

    // 2. Connect sockets
    const modSock = await connectSocket(mod.cookie);
    ok('mod socket connected');
    const playerSocks = [];
    for (let i = 0; i < 3; i++) {
      const ps = await connectSocket(playerAuths[i].cookie);
      playerSocks.push({ name: playerAuths[i].body.data.name, id: playerAuths[i].body.data.id, sock: ps, fragmen: null });
    }
    ok('all 3 player sockets connected');

    // 3. Mod creates game
    const createAck = await emit(modSock, 'moderator:createGame', { tier: 2, totalRounds: 5 });
    if (!createAck.success) { bad('create game', createAck.error?.message); return; }
    const gameId = createAck.data.gameId;
    ok(`game created: ${gameId}, tier=${createAck.data.tier}, rounds=5`);

    // 4. Players join — set up listeners for state AND fragmen
    for (let i = 0; i < 3; i++) {
      const p = playerSocks[i];
      p.statePromise = new Promise((resolve) => {
        p.sock.once('player:state', (s) => {
          if (s.round?.fragmen?.teks) p.fragmen = s.round.fragmen;
          resolve(s);
        });
      });
      p.fragmenPromise = new Promise((resolve) => {
        p.sock.once('fragmen:assigned', (d) => { if (d.fragmen?.teks) p.fragmen = d.fragmen; resolve(d); });
      });
      const joinAck = await emit(p.sock, 'player:joinGame', { gameId });
      if (!joinAck.success) { bad(`join ${p.name}`, joinAck.error?.message); return; }
      // Wait for at least one fragmen source
      await Promise.race([p.statePromise, p.fragmenPromise, wait(2000)]);
    }
    ok('all 3 players joined game');
    // Verify fragmen for all — after round 1 starts, they should all have one
    // (Initial join has no round yet, so we check after startRound in round 1)
    await wait(200);

    // 5. Run 5 rounds
    let totalPembawa = 0, totalAgen = 0;
    for (let r = 1; r <= 5; r++) {
      const result = await runOneRound(r, modSock, playerSocks, 5);
      if (!result) { fail++; break; }
      totalPembawa += result.scorePembawa;
      totalAgen += result.scoreAgen;
      await wait(800);
    }

    // 6. Trigger game:ended (normally moderator UI auto-calls this on last round)
    const gameEndPromise = waitFor(modSock, 'game:ended', 3000);
    const endGameAck = await emit(modSock, 'moderator:endGame', {});
    const gameEnd = await gameEndPromise.catch(() => null);
    if (gameEnd) {
      ok(`game ended — winner: ${gameEnd.winner}, final P=${gameEnd.finalScores.pembawa} A=${gameEnd.finalScores.agen}`);
    } else {
      bad('game:ended', 'no event received');
    }

    // 7. Disconnect
    for (const p of playerSocks) p.sock.disconnect();
    modSock.disconnect();
    ok('all sockets disconnected');

    console.log(`\n=== RESULTS ===`);
    console.log(`Total scores after 5 rounds: Pembawa=${totalPembawa} Agen=${totalAgen}`);
    console.log(`Passed: ${pass}, Failed: ${fail}`);
    process.exit(fail > 0 ? 1 : 0);
  } catch (e) {
    console.log(`\nFATAL: ${e.message}\n${e.stack}`);
    process.exit(2);
  }
})();
