import React from 'react';
import { Box, Button } from '@mui/material';

export default function ModeSelector({ gameMode, setGameMode, playType, setPlayType, onLobbyNavigate }) {
  const handleLobbyPlay = () => {
    setPlayType('lobby');
    if (onLobbyNavigate) {
      onLobbyNavigate(gameMode);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant={gameMode === 'klasik' ? 'contained' : 'outlined'}
          color="primary"
          onClick={() => { setGameMode('klasik'); setPlayType(null); }}
          sx={{ fontWeight: 'bold', fontFamily: 'Underdog, sans-serif' }}
        >
          Klasik Tombala
        </Button>
        <Button
          variant={gameMode === 'ilkKapanin' ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => { setGameMode('ilkKapanin'); setPlayType(null); }}
          sx={{ fontWeight: 'bold', fontFamily: 'Underdog, sans-serif' }}
        >
          İlk Kapanın
        </Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant={playType === 'bot' ? 'contained' : 'outlined'}
          color="success"
          disabled={!gameMode}
          onClick={() => setPlayType('bot')}
          sx={{ fontWeight: 'bold', fontFamily: 'Underdog, sans-serif' }}
        >
          Bot ile Oyna
        </Button>
        <Button
          variant={playType === 'lobby' ? 'contained' : 'outlined'}
          color="info"
          disabled={!gameMode}
          onClick={handleLobbyPlay}
          sx={{ fontWeight: 'bold', fontFamily: 'Underdog, sans-serif' }}
        >
          Lobi ile Oyna
        </Button>
      </Box>
    </Box>
  );
}