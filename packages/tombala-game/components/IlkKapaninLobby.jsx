import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

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

export default function IlkKapaninLobby({}) {
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  const [drawnNumbers, setDrawnNumbers] = useState([]); // Açılan kartlar (1-99)
  const [allCards, setAllCards] = useState([]); // [[userId, kart]]
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({}); // {userId: puan}
  const [currentPlayer, setCurrentPlayer] = useState(null); // userId
  const [selection, setSelection] = useState([]); // Sıradaki oyuncunun seçtiği kartlar
  const [gameStarted, setGameStarted] = useState(false);
  const [userLobbies, setUserLobbies] = useState([]);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [lobbyUsers, setLobbyUsers] = useState([]);
  const wsRef = useRef(null);
  const [shuffledNumbers, setShuffledNumbers] = useState([]); // karışık 1-99
  const [drawnBy, setDrawnBy] = useState({});
  const [starNumbers, setStarNumbers] = useState([]); // Yıldızlı sayılar için durum
  const [userAvatars, setUserAvatars] = useState({});
  const [jokerDialogOpen, setJokerDialogOpen] = useState(false);
  const [jokerEligible, setJokerEligible] = useState(null);
  const [jokerType, setJokerType] = useState(null);
  const [muteTargetDialogOpen, setMuteTargetDialogOpen] = useState(false);
  const [hintDialogOpen, setHintDialogOpen] = useState(false);
  const [hintNumber, setHintNumber] = useState('');
  const [pendingMuteTarget, setPendingMuteTarget] = useState(null);

  // Lobi listesini çek
  useEffect(() => {
    const fetchUserLobbies = async () => {
      try {
        const response = await fetch('http://localhost:3003/lobbies');
        const data = await response.json();
        const lobbies = Object.entries(data)
          .filter(([code, lobby]) => (lobby.participants || []).includes(userId))
          .map(([code, lobby]) => ({ code, name: lobby.name }));
        setUserLobbies(lobbies);
      } catch (error) {
        setUserLobbies([]);
      }
    };
    fetchUserLobbies();
  }, [userId]);

  // Lobi seçilince lobideki kullanıcıları çek
  const handleLobbySelect = async (lobbyCode) => {
    setSelectedLobby(lobbyCode);
    try {
      const response = await fetch('http://localhost:3003/lobbies');
      const data = await response.json();
      const lobby = data[lobbyCode];
      const participants = lobby?.participants || [];
      const participantNames = lobby?.participantNames || [];
      // users.json'dan avatarları çek
      const usersJson = await fetch('/users.json').then(r => r.json()).catch(() => ({}));
      // userId -> avatar eşlemesi
      const avatarMap = {};
      Object.values(usersJson).forEach(u => {
        if (u.userId && u.avatar !== undefined) avatarMap[u.userId] = u.avatar;
      });
      setUserAvatars(avatarMap);
      const users = participants.map((userId, i) => ({
        userId,
        username: participantNames[i] || `Oyuncu ${i + 1}`,
        avatar: avatarMap[userId] || ''
      }));
      setLobbyUsers(users);
    } catch (error) {
      setLobbyUsers([]);
    }
  };

  // Oyun başında bir kez karıştır
  useEffect(() => {
    if (gameStarted && drawnNumbers.length === 0) {
      const arr = Array.from({ length: 99 }, (_, i) => i + 1);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setShuffledNumbers(arr);
    }
  }, [gameStarted]);

  // WebSocket bağlantısı ve oyun state'i sadece lobi seçilince başlatılsın
  useEffect(() => {
    if (!selectedLobby) return;
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket('ws://localhost:3003');
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join-lobby', lobbyCode: selectedLobby, userId, mode: 'ilkKapanin' }));
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'game-state') {
        setDrawnNumbers(data.drawnNumbers || []);
        setAllCards(data.allCards || []);
        setScores(data.scores || {});
        setGameOver(data.gameOver || false);
        setCurrentPlayer(data.currentPlayer);
        setSelection(data.selection || []);
        setDrawnBy(data.drawnBy || {});
        setStarNumbers(data.starNumbers || []);
        // Only set gameStarted to true if state is valid
        if (Array.isArray(data.allCards) && data.allCards.length > 0 && data.scores && data.currentPlayer) {
          setGameStarted(true);
        } else {
          setGameStarted(false);
        }
        // Eğer oyun yeniden başlatıldıysa veya yeni oyun başladıysa kartları tekrar karıştır
        if (data.drawnNumbers && data.drawnNumbers.length === 0) {
          const arr = Array.from({ length: 99 }, (_, i) => i + 1);
          for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
          }
          setShuffledNumbers(arr);
        }
      }
      if (data.type === 'joker-select') {
        setJokerDialogOpen(true);
        setJokerEligible(data.eligibleUserId);
      }
    };
    ws.onerror = () => setGameStarted(false);
    ws.onclose = () => setGameStarted(false);
    return () => ws.close();
  }, [selectedLobby, userId]);

  // Sadece kendi sırası olan oyuncu seçim yapabilir
  const isMyTurn = currentPlayer === userId;
  const handleCardClick = (num) => {
    if (!isMyTurn || drawnNumbers.includes(num) || selection.includes(num) || gameOver || selection.length >= 3) return;
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'select-number', number: num }));
    }
  };
  const handleStart = () => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'start-game' }));
    }
  };
  const handleRestart = () => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'restart-game' }));
    }
  };

  // Joker action senders
  const sendJokerAction = (type, extra) => {
    if (!wsRef.current || wsRef.current.readyState !== 1) return;
    let msg = { type: 'joker-action', jokerType: type };
    if (type === 'mute' && extra) {
      msg.targetUserId = extra.userId;
      msg.targetUserName = extra.username;
    }
    if (type === 'hint' && extra) {
      msg.hintNumber = extra;
    }
    wsRef.current.send(JSON.stringify(msg));
    setJokerDialogOpen(false);
    setMuteTargetDialogOpen(false);
    setHintDialogOpen(false);
    setHintNumber('');
  };

  // Joker dialog UI
  const renderJokerDialog = () => (
    <Dialog open={jokerDialogOpen} onClose={() => {}} disableEscapeKeyDown>
      <DialogTitle>Joker Seçimi</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, mt: 1, justifyContent: 'center' }}>
          <Button
            variant="contained"
            sx={{ m: 1, fontSize: 32, width: 64, height: 64, borderRadius: '50%', backgroundColor: '#2e7d32', color: '#fff' }}
            onClick={() => { setJokerType('mute'); setJokerDialogOpen(false); setMuteTargetDialogOpen(true); }}
            title="Sustur: Bir rakibini 1 tur susturabilirsin."
          >🤫</Button>
          <Button
            variant="contained"
            sx={{ m: 1, fontSize: 32, width: 64, height: 64, borderRadius: '50%', backgroundColor: '#2e7d32', color: '#fff' }}
            onClick={() => { sendJokerAction('x3'); }}
            title="3X: Bir sonraki turda puanın 3 katı yazılır."
          >🚀</Button>
          <Button
            variant="contained"
            sx={{ m: 1, fontSize: 32, width: 64, height: 64, borderRadius: '50%', backgroundColor: '#2e7d32', color: '#fff' }}
            onClick={() => { setJokerType('hint'); setJokerDialogOpen(false); setHintDialogOpen(true); }}
            title="İpucu: Bir sayının hangi kartta olduğunu öğren."
          >💡</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );

  // Mute target dialog
  const renderMuteTargetDialog = () => (
    <Dialog open={muteTargetDialogOpen} onClose={() => setMuteTargetDialogOpen(false)}>
      <DialogTitle>Hangi rakibini susturmak istersin?</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {lobbyUsers.filter(u => u.userId !== userId).map(u => (
            <Button key={u.userId} variant="contained" color="error" sx={{ m: 1 }} onClick={() => sendJokerAction('mute', u)}>
              {u.username}
            </Button>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );

  // Hint dialog
  const renderHintDialog = () => (
    <Dialog open={hintDialogOpen} onClose={() => setHintDialogOpen(false)}>
      <DialogTitle>Hangi sayının yerini görmek istiyorsunuz?</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="number"
            label="1-99"
            value={hintNumber}
            onChange={e => setHintNumber(e.target.value)}
            inputProps={{ min: 1, max: 99 }}
          />
          <Button variant="contained" color="primary" onClick={() => { if (hintNumber >= 1 && hintNumber <= 99) sendJokerAction('hint', hintNumber); }}>
            Onayla
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );

  // Lobi seçilmemişse önce lobi seçtir
  if (!selectedLobby) {
    return (
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 2 }}>
          Hangi lobi ile oynamak istersiniz?
        </Typography>
        {userLobbies.length === 0 && (
          <Typography sx={{ fontFamily: 'Underdog, sans-serif' }}>
            Şu anda katıldığınız bir lobi yok.
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {userLobbies.map((lobi) => (
            <Button
              key={lobi.code}
              variant="contained"
              onClick={() => handleLobbySelect(lobi.code)}
              sx={{ fontFamily: 'Underdog, sans-serif' }}
            >
              {lobi.name}
            </Button>
          ))}
        </Box>
      </Box>
    );
  }

  // Joker engeli: Sadece joker seçimi sırasında diğer oyuncular engellenir
  const isJokerBlocked = jokerDialogOpen || muteTargetDialogOpen || hintDialogOpen;

  // --- DEFENSIVE RENDER WRAPPER ---
  let renderContent;
  try {
    // Defensive: show loading or start button if state is incomplete or invalid
    const isStateInvalid =
      !Array.isArray(allCards) ||
      allCards.length === 0 ||
      !scores ||
      typeof currentPlayer !== 'string' ||
      Object.keys(scores).length === 0 ||
      allCards.some(card => !Array.isArray(card) || card.length < 2);

    if (!selectedLobby) {
      renderContent = (
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 2 }}>
            Hangi lobi ile oynamak istersiniz?
          </Typography>
          {userLobbies.length === 0 && (
            <Typography sx={{ fontFamily: 'Underdog, sans-serif' }}>
              Şu anda katıldığınız bir lobi yok.
            </Typography>
          )}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {userLobbies.map((lobi) => (
              <Button
                key={lobi.code}
                variant="contained"
                onClick={() => handleLobbySelect(lobi.code)}
                sx={{ fontFamily: 'Underdog, sans-serif' }}
              >
                {lobi.name}
              </Button>
            ))}
          </Box>
        </Box>
      );
    } else if (!gameStarted || isStateInvalid) {
      renderContent = (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography sx={{ color: '#d32f2f', mb: 2 }}>
            {selectedLobby ? 'Oyun başlatılıyor veya yükleniyor...' : 'Lobi seçiniz.'}
          </Typography>
          {selectedLobby && (
            <Button variant="contained" color="success" onClick={handleStart}>
              Oyunu Başlat
            </Button>
          )}
          <Box sx={{ mt: 4, textAlign: 'left', maxWidth: 600, mx: 'auto', bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
            <Typography variant="body2" sx={{ color: '#888', mb: 1 }}>Debug: Oyun State</Typography>
            <pre style={{ fontSize: 12, maxHeight: 200, overflow: 'auto' }}>{JSON.stringify({ allCards, scores, currentPlayer, gameStarted, drawnNumbers, starNumbers }, null, 2)}</pre>
          </Box>
        </Box>
      );
    } else {
      renderContent = (
        <Box sx={{ mt: 4 }}>
          {jokerDialogOpen && jokerEligible === userId && renderJokerDialog()}
          {muteTargetDialogOpen && renderMuteTargetDialog()}
          {hintDialogOpen && renderHintDialog()}
          <Typography variant="h5" sx={{ mb: 2 }}>
            İlk Kapanın (Lobi)
          </Typography>
          <Typography sx={{ mb: 2, color: isMyTurn ? '#2e7d32' : '#888', fontWeight: 'bold' }}>
            {isMyTurn ? 'Sıra sizde! 3 kart seçin' : 'Diğer oyuncuyu bekleyin...'}
          </Typography>
          {isJokerBlocked && (
            <Box sx={{ mb: 2 }}>
              <Typography color="warning.main" fontWeight="bold">Joker seçimi bekleniyor...</Typography>
            </Box>
          )}
          <Button variant="outlined" color="secondary" onClick={handleRestart} sx={{ ml: 2 }} disabled={isJokerBlocked}>
            Oyunu Yeniden Başlat
          </Button>
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography sx={{ fontWeight: 'bold' }}>Kapalı Kartlar</Typography>
            <Grid container spacing={1} justifyContent="center">
              {(shuffledNumbers.length > 0 ? shuffledNumbers : Array.from({ length: 99 }, (_, i) => i + 1)).map((num) => {
                const openedBy = drawnBy[num];
                let bg = undefined;
                let color = undefined;
                if (drawnNumbers.includes(num)) {
                  if (openedBy === userId) {
                    bg = '#388e3c';
                    color = '#fff';
                  } else {
                    bg = '#bdbdbd';
                    color = '#333';
                  }
                }
                return (
                  <Grid item key={num}>
                    <Button
                      variant={drawnNumbers.includes(num) ? 'contained' : 'outlined'}
                      color={drawnNumbers.includes(num) ? 'success' : 'primary'}
                      disabled={!isMyTurn || drawnNumbers.includes(num) || selection.includes(num) || gameOver || selection.length >= 3 || isJokerBlocked}
                      onClick={() => handleCardClick(num)}
                      sx={{ minWidth: 32, minHeight: 32, fontWeight: 'bold', mx: 0.2, backgroundColor: bg, color }}
                    >
                      {drawnNumbers.includes(num) ? num : '?'}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">Oyuncu Kartları</Typography>
            <Grid container spacing={2} justifyContent="center" alignItems="stretch">
              {allCards.map(([uid, kart], idx) => {
                // Her oyuncunun yıldızlı sayıları
                let stars = [];
                if (Array.isArray(starNumbers) && starNumbers[idx]) {
                  stars = starNumbers[idx];
                }
                // Kullanıcı adı bul
                let displayName = uid;
                const userObj = lobbyUsers.find(u => u.userId === uid);
                if (userObj && userObj.username) {
                  displayName = userObj.username + (uid === userId ? ' (Siz)' : '');
                } else if (uid === userId) {
                  displayName = username + ' (Siz)';
                }
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={uid} display="flex" justifyContent="center" alignItems="stretch">
                    <Box sx={{
                      border: '2px solid #2e7d32',
                      borderRadius: 2,
                      p: 2,
                      mb: 2,
                      background: currentPlayer === uid ? '#e8f5e9' : '#fff',
                      minWidth: 220,
                      maxWidth: 260,
                      boxShadow: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                    }}>
                      {/* Avatar ekle */}
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Avatar
                          src={userObj && userObj.avatar ? `/images/${userObj.avatar.split('/').pop()}` : undefined}
                          sx={{ bgcolor: '#2e7d32', width: 48, height: 48, fontSize: 28 }}
                        >
                          {(!userObj || !userObj.avatar) && (userObj && userObj.username ? userObj.username[0].toUpperCase() : (username ? username[0].toUpperCase() : '?'))}
                        </Avatar>
                      </Box>
                      <Typography sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                        {displayName}
                        {currentPlayer === uid && ' (Sıra)'}
                      </Typography>
                      {kart && kart.map((row, i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                          {row.map((num, j) => {
                            const isStar = stars.includes(num);
                            const openedBy = drawnBy[num];
                            let bg = '#e0e0e0';
                            let color = '#555';
                            let border = '1px solid #bbb';
                            // 54 özel puan kuralı için görsel vurgulama
                            if (num === 54 && drawnNumbers.includes(num)) {
                              if (openedBy === uid) {
                                bg = '#1565c0'; // kendi açtıysa mavi
                                color = '#fff';
                                border = '2px solid #1565c0';
                              } else if (openedBy) {
                                bg = '#d32f2f'; // başkası açtıysa kırmızı
                                color = '#fff';
                                border = '2px solid #d32f2f';
                              }
                            } else if (drawnNumbers.includes(num)) {
                              if (openedBy === uid) {
                                bg = '#388e3c';
                                color = '#fff';
                              } else if (openedBy) {
                                bg = '#bdbdbd';
                                color = '#333';
                              } else {
                                bg = '#ffd600';
                                color = '#000';
                              }
                            }
                            return (
                              <Box
                                key={j}
                                sx={{
                                  minWidth: 32,
                                  minHeight: 32,
                                  fontWeight: 'bold',
                                  mx: 0.5,
                                  backgroundColor: bg,
                                  color,
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  display: 'inline-block',
                                  border,
                                  position: 'relative',
                                }}
                              >
                                {num}
                                {isStar && (
                                  <Typography component="span" color="warning.main" sx={{ ml: 0.5, fontSize: 18, verticalAlign: 'middle', fontWeight: 'bold' }}>
                                    ★
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      ))}
                      <Typography sx={{ fontWeight: 'bold', mt: 1, textAlign: 'center' }}>
                        Puan: {scores[uid] || 0}
                      </Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
          {gameOver && (
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: '#2e7d32', fontWeight: 'bold' }}>Oyun Bitti!</Typography>
            </Box>
          )}
        </Box>
      );
    }
  } catch (err) {
    renderContent = (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography sx={{ color: '#d32f2f', mb: 2 }}>Bir hata oluştu: {String(err)}</Typography>
        <pre style={{ fontSize: 12, maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>{err.stack}</pre>
      </Box>
    );
  }

  return renderContent;
}
