// ========================================================================
// Audit Logs Controller
// ========================================================================

import auditService from '../services/auditService.js';

export const auditController = {
  // GET /api/v1/audit-logs
  async listLogs(req, res, next) {
    try {
      const { page, limit, entityType, action, userId } = req.query;
      const result = await auditService.getAuditLogs({ page, limit, entityType, action, userId });
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};

export default auditController;
