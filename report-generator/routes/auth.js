import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { dbGetOne, dbInsert } from '../db/init.js';

const router = Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }

  const db = req.app.locals.db;
  const existing = dbGetOne(db, 'SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const id = dbInsert(db, 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash]);

  req.session.userId = id;
  req.session.userName = name;

  res.json({ success: true, user: { id, name, email } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = req.app.locals.db;
  const user = dbGetOne(db, 'SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = user.id;
  req.session.userName = user.name;

  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

router.get('/me', requireAuth, (req, res) => {
  const db = req.app.locals.db;
  const user = dbGetOne(db, 'SELECT id, name, email FROM users WHERE id = ?', [req.session.userId]);
  res.json({ user });
});

export default router;
export { requireAuth };
