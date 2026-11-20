const Database = require('better-sqlite3');
const db = new Database('xliilx.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    type TEXT DEFAULT 'guest',
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// АвтоочисткаXD
function cleanupGuests() {
    db.prepare(`
        DELETE FROM users 
        WHERE type = 'guest' AND last_login < datetime('now', '-300 days')
    `).run();
}
setInterval(cleanupGuests, 1000 * 60 * 60 * 24); //67
cleanupGuests();

module.exports = db;