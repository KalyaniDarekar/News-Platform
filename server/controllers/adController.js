// ========================================================================
// Advertisement Controller (Phase 5)
// ========================================================================

import adService from '../services/adService.js';

export const adController = {
  // GET /api/v1/ads/marquee/:slot (Public marquee single line ticker)
  async getMarqueeAds(req, res, next) {
    try {
      const { slot } = req.params;
      const ads = await adService.getActiveMarqueeAds(slot);
      res.json({
        success: true,
        data: ads || []
      });
    } catch (error) {
      next(error);
    }
  },
  // GET /api/v1/ads/directory (Public all active commercial ads showcase)
  async getPublicAdDirectory(req, res, next) {
    try {
      const ads = await adService.getPublicAdDirectory();
      res.json({
        success: true,
        data: ads || []
      });
    } catch (error) {
      next(error);
    }
  },

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

  // POST /api/v1/ads/:id/impression (Public telemetry)
  async recordImpression(req, res, next) {
    try {
      const { id } = req.params;
      const { placementCode, pagePath } = req.body || {};
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await adService.recordImpression(parseInt(id, 10), placementCode, ipAddress, pagePath);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/ads/:id/click (Public telemetry)
  async recordClick(req, res, next) {
    try {
      const { id } = req.params;
      const { placementCode, pagePath } = req.body || {};
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await adService.recordClick(parseInt(id, 10), placementCode, ipAddress, pagePath);
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
      const { page, limit, placementId, isActive, search } = req.query;
      const result = await adService.listCampaigns({ page, limit, placementId, isActive, search });
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
      const campaign = await adService.createCampaign(req.body, req.user, ipAddress);
      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campaign created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/v1/ads/campaigns/:id
  async updateCampaign(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const updated = await adService.updateCampaign(parseInt(id, 10), req.body, req.user, ipAddress);
      res.json({
        success: true,
        data: updated,
        message: 'Campaign updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/ads/campaigns/:id
  async deleteCampaign(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      await adService.deleteCampaign(parseInt(id, 10), req.user.id, ipAddress);
      res.json({
        success: true,
        message: 'Campaign deleted successfully'
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
