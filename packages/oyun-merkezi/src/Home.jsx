import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';
import {
  Switch,
  FormControlLabel,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';

export default function Home() {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElLobbies, setAnchorElLobbies] = useState(null);
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const toggleTheme = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleProfileClick = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorElProfile(null);
  };

  const handleLobbiesClick = (event) => {
    setAnchorElLobbies(event.currentTarget);
  };

  const handleLobbiesClose = () => {
    setAnchorElLobbies(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

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
              Oyun Merkezi
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
              <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
            </Menu>
            <IconButton
              color="inherit"
              onClick={handleLobbiesClick}
              sx={{ ml: 2 }}
            >
              <GroupsIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElLobbies}
              open={Boolean(anchorElLobbies)}
              onClose={handleLobbiesClose}
            >
              <MenuItem onClick={handleLobbiesClose}>Yeni Lobi Oluştur</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Hoş Geldiniz!</h1>
          <p>Bu sayfa yalnızca giriş yapmış kullanıcılar tarafından görüntülenebilir.</p>
        </div>
      </div>
    </AppTheme>
  );
}
