import React, { useState } from 'react';
import { Box, Typography, Button, Grid, Dialog, DialogTitle, DialogContent } from '@mui/material';

function getRandomNumbers(count, max) {
  const arr = [];
  while (arr.length < count) {
    const n = Math.floor(Math.random() * max) + 1;
    if (!arr.includes(n)) arr.push(n);
  }
  return arr;
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function Confetti() {
  const confettiCount = 80;
  const [confettiList] = useState(() =>
    Array.from({ length: confettiCount }).map(() => ({
      left: Math.random() * 100,
      delay: Math.random() * 1200,
      color: `hsl(${Math.random() * 360},90%,60%)`,
      rotate: Math.random() * 360,
      size: 10 + Math.random() * 8,
      duration: 1800 + Math.random() * 900,
    }))
  );
  const [start, setStart] = useState(false);

  React.useEffect(() => {
    setTimeout(() => setStart(true), 50);
  }, []);

  return (
    <Box
      sx={{
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {confettiList.map((c, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: `${c.left}%`,
            top: 0,
            width: c.size,
            height: c.size * 1.5,
            borderRadius: '50%',
            background: c.color,
            opacity: 0.85,
            transform: start
              ? `translateY(110vh) rotate(${c.rotate + 360}deg)`
              : `translateY(-${Math.random() * 20 + 5}vh) rotate(${c.rotate}deg)`,
            transition: `transform ${c.duration}ms cubic-bezier(.4,2,.6,1) ${c.delay}ms`,
          }}
        />
      ))}

    </Box>
  );
}

export default function IlkKapanin({ playType }) {
  const [playerCount, setPlayerCount] = useState(null);
  const [playerCards, setPlayerCards] = useState([]);
  const [markedNumbers, setMarkedNumbers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selection, setSelection] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [shuffledNumbers, setShuffledNumbers] = useState([]);
  const [starNumbers, setStarNumbers] = useState([]);
  const [scores, setScores] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [jokerDialogOpen, setJokerDialogOpen] = useState(false);
  const [jokerEligibleIdx, setJokerEligibleIdx] = useState(null);
  const [turnCount, setTurnCount] = useState(0);
  const [muteTargetDialogOpen, setMuteTargetDialogOpen] = useState(false);
  const [pendingMuteIdx, setPendingMuteIdx] = useState(null);
  const [x3List, setX3List] = useState([]);

  const startGame = () => {
    const cards = [];
    const stars = [];
    for (let i = 0; i < playerCount; i++) {
      const card = getRandomNumbers(15, 99);
      cards.push(card);
      const starIdxs = [];
      while (starIdxs.length < 2) {
        const idx = Math.floor(Math.random() * 15);
        if (!starIdxs.includes(idx)) starIdxs.push(idx);
      }
      stars.push([card[starIdxs[0]], card[starIdxs[1]]]);
    }
    setPlayerCards(cards);
    setStarNumbers(stars);
    setMarkedNumbers(cards.map(() => []));
    setDrawnNumbers([]);
    setCurrentPlayer(0);
    setGameStarted(true);
    setSelection([]);
    setRevealed(Array(99).fill(false));
    setShuffledNumbers(shuffleArray(Array.from({ length: 99 }, (_, i) => i + 1)));
    setScores(Array(playerCount).fill(0));
    setGameOver(false);
  };

  const handleJokerSelect = (type) => {
    setJokerType(type);
    setJokerDialogOpen(false);
    if (type === 'mute') {
      setPendingMuteIdx(jokerEligibleIdx);
      setMuteTargetDialogOpen(true);
    }
    if (type === 'x3') {
      setX3List((prev) => [...prev, { idx: jokerEligibleIdx }]);
    }
    if (type === 'hint') {
      setHintDialogOpen(true);
    }
  };

  const handleMuteTargetSelect = (targetIdx) => {
    setMuteTargetDialogOpen(false);
    setPendingMuteIdx(null);
  };

  const handleCardClick = (num) => {
    if (selection.includes(num) || revealed[num - 1] || selection.length >= 3 || gameOver) return;
    const newRevealed = [...revealed];
    newRevealed[num - 1] = true;
    setRevealed(newRevealed);
    const newSelection = [...selection, num];
    setSelection(newSelection);

    const x3Active = x3List.some(x => x.idx === currentPlayer);

    let scoreAdd = 0;
    const stars = starNumbers[currentPlayer] || [];
    const playerCard = playerCards[currentPlayer] || [];
    if (num === 54) {
      setScores((prev) =>
        prev.map((s, idx) => {
          if (idx === currentPlayer && playerCard.includes(54)) {
            return s + 100 * (x3Active ? 3 : 1);
          }
          if (idx !== currentPlayer && playerCards[idx]?.includes(54)) {
            return s - 100 * (x3Active && idx === currentPlayer ? 3 : 1);
          }
          return s;
        })
      );
    } else if (stars.includes(num)) {
      scoreAdd = 100;
      setScores((prev) =>
        prev.map((s, idx) => (idx === currentPlayer ? s + scoreAdd * (x3Active ? 3 : 1) : s))
      );
    } else if (playerCard.includes(num)) {
      scoreAdd = 50;
      setScores((prev) =>
        prev.map((s, idx) => (idx === currentPlayer ? s + scoreAdd * (x3Active ? 3 : 1) : s))
      );
    } else {
      setScores((prev) => [...prev]);
    }

    if (newSelection.length === 3) {
      setTimeout(() => {
        setDrawnNumbers((prev) => [...prev, ...newSelection]);
        setMarkedNumbers((prev) =>
          prev.map((nums, idx) => {
            if (idx !== currentPlayer) return nums;
            const matched = newSelection.filter((n) => playerCards[idx].includes(n));
            return [...nums, ...matched];
          })
        );
        if (x3Active) {
          setX3List((prev) => prev.filter(x => x.idx !== currentPlayer));
        }
        setCurrentPlayer((prev) => (prev + 1) % playerCount);
        setSelection([]);
        setTurnCount((prev) => prev + 1);

        if (newRevealed.filter(Boolean).length === 99) {
          setGameOver(true);
        }
      }, 800);
    }
  };

  let winnerText = '';
  let winnerIdx = null;
  if (gameOver) {
    const maxScore = Math.max(...scores);
    const winners = scores
      .map((score, idx) => ({ idx, score }))
      .filter((obj) => obj.score === maxScore)
      .map((obj) => (obj.idx === 0 ? 'Kullanıcı' : `Bot ${obj.idx}`));
    winnerIdx = scores.findIndex((s) => s === maxScore);
    winnerText =
      winners.length === 1
        ? `Kazanan: ${winners[0]} (${maxScore} puan)`
        : `Beraberlik! (${maxScore} puan): ${winners.join(', ')}`;
  }

  React.useEffect(() => {
    if (!gameStarted || playerCount == null) return;
    if (turnCount > 0 && turnCount % (playerCount * 3) === 0) {
      const minScore = Math.min(...scores);
      const minIndexes = scores
        .map((s, idx) => ({ s, idx }))
        .filter(obj => obj.s === minScore)
        .map(obj => obj.idx);
      if (minIndexes.length === 1) {
        let eligibleIdx = minIndexes[0];
        setJokerEligibleIdx(eligibleIdx);
        setJokerDialogOpen(true);
      }
    }
  }, [turnCount, gameStarted, playerCount]);

  const [hintDialogOpen, setHintDialogOpen] = useState(false);
  const [hintNumber, setHintNumber] = useState(null);

  const handleHintConfirm = () => {
    const numberToReveal = parseInt(hintNumber, 10);

    if (!isNaN(numberToReveal) && numberToReveal >= 1 && numberToReveal <= 99) {
        const newRevealed = [...revealed];
        newRevealed[numberToReveal - 1] = true;
        setRevealed(newRevealed);

        setSelection([]);

        if (newRevealed.filter(Boolean).length === 99) {
            setGameOver(true);
        }
    } else {
        alert('Lütfen 1 ile 99 arasında geçerli bir sayı girin.');
    }

    setHintDialogOpen(false);
    setHintNumber(null);
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
        px: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}
    >
      <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 1, mt: 2, fontWeight: 'bold', color: '#2e7d32' }}>
        Tur: {Math.floor(turnCount / playerCount) + 1}
      </Typography>
      <Dialog
        open={jokerDialogOpen}
        onClose={() => {}}
        disableEscapeKeyDown
        hideBackdrop={false}
      >
        <DialogTitle>
          {jokerEligibleIdx !== null
            ? `Joker Seçimi: ${jokerEligibleIdx === 0 ? 'Kullanıcı' : `Bot ${jokerEligibleIdx}`}`
            : 'Joker Seç!'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, mt: 1, justifyContent: 'center' }}>
            <Button
              variant="contained"
              sx={{
                m: 1,
                fontSize: 32,
                width: 64,
                height: 64,
                minWidth: 0,
                minHeight: 0,
                borderRadius: '50%',
                backgroundColor: '#2e7d32',
                color: '#fff',
                '&:hover': { backgroundColor: '#388e3c' }
              }}
              onClick={() => {
                setJokerDialogOpen(false);
                setPendingMuteIdx(jokerEligibleIdx);
                setMuteTargetDialogOpen(true);
              }}
              title="Sustur: Bir rakibini 1 tur susturabilirsin."
            >
              🤫
            </Button>
            <Button
              variant="contained"
              sx={{
                m: 1,
                fontSize: 32,
                width: 64,
                height: 64,
                minWidth: 0,
                minHeight: 0,
                borderRadius: '50%',
                backgroundColor: '#2e7d32',
                color: '#fff',
                '&:hover': { backgroundColor: '#388e3c' }
              }}
              onClick={() => {
                setJokerDialogOpen(false);
                setX3List((prev) => [...prev, { idx: jokerEligibleIdx }]);
              }}
              title="3X: Bir sonraki turda puanın 3 katı yazılır."
            >
              🚀
            </Button>
            <Button
              variant="contained"
              sx={{
                m: 1,
                fontSize: 32,
                width: 64,
                height: 64,
                minWidth: 0,
                minHeight: 0,
                borderRadius: '50%',
                backgroundColor: '#2e7d32',
                color: '#fff',
                '&:hover': { backgroundColor: '#388e3c' }
              }}
              onClick={() => {
                setHintDialogOpen(true);
                setJokerDialogOpen(false);
              }}
              title="İpucu: Bir sayının hangi kartta olduğunu öğren."
            >
              💡
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={muteTargetDialogOpen} onClose={() => setMuteTargetDialogOpen(false)}>
        <DialogTitle>Hangi rakibini susturmak istersin?</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {Array.from({ length: playerCount })
              .map((_, idx) => idx)
              .filter(idx => idx !== pendingMuteIdx)
              .map(idx => (
                <Button
                  key={idx}
                  variant="contained"
                  color="error"
                  sx={{ m: 1 }}
                  onClick={() => {
                    setMuteTargetDialogOpen(false);
                    setPendingMuteIdx(null);
                  }}
                >
                  {idx === 0 ? 'Kullanıcı' : `Bot ${idx}`}
                </Button>
              ))}
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={hintDialogOpen} onClose={() => setHintDialogOpen(false)}>
        <DialogTitle>Hangi sayının yerini görmek istiyorsunuz?</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <input
              type="number"
              min="1"
              max="99"
              value={hintNumber || ''}
              onChange={(e) => setHintNumber(e.target.value)}
              style={{ padding: '8px', fontSize: '16px' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleHintConfirm}
            >
              Onayla
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 2, mt: 4 }}>
        Sıra: {currentPlayer === 0 ? 'Kullanıcı' : `Bot ${currentPlayer}`}
      </Typography>

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
                disabled={
                  revealed[num - 1] || selection.length >= 3 || gameOver
                }
                onClick={() => handleCardClick(num)}
                sx={{
                  minWidth: 36,
                  minHeight: 36,
                  fontSize: 14,
                  fontFamily: 'Underdog, sans-serif',
                  backgroundColor: revealed[num - 1]
                    ? playerCards[currentPlayer]?.includes(num)
                      ? '#81c784'
                      : '#bdbdbd'
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

      <Grid container spacing={2} justifyContent="center">
        {playerCards.map((card, idx) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={idx}
            sx={{
              zIndex: gameOver && winnerIdx === idx ? 100 : 1,
              transition: gameOver ? 'transform 0.7s cubic-bezier(.4,2,.6,1), box-shadow 0.7s' : undefined,
              transform:
                gameOver && winnerIdx === idx
                  ? 'scale(1.15) translateY(-30px)'
                  : 'scale(1)',
              boxShadow:
                gameOver && winnerIdx === idx
                  ? '0 0 40px 10px #ffd600, 0 8px 32px #2e7d32'
                  : '0 4px 12px rgba(0,0,0,0.1)',
              filter:
                gameOver && winnerIdx !== idx
                  ? 'blur(2px) grayscale(0.7) opacity(0.5)'
                  : 'none',
              pointerEvents: gameOver ? (winnerIdx === idx ? 'auto' : 'none') : 'auto',
            }}
          >
            <Box
              sx={{
                border: idx === currentPlayer ? '3px solid #2e7d32' : '2px solid #2e7d32',
                borderRadius: 2,
                padding: 2,
                backgroundColor: '#fff',
                textAlign: 'center',
                opacity: idx === currentPlayer ? 1 : 0.7,
                position: 'relative',
                transition: 'box-shadow 0.7s, border 0.7s',
                borderColor: gameOver && winnerIdx === idx ? '#ffd600' : undefined,
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
              <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 1 }}>
                Puan: {scores[idx] || 0}
              </Typography>
              <Typography sx={{ fontFamily: 'Underdog, sans-serif', mb: 1, color: '#ff9800' }}>
                Yıldızlı: {starNumbers[idx]?.join(', ')}
              </Typography>
              {Array.from({ length: 3 }).map((_, rowIdx) => (
                <Box key={rowIdx} sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
                  {card.slice(rowIdx * 5, rowIdx * 5 + 5).map((num, numIndex) => {
                    const isStar = starNumbers[idx]?.includes(num);
                    const isMarked = markedNumbers[idx].includes(num);
                    const isSpecial54 = num === 54 && !isMarked;
                    const isOwnCard = playerCards[idx]?.includes(num);
                    const isDrawnButNotMarked = isOwnCard && (drawnNumbers.includes(num) || revealed[num - 1]) && !markedNumbers[idx].includes(num);

                    return (
                      <Typography
                        key={numIndex}
                        sx={{
                          backgroundColor: isMarked
                            ? isStar
                              ? '#ffd600'
                              : '#81c784'
                            : isSpecial54
                              ? '#222'
                              : isDrawnButNotMarked
                                ? '#bdbdbd'
                                : '#e0e0e0',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontFamily: 'Underdog, sans-serif',
                          color: isMarked
                            ? '#000'
                            : isSpecial54
                              ? '#fff'
                              : isDrawnButNotMarked
                                ? '#888'
                                : '#555',
                          m: 0.5,
                          minWidth: 36,
                          textAlign: 'center',
                          display: 'inline-block',
                          border: isStar ? '2px solid #ff9800' : undefined,
                        }}
                      >
                        {num}
                        {isStar && '★'}
                      </Typography>
                    );
                  })}
                </Box>
              ))}
              {gameOver && winnerIdx === idx && <Confetti />}
            </Box>
          </Grid>
        ))}

      </Grid>
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography sx={{ fontFamily: 'Underdog, sans-serif', fontWeight: 'bold', fontSize: 22, mb: 1 }}>
          Tur: {Math.floor(turnCount / playerCount) + 1}
        </Typography>
        {gameOver && (
          <Typography sx={{ fontFamily: 'Underdog, sans-serif', color: '#d32f2f', fontWeight: 'bold', mt: 2 }}>
            {winnerText}
          </Typography>
        )}
      </Box>
    </Box>
  );
}