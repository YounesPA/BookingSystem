
// models/usersRepository.js
const db = require('../db/db');

// Helper to run SELECT one row
const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

// Helper to run SELECT many rows
const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });

// Helper to run INSERT/UPDATE/DELETE
const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

async function findOneByEmail(email) {
  return get(`SELECT * FROM users WHERE email = ?`, [email]);
}

async function findById(id) {
  return get(`SELECT * FROM users WHERE id = ?`, [id]);
}

async function createUser({ username, email, password }) {
  const result = await run(
    `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
    [username, email, password]
  );
  return findById(result.lastID);
}

module.exports = {
  findOneByEmail,
  findById,
  createUser,
  all,
};
