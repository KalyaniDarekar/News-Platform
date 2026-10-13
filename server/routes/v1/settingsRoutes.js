import { Router } from 'express';
import settingsController from '../../controllers/settingsController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { updateSettingSchema, batchUpdateSettingsSchema } from '../../validators/schemas.js';

const router = Router();

// Public integration settings
router.get('/public', settingsController.getPublicSettings);

// General settings (authenticated staff or public fields)
router.get('/', settingsController.getSettings);

// Batch update settings (Super Admin only)
router.put(
  '/batch',
  authenticateToken,
  requireRoles('super_admin'),
  validateRequest({ body: batchUpdateSettingsSchema }),
  settingsController.updateBatch
);

// Single key update
router.put(
  '/:key',
  authenticateToken,
  requireRoles('super_admin'),
  validateRequest({ body: updateSettingSchema }),
  settingsController.updateSetting
);

export default router;
