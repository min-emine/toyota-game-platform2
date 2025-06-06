import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import GameDetails from './GameDetails';  
import { CssBaseline } from '@mui/material';
import Oyun from '../../tombala-game/src/Oyun';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/game-details/:gameId" element={<GameDetails />} /> 
        <Route path="/tombala-game/oyun" element={<Oyun />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
