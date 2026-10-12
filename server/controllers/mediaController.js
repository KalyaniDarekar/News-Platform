// ========================================================================
// Media Asset Controller
// ========================================================================

import mediaService from '../services/mediaService.js';

export const mediaController = {
  // GET /api/v1/media
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

  // POST /api/v1/media
  async registerMedia(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await mediaService.registerMediaAsset(req.body, req.user.id, ipAddress);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/media/:id
  async deleteMedia(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
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
