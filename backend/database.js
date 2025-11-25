
const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'notes.db'), { verbose: console.log });

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    content TEXT,
    rawContent TEXT,
    tags TEXT, -- JSON array
    createdAt TEXT,
    hasSchedule INTEGER, -- boolean 0 or 1
    scheduleDate TEXT,
    imageUrl TEXT,
    isDone INTEGER -- boolean 0 or 1
  )
`);

module.exports = db;
