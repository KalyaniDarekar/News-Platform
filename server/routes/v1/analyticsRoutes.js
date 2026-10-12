import { Router } from 'express';
import analyticsController from '../../controllers/analyticsController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';

const router = Router();

// Newsroom staff dashboard telemetry
router.get('/dashboard', authenticateToken, requireRoles('super_admin', 'editor', 'ad_manager'), analyticsController.getDashboard);

export default router;
