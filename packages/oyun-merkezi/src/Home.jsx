import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';
import { Switch, FormControlLabel } from '@mui/material';

export default function Home() {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState('light');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <AppTheme mode={themeMode}>
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
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
        <h1>Hoş Geldiniz!</h1>
        <p>Bu sayfa yalnızca giriş yapmış kullanıcılar tarafından görüntülenebilir.</p>
        <button
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            navigate('/');
          }}
        >
          Çıkış Yap
        </button>
      </div>
    </AppTheme>
  );
}
