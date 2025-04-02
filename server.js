const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const users = {};

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'packages', 'oyun-merkezi', 'dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'packages', 'oyun-merkezi', 'dist', 'index.html'));
});

function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
  }
  if (users[email]) {
    return res.status(400).json({ error: 'Bu kullanıcı zaten mevcut.' });
  }
  users[email] = hashData(password);
  res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.' });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
  }
  const hashedPassword = hashData(password);
  if (users[email] !== hashedPassword) {
    return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
  }
  res.status(200).json({ message: 'Giriş başarılı.' });
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    ws.send(`Server received: ${message}`);
  });
});

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
