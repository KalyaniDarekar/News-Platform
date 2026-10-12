import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { checkDbConnection } from './config/database.js';
import articlesRouter from './routes/articles.js';
import categoriesRouter from './routes/categories.js';
import adsRouter from './routes/ads.js';
import authRouter from './routes/auth.js';

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
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Static uploads directory (for media library in cPanel/local)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Healthcheck & System Status Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.json({
    status: 'online',
    platform: 'The Bharat Chronicle Digital Publishing Platform',
    version: '1.0.0-phase1',
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    database: dbStatus
  });
});

// Mount Routes
app.use('/api/articles', articlesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/ads', adsRouter);
app.use('/api/auth', authRouter);

// Fallback 404 for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

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
