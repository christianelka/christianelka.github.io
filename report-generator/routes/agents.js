import { Router } from 'express';
import { requireAuth } from './auth.js';
import { dbGetAll, dbInsert } from '../db/init.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const agents = dbGetAll(db, 'SELECT id, nik, name, domain_id FROM agents ORDER BY name');
  res.json({ agents });
});

router.get('/search', requireAuth, (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ agents: [] });

  const db = req.app.locals.db;
  const agents = dbGetAll(db,
    "SELECT id, nik, name, domain_id FROM agents WHERE nik LIKE ? OR name LIKE ? OR domain_id LIKE ? ORDER BY name LIMIT 20",
    [`%${q}%`, `%${q}%`, `%${q}%`]
  );

  res.json({ agents });
});

router.post('/', requireAuth, (req, res) => {
  const { nik, name, domain_id } = req.body;
  if (!nik || !name) {
    return res.status(400).json({ error: 'NIK and name required' });
  }

  const db = req.app.locals.db;
  try {
    const id = dbInsert(db, 'INSERT INTO agents (nik, name, domain_id) VALUES (?, ?, ?)', [nik, name, domain_id || null]);
    res.json({ success: true, agent: { id, nik, name, domain_id } });
  } catch (e) {
    if (e.message?.includes('UNIQUE')) {
      return res.status(409).json({ error: 'NIK already exists' });
    }
    throw e;
  }
});

export default router;
