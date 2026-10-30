import { Router } from 'express';
import advertiserEnquiryController from '../../controllers/advertiserEnquiryController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { createEnquirySchema, updateEnquiryStatusSchema } from '../../validators/schemas.js';

const router = Router();

// Public lead submission
router.post(
  '/',
  validateRequest({ body: createEnquirySchema }),
  advertiserEnquiryController.submitEnquiry
);

// Admin CMS CRM lead management
router.get(
  '/',
  authenticateToken,
  requireRoles('super_admin', 'ad_manager', 'editor'),
  advertiserEnquiryController.listEnquiries
);

router.patch(
  '/:id/status',
  authenticateToken,
  requireRoles('super_admin', 'ad_manager', 'editor'),
  validateRequest({ body: updateEnquiryStatusSchema }),
  advertiserEnquiryController.updateStatus
);

router.delete(
  '/:id',
  authenticateToken,
  requireRoles('super_admin', 'ad_manager', 'editor'),
  advertiserEnquiryController.deleteEnquiry
);

export default router;
