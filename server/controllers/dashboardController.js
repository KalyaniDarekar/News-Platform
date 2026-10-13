// ========================================================================
// Newsroom Dashboard Controller — Phase 3
// ========================================================================

import dashboardService from '../services/dashboardService.js';

export const dashboardController = {

  // GET /api/v1/dashboard/stats
  // Returns full dashboard payload: status counts, expiry tables, activity feed
  async getStats(req, res, next) {
    try {
      const data = await dashboardService.getStats();
      res.json({
        success: true,
        data,
        meta: {
          generatedAt: new Date().toISOString(),
          timezone: 'UTC'
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/dashboard/counts
  // Lightweight quick-counts for polling (smaller payload, faster)
  async getQuickCounts(req, res, next) {
    try {
      const data = await dashboardService.getQuickCounts();
      res.json({
        success: true,
        data,
        meta: { generatedAt: new Date().toISOString() }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default dashboardController;
