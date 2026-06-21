// E2E test: 1 moderator + 3 players, full flow
import { io } from 'socket.io-client';
import bcrypt from 'bcryptjs';

const BASE = 'http://localhost:3000';
let log = [];
const note = (msg, data) => { log.push({ msg, data }); console.log(msg, data ? JSON.stringify(data) : ''); };

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

(async () => {
  try {
    // 1. Auth moderator
    note('--- 1. Mod auth ---');
    const mod = await authSession('TestMod', 'moderator');
    note('mod auth', mod);

    // 2. Mod socket + create game
    note('--- 2. Mod create game ---');
    const modSock = await connectSocket(mod.cookie);
    const createAck = await emit(modSock, 'moderator:createGame', { tier: 2, totalRounds: 3 });
    const gameId = createAck?.data?.gameId;
    note('create game', createAck);

    // 3. 3 players auth + join
    note('--- 3. 3 players join ---');
    const players = [];
    for (const name of ['Budi', 'Citra', 'Dani']) {
      const p = await authSession(name, 'player');
      const ps = await connectSocket(p.cookie);
      const joinAck = await emit(ps, 'player:joinGame', { gameId });
      players.push({ name, sock: ps, joinAck });
      note(`join ${name}`, joinAck);
    }

    // 4. Wait for mod to receive players:update
    note('--- 4. Mod sees players ---');
    await new Promise((r) => {
      modSock.once('players:update', (d) => { note('players:update', { count: d.players.length, names: d.players.map(p => p.name) }); r(); });
      setTimeout(r, 2000);
    });

    // 5. Mod start round 1
    note('--- 5. Mod start round 1 ---');
    modSock.once('round:started', (d) => { note('round:started', d); });
    modSock.once('fragmen:assigned', (d) => { note('mod: fragmen:assigned', d); });
    players[0].sock.once('fragmen:assigned', (d) => { note('Budi: fragmen', d); });
    players[1].sock.once('fragmen:assigned', (d) => { note('Citra: fragmen', d); });
    players[2].sock.once('fragmen:assigned', (d) => { note('Dani: fragmen', d); });
    const startAck = await emit(modSock, 'moderator:startRound', { roundNumber: 1 });
    note('start ack', startAck);
    await new Promise((r) => setTimeout(r, 1500));

    // 6. Mod advance to diskusi
    note('--- 6. Mod advance phase ---');
    modSock.once('phase:changed', (d) => { note('phase:changed', d); });
    const advAck = await emit(modSock, 'moderator:advancePhase', {});
    note('advance ack', advAck);
    await new Promise((r) => setTimeout(r, 1000));

    // 7. Mod advance to voting
    await emit(modSock, 'moderator:advancePhase', {});
    await new Promise((r) => setTimeout(r, 800));

    // 8. Players vote
    note('--- 7. Players vote ---');
    for (const p of players) {
      const voteAck = await emit(p.sock, 'player:castVote', { targetName: players[0].name });
      note(`${p.name} vote`, voteAck);
    }
    await new Promise((r) => setTimeout(r, 800));

    // 9. Mod end round
    note('--- 8. Mod end round ---');
    modSock.once('round:ended', (d) => { note('round:ended', d); });
    modSock.once('scores:update', (d) => { note('scores:update', d); });
    const endAck = await emit(modSock, 'moderator:endRound', {});
    note('end ack', endAck);
    await new Promise((r) => setTimeout(r, 1000));

    note('--- DONE ---');
    note('test completed', { gameId, totalLog: log.length });
  } catch (e) {
    note('FATAL', { error: e.message, stack: e.stack });
  } finally {
    process.exit(0);
  }
})();
