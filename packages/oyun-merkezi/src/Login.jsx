import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  TextField,
  Typography,
  Container,
  CssBaseline,
  Switch,
  FormControlLabel,
  Avatar,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';

export default function Login() {
  const [mode, setMode] = useState('signIn');
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
    setPassword(user.password); // Şifreyi otomatik doldur
    setAvatar(user.avatar);
    setMode('signIn');

    // Formu otomatik olarak gönder
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
      <Box sx={{ position: 'relative', overflow: 'hidden', height: '100vh' }}>
        {/* Animasyonlu görseller */}
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
          <FormControlLabel
            control={
              <Switch
                checked={themeMode === 'dark'}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label={themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            sx={{ position: 'fixed', top: '1rem', right: '1rem' }}
          />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <ButtonGroup variant="contained" sx={{ mb: 3 }}>
              <Button
                onClick={() => setMode('signIn')}
                color={mode === 'signIn' ? 'primary' : 'inherit'}
              >
                Sign In
              </Button>
              <Button
                onClick={() => setMode('signUp')}
                color={mode === 'signUp' ? 'primary' : 'inherit'}
              >
                Sign Up
              </Button>
            </ButtonGroup>
            <Typography component="h1" variant="h5">
              {mode === 'signIn' ? 'Sign In' : 'Sign Up'}
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
                        onClick={() => handleQuickLogin(user)} // Hızlı giriş
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
                    label="Email Address"
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
                    label="Password"
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
                        label="Username"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
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
                sx={{ mt: 3, mb: 2 }}
              >
                {mode === 'signIn' ? 'Sign In' : 'Sign Up'}
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      <style>
        {`
          @keyframes floatUp {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-120vh);
            }
          }
        `}
      </style>
    </AppTheme>
  );
}
