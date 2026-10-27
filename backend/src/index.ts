import { createApp } from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CineWave Backend] Server running on http://0.0.0.0:${PORT}`);
  console.log(`[CineWave Backend] API Health: http://localhost:${PORT}/api/v1/health`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('[CineWave Backend] Shutting down gracefully...');
  server.close(() => {
    console.log('[CineWave Backend] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
