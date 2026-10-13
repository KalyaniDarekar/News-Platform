// ========================================================================
// Dashboard Routes — Phase 3
// All routes require authentication. Role restrictions applied per endpoint.
// ========================================================================

import { Router } from 'express';
import dashboardController from '../../controllers/dashboardController.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';

const router = Router();

// Full dashboard stats (editors, super_admin — not reporters or ad_managers)
// GET /api/v1/dashboard/stats
router.get(
  '/stats',
  requireRoles('super_admin', 'editor'),
  dashboardController.getStats
);

// Lightweight quick-counts for sidebar/polling
// GET /api/v1/dashboard/counts
// Reporters can access to see their own pending/draft counts shown in the sidebar
router.get(
  '/counts',
  dashboardController.getQuickCounts
);

export default router;
