import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Typography, Container, Box, AppBar, Toolbar, Grid, Card, CardContent, Switch, FormControlLabel } from '@mui/material';
import { keyframes, css } from '@emotion/react';
import GroupsIcon from '@mui/icons-material/Groups';
import AppTheme from '../shared-theme/AppTheme';

const fadeInAppBar = keyframes`
  0% { opacity: 0; transform: translateY(-32px); }
  100% { opacity: 1; transform: translateY(0); }
`;

export default function GameDetails() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');

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
      <div
        style={{
          minHeight: '100vh',
          background: themeMode === 'dark'
            ? 'linear-gradient(135deg, #232946 0%, #16161a 100%)'
            : 'linear-gradient(135deg, #e0eaff 0%, #b6d0f7 100%)',
          transition: 'background 0.5s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <AppBar
          position="static"
          sx={{
            background: themeMode === 'dark'
              ? 'linear-gradient(135deg, #232946 0%, #16161a 100%)'
              : 'linear-gradient(135deg, #e0eaff 0%, #b6d0f7 100%)',
            boxShadow: '0 8px 32px 0 rgba(124,34,92,0.10)',
            color: themeMode === 'dark' ? 'white' : '#7c225c',
            borderRadius: '0 0 24px 24px',
            backdropFilter: 'blur(12px)',
            borderBottom: '4px solid',
            borderImage: themeMode === 'dark'
              ? 'linear-gradient(90deg, #7c225c 0%, #43e97b 100%) 1'
              : 'linear-gradient(90deg, #fa709a 0%, #fee140 100%) 1',
            position: 'relative',
            overflow: 'visible',
          }}
          css={css`
            animation: ${fadeInAppBar} 1.2s cubic-bezier(.4,2,.6,1);
          `}
        >
          <Toolbar sx={{ minHeight: 72, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', left: 16, top: 0, bottom: 0, height: '100%', gap: 1 }}>
              <a href="https://www.instagram.com/minn.eminee/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                <Box
                  component="img"
                  src="/images/instagram.png"
                  alt="Instagram"
                  sx={{
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    filter: themeMode === 'dark' ? 'brightness(1.2)' : 'none',
                    transition: 'transform 0.22s cubic-bezier(.4,2,.6,1)',
                    '&:hover': {
                      transform: 'scale(1.18) rotate(-7deg)',
                      boxShadow: '0 8px 32px 0 rgba(250,112,154,0.18)',
                    },
                  }}
                />
              </a>
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                <Box
                  component="img"
                  src="/images/twitter.png"
                  alt="Twitter"
                  sx={{
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    filter: themeMode === 'dark' ? 'brightness(1.2)' : 'none',
                    transition: 'transform 0.22s cubic-bezier(.4,2,.6,1)',
                    '&:hover': {
                      transform: 'scale(1.18) rotate(7deg)',
                      boxShadow: '0 8px 32px 0 rgba(56,249,215,0.18)',
                    },
                  }}
                />
              </a>
              <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
                <Box
                  component="img"
                  src="/images/discord.png"
                  alt="Discord"
                  sx={{
                    width: 32,
                    height: 32,
                    cursor: 'pointer',
                    filter: themeMode === 'dark' ? 'brightness(1.2)' : 'none',
                    transition: 'transform 0.22s cubic-bezier(.4,2,.6,1)',
                    '&:hover': {
                      transform: 'scale(1.18) rotate(-5deg)',
                      boxShadow: '0 8px 32px 0 rgba(114,137,218,0.18)',
                    },
                  }}
                />
              </a>
            </Box>
            <Typography
              variant="h6"
              sx={{
                flexGrow: 0,
                fontFamily: 'Exile, Underdog, sans-serif',
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: 2,
                color: themeMode === 'dark' ? '#ffe082' : '#7c225c',
                textShadow: themeMode === 'dark'
                  ? '0 2px 12px #232526'
                  : '0 2px 8px #fee140',
                animation: 'bounceTitle 1.6s cubic-bezier(.4,2,.6,1)',
                userSelect: 'none',
                cursor: 'pointer',
                transition: 'color 0.3s',
                mx: 'auto',
                position: 'relative',
                zIndex: 1,
                '&:hover': {
                  color: themeMode === 'dark' ? '#43e97b' : '#fa709a',
                  textShadow: themeMode === 'dark'
                    ? '0 2px 16px #43e97b'
                    : '0 2px 16px #fa709a',
                  animation: 'bounceTitle 0.7s cubic-bezier(.4,2,.6,1)',
                },
              }}
            >
              buglıköy
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'absolute', right: 16, top: 0, bottom: 0, height: '100%' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeMode === 'dark'}
                    onChange={toggleTheme}
                    color="primary"
                  />
                }
                label={themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                sx={{ ml: 2 }}
              />
            </Box>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 6, mb: 6, maxWidth: 900, borderRadius: 6, background: themeMode === 'dark' ? 'rgba(22,22,26,0.92)' : 'rgba(255,255,255,0.92)', boxShadow: themeMode === 'dark' ? '0 2px 24px 0 rgba(67,233,123,0.04)' : '0 2px 24px 0 rgba(250,112,154,0.04)', p: { xs: 2, md: 6 } }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: themeMode === 'dark' ? '#ffe082' : '#7c225c', letterSpacing: 1, textAlign: 'center' }}>
            {game.name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: themeMode === 'dark' ? '#b6ffc0' : '#232946', maxWidth: 700, mx: 'auto', textAlign: 'center', fontSize: 18 }}>
            {game.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 4, mb: 4 }}>
            <Button variant="outlined" onClick={() => navigate('/home')} sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 600, fontSize: 18, color: themeMode === 'dark' ? '#ffe082' : '#7c225c', borderColor: themeMode === 'dark' ? '#ffe082' : '#7c225c', '&:hover': { borderColor: themeMode === 'dark' ? '#43e97b' : '#fa709a', color: themeMode === 'dark' ? '#43e97b' : '#fa709a' } }}>
              Geri Dön
            </Button>
            <Button variant="contained" color="primary" onClick={() => navigate('/tombala-game/oyun')} sx={{ borderRadius: 3, px: 4, py: 1.2, fontWeight: 700, fontSize: 18, background: 'linear-gradient(90deg, #7c4dff 0%, #00bcd4 100%)', color: '#fff', boxShadow: '0 2px 8px 0 rgba(124,77,255,0.13)', textTransform: 'none', letterSpacing: 1.1, transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s', '&:hover': { transform: 'scale(1.05) rotate(2deg)', boxShadow: '0 4px 16px 0 rgba(0,188,212,0.18)', background: 'linear-gradient(90deg, #00bcd4 0%, #7c4dff 100%)' } }} startIcon={<GroupsIcon sx={{ fontSize: 22 }} />}>
              Oyuna Git
            </Button>
          </Box>
          <Typography variant="h5" sx={{ mt: 6, mb: 2, textAlign: 'center', color: themeMode === 'dark' ? '#43e97b' : '#fa709a', fontWeight: 700 }}>
            Oyuncu İstatistikleri
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2, justifyContent: 'center' }}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(124,34,92,0.10)', background: themeMode === 'dark' ? 'linear-gradient(135deg, #232946 0%, #16161a 100%)' : 'linear-gradient(135deg, #e0eaff 0%, #b6d0f7 100%)', color: themeMode === 'dark' ? '#ffe082' : '#7c225c', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6">Oynanan Oyunlar</Typography>
                  <Typography variant="h4">{playerStats.gamesPlayed}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(124,34,92,0.10)', background: themeMode === 'dark' ? 'linear-gradient(135deg, #232946 0%, #16161a 100%)' : 'linear-gradient(135deg, #e0eaff 0%, #b6d0f7 100%)', color: themeMode === 'dark' ? '#43e97b' : '#fa709a', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6">Kazanılan Oyunlar</Typography>
                  <Typography variant="h4">{playerStats.gamesWon}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ borderRadius: 4, boxShadow: '0 2px 12px rgba(124,34,92,0.10)', background: themeMode === 'dark' ? 'linear-gradient(135deg, #232946 0%, #16161a 100%)' : 'linear-gradient(135deg, #e0eaff 0%, #b6d0f7 100%)', color: themeMode === 'dark' ? '#ffe082' : '#7c225c', textAlign: 'center' }}>
                <CardContent>
                  <Typography variant="h6">En Yüksek Skor</Typography>
                  <Typography variant="h4">{playerStats.highestScore}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </div>
    </AppTheme>
  );
}
