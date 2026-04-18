import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'app.db'));
db.pragma('journal_mode = WAL');

// Check if data already exists
const count = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
if (count.count > 0) {
  console.log('Data already seeded, skipping...');
  process.exit(0);
}

// Helper function to generate ISO timestamp
function daysAgo(days, hour = 9, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// Helper to add minutes to a timestamp
function addMinutes(isoString, minutes) {
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
}

const insertAll = db.transaction(() => {
  const stmt = db.prepare(`
    INSERT INTO sessions (mode, duration_seconds, started_at, completed_at, completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Day 30 - Morning work session
  stmt.run('focus', 1500, daysAgo(30, 9, 0), addMinutes(daysAgo(30, 9, 0), 25), 1, daysAgo(30, 9, 25));
  stmt.run('short_break', 300, daysAgo(30, 9, 26), addMinutes(daysAgo(30, 9, 26), 5), 1, daysAgo(30, 9, 31));
  stmt.run('focus', 1500, daysAgo(30, 9, 32), addMinutes(daysAgo(30, 9, 32), 25), 1, daysAgo(30, 9, 57));
  stmt.run('short_break', 300, daysAgo(30, 9, 58), addMinutes(daysAgo(30, 9, 58), 5), 1, daysAgo(30, 10, 3));
  stmt.run('focus', 900, daysAgo(30, 10, 4), addMinutes(daysAgo(30, 10, 4), 15), 0, daysAgo(30, 10, 19));

  // Day 28 - Productive afternoon
  stmt.run('focus', 1500, daysAgo(28, 13, 30), addMinutes(daysAgo(28, 13, 30), 25), 1, daysAgo(28, 13, 55));
  stmt.run('short_break', 300, daysAgo(28, 13, 56), addMinutes(daysAgo(28, 13, 56), 5), 1, daysAgo(28, 14, 1));
  stmt.run('focus', 1500, daysAgo(28, 14, 2), addMinutes(daysAgo(28, 14, 2), 25), 1, daysAgo(28, 14, 27));
  stmt.run('short_break', 300, daysAgo(28, 14, 28), addMinutes(daysAgo(28, 14, 28), 5), 1, daysAgo(28, 14, 33));
  stmt.run('focus', 1500, daysAgo(28, 14, 34), addMinutes(daysAgo(28, 14, 34), 25), 1, daysAgo(28, 14, 59));
  stmt.run('short_break', 300, daysAgo(28, 15, 0), addMinutes(daysAgo(28, 15, 0), 5), 1, daysAgo(28, 15, 5));
  stmt.run('focus', 1500, daysAgo(28, 15, 6), addMinutes(daysAgo(28, 15, 6), 25), 1, daysAgo(28, 15, 31));
  stmt.run('long_break', 900, daysAgo(28, 15, 32), addMinutes(daysAgo(28, 15, 32), 15), 1, daysAgo(28, 15, 47));

  // Day 25 - Scattered work
  stmt.run('focus', 1500, daysAgo(25, 8, 15), addMinutes(daysAgo(25, 8, 15), 25), 1, daysAgo(25, 8, 40));
  stmt.run('short_break', 300, daysAgo(25, 8, 41), addMinutes(daysAgo(25, 8, 41), 5), 1, daysAgo(25, 8, 46));
  stmt.run('focus', 720, daysAgo(25, 8, 47), addMinutes(daysAgo(25, 8, 47), 12), 0, daysAgo(25, 8, 59));

  // Day 22 - Deep work morning
  stmt.run('focus', 1500, daysAgo(22, 7, 0), addMinutes(daysAgo(22, 7, 0), 25), 1, daysAgo(22, 7, 25));
  stmt.run('short_break', 300, daysAgo(22, 7, 26), addMinutes(daysAgo(22, 7, 26), 5), 1, daysAgo(22, 7, 31));
  stmt.run('focus', 1500, daysAgo(22, 7, 32), addMinutes(daysAgo(22, 7, 32), 25), 1, daysAgo(22, 7, 57));
  stmt.run('short_break', 300, daysAgo(22, 7, 58), addMinutes(daysAgo(22, 7, 58), 5), 1, daysAgo(22, 8, 3));
  stmt.run('focus', 1500, daysAgo(22, 8, 4), addMinutes(daysAgo(22, 8, 4), 25), 1, daysAgo(22, 8, 29));
  stmt.run('short_break', 300, daysAgo(22, 8, 30), addMinutes(daysAgo(22, 8, 30), 5), 1, daysAgo(22, 8, 35));
  stmt.run('focus', 1500, daysAgo(22, 8, 36), addMinutes(daysAgo(22, 8, 36), 25), 1, daysAgo(22, 9, 1));
  stmt.run('long_break', 900, daysAgo(22, 9, 2), addMinutes(daysAgo(22, 9, 2), 15), 1, daysAgo(22, 9, 17));

  // Day 20 - Afternoon sprint
  stmt.run('focus', 1500, daysAgo(20, 14, 0), addMinutes(daysAgo(20, 14, 0), 25), 1, daysAgo(20, 14, 25));
  stmt.run('short_break', 300, daysAgo(20, 14, 26), addMinutes(daysAgo(20, 14, 26), 5), 1, daysAgo(20, 14, 31));
  stmt.run('focus', 1500, daysAgo(20, 14, 32), addMinutes(daysAgo(20, 14, 32), 25), 1, daysAgo(20, 14, 57));

  // Day 18 - Evening study
  stmt.run('focus', 1500, daysAgo(18, 19, 0), addMinutes(daysAgo(18, 19, 0), 25), 1, daysAgo(18, 19, 25));
  stmt.run('short_break', 300, daysAgo(18, 19, 26), addMinutes(daysAgo(18, 19, 26), 5), 1, daysAgo(18, 19, 31));
  stmt.run('focus', 1500, daysAgo(18, 19, 32), addMinutes(daysAgo(18, 19, 32), 25), 1, daysAgo(18, 19, 57));
  stmt.run('short_break', 300, daysAgo(18, 19, 58), addMinutes(daysAgo(18, 19, 58), 5), 1, daysAgo(18, 20, 3));

  // Day 15 - Weekend project
  stmt.run('focus', 1500, daysAgo(15, 10, 0), addMinutes(daysAgo(15, 10, 0), 25), 1, daysAgo(15, 10, 25));
  stmt.run('short_break', 300, daysAgo(15, 10, 26), addMinutes(daysAgo(15, 10, 26), 5), 1, daysAgo(15, 10, 31));
  stmt.run('focus', 1500, daysAgo(15, 10, 32), addMinutes(daysAgo(15, 10, 32), 25), 1, daysAgo(15, 10, 57));
  stmt.run('short_break', 300, daysAgo(15, 10, 58), addMinutes(daysAgo(15, 10, 58), 5), 1, daysAgo(15, 11, 3));
  stmt.run('focus', 1500, daysAgo(15, 11, 4), addMinutes(daysAgo(15, 11, 4), 25), 1, daysAgo(15, 11, 29));
  stmt.run('short_break', 300, daysAgo(15, 11, 30), addMinutes(daysAgo(15, 11, 30), 5), 1, daysAgo(15, 11, 35));
  stmt.run('focus', 1500, daysAgo(15, 11, 36), addMinutes(daysAgo(15, 11, 36), 25), 1, daysAgo(15, 12, 1));
  stmt.run('long_break', 900, daysAgo(15, 12, 2), addMinutes(daysAgo(15, 12, 2), 15), 1, daysAgo(15, 12, 17));
  stmt.run('focus', 1200, daysAgo(15, 12, 30), addMinutes(daysAgo(15, 12, 30), 20), 0, daysAgo(15, 12, 50));

  // Day 12 - Light day
  stmt.run('focus', 1500, daysAgo(12, 11, 0), addMinutes(daysAgo(12, 11, 0), 25), 1, daysAgo(12, 11, 25));

  // Day 10 - Afternoon deep dive
  stmt.run('focus', 1500, daysAgo(10, 13, 0), addMinutes(daysAgo(10, 13, 0), 25), 1, daysAgo(10, 13, 25));
  stmt.run('short_break', 300, daysAgo(10, 13, 26), addMinutes(daysAgo(10, 13, 26), 5), 1, daysAgo(10, 13, 31));
  stmt.run('focus', 1500, daysAgo(10, 13, 32), addMinutes(daysAgo(10, 13, 32), 25), 1, daysAgo(10, 13, 57));
  stmt.run('short_break', 300, daysAgo(10, 13, 58), addMinutes(daysAgo(10, 13, 58), 5), 1, daysAgo(10, 14, 3));
  stmt.run('focus', 1500, daysAgo(10, 14, 4), addMinutes(daysAgo(10, 14, 4), 25), 1, daysAgo(10, 14, 29));

  // Day 8 - Full pomodoro cycle
  stmt.run('focus', 1500, daysAgo(8, 9, 30), addMinutes(daysAgo(8, 9, 30), 25), 1, daysAgo(8, 9, 55));
  stmt.run('short_break', 300, daysAgo(8, 9, 56), addMinutes(daysAgo(8, 9, 56), 5), 1, daysAgo(8, 10, 1));
  stmt.run('focus', 1500, daysAgo(8, 10, 2), addMinutes(daysAgo(8, 10, 2), 25), 1, daysAgo(8, 10, 27));
  stmt.run('short_break', 300, daysAgo(8, 10, 28), addMinutes(daysAgo(8, 10, 28), 5), 1, daysAgo(8, 10, 33));
  stmt.run('focus', 1500, daysAgo(8, 10, 34), addMinutes(daysAgo(8, 10, 34), 25), 1, daysAgo(8, 10, 59));
  stmt.run('short_break', 300, daysAgo(8, 11, 0), addMinutes(daysAgo(8, 11, 0), 5), 1, daysAgo(8, 11, 5));
  stmt.run('focus', 1500, daysAgo(8, 11, 6), addMinutes(daysAgo(8, 11, 6), 25), 1, daysAgo(8, 11, 31));
  stmt.run('long_break', 900, daysAgo(8, 11, 32), addMinutes(daysAgo(8, 11, 32), 15), 1, daysAgo(8, 11, 47));

  // Day 5 - Recent productive day
  stmt.run('focus', 1500, daysAgo(5, 8, 0), addMinutes(daysAgo(5, 8, 0), 25), 1, daysAgo(5, 8, 25));
  stmt.run('short_break', 300, daysAgo(5, 8, 26), addMinutes(daysAgo(5, 8, 26), 5), 1, daysAgo(5, 8, 31));
  stmt.run('focus', 1500, daysAgo(5, 8, 32), addMinutes(daysAgo(5, 8, 32), 25), 1, daysAgo(5, 8, 57));
  stmt.run('short_break', 300, daysAgo(5, 8, 58), addMinutes(daysAgo(5, 8, 58), 5), 1, daysAgo(5, 9, 3));
  stmt.run('focus', 1500, daysAgo(5, 9, 4), addMinutes(daysAgo(5, 9, 4), 25), 1, daysAgo(5, 9, 29));
  stmt.run('short_break', 300, daysAgo(5, 9, 30), addMinutes(daysAgo(5, 9, 30), 5), 1, daysAgo(5, 9, 35));
  stmt.run('focus', 1500, daysAgo(5, 9, 36), addMinutes(daysAgo(5, 9, 36), 25), 1, daysAgo(5, 10, 1));
  stmt.run('long_break', 900, daysAgo(5, 10, 2), addMinutes(daysAgo(5, 10, 2), 15), 1, daysAgo(5, 10, 17));
  stmt.run('focus', 1500, daysAgo(5, 10, 30), addMinutes(daysAgo(5, 10, 30), 25), 1, daysAgo(5, 10, 55));
  stmt.run('short_break', 300, daysAgo(5, 10, 56), addMinutes(daysAgo(5, 10, 56), 5), 1, daysAgo(5, 11, 1));

  // Day 3 - Yesterday's session
  stmt.run('focus', 1500, daysAgo(3, 10, 0), addMinutes(daysAgo(3, 10, 0), 25), 1, daysAgo(3, 10, 25));
  stmt.run('short_break', 300, daysAgo(3, 10, 26), addMinutes(daysAgo(3, 10, 26), 5), 1, daysAgo(3, 10, 31));
  stmt.run('focus', 1500, daysAgo(3, 10, 32), addMinutes(daysAgo(3, 10, 32), 25), 1, daysAgo(3, 10, 57));
  stmt.run('short_break', 300, daysAgo(3, 10, 58), addMinutes(daysAgo(3, 10, 58), 5), 1, daysAgo(3, 11, 3));
  stmt.run('focus', 1050, daysAgo(3, 11, 4), addMinutes(daysAgo(3, 11, 4), 17), 0, daysAgo(3, 11, 21));

  // Day 1 - Today's morning
  stmt.run('focus', 1500, daysAgo(1, 7, 30), addMinutes(daysAgo(1, 7, 30), 25), 1, daysAgo(1, 7, 55));
  stmt.run('short_break', 300, daysAgo(1, 7, 56), addMinutes(daysAgo(1, 7, 56), 5), 1, daysAgo(1, 8, 1));
  stmt.run('focus', 1500, daysAgo(1, 8, 2), addMinutes(daysAgo(1, 8, 2), 25), 1, daysAgo(1, 8, 27));

  // Day 0 - Today
  stmt.run('focus', 1500, daysAgo(0, 9, 0), addMinutes(daysAgo(0, 9, 0), 25), 1, daysAgo(0, 9, 25));
  stmt.run('short_break', 300, daysAgo(0, 9, 26), addMinutes(daysAgo(0, 9, 26), 5), 1, daysAgo(0, 9, 31));
  stmt.run('focus', 1500, daysAgo(0, 9, 32), addMinutes(daysAgo(0, 9, 32), 25), 1, daysAgo(0, 9, 57));
  stmt.run('short_break', 300, daysAgo(0, 9, 58), addMinutes(daysAgo(0, 9, 58), 5), 1, daysAgo(0, 10, 3));
  stmt.run('focus', 1500, daysAgo(0, 10, 4), addMinutes(daysAgo(0, 10, 4), 25), 1, daysAgo(0, 10, 29));
});

insertAll();

// Get final counts
const finalCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get();
const focusCount = db.prepare("SELECT COUNT(*) as count FROM sessions WHERE mode = 'focus'").get();
const completedCount = db.prepare("SELECT COUNT(*) as count FROM sessions WHERE completed = 1").get();

console.log('🌱 ZenPomodoro database seeded successfully!');
console.log(`📊 Summary:`);
console.log(`   - Total sessions: ${finalCount.count}`);
console.log(`   - Focus sessions: ${focusCount.count}`);
console.log(`   - Completed sessions: ${completedCount.count}`);
console.log(`   - Date range: Last 30 days of activity`);
console.log('');
console.log('🧘 Ready to start your focused journey!');

db.close();