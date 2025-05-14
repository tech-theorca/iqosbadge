const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 80;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory scores array (not persistent)
let scores = [];

// POST /api/score - add a new score (badge selection)
app.post('/api/score', (req, res) => {
  const { player, score, desc, message } = req.body;
  if (!score) {
    return res.status(400).json({ success: false, message: 'Score is required.' });
  }
  const timestamp = new Date().toISOString();
  const newScore = { player, score, desc, message, timestamp };
  scores.unshift(newScore); // Add to the beginning (newest first)
  io.emit('new-score', newScore); // Emit to all connected clients
  res.json({ success: true });
});

// GET /api/scores - get all scores ordered by newest first
app.get('/api/scores', (req, res) => {
  res.json({ success: true, scores });
});

// Socket.io: listen for unlock-badges event from scores.html and broadcast to all clients
io.on('connection', (socket) => {
  socket.on('unlock-badges', () => {
    io.emit('unlock-badges');
  });
});

// Start server with socket.io
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});