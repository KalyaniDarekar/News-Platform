import { Router } from 'express';
import adController from '../../controllers/adController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { createCampaignSchema } from '../../validators/schemas.js';

const router = Router();

// Public: Fetch active ad for placement slot & record click
router.get('/active/:placementCode', adController.getActiveAd);
router.post('/:id/click', adController.recordClick);

// Staff / Ad Operations: Placements and Campaigns
router.get('/placements', authenticateToken, adController.listPlacements);
router.get('/campaigns', authenticateToken, requireRoles('super_admin', 'ad_manager'), adController.listCampaigns);
router.post('/campaigns', authenticateToken, requireRoles('super_admin', 'ad_manager'), validateRequest({ body: createCampaignSchema }), adController.createCampaign);
router.patch('/campaigns/:id/toggle', authenticateToken, requireRoles('super_admin', 'ad_manager'), adController.toggleCampaign);

export default router;
