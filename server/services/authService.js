// ========================================================================
// Authentication & Newsroom User Service
// Handles password hashing (bcrypt), JWT issuance, and session verification
// ========================================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../config/environment.js';
import { query } from '../config/database.js';
import auditService from './auditService.js';

export const authService = {
  // Login with email and password
  async login(email, password, ipAddress) {
    const users = await query(
      `SELECT id, full_name, email, password_hash, role, designation, avatar_url, status 
       FROM users 
       WHERE email = ? LIMIT 1`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      await auditService.logAction({
        action: 'LOGIN_FAILED',
        entityType: 'user',
        details: { email, reason: 'User not found' },
        ipAddress
      });
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const user = users[0];

    if (user.status !== 'active') {
      await auditService.logAction({
        userId: user.id,
        action: 'LOGIN_BLOCKED',
        entityType: 'user',
        details: { status: user.status },
        ipAddress
      });
      const error = new Error('Account has been suspended or deactivated. Contact Editor-in-Chief.');
      error.statusCode = 403;
      error.code = 'ACCOUNT_INACTIVE';
      throw error;
    }

    // Compare bcrypt password hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      await auditService.logAction({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'user',
        details: { reason: 'Incorrect password' },
        ipAddress
      });
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Generate signed JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Update last login timestamp asynchronously
    await query(`UPDATE users SET last_login_at = NOW() WHERE id = ?`, [user.id]);

    // Record successful login audit log
    await auditService.logAction({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entityType: 'user',
      entityId: user.id,
      details: { role: user.role },
      ipAddress
    });

    // Fetch user permissions
    const permissions = await query(
      `SELECT permission_key FROM role_permissions WHERE role = ?`,
      [user.role]
    );

    const perms = permissions.map(p => p.permission_key);
    return {
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        avatarUrl: user.avatar_url,
        permissions: perms
      },
      permissions: perms
    };
  },

  // Get current logged-in user profile with permissions
  async getCurrentUser(userId) {
    const users = await query(
      `SELECT id, full_name, email, role, designation, bio, avatar_url, status, last_login_at, created_at
       FROM users 
       WHERE id = ? AND status = 'active' LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      const error = new Error('User session no longer valid');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    const user = users[0];
    const permissions = await query(
      `SELECT permission_key FROM role_permissions WHERE role = ?`,
      [user.role]
    );

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      permissions: permissions.map(p => p.permission_key)
    };
  },

  // Change staff password
  async changePassword(userId, currentPassword, newPassword, ipAddress) {
    const users = await query(`SELECT password_hash FROM users WHERE id = ? LIMIT 1`, [userId]);
    if (users.length === 0) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const matches = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!matches) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      error.code = 'INCORRECT_CURRENT_PASSWORD';
      throw error;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [newHash, userId]);

    await auditService.logAction({
      userId,
      action: 'PASSWORD_CHANGE',
      entityType: 'user',
      entityId: userId,
      ipAddress
    });

    return { success: true, message: 'Password changed successfully' };
  },

  // List staff users (Admin capability)
  async listUsers({ page = 1, limit = 20, role = null } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const countRows = await query(`SELECT COUNT(*) as total FROM users ${whereClause}`, params);
    const total = countRows[0].total;

    const users = await query(
      `SELECT id, full_name, email, role, designation, status, last_login_at, created_at 
       FROM users 
       ${whereClause} 
       ORDER BY id ASC 
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      data: users,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Create new staff account (Super Admin only)
  async createUser(data, creatorId, ipAddress) {
    const { fullName, email, password, role = 'reporter', designation = 'Staff Correspondent', bio = null } = data;
    const existing = await query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      const error = new Error('A user with this email address already exists');
      error.statusCode = 409;
      error.code = 'DUPLICATE_EMAIL';
      throw error;
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (full_name, email, password_hash, role, designation, bio, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [fullName, email.toLowerCase().trim(), hash, role, designation, bio]
    );

    const newUserId = result.insertId;

    await auditService.logAction({
      userId: creatorId,
      action: 'USER_CREATE',
      entityType: 'user',
      entityId: newUserId,
      details: { email, role },
      ipAddress
    });

    return { id: newUserId, fullName, email, role, designation, status: 'active' };
  }
};

export default authService;
