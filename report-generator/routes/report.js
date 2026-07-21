import { Router } from 'express';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { requireAuth } from './auth.js';
import {
  loadFile, cleanSLA, mergeData, mergeFileParts,
  aggregateCancelled, aggregateResolved,
  aggregateInprogress, aggregateAssigned,
  aggregateOlaResponse, aggregateTopCategories
} from '../services/data-processor.js';
import { dbInsert, dbRun, dbGetAll, dbGetOne } from '../db/init.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = join(__dirname, '..', 'uploads');
const outputDir = join(__dirname, '..', 'output');

mkdirSync(outputDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    const ext = file.originalname.split('.').pop();
    cb(null, `${unique}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.xlsx', '.xls', '.csv'];
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx, .xls, .csv files allowed'));
    }
  }
});

const router = Router();

/* Tracks file-generation promises so the download route can await the
   exact promise instead of polling the filesystem in a sleep loop.
   Key: filename (e.g. "ITSD_Agent_Report_2024-01-01_123.xlsx")
   Value: Promise that resolves when the Python script finishes. */
const pendingDownloads = new Map();

function generateExcel(data, outputPath, reportDate, agents = []) {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, '..', 'scripts', 'generate_excel.py');

    if (!existsSync(scriptPath)) {
      return reject(new Error('generate_excel.py not found at: ' + scriptPath));
    }

    const input = JSON.stringify({ data, outputPath, reportDate, agents });

    const candidates = [
      process.env.PYTHON,
      process.env.PYTHON3,
      '/usr/bin/python3',
      '/usr/local/bin/python3',
      'python3',
      'python',
    ].filter(Boolean);
    let python = null;

    function trySpawn(bin) {
      console.log('[generateExcel] Spawning', bin, ':', scriptPath);
      return spawn(bin, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] });
    }

    function attemptNext() {
      const bin = candidates.shift();
      if (!bin) {
        return reject(new Error('Python not found. Tried python3 and python. Ensure Dockerfile installs python3+openpyxl.'));
      }
      const proc = trySpawn(bin);
      proc.on('error', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('[generateExcel]', bin, 'not found, trying next...');
          attemptNext();
        } else {
          reject(new Error('Failed to spawn ' + bin + ': ' + err.message));
        }
      });
      runScript(proc);
    }

    function runScript(proc) {
      python = proc;
      const timer = setTimeout(() => {
        python.kill();
        reject(new Error('Python script timeout (120s)'));
      }, 120000);

      let stdout = '';
      let stderr = '';

      python.stdin.write(input);
      python.stdin.end();

      python.stdout.on('data', (chunk) => { stdout += chunk; });
      python.stderr.on('data', (chunk) => { stderr += chunk; });

      python.on('close', (code) => {
        clearTimeout(timer);
        console.log('[generateExcel] Python exited with code:', code);
        if (stderr) console.log('[generateExcel] stderr:', stderr);
        if (code === 0) {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch (e) {
            console.error('[generateExcel] Failed to parse output:', stdout);
            reject(new Error('Failed to parse Python output: ' + stdout.slice(0, 200)));
          }
        } else {
          reject(new Error(stderr || `Python exited with code ${code}`));
        }
      });
    }

    attemptNext();
  });
}

router.post('/generate',
  requireAuth,
  upload.fields([
    { name: 'slaFile', maxCount: 1 },
    { name: 'slaFilePart2', maxCount: 1 },
    { name: 'slaFilePart3', maxCount: 1 },
    { name: 'reportFile', maxCount: 1 },
    { name: 'reportFilePart2', maxCount: 1 },
    { name: 'reportFilePart3', maxCount: 1 },
  ]),
  async (req, res) => {
    const db = req.app.locals.db;

    try {
      const slaFile = req.files?.slaFile?.[0];
      const reportFile = req.files?.reportFile?.[0];

      if (!slaFile || !reportFile) {
        return res.status(400).json({ error: 'Both SLA and Report files required' });
      }

      let agentNiks = [];
      if (req.body.agentNiks) {
        try {
          agentNiks = JSON.parse(req.body.agentNiks);
        } catch {
          agentNiks = req.body.agentNiks.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      const reportDate = req.body.reportDate || new Date().toISOString().split('T')[0];

      const reportId = dbInsert(db,
        'INSERT INTO reports (user_id, report_date, sla_file_path, report_file_path, agent_nicks, status) VALUES (?, ?, ?, ?, ?, ?)',
        [req.session.userId, reportDate, slaFile.path, reportFile.path, JSON.stringify(agentNiks), 'processing']
      );

      const slaParts = [loadFile(slaFile.path)];
      if (req.files?.slaFilePart2?.[0]) slaParts.push(loadFile(req.files.slaFilePart2[0].path));
      if (req.files?.slaFilePart3?.[0]) slaParts.push(loadFile(req.files.slaFilePart3[0].path));

      const reportParts = [loadFile(reportFile.path)];
      if (req.files?.reportFilePart2?.[0]) reportParts.push(loadFile(req.files.reportFilePart2[0].path));
      if (req.files?.reportFilePart3?.[0]) reportParts.push(loadFile(req.files.reportFilePart3[0].path));

      const slaRaw = mergeFileParts(slaParts);
      const reportRaw = mergeFileParts(reportParts);

      const cleanedSLA = cleanSLA(slaRaw);
      const merged = mergeData(reportRaw, cleanedSLA);

      const cancelledResult = aggregateCancelled(merged, agentNiks);
      const resolvedResult = aggregateResolved(merged, agentNiks);
      const olaResult = aggregateOlaResponse(merged);

      const results = {
        cancelled: cancelledResult.data || [],
        cancelledAgents: cancelledResult.agents || [],
        resolved: resolvedResult.data || [],
        resolvedAgents: resolvedResult.agents || [],
        inprogress: aggregateInprogress(merged, agentNiks),
        assigned: aggregateAssigned(merged, agentNiks),
        olaResponse: olaResult.data || [],
        olaDate: olaResult.date || reportDate,
        topCategories: aggregateTopCategories(merged, 5)
      };

      /* Generate Excel payload separately (no rawReport/rawSLA — those bloat memory
         and cause Railway OOM kills, which crash the child process + wipe sessions) */
      const excelPayload = {
        ...results,
        rawReport: merged,
        rawSLA: cleanedSLA
      };

      const excelFileName = `ITSD_Agent_Report_${reportDate}_${reportId}.xlsx`;
      const excelPath = join(outputDir, excelFileName);
      const csvFile = excelFileName.replace('.xlsx', '.csv');

      const agentDetails = agentNiks.map(nik => {
        const agent = dbGetOne(db, 'SELECT nik, name FROM agents WHERE nik = ?', [nik]);
        return agent || { nik, name: nik };
      }).sort((a, b) => Number(a.nik) - Number(b.nik));

      /* Respond immediately before Excel generation to avoid Railway 504 timeout */
      res.json({
        success: true,
        reportId,
        data: results,
        excelFile: excelFileName,
        excelLink: `/api/reports/download/${excelFileName}`,
        csvFile: excelFileName.replace('.xlsx', '.csv'),
        csvLink: `/api/reports/download/${excelFileName.replace('.xlsx', '.csv')}`
      });

      /* Post-response operations — isolated try/catch so failures don't crash the process
         (which would destroy in-memory sessions and log the user out) */
      try {
        dbRun(db, 'UPDATE reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['completed', reportId]);

        dbRun(db, 'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
          [req.session.userId, 'report_generated', `Report #${reportId} generated successfully`]);
      } catch (postError) {
        console.error('[report] Post-response DB error (non-fatal):', postError);
      }

      /* Generate Excel fire-and-forget after response sent (Railway 504 workaround).
         The promise is tracked in pendingDownloads so GET /download/:filename can
         await completion instead of polling the filesystem. */
      const genPromise = generateExcel(excelPayload, excelPath, reportDate, agentDetails)
        .then(result => {
          console.log('[report] Excel generated:', excelFileName);
          pendingDownloads.delete(excelFileName);
          pendingDownloads.delete(csvFile);
          return result;
        })
        .catch(err => {
          console.error('[report] Excel generation error:', err.message);
          pendingDownloads.set(excelFileName, { error: err.message });
          pendingDownloads.set(csvFile, { error: err.message });
        });

      pendingDownloads.set(excelFileName, genPromise);
      pendingDownloads.set(csvFile, genPromise);

    } catch (error) {
      console.error('[report] Generation error:', error);

      if (req.body._reportId) {
        dbRun(db, 'UPDATE reports SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['failed', error.message, req.body._reportId]);
      }

      res.status(500).json({ error: 'Report generation failed: ' + error.message });
    }
  }
);

function downloadReadyHtml(filename) {
  const safe = String(filename).replace(/[^a-zA-Z0-9._-]/g, '');
  return (
    '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Download</title>' +
    '<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb}' +
    '.card{background:white;padding:40px 48px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);text-align:center;max-width:420px}' +
    'h3{margin:0 0 6px;color:#111827;font-size:16px}p{margin:0;color:#6b7280;font-size:13px;line-height:1.5}' +
    '</style></head><body><div class="card">' +
    '<h3>Download dimulai...</h3>' +
    '<p>Tab ini akan tertutup otomatis.</p>' +
    '<script>(function(){' +
    'var u=' + JSON.stringify('/api/reports/download/' + safe + '?raw=1') + ';' +
    'var a=document.createElement("a");a.href=u;a.download=' + JSON.stringify(safe) + ';' +
    'document.body.appendChild(a);a.click();' +
    'setTimeout(function(){try{window.close()}catch(e){}},1200);' +
    '})();</script>' +
    '</div></body></html>'
  );
}

function downloadWaitHtml() {
  return (
    '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Generating...</title>' +
    '<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb}' +
    '.card{background:white;padding:40px 48px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);text-align:center;max-width:420px}' +
    '.spinner{width:36px;height:36px;border:3px solid #e5e7eb;border-top-color:#6366f1;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px}' +
    '@keyframes spin{to{transform:rotate(360deg)}}' +
    'h3{margin:0 0 6px;color:#111827;font-size:16px}p{margin:0;color:#6b7280;font-size:13px;line-height:1.5}' +
    '</style></head><body><div class="card">' +
    '<div class="spinner"></div>' +
    '<h3>Generating Report...</h3>' +
    '<p>File sedang diproses. Download dimulai otomatis saat siap,<br>lalu tab ini tertutup sendiri.</p>' +
    '<script>setTimeout(function(){location.reload()},2500);</script>' +
    '</div></body></html>'
  );
}

