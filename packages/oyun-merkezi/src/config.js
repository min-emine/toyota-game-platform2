// API ve WebSocket URL konfigürasyonu
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3003' 
  : window.location.origin;

export const WS_URL = isDevelopment 
  ? 'ws://localhost:3003' 
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`;
