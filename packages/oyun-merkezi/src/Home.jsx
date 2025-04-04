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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';

export default function Home() {
  const navigate = useNavigate();
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [anchorElLobbies, setAnchorElLobbies] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lobbyName, setLobbyName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [lobbies, setLobbies] = useState([]);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinLobbyCode, setJoinLobbyCode] = useState('');
  const [currentLobby, setCurrentLobby] = useState(null);
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

  const handleLobbiesClick = (event) => {
    setAnchorElLobbies(event.currentTarget);
  };

  const handleLobbiesClose = () => {
    setAnchorElLobbies(null);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
    setAnchorElLobbies(null);
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
        alert(data.error || 'Lobi oluşturulamadı.');
        return;
      }
      setLobbyCode(data.lobbyCode);
      fetchLobbies();
    } catch (error) {
      alert('Sunucuya bağlanırken bir hata oluştu.');
    }
  };

  const fetchLobbies = async () => {
    try {
      const response = await fetch('http://localhost:3003/lobbies');
      const data = await response.json();
      setLobbies(Object.entries(data));
    } catch (error) {
      alert('Lobiler alınırken bir hata oluştu.');
    }
  };

  const handleJoinDialogOpen = () => {
    setJoinDialogOpen(true);
    setAnchorElLobbies(null);
  };

  const handleJoinDialogClose = () => {
    setJoinDialogOpen(false);
    setJoinLobbyCode('');
  };

  const handleJoinLobby = () => {
    const lobby = lobbies.find(([code]) => code === joinLobbyCode);
    if (lobby) {
      setCurrentLobby(lobby);
      alert(`Lobiye katıldınız: ${lobby[1].name}`);
      handleJoinDialogClose();
    } else {
      alert('Geçersiz lobi kodu.');
    }
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
              <MenuItem onClick={handleDialogOpen}>Yeni Lobi Oluştur</MenuItem>
              <MenuItem onClick={handleJoinDialogOpen}>Lobiye Katıl</MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
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
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h1>Hoş Geldiniz!</h1>
          {currentLobby ? (
            <p>Şu anda {currentLobby[1].name} adlı lobiye katıldınız.</p>
          ) : (
            <p>Bu sayfa yalnızca giriş yapmış kullanıcılar tarafından görüntülenebilir.</p>
          )}
          <List>
            {lobbies.map(([code, lobby]) => (
              <ListItem key={code}>
                <ListItemText primary={lobby.name} secondary={`Kod: ${code}`} />
              </ListItem>
            ))}
          </List>
        </div>
      </div>
    </AppTheme>
  );
}
