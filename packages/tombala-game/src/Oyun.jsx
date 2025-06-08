import React, { useState } from 'react';
import { Box, Fade, Slide, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logo from '../logo5.png';
import ModeSelector from '../components/ModeSelector';
import KlasikTombala from '../components/KlasikTombala';
import IlkKapanin from '../components/IlkKapanin';
import IlkKapaninLobby from '../components/IlkKapaninLobby';

export default function Oyun() {
  const [gameMode, setGameMode] = useState(null);
  const [playType, setPlayType] = useState(null);
  const [showGame, setShowGame] = useState(false);
  const navigate = useNavigate();

  const isReady = gameMode && playType;

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
              pt: { xs: 0, md: 0 },
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
                marginTop: '-80px',
              }}
            />
          </Box>
        </Slide>

        {showGame && (
          <Box
            sx={{
              width: '100%',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              zIndex: 1,
              pt: { xs: '150px', md: '220px' },
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            <Box
              sx={{
                maxWidth: 700,
                background: 'linear-gradient(90deg, #fffde4 0%, #f7f7f7 100%)',
                border: '2px solid #2e7d32',
                borderRadius: 3,
                p: 3,
                mb: 3,
                mt: 1,
                boxShadow: '0 2px 12px rgba(44, 62, 80, 0.08)',
                fontFamily: "'Schoolbell', cursive",
                color: '#333',
                textAlign: 'left',
              }}
            >
              <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Schoolbell&display=swap');`}
              </style>
              <Typography variant="h6" sx={{ fontFamily: "'Schoolbell', cursive", fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                🎲 Oyun Kuralları
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Her oyuncunun kartında <b>15 sayı</b> var. Her turda sırayla <b>3 kutu</b> açılır. Botlar da sıraya girer, kimseye torpil yok!
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Kartındaki <b>yıldızlı</b> sayıyı kendi açarsan <b>100 puan</b> kaparsın. Diğer sayılar ise <b>50 puan</b> değerinde.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - <b>54</b> sayısı ise tam bir sürpriz yumurta! Kartında 54 varsa ve <b>kendin açarsan</b> <b>100 puan</b> ekstra gelir. Ama başkası açarsa <b>100 puan</b> gider, dikkat!
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Kartındaki 54 çıkana kadar <b>simsiyah</b> durur, bulursan aydınlanır!
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Kartında olan bir sayıyı başka biri açarsa, o sayı <b>gri</b> olur ve bir daha çıkmaz.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Oyun sırasında hangi turda olduğun ekranın altında yazar.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Her <b>3 turun</b> sonunda en düşük puanlı yarışmacıya <b>joker</b> hakkı çıkar. Beraberlik varsa, beraberlik bozulana kadar joker hakkı verilmez.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Jokerler: <b>🤫 Sustur</b> (bir rakibini 1 tur sustur), <b>🚀 3X</b> (bir sonraki turda puanın 3 katı), <b>💡 İpucu</b> (bir sayının hangi kartta olduğunu öğren).
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Joker seçimi yapılmadan oyun devam etmez. Sustur jokerinde rakip seçimi zorunludur.
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, fontFamily: "'Schoolbell', cursive" }}>
                - Oyun sonunda en yüksek puanı toplayan kazanır. Beraberlikte herkes kazandı sayılır, çünkü hayat kısa!
              </Typography>
              <Typography variant="body2" sx={{ color: '#888', mt: 1, fontFamily: "'Schoolbell', cursive" }}>
                Bol şans! Unutma, botlar duygusuzdur ama şans bazen insanı sever.
              </Typography>
            </Box>
            {gameMode === 'klasik' && playType && (
              <KlasikTombala playType={playType} />
            )}
            {gameMode === 'ilkKapanin' && playType && (
              playType === 'lobby' ? (
                <IlkKapaninLobby />
              ) : (
                <IlkKapanin playType={playType} />
              )
            )}
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