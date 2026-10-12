import { Router } from 'express';
import categoryController from '../../controllers/categoryController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { createCategorySchema, updateCategorySchema } from '../../validators/schemas.js';

const router = Router();

// Public: List categories & get single category
router.get('/', categoryController.listCategories);
router.get('/:slug', categoryController.getCategory);

// Privileged: Create, Update, Delete (Super Admin & Editor only)
router.post('/', authenticateToken, requireRoles('super_admin', 'editor'), validateRequest({ body: createCategorySchema }), categoryController.createCategory);
router.put('/:id', authenticateToken, requireRoles('super_admin', 'editor'), validateRequest({ body: updateCategorySchema }), categoryController.updateCategory);
router.delete('/:id', authenticateToken, requireRoles('super_admin', 'editor'), categoryController.deleteCategory);

export default router;
