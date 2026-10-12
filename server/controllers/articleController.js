// ========================================================================
// News Articles Controller
// ========================================================================

import articleService from '../services/articleService.js';

export const articleController = {
  // GET /api/v1/articles
  async listArticles(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        category: req.query.category,
        tag: req.query.tag,
        language: req.query.language,
        authorId: req.query.authorId,
        isBreaking: req.query.isBreaking,
        isFeatured: req.query.isFeatured,
        search: req.query.search,
        sort: req.query.sort,
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await articleService.listArticles(filters, req.user);
      res.json({
        success: true,
        ...result,
        meta: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/articles/:slug
  async getArticle(req, res, next) {
    try {
      const { slug } = req.params;
      const isMobile = /mobile/i.test(req.headers['user-agent'] || '');
      const article = await articleService.getArticleBySlug(slug, req.user, { isMobile });
      res.json({
        success: true,
        data: article
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/articles
  async createArticle(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await articleService.createArticle(req.body, req.user.id, ipAddress);
      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/v1/articles/:id
  async updateArticle(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await articleService.updateArticle(parseInt(id, 10), req.body, req.user, ipAddress);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/articles/:id
  async deleteArticle(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await articleService.deleteArticle(parseInt(id, 10), req.user, ipAddress);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/articles/:id/revisions
  async getRevisions(req, res, next) {
    try {
      const { id } = req.params;
      const revisions = await articleService.getArticleRevisions(parseInt(id, 10));
      res.json({
        success: true,
        data: revisions
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/articles/cron/publish (Cron endpoint for cPanel automation)
  async processCron(req, res, next) {
    try {
      const result = await articleService.processScheduledAndExpiringArticles();
      res.json({
        success: true,
        message: 'Scheduled publication and expiry processed',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};

export default articleController;
