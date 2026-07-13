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
      reject(new Error('Python script timeout (30s)'));
    }, 30000);

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
        topCategories: aggregateTopCategories(merged, 5),
        rawReport: merged,
        rawSLA: cleanedSLA
      };

      const excelFileName = `ITSD_Agent_Report_${reportDate}_${reportId}.xlsx`;
      const excelPath = join(outputDir, excelFileName);

      const agentDetails = agentNiks.map(nik => {
        const agent = dbGetOne(db, 'SELECT nik, name FROM agents WHERE nik = ?', [nik]);
        return agent || { nik, name: nik };
      });

      let excelResult = null;
      try {
        excelResult = await generateExcel(results, excelPath, reportDate, agentDetails);
      } catch (excelErr) {
        console.error('[report] Excel generation error:', excelErr.message);
      }

      const excelLink = excelResult?.success ? `/api/reports/download/${excelFileName}` : null;
      const csvFileName = excelFileName.replace('.xlsx', '.csv');
      const csvLink = excelResult?.success ? `/api/reports/download/${csvFileName}` : null;

      dbRun(db, 'UPDATE reports SET status = ?, google_sheet_link = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['completed', excelLink, reportId]);

      dbRun(db, 'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
        [req.session.userId, 'report_generated', `Report #${reportId} generated successfully`]);

      res.json({
        success: true,
        reportId,
        data: results,
        excelFile: excelFileName,
        excelLink,
        csvFile: csvFileName,
        csvLink
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

router.get('/download/:filename', requireAuth, (req, res) => {
  const filePath = join(outputDir, req.params.filename);

  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(filePath, req.params.filename);
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
