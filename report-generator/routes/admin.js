import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { requireAdmin } from './auth.js';
import { dbGetAll, dbGetOne, dbInsert, dbRun } from '../db/init.js';

const router = Router();

router.use(requireAdmin);

router.get('/users', (req, res) => {
  const db = req.app.locals.db;
  const users = dbGetAll(db,
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
      (SELECT COUNT(*) FROM activity_logs al WHERE al.user_id = u.id) as total_actions,
      (SELECT COUNT(*) FROM reports r WHERE r.user_id = u.id) as total_reports,
      (SELECT MAX(al.created_at) FROM activity_logs al WHERE al.user_id = u.id) as last_active
    FROM users u ORDER BY u.created_at DESC`
  );
  res.json({ users });
});

router.post('/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password required' });
  }

  const db = req.app.locals.db;
  const existing = dbGetOne(db, 'SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const userRole = role === 'admin' ? 'admin' : 'user';
  const id = dbInsert(db, 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, hash, userRole]);

  res.json({ success: true, user: { id, name, email, role: userRole } });
});

router.put('/users/:id', (req, res) => {
  const { name, email, password, role } = req.body;
  const db = req.app.locals.db;
  const user = dbGetOne(db, 'SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (email && email !== user.email) {
    const existing = dbGetOne(db, 'SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
    if (existing) {
      return res.status(409).json({ error: 'Email already taken' });
    }
  }

  const updatedName = name || user.name;
  const updatedEmail = email || user.email;
  const updatedRole = role === 'admin' ? 'admin' : (role === 'user' ? 'user' : user.role);

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    dbRun(db, 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [updatedName, updatedEmail, hash, updatedRole, req.params.id]);
  } else {
    dbRun(db, 'UPDATE users SET name = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [updatedName, updatedEmail, updatedRole, req.params.id]);
  }

  res.json({ success: true, user: { id: parseInt(req.params.id), name: updatedName, email: updatedEmail, role: updatedRole } });
});

router.delete('/users/:id', (req, res) => {
  const db = req.app.locals.db;
  const user = dbGetOne(db, 'SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.id === req.session.userId) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }

  dbRun(db, 'DELETE FROM activity_logs WHERE user_id = ?', [req.params.id]);
  dbRun(db, 'UPDATE reports SET user_id = NULL WHERE user_id = ?', [req.params.id]);
  dbRun(db, 'DELETE FROM users WHERE id = ?', [req.params.id]);

  res.json({ success: true });
});

router.get('/activity', (req, res) => {
  const db = req.app.locals.db;
  const { user_id, action, limit = 100, offset = 0 } = req.query;

  let sql = `SELECT al.*, u.name as user_name, u.email as user_email
    FROM activity_logs al LEFT JOIN users u ON al.user_id = u.id WHERE 1=1`;
  const params = [];

  if (user_id) { sql += ' AND al.user_id = ?'; params.push(user_id); }
  if (action) { sql += ' AND al.action = ?'; params.push(action); }

  sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const logs = dbGetAll(db, sql, params);

  let countSql = 'SELECT COUNT(*) as total FROM activity_logs WHERE 1=1';
  const countParams = [];
  if (user_id) { countSql += ' AND user_id = ?'; countParams.push(user_id); }
  if (action) { countSql += ' AND action = ?'; countParams.push(action); }
  const { total } = dbGetOne(db, countSql, countParams);

  res.json({ logs, total });
});

router.get('/stats', (req, res) => {
  const db = req.app.locals.db;

  const totalUsers = dbGetOne(db, 'SELECT COUNT(*) as count FROM users');
  const totalReports = dbGetOne(db, 'SELECT COUNT(*) as count FROM reports');
  const totalActions = dbGetOne(db, 'SELECT COUNT(*) as count FROM activity_logs');

  const today = new Date().toISOString().split('T')[0];
  const todayLogins = dbGetOne(db,
    "SELECT COUNT(*) as count FROM activity_logs WHERE action = 'login' AND DATE(created_at) = ?", [today]);
  const todayReports = dbGetOne(db,
    "SELECT COUNT(*) as count FROM reports WHERE DATE(created_at) = ?", [today]);

  const topUsers = dbGetAll(db,
    `SELECT u.id, u.name, u.email, u.role,
      COUNT(al.id) as action_count
    FROM users u LEFT JOIN activity_logs al ON u.id = al.user_id
    GROUP BY u.id ORDER BY action_count DESC LIMIT 10`
  );

  const recentActivity = dbGetAll(db,
    `SELECT al.*, u.name as user_name FROM activity_logs al
    LEFT JOIN users u ON al.user_id = u.id ORDER BY al.created_at DESC LIMIT 10`
  );

  const weeklyActivity = dbGetAll(db,
    `SELECT DATE(created_at) as date, COUNT(*) as count
    FROM activity_logs WHERE created_at >= DATE('now', '-7 days')
    GROUP BY DATE(created_at) ORDER BY date`
  );

  res.json({
    totalUsers: totalUsers.count,
    totalReports: totalReports.count,
    totalActions: totalActions.count,
    todayLogins: todayLogins.count,
    todayReports: todayReports.count,
    topUsers,
    recentActivity,
    weeklyActivity
  });
});

export default router;
