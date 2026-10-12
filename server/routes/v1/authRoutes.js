import { Router } from 'express';
import authController from '../../controllers/authController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import validateRequest from '../../middleware/validationMiddleware.js';
import { authRateLimiter } from '../../middleware/rateLimitMiddleware.js';
import { loginSchema, changePasswordSchema, createUserSchema } from '../../validators/schemas.js';

const router = Router();

// Public login (rate limited)
router.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), authController.login);
router.post('/logout', authController.logout);

// Protected authenticated routes
router.get('/me', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, validateRequest({ body: changePasswordSchema }), authController.changePassword);

// Super Admin user management
router.get('/users', authenticateToken, requireRoles('super_admin'), authController.listUsers);
router.post('/users', authenticateToken, requireRoles('super_admin'), validateRequest({ body: createUserSchema }), authController.createUser);

export default router;
