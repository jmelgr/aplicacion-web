const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const DEFAULT_DB_PATH = path.join(__dirname, 'auth.db');
const DB_FILE = process.env.DB_FILE
  ? path.resolve(process.env.DB_FILE)
  : DEFAULT_DB_PATH;

const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log(`[db] Created directory: ${dir}`);
}

async function init() {
  console.log(`[db] Using database file: ${DB_FILE}`);
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      account_id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  return db;
}

module.exports = { init };
