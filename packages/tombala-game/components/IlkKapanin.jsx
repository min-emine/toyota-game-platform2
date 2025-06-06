import React, { useState } from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';

function getRandomNumbers(count, max) {
  const arr = [];
  while (arr.length < count) {
    const n = Math.floor(Math.random() * max) + 1;
    if (!arr.includes(n)) arr.push(n);
  }
  return arr;
}

// 1-99'u karıştırmak için fonksiyon
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function IlkKapanin({ playType }) {
  const [playerCount, setPlayerCount] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selection, setSelection] = useState([]); // Seçilen 3 kart (her tur)
  const [revealed, setRevealed] = useState([]); // 99 kartın açık/kapalı durumu
  const [shuffledNumbers, setShuffledNumbers] = useState([]);

  // Oyun başlatıldığında her oyuncuya klasik gibi 15 sayıdan oluşan kart ata
  const startGame = () => {
    const cards = [];
    for (let i = 0; i < playerCount; i++) {
      cards.push(getRandomNumbers(15, 99));
    }
    setPlayerCards(cards);
    setMarkedNumbers(cards.map(() => []));
    setDrawnNumbers([]);
    setCurrentPlayer(0);
    setGameStarted(true);
    setSelection([]);
    setRevealed(Array(99).fill(false));
    setShuffledNumbers(shuffleArray(Array.from({ length: 99 }, (_, i) => i + 1)));
  };

  // Kart seçimi (her turda 3 kart)
  const handleCardClick = (num) => {
    if (selection.includes(num) || revealed[num - 1] || selection.length >= 3) return;
    // Kartı aç (kalıcı olarak)
    const newRevealed = [...revealed];
    newRevealed[num - 1] = true;
    setRevealed(newRevealed);
    // Seçimi ekle
    const newSelection = [...selection, num];
    setSelection(newSelection);

    // 3 seçim tamamlandıysa işlemleri yap
    if (newSelection.length === 3) {
      setTimeout(() => {
        // Seçilen kartları drawnNumbers'a ekle
        setDrawnNumbers((prev) => [...prev, ...newSelection]);
        // Sadece o oyuncunun kartında varsa işaretle
        setMarkedNumbers((prev) =>
          prev.map((nums, idx) => {
            if (idx !== currentPlayer) return nums;
            const playerCard = playerCards[idx];
            const matched = newSelection.filter((n) => playerCard.includes(n));
            return [...nums, ...matched];
          })
        );
        // Sonraki oyuncuya geç ve seçimleri sıfırla (kartlar açık kalacak)
        setCurrentPlayer((prev) => (prev + 1) % playerCount);
        setSelection([]);
        // setRevealed kaldırıldı, kartlar açık kalacak!
      }, 800);
    }
  };

  if (!playerCount) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 2 }}>
          Kaç kişiyle oynansın? (Botlar dahil)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[2, 3, 4].map((count) => (
            <Button
              key={count}
              variant="contained"
              onClick={() => setPlayerCount(count)}
              sx={{ fontFamily: 'Underdog, sans-serif' }}
            >
              {count} Kişi
            </Button>
          ))}
        </Box>
      </Box>
    );
  }

  if (!gameStarted) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="success"
          onClick={startGame}
          sx={{ fontFamily: 'Underdog, sans-serif', fontWeight: 'bold' }}
        >
          Oyunu Başlat
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: 15,
        //height: 'calc(100vh - 32px - 48px)',
       // overflowY: 'auto',
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 2, mt: 4 }}>
        Sıra: {currentPlayer === 0 ? 'Kullanıcı' : `Bot ${currentPlayer}`}
      </Typography>

      {/* 99 Kart Grid - Her turda seçim için */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 1 }}>
          1-99 arası {3 - selection.length} sayı seçiniz:
        </Typography>
        <Grid container spacing={1} justifyContent="center">
          {shuffledNumbers.map((num) => (
            <Grid item xs={2} sm={1} md={1} key={num}>
              <Button
                variant={revealed[num - 1] ? 'contained' : 'outlined'}
                color={
                  revealed[num - 1]
                    ? playerCards[currentPlayer]?.includes(num)
                      ? 'success'
                      : 'error'
                    : 'primary'
                }
                disabled={revealed[num - 1] || selection.length >= 3}
                onClick={() => handleCardClick(num)}
                sx={{
                  minWidth: 36,
                  minHeight: 36,
                  fontSize: 14,
                  fontFamily: 'Underdog, sans-serif',
                  backgroundColor: revealed[num - 1]
                    ? playerCards[currentPlayer]?.includes(num)
                      ? '#81c784'
                      : '#ffcdd2'
                    : undefined,
                  color: revealed[num - 1] ? '#000' : undefined,
                  boxShadow: revealed[num - 1] ? '0 2px 6px rgba(0,0,0,0.10)' : undefined,
                  transition: 'all 0.2s',
                }}
              >
                {revealed[num - 1] ? num : '?'}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Oyuncu kartları */}
      <Grid container spacing={2} justifyContent="center">
        {playerCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Box
              sx={{
                border: idx === currentPlayer ? '3px solid #2e7d32' : '2px solid #2e7d32',
                borderRadius: 2,
                padding: 2,
                backgroundColor: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                textAlign: 'center',
                opacity: idx === currentPlayer ? 1 : 0.7,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  fontFamily: 'Underdog, sans-serif',
                  color: '#2e7d32',
                  mb: 2,
                }}
              >
                {idx === 0 ? 'Kullanıcı' : `Bot ${idx}`}
              </Typography>
              {/* 3x5 grid */}
              {Array.from({ length: 3 }).map((_, rowIdx) => (
                <Box key={rowIdx} sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                  {card.slice(rowIdx * 5, rowIdx * 5 + 5).map((num, numIndex) => (
                    <Typography
                      key={numIndex}
                      sx={{
                        backgroundColor: markedNumbers[idx].includes(num)
                          ? '#81c784'
                          : '#e0e0e0',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontFamily: 'Underdog, sans-serif',
                        color: markedNumbers[idx].includes(num)
                          ? '#000'
                          : '#555',
                        m: 0.5,
                        minWidth: 36,
                        textAlign: 'center',
                        display: 'inline-block',
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
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ fontFamily: 'Underdog, sans-serif' }}>
          Çekilen Sayılar: {drawnNumbers.join(', ')}
        </Typography>
      </Box>
    </Box>
  );
}