import { Router } from 'express';
import tagController from '../../controllers/tagController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { createTagSchema } from '../../validators/schemas.js';

const router = Router();

// Public: List tags
router.get('/', tagController.listTags);

// Privileged: Create tag (Staff only)
router.post('/', authenticateToken, requireRoles('super_admin', 'editor', 'reporter'), validateRequest({ body: createTagSchema }), tagController.createTag);

export default router;
