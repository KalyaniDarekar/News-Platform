import { Router } from 'express';
import auditController from '../../controllers/auditController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';

const router = Router();

// Super Admin & Editor audit trail inquiry
router.get('/', authenticateToken, requireRoles('super_admin', 'editor'), auditController.listLogs);

export default router;
