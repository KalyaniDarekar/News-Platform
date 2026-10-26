import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { checkDbConnection, query } from './config/database.js';
import apiRouter from './routes/api.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import seoService from './services/seoService.js';
import { syncProductionDatabase } from './database/sync_production.js';
import analyticsService from './services/analyticsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'https://news-platform-chi-lovat.vercel.app';

// Security & Utility Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin, any localhost, or Vercel origins
    if (
      !origin ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      (CLIENT_URL && origin === CLIENT_URL) ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Static uploads directory & database-backed fallback (for media library persistence)
const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, 'uploads');

app.use('/uploads', async (req, res, next) => {
  // Normalize request path
  const normalizedPath = req.path.replace(/^\/+/, '');
  const reqFilePath = path.join(uploadDir, normalizedPath);

  // 1. If file exists on local disk, serve it immediately with cache header
  if (fs.existsSync(reqFilePath) && fs.statSync(reqFilePath).isFile()) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.sendFile(reqFilePath);
  }

  // 2. If missing from disk (e.g. Render container restart), fetch from MySQL media_assets!
  try {
    const filename = path.basename(req.path);
    const cleanUrl = `/uploads/${normalizedPath.replace(/\\/g, '/')}`;
    const rows = await query(
      'SELECT file_data, mime_type FROM media_assets WHERE filename = ? OR file_url = ? LIMIT 1',
      [filename, cleanUrl]
    );

    if (rows && rows.length > 0 && rows[0].file_data) {
      // Re-cache to local disk for fast subsequent reads
      try {
        fs.mkdirSync(path.dirname(reqFilePath), { recursive: true });
        fs.writeFileSync(reqFilePath, rows[0].file_data);
      } catch (cacheErr) {
        console.warn('[Upload Cache Warning] Could not cache to local disk:', cacheErr.message);
      }

      res.setHeader('Content-Type', rows[0].mime_type || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(rows[0].file_data);
    }
  } catch (err) {
    console.error('[Upload Fetch Error]', err.message);
  }

  // 3. File not found anywhere: send clean 404, prevent fallback SPA HTML / 200 JSON
  res.status(404).setHeader('Content-Type', 'text/plain').send('Media asset not found');
});

// Healthcheck & System Status Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await checkDbConnection();
  res.json({
    status: 'online',
    platform: 'JANTA JOURNAL Digital Publishing Platform',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    database: dbStatus
  });
});

// Auto-sync database schema & production accounts on startup
syncProductionDatabase().then(() => {
  analyticsService.initVisitorCounter().catch(err => {
    console.warn('[Visitor Counter Init Notice]', err.message);
  });
}).catch(err => {
  console.warn('[DB Sync Notice]', err.message);
  analyticsService.initVisitorCounter().catch(() => {});
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
  if (req.url.startsWith('/api') || req.url.startsWith('/uploads')) return next();
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
