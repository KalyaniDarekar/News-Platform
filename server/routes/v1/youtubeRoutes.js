import { Router } from 'express';
import youtubeController from '../../controllers/youtubeController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { createYoutubeVideoSchema, updateYoutubeVideoSchema } from '../../validators/schemas.js';

const router = Router();

// Public endpoints
router.get('/', youtubeController.listVideos);
router.get('/featured', youtubeController.getFeaturedVideo);

// Admin CMS endpoints
router.post(
  '/',
  authenticateToken,
  requireRoles('super_admin', 'editor', 'reporter'),
  validateRequest({ body: createYoutubeVideoSchema }),
  youtubeController.createVideo
);

router.put(
  '/:id',
  authenticateToken,
  requireRoles('super_admin', 'editor'),
  validateRequest({ body: updateYoutubeVideoSchema }),
  youtubeController.updateVideo
);

router.delete(
  '/:id',
  authenticateToken,
  requireRoles('super_admin', 'editor'),
  youtubeController.deleteVideo
);

export default router;
