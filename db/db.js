const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "app.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS urls (key TEXT PRIMARY KEY, url TEXT)",
    (err) => {
      if (err) {
        console.error("Error creating 'urls' table:", err);
      } else {
        console.log("Database table 'urls' created or already exists.");
      }
    }
  );

  db.run(
    "CREATE TABLE IF NOT EXISTS stats (key TEXT PRIMARY KEY, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, visit_count INTEGER DEFAULT 0, max_visits INTEGER DEFAULT 0)",
    (err) => {
      if (err) {
        console.error("Error creating 'stats' table:", err);
      } else {
        console.log("Database table 'stats' created or already exists.");
      }
    }
  );
});

module.exports = db;