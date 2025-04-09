import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import GameDetails from './GameDetails'; 
import GamePage from './GamePage'; 
import { CssBaseline } from '@mui/material';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/game-details/:gameId" element={<GameDetails />} /> 
        <Route path="/game" element={<GamePage />} /> {}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
