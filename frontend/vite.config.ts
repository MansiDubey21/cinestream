import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In dev, forward /api calls to the Spring Boot backend (no CORS hassle)
    proxy: { '/api': 'http://localhost:8080' },
  },
});
