// ========================================================================
// Authentication Controller
// ========================================================================

import authService from '../services/authService.js';

export const authController = {
  // POST /api/v1/auth/login
  async login(req, res, next) {
    try {
      const identifier = (req.body.username || req.body.email || '').trim();
      const { password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await authService.login(identifier, password, ipAddress);
      res.json({
        success: true,
        data: result,
        message: 'Authentication successful'
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/auth/me
  async getProfile(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/change-password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword, ipAddress);
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/logout
  async logout(req, res) {
    // Stateless JWT tokens can be invalidated client-side; endpoint confirms clean logout
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  },

  // GET /api/v1/auth/users (Super Admin only)
  async listUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, role } = req.query;
      const result = await authService.listUsers({ page, limit, role });
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/v1/auth/users (Super Admin only)
  async createUser(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const user = await authService.createUser(req.body, req.user.id, ipAddress);
      res.status(201).json({
        success: true,
        data: user,
        message: 'Staff user created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
