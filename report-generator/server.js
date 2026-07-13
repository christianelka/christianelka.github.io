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

dotenv.config();

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

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'indexv2.html'));
});

app.use(express.static(join(__dirname, 'public')));

app.get('/v2', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'indexv2.html'));
});

function seedDatabase(db) {
  const existingUser = dbGetOne(db, 'SELECT id FROM users LIMIT 1');
  if (!existingUser) {
    const hash = bcrypt.hashSync('admin123', 10);
    dbInsert(db, 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', ['Admin', 'admin@itsd.local', hash]);
    console.log('[seed] Created default user: admin@itsd.local / admin123');
  }

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

initDb().then(db => {
  app.locals.db = db;

  seedDatabase(db);

  app.use('/api/auth', authRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/agents', agentRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use((err, req, res, next) => {
    console.error('[server] Unhandled error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`[report-generator] Listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
