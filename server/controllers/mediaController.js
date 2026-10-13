// ========================================================================
// Media Asset Controller — Phase 3
// Handles: list, upload (multipart), register (JSON), delete
// ========================================================================

import path from 'path';
import { fileURLToPath } from 'url';
import mediaService from '../services/mediaService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mediaController = {

  // -----------------------------------------------------------------------
  // GET /api/v1/media
  // List all media assets with pagination and optional mime-type filter
  // -----------------------------------------------------------------------
  async listMedia(req, res, next) {
    try {
      const { page, limit, mimeType } = req.query;
      const result = await mediaService.listMedia({ page, limit, mimeType });
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // -----------------------------------------------------------------------
  // POST /api/v1/media/upload
  // Accepts multipart/form-data with field name = 'image'
  // multer middleware (handleUpload) runs before this — req.file is populated
  // -----------------------------------------------------------------------
  async uploadMedia(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_FILE',
            message: 'No file received. Send a multipart/form-data request with field name "image".'
          }
        });
      }

      const { file } = req;
      const ipAddress = req.ip || req.connection?.remoteAddress;

      // Build the public URL the client will store and use
      // Resolve the relative path from server root → /uploads/images/YYYY/MM/filename.jpg
      const uploadRoot = process.env.UPLOAD_DIR
        ? path.resolve(process.env.UPLOAD_DIR)
        : path.join(__dirname, '..', 'uploads');

      // Normalise to forward-slash URL path regardless of OS
      const relativePath = path.relative(uploadRoot, file.path).replace(/\\/g, '/');
      const fileUrl = `/uploads/${relativePath}`;

      // Optional alt text & caption from request body
      const altText = req.body?.altText || req.body?.alt_text || null;
      const caption = req.body?.caption || null;

      const result = await mediaService.registerMediaAsset(
        {
          filename:      file.filename,
          originalName:  file.originalname,
          filePath:      file.path,
          fileUrl,
          mimeType:      file.mimetype,
          fileSizeBytes: file.size,
          width:         null,  // populated if sharp is available (optional)
          height:        null,
          altText,
          caption
        },
        req.user.id,
        ipAddress
      );

      res.status(201).json({
        success: true,
        data: {
          ...result,
          fileUrl,
          originalName: file.originalname,
          mimeType:     file.mimetype,
          sizeBytes:    file.size
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // -----------------------------------------------------------------------
  // POST /api/v1/media
  // Register an externally-hosted asset by JSON body (URL-based, no upload)
  // -----------------------------------------------------------------------
  async registerMedia(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection?.remoteAddress;
      const result = await mediaService.registerMediaAsset(req.body, req.user.id, ipAddress);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // -----------------------------------------------------------------------
  // DELETE /api/v1/media/:id
  // Removes DB record (file stays on disk — allows CDN/backup references)
  // -----------------------------------------------------------------------
  async deleteMedia(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection?.remoteAddress;
      const result = await mediaService.deleteMediaAsset(parseInt(id, 10), req.user.id, ipAddress);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};

export default mediaController;
