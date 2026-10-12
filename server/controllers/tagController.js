// ========================================================================
// Tags Controller
// ========================================================================

import tagService from '../services/tagService.js';

export const tagController = {
  // GET /api/v1/tags
  async listTags(req, res, next) {
    try {
      const tags = await tagService.listTags();
      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/tags
  async createTag(req, res, next) {
    try {
      const { name } = req.body;
      const tag = await tagService.createTag(name);
      res.status(201).json({
        success: true,
        data: tag
      });
    } catch (error) {
      next(error);
    }
  }
};

export default tagController;
