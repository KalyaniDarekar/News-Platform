// ========================================================================
// Site Settings Service
// Manages platform identity, Press Council accreditation, and global toggles
// ========================================================================

import { query } from '../config/database.js';
import auditService from './auditService.js';

export const settingsService = {
  async getSettings({ publicOnly = false } = {}) {
    let sql = `SELECT setting_key, setting_value, setting_group, description, updated_at FROM site_settings`;
    if (publicOnly) {
      sql += ` WHERE is_public = 1`;
    }
    const rows = await query(sql);

    // Map into key-value object and detailed list
    const settingsMap = {};
    rows.forEach(r => {
      settingsMap[r.setting_key] = r.setting_value;
    });

    return {
      settings: settingsMap,
      details: rows
    };
  },

  async updateSetting(key, value, userId, ipAddress) {
    const existing = await query(`SELECT id FROM site_settings WHERE setting_key = ? LIMIT 1`, [key]);
    if (existing.length === 0) {
      await query(
        `INSERT INTO site_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)`,
        [key, String(value), userId]
      );
    } else {
      await query(
        `UPDATE site_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?`,
        [String(value), userId, key]
      );
    }

    await auditService.logAction({
      userId,
      action: 'SETTING_UPDATE',
      entityType: 'setting',
      details: { key, value },
      ipAddress
    });

    return { key, value };
  }
};

export default settingsService;
