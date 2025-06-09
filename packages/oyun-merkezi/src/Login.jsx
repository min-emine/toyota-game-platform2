import React, { useState, useEffect } from 'react';
import { Box, Button, ButtonGroup, TextField, Typography, Container, CssBaseline, Avatar, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';

export default function Login() {
  const [mode, setMode] = useState(null); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState('');
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('rememberMe') === 'true');
  const [savedUsers, setSavedUsers] = useState(JSON.parse(localStorage.getItem('savedUsers')) || []);
  const navigate = useNavigate();

  const avatarOptions = [
    '/images/20.jpg',
    '/images/21.jpg',
    '/images/22.jpg',
    '/images/44.jpeg',
    '/images/55.jpg',
    '/images/88.png',
  ];

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const endpoint = mode === 'signIn' ? 'http://localhost:3003/login' : 'http://localhost:3003/register';
    if (!email || !password || (mode === 'signUp' && (!confirmPassword || !username))) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (mode === 'signUp' && password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username, avatar }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu.');
        return;
      }

      console.log(data.message);
      if (mode === 'signIn') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('avatar', data.avatar);
        if (rememberMe) {
          const updatedUsers = [
            ...savedUsers.filter((user) => user.email !== email),
            { email, username: data.username, avatar: data.avatar, password },
          ];
          localStorage.setItem('savedUsers', JSON.stringify(updatedUsers));
        }
        navigate('/home');
      } else {
        setError('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      }
    } catch (err) {
      setError('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  const handleQuickLogin = async (user) => {
    setEmail(user.email);
    setPassword(user.password); 
    setAvatar(user.avatar);
    setMode('signIn');

    try {
      const response = await fetch('http://localhost:3003/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Bir hata oluştu.');
        return;
      }

      console.log(data.message);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('avatar', data.avatar);
      navigate('/home');
    } catch (err) {
      setError('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppTheme mode={themeMode}>
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100vh',
        background: themeMode === 'dark'
          ? 'linear-gradient(135deg, #4b0016 0%, #2d0010 100%)'
          : 'linear-gradient(135deg, #ffe0ec 0%, #ffd6e0 100%)',
        transition: 'background 0.5s',
      }}>
        <Box
          component="img"
          src="/images/88.png"
          alt="88"
          sx={{
            position: 'absolute',
            bottom: '-100px',
            left: '20%',
            width: '80px',
            height: '80px',
            animation: 'floatUp 5s linear infinite',
          }}
        />
        <Box
          component="img"
          src="/images/99.png"
          alt="99"
          sx={{
            position: 'absolute',
            bottom: '-100px',
            right: '20%',
            width: '80px',
            height: '80px',
            animation: 'floatUp 7s linear infinite',
          }}
        />
        <Box
          component="img"
          src="/images/102.png"
          alt="102"
          sx={{
            position: 'absolute',
            bottom: '-100px',
            left: '10%',
            width: '80px',
            height: '80px',
            animation: 'floatUp 6s linear infinite',
          }}
        />
        <Box
          component="img"
          src="/images/103.png"
          alt="103"
          sx={{
            position: 'absolute',
            bottom: '-100px',
            right: '10%',
            width: '80px',
            height: '80px',
            animation: 'floatUp 8s linear infinite',
          }}
        />
        <Box
          component="img"
          src="/images/104.png"
          alt="104"
          sx={{
            position: 'absolute',
            bottom: '-100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80px',
            height: '80px',
            animation: 'floatUp 9s linear infinite',
          }}
        />
        <Box
          component="img"
          src="/images/105.png"
          alt="105"
          sx={{
            position: 'absolute',
            bottom: '-100px',
            left: '30%',
            width: '80px',
            height: '80px',
            animation: 'floatUp 10s linear infinite',
          }}
        />
        <Box
          component="img"
          src="/images/106.png"
          alt="106"
          sx={{
            position: 'absolute',
            bottom: '-100px',
            right: '30%',
            width: '80px',
            height: '80px',
            animation: 'floatUp 11s linear infinite',
          }}
        />
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Brightness7Icon sx={{ color: themeMode === 'dark' ? '#bbb' : '#fae16a', fontSize: 28 }} />
              <Switch
                checked={themeMode === 'dark'}
                onChange={toggleTheme}
                color="warning"
                inputProps={{ 'aria-label': 'theme switch' }}
                sx={{
                  '& .MuiSwitch-thumb': {
                    backgroundColor: themeMode === 'dark' ? '#232526' : '#ffe082',
                  },
                  '& .MuiSwitch-track': {
                    background: themeMode === 'dark'
                      ? 'linear-gradient(90deg, #232526 0%, #414345 100%)'
                      : 'linear-gradient(90deg, #fffbe6 0%, #ffe082 100%)',
                  },
                }}
              />
              <Brightness4Icon sx={{ color: themeMode === 'dark' ? '#ffe082' : '#888', fontSize: 28 }} />
            </Stack>
          </Box>
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {mode === null && (
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 'bold',
                  fontFamily: 'Exile, Underdog, sans-serif',
                  color: themeMode === 'dark' ? '#cfcfb4' : '#7c225c', 
                  mb: 5,
                  textAlign: 'center',
                  letterSpacing: 1.5,
                  textShadow: themeMode === 'dark' ? '0 2px 16px #232526' : '0 2px 12px #fee140',
                  fontSize: { xs: 32, sm: 44, md: 94 },
                }}
              >
                Buglıköy'e Hoş Geldin
              </Typography>
            )}
            {mode === null && (
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'Underdog, sans-serif',
                  color: themeMode === 'dark' ? '#f3f3ec' : '#7c225c',
                  textAlign: 'center',
                  fontSize: { xs: 14, sm: 16, md: 18 },
                  mb: 4,
                }}
              >
                "Macera dolu bir köyde evini kur, arkadaşlarınla eğlen, yeteneklerini geliştir. Ama unutma, köyde dedikodu da bol! Oyunbozanlar, hileci ve ağlayanlar giremez!"
              </Typography>
            )}
            {mode === null && (
              <Box sx={{ display: 'flex', gap: 4, mt: 8 }}>
                <Button
                  onClick={() => setMode('signIn')}
                  sx={{
                    px: 6,
                    py: 2.5,
                    fontSize: 28,
                    fontWeight: 'bold',
                    borderRadius: '32px',
                    background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 24px 0 rgba(67,233,123,0.25)',
                    textTransform: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: '0 8px 32px 0 rgba(56,249,215,0.35)',
                      background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                    },
                    animation: 'pulseBtn 1.8s infinite',
                  }}
                >
                  Giriş Yap
                </Button>
                <Button
                  onClick={() => setMode('signUp')}
                  sx={{
                    px: 6,
                    py: 2.5,
                    fontSize: 28,
                    fontWeight: 'bold',
                    borderRadius: '32px',
                    background: 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)',
                    color: '#fff',
                    boxShadow: '0 4px 24px 0 rgba(250,112,154,0.18)',
                    textTransform: 'none',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      boxShadow: '0 8px 32px 0 rgba(250,112,154,0.28)',
                      background: 'linear-gradient(90deg, #fee140 0%, #fa709a 100%)',
                    },
                    animation: 'pulseBtn 1.8s infinite',
                    animationDelay: '0.9s',
                  }}
                >
                  Kayıt Ol
                </Button>
              </Box>
            )}
            {mode !== null && (
              <>
                <ButtonGroup
                  variant="contained"
                  sx={{
                    mb: 3,
                    borderRadius: '32px',
                    background: 'rgba(255,255,255,0.18)',
                    boxShadow: '0 4px 24px 0 rgba(124,34,92,0.10)',
                    backdropFilter: 'blur(8px)',
                    border: '1.5px solid',
                    borderColor: themeMode === 'dark' ? 'rgba(124,34,92,0.25)' : 'rgba(250,112,154,0.18)',
                    overflow: 'hidden',
                    p: 0.5,
                    gap: 0,
                  }}
                >
                  <Button
                    onClick={() => setMode('signIn')}
                    sx={{
                      px: 5,
                      py: 2,
                      fontSize: 22,
                      fontWeight: 'bold',
                      borderRadius: '28px',
                      background: mode === 'signIn'
                        ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                        : 'transparent',
                      color: mode === 'signIn' ? '#fff' : themeMode === 'dark' ? '#f3f3ec' : '#7c225c',
                      boxShadow: mode === 'signIn' ? '0 4px 24px 0 rgba(67,233,123,0.18)' : 'none',
                      textTransform: 'none',
                      transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                      border: 'none',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)',
                        color: '#fff',
                        transform: 'scale(1.06)',
                        boxShadow: '0 8px 32px 0 rgba(56,249,215,0.18)',
                      },
                    }}
                  >
                    Giriş Yap
                  </Button>
                  <Button
                    onClick={() => setMode('signUp')}
                    sx={{
                      px: 5,
                      py: 2,
                      fontSize: 22,
                      fontWeight: 'bold',
                      borderRadius: '28px',
                      background: mode === 'signUp'
                        ? 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)'
                        : 'transparent',
                      color: mode === 'signUp' ? '#fff' : themeMode === 'dark' ? '#f3f3ec' : '#7c225c',
                      boxShadow: mode === 'signUp' ? '0 4px 24px 0 rgba(250,112,154,0.18)' : 'none',
                      textTransform: 'none',
                      transition: 'all 0.22s cubic-bezier(.4,2,.6,1)',
                      border: 'none',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #fee140 0%, #fa709a 100%)',
                        color: '#fff',
                        transform: 'scale(1.06)',
                        boxShadow: '0 8px 32px 0 rgba(250,112,154,0.18)',
                      },
                    }}
                  >
                    Kayıt Ol
                  </Button>
                </ButtonGroup>
                <Typography component="h1" variant="h5">
                  {mode === 'signIn' ? 'Giriş Yap' : 'Kayıt Ol'}
                </Typography>
                {mode === 'signIn' && savedUsers.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Hızlı Giriş</Typography>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {savedUsers.map((user) => (
                        <Grid item key={user.email}>
                          <Avatar
                            src={user.avatar}
                            alt={user.username}
                            sx={{ cursor: 'pointer', width: 56, height: 56 }}
                            onClick={() => handleQuickLogin(user)}
                          />
                          <Typography variant="body2" align="center">
                            {user.username}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{ mt: 1 }}
                >
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="E-posta Adresi"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Şifre"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {mode === 'signUp' && (
                        <>
                          <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="username"
                            label="Kullanıcı Adı"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                          <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Şifreyi Onayla"
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </>
                      )}
                    </Grid>
                    {mode === 'signUp' && (
                      <Grid item xs={4}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          Avatar Seçimi:
                        </Typography>
                        <Grid container spacing={1}>
                          {avatarOptions.map((option) => (
                            <Grid item key={option}>
                              <Avatar
                                src={option}
                                alt="Avatar"
                                sx={{
                                  cursor: 'pointer',
                                  width: 56,
                                  height: 56,
                                  border: avatar === option ? '2px solid blue' : 'none',
                                }}
                                onClick={() => setAvatar(option)}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                  {mode === 'signIn' && (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                      }
                      label="Beni Hatırla"
                    />
                  )}
                  {error && (
                    <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                      {error}
                    </Typography>
                  )}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                      mb: 2,
                      fontWeight: 'bold',
                      fontSize: 22,
                      borderRadius: '28px',
                      background:
                        mode === 'signIn'
                          ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)'
                          : 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)',
                      color: '#fff',
                      boxShadow:
                        mode === 'signIn'
                          ? '0 4px 24px 0 rgba(67,233,123,0.18)'
                          : '0 4px 24px 0 rgba(250,112,154,0.18)',
                      textTransform: 'none',
                      letterSpacing: 1.2,
                      transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                      '&:hover': {
                        transform: 'scale(1.07) rotate(-2deg)',
                        boxShadow:
                          mode === 'signIn'
                            ? '0 8px 32px 0 rgba(56,249,215,0.28)'
                            : '0 8px 32px 0 rgba(250,112,154,0.28)',
                        background:
                          mode === 'signIn'
                            ? 'linear-gradient(90deg, #38f9d7 0%, #43e97b 100%)'
                            : 'linear-gradient(90deg, #fee140 0%, #fa709a 100%)',
                      },
                      animation: 'formBtnPulse 1.5s infinite',
                      animationDelay: mode === 'signIn' ? '0.2s' : '0.7s',
                    }}
                  >
                    {mode === 'signIn' ? 'Giriş Yap' : 'Kayıt Ol'}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Container>
        <Box sx={{ position: 'fixed', top: '1.2rem', left: '1.2rem', zIndex: 2000, display: 'flex', gap: 2 }}>
          <a href="https://www.instagram.com/minn.eminee/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block' }}>
            <Box
              component="img"
              src="/images/instagram.png"
              alt="Instagram"
              sx={{
                width: 38,
                height: 38,
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
          <Box
            component="img"
            src="/images/twitter.png"
            alt="Twitter"
            sx={{
              width: 38,
              height: 38,
              cursor: 'pointer',
              filter: themeMode === 'dark' ? 'brightness(1.2)' : 'none',
              transition: 'transform 0.22s cubic-bezier(.4,2,.6,1)',
              '&:hover': {
                transform: 'scale(1.18) rotate(7deg)',
                boxShadow: '0 8px 32px 0 rgba(56,249,215,0.18)',
              },
            }}
          />
          <Box
            component="img"
            src="/images/discord.png"
            alt="Discord"
            sx={{
              width: 38,
              height: 38,
              cursor: 'pointer',
              filter: themeMode === 'dark' ? 'brightness(1.2)' : 'none',
              transition: 'transform 0.22s cubic-bezier(.4,2,.6,1)',
              '&:hover': {
                transform: 'scale(1.18) rotate(-5deg)',
                boxShadow: '0 8px 32px 0 rgba(114,137,218,0.18)',
              },
            }}
          />
        </Box>
      </Box>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Exile&display=swap');
          @keyframes floatUp {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-120vh);
            }
          }
          @keyframes pulseBtn {
            0% { box-shadow: 0 4px 24px 0 rgba(67,233,123,0.25), 0 0 0 0 rgba(67,233,123,0.15); }
            70% { box-shadow: 0 8px 32px 0 rgba(67,233,123,0.35), 0 0 0 16px rgba(67,233,123,0.05); }
            100% { box-shadow: 0 4px 24px 0 rgba(67,233,123,0.25), 0 0 0 0 rgba(67,233,123,0.15); }
          }
          @keyframes formBtnPulse {
            0% { filter: brightness(1) drop-shadow(0 0 0 #fff); }
            60% { filter: brightness(1.08) drop-shadow(0 0 12px #fee140); }
            100% { filter: brightness(1) drop-shadow(0 0 0 #fff); }
          }
        `}
      </style>
    </AppTheme>
  );
}
