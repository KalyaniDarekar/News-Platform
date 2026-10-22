// ========================================================================
// Analytics Controller (Phase 5)
// ========================================================================

import analyticsService from '../services/analyticsService.js';

export const analyticsController = {
  // POST /api/v1/analytics/track (Public first-party tracking)
  async trackPageView(req, res, next) {
    try {
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await analyticsService.trackPageView({
        ...req.body,
        userAgent,
        ipAddress
      });
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/analytics/overview (Staff & Admin dashboard)
  async getOverview(req, res, next) {
    try {
      const { timeRange, startDate, endDate } = req.query;
      const report = await analyticsService.getAnalyticsOverview({ timeRange, startDate, endDate });
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  },

  // Backwards compatible GET /api/v1/analytics/dashboard
  async getDashboard(req, res, next) {
    try {
      const { timeRange } = req.query;
      const report = await analyticsService.getAnalyticsOverview({ timeRange });
      res.json({
        success: true,
        data: {
          ...report,
          overview: {
            totalArticleViews: report.summary?.totalArticleViewsLifetime || 0,
            periodViews: report.summary?.periodViews || 0,
            activeCampaigns: report.summary?.activeAdCampaigns || 0
          },
          topArticles: report.topStories || [],
          recentActions: []
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default analyticsController;
