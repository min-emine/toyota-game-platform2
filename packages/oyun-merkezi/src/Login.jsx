import React, { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  TextField,
  Typography,
  Container,
  CssBaseline,
} from '@mui/material';

export default function Login() {
  const [mode, setMode] = useState('signIn'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password || (mode === 'signUp' && !confirmPassword)) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (mode === 'signUp' && password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setError('');

    const endpoint = mode === 'signIn' ? '/login' : '/register';
    const response = await fetch(`http://localhost:3001${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Bir hata oluştu.');
      return;
    }

    console.log(data.message);
    if (mode === 'signIn') {
      window.location.href = '/dashboard'; 
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
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
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mt: 1 }}
        >
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
  );
}
