import { Router } from 'express';
import adController from '../../controllers/adController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { createCampaignSchema, updateCampaignSchema } from '../../validators/schemas.js';

const router = Router();

// Public: Fetch active ad for placement slot & record telemetry
router.get('/directory', adController.getPublicAdDirectory);
router.get('/active/:placementCode', adController.getActiveAd);
router.get('/marquee/:slot', adController.getMarqueeAds);
router.post('/:id/impression', adController.recordImpression);
router.post('/:id/click', adController.recordClick);

// Placements list (public or authenticated)
router.get('/placements', adController.listPlacements);

// Staff / Ad Operations: Campaigns CRUD
router.get(
  '/campaigns',
  authenticateToken,
  requireRoles('super_admin', 'editor', 'ad_manager'),
  adController.listCampaigns
);

router.post(
  '/campaigns',
  authenticateToken,
  requireRoles('super_admin', 'editor', 'ad_manager'),
  validateRequest({ body: createCampaignSchema }),
  adController.createCampaign
);

router.put(
  '/campaigns/:id',
  authenticateToken,
  requireRoles('super_admin', 'editor', 'ad_manager'),
  validateRequest({ body: updateCampaignSchema }),
  adController.updateCampaign
);

router.delete(
  '/campaigns/:id',
  authenticateToken,
  requireRoles('super_admin', 'editor', 'ad_manager'),
  adController.deleteCampaign
);

router.patch(
  '/campaigns/:id/toggle',
  authenticateToken,
  requireRoles('super_admin', 'editor', 'ad_manager'),
  adController.toggleCampaign
);

export default router;
