// ========================================================================
// Advertisement Controller
// ========================================================================

import adService from '../services/adService.js';

export const adController = {
  // GET /api/v1/ads/active/:placementCode (Public)
  async getActiveAd(req, res, next) {
    try {
      const { placementCode } = req.params;
      const ad = await adService.getActiveAdByPlacement(placementCode);
      res.json({
        success: true,
        data: ad
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/ads/:id/click (Public telemetry)
  async recordClick(req, res, next) {
    try {
      const { id } = req.params;
      const result = await adService.recordClick(parseInt(id, 10));
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/ads/placements
  async listPlacements(req, res, next) {
    try {
      const placements = await adService.listPlacements();
      res.json({
        success: true,
        data: placements
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/ads/campaigns (Ad Manager / Admin)
  async listCampaigns(req, res, next) {
    try {
      const { page, limit, placementId, isActive } = req.query;
      const result = await adService.listCampaigns({ page, limit, placementId, isActive });
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/ads/campaigns
  async createCampaign(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const campaign = await adService.createCampaign(req.body, req.user.id, ipAddress);
      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaign created'
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/ads/campaigns/:id/toggle
  async toggleCampaign(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await adService.toggleCampaign(parseInt(id, 10), isActive, req.user.id, ipAddress);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};

export default adController;
