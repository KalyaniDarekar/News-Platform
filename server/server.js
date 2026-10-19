import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { checkDbConnection } from './config/database.js';
import apiRouter from './routes/api.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import seoService from './services/seoService.js';

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
    platform: 'JANTA JOURNAL Digital Publishing Platform',
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

// ---- Public SEO, Sitemap, RSS & Robots Endpoints ----
app.get('/sitemap.xml', async (req, res, next) => {
  try {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    const baseUrl = CLIENT_URL || `${protocol}://${host}`;
    const xml = await seoService.generateSitemapXml(baseUrl);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

app.get(['/rss.xml', '/feed.xml'], async (req, res, next) => {
  try {
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    const baseUrl = CLIENT_URL || `${protocol}://${host}`;
    const xml = await seoService.generateRssXml(baseUrl);
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

app.get('/robots.txt', (req, res) => {
  const protocol = req.protocol || 'http';
  const host = req.get('host') || `localhost:${PORT}`;
  const baseUrl = CLIENT_URL || `${protocol}://${host}`;
  const content = seoService.getRobotsTxt(baseUrl);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(content);
});

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

// Server-side prerender / meta-tag injection for public article pages
app.get('/article/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `localhost:${PORT}`;
    const baseUrl = CLIENT_URL || `${protocol}://${host}`;

    let templatePath = path.join(clientDistPath, 'index.html');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(__dirname, '../client/index.html');
    }

    let templateHtml = '<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>';
    if (fs.existsSync(templatePath)) {
      templateHtml = fs.readFileSync(templatePath, 'utf8');
    }

    const result = await seoService.prerenderArticleHtml(slug, baseUrl, templateHtml);
    if (result.notFound) {
      return res.status(404).send(
        templateHtml.replace('<title>', '<title>404 Dispatch Not Found | ').replace(
          '<div id="root"></div>',
          `<div style="font-family:sans-serif;padding:3rem;text-align:center;"><h2>Dispatch Not Found or Expired</h2><p>The requested article is no longer available or was not found in our public archives.</p><a href="/">Return to Newsroom Home</a></div>`
        )
      );
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(result.html);
  } catch (err) {
    next(err);
  }
});
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  const indexFile = path.join(clientDistPath, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      res.json({
        message: 'JANTA JOURNAL API server running. Launch client with "npm run client:dev" or build client with "npm run client:build".'
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  JANTA JOURNAL API Service`);
  console.log(`  Active Port: ${PORT}`);
  console.log(`  Target Client URL: ${CLIENT_URL}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});

export default app;
