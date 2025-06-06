import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['domaintoyotaa.onrender.com'],
    host: true, // Tüm ağ arayüzlerinden erişilebilir hale getirir
    port: 3000, // İstediğiniz bir port numarası
  },
});