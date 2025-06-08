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
  Grid,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';

export default function Home() {
  const userId = localStorage.getItem('userId'); 
  const avatar = localStorage.getItem('avatar'); // Avatar bilgisi doğru şekilde alınıyor
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

  const [hoveredGame, setHoveredGame] = useState(gamesWithBackgroundEffect[0]); // İlk oyun varsayılan olarak seçildi
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    const fetchLobbies = async () => {
      try {
        const response = await fetch('http://localhost:3003/lobbies');
        const data = await response.json();
        // data bir obje: { lobbyCode: {name, participants, ...}, ... }
        // Sunucuya katılımcı isimlerini eklettik, onları doğrudan kullan!
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
    localStorage.removeItem('avatar'); // Avatar bilgisini temizle
    navigate('/');
  };

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
              src={avatar} // Kullanıcının seçtiği avatar burada gösteriliyor
              alt="Profil Avatarı"
              sx={{ cursor: 'pointer', ml: 2 }}
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
        <div style={{ padding: '20px' }}>
          <div
            style={{
              width: '1024px',
              height: '576px',
              margin: '0 auto',
              marginTop: '20px',
              backgroundImage: `url(${hoveredGame.image})`, // Varsayılan olarak ilk oyun
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
                  onMouseEnter={() => setHoveredGame(game)} // Üzerine gelindiğinde arka plan değişir
                  onMouseLeave={() => setHoveredGame(gamesWithBackgroundEffect[0])} // Fare ayrıldığında ilk oyun geri gelir
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
