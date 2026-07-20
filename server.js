import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3000', 10);
const ST_PORT = 3101;
const RG_PORT = 3102;
const HOST = '127.0.0.1';

let stReady = false;
let rgReady = false;

function startApp(name, dir, port, fatal) {
  const cwd = path.join(__dirname, dir);
  console.log('[gateway] starting ' + name + ' cwd=' + cwd + ' port=' + port);
  const child = spawn('node', ['server.js'], {
    cwd: cwd,
    env: Object.assign({}, process.env, { PORT: String(port), HOST: '127.0.0.1' }),
    stdio: ['ignore', 'inherit', 'inherit'],
    windowsHide: true,
    shell: false,
  });
  child.on('error', function (err) {
    console.error('[gateway] ' + name + ' spawn error:', err);
    if (fatal) process.exit(1);
  });
  child.on('exit', function (code, signal) {
    console.error('[gateway] ' + name + ' exited code=' + code + ' signal=' + signal);
    if (name === 'report-generator') rgReady = false;
    if (name === 'surat-terakhir') stReady = false;
    if (fatal) process.exit(code || 1);
  });
  return child;
}

function wait(ms) {
  return new Promise(function (r) {
    setTimeout(r, ms);
  });
}

async function pollReady(port, flag) {
  for (;;) {
    try {
      await new Promise(function (resolve, reject) {
        const req = http.get({ host: HOST, port: port, path: '/api/health', timeout: 1000 }, function (res) {
          res.resume();
          if (res.statusCode && res.statusCode < 500) resolve();
          else reject(new Error('bad status'));
        });
        req.on('error', reject);
        req.on('timeout', function () {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
      if (flag === 'st') stReady = true;
      if (flag === 'rg') rgReady = true;
      console.log('[gateway] backend :' + port + ' ready');
      return;
    } catch (e) {
      await wait(300);
    }
  }
}

function forward(req, res, port, urlPath) {
  const headers = Object.assign({}, req.headers, { host: HOST + ':' + port });
  const preq = http.request(
    { host: HOST, port: port, path: urlPath, method: req.method, headers: headers },
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

function rewriteTarget(url) {
  url = url || '/';
  if (url === '/health' || url.indexOf('/health?') === 0) {
    return { port: ST_PORT, path: url.replace(/^\/health/, '/api/health'), need: 'st' };
  }
  if (url === '/report-generator' || url.indexOf('/report-generator/') === 0) {
    var stripped = url.slice('/report-generator'.length) || '/';
    return {
      port: RG_PORT,
      path: stripped.charAt(0) === '/' ? stripped : '/' + stripped,
      need: 'rg',
    };
  }
  return { port: ST_PORT, path: url, need: 'st' };
}

startApp('surat-terakhir', 'surat-terakhir', ST_PORT, true);
startApp('report-generator', 'report-generator', RG_PORT, false);
pollReady(ST_PORT, 'st');
pollReady(RG_PORT, 'rg');

const server = http.createServer(function (req, res) {
  if (req.url === '/gateway-health' || (req.url && req.url.indexOf('/gateway-health?') === 0)) {
    // Railway/Coolify: healthy once main app is up (report-generator optional)
    var ok = stReady;
    res.writeHead(ok ? 200 : 503, { 'content-type': 'application/json' });
    res.end(
      JSON.stringify({
        status: ok ? 'ok' : 'starting',
        surat_terakhir: stReady,
        report_generator: rgReady,
      }),
    );
    return;
  }

  var target = rewriteTarget(req.url || '/');
  if ((target.need === 'st' && !stReady) || (target.need === 'rg' && !rgReady)) {
    res.writeHead(503, { 'content-type': 'text/plain' });
    res.end('starting');
    return;
  }
  forward(req, res, target.port, target.path);
});

server.on('upgrade', function (req, socket, head) {
  var target = rewriteTarget(req.url || '/');
  if ((target.need === 'st' && !stReady) || (target.need === 'rg' && !rgReady)) {
    socket.destroy();
    return;
  }
  var preq = http.request({
    host: HOST,
    port: target.port,
    path: target.path,
    method: req.method,
    headers: Object.assign({}, req.headers, { host: HOST + ':' + target.port }),
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
  console.log('[gateway] listening 0.0.0.0:' + PORT);
  console.log('[gateway] / -> surat-terakhir:' + ST_PORT);
  console.log('[gateway] /report-generator -> report-generator:' + RG_PORT);
});

server.on('error', function (err) {
  console.error('[gateway] listen error:', err);
  process.exit(1);
});
