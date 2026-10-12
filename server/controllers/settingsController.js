// ========================================================================
// Site Settings Controller
// ========================================================================

import settingsService from '../services/settingsService.js';

export const settingsController = {
  // GET /api/v1/settings
  async getSettings(req, res, next) {
    try {
      const publicOnly = !req.user;
      const result = await settingsService.getSettings({ publicOnly });
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/v1/settings/:key
  async updateSetting(req, res, next) {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await settingsService.updateSetting(key, value, req.user.id, ipAddress);
      res.json({
        success: true,
        data: result,
        message: 'Setting updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default settingsController;
