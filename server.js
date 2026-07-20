import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawn } from 'node:child_process';
import http from 'node:http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const APP = (process.env.APP || 'auto').toLowerCase();

const stEntry = path.join(__dirname, 'surat-terakhir', 'server.js');
const rgEntry = path.join(__dirname, 'report-generator', 'server.js');
const hasSt = existsSync(stEntry);
const hasRg = existsSync(rgEntry);

function pick() {
  if (APP === 'surat-terakhir' || APP === 'surat') return hasSt ? 'surat-terakhir' : null;
  if (APP === 'report-generator' || APP === 'report') return hasRg ? 'report-generator' : null;
  if (APP === 'gateway' || APP === 'both') return hasSt && hasRg ? 'gateway' : null;
  if (hasSt && hasRg) return 'gateway';
  if (hasSt) return 'surat-terakhir';
  if (hasRg) return 'report-generator';
  return null;
}

function runSingle(relDir) {
  process.chdir(path.join(__dirname, relDir));
  return import(pathToFileURL(path.join(__dirname, relDir, 'server.js')).href);
}

function startChild(name, relDir, port) {
  const cwd = path.join(__dirname, relDir);
  const child = spawn(process.execPath, [path.join(cwd, 'server.js')], {
    cwd: cwd,
    env: Object.assign({}, process.env, { PORT: String(port), HOST: '127.0.0.1' }),
    stdio: ['ignore', 'inherit', 'inherit'],
    windowsHide: true,
  });
  child.on('error', function (err) {
    console.error('[gateway] ' + name + ' spawn error:', err.message);
  });
  child.on('exit', function (code, signal) {
    console.error('[gateway] ' + name + ' exited code=' + code + ' signal=' + signal);
    if (name === 'surat-terakhir') process.exit(code || 1);
  });
  return child;
}

function wait(ms) {
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}

async function untilReady(port, label) {
  for (var i = 0; i < 80; i++) {
    try {
      await new Promise(function (resolve, reject) {
        var req = http.get({ host: '127.0.0.1', port: port, path: '/api/health', timeout: 1000 }, function (res) {
          res.resume();
          if (res.statusCode && res.statusCode < 500) resolve();
          else reject(new Error('bad'));
        });
        req.on('error', reject);
        req.on('timeout', function () {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
      console.log('[gateway] ' + label + ' ready on ' + port);
      return true;
    } catch (e) {
      await wait(250);
    }
  }
  console.error('[gateway] ' + label + ' not ready');
  return false;
}

function proxy(req, res, port, urlPath) {
  var headers = Object.assign({}, req.headers, { host: '127.0.0.1:' + port });
  var preq = http.request(
    { host: '127.0.0.1', port: port, path: urlPath, method: req.method, headers: headers },
    function (pres) {
      res.writeHead(pres.statusCode || 502, pres.headers);
      pres.pipe(res);
    },
  );
  preq.on('error', function (err) {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain' });
    res.end('bad gateway: ' + err.message);
  });
  req.pipe(preq);
}

function targetFor(url) {
  url = url || '/';
  if (url === '/gateway-health' || url.indexOf('/gateway-health?') === 0) return { kind: 'health' };
  if (url === '/health' || url.indexOf('/health?') === 0) {
    return { port: 3101, path: '/api/health', app: 'st' };
  }
  if (url === '/report-generator' || url.indexOf('/report-generator/') === 0) {
    var stripped = url.slice('/report-generator'.length) || '/';
    if (stripped.charAt(0) !== '/') stripped = '/' + stripped;
    return { port: 3102, path: stripped, app: 'rg' };
  }
  return { port: 3101, path: url, app: 'st' };
}

async function runGateway() {
  var ST = 3101;
  var RG = 3102;
  startChild('surat-terakhir', 'surat-terakhir', ST);
  startChild('report-generator', 'report-generator', RG);
  var stOk = false;
  var rgOk = false;
  untilReady(ST, 'surat-terakhir').then(function (ok) {
    stOk = ok;
  });
  untilReady(RG, 'report-generator').then(function (ok) {
    rgOk = ok;
  });

  var server = http.createServer(function (req, res) {
    var t = targetFor(req.url);
    if (t.kind === 'health') {
      var ok = stOk;
      res.writeHead(ok ? 200 : 503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ status: ok ? 'ok' : 'starting', surat_terakhir: stOk, report_generator: rgOk }));
      return;
    }
    if ((t.app === 'st' && !stOk) || (t.app === 'rg' && !rgOk)) {
      res.writeHead(503, { 'content-type': 'text/plain' });
      res.end('starting');
      return;
    }
    proxy(req, res, t.port, t.path);
  });

  server.on('upgrade', function (req, socket, head) {
    var t = targetFor(req.url);
    if (t.kind === 'health' || (t.app === 'st' && !stOk) || (t.app === 'rg' && !rgOk)) {
      socket.destroy();
      return;
    }
    var preq = http.request({
      host: '127.0.0.1',
      port: t.port,
      path: t.path,
      method: req.method,
      headers: Object.assign({}, req.headers, { host: '127.0.0.1:' + t.port }),
    });
    preq.on('upgrade', function (pres, psocket, phead) {
      var lines = ['HTTP/1.1 101 Switching Protocols'];
      Object.keys(pres.headers).forEach(function (k) {
        var v = pres.headers[k];
        lines.push(k + ': ' + (Array.isArray(v) ? v.join(', ') : v));
      });
      socket.write(lines.join('\r\n') + '\r\n\r\n');
      if (phead && phead.length) socket.write(phead);
      if (head && head.length) psocket.write(head);
      psocket.pipe(socket);
      socket.pipe(psocket);
    });
    preq.on('error', function () {
      socket.destroy();
    });
    preq.end();
  });

  server.listen(PORT, '0.0.0.0', function () {
    console.log('[gateway] 0.0.0.0:' + PORT + '  / -> surat-terakhir  /report-generator -> report-generator');
  });
  server.on('error', function (err) {
    console.error('[gateway] listen error', err);
    process.exit(1);
  });
}

const mode = pick();
console.log('[boot] APP=' + APP + ' mode=' + mode + ' hasSt=' + hasSt + ' hasRg=' + hasRg);
if (!mode) {
  console.error('[boot] No app found under ' + __dirname);
  process.exit(1);
}
if (mode === 'gateway') await runGateway();
else await runSingle(mode);
