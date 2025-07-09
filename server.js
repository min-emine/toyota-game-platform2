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
    const { lobbyName, lobbyType, eventStart, eventEnd, lobbyPassword, gameId, userId } = req.body;
    if (!lobbyName) {
      return res.status(400).json({ error: 'Lobi adı gereklidir.' });
    }
    if (!lobbyType) {
      return res.status(400).json({ error: 'Lobi türü gereklidir.' });
    }
    if (lobbyType === 'event' && (!eventStart || !eventEnd)) {
      return res.status(400).json({ error: 'Etkinlik için başlangıç ve bitiş tarihi/saat gereklidir.' });
    }
    // Her kullanıcının 1 lobisi olabilir kuralı
    for (const code in lobbies) {
      if (lobbies[code].ownerId === userId) {
        delete lobbies[code];
      }
    }
    const lobbyCode = generateLobbyCode();
    lobbies[lobbyCode] = {
      name: lobbyName,
      type: lobbyType,
      eventStart: lobbyType === 'event' ? eventStart : undefined,
      eventEnd: lobbyType === 'event' ? eventEnd : undefined,
      password: lobbyPassword || undefined,
      gameId: gameId || undefined,
      ownerId: userId,
      createdAt: Date.now(),
      participants: [userId],
      closedAt: null,
    };
    saveLobbies(lobbies);
    res.status(201).json({ message: 'Lobi başarıyla oluşturuldu.', lobbyCode });
  } catch (error) {
    console.error('Lobi oluşturulurken bir hata oluştu:', error);
    res.status(500).json({ error: 'Lobi oluşturulamadı. Sunucu hatası.' });
  }
});

app.post('/update-lobby', (req, res) => {
  try {
    const { lobbyCode, lobbyName, lobbyType, eventStart, eventEnd, lobbyPassword, gameId, userId } = req.body;
    if (!lobbyCode || !lobbies[lobbyCode]) {
      return res.status(404).json({ error: 'Lobi bulunamadı.' });
    }
    const lobby = lobbies[lobbyCode];
    if (lobby.ownerId !== userId) {
      return res.status(403).json({ error: 'Sadece lobi sahibi düzenleyebilir.' });
    }
    if (lobbyName) lobby.name = lobbyName;
    if (lobbyType) lobby.type = lobbyType;
    if (lobbyType === 'event') {
      if (eventStart) lobby.eventStart = eventStart;
      if (eventEnd) lobby.eventEnd = eventEnd;
    } else {
      lobby.eventStart = undefined;
      lobby.eventEnd = undefined;
    }
    if (lobbyPassword !== undefined) lobby.password = lobbyPassword;
    if (gameId !== undefined) lobby.gameId = gameId;
    saveLobbies(lobbies);
    res.status(200).json({ message: 'Lobi güncellendi.' });
  } catch (error) {
    res.status(500).json({ error: 'Lobi güncellenemedi.' });
  }
});

