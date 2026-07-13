import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', 'data', 'report.db');

export async function initDb() {
  const SQL = await initSqlJs({
    locateFile: file => join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file)
  });

  let db;
  if (existsSync(DB_PATH)) {
    const buffer = readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');

  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.run(schema);

  saveDb(db);

  return db;
}

export function saveDb(db) {
  mkdirSync(join(__dirname, '..', 'data'), { recursive: true });
  const data = db.export();
  const buffer = Buffer.from(data);
  writeFileSync(DB_PATH, buffer);
}

export function dbRun(db, sql, params = []) {
  db.run(sql, params);
  saveDb(db);
}

export function dbGetAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);

  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function dbGetOne(db, sql, params = []) {
  const rows = dbGetAll(db, sql, params);
  return rows[0] || null;
}

export function dbInsert(db, sql, params = []) {
  db.run(sql, params);
  const id = db.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0];
  saveDb(db);
  return id;
}
