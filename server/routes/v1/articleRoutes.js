import { Router } from 'express';
import articleController from '../../controllers/articleController.js';
import { authenticateToken, optionalAuth } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { createArticleSchema, updateArticleSchema } from '../../validators/schemas.js';

const router = Router();

// Public / Staff Article Listing (supports optionalAuth so staff can see drafts with status filter)
router.get('/', optionalAuth, articleController.listArticles);

// cPanel Cron job automated release endpoint
router.post('/cron/publish', articleController.processCron);

// Single article by slug (optionalAuth so staff can preview unpublished drafts)
router.get('/:slug', optionalAuth, articleController.getArticle);

// Article Revisions history (Requires staff authentication)
router.get('/:id/revisions', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), articleController.getRevisions);

// Create new article (Super Admin, Editor, Reporter)
router.post('/', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), validateRequest({ body: createArticleSchema }), articleController.createArticle);

// Update article (Super Admin, Editor, or Reporter for own draft)
router.put('/:id', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), validateRequest({ body: updateArticleSchema }), articleController.updateArticle);

// Delete / Archive article (Super Admin or Editor only)
router.delete('/:id', authenticateToken, requireRoles('super_admin', 'editor'), articleController.deleteArticle);

export default router;
