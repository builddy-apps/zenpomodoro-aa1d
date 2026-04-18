import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'app.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mode TEXT NOT NULL CHECK(mode IN ('focus', 'short_break', 'long_break')),
    duration_seconds INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

export const insertSession = (mode, durationSeconds, startedAt, completedAt, completed) => {
  const stmt = db.prepare(`
    INSERT INTO sessions (mode, duration_seconds, started_at, completed_at, completed)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(mode, durationSeconds, startedAt, completedAt, completed ? 1 : 0);
  return info.lastInsertRowid;
};

export const getSessions = (limit = 20, offset = 0) => {
  const stmt = db.prepare(`
    SELECT * FROM sessions
    ORDER BY started_at DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset);
};

export const getSessionCount = () => {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM sessions');
  return stmt.get().count;
};

export const getDailyStats = (days = 7) => {
  const stmt = db.prepare(`
    SELECT 
      date(started_at) as date,
      COUNT(*) as total_sessions,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
      SUM(CASE WHEN completed = 1 THEN duration_seconds ELSE 0 END) as total_focus_seconds
    FROM sessions
    WHERE started_at >= date('now', '-' || ? || ' days')
    GROUP BY date(started_at)
    ORDER BY date DESC
  `);
  return stmt.all(days);
};

export const getWeeklyStats = () => {
  const stmt = db.prepare(`
    SELECT 
      strftime('%Y-%W', started_at) as week,
      COUNT(*) as total_sessions,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
      SUM(CASE WHEN completed = 1 THEN duration_seconds ELSE 0 END) as total_focus_seconds
    FROM sessions
    WHERE started_at >= date('now', '-28 days')
    GROUP BY strftime('%Y-%W', started_at)
    ORDER BY week DESC
  `);
  return stmt.all();
};

export const getAggregateStats = () => {
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_sessions,
      SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_sessions,
      SUM(CASE WHEN completed = 1 THEN duration_seconds ELSE 0 END) as total_seconds,
      MAX(started_at) as last_session_date
    FROM sessions
  `);
  return stmt.get();
};

export const getAllSessionsForExport = () => {
  const stmt = db.prepare('SELECT * FROM sessions ORDER BY started_at ASC');
  return stmt.all();
};

export default db;