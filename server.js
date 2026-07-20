import express from 'express';
import { createServer } from 'http';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { spawn } from 'child_process';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const INTERNAL_PORT = 3001;
const REPORT_GEN_PORT = 3102;
const SURAT_TERAKHIR_DIR = path.join(__dirname, 'surat-terakhir');
const REPORT_GEN_DIR = path.join(__dirname, 'report-generator');

// ponytail: 127.0.0.1 — Node 17+ localhost can resolve to ::1 and ECONNREFUSED
const SURAT_TARGET = `http://127.0.0.1:${INTERNAL_PORT}`;
const REPORT_TARGET = `http://127.0.0.1:${REPORT_GEN_PORT}`;

const app = express();
const server = createServer(app);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'root-proxy' }));
app.get('/api/health-root', (req, res) => res.json({ status: 'ok', service: 'root-proxy' }));

app.use('/surat-terakhir-codenames', express.static(path.join(__dirname, 'surat-terakhir-codenames'), {
  maxAge: '1h',
  dotfiles: 'ignore',
}));

const reportGenProxy = createProxyMiddleware({
  target: REPORT_TARGET,
  changeOrigin: true,
  cookiePathRewrite: { '/': '/report-generator' },
  on: {
    error(err, req, res) {
      console.error('[report-generator proxy]', err.message);
      if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('report-generator unavailable: ' + err.message);
      }
    },
  },
});

const proxy = createProxyMiddleware({
  target: SURAT_TARGET,
  changeOrigin: true,
  ws: true,
  pathFilter: ['/surat-terakhir', '/api', '/socket.io', '/moderator', '/player', '/display'],
  on: {
    error(err, req, res) {
      console.error('[surat-terakhir proxy]', err.message);
      if (res && !res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('surat-terakhir unavailable: ' + err.message);
      }
    },
  },
});

app.use('/report-generator', reportGenProxy);
app.use(proxy);

app.use(express.static(__dirname, {
  maxAge: '1h',
  dotfiles: 'ignore',
}));

server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/socket.io/')) {
    proxy.upgrade(req, socket, head);
  } else {
    socket.destroy();
  }
});

let childProcess = null;
let reportGenProcess = null;

function spawnChild(name, cwd, port, onRestart) {
  if (!existsSync(path.join(cwd, 'server.js'))) {
    console.error(`[root] ${name}: server.js not found at ${cwd}`);
    return null;
  }

  const child = spawn('node', ['server.js'], {
    cwd,
    env: { ...process.env, PORT: String(port) },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (data) => {
    for (const line of data.toString().trimEnd().split('\n')) {
      console.log(`[${name}] ${line.trimEnd()}`);
    }
  });

  child.stderr.on('data', (data) => {
    for (const line of data.toString().trimEnd().split('\n')) {
      console.error(`[${name}] ${line.trimEnd()}`);
    }
  });

  child.on('error', (err) => {
    console.error(`[${name}] Failed to spawn: ${err.message}`);
  });

  child.on('exit', (code, signal) => {
    console.log(`[${name}] exited (code=${code}, signal=${signal}), restarting in 1s...`);
    setTimeout(() => onRestart(), 1000);
  });

  console.log(`[root] Spawned ${name} (PID=${child.pid}, port=${port})`);
  return child;
}

function startSuratTerakhir() {
  childProcess = spawnChild('surat-terakhir', SURAT_TERAKHIR_DIR, INTERNAL_PORT, () => {
    childProcess = startSuratTerakhir();
  });
  return childProcess;
}

function startReportGenerator() {
  reportGenProcess = spawnChild('report-generator', REPORT_GEN_DIR, REPORT_GEN_PORT, () => {
    reportGenProcess = startReportGenerator();
  });
  return reportGenProcess;
}

function shutdown(sig) {
  console.log(`[root] Shutting down (${sig})`);
  if (childProcess && !childProcess.killed) childProcess.kill(sig);
  if (reportGenProcess && !reportGenProcess.killed) reportGenProcess.kill(sig);
  server.close(() => { console.log('[root] Server closed'); process.exit(0); });
  setTimeout(() => { process.exit(1); }, 8000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error('[root] Uncaught exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('[root] Unhandled rejection:', err);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[root] Server listening on :${PORT}`);
  console.log(`[root] /report-generator → ${REPORT_TARGET}`);
  console.log(`[root] /surat-terakhir, /api, /socket.io → ${SURAT_TARGET}`);

  try { startSuratTerakhir(); } catch (e) { console.error('[root] surat-terakhir spawn failed:', e.message); }
  try { startReportGenerator(); } catch (e) { console.error('[root] report-generator spawn failed:', e.message); }
});
