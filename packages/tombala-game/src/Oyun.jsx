import React, { useState } from 'react';
import { Box, Fade, Slide, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../logo5.png';
import ModeSelector from '../components/ModeSelector';
import KlasikTombala from '../components/KlasikTombala';
import IlkKapanin from '../components/IlkKapanin';

export default function Oyun() {
  const [gameMode, setGameMode] = useState(null);
  const [playType, setPlayType] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const navigate = useNavigate();

  // İki buton seçildiyse devam et butonu gelsin
  const isReady = gameMode && playType;

  // Logo boyutları
  const logoBig = 700;
  const logoSmall = 240;

  return (
    <Fade in={true} timeout={1000}>
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          minHeight: '100vh',
          backgroundColor: '#b2ff59',
          overflow: 'hidden',
        }}
      >
        {/* Her zaman üstte görünen Ana Sayfaya Dön butonu */}
        <Box sx={{ position: 'fixed', top: 24, left: 24, zIndex: 1000 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/home')}
            sx={{
              fontFamily: 'Underdog, sans-serif',
              fontWeight: 'bold',
              padding: '10px 20px',
              minWidth: 140,
              borderColor: '#2e7d32',
              color: '#fff',
              backgroundColor: '#2e7d32',
              '&:hover': {
                backgroundColor: '#388e3c',
                color: '#fff',
              },
            }}
          >
            Ana Sayfaya Dön
          </Button>
        </Box>

        {/* Oyun modları ve oynama tipi butonları sadece showGame false iken ortada göster */}
        {!showGame && (
          <Box
            sx={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1000,
            }}
          >
            {/* Logo ve butonlar alt alta */}
            <Box sx={{ mb: 1 }}>
              <img
                src={logo}
                alt="Tombala Logo"
                style={{
                  width: logoBig,
                  height: logoBig,
                  objectFit: 'contain',
                  transition: 'all 0.7s cubic-bezier(.4,2,.6,1)',
                  pointerEvents: 'none',
                  display: 'block',
                }}
              />
            </Box>
            <ModeSelector
              gameMode={gameMode}
              setGameMode={setGameMode}
              playType={playType}
              setPlayType={setPlayType}
            />
            {isReady && (
              <Button
                variant="contained"
                color="success"
                sx={{
                  fontFamily: 'Underdog, sans-serif',
                  fontWeight: 'bold',
                  fontSize: 20,
                  mt: 2,
                  px: 5,
                  py: 1.5,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                }}
                onClick={() => setShowGame(true)}
              >
                Devam Et
              </Button>
            )}
          </Box>
        )}

         {/* Logo - sadece showGame true iken animasyonlu ve yukarıda göster */}
        <Slide direction="up" in={showGame} mountOnEnter unmountOnExit>
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: logoSmall,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              zIndex: 2000,
              pointerEvents: 'none',
              transition: 'all 0.7s cubic-bezier(.4,2,.6,1)',
            }}
          >
            <img
              src={logo}
              alt="Tombala Logo"
              style={{               
                width: logoSmall,
                height: logoSmall,
                objectFit: 'contain',
                transition: 'all 0.7s cubic-bezier(.4,2,.6,1)',
                pointerEvents: 'none',
                display: 'block',
              }}
            />
          </Box>
        </Slide>

   {/* Oyun ekranı sadece showGame true olunca ve ortada göster */}
        {showGame && (
          <Box
            sx={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            {gameMode === 'klasik' && playType && (
              <KlasikTombala playType={playType} />
            )}
            {gameMode === 'ilkKapanin' && playType && (
              <IlkKapanin playType={playType} />
            )}
            {/* Yeni Oyun Butonu */}
            <Button
              variant="contained"
              color="secondary"
              sx={{
                mt: 4,
                fontFamily: 'Underdog, sans-serif',
                fontWeight: 'bold',
                fontSize: 18,
                px: 4,
                py: 1.2,
                boxShadow: '0 4px 8px rgba(0,0,0,0.10)',
              }}
              onClick={() => {
                setShowGame(false);
                setGameMode(null);
                setPlayType(null);
              }}
            >
              Yeni Oyun
            </Button>
          </Box>
        
        )}
      </Box>
    </Fade>
  );
}