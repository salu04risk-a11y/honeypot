'use strict';
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'honeypot.db');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT,
      ip TEXT,
      method TEXT,
      path TEXT,
      query TEXT,
      headers TEXT,
      body TEXT
    )
  `);
});

function insertEvent({ ts, ip, method, path: p, query, headers, body }) {
  const stmt = db.prepare(`
    INSERT INTO events (ts, ip, method, path, query, headers, body)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(ts, ip, method, p, JSON.stringify(query || {}), JSON.stringify(headers || {}), body || '', (err) => {
    if (err) console.error('DB insert error:', err);
    stmt.finalize();
  });
}

function fetchEvents(limit = 200, cb) {
  db.all(`SELECT * FROM events ORDER BY id DESC LIMIT ?`, [limit], (err, rows) => {
    cb(err, rows);
  });
}

module.exports = { insertEvent, fetchEvents, DB_PATH };
