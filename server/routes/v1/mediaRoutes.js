import { Router } from 'express';
import mediaController from '../../controllers/mediaController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';

const router = Router();

// Staff: List media assets
router.get('/', authenticateToken, mediaController.listMedia);

// Staff: Register asset metadata
router.post('/', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), mediaController.registerMedia);

// Staff: Delete asset
router.delete('/:id', authenticateToken, requireRoles('super_admin', 'editor'), mediaController.deleteMedia);

export default router;
