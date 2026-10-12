// ========================================================================
// Categories Controller
// ========================================================================

import categoryService from '../services/categoryService.js';

export const categoryController = {
  // GET /api/v1/categories
  async listCategories(req, res, next) {
    try {
      const activeOnly = req.query.activeOnly === 'true';
      const categories = await categoryService.listCategories({ activeOnly });
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/categories/:slug
  async getCategory(req, res, next) {
    try {
      const { slug } = req.params;
      const category = await categoryService.getCategoryBySlug(slug);
      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/categories
  async createCategory(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const category = await categoryService.createCategory(req.body, req.user.id, ipAddress);
      res.status(201).json({
        success: true,
        data: category,
        message: 'Category created'
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/v1/categories/:id
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const category = await categoryService.updateCategory(parseInt(id, 10), req.body, req.user.id, ipAddress);
      res.json({
        success: true,
        data: category,
        message: 'Category updated'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/categories/:id
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await categoryService.deleteCategory(parseInt(id, 10), req.user.id, ipAddress);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};

export default categoryController;
