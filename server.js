const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const usersFilePath = path.join(__dirname, 'users.json');
const lobbiesFilePath = path.join(__dirname, 'lobbies.json');

function loadUsers() {
  if (fs.existsSync(usersFilePath)) {
    const data = fs.readFileSync(usersFilePath);
    return JSON.parse(data);
  }
  return {};
}

function saveUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

function loadLobbies() {
  try {
    if (fs.existsSync(lobbiesFilePath)) {
      const data = fs.readFileSync(lobbiesFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Lobiler yüklenirken bir hata oluştu:', error);
  }
  return {};
}

function saveLobbies(lobbies) {
  try {
    fs.writeFileSync(lobbiesFilePath, JSON.stringify(lobbies, null, 2));
  } catch (error) {
    console.error('Lobiler kaydedilirken bir hata oluştu:', error);
  }
}

function generateLobbyCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function cleanUpExpiredLobbies() {
  const now = Date.now();
  for (const code in lobbies) {
    if (now - lobbies[code].createdAt > 48 * 60 * 60 * 1000) {
      delete lobbies[code];
    }
  }
  saveLobbies(lobbies);
}

const users = loadUsers();
const lobbies = loadLobbies();

setInterval(cleanUpExpiredLobbies, 60 * 60 * 1000);

app.use(express.json());
app.use(cors({
  origin: '*', 
}));

app.post('/register', (req, res) => {
  const { email, password, username, avatar } = req.body;
  if (!email || !password || !username) {
    return res.status(400).json({ error: 'E-posta, şifre ve kullanıcı adı gereklidir.' });
  }
  if (users[email]) {
    return res.status(400).json({ error: 'Bu kullanıcı zaten mevcut.' });
  }
  const userId = crypto.randomBytes(8).toString('hex');
  users[email] = { password: hashData(password), userId, username, avatar };
  saveUsers(users);
  res.status(201).json({ message: 'Kullanıcı başarıyla kaydedildi.', userId, username, avatar });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
  }
  const user = users[email];
  if (!user || user.password !== hashData(password)) {
    return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
  }
  res.status(200).json({ message: 'Giriş başarılı.', userId: user.userId, username: user.username, avatar: user.avatar });
});

app.post('/create-lobby', (req, res) => {
  try {
    const { lobbyName } = req.body;
    if (!lobbyName) {
      return res.status(400).json({ error: 'Lobi adı gereklidir.' });
    }
    const lobbyCode = generateLobbyCode();
    lobbies[lobbyCode] = {
      name: lobbyName,
      createdAt: Date.now(),
    };
    saveLobbies(lobbies);
    res.status(201).json({ message: 'Lobi başarıyla oluşturuldu.', lobbyCode });
  } catch (error) {
    console.error('Lobi oluşturulurken bir hata oluştu:', error);
    res.status(500).json({ error: 'Lobi oluşturulamadı. Sunucu hatası.' });
  }
});

app.post('/join-lobby', (req, res) => {
  try {
    const { lobbyCode, userId } = req.body; 
    if (!lobbyCode || !userId) {
      return res.status(400).json({ error: 'Lobi kodu ve kullanıcı ID gereklidir.' });
    }
    if (!lobbies[lobbyCode]) {
      return res.status(404).json({ error: 'Lobi bulunamadı.' });
    }
    const lobby = lobbies[lobbyCode];
    if (!lobby.participants) {
      lobby.participants = []; 
    }
    if (!lobby.participants.includes(userId)) {
      lobby.participants.push(userId); 
      saveLobbies(lobbies); 
    }
    res.status(200).json({ message: 'Lobiye başarıyla katıldınız.', lobby });
  } catch (error) {
    console.error('Lobiye katılma sırasında bir hata oluştu:', error);
    res.status(500).json({ error: 'Lobiye katılma işlemi başarısız oldu.' });
  }
});

app.post('/leave-lobby', (req, res) => {
  try {
    const { lobbyCode, userId } = req.body; 
    if (!lobbyCode || !userId) {
      return res.status(400).json({ error: 'Lobi kodu ve kullanıcı ID gereklidir.' });
    }
    if (!lobbies[lobbyCode]) {
      return res.status(404).json({ error: 'Lobi bulunamadı.' });
    }
    const lobby = lobbies[lobbyCode];
    if (lobby.participants) {
      lobby.participants = lobby.participants.filter((participant) => participant !== userId);
      saveLobbies(lobbies); 
    }
    res.status(200).json({ message: 'Lobiden başarıyla çıkıldı.', lobby });
  } catch (error) {
    console.error('Lobiden çıkış sırasında bir hata oluştu:', error);
    res.status(500).json({ error: 'Lobiden çıkış işlemi başarısız oldu.' });
  }
});

app.get('/lobbies', (req, res) => {
  try {
    cleanUpExpiredLobbies(); 
    res.status(200).json(lobbies); 
  } catch (error) {
    console.error('Lobiler alınırken bir hata oluştu:', error);
    res.status(500).json({ error: 'Lobiler alınamadı. Sunucu hatası.' });
  }
});

app.use(express.static(path.join(__dirname, 'packages', 'oyun-merkezi', 'dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'packages', 'oyun-merkezi', 'dist', 'index.html'));
});

function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'chatMessage') {
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });
    }
  });
});

const PORT = 3003;
server.listen(PORT, 'localhost', () => { 
  console.log(`Server is running on http://localhost:${PORT}`);
});
