import { Router } from 'express';
import settingsController from '../../controllers/settingsController.js';
import { authenticateToken, optionalAuth } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { updateSettingSchema } from '../../validators/schemas.js';

const router = Router();

// Public: Get public site settings (masthead, tagline, contact)
// Staff: Returns complete settings
router.get('/', optionalAuth, settingsController.getSettings);

// Super Admin: Update site setting
router.put('/:key', authenticateToken, requireRoles('super_admin'), validateRequest({ body: updateSettingSchema }), settingsController.updateSetting);

export default router;
