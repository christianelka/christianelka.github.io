import { initDb, saveDb } from './init.js';
import bcrypt from 'bcryptjs';
import { mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

async function seed() {
  const db = await initDb();

  const hash = bcrypt.hashSync('password123', 10);
  db.run('INSERT OR IGNORE INTO users (name, email, password) VALUES (?, ?, ?)', ['Admin', 'admin@itoc.local', hash]);

  const agentDutyPath = join(__dirname, '..', 'list-agent.txt');
  const agentDutyContent = readFileSync(agentDutyPath, 'utf-8');
  const agentLines = agentDutyContent.trim().split('\n');

  for (const line of agentLines) {
    const parts = line.trim().split(/\s+/);
    const nik = parts[0];
    const name = parts.slice(1).join(' ');
    if (nik && name) {
      db.run('INSERT OR IGNORE INTO agents (nik, name, domain_id) VALUES (?, ?, ?)', [nik, name, null]);
    }
  }

  const fallbackAgents = [
    ['NIK001', 'Budi Santoso', 'D001'],
    ['NIK002', 'Dewi Lestari', 'D002'],
    ['NIK003', 'Ahmad Fauzi', 'D003'],
  ];

  for (const [nik, name, domainId] of fallbackAgents) {
    db.run('INSERT OR IGNORE INTO agents (nik, name, domain_id) VALUES (?, ?, ?)', [nik, name, domainId]);
  }

  saveDb(db);
  db.close();

  console.log(`Seed complete: 1 user (admin@itoc.local / password123), ${agentLines.length + fallbackAgents.length} agents`);
}

seed().catch(console.error);
