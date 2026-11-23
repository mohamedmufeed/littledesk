import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ENV } from './config/env.js';
import { getDbStatus } from './config/db.js';
import { authRouter } from './routes/authRoutes.js';
import { noteRouter } from './routes/noteRoutes.js';
import { taskRouter } from './routes/taskRoutes.js';
import { bookmarkRouter } from './routes/bookmarkRoutes.js';
import { settingsRouter } from './routes/settingsRoutes.js';
import { syncRouter } from './routes/syncRoutes.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';

export function createServer() {
  const app = express();

  // Basic security and parsing
  app.use(helmet());
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json({ limit: '5mb' }));

  // General rate limiter
  app.use('/api', apiRateLimiter);

  // Health and status endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      database: getDbStatus() ? 'connected' : 'in-memory-fallback',
      timestamp: new Date().toISOString(),
      service: 'LittleDesk Cloud Sync API',
    });
  });

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/notes', noteRouter);
  app.use('/api/tasks', taskRouter);
  app.use('/api/bookmarks', bookmarkRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/sync', syncRouter);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
  });

  return app;
}
