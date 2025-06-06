import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grow, Grid, Snackbar } from '@mui/material';

// Dummy API fonksiyonları (backend ile entegre edeceksen değiştir)
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

export default function KlasikTombala({ playType }) {
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

  // Lobi seçilince lobideki kullanıcıları çek
  const handleLobbySelect = async (lobbyCode) => {
    setSelectedLobby(lobbyCode);
    const users = await fetchLobbyUsers(lobbyCode);
    setLobbyUsers(users);
  };

  // Lobi kullanıcıları değişince kartları oluştur
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

  // Bot ile oynanıyorsa kart oluştur
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

  // Klasik Tombala çekilişi
  const drawNumber = () => {
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

  // Lobi ile oynanıyorsa lobi seçimi
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

  // Bot ile oynanıyorsa oyuncu sayısı seçimi
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

  // Kartlar ve oyun ekranı
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