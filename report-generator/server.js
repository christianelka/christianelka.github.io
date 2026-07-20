import express from 'express';
import session from 'express-session';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, readFileSync, existsSync } from 'fs';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { initDb, dbGetOne, dbInsert, saveDb } from './db/init.js';
import authRoutes from './routes/auth.js';
import reportRoutes from './routes/report.js';
import agentRoutes from './routes/agents.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

process.on('uncaughtException', (err, origin) => {
  console.error(`[fatal] uncaughtException: ${err.message}`, { stack: err.stack, origin });
});

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandledRejection:', reason instanceof Error ? { message: reason.message, stack: reason.stack } : reason);
});

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, 'data'), { recursive: true });
mkdirSync(join(__dirname, 'uploads'), { recursive: true });
mkdirSync(join(__dirname, 'output'), { recursive: true });

const app = express();
const PORT = process.env.PORT || 3100;

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isSecure = !!process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === 'production';

app.use(session({
  name: 'report_gen.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isSecure,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

let ready = false;

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', ready: ready, timestamp: new Date().toISOString() });
});
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', ready: ready, timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'indexv2.html'));
});

app.use(express.static(join(__dirname, 'public')));

app.get('/v2', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'indexv2.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'admin.html'));
});

function seedDatabase(db) {
  const allowedEmails = ['admin@itsd.local',
    '25384131@itsd', '25384124@itsd', '25384129@itsd',
    '25384353@itsd', '25384507@itsd', '25384509@itsd',
    '25385675@itsd', '25385676@itsd', '25388385@itsd'];
  const placeholders = allowedEmails.map(() => '?').join(',');
  db.run(`DELETE FROM activity_logs WHERE user_id IN (SELECT id FROM users WHERE email NOT IN (${placeholders}))`, allowedEmails);
  db.run(`DELETE FROM reports WHERE user_id IN (SELECT id FROM users WHERE email NOT IN (${placeholders}))`, allowedEmails);
  db.run(`DELETE FROM users WHERE email NOT IN (${placeholders})`, allowedEmails);

  const adminHash = bcrypt.hashSync('admin123', 10);
  db.run('INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@itsd.local', adminHash, 'admin']);

  const teamMembers = [
    { nik: '25384131', name: 'Panji', password: 'Auto5547#' },
    { nik: '25384124', name: 'Rais', password: 'Auto2840#' },
    { nik: '25384129', name: 'Rizky', password: 'Auto9753#' },
    { nik: '25384353', name: 'Tri', password: 'Auto3099#' },
    { nik: '25384507', name: 'Anelka', password: 'Auto6325#' },
    { nik: '25384509', name: 'Afif', password: 'Auto9141#' },
    { nik: '25385675', name: 'Gangga', password: 'Auto7015#' },
    { nik: '25385676', name: 'Gilang', password: 'Auto7372#' },
    { nik: '25388385', name: 'Bintang', password: 'Auto9719#' },
  ];
  for (const m of teamMembers) {
    const hash = bcrypt.hashSync(m.password, 10);
    db.run('INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [m.name, `${m.nik}@itsd`, hash, 'user']);
  }
  console.log('[seed] Users seeded');

  const existingAgent = dbGetOne(db, 'SELECT id FROM agents LIMIT 1');
  if (!existingAgent) {
    const agentListPath = join(__dirname, 'list-agent.txt');
    if (existsSync(agentListPath)) {
      const content = readFileSync(agentListPath, 'utf-8');
      const lines = content.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const nik = parts[0];
        const name = parts.slice(1).join(' ');
        if (nik && name) {
          db.run('INSERT OR IGNORE INTO agents (nik, name, domain_id) VALUES (?, ?, ?)', [nik, name, null]);
        }
      }
      saveDb(db);
      console.log(`[seed] Loaded ${lines.length} agents from list-agent.txt`);
    }
  }
}

app.use((err, req, res, next) => {
  console.error('[server] Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const host = process.env.HOST || '0.0.0.0';
const port = Number(PORT) || 3100;

const server = app.listen(port, host, () => {
  console.log(`[report-generator] Listening on http://${host}:${port}`);
});
server.on('error', (err) => {
  console.error('[report-generator] listen error:', err);
  process.exit(1);
});

initDb().then((db) => {
  app.locals.db = db;
  seedDatabase(db);
  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/agents', agentRoutes);
  app.use('/api/admin', adminRoutes);
  ready = true;
  console.log('[report-generator] DB ready');
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
