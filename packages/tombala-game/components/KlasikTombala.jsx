import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grow, Grid, Snackbar } from '@mui/material';
import { API_BASE_URL, WS_URL } from '../config';

const fetchUserLobbies = async (userId) => [
  { code: 'ABC123', name: 'Aile Lobisi' },
  { code: 'XYZ789', name: 'Arkadaşlar' }
];
const fetchLobbyUsers = async (lobbyCode) => {
  if (lobbyCode === 'ABC123') {
    return [
      { userId: '1', username: 'Ali' },
      { userId: '2', username: 'Veli' }
    ];
  }
  if (lobbyCode === 'XYZ789') {
    return [
      { userId: '3', username: 'Ayşe' },
      { userId: '4', username: 'Fatma' },
      { userId: '5', username: 'Mehmet' }
    ];
  }
  return [];
};

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

export default function KlasikTombala({ playType, notify }) {
  const [playerCount, setPlayerCount] = useState(null);
  const [cards, setCards] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [showAllCards, setShowAllCards] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [tombalaWinners, setTombalaWinners] = useState([]);
  const [userLobbies, setUserLobbies] = useState([]);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [lobbyUsers, setLobbyUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [serverCard, setServerCard] = useState(null);
  const [allCards, setAllCards] = useState([]);
  const [completedRows, setCompletedRows] = useState(0);
  const [isTombala, setIsTombala] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const hasNotifiedGameStart = React.useRef(false);

  useEffect(() => {
    const fetchUserLobbies = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`${API_BASE_URL}/lobbies`);
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
  }, []);

  const handleLobbySelect = async (lobbyCode) => {
    setSelectedLobby(lobbyCode);
    try {
      const response = await fetch(`${API_BASE_URL}/lobbies`);
      const data = await response.json();
      const lobby = data[lobbyCode];
      const participants = lobby?.participants || [];
      const participantNames = lobby?.participantNames || [];
      const users = participants.map((userId, i) => ({
        userId,
        username: participantNames[i] || `Oyuncu ${i + 1}`
      }));
      setLobbyUsers(users);
    } catch (error) {
      setLobbyUsers([]);
    }
  };

  useEffect(() => {
    if (playType === 'lobby' && selectedLobby && lobbyUsers.length > 0) {
      const newCards = lobbyUsers.map((user, i) => ({
        player: user.username || `Oyuncu ${i + 1}`,
        card: generateRandomCard(),
        completedRows: 0,
        isTombala: false,
      }));
      setCards(newCards);
      setPlayerCount(lobbyUsers.length);
    }
    // eslint-disable-next-line
  }, [lobbyUsers, selectedLobby, playType]);

  useEffect(() => {
    if (playType === 'bot' && playerCount) {
      const newCards = [];
      for (let i = 0; i < playerCount; i++) {
        newCards.push({
          player: i === 0 ? 'Kullanıcı' : `Bot ${i}`,
          card: generateRandomCard(),
          completedRows: 0,
          isTombala: false,
        });
      }
      setCards(newCards);
    }
  }, [playType, playerCount]);

  const handlePlayerCountSelect = (count) => {
    setPlayerCount(count);
  };

  useEffect(() => {
    if (playType === 'lobby' && selectedLobby && lobbyUsers.length > 0) {
      const userId = localStorage.getItem('userId');
      const ws = new window.WebSocket(WS_URL);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'join-lobby', lobbyCode: selectedLobby, userId }));
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'game-state') {
          setDrawnNumbers(data.drawnNumbers || []);
          setCurrentNumber(data.currentNumber || null);
          setServerCard(data.card || null);
          if (data.allCards) setAllCards(data.allCards);
          if (data.notifications && data.notifications.length > 0) {
            setNotifications((prev) => [...prev, ...data.notifications]);
            if (
              notify &&
              playType === 'lobby' &&
              data.turnCount === 0 &&
              data.drawnNumbers.length === 0 &&
              !hasNotifiedGameStart.current
            ) {
              notify({
                message: `Klasik Tombala başladı! (Lobi: ${userLobbies.find(l=>l.code===selectedLobby)?.name || selectedLobby})`,
                playSound: document.hidden,
                changeTitle: document.hidden,
                showToast: !document.hidden,
              });
              hasNotifiedGameStart.current = true;
            }
          }
        }
        if (data.type === 'lobby-join' && notify && playType === 'lobby') {
          notify({
            message: `${data.username || 'Bir oyuncu'} lobiye katıldı!`,
            playSound: document.hidden,
            changeTitle: document.hidden,
            showToast: !document.hidden,
          });
        }
      };
      setSocket(ws);
      return () => ws.close();
    }
  }, [playType, selectedLobby, lobbyUsers, notify]);

  const drawNumber = () => {
    if (playType === 'lobby' && socket && socket.readyState === 1) {
      socket.send(JSON.stringify({ type: 'draw-number' }));
    } else {
      const availableNumbers = Array.from({ length: 99 }, (_, i) => i + 1).filter(
        (num) => !drawnNumbers.includes(num)
      );
      if (availableNumbers.length === 0) {
        alert('Tüm sayılar çekildi!');
        return;
      }
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const number = availableNumbers[randomIndex];
      setDrawnNumbers([...drawnNumbers, number]);
      setCurrentNumber(number);
      checkForWinners(number);
    }
  };

  const checkForWinners = (number) => {
    const updatedCards = cards.map((card) => {
      let completedRows = 0;
      let isTombala = card.isTombala;

      card.card.forEach((row) => {
        if (row.every((num) => drawnNumbers.includes(num) || num === number)) {
          completedRows++;
        }
      });

      if (!isTombala && completedRows > card.completedRows) {
        const newCompletedRows = completedRows - card.completedRows;
        if (newCompletedRows === 1) {
          setNotifications((prev) => [...prev, `${card.player} çinko yaptı!`]);
        }
      }

      if (!isTombala && completedRows === 3) {
        isTombala = true;
        setNotifications((prev) => [...prev, `${card.player} tombala yaptı!`]);
        setTombalaWinners((prev) => [...prev, card.player]);
      }

      return { ...card, completedRows, isTombala };
    });

    setCards(updatedCards);
  };

  useEffect(() => {
    if (playType === 'lobby' && serverCard && drawnNumbers.length > 0) {
      let newCompletedRows = 0;
      serverCard.forEach((row) => {
        if (row.every((num) => drawnNumbers.includes(num))) {
          newCompletedRows++;
        }
      });
      if (newCompletedRows > completedRows && newCompletedRows < 3) {
        setNotifications((prev) => [...prev, `${newCompletedRows}. Çinko!`]);
      }
      if (newCompletedRows === 3 && !isTombala) {
        setNotifications((prev) => [...prev, 'Tombala!']);
        setTombalaWinners((prev) => [...prev, 'Siz']);
        setGameFinished(true);
      }
      setCompletedRows(newCompletedRows);
      setIsTombala(newCompletedRows === 3);
    }
    // eslint-disable-next-line
  }, [drawnNumbers, serverCard, playType]);

  useEffect(() => {
    if (playType === 'lobby' && allCards.length > 0 && drawnNumbers.length > 0) {
      const winners = [];
      allCards.forEach(([userId, card]) => {
        let rows = 0;
        card.forEach((row) => {
          if (row.every((num) => drawnNumbers.includes(num))) rows++;
        });
        if (rows === 3) {
          const user = lobbyUsers.find(u => u.userId === userId);
          winners.push(user ? user.username : userId);
        }
      });
      setTombalaWinners(winners);
      if (winners.length > 0) setGameFinished(true);
    }
    // eslint-disable-next-line
  }, [allCards, drawnNumbers, playType]);

  const handleRestart = () => {
    if (playType === 'lobby' && socket && socket.readyState === 1) {
      socket.send(JSON.stringify({ type: 'restart-game' }));
      setNotifications([]);
      setTombalaWinners([]);
      setCompletedRows(0);
      setIsTombala(false);
      setGameFinished(false);
    }
  };

  if (playType === 'lobby' && !selectedLobby) {
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

  if (playType === 'bot' && !playerCount) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 2 }}>
          Kaç kişilik oynamak istersiniz?
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[2, 3, 4].map((count) => (
            <Button
              key={count}
              variant="contained"
              color="primary"
              onClick={() => handlePlayerCountSelect(count)}
              sx={{
                fontWeight: 'bold',
                fontFamily: 'Underdog, sans-serif',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              }}
            >
              {count} Kişilik
            </Button>
          ))}
        </Box>
      </Box>
    );
  }

  if (playType === 'lobby' && selectedLobby && serverCard) {
    const cardsToShow = allCards.length > 0 ? allCards : [[localStorage.getItem('userId'), serverCard]];
    return (
      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setShowAllCards((v) => !v)}
          sx={{
            marginBottom: 2,
            fontWeight: 'bold',
            fontFamily: 'Underdog, sans-serif',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          {showAllCards ? 'Gizle' : 'Göster'}
        </Button>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            fontFamily: 'Underdog, sans-serif',
            color: '#2e7d32',
            fontWeight: 'bold',
          }}
        >
          Kartlar:
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {cardsToShow
            .filter((_, index) => showAllCards || index === 0)
            .map(([userId, card], index) => {
              const user = lobbyUsers.find(u => u.userId === userId);
              return (
                <Grid item xs={12} sm={6} md={4} key={userId}>
                  <Box
                    sx={{
                      border: '2px solid #2e7d32',
                      borderRadius: 2,
                      padding: 2,
                      backgroundColor: '#ffffff',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="h6"
                      align="center"
                      sx={{
                        fontWeight: 'bold',
                        marginBottom: 2,
                        fontFamily: 'Underdog, sans-serif',
                        color: '#2e7d32',
                      }}
                    >
                      {user ? user.username : userId}
                    </Typography>
                    {card.map((row, rowIndex) => (
                      <Box
                        key={rowIndex}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-around',
                          marginBottom: 1,
                        }}
                      >
                        {row.map((num, numIndex) => (
                          <Typography
                            key={numIndex}
                            sx={{
                              backgroundColor: drawnNumbers.includes(num)
                                ? '#81c784'
                                : '#e0e0e0',
                              padding: '8px 12px',
                              borderRadius: '4px',
                              fontWeight: 'bold',
                              fontFamily: 'Underdog, sans-serif',
                              color: drawnNumbers.includes(num)
                                ? '#000'
                                : '#555',
                            }}
                          >
                            {num}
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              );
            })}
        </Grid>
        <Box sx={{ marginTop: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={drawNumber}
            sx={{
              marginBottom: 2,
              fontWeight: 'bold',
              fontFamily: 'Underdog, sans-serif',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            Sayı Çek
          </Button>
          {currentNumber && (
            <Grow in={true}>
              <Typography
                variant="h4"
                color="secondary"
                sx={{
                  fontWeight: 'bold',
                  marginTop: 2,
                  fontFamily: 'Underdog, sans-serif',
                  animation: 'pop 0.5s ease',
                }}
              >
                Çekilen Sayı: {currentNumber}
              </Typography>
            </Grow>
          )}
        </Box>
        {tombalaWinners.length > 0 && (
          <Box sx={{ marginTop: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                fontFamily: 'Underdog, sans-serif',
                color: '#2e7d32',
                fontWeight: 'bold',
              }}
            >
              Tombala Sıralaması:
            </Typography>
            {tombalaWinners.map((winner, index) => (
              <Typography
                key={index}
                sx={{
                  fontFamily: 'Underdog, sans-serif',
                  color: '#2e7d32',
                }}
              >
                {index + 1}. {winner}
              </Typography>
            ))}
          </Box>
        )}
        {gameFinished && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleRestart}
            sx={{ mt: 2 }}
          >
            Tekrar Oyna
          </Button>
        )}
        <Snackbar
          open={notifications.length > 0}
          autoHideDuration={3000}
          onClose={() => setNotifications((prev) => prev.slice(1))}
          message={notifications[0]}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setShowAllCards((v) => !v)}
        sx={{
          marginBottom: 2,
          fontWeight: 'bold',
          fontFamily: 'Underdog, sans-serif',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {showAllCards ? 'Gizle' : 'Göster'}
      </Button>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontFamily: 'Underdog, sans-serif',
          color: '#2e7d32',
          fontWeight: 'bold',
        }}
      >
        Kartlar:
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {cards
          .filter((_, index) => showAllCards || index === 0)
          .map((playerCard, index) => (
            <Grid
              item
              xs={12}
              sm={showAllCards ? 6 : 12}
              md={showAllCards ? 4 : 6}
              key={index}
            >
              <Box
                sx={{
                  border: '2px solid #2e7d32',
                  borderRadius: 2,
                  padding: 2,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    fontWeight: 'bold',
                    marginBottom: 2,
                    fontFamily: 'Underdog, sans-serif',
                    color: '#2e7d32',
                  }}
                >
                  {playerCard.player}
                </Typography>
                {playerCard.card.map((row, rowIndex) => (
                  <Box
                    key={rowIndex}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      marginBottom: 1,
                    }}
                  >
                    {row.map((num, numIndex) => (
                      <Typography
                        key={numIndex}
                        sx={{
                          backgroundColor: drawnNumbers.includes(num)
                            ? '#81c784'
                            : '#e0e0e0',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontFamily: 'Underdog, sans-serif',
                          color: drawnNumbers.includes(num)
                            ? '#000'
                            : '#555',
                        }}
                      >
                        {num}
                      </Typography>
                    ))}
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
      </Grid>
      <Box sx={{ marginTop: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={drawNumber}
          sx={{
            marginBottom: 2,
            fontWeight: 'bold',
            fontFamily: 'Underdog, sans-serif',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          }}
        >
          Sayı Çek
        </Button>
        {currentNumber && (
          <Grow in={true}>
            <Typography
              variant="h4"
              color="secondary"
              sx={{
                fontWeight: 'bold',
                marginTop: 2,
                fontFamily: 'Underdog, sans-serif',
                animation: 'pop 0.5s ease',
              }}
            >
              Çekilen Sayı: {currentNumber}
            </Typography>
          </Grow>
        )}
      </Box>
      {tombalaWinners.length > 0 && (
        <Box sx={{ marginTop: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontFamily: 'Underdog, sans-serif',
              color: '#2e7d32',
              fontWeight: 'bold',
            }}
          >
            Tombala Sıralaması:
          </Typography>
          {tombalaWinners.map((winner, index) => (
            <Typography
              key={index}
              sx={{
                fontFamily: 'Underdog, sans-serif',
                color: '#2e7d32',
              }}
            >
              {index + 1}. {winner}
            </Typography>
          ))}
        </Box>
      )}
      <Snackbar
        open={notifications.length > 0}
        autoHideDuration={3000}
        onClose={() => setNotifications((prev) => prev.slice(1))}
        message={notifications[0]}
      />
    </Box>
  );
}