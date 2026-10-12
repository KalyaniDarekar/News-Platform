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

const router = Router();

// Version 1 API Routes
router.use('/v1/auth', authRoutes);
router.use('/v1/articles', articleRoutes);
router.use('/v1/categories', categoryRoutes);
router.use('/v1/tags', tagRoutes);
router.use('/v1/ads', adRoutes);
router.use('/v1/media', mediaRoutes);
router.use('/v1/analytics', analyticsRoutes);
router.use('/v1/audit-logs', auditRoutes);
router.use('/v1/settings', settingsRoutes);

// Backwards-compatible aliases for Phase 1 endpoints
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
