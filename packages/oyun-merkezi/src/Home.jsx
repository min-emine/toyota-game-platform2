import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardMedia,
  Grid,
  Box,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const gamesWithBackgroundEffect = [
  { id: 1, name: 'Tombala', image: '/images/1.jpg' },
  { id: 2, name: 'Oyun 2', image: '/images/2.jpg' },
  { id: 3, name: 'Oyun 3', image: '/images/3.jpg' },
];

export default function Home() {
  const userId = localStorage.getItem('userId'); 
  const avatar = localStorage.getItem('avatar'); 
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lobbyName, setLobbyName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [lobbies, setLobbies] = useState([]);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinLobbyCode, setJoinLobbyCode] = useState('');
  const [currentLobby, setCurrentLobby] = useState(null);
  const [selectedLobby, setSelectedLobby] = useState(null);
  const [selectedGameIdx, setSelectedGameIdx] = useState(0);
  const selectedGame = gamesWithBackgroundEffect[selectedGameIdx];
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        const response = await fetch('http://localhost:3003/lobbies');
        const data = await response.json();
        const lobbiesWithParticipants = Object.entries(data).map(([code, lobby]) => ({
          code,
          ...lobby
        }));
        setLobbies(lobbiesWithParticipants);
      } catch (error) {
        console.error('Error fetching lobbies:', error);
      }
    };

    fetchLobbies();
  }, []);

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

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
    setDrawerOpen(false);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setLobbyName('');
    setLobbyCode('');
  };

  const handleCreateLobby = async () => {
    if (!lobbyName.trim()) {
      alert('Lobi adı gereklidir.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3003/create-lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyName }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lobi oluşturulamadı.');
      }
      setLobbyCode(data.lobbyCode);
      fetchLobbies();
    } catch (error) {
      console.error('Lobi oluşturulurken bir hata oluştu:', error);
      alert(error.message || 'Lobi oluşturulamadı.');
    }
  };

  const handleJoinDialogOpen = (lobby) => {
    setSelectedLobby(lobby);
    setJoinDialogOpen(true);
    setDrawerOpen(false);
  };

  const handleJoinDialogClose = () => {
    setJoinDialogOpen(false);
    setJoinLobbyCode('');
    setSelectedLobby(null);
  };

  const handleJoinLobby = async () => {
    if (!joinLobbyCode.trim()) {
      alert('Lobi kodu gereklidir.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3003/join-lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyCode: joinLobbyCode, userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lobiye katılma işlemi başarısız oldu.');
      }
      setCurrentLobby(data.lobby);
      alert(`Lobiye başarıyla katıldınız: ${data.lobby.name}`);
      handleJoinDialogClose();
    } catch (error) {
      console.error('Lobiye katılma sırasında bir hata oluştu:', error);
      alert(error.message || 'Lobiye katılma işlemi başarısız oldu.');
    }
  };

  const handleLeaveLobby = async (lobbyCode) => {
    if (!window.confirm('Lobiden çıkmak istiyor musunuz?')) return;
    try {
      const response = await fetch('http://localhost:3003/leave-lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyCode, userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lobiden çıkış işlemi başarısız oldu.');
      }
      setCurrentLobby(null); 
      alert('Lobiden başarıyla çıkıldı.');
    } catch (error) {
      console.error('Lobiden çıkış sırasında bir hata oluştu:', error);
      alert(error.message || 'Lobiden çıkış işlemi başarısız oldu.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('avatar'); 
    navigate('/');
  };

  const handleGameClick = (gameId) => {
    navigate(`/game-details/${gameId}`); 
  };

  return (
    <AppTheme mode={themeMode}>
      <div
        style={{
          minHeight: '100vh',
          background: themeMode === 'dark'
            ? 'linear-gradient(135deg, #232946 0%, #16161a 100%)'
            : 'linear-gradient(135deg,rgb(184, 205, 251) 0%,rgb(160, 196, 249) 100%)',
          transition: 'background 0.5s',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {themeMode === 'light' && <>
          <Box component="img" src="/images/cloud.png" alt="Cloud1" sx={{ position: 'fixed', top: { xs: 60, md: 90 }, left: 0, width: { xs: 70, md: 100 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft1 12s linear infinite', animationDelay: '0s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud2" sx={{ position: 'fixed', top: { xs: 120, md: 160 }, left: 0, width: { xs: 60, md: 90 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft2 15s linear infinite', animationDelay: '2s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud3" sx={{ position: 'fixed', top: { xs: 180, md: 220 }, left: 0, width: { xs: 100, md: 140 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft3 18s linear infinite', animationDelay: '4s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud4" sx={{ position: 'fixed', top: { xs: 240, md: 280 }, left: 0, width: { xs: 80, md: 110 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft4 13s linear infinite', animationDelay: '1s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud5" sx={{ position: 'fixed', top: { xs: 300, md: 340 }, left: 0, width: { xs: 90, md: 120 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft5 16s linear infinite', animationDelay: '3s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud6" sx={{ position: 'fixed', top: { xs: 360, md: 400 }, left: 0, width: { xs: 75, md: 100 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft6 11s linear infinite', animationDelay: '5s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud7" sx={{ position: 'fixed', top: { xs: 520, md: 600 }, left: 0, width: { xs: 90, md: 120 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft7 14s linear infinite', animationDelay: '2.5s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud8" sx={{ position: 'fixed', top: { xs: 600, md: 700 }, left: 0, width: { xs: 110, md: 150 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft8 17s linear infinite', animationDelay: '6s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud9" sx={{ position: 'fixed', top: { xs: 700, md: 820 }, left: 0, width: { xs: 80, md: 110 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft9 12s linear infinite', animationDelay: '1.5s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/cloud.png" alt="Cloud10" sx={{ position: 'fixed', top: { xs: 800, md: 950 }, left: 0, width: { xs: 120, md: 170 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'cloudLeft10 19s linear infinite', animationDelay: '7s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/airplane.png" alt="Airplane1" sx={{ position: 'fixed', top: { xs: 180, md: 120 }, left: 0, width: { xs: 60, md: 90 }, height: 'auto', opacity: 0.92, zIndex: 0, pointerEvents: 'none', animation: 'airplane1 22s linear infinite', animationDelay: '0s', transform: 'rotate(7deg)', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/airplane2.png" alt="Airplane2" sx={{ position: 'fixed', top: { xs: 420, md: 320 }, left: 0, width: { xs: 70, md: 100 }, height: 'auto', opacity: 0.95, zIndex: 0, pointerEvents: 'none', animation: 'airplane2 28s linear infinite', animationDelay: '8s', transform: 'rotate(3deg)', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/airplane.png" alt="Airplane3" sx={{ position: 'fixed', top: { xs: 720, md: 820 }, left: 0, width: { xs: 55, md: 80 }, height: 'auto', opacity: 0.88, zIndex: 0, pointerEvents: 'none', animation: 'airplane3 35s linear infinite', animationDelay: '4s', transform: 'rotate(5deg)', visibility: 'hidden', animationFillMode: 'forwards' }} />
        </>}
        {themeMode === 'dark' && <>
          <div className="star-bg" style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:0,pointerEvents:'none'}} />
          <Box component="img" src="/images/earth.png" alt="Earth" sx={{ position: 'fixed', left: '50%', top: '50%', width: { xs: 60, md: 90 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'orbitEarth 30s linear infinite' }} />
          <Box component="img" src="/images/venus.png" alt="Venus" sx={{ position: 'fixed', left: '50%', top: '50%', width: { xs: 50, md: 80 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'orbitVenus 40s linear infinite' }} />
          <Box component="img" src="/images/mars.png" alt="Mars" sx={{ position: 'fixed', left: '50%', top: '50%', width: { xs: 70, md: 100 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'orbitMars 50s linear infinite' }} />
          <Box component="img" src="/images/jupiter.png" alt="Jupiter" sx={{ position: 'fixed', left: '50%', top: '50%', width: { xs: 80, md: 120 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'orbitJupiter 60s linear infinite' }} />
          <Box component="img" src="/images/mercury.png" alt="Mercury" sx={{ position: 'fixed', left: '50%', top: '50%', width: { xs: 50, md: 70 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'orbitMercury 20s linear infinite' }} />
          <Box component="img" src="/images/uranus.png" alt="Uranus" sx={{ position: 'fixed', left: '50%', top: '50%', width: { xs: 70, md: 100 }, height: 'auto', opacity: 1, zIndex: 0, pointerEvents: 'none', animation: 'orbitUranus 70s linear infinite' }} />
          {/* Spaceships - only far left and far right */}
          <Box component="img" src="/images/spaceship.png" alt="SpaceshipLeft" sx={{ position: 'fixed', left: 0, bottom: '-80px', width: { xs: 60, md: 90 }, opacity: 0.7, zIndex: 0, pointerEvents: 'none', animation: 'spaceship1 13s linear infinite', animationDelay: '0s', visibility: 'hidden', animationFillMode: 'forwards' }} />
          <Box component="img" src="/images/spaceship2.png" alt="SpaceshipRight" sx={{ position: 'fixed', right: 0, bottom: '-90px', width: { xs: 60, md: 90 }, opacity: 0.7, zIndex: 0, pointerEvents: 'none', animation: 'spaceship2 15s linear infinite', animationDelay: '8s', visibility: 'hidden', animationFillMode: 'forwards' }} />
        </>}
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
            animation: 'fadeInAppBar 1.2s cubic-bezier(.4,2,.6,1)',
            position: 'relative',
            overflow: 'visible',
          }}
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
              <IconButton
                onClick={toggleTheme}
                sx={{
                  mr: 1,
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: themeMode === 'dark'
                    ? 'linear-gradient(135deg, #232526 0%, #7c225c 100%)'
                    : 'linear-gradient(135deg, #ffe082 0%, #fae16a 100%)',
                  color: themeMode === 'dark' ? '#ffe082' : '#7c225c',
                  boxShadow: '0 2px 12px 0 rgba(124,34,92,0.10)',
                  transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                  '&:hover': {
                    transform: 'scale(1.12) rotate(-10deg)',
                    boxShadow: '0 4px 24px 0 rgba(250,112,154,0.18)',
                    background: themeMode === 'dark'
                      ? 'linear-gradient(135deg, #7c225c 0%, #232526 100%)'
                      : 'linear-gradient(135deg, #fae16a 0%, #ffe082 100%)',
                  },
                }}
              >
                <Brightness7Icon sx={{ fontSize: 28 }} />
              </IconButton>
              <Avatar
                src={avatar}
                alt="Profil Avatarı"
                sx={{ cursor: 'pointer', ml: 1 }}
                onClick={handleProfileClick}
              />
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
                onClick={handleDrawerOpen}
                sx={{ ml: 1 }}
              >
                <GroupsIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
          <List sx={{ width: 250 }}>
            <ListItem>
              <Typography variant="h6">Lobiler</Typography>
            </ListItem>
            <Divider />
            {lobbies.length > 0 ? (
              lobbies.map((lobby) => (
                <ListItem
                  key={lobby.code}
                  button
                  onClick={() =>
                    currentLobby?.name === lobby.name
                      ? handleLeaveLobby(lobby.code)
                      : handleJoinDialogOpen([lobby.code, lobby])
                  }
                  sx={{
                    backgroundColor: currentLobby?.name === lobby.name ? 'lightgreen' : 'inherit',
                  }}
                >
                  <ListItemText
                    primary={lobby.name}
                    secondary={
                      <>
                        Katılımcı sayısı: {lobby.participants?.length || 0}
                        {lobby.participantNames && lobby.participantNames.length > 0 && (
                          <div style={{ fontSize: 12, marginTop: 4 }}>
                            {lobby.participantNames.map((name, i) => (
                              <div key={i}>{name}</div>
                            ))}
                          </div>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Hiçbir lobi bulunamadı." />
              </ListItem>
            )}
            <Divider />
            <ListItem>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={handleDialogOpen}
                sx={{
                  mt: 1,
                  py: 1.1,
                  fontWeight: 'bold',
                  fontSize: 16,
                  borderRadius: '24px',
                  background: 'linear-gradient(90deg, #7c4dff 0%, #00bcd4 100%)', // mor-mavi
                  color: '#fff',
                  boxShadow: '0 2px 8px 0 rgba(124,77,255,0.13)',
                  textTransform: 'none',
                  letterSpacing: 1.1,
                  transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(2deg)',
                    boxShadow: '0 4px 16px 0 rgba(0,188,212,0.18)',
                    background: 'linear-gradient(90deg, #00bcd4 0%, #7c4dff 100%)',
                  },
                  animation: 'formBtnPulse 1.5s infinite',
                  animationDelay: '0.7s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                }}
                startIcon={<GroupsIcon sx={{ fontSize: 22 }} />}
              >
                Yeni Lobi Oluştur
              </Button>
            </ListItem>
            <ListItem>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  setSelectedLobby(null);
                  setJoinDialogOpen(true);
                }}
                sx={{
                  mt: 1,
                  py: 1.1,
                  fontWeight: 'bold',
                  fontSize: 16,
                  borderRadius: '24px',
                  background: 'linear-gradient(90deg, #ff9800 0%, #ff3d00 100%)', // turuncu-kırmızı
                  color: '#fff',
                  boxShadow: '0 2px 8px 0 rgba(255,152,0,0.13)',
                  textTransform: 'none',
                  letterSpacing: 1.1,
                  transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                  '&:hover': {
                    transform: 'scale(1.05) rotate(-2deg)',
                    boxShadow: '0 4px 16px 0 rgba(255,61,0,0.18)',
                    background: 'linear-gradient(90deg, #ff3d00 0%, #ff9800 100%)',
                  },
                  animation: 'formBtnPulse 1.5s infinite',
                  animationDelay: '0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
                }}
                startIcon={<GroupsIcon sx={{ fontSize: 22 }} />}
              >
                Lobiye Katıl
              </Button>
            </ListItem>
          </List>
        </Drawer>
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Yeni Lobi Oluştur</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Lobi Adı"
              fullWidth
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
            />
            {lobbyCode && (
              <Typography sx={{ mt: 2 }}>
                Lobi Kodu: <strong>{lobbyCode}</strong>
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>İptal</Button>
            <Button onClick={handleCreateLobby} disabled={!!lobbyCode}>
              Oluştur
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={joinDialogOpen} onClose={handleJoinDialogClose}>
          <DialogTitle>Lobiye Katıl</DialogTitle>
          <DialogContent>
            <Typography>Lobi Adı: {selectedLobby?.[1].name}</Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Lobi Kodu"
              fullWidth
              value={joinLobbyCode}
              onChange={(e) => setJoinLobbyCode(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleJoinDialogClose}>İptal</Button>
            <Button onClick={handleJoinLobby}>Katıl</Button>
          </DialogActions>
        </Dialog>
        <div
          style={{
            width: '100%',
            maxWidth: 1280,
            minHeight: 420,
            margin: '0 auto',
            marginTop: 32,
            display: 'flex',
            flexDirection: 'row',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 8px 32px 0 rgba(124,34,92,0.10)',
            background: themeMode === 'dark'
              ? 'linear-gradient(135deg, #232946 0%, #16161a 100%)'
              : 'linear-gradient(135deg, #e0eaff 0%, #b6d0f7 100%)',
            position: 'relative',
            minHeight: 360,
          }}
        >
          <div
            style={{
              flex: 3,
              minWidth: 0,
              minHeight: 360,
              backgroundImage: `url(${selectedGame.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
              backgroundRepeat: 'no-repeat',
              borderTopLeftRadius: 24,
              borderBottomLeftRadius: 24,
              transition: 'background-image 0.4s',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
            }}
          >
          </div>
          <div
            style={{
              flex: 2,
              minWidth: 0,
              padding: '48px 32px 32px 32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              background: themeMode === 'dark'
                ? 'rgba(22,22,26,0.92)'
                : 'rgba(255,255,255,0.92)',
              borderTopRightRadius: 24,
              borderBottomRightRadius: 24,
              boxShadow: themeMode === 'dark'
                ? '0 2px 24px 0 rgba(67,233,123,0.04)'
                : '0 2px 24px 0 rgba(250,112,154,0.04)',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: themeMode === 'dark' ? '#ffe082' : '#7c225c', letterSpacing: 1 }}>
              {selectedGame.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: themeMode === 'dark' ? '#b6ffc0' : '#232946', maxWidth: 320 }}>
              {selectedGame.id === 1 && 'Klasik tombala keyfi, arkadaşlarınla yarış!'}
              {selectedGame.id === 2 && 'Hızlı refleks, hızlı kazan! Yeni nesil oyun.'}
              {selectedGame.id === 3 && 'Strateji ve şans bir arada. En iyisi sen ol!'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 'auto' }}>
              {gamesWithBackgroundEffect.map((game, idx) => (
                <button
                  key={game.id}
                  aria-label={`Slide ${idx + 1}`}
                  type="button"
                  onClick={() => setSelectedGameIdx(idx)}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: 'none',
                    margin: 0,
                    background: selectedGameIdx === idx
                      ? (themeMode === 'dark' ? 'linear-gradient(135deg, #43e97b 0%, #7c225c 100%)' : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)')
                      : (themeMode === 'dark' ? '#232946' : '#e0eaff'),
                    boxShadow: selectedGameIdx === idx ? '0 2px 8px rgba(67,233,123,0.18)' : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                  data-gtm-category="Marquee"
                  data-gtm-action="Dot click"
                  data-gtm-label={`Dot clicked to ${idx}`}
                />
              ))}
            </Box>
          </div>
        </div>
        <div style={{ width: '100%', maxWidth: 1280, margin: '64px auto 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '32px', position: 'relative', zIndex: 2 }}>
          {gamesWithBackgroundEffect.map((game) => (
            <div
              key={game.id}
              onClick={() => handleGameClick(game.id)}
              style={{ cursor: 'pointer', width: 220 }}
            >
              <Card sx={{ borderRadius: '18px', boxShadow: '0 2px 12px rgba(124,34,92,0.10)', transition: 'transform 0.18s', '&:hover': { transform: 'scale(1.06)' } }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={game.image}
                  alt={game.name}
                />
              </Card>
            </div>
          ))}
        </div>
      </div>
      <style>{`
@keyframes fadeInAppBar {
  0% { opacity: 0; transform: translateY(-32px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes bounceTitle {
  0% { transform: scale(1) translateY(0); }
  20% { transform: scale(1.12, 0.92) translateY(-6px); }
  40% { transform: scale(0.96, 1.08) translateY(2px); }
  60% { transform: scale(1.04, 0.98) translateY(-2px); }
  80% { transform: scale(0.98, 1.02) translateY(1px); }
  100% { transform: scale(1) translateY(0); }
}
@keyframes cloudLeft1 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-120px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(110vw); }
}
@keyframes cloudLeft2 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-90px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(120vw); }
}
@keyframes cloudLeft3 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-180px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(100vw); }
}
@keyframes cloudLeft4 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-60px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(115vw); }
}
@keyframes cloudLeft5 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-150px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(105vw); }
}
@keyframes cloudLeft6 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-80px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(125vw); }
}
@keyframes cloudLeft7 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-100px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(120vw); }
}
@keyframes cloudLeft8 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-160px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(110vw); }
}
@keyframes cloudLeft9 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-80px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(125vw); }
}
@keyframes cloudLeft10 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-200px); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateX(105vw); }
}
@keyframes airplane1 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-120px) rotate(7deg); }
  1% { visibility: visible; opacity: 0.92; }
  100% { visibility: visible; opacity: 0.92; transform: translateX(110vw) rotate(7deg); }
}
@keyframes airplane2 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-90px) rotate(3deg); }
  1% { visibility: visible; opacity: 0.95; }
  100% { visibility: visible; opacity: 0.95; transform: translateX(120vw) rotate(3deg); }
}
@keyframes airplane3 {
  0% { visibility: hidden; opacity: 0; transform: translateX(-180px) rotate(5deg); }
  1% { visibility: visible; opacity: 0.88; }
  100% { visibility: visible; opacity: 0.88; transform: translateX(100vw) rotate(5deg); }
}
@keyframes orbitEarth {
  0% { transform: rotate(0deg) translateX(300px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(300px) rotate(-360deg); }
}
@keyframes orbitVenus {
  0% { transform: rotate(60deg) translateX(400px) rotate(0deg); }
  100% { transform: rotate(420deg) translateX(400px) rotate(-360deg); }
}
@keyframes orbitMars {
  0% { transform: rotate(120deg) translateX(500px) rotate(0deg); }
  100% { transform: rotate(480deg) translateX(500px) rotate(-360deg); }
}
@keyframes orbitJupiter {
  0% { transform: rotate(180deg) translateX(600px) rotate(0deg); }
  100% { transform: rotate(540deg) translateX(600px) rotate(-360deg); }
}
@keyframes orbitMercury {
  0% { transform: rotate(240deg) translateX(200px) rotate(0deg); }
  100% { transform: rotate(600deg) translateX(200px) rotate(-360deg); }
}
@keyframes orbitUranus {
  0% { transform: rotate(300deg) translateX(700px) rotate(0deg); }
  100% { transform: rotate(660deg) translateX(700px) rotate(-360deg); }
}
@keyframes starTwinkle {
  0%,100% { filter: brightness(1); }
  50% { filter: brightness(1.5); }
}
@keyframes spaceship1 {
  0% { visibility: hidden; opacity: 0; transform: translateY(0); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateY(-110vh); }
}
@keyframes spaceship2 {
  0% { visibility: hidden; opacity: 0; transform: translateY(0); }
  1% { visibility: visible; opacity: 1; }
  100% { visibility: visible; opacity: 1; transform: translateY(-140vh); }
}
.star-bg {
  background: transparent;
}
.star-bg:before, .star-bg:after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100vw; height: 100vh;
  pointer-events: none;
  z-index: 0;
}
.star-bg:before {
  background: repeating-radial-gradient(circle at 10% 20%, #fff 0 1px, transparent 1px 100px),
              repeating-radial-gradient(circle at 70% 80%, #fff 0 1.2px, transparent 1.2px 120px),
              repeating-radial-gradient(circle at 50% 50%, #fff 0 0.8px, transparent 0.8px 80px);
  opacity: 0.18;
  animation: starTwinkle 7s linear infinite;
}
.star-bg:after {
  background: repeating-radial-gradient(circle at 30% 60%, #fff 0 1.1px, transparent 1.1px 110px),
              repeating-radial-gradient(circle at 80% 30%, #fff 0 0.7px, transparent 0.7px 90px);
  opacity: 0.13;
  animation: starTwinkle 11s linear infinite reverse;
}
`}</style>
    </AppTheme>
  );
}
