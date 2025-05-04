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
  Box,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import { io } from "socket.io-client"; 

export default function Home() {
  const userId = localStorage.getItem('userId'); 
  const avatar = localStorage.getItem('avatar'); 
  const username = localStorage.getItem('username');
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
  const [chatMessages, setChatMessages] = useState([]); 
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(true); 

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

  const [hoveredGame, setHoveredGame] = useState(gamesWithBackgroundEffect[0]); 
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    fetchLobbies();
  }, []);

  useEffect(() => {
   
    const newSocket = io('http://localhost:3003');
    setSocket(newSocket);

  
    newSocket.on('chatMessage', (message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const toggleDrawerVisibility = () => {
    setDrawerVisible((prev) => !prev); 
  };

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

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const message = {
        userId,
        username: localStorage.getItem('username') || 'Anonim',
        text: newMessage,
      };
      socket.emit('chatMessage', message); 
      setChatMessages((prevMessages) => [...prevMessages, message]); 
      setNewMessage('');
    }
  };

  return (
    <AppTheme mode={themeMode}>
      <Box sx={{ display: 'flex' }}>
        { }
        {drawerVisible && (
          <Drawer
            variant="persistent"
            open={drawerVisible}
            sx={{
              width: 300,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: { width: 300, boxSizing: 'border-box' },
            }}
          >
            <Toolbar>
              <Button onClick={toggleDrawerVisibility} sx={{ ml: 'auto' }}>
                Kapat
              </Button>
            </Toolbar>
            <Box sx={{ overflow: 'auto', padding: 2 }}>
              <Typography variant="h6">Sohbet</Typography>
              <Box sx={{ maxHeight: '70vh', overflowY: 'auto', mb: 2 }}>
                {chatMessages.map((message, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {message.username}:
                    </Typography>
                    <Typography variant="body2">{message.text}</Typography>
                  </Box>
                ))}
              </Box>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Mesaj yaz..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 1 }}
                onClick={handleSendMessage}
              >
                Gönder
              </Button>
            </Box>
          </Drawer>
        )}
        {                             }
        <Box sx={{ flexGrow: 1 }}>
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
              <Typography variant="body1" sx={{ mr: 2 }}>
                Hoş geldiniz, {username || 'Kullanıcı'}!
              </Typography>
              <Button onClick={toggleDrawerVisibility}>
                {drawerVisible ? 'Sohbeti Gizle' : 'Sohbeti Göster'}
              </Button>
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
                src={avatar}
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
                lobbies.map(([code, lobby]) => (
                  <ListItem
                    key={code}
                    button
                    onClick={() =>
                      currentLobby?.name === lobby.name
                        ? handleLeaveLobby(code) 
                        : handleJoinDialogOpen([code, lobby]) 
                    }
                    sx={{
                      backgroundColor: currentLobby?.name === lobby.name ? 'lightgreen' : 'inherit',
                    }}
                  >
                    <ListItemText
                      primary={lobby.name}
                      secondary={
                        currentLobby?.name === lobby.name
                          ? `Katılımcılar: ${lobby.participants?.length || 0}`
                          : null
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
                backgroundImage: `url(${hoveredGame.image})`,
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
                    onMouseLeave={() => setHoveredGame(gamesWithBackgroundEffect[0])}
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
        </Box>
      </Box>
    </AppTheme>
  );
}
