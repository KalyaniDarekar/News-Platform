// ========================================================================
// Newsroom Audit Log Service
// Records and queries tamper-evident editorial and security events
// ========================================================================

import { query } from '../config/database.js';

export const auditService = {
  // Record an audit log entry
  async logAction({ userId = null, action, entityType, entityId = null, details = null, ipAddress = null }) {
    try {
      const detailsJson = details ? JSON.stringify(details) : null;
      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, action, entityType, entityId, detailsJson, ipAddress]
      );
    } catch (err) {
      console.error('[Audit Log Error] Failed to write audit event:', err.message);
    }
  },

  // Query audit logs with pagination and filters
  async getAuditLogs({ page = 1, limit = 20, entityType = null, action = null, userId = null } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (entityType) {
      whereClause += ' AND a.entity_type = ?';
      params.push(entityType);
    }
    if (action) {
      whereClause += ' AND a.action = ?';
      params.push(action);
    }
    if (userId) {
      whereClause += ' AND a.user_id = ?';
      params.push(userId);
    }

    const countRows = await query(
      `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const dataRows = await query(
      `SELECT a.id, a.user_id, a.action, a.entity_type, a.entity_id, a.details, a.ip_address, a.created_at,
              u.full_name as user_name, u.email as user_email, u.role as user_role
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      data: dataRows.map(row => ({
        ...row,
        details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details
      })),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  }
};

export default auditService;
