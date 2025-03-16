import Database from 'better-sqlite3';

const db = new Database('performance.db');

// Initialize database
db.prepare(`
  CREATE TABLE IF NOT EXISTS performance (
    problem TEXT PRIMARY KEY,
    best_time INTEGER,
    attempts INTEGER DEFAULT 0,
    incorrect_attempts INTEGER DEFAULT 0
  )
`).run();

export function updatePerformance(problem, time, isCorrect) {
  const existingRecord = db.prepare('SELECT * FROM performance WHERE problem = ?').get(problem);

  if (!existingRecord) {
    // First attempt for this problem
    db.prepare(`
      INSERT INTO performance (problem, best_time, attempts, incorrect_attempts) 
      VALUES (?, ?, 1, ?)
    `).run(problem, time, isCorrect ? 0 : 1);
  } else {
    // Update existing record
    db.prepare(`
      UPDATE performance 
      SET 
        best_time = CASE WHEN ? < best_time OR best_time = 0 THEN ? ELSE best_time END,
        attempts = attempts + 1,
        incorrect_attempts = incorrect_attempts + ?
      WHERE problem = ?
    `).run(
      time, 
      time, 
      isCorrect ? 0 : 1, 
      problem
    );
  }
}

export function getProblemStats(problem) {
  return db.prepare('SELECT * FROM performance WHERE problem = ?').get(problem) || {
    best_time: 0,
    attempts: 0,
    incorrect_attempts: 0
  };
}

export function getAllProblemStats() {
  return db.prepare('SELECT * FROM performance').all();
}
