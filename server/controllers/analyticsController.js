// ========================================================================
// Newsroom Analytics Controller
// ========================================================================

import analyticsService from '../services/analyticsService.js';

export const analyticsController = {
  // GET /api/v1/analytics/dashboard
  async getDashboard(req, res, next) {
    try {
      const data = await analyticsService.getDashboardAnalytics();
      res.json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
};

export default analyticsController;
