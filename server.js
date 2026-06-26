/**
 * Root Proxy Server
 *
 * Serves the Welcome Page (index.html) and all sub-projects as static files.
 * Proxies /surat-terakhir, /api, /socket.io to the surat-terakhir game backend
 * (spawned as a child process on an internal port, so the 632-line monolith
 * with Socket.io runs unchanged).
 *
 * Routing table:
 *   /                     → root/index.html (Welcome Page)
 *   /surat-terakhir/*     → proxied to surat-terakhir (port 3001)
 *   /api/*                → proxied to surat-terakhir (port 3001)
 *   /socket.io/*          → proxied to surat-terakhir (port 3001, incl. WebSocket)
 *   /invitation/*, /nuke/*, /youth/*, /blur/*, /escalation-chatbot/* → static
 */

import express from 'express';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const INTERNAL_PORT = 3001;
const SURAT_TERAKHIR_DIR = path.join(__dirname, 'surat-terakhir');

const app = express();
const server = createServer(app);

const proxy = createProxyMiddleware({
  target: `http://localhost:${INTERNAL_PORT}`,
  changeOrigin: true,
  ws: true,
  pathFilter: ['/surat-terakhir', '/api', '/socket.io'],
});

// Proxy routes MUST come before express.static — otherwise /api/health would
// be treated as a file path lookup instead of being forwarded to the backend.
// Using pathFilter (not Express path mounting) so req.url preserves the
// full path — Express strips mount prefixes, which would break proxy forwarding.
app.use(proxy);

app.use(express.static(__dirname, {
  maxAge: '1h',
  dotfiles: 'ignore',
}));

// WebSocket upgrade: only forward socket.io traffic to the proxy
server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/socket.io/')) {
    proxy.upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

let childProcess = null;

function startSuratTerakhir() {
  const child = spawn('node', ['server.js'], {
    cwd: SURAT_TERAKHIR_DIR,
    env: { ...process.env, PORT: String(INTERNAL_PORT) },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (data) => {
    for (const line of data.toString().trimEnd().split('\n')) {
      console.log(`[surat-terakhir] ${line.trimEnd()}`);
    }
  });

  child.stderr.on('data', (data) => {
    for (const line of data.toString().trimEnd().split('\n')) {
      console.error(`[surat-terakhir] ${line.trimEnd()}`);
    }
  });

  child.on('error', (err) => {
    console.error(`[surat-terakhir] Failed to spawn: ${err.message}`);
  });

  child.on('exit', (code, signal) => {
    console.log(`[surat-terakhir] exited (code=${code}, signal=${signal}), restarting in 1s...`);
    setTimeout(() => { childProcess = startSuratTerakhir(); }, 1000);
  });

  console.log(`[root] Spawned surat-terakhir (PID=${child.pid}, port=${INTERNAL_PORT})`);
  return child;
}

childProcess = startSuratTerakhir();

function shutdown(sig) {
  console.log(`[root] Shutting down (${sig})`);
  if (childProcess && !childProcess.killed) childProcess.kill(sig);
  server.close(() => { console.log('[root] Server closed'); process.exit(0); });
  // If the child hangs (e.g. mid-snapshot write), force exit after 8s
  setTimeout(() => { process.exit(1); }, 8000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[root] Server listening on :${PORT}`);
  console.log(`[root] Proxying /surat-terakhir, /api, /socket.io → :${INTERNAL_PORT}`);
});
