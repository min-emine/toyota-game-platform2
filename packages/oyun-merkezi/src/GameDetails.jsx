import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Container } from '@mui/material';

export default function GameDetails() {
  const { gameId } = useParams(); 
  const navigate = useNavigate();

  const gameDetails = {
    1: { name: 'Oyun 1', description: 'Bu, Oyun 1 için detaylı açıklamadır.' },
    2: { name: 'Oyun 2', description: 'Bu, Oyun 2 için detaylı açıklamadır.' },
    3: { name: 'Oyun 3', description: 'Bu, Oyun 3 için detaylı açıklamadır.' },
  };

  const game = gameDetails[gameId];

  if (!game) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4 }}>
          Oyun Bulunamadı
        </Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/home')}>
          Ana Sayfaya Dön
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        {game.name}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {game.description}
      </Typography>
      <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate('/home')}>
        Ana Sayfaya Dön
      </Button>
    </Container>
  );
}