function downloadFailHtml(message) {
  return (
    '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Generation Failed</title>' +
    '<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb}' +
    '.card{background:white;padding:40px 48px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);text-align:center;max-width:500px}' +
    'h3{margin:0 0 6px;color:#dc2626;font-size:16px}p{margin:0 0 8px;color:#6b7280;font-size:13px;line-height:1.5}' +
    'pre{background:#f3f4f6;padding:10px 14px;border-radius:6px;font-size:11px;color:#374151;text-align:left;overflow-x:auto;white-space:pre-wrap}' +
    'a{display:inline-block;padding:8px 20px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500}' +
    '</style></head><body><div class="card">' +
    '<h3>Report Generation Failed</h3>' +
    '<p>Gagal membuat file Excel. Silakan coba generate ulang.</p>' +
    '<pre>' + String(message || '').replace(/</g, '&lt;').slice(0, 500) + '</pre>' +
    '<br><a href="javascript:window.close()">Tutup</a>' +
    '</div></body></html>'
  );
}

router.get('/download/:filename', requireAuth, async (req, res) => {
  const filename = req.params.filename;
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return res.status(400).send('Invalid filename');
  }
  const filePath = join(outputDir, filename);
  const wantsRaw = req.query.raw === '1';

  // Wait for in-flight generation before serving (avoids half-written corrupt xlsx)
  if (pendingDownloads.has(filename)) {
    const entry = pendingDownloads.get(filename);
    if (entry && typeof entry === 'object' && entry.error) {
      return res.status(500).type('text/html').send(downloadFailHtml(entry.error));
    }
    if (entry && typeof entry.then === 'function') {
      try {
        await entry;
      } catch (err) {
        return res.status(500).type('text/html').send(downloadFailHtml(err.message || String(err)));
      }
      const after = pendingDownloads.get(filename);
      if (after && typeof after === 'object' && after.error) {
        return res.status(500).type('text/html').send(downloadFailHtml(after.error));
      }
    }
  }

  if (existsSync(filePath)) {
    if (wantsRaw || (req.headers.accept || '').includes('application/octet-stream')) {
      return res.download(filePath, filename);
    }
    // Browser tab: trigger download then close
    if ((req.headers.accept || '').includes('text/html')) {
      return res.type('text/html').send(downloadReadyHtml(filename));
    }
    return res.download(filePath, filename);
  }

  if (pendingDownloads.has(filename)) {
    return res.status(202).type('text/html').send(downloadWaitHtml());
  }

  return res.status(404).type('text/html').send(
    '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Not Found</title>' +
    '<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f9fafb}' +
    '.card{background:white;padding:40px 48px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);text-align:center;max-width:420px}' +
    'h3{margin:0 0 6px;color:#111827;font-size:16px}p{margin:0 0 16px;color:#6b7280;font-size:13px;line-height:1.5}' +
    'a{display:inline-block;padding:8px 20px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-size:13px;font-weight:500}' +
    '</style></head><body><div class="card">' +
    '<h3>File Not Found</h3>' +
    '<p>File tidak ditemukan atau sudah expired.<br>Silakan generate ulang.</p>' +
    '<a href="javascript:window.close()">Tutup</a>' +
    '</div></body></html>'
  );
});

router.get('/', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const reports = dbGetAll(db,
    'SELECT id, report_date, status, google_sheet_link as excel_link, summary_text, created_at FROM reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.session.userId]
  );

  res.json({ reports });
});

router.get('/:id', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const report = dbGetOne(db,
    'SELECT * FROM reports WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.userId]
  );

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  res.json({ report });
});

export default router;
