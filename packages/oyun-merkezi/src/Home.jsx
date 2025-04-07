import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../shared-theme/AppTheme';
import {
  Switch,
  FormControlLabel,
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
  CardContent,
  Grid,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';

export default function Home() {
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
  const [hoveredGame, setHoveredGame] = useState(null); 
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
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

  const fetchLobbies = async () => {
    try {
      const response = await fetch('http://localhost:3003/lobbies'); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Lobiler:', data); 
      setLobbies(Object.entries(data)); 
    } catch (error) {
      console.error('Lobiler alınırken bir hata oluştu:', error);
      alert(error.message || 'Lobiler alınamadı.');
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

  const handleJoinLobby = () => {
    if (selectedLobby && joinLobbyCode === selectedLobby[0]) {
      setCurrentLobby(selectedLobby);
      alert(`Lobiye katıldınız: ${selectedLobby[1].name}`);
      handleJoinDialogClose();
    } else {
      alert('Geçersiz lobi kodu.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const gamesWithBackgroundEffect = [
    { id: 1, name: 'Oyun 1', image: '/images/1.jpg' },
    { id: 2, name: 'Oyun 2', image: '/images/2.jpg' },
    { id: 3, name: 'Oyun 3', image: '/images/3.jpg' },
  ];

  const gamesWithoutBackgroundEffect = [
    { id: 4, name: 'Oyun 4', image: '/images/4.jpg' },
    { id: 5, name: 'Oyun 5', image: '/images/5.jpg' },
    { id: 6, name: 'Oyun 6', image: '/images/6.jpg' },
  ];

  const additionalGames = [
    { id: 7, name: 'Oyun 7', image: '/images/7.jpg' },
    { id: 8, name: 'Oyun 8', image: '/images/8.jpg' },
    { id: 9, name: 'Oyun 9', image: '/images/9.jpg' },
  ];

  const handleGameClick = (gameId) => {
    navigate(`/game-details/${gameId}`); 
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
              onClick={handleDrawerOpen} 
              sx={{ ml: 2 }}
            >
              <GroupsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
          <List sx={{ width: 250 }}>
            <ListItem>
              <Typography variant="h6">Lobiler</Typography>
            </ListItem>
            <Divider />
            {lobbies.length > 0 ? (
              lobbies.map(([code, lobby]) => (
                <ListItem key={code}>
                  <ListItemText primary={lobby.name} secondary={`Kod: ${code}`} />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Hiçbir lobi bulunamadı." />
              </ListItem>
            )}
            <Divider />
            <ListItem button onClick={handleDialogOpen}>
              <ListItemText primary="Yeni Lobi Oluştur" />
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
        <div style={{ padding: '20px' }}>
          <div
            style={{
              width: '1024px',
              height: '576px',
              margin: '0 auto',
              marginTop: '20px', 
              backgroundImage: `url(${hoveredGame ? hoveredGame.image : '/images/background.jpg'})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              paddingBottom: '20px',
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              {gamesWithBackgroundEffect.map((game) => (
                <Grid
                  item
                  key={game.id}
                  xs={12}
                  sm={6}
                  md={4}
                  onMouseEnter={() => setHoveredGame(game)}
                  onMouseLeave={() => setHoveredGame(null)}
                  onClick={() => handleGameClick(game.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={game.image}
                      alt={game.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{game.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
          <div
            style={{
              width: '1024px',
              margin: '0 auto',
              marginTop: '40px', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              padding: '20px',
              backgroundColor: themeMode === 'dark' ? '#333' : '#f9f9f9',
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              {gamesWithoutBackgroundEffect.map((game) => (
                <Grid
                  item
                  key={game.id}
                  xs={12}
                  sm={6}
                  md={4}
                  onClick={() => handleGameClick(game.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={game.image}
                      alt={game.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{game.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
          <div
            style={{
              width: '1024px',
              margin: '0 auto',
              marginTop: '40px', 
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              padding: '20px',
              backgroundColor: themeMode === 'dark' ? '#444' : '#f0f0f0',
            }}
          >
            <Grid container spacing={2} justifyContent="center">
              {additionalGames.map((game) => (
                <Grid
                  item
                  key={game.id}
                  xs={12}
                  sm={6}
                  md={4}
                  onClick={() => handleGameClick(game.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={game.image}
                      alt={game.name}
                    />
                    <CardContent>
                      <Typography variant="h6">{game.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>
      </div>
    </AppTheme>
  );
}
