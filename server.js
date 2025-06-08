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

    // Fetch participant names from users.json
    const participantNames = lobby.participants.map((participantId) => {
      const user = Object.values(users).find((user) => user.userId === participantId);
      return user ? user.username : 'Unknown';
    });

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
    // Her lobiye participantNames ekle
    const lobbiesWithNames = {};
    for (const [code, lobby] of Object.entries(lobbies)) {
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

// Aktif oyunlar bellekte tutulur
const activeGames = {};
// IlkKapanin çok oyunculu oyun state'i
const ilkKapaninGames = {};

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (data.type === 'join-lobby') {
      ws.lobbyCode = data.lobbyCode;
      // Oyun yoksa başlat ve kartları üret
      if (!activeGames[data.lobbyCode]) {
        // Katılımcı userId'lerini bul
        const lobby = lobbies[data.lobbyCode];
        const participants = lobby?.participants || [];
        // Her kullanıcıya bir kart üret
        const cards = {};
        participants.forEach((userId) => {
          cards[userId] = generateRandomCard();
        });
        activeGames[data.lobbyCode] = {
          drawnNumbers: [],
          currentNumber: null,
          cards, // { userId: kart }
        };
      }
      // Oyun durumunu sadece bu kullanıcıya gönder
      ws.userId = data.userId;
      const game = activeGames[data.lobbyCode];
      // Tüm kartları dizi olarak gönder: [[userId, kart], ...]
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

      // Çinko ve tombala durumlarını takip et
      if (!game.cinkoState) game.cinkoState = {}; // { userId: [true, false, false] }
      if (!game.tombalaState) game.tombalaState = {}; // { userId: true }
      const lobby = lobbies[ws.lobbyCode];
      const participants = lobby?.participants || [];
      const notifications = [];

      participants.forEach((userId) => {
        const card = game.cards[userId];
        if (!card) return;
        // Her satır için çinko kontrolü
        if (!game.cinkoState[userId]) game.cinkoState[userId] = [false, false, false];
        card.forEach((row, rowIdx) => {
          if (!game.cinkoState[userId][rowIdx]) {
            const isCinko = row.every(num => game.drawnNumbers.includes(num));
            if (isCinko) {
              game.cinkoState[userId][rowIdx] = true;
              // Bildirim ekle (kullanıcı adı ile, kaçıncı çinko olduğunu belirtmeden)
              const user = Object.values(users).find(u => u.userId === userId);
              const username = user ? user.username : userId;
              notifications.push(`${username}, Çinko yaptı!`);
            }
          }
        });
        // Tombala kontrolü
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

      // Tüm lobidekilere yeni durumu, kendi kartını ve bildirimleri gönder
      const allCards = Object.entries(game.cards);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
          client.send(JSON.stringify({
            type: 'game-state',
            drawnNumbers: game.drawnNumbers,
            currentNumber: game.currentNumber,
            card: game.cards[client.userId] || null,
            allCards,
            notifications, // Bildirimler eklendi
          }));
        }
      });
    }
    if (data.type === 'restart-game') {
      // Oyun sıfırlanır ve yeni kartlar üretilir
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
      // Herkese yeni oyun durumu gönder
      const game = activeGames[ws.lobbyCode];
      const allCards = Object.entries(game.cards);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.lobbyCode === ws.lobbyCode) {
          client.send(JSON.stringify({
            type: 'game-state',
            drawnNumbers: game.drawnNumbers,
            currentNumber: game.currentNumber,
            card: game.cards[client.userId] || null,
            allCards,
          }));
        }
      });
    }
    // IlkKapanin: Oyuna katılım
    if (data.type === 'join-lobby' && data.mode === 'ilkKapanin') {
      ws.lobbyCode = data.lobbyCode;
      ws.userId = data.userId;
      if (!ilkKapaninGames[data.lobbyCode]) {
        // Katılımcı userId'lerini bul
        const lobby = lobbies[data.lobbyCode];
        const participants = lobby?.participants || [];
        // Her kullanıcıya bir kart ve yıldız üret
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
          // 2 yıldızlı sayı seç
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
          cards, // { userId: [[...],[...],[...]] }
          starNumbers, // { userId: [num, num] }
          markedNumbers, // { userId: [num,...] }
          scores: Object.fromEntries(participants.map(uid => [uid, 0])),
          currentPlayer: participants[0],
          turnCount: 0,
          gameOver: false,
          jokerState: {}, // { userId: {mute: false, x3: false, hint: false} }
          notifications: [],
          selection: [], // Current turn's selected numbers
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
    // IlkKapanin: Oyunu başlat
    if (data.type === 'start-game' && ws.lobbyCode && ilkKapaninGames[ws.lobbyCode]) {
      const game = ilkKapaninGames[ws.lobbyCode];
      game.drawnNumbers = [];
      game.drawnBy = {}; // yeni: kim açtı
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
      // Herkese state gönder
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
    // IlkKapanin: Sayı seçme (her turda 3 sayı seçilmeli)
    if (data.type === 'select-number' && ws.lobbyCode && ilkKapaninGames[ws.lobbyCode]) {
      const game = ilkKapaninGames[ws.lobbyCode];
      if (!game.drawnBy) game.drawnBy = {}; // <-- fix for undefined
      if (game.gameOver) return;
      if (ws.userId !== game.currentPlayer) return;
      const num = data.number;
      if (game.drawnNumbers.includes(num) || (game.selection && game.selection.includes(num))) return;
      if (!game.selection) game.selection = [];
      game.selection.push(num);
      // 3 sayı seçilene kadar bekle
      if (game.selection.length < 3) {
        // Sadece state güncellemesi (seçimler gösterilsin diye)
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
      // 3 sayı seçildiğinde işaretleme ve puanlama yapılır
      const userId = ws.userId;
      let newMarked = [...game.markedNumbers[userId]];
      for (const n of game.selection) {
        // açan bilgisini kaydet
        game.drawnBy[n] = userId;
        // Eğer oyuncunun kartında bu sayı varsa işaretle
        if (game.cards[userId].flat().includes(n)) {
          newMarked.push(n);
          // 54 özel puan kuralı
          if (n === 54) {
            // Kendi kartında ve kendisi açtıysa +100
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
        // 54 başkası açtıysa -100
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
      // Oyun bitiş kontrolü (bir oyuncunun tüm sayıları işaretlemesi veya tüm sayılar çekilmesi)
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
        // Tüm sayılar çekildiyse, en yüksek puanlı kazanır
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
      // Joker round check: every 3 rounds per player
      const lobby = lobbies[ws.lobbyCode];
      const participants = lobby?.participants || [];
      let skipJoker = false;
      // Remove mute after 1 turn
      for (const uid of Object.keys(game.jokerState)) {
        if (game.jokerState[uid]?.mute === 1) {
          game.jokerState[uid].mute = 0;
        }
      }
      // Next player logic, skip muted
      let idx = participants.indexOf(game.currentPlayer);
      let nextIdx = (idx + 1) % participants.length;
      let nextPlayer = participants[nextIdx];
      let loopCount = 0;
      while (game.jokerState[nextPlayer]?.mute === 1 && loopCount < participants.length) {
        // skip muted player
        game.jokerState[nextPlayer].mute = 0; // remove mute after skip
        nextIdx = (nextIdx + 1) % participants.length;
        nextPlayer = participants[nextIdx];
        loopCount++;
      }
      game.currentPlayer = nextPlayer;
      game.selection = [];
      // Joker round: every 3 rounds per player
      if (
        game.turnCount > 0 &&
        game.turnCount % (participants.length * 3) === 0 &&
        !game.gameOver
      ) {
        // Find lowest scorer(s)
        const minScore = Math.min(...Object.values(game.scores));
        const minUsers = Object.keys(game.scores).filter(
          (uid) => game.scores[uid] === minScore
        );
        if (minUsers.length === 1) {
          // Send joker-select to that user only
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
      // Herkese state gönder (joker seçimi varsa, oyun durur, sadece eligible user dialog görür)
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
    // IlkKapanin: Joker seçimi
    if (data.type === 'joker-action' && ws.lobbyCode && ilkKapaninGames[ws.lobbyCode]) {
      const game = ilkKapaninGames[ws.lobbyCode];
      if (!game.jokerState) game.jokerState = {};
      const userId = ws.userId;
      if (data.jokerType === 'mute' && data.targetUserId) {
        if (!game.jokerState[data.targetUserId]) game.jokerState[data.targetUserId] = {};
        game.jokerState[data.targetUserId].mute = 1; // skip next turn
        game.notifications.push(`${data.targetUserName || data.targetUserId} 1 tur susturuldu!`);
      } else if (data.jokerType === 'x3') {
        if (!game.jokerState[userId]) game.jokerState[userId] = {};
        game.jokerState[userId].x3 = true;
        game.notifications.push(`Bir sonraki turda puanın 3 katı!`);
      } else if (data.jokerType === 'hint' && data.hintNumber) {
        // Reveal the number for all players (show who has it)
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
      // Herkese state gönder
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
  });
});

const PORT = 3003;
server.listen(PORT, 'localhost', () => { 
  console.log(`Server is running on http://localhost:${PORT}`);
});
