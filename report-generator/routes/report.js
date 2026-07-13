import { Router } from 'express';
import multer from 'multer';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { requireAuth } from './auth.js';
import {
  loadFile, cleanSLA, mergeData,
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

    console.log('[generateExcel] Spawning python3:', scriptPath);
    console.log('[generateExcel] Input size:', input.length, 'bytes');

    const python = spawn('python3', [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

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

    python.on('error', (err) => {
      clearTimeout(timer);
      console.error('[generateExcel] Failed to spawn python3:', err.message);
      reject(new Error('Python not found: ' + err.message));
    });

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
          reject(new Error('Failed to parse Python output'));
        }
      } else {
        reject(new Error(stderr || `Python exited with code ${code}`));
      }
    });
  });
}

router.post('/generate',
  requireAuth,
  upload.fields([
    { name: 'slaFile', maxCount: 1 },
    { name: 'reportFile', maxCount: 1 }
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

      const slaRaw = loadFile(slaFile.path);
      const reportRaw = loadFile(reportFile.path);

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

      const agentDetails = agentNiks.map(nik => {
        const agent = dbGetOne(db, 'SELECT nik, name FROM agents WHERE nik = ?', [nik]);
        return agent || { nik, name: nik };
      });

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
          return result;
        })
        .catch(err => {
          console.error('[report] Excel generation error:', err.message);
        });

      const csvFile = excelFileName.replace('.xlsx', '.csv');
      pendingDownloads.set(excelFileName, genPromise);
      pendingDownloads.set(csvFile, genPromise);

      genPromise.finally(() => {
        pendingDownloads.delete(excelFileName);
        pendingDownloads.delete(csvFile);
      });

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

router.get('/download/:filename', requireAuth, async (req, res) => {
  const filePath = join(outputDir, req.params.filename);

  /* If file already exists, serve immediately */
  if (existsSync(filePath)) {
    return res.download(filePath, req.params.filename);
  }

  /* File may still be generating — await the exact promise tracked by the
     POST handler instead of polling the filesystem every second.
     Railway Python spawns can take up to 120s. */
  const pendingPromise = pendingDownloads.get(req.params.filename);
  if (pendingPromise) {
    try {
      await Promise.race([
        pendingPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Generation timeout')), 120000))
      ]);
    } catch (_) {
      /* Timeout or error — fall through to 404 */
    }
  }

  /* Try again after promise resolved (or if there was no pending promise) */
  if (existsSync(filePath)) {
    return res.download(filePath, req.params.filename);
  }

  /* Return HTML instead of JSON so browser's <a download> doesn't save
     the error body as .xlsx/.csv — it shows a readable error page instead. */
  res.status(404).type('text/html').send(
    '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>File Not Found</title>' +
    '<style>body{font-family:sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;background:#f5f5f5}' +
    '.card{background:white;padding:40px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);text-align:center;max-width:400px}' +
    'h2{color:#333;margin:0 0 8px}p{color:#666;margin:0 0 20px;font-size:14px}' +
    'a{color:#2563eb;text-decoration:none}a:hover{text-decoration:underline}</style>' +
    '</head><body><div class="card">' +
    '<h2>File Not Available</h2>' +
    '<p>The file could not be generated. This may be due to a timeout or server load.</p>' +
    '<a href="javascript:history.back()">← Go back and try again</a>' +
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
