import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Badge } from '@mui/material';
import { Close as CloseIcon, ChatBubbleOutline as ChatBubbleOutlineIcon, Remove as RemoveIcon } from '@mui/icons-material';

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
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [scores, setScores] = useState({});
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [selection, setSelection] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [userLobbies, setUserLobbies] = useState([]);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [lobbyUsers, setLobbyUsers] = useState([]);
  const wsRef = useRef(null);
  const [shuffledNumbers, setShuffledNumbers] = useState([]);
  const [drawnBy, setDrawnBy] = useState({});
  const [starNumbers, setStarNumbers] = useState([]);
  const [userAvatars, setUserAvatars] = useState({});
  const [jokerDialogOpen, setJokerDialogOpen] = useState(false);
  const [jokerEligible, setJokerEligible] = useState(null);
  const [jokerType, setJokerType] = useState(null);
  const [muteTargetDialogOpen, setMuteTargetDialogOpen] = useState(false);
  const [hintDialogOpen, setHintDialogOpen] = useState(false);
  const [hintNumber, setHintNumber] = useState('');
  const [pendingMuteTarget, setPendingMuteTarget] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const notificationAudioRef = React.useRef(null);

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

  const handleLobbySelect = async (lobbyCode) => {
    setSelectedLobby(lobbyCode);
    try {
      const response = await fetch('http://localhost:3003/lobbies');
      const data = await response.json();
      const lobby = data[lobbyCode];
      const participants = lobby?.participants || [];
      const participantNames = lobby?.participantNames || [];
      let usersJson = {};
      try {
        usersJson = await fetch('/api/users').then(r => r.json());
      } catch (e) {
        usersJson = {};
      }
      const avatarMap = {};
      Object.values(usersJson).forEach(u => {
        if (u.userId && u.avatar !== undefined) {
          avatarMap[u.userId] = u.avatar;
        }
      });
      setUserAvatars(avatarMap);
      const users = participants.map((userId, i) => ({
        userId,
        username: participantNames[i] || `Oyuncu ${i + 1}`,
        avatar: avatarMap[userId] || ''
      }));
      setLobbyUsers(users);

      try {
        const lobbyAvatars = JSON.parse(localStorage.getItem('lobbyAvatars') || '{}');
        users.forEach(u => {
          if (u.userId && u.avatar) {
            lobbyAvatars[u.userId] = u.avatar;
          }
        });
        localStorage.setItem('lobbyAvatars', JSON.stringify(lobbyAvatars));
      } catch (e) {}
    } catch (error) {
      setLobbyUsers([]);
    }
  };

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
        if (Array.isArray(data.allCards) && data.allCards.length > 0 && data.scores && data.currentPlayer) {
          setGameStarted(true);
        } else {
          setGameStarted(false);
        }
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
      if (data.type === 'lobby-chat' && data.message) {
        if (!data.message.lobbyCode || data.message.lobbyCode === selectedLobby) {
          setChatMessages((prev) => [...prev, data.message]);
          if (!chatOpen) {
            setHasUnreadChat(true);
            if (notificationAudioRef.current) {
              notificationAudioRef.current.currentTime = 0;
              notificationAudioRef.current.play();
            }
          }
        }
      }
    };
    ws.onerror = () => setGameStarted(false);
    ws.onclose = () => setGameStarted(false);
    return () => ws.close();
  }, [selectedLobby, userId]);

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
  const handleRestart = async () => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(JSON.stringify({ type: 'restart-game' }));
      const response = await fetch(`/api/new-cards?lobbyCode=${selectedLobby}`);
      if (response.ok) {
        const { newCards } = await response.json();
        setAllCards(newCards);
      } else {
        console.error('Failed to fetch new cards');
      }
      setDrawnNumbers([]);
      setScores({});
      setGameOver(false);
      setCurrentPlayer(null);
      setSelection([]);
      setDrawnBy({});
      setStarNumbers([]);
      setGameStarted(false);
    }
  };

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
            onClick={() => {
              sendJokerAction('x3');
              setJokerDialogOpen(false);
            }}
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
          <Button variant="contained" color="primary" onClick={() => {
            const num = parseInt(hintNumber, 10);
            if (num >= 1 && num <= 99 && !drawnNumbers.includes(num)) {
              setDrawnNumbers(prev => prev.includes(num) ? prev : [...prev, num]);
              setDrawnBy(prev => ({ ...prev, [num]: null }));
              sendJokerAction('hint', num);
            }
            setHintDialogOpen(false);
            setHintNumber('');
          }}>
            Onayla
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );

  const sendChatMessage = () => {
    if (!chatInput.trim() || !selectedLobby) return;
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(
        JSON.stringify({
          type: "lobby-chat",
          lobbyCode: selectedLobby,
          userId,
          username,
          text: chatInput.trim(),
        })
      );
      setChatInput("");
    }
  };

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

  const isJokerBlocked = jokerDialogOpen || muteTargetDialogOpen || hintDialogOpen;

  let renderContent;
  try {
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
            <Button
              variant="contained"
              color="success"
              onClick={handleStart}
              sx={{
                fontFamily: 'Underdog, sans-serif',
                fontWeight: 'bold',
                fontSize: 18,
                px: 3,
                py: 1.5,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
                },
              }}
            >
              🚀 Oyunu Başlat 🚀
            </Button>
          )}
        </Box>
      );
    } else {
      const playerCount = allCards.length;
      const round = playerCount > 0 ? Math.floor(drawnNumbers.length / (playerCount * 3)) + 1 : 1;
      let winnerUid = null;
      let winnerText = '';
      if (gameOver) {
        const maxScore = Math.max(...Object.values(scores));
        const winners = Object.keys(scores).filter(uid => scores[uid] === maxScore);
        winnerUid = winners.length === 1 ? winners[0] : null;
        winnerText = winners.length === 1
          ? `${lobbyUsers.find(u => u.userId === winners[0])?.username || 'Bir oyuncu'} kazandı!`
          : 'Beraberlik!';
      }
      renderContent = (
        <Box sx={{ mt: 10, px: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {jokerDialogOpen && jokerEligible === userId && renderJokerDialog()}
            {muteTargetDialogOpen && renderMuteTargetDialog()}
            {hintDialogOpen && renderHintDialog()}

            <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 1, mt: 2, fontWeight: 'bold', color: '#2e7d32' }}>
              Tur: {round}
            </Typography>
            <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 2, mt: 1 }}>
              Sıra: {(() => {
                const user = lobbyUsers.find(u => u.userId === currentPlayer);
                return user ? user.username + (currentPlayer === userId ? ' (Siz)' : '') : currentPlayer;
              })()}
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 1 }}>
                1-99 arası {3 - selection.length} sayı seçiniz:
              </Typography>
              <Grid container spacing={1} justifyContent="center">
                {(shuffledNumbers.length > 0 ? shuffledNumbers : Array.from({ length: 99 }, (_, i) => i + 1)).map((num) => {
                  const openedBy = drawnBy[num];
                  let bg = undefined;
                  let color = undefined;
                  let border = undefined;
                  if (drawnNumbers.includes(num)) {
                    if (openedBy === userId) {
                      bg = '#388e3c';
                      color = '#fff';
                    } else if (openedBy === null) {
                      bg = '#ffe082';
                      color = '#333';
                      border = '2px dashed #ffd600';
                    } else {
                      bg = '#bdbdbd';
                      color = '#333';
                    }
                  }
                  return (
                    <Grid item xs={2} sm={1} md={1} key={num}>
                      <Button
                        variant={drawnNumbers.includes(num) ? 'contained' : 'outlined'}
                        color={drawnNumbers.includes(num) ? 'success' : 'primary'}
                        disabled={!isMyTurn || drawnNumbers.includes(num) || selection.includes(num) || gameOver || selection.length >= 3 || isJokerBlocked}
                        onClick={() => handleCardClick(num)}
                        sx={{
                          minWidth: 36,
                          minHeight: 36,
                          fontSize: 14,
                          fontFamily: 'Underdog, sans-serif',
                          backgroundColor: bg,
                          color,
                          border,
                          boxShadow: drawnNumbers.includes(num) ? '0 2px 6px rgba(0,0,0,0.10)' : undefined,
                          transition: 'all 0.2s',
                          m: 0.2
                        }}
                        title={openedBy === null ? 'İpucu jokeriyle açıldı' : undefined}
                      >
                        {drawnNumbers.includes(num) ? num : '?'}
                      </Button>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Grid container spacing={2} justifyContent="center">
              {allCards.map(([uid, kart], idx) => {
                let stars = [];
                if (Array.isArray(starNumbers) && starNumbers[idx]) {
                  stars = starNumbers[idx];
                }
                let displayName = uid;
                const userObj = lobbyUsers.find(u => u.userId === uid);
                if (userObj && userObj.username) {
                  displayName = userObj.username + (uid === userId ? ' (Siz)' : '');
                } else if (uid === userId) {
                  displayName = username + ' (Siz)';
                }
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={uid}
                    sx={{
                      zIndex: gameOver && winnerUid === uid ? 100 : 1,
                      transition: gameOver ? 'transform 0.7s cubic-bezier(.4,2,.6,1), box-shadow 0.7s' : undefined,
                      transform:
                        gameOver && winnerUid === uid
                          ? 'scale(1.15) translateY(-30px)'
                          : 'scale(1)',
                      boxShadow:
                        gameOver && winnerUid === uid
                          ? '0 0 40px 10px #ffd600, 0 8px 32px #2e7d32'
                          : '0 4px 12px rgba(0,0,0,0.1)',
                      filter:
                        gameOver && winnerUid !== uid
                          ? 'blur(2px) grayscale(0.7) opacity(0.5)'
                          : 'none',
                      pointerEvents: gameOver ? (winnerUid === uid ? 'auto' : 'none') : 'auto',
                    }}
                  >
                    <Box
                      sx={{
                        border: currentPlayer === uid ? '3px solid #2e7d32' : '2px solid #2e7d32',
                        borderRadius: 2,
                        padding: 2,
                        backgroundColor: '#fff',
                        textAlign: 'center',
                        opacity: currentPlayer === uid ? 1 : 0.7,
                        position: 'relative',
                        transition: 'box-shadow 0.7s, border 0.7s',
                        borderColor: gameOver && winnerUid === uid ? '#ffd600' : undefined,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        <Avatar
                          src={uid === userId
                            ? (localStorage.getItem('avatar')?.startsWith('/images/')
                                ? localStorage.getItem('avatar')
                                : localStorage.getItem('avatar') ? `/images/${localStorage.getItem('avatar')}` : undefined)
                            : (userObj && userObj.avatar ? (userObj.avatar.startsWith('/images/') ? userObj.avatar : `/images/${userObj.avatar}`) : undefined)
                          }
                          sx={{ bgcolor: '#2e7d32', width: 48, height: 48, fontSize: 28 }}
                        >
                          {(!userObj || !userObj.avatar) && (userObj && userObj.username ? userObj.username[0].toUpperCase() : (username ? username[0].toUpperCase() : '?'))}
                        </Avatar>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Underdog, sans-serif', color: '#2e7d32', mb: 2 }}>
                        {displayName}
                        {currentPlayer === uid && ' (Sıra)'}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 1 }}>
                        Puan: {scores[uid] || 0}
                      </Typography>
                      <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 1, color: '#ff9800' }}>
                        Yıldızlı: {stars.join(', ')}
                      </Typography>
                      {kart && kart.map((row, i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                          {row.map((num, j) => {
                            const isStar = stars.includes(num);
                            const openedBy = drawnBy[num];
                            let bg = '#e0e0e0';
                            let color = '#555';
                            let border = isStar ? '2px solid #ff9800' : '1px solid #bbb';
                            if (num === 54 && drawnNumbers.includes(num)) {
                              if (openedBy === uid) {
                                bg = '#1565c0';
                                color = '#fff';
                                border = '2px solid #1565c0';
                              } else if (openedBy) {
                                bg = '#d32f2f';
                                color = '#fff';
                                border = '2px solid #d32f2f';
                              }
                            } else if (drawnNumbers.includes(num)) {
                              if (openedBy === uid) {
                                bg = '#81c784';
                                color = '#000';
                              } else if (openedBy) {
                                bg = '#bdbdbd';
                                color = '#333';
                              } else {
                                bg = '#ffd600';
                                color = '#000';
                              }
                            }
                            return (
                              <Typography
                                key={j}
                                sx={{
                                  backgroundColor: bg,
                                  color,
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border,
                                  fontWeight: 'bold',
                                  fontFamily: 'Underdog, sans-serif',
                                  m: 0.5,
                                  minWidth: 48,
                                  minHeight: 40,
                                  maxWidth: 48,
                                  maxHeight: 40,
                                  width: 48,
                                  height: 40,
                                  fontSize: 18,
                                  boxSizing: 'border-box',
                                  padding: 0,
                                  letterSpacing: 0.5,
                                  transition: 'background 0.2s, color 0.2s',
                                }}
                              >
                                {num}
                                {isStar && <span style={{ color: '#ff9800', marginLeft: 2, fontSize: 18 }}>★</span>}
                              </Typography>
                            );
                          })}
                        </Box>
                      ))}
                      {gameOver && winnerUid === uid && (
                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'Underdog, sans-serif', fontWeight: 'bold', fontSize: 22, mb: 1 }}>
                Tur: {round}
              </Typography>
              {gameOver && (
                <Typography sx={{ fontFamily: 'Underdog, sans-serif', color: '#d32f2f', fontWeight: 'bold', mt: 2 }}>
                  {winnerText}
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2, fontWeight: 'bold', fontFamily: 'Underdog, sans-serif' }}
                onClick={handleRestart}
              >
                Yeniden Başlat
              </Button>
            </Box>
          </Box>
          {!chatOpen && (
            <Box
              sx={{
                position: 'fixed',
                right: { xs: 16, md: 32 },
                bottom: { xs: 16, md: 32 },
                zIndex: 1300,
              }}
            >
              <Badge
                color="error"
                variant="dot"
                invisible={!hasUnreadChat}
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => setChatOpen(true)}
                  sx={{ minWidth: 0, width: 56, height: 56, borderRadius: '50%', boxShadow: 4, p: 0 }}
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 32 }} />
                </Button>
              </Badge>
            </Box>
          )}
          {chatOpen && (
            <Box sx={{
              position: 'fixed',
              right: { xs: 8, md: 24 },
              bottom: { xs: 8, md: 24 },
              width: 260,
              minWidth: 180,
              maxWidth: 320,
              bgcolor: '#f5f5f5',
              borderRadius: 2,
              boxShadow: 4,
              display: 'flex',
              flexDirection: 'column',
              height: 280,
              zIndex: 1200
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, pb: 0 }}>
                <Typography sx={{ fontFamily: 'Underdog, sans-serif', fontWeight: 'bold', fontSize: 15, color: '#2e7d32' }}>Lobi Sohbeti</Typography>
                <Button onClick={() => setChatOpen(false)} sx={{ minWidth: 0, p: 0.5 }}><RemoveIcon /></Button>
              </Box>
              <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 0.5, mb: 1 }}>
                {chatMessages.length === 0 && (
                  <Typography sx={{ color: '#888', fontSize: 12, fontFamily: 'Underdog, sans-serif' }}>Henüz mesaj yok.</Typography>
                )}
                {chatMessages.map((msg, i) => {
                  let avatarSrc = '';
                  let displayName = msg.username || '?';
                  if (!msg.username || msg.username === '?') {
                    const userObj = lobbyUsers.find(u => u.userId === msg.userId);
                    if (userObj && userObj.username) {
                      displayName = userObj.username;
                    } else if (msg.userId === userId && username) {
                      displayName = username;
                    } else {
                      displayName = msg.userId === userId ? 'Siz' : 'Kullanıcı';
                    }
                  }
                  if (msg.userId === userId) {
                    avatarSrc = localStorage.getItem('avatar')?.startsWith('/images/')
                      ? localStorage.getItem('avatar')
                      : localStorage.getItem('avatar') ? `/images/${localStorage.getItem('avatar')}` : '';
                  } else {
                    const lobbyAvatars = JSON.parse(localStorage.getItem('lobbyAvatars') || '{}');
                    if (lobbyAvatars[msg.userId]) {
                      avatarSrc = lobbyAvatars[msg.userId].startsWith('/images/') ? lobbyAvatars[msg.userId] : `/images/${lobbyAvatars[msg.userId]}`;
                    } else if (userAvatars && userAvatars[msg.userId]) {
                      avatarSrc = userAvatars[msg.userId].startsWith('/images/') ? userAvatars[msg.userId] : `/images/${userAvatars[msg.userId]}`;
                    } else {
                      const userObj = lobbyUsers.find(u => u.userId === msg.userId);
                      if (userObj && userObj.avatar) {
                        avatarSrc = userObj.avatar.startsWith('/images/') ? userObj.avatar : `/images/${userObj.avatar}`;
                      }
                    }
                  }
                  return (
                    <Box key={msg.ts + '-' + i} sx={{ mb: 0.5, display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
                      <Avatar
                        src={avatarSrc || undefined}
                        sx={{ width: 22, height: 22, fontSize: 12, bgcolor: msg.userId === userId ? '#2e7d32' : '#bdbdbd', mr: 0.5 }}
                      >
                        {!avatarSrc && (displayName ? displayName[0].toUpperCase() : '?')}
                      </Avatar>
                      <Box sx={{ bgcolor: msg.userId === userId ? '#c8e6c9' : '#fff', borderRadius: 2, px: 1, py: 0.2, maxWidth: 140, boxShadow: 1 }}>
                        <Typography sx={{ fontWeight: 'bold', fontSize: 11, color: '#2e7d32', fontFamily: 'Underdog, sans-serif' }}>{displayName}</Typography>
                        <Typography sx={{ fontSize: 12, color: '#333', fontFamily: 'Underdog, sans-serif' }}>{msg.text}</Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 1, pt: 0, borderTop: '1px solid #e0e0e0' }}>
                <TextField
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendChatMessage(); }}
                  placeholder="Mesaj yaz..."
                  size="small"
                  sx={{ flex: 1, mr: 1, fontFamily: 'Underdog', fontSize: 12 }}
                  inputProps={{ maxLength: 200, style: { fontSize: 12 } }}
                />
                <Button variant="contained" color="success" onClick={sendChatMessage} sx={{ fontWeight: 'bold', fontFamily: 'Underdog', fontSize: 12, px: 1.5, py: 0.5 }}>Gönder</Button>
              </Box>
            </Box>
          )}
          <audio ref={notificationAudioRef} src="/images/notify.mp3" preload="auto" style={{ display: 'none' }} />
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
