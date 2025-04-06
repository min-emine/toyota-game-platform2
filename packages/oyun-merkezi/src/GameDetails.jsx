import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Container, Box, AppBar, Toolbar, Avatar, Menu, MenuItem, Switch, FormControlLabel, Grid, Card, CardContent } from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';

export default function GameDetails() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [anchorElProfile, setAnchorElProfile] = useState(null);

  const gameDetails = {
    1: {
      name: 'Tombala',
      description: `Tombala, genellikle 1 ile 90 arasında numaralandırılmış kartlarla oynanan bir şans oyunudur. 
      Oyuncular, kendilerine verilen kartlardaki numaraları, çekilen toplarla eşleştirmeye çalışır. 
      İlk olarak bir sırayı, ardından iki sırayı ve son olarak tüm kartı dolduran oyuncu kazanır. 
      Online versiyonda, oyuncular gerçek zamanlı olarak birbirleriyle yarışabilir.`,
    },
    2: { name: 'Oyun 2', description: 'Bu, Oyun 2 için detaylı açıklamadır.' },
    3: { name: 'Oyun 3', description: 'Bu, Oyun 3 için detaylı açıklamadır.' },
  };

  const playerStats = {
    gamesPlayed: 25,
    gamesWon: 10,
    highestScore: 150,
  };

  const game = gameDetails[gameId];

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const handleProfileClick = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorElProfile(null);
  };

  if (!game) {
    return (
      <AppTheme mode={themeMode}>
        <Container>
          <Typography variant="h4" sx={{ mt: 4 }}>
            Oyun Bulunamadı
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/home')}>
            Ana Sayfaya Dön
          </Button>
        </Container>
      </AppTheme>
    );
  }

  return (
    <AppTheme mode={themeMode}>
      <div>
        <AppBar
          position="static"
          sx={{
            backgroundColor: 'transparent',
            boxShadow: 'none',
            color: themeMode === 'dark' ? 'white' : 'black',
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Oyun Detayları
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label={themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            />
            <Avatar
              sx={{ cursor: 'pointer', ml: 2 }}
              onClick={handleProfileClick}
            >
              U
            </Avatar>
            <Menu
              anchorEl={anchorElProfile}
              open={Boolean(anchorElProfile)}
              onClose={handleProfileClose}
            >
              <MenuItem onClick={handleProfileClose}>Profil</MenuItem>
              <MenuItem onClick={handleProfileClose}>Avatar Değiştir</MenuItem>
              <MenuItem onClick={() => navigate('/')}>Çıkış Yap</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Container>
          <Typography variant="h4" sx={{ mt: 4 }}>
            {game.name}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {game.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate('/home')}>
              Geri Dön
            </Button>
            <Button variant="contained" color="primary" onClick={() => alert('Oyuna gidiliyor...')}>
              Oyuna Git
            </Button>
          </Box>
          <Typography variant="h5" sx={{ mt: 6 }}>
            Oyuncu İstatistikleri
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Oynanan Oyunlar</Typography>
                  <Typography variant="body1">{playerStats.gamesPlayed}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Kazanılan Oyunlar</Typography>
                  <Typography variant="body1">{playerStats.gamesWon}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6">En Yüksek Skor</Typography>
                  <Typography variant="body1">{playerStats.highestScore}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </div>
    </AppTheme>
  );
}