app.post('/delete-lobby', (req, res) => {
  try {
    const { lobbyCode, userId } = req.body;
    if (!lobbyCode || !lobbies[lobbyCode]) {
      return res.status(404).json({ error: 'Lobi bulunamadı.' });
    }
    if (lobbies[lobbyCode].ownerId !== userId) {
      return res.status(403).json({ error: 'Sadece lobi sahibi silebilir.' });
    }
    delete lobbies[lobbyCode];
    saveLobbies(lobbies);
    res.status(200).json({ message: 'Lobi silindi.' });
  } catch (error) {
    res.status(500).json({ error: 'Lobi silinemedi.' });
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
    let isNewJoin = false;
    if (!lobby.participants.includes(userId)) {
      lobby.participants.push(userId); 
      saveLobbies(lobbies); 
      isNewJoin = true;
    }

    const participantNames = lobby.participants.map((participantId) => {
      const user = Object.values(users).find((user) => user.userId === participantId);
      return user ? user.username : 'Unknown';
    });

    // Bildirim: lobiye yeni biri katıldıysa WebSocket ile gönder
    if (isNewJoin && typeof wss !== 'undefined') {
      wss.clients.forEach((client) => {
        if (
          client.readyState === 1 &&
          client.lobbyCode === lobbyCode &&
          client.userId !== userId
        ) {
          client.send(
            JSON.stringify({
              type: 'lobby-join',
              userId,
              username: users[userId]?.username || 'Bir oyuncu',
            })
          );
        }
      });
    }

    res.status(200).json({ 
      message: 'Lobiye başarıyla katıldınız.', 
      lobby: {
        ...lobby,
        participantNames,
      },
    });
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
    const now = Date.now();
    const lobbiesWithNames = {};
    for (const [code, lobby] of Object.entries(lobbies)) {
      // Normal lobi: kurucu çıktıysa ve 8 saat geçtiyse gösterme
      if (lobby.type === 'normal' && lobby.ownerId && (!lobby.participants || !lobby.participants.includes(lobby.ownerId))) {
        if (!lobby.closedAt) lobby.closedAt = now;
        if (now - lobby.closedAt > 8 * 60 * 60 * 1000) continue;
      } else if (lobby.type === 'normal') {
        lobby.closedAt = null;
      }
      // Etkinlik lobisi: bitiş tarihine kadar görünür, en başta
      // (Sıralama frontend'de yapılabilir, burada sadece veriyi sağlıyoruz)
      const participantNames = (lobby.participants || []).map((participantId) => {
        const user = Object.values(users).find((user) => user.userId === participantId);
        return user ? user.username : 'Unknown';
      });
      lobbiesWithNames[code] = {
        ...lobby,
        participantNames,
      };
    }
    res.status(200).json(lobbiesWithNames);
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

function generateRandomCard() {
  const numbers = new Set();
  while (numbers.size < 15) {
    const randomNum = Math.floor(Math.random() * 99) + 1;
    numbers.add(randomNum);
  }
  const cardArray = Array.from(numbers);
  return [
    cardArray.slice(0, 5),
    cardArray.slice(5, 10),
    cardArray.slice(10, 15),
  ];
}

const activeGames = {};
const ilkKapaninGames = {};

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'join-lobby') {
      ws.lobbyCode = data.lobbyCode;
      if (!activeGames[data.lobbyCode]) {
        const lobby = lobbies[data.lobbyCode];
        const participants = lobby?.participants || [];
        const cards = {};
        participants.forEach((userId) => {
          cards[userId] = generateRandomCard();
        });
        activeGames[data.lobbyCode] = {
          drawnNumbers: [],
          currentNumber: null,
          cards, 
        };
      }
      ws.userId = data.userId;
      const game = activeGames[data.lobbyCode];
      const allCards = Object.entries(game.cards);
      ws.send(JSON.stringify({
        type: 'game-state',
        drawnNumbers: game.drawnNumbers,
        currentNumber: game.currentNumber,
        card: game.cards[data.userId] || null,
        allCards,
      }));
    }
    if (data.type === 'draw-number') {
      const game = activeGames[ws.lobbyCode];
      if (!game) return;
      let available = Array.from({ length: 99 }, (_, i) => i + 1).filter(n => !game.drawnNumbers.includes(n));
      if (available.length === 0) return;
      const number = available[Math.floor(Math.random() * available.length)];
      game.drawnNumbers.push(number);
      game.currentNumber = number;

      if (!game.cinkoState) game.cinkoState = {}; 
      if (!game.tombalaState) game.tombalaState = {}; 
      const lobby = lobbies[ws.lobbyCode];
      const participants = lobby?.participants || [];
      const notifications = [];

      participants.forEach((userId) => {
        const card = game.cards[userId];
        if (!card) return;
        if (!game.cinkoState[userId]) game.cinkoState[userId] = [false, false, false];
        card.forEach((row, rowIdx) => {
          if (!game.cinkoState[userId][rowIdx]) {
            const isCinko = row.every(num => game.drawnNumbers.includes(num));
            if (isCinko) {
              game.cinkoState[userId][rowIdx] = true;
              const user = Object.values(users).find(u => u.userId === userId);
              const username = user ? user.username : userId;
              notifications.push(`${username}, Çinko yaptı!`);
            }
          }
        });
        if (!game.tombalaState[userId]) {
          const allNumbers = card.flat();
          const isTombala = allNumbers.every(num => game.drawnNumbers.includes(num));
          if (isTombala) {
            game.tombalaState[userId] = true;
            const user = Object.values(users).find(u => u.userId === userId);
            const username = user ? user.username : userId;
            notifications.push(`${username}, Tombala yaptı!`);
          }
        }
      });

      const allCards = Object.entries(game.cards);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
          client.send(JSON.stringify({
            type: 'game-state',
            drawnNumbers: game.drawnNumbers,
            currentNumber: game.currentNumber,
            card: game.cards[client.userId] || null,
            allCards,
            notifications, 
          }));
        }
      });
    }
    if (data.type === 'restart-game') {
      const lobby = lobbies[ws.lobbyCode];
      const participants = lobby?.participants || [];
      const cards = {};
      participants.forEach((userId) => {
        cards[userId] = generateRandomCard();
      });
      activeGames[ws.lobbyCode] = {
        drawnNumbers: [],
        currentNumber: null,
        cards,
      };
      const game = activeGames[ws.lobbyCode];
      const allCards = Object.entries(game.cards);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
          client.send(JSON.stringify({
            type: 'game-state',
            drawnNumbers: game.drawnNumbers,
            currentNumber: game.currentNumber,
            allCards,
          }));
        }
      });
    }
    if (data.type === 'join-lobby' && data.mode === 'ilkKapanin') {
      ws.lobbyCode = data.lobbyCode;
      ws.userId = data.userId;
      if (!ilkKapaninGames[data.lobbyCode]) {
        const lobby = lobbies[data.lobbyCode];
        const participants = lobby?.participants || [];
        const cards = {};
        const starNumbers = {};
        const markedNumbers = {};
        participants.forEach((userId) => {
          const numbers = new Set();
          while (numbers.size < 15) {
            const randomNum = Math.floor(Math.random() * 99) + 1;
            numbers.add(randomNum);
          }
          const cardArr = Array.from(numbers);
          cards[userId] = [cardArr.slice(0, 5), cardArr.slice(5, 10), cardArr.slice(10, 15)];
          const starIdxs = [];
          while (starIdxs.length < 2) {
            const idx = Math.floor(Math.random() * 15);
            if (!starIdxs.includes(idx)) starIdxs.push(idx);
          }
          starNumbers[userId] = [cardArr[starIdxs[0]], cardArr[starIdxs[1]]];
          markedNumbers[userId] = [];
        });
        ilkKapaninGames[data.lobbyCode] = {
          drawnNumbers: [],
          cards, 
          starNumbers, 
          markedNumbers, 
          scores: Object.fromEntries(participants.map(uid => [uid, 0])),
          currentPlayer: participants[0],
          turnCount: 0,
          gameOver: false,
          jokerState: {}, 
          notifications: [],
          selection: [], 
          winnerIdx: null,
          showConfetti: false,
        };
      }
      const game = ilkKapaninGames[data.lobbyCode];
      const allCards = Object.entries(game.cards);
      ws.send(JSON.stringify({
        type: 'game-state',
        drawnNumbers: game.drawnNumbers,
        card: game.cards[data.userId] || null,
        allCards,
        scores: game.scores,
        currentPlayer: game.currentPlayer,
        turnCount: game.turnCount,
        gameOver: game.gameOver,
        playerCards: Object.values(game.cards),
        starNumbers: Object.values(game.starNumbers),
        markedNumbers: Object.values(game.markedNumbers),
        jokerState: game.jokerState,
        notifications: game.notifications,
        winnerIdx: game.winnerIdx,
        showConfetti: game.showConfetti,
      }));
    }
    if (data.type === 'start-game' && ws.lobbyCode && ilkKapaninGames[ws.lobbyCode]) {
      const game = ilkKapaninGames[ws.lobbyCode];
      game.drawnNumbers = [];
      game.drawnBy = {}; 
      game.turnCount = 0;
      game.gameOver = false;
      const lobby = lobbies[ws.lobbyCode];
      const participants = lobby?.participants || [];
      game.currentPlayer = participants[0];
      game.scores = Object.fromEntries(participants.map(uid => [uid, 0]));
      game.markedNumbers = Object.fromEntries(participants.map(uid => [uid, []]));
      game.jokerState = {};
      game.notifications = [];
      game.selection = [];
      game.winnerIdx = null;
      game.showConfetti = false;
      const allCards = Object.entries(game.cards);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
          client.send(JSON.stringify({
            type: 'game-state',
            drawnNumbers: game.drawnNumbers,
            card: game.cards[client.userId] || null,
            allCards,
            scores: game.scores,
            currentPlayer: game.currentPlayer,
            turnCount: game.turnCount,
            gameOver: game.gameOver,
            playerCards: Object.values(game.cards),
            starNumbers: Object.values(game.starNumbers),
            markedNumbers: Object.values(game.markedNumbers),
            jokerState: game.jokerState,
            notifications: game.notifications,
            winnerIdx: game.winnerIdx,
            showConfetti: game.showConfetti,
          }));
        }
      });
    }
    if (data.type === 'select-number' && ws.lobbyCode && ilkKapaninGames[ws.lobbyCode]) {
      const game = ilkKapaninGames[ws.lobbyCode];
      if (!game.drawnBy) game.drawnBy = {}; 
      if (game.gameOver) return;
      if (ws.userId !== game.currentPlayer) return;
      const num = data.number;
      if (game.drawnNumbers.includes(num) || (game.selection && game.selection.includes(num))) return;
      if (!game.selection) game.selection = [];
      game.selection.push(num);
      if (game.selection.length < 3) {
        const allCards = Object.entries(game.cards);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
            client.send(JSON.stringify({
              type: 'game-state',
              drawnNumbers: game.drawnNumbers,
              drawnBy: game.drawnBy || {},
              card: game.cards[client.userId] || null,
              allCards,
              scores: game.scores,
              currentPlayer: game.currentPlayer,
              turnCount: game.turnCount,
              gameOver: game.gameOver,
              playerCards: Object.values(game.cards),
              starNumbers: Object.values(game.starNumbers),
              markedNumbers: Object.values(game.markedNumbers),
              jokerState: game.jokerState,
              notifications: game.notifications,
              winnerIdx: game.winnerIdx,
              showConfetti: game.showConfetti,
              selection: game.selection,
            }));
          }
        });
        return;
      }
      const userId = ws.userId;
      let newMarked = [...game.markedNumbers[userId]];
      for (const n of game.selection) {
        game.drawnBy[n] = userId;
        if (game.cards[userId].flat().includes(n)) {
          newMarked.push(n);
          if (n === 54) {
            game.scores[userId] += (game.jokerState[userId]?.x3 ? 300 : 100);
            if (game.jokerState[userId]?.x3) game.jokerState[userId].x3 = false;
          } else if (game.starNumbers[userId] && game.starNumbers[userId].includes(n)) {
            game.scores[userId] += (game.jokerState[userId]?.x3 ? 300 : 100);
            if (game.jokerState[userId]?.x3) game.jokerState[userId].x3 = false;
          } else {
            game.scores[userId] += (game.jokerState[userId]?.x3 ? 150 : 50);
            if (game.jokerState[userId]?.x3) game.jokerState[userId].x3 = false;
          }
        }
        if (n === 54) {
          for (const uid of Object.keys(game.cards)) {
            if (uid !== userId && game.cards[uid].flat().includes(54)) {
              game.scores[uid] -= 100;
            }
          }
        }
      }
      game.markedNumbers[userId] = newMarked;
      game.drawnNumbers.push(...game.selection);
      game.turnCount++;
      let winner = null;
      for (const uid of Object.keys(game.cards)) {
        if (game.markedNumbers[uid].length === 15) {
          winner = uid;
          break;
        }
      }
      if (winner) {
        game.gameOver = true;
        game.winnerIdx = Object.keys(game.cards).indexOf(winner);
        game.showConfetti = true;
        game.notifications.push(`${winner} oyunu kazandı!`);
      } else if (game.drawnNumbers.length >= 99) {
        const scoreArr = Object.entries(game.scores);
        const maxScore = Math.max(...scoreArr.map(([_, s]) => s));
        const winnerEntry = scoreArr.find(([_, s]) => s === maxScore);
        if (winnerEntry) {
          game.gameOver = true;
          game.winnerIdx = Object.keys(game.cards).indexOf(winnerEntry[0]);
          game.showConfetti = true;
          game.notifications.push(`${winnerEntry[0]} oyunu kazandı!`);
        }
      }
      const lobby = lobbies[ws.lobbyCode];
      const participants = lobby?.participants || [];
      let skipJoker = false;
      for (const uid of Object.keys(game.jokerState)) {
        if (game.jokerState[uid]?.mute === 1) {
          game.jokerState[uid].mute = 0;
        }
      }
      let idx = participants.indexOf(game.currentPlayer);
      let nextIdx = (idx + 1) % participants.length;
      let nextPlayer = participants[nextIdx];
      let loopCount = 0;
      while (game.jokerState[nextPlayer]?.mute === 1 && loopCount < participants.length) {
        game.jokerState[nextPlayer].mute = 0;
        nextIdx = (nextIdx + 1) % participants.length;
        nextPlayer = participants[nextIdx];
        loopCount++;
      }
      game.currentPlayer = nextPlayer;
      game.selection = [];
      if (
        game.turnCount > 0 &&
        game.turnCount % (participants.length * 3) === 0 &&
        !game.gameOver
      ) {
        const minScore = Math.min(...Object.values(game.scores));
        const minUsers = Object.keys(game.scores).filter(
          (uid) => game.scores[uid] === minScore
        );
        if (minUsers.length === 1) {
          wss.clients.forEach((client) => {
            if (
              client.readyState === WebSocket.OPEN &&
              client.lobbyCode === ws.lobbyCode &&
              client.userId === minUsers[0]
            ) {
              client.send(
                JSON.stringify({
                  type: 'joker-select',
                  eligibleUserId: minUsers[0],
                  jokerState: game.jokerState,
                })
              );
            }
          });
          skipJoker = true;
        }
      }
      const allCards = Object.entries(game.cards);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
          client.send(
            JSON.stringify({
              type: 'game-state',
              drawnNumbers: game.drawnNumbers,
              drawnBy: game.drawnBy || {},
              card: game.cards[client.userId] || null,
              allCards,
              scores: game.scores,
              currentPlayer: game.currentPlayer,
              turnCount: game.turnCount,
              gameOver: game.gameOver,
              playerCards: Object.values(game.cards),
              starNumbers: Object.values(game.starNumbers),
              markedNumbers: Object.values(game.markedNumbers),
              jokerState: game.jokerState,
              notifications: game.notifications,
              winnerIdx: game.winnerIdx,
              showConfetti: game.showConfetti,
              selection: game.selection,
            })
          );
        }
      });
      return;
    }
    if (data.type === 'joker-action' && ws.lobbyCode && ilkKapaninGames[ws.lobbyCode]) {
      const game = ilkKapaninGames[ws.lobbyCode];
      if (!game.jokerState) game.jokerState = {};
      const userId = ws.userId;
      if (data.jokerType === 'mute' && data.targetUserId) {
        if (!game.jokerState[data.targetUserId]) game.jokerState[data.targetUserId] = {};
        game.jokerState[data.targetUserId].mute = 1;
        game.notifications.push(`${data.targetUserName || data.targetUserId} 1 tur susturuldu!`);
      } else if (data.jokerType === 'x3') {
        if (!game.jokerState[userId]) game.jokerState[userId] = {};
        game.jokerState[userId].x3 = true;
        game.notifications.push(`Bir sonraki turda puanın 3 katı!`);
      } else if (data.jokerType === 'hint' && data.hintNumber) {
        let owners = [];
        for (const [uid, card] of Object.entries(game.cards)) {
          if (card.flat().includes(data.hintNumber)) {
            owners.push(uid);
          }
        }
        game.notifications.push(
          `İpucu: ${data.hintNumber} şu oyuncularda: ${owners.map((uid) => uid).join(', ')}`
        );
      }
      const allCards = Object.entries(game.cards);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
          client.send(
            JSON.stringify({
              type: 'game-state',
              drawnNumbers: game.drawnNumbers,
              drawnBy: game.drawnBy || {},
              card: game.cards[client.userId] || null,
              allCards,
              scores: game.scores,
              currentPlayer: game.currentPlayer,
              turnCount: game.turnCount,
              gameOver: game.gameOver,
              playerCards: Object.values(game.cards),
              starNumbers: Object.values(game.starNumbers),
              markedNumbers: Object.values(game.markedNumbers),
              jokerState: game.jokerState,
              notifications: game.notifications,
              winnerIdx: game.winnerIdx,
              showConfetti: game.showConfetti,
              selection: game.selection,
            })
          );
        }
      });
      return;
    }
    if (data.type === 'lobby-chat' && ws.lobbyCode && data.lobbyCode && data.text) {
      const chatMsg = {
        userId: data.userId,
        username: data.username,
        text: data.text,
        ts: Date.now(),
      };
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
          client.send(
            JSON.stringify({
              type: 'lobby-chat',
              message: chatMsg,
            })
          );
        }
      });
      return;
    }
  });
});

app.get('/api/users', (req, res) => {
  const usersPath = path.join(__dirname, 'users.json');
  if (fs.existsSync(usersPath)) {
    res.sendFile(usersPath);
  } else {
    res.status(404).json({ error: 'users.json not found' });
  }
});
const PORT = process.env.PORT || 3003;
server.listen(PORT, '0.0.0.0', () => { 
  console.log(`Server is running on port ${PORT}`);
});
