import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  app.use(express.json());

  // Mount API (support both /api/v1 and /api)
  app.use('/api/v1', apiRoutes);
  app.use('/api', apiRoutes);

  // Fallback root health check
  app.get('/', (req, res) => {
    res.json({
      name: 'CineWave TV Backend API',
      status: 'active',
      docs: '/api/v1/health'
    });
  });

  return app;
}
