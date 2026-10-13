import { Router } from 'express';
import articleController from '../../controllers/articleController.js';
import { authenticateToken, optionalAuth } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { createArticleSchema, updateArticleSchema } from '../../validators/schemas.js';

const router = Router();

// -----------------------------------------------------------------------
// Public / Staff: List articles
// optionalAuth → anonymous users get 'published' only;
//               authenticated staff can filter by status (draft, scheduled,
//               expired, in_review, archived, all)
// -----------------------------------------------------------------------
router.get('/', optionalAuth, articleController.listArticles);

// -----------------------------------------------------------------------
// cPanel Cron job endpoint — auto-publish scheduled + auto-expire articles
// Protected by CRON_SECRET env variable (set same value in cPanel cron cmd)
// Usage from cPanel: curl -s -X POST http://yourdomain.com/api/v1/articles/cron/publish \
//                        -H "x-cron-secret: YOUR_SECRET"
// -----------------------------------------------------------------------
router.post('/cron/publish', (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET;
  // If CRON_SECRET is configured, validate it; otherwise allow (dev mode)
  if (cronSecret && req.headers['x-cron-secret'] !== cronSecret) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Invalid or missing cron secret' }
    });
  }
  next();
}, articleController.processCron);

// -----------------------------------------------------------------------
// Public: Quick editorial feeds (MUST be mounted before /:slug)
// -----------------------------------------------------------------------
router.get('/breaking', (req, res, next) => {
  req.query.isBreaking = 'true';
  req.query.limit = req.query.limit || '8';
  return articleController.listArticles(req, res, next);
});

router.get('/trending', (req, res, next) => {
  req.query.sort = 'views';
  req.query.order = 'desc';
  req.query.limit = req.query.limit || '5';
  return articleController.listArticles(req, res, next);
});

router.get('/featured', (req, res, next) => {
  req.query.isFeatured = 'true';
  req.query.limit = req.query.limit || '6';
  return articleController.listArticles(req, res, next);
});

router.get('/videos', (req, res, next) => {
  req.query.hasVideo = 'true';
  req.query.limit = req.query.limit || '10';
  return articleController.listArticles(req, res, next);
});

// -----------------------------------------------------------------------
// Admin: Get single article by NUMERIC ID (for edit page load)
// MUST be declared before /:slug to prevent Express matching 'id' as a slug
// -----------------------------------------------------------------------
router.get('/id/:id', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), articleController.getArticleById);

// -----------------------------------------------------------------------
// Public: Get related articles for article slug
// -----------------------------------------------------------------------
router.get('/:slug/related', articleController.getRelatedArticles);

// -----------------------------------------------------------------------
// Public / Staff: Get single article by slug
// -----------------------------------------------------------------------
router.get('/:slug', optionalAuth, articleController.getArticle);

// -----------------------------------------------------------------------
// Staff: Revision history (editor+ only)
// -----------------------------------------------------------------------
router.get('/:id/revisions', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), articleController.getRevisions);

// -----------------------------------------------------------------------
// Staff: Create article (reporter, editor, super_admin)
// -----------------------------------------------------------------------
router.post('/', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), validateRequest({ body: createArticleSchema }), articleController.createArticle);

// -----------------------------------------------------------------------
// Staff: Update article (reporters can only update their own)
// -----------------------------------------------------------------------
router.put('/:id', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), validateRequest({ body: updateArticleSchema }), articleController.updateArticle);

// -----------------------------------------------------------------------
// Staff: Soft-archive article (editor and super_admin only)
// -----------------------------------------------------------------------
router.delete('/:id', authenticateToken, requireRoles('super_admin', 'editor'), articleController.deleteArticle);

export default router;
