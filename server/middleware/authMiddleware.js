// ========================================================================
// Authentication Middleware (JWT Bearer Token Verification)
// ========================================================================

import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import { query } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication token required to access this resource'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Verify that the user still exists and remains active in MySQL
    const users = await query(
      `SELECT id, full_name, email, role, status FROM users WHERE id = ? LIMIT 1`,
      [decoded.id]
    );

    if (users.length === 0 || users[0].status !== 'active') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_DEACTIVATED',
          message: 'User account not found or suspended'
        }
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Session expired. Please log in again'
        }
      });
    }
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authorization token'
      }
    });
  }
};

// Optional auth for endpoints where anonymous users can read public content,
// but authenticated staff can see drafts or embargoed content
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7).trim() 
    : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const users = await query(
      `SELECT id, full_name, email, role, status FROM users WHERE id = ? AND status = 'active' LIMIT 1`,
      [decoded.id]
    );
    req.user = users.length > 0 ? users[0] : null;
  } catch {
    req.user = null;
  }
  next();
};

export default { authenticateToken, optionalAuth };
