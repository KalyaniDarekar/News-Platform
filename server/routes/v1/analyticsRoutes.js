import { Router } from 'express';
import analyticsController from '../../controllers/analyticsController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { trackPageViewSchema } from '../../validators/schemas.js';

const router = Router();

// Public first-party telemetry tracking
router.post('/track', validateRequest({ body: trackPageViewSchema }), analyticsController.trackPageView);

// Newsroom staff dashboard telemetry
router.get('/overview', authenticateToken, requireRoles('super_admin', 'editor', 'ad_manager'), analyticsController.getOverview);
router.get('/dashboard', authenticateToken, requireRoles('super_admin', 'editor', 'ad_manager'), analyticsController.getDashboard);

export default router;
