// db/init.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { getDataDir } = require('../utils/paths');

function init() {
  const DATA_DIR = getDataDir(); // ensures /data exists (idempotent)
  const DB_PATH = path.join(DATA_DIR, 'members.db');

  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error('❌ SQLite connection error:', err.message);
    else console.log('✅ Connected to SQLite at', DB_PATH);
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('❌ Failed creating users table:', err.message);
    else console.log('📦 Users table ready');
  });

  // Optionally export the db instance if you need it elsewhere
  return db;
}

module.exports = { init };
