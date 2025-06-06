import React from 'react';
import { Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';

export default function GamePage() {
  const navigate = useNavigate();

  return (
    <AppTheme>
      <Container>
        <Typography variant="h4" sx={{ mt: 4 }}>
          Oyun Sayfası
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Bu sayfa seçilen oyunun oynanacağı alandır.
        </Typography>
        <Button variant="contained" sx={{ mt: 4 }} onClick={() => navigate('/home')}>
          Ana Sayfaya Dön
        </Button>
      </Container>
    </AppTheme>
  );
}
