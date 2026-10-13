// ========================================================================
// The Bharat Chronicle — Master Versioned API Router (/api/v1)
// ========================================================================

import { Router } from 'express';
import authRoutes from './v1/authRoutes.js';
import articleRoutes from './v1/articleRoutes.js';
import categoryRoutes from './v1/categoryRoutes.js';
import tagRoutes from './v1/tagRoutes.js';
import adRoutes from './v1/adRoutes.js';
import mediaRoutes from './v1/mediaRoutes.js';
import analyticsRoutes from './v1/analyticsRoutes.js';
import auditRoutes from './v1/auditRoutes.js';
import settingsRoutes from './v1/settingsRoutes.js';
import dashboardRoutes from './v1/dashboardRoutes.js';         // Phase 3
import { authenticateToken } from '../middleware/authMiddleware.js'; // Phase 3

const router = Router();

// ---- Version 1 API Routes ----
router.use('/v1/auth', authRoutes);
router.use('/v1/articles', articleRoutes);
router.use('/v1/categories', categoryRoutes);
router.use('/v1/tags', tagRoutes);
router.use('/v1/ads', adRoutes);
router.use('/v1/media', mediaRoutes);
router.use('/v1/analytics', analyticsRoutes);
router.use('/v1/audit-logs', auditRoutes);
router.use('/v1/settings', settingsRoutes);

// Dashboard is admin-only — authenticateToken applied at mount level
// so every /v1/dashboard/* route requires a valid JWT
router.use('/v1/dashboard', authenticateToken, dashboardRoutes);  // Phase 3

// ---- Backwards-compatible aliases for Phase 1 public endpoints ----
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/ads', adRoutes);
router.use('/media', mediaRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/settings', settingsRoutes);

export default router;

