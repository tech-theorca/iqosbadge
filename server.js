const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize SQLite database
const db = new sqlite3.Database('./scores.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`
      CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player TEXT NOT NULL,
        score TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }
});

// POST /api/score - add a new score (badge selection)
app.post('/api/score', (req, res) => {
  const { player, score } = req.body;
  if (!player || !score) {
    return res.status(400).json({ success: false, message: 'Player and score are required.' });
  }

  const stmt = db.prepare('INSERT INTO scores (player, score) VALUES (?, ?)');
  stmt.run(player, score, function(err) {
    if (err) {
      console.error('Error inserting score:', err.message);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, id: this.lastID });
  });
  stmt.finalize();
});

// GET /api/scores - get all scores ordered by newest first
app.get('/api/scores', (req, res) => {
  db.all('SELECT player, score, timestamp FROM scores ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching scores:', err.message);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    res.json({ success: true, scores: rows });
  });
});

//service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(err => {
          console.log('Service Worker registration failed:', err);
        });
    });
  }  

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
