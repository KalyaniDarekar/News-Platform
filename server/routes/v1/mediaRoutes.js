// ========================================================================
// Media Asset Routes — Phase 3
//
// POST /upload  — multipart file upload (multer handles the file)
// GET  /        — list media assets (paginated)
// POST /        — register external URL-based asset (JSON body)
// DELETE /:id   — remove asset record from DB
// ========================================================================

import { Router } from 'express';
import mediaController from '../../controllers/mediaController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requireRoles } from '../../middleware/roleMiddleware.js';
import { handleUpload } from '../../middleware/uploadMiddleware.js';

const router = Router();

// -----------------------------------------------------------------------
// POST /api/v1/media/upload
// Multipart image upload — field name must be 'image'
// handleUpload is the multer middleware; it populates req.file or returns
// a JSON error response directly (no further middleware runs on failure).
// -----------------------------------------------------------------------
router.post(
  '/upload',
  authenticateToken,
  requireRoles('super_admin', 'editor', 'reporter'),
  handleUpload,                         // ← multer processes the file here
  mediaController.uploadMedia
);

// -----------------------------------------------------------------------
// GET /api/v1/media
// List all uploaded assets (paginated). Staff only.
// -----------------------------------------------------------------------
router.get(
  '/',
  authenticateToken,
  mediaController.listMedia
);

// -----------------------------------------------------------------------
// POST /api/v1/media
// Register an externally hosted asset by JSON URL (no file transfer).
// -----------------------------------------------------------------------
router.post(
  '/',
  authenticateToken,
  requireRoles('super_admin', 'editor', 'reporter'),
  mediaController.registerMedia
);

// -----------------------------------------------------------------------
// DELETE /api/v1/media/:id
// Remove asset DB record. Editors and super_admin only.
// -----------------------------------------------------------------------
router.delete(
  '/:id',
  authenticateToken,
  requireRoles('super_admin', 'editor'),
  mediaController.deleteMedia
);

export default router;
