import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./data.db');

export const init = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("CREATE TABLE IF NOT EXISTS performances (number1 INTEGER NOT NULL, number2 INTEGER NOT NULL, best_time INTEGER, previous_best_time INTEGER, UNIQUE(number1, number2))", (err) => {
        if (err) {
          console.error("Error creating table:", err);
          reject(err);
        } else {
          console.log("Table created or already exists");
          resolve(true);
        }
      });
    });
  });
};

export const getPerformance = async (number1: number, number2: number): Promise<{ best_time: number | null; previous_best_time: number | null } | undefined> => {
  return new Promise((resolve, reject) => {
    db.get("SELECT best_time, previous_best_time FROM performances WHERE number1 = ? AND number2 = ?", [number1, number2], (err, row: any) => {
      if (err) {
        console.error("Error fetching performance:", err);
        reject(err);
      } else {
        resolve(row ? { best_time: row.best_time, previous_best_time: row.previous_best_time } : undefined);
      }
    });
  });
};

export const updatePerformance = async (number1: number, number2: number, newTime: number, previousBestTime: number | null) => {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT OR REPLACE INTO performances (number1, number2, best_time, previous_best_time) VALUES (?, ?, ?, ?)",
      [number1, number2, newTime, previousBestTime],
      (err) => {
        if (err) {
          console.error("Error updating performance:", err);
          reject(err);
        } else {
          resolve(true);
        }
      }
    );
  });
};

export default db;
