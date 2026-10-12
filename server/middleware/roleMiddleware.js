// ========================================================================
// Role-Based Access Control (RBAC) Middleware
// Roles: super_admin > editor > reporter | ad_manager
// ========================================================================

import { query } from '../config/database.js';

export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ROLE',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        }
      });
    }

    next();
  };
};

// Check fine-grained permission key
export const requirePermission = (permissionKey) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      });
    }

    // Super Admin has universal access
    if (req.user.role === 'super_admin') {
      return next();
    }

    try {
      const rows = await query(
        `SELECT 1 FROM role_permissions WHERE role = ? AND (permission_key = ? OR permission_key = 'articles:all') LIMIT 1`,
        [req.user.role, permissionKey]
      );

      if (rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_PERMISSION',
            message: `Permission denied: action '${permissionKey}' is not permitted for role '${req.user.role}'`
          }
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default { requireRoles, requirePermission };
