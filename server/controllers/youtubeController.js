// ========================================================================
// YouTube Video Controller (Phase 5)
// ========================================================================

import youtubeService from '../services/youtubeService.js';

export const youtubeController = {
  // GET /api/v1/videos (Public)
  async listVideos(req, res, next) {
    try {
      const { page, limit, isFeatured, search } = req.query;
      const result = await youtubeService.listVideos({ page, limit, isFeatured, search });
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/videos/featured (Public)
  async getFeaturedVideo(req, res, next) {
    try {
      const video = await youtubeService.getFeaturedVideo();
      res.json({
        success: true,
        data: video
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/videos (Admin)
  async createVideo(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const video = await youtubeService.createVideo(req.body, req.user.id, ipAddress);
      res.status(201).json({
        success: true,
        data: video,
        message: 'YouTube video attached to publication gallery'
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/v1/videos/:id (Admin)
  async updateVideo(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const updated = await youtubeService.updateVideo(parseInt(id, 10), req.body, req.user.id, ipAddress);
      res.json({
        success: true,
        data: updated,
        message: 'Video metadata updated'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/videos/:id (Admin)
  async deleteVideo(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      await youtubeService.deleteVideo(parseInt(id, 10), req.user.id, ipAddress);
      res.json({
        success: true,
        message: 'Video removed from gallery'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default youtubeController;
