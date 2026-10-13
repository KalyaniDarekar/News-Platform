import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { checkDbConnection } from './config/database.js';
import apiRouter from './routes/api.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin or any localhost / 127.0.0.1 port (5173, 5174, etc.)
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) || (CLIENT_URL && origin === CLIENT_URL)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static uploads directory (for media library in cPanel/local)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Healthcheck & System Status Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.json({
    status: 'online',
    platform: 'The Bharat Chronicle Digital Publishing Platform',
    version: '2.0.0-phase2',
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    database: dbStatus
  });
});

// Apply rate limiter to all API endpoints
app.use('/api', apiRateLimiter);

// Mount Versioned API Routes (/api/v1/* and backwards compatible /api/*)
app.use('/api', apiRouter);

// Fallback 404 for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API route ${req.method} ${req.path} not found.`
    }
  });
});

// Centralized Error Handling Middleware (must be after routes)
app.use(errorHandler);

// If deployed on cPanel with combined client dist
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  const indexFile = path.join(clientDistPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.json({
        message: 'The Bharat Chronicle API server running. Launch client with "npm run client:dev" or build client with "npm run client:build".'
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  The Bharat Chronicle API Service`);
  console.log(`  Active Port: ${PORT}`);
  console.log(`  Target Client URL: ${CLIENT_URL}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

export default app;
