// ========================================================================
// Site Settings Service (Phase 5)
// Manages platform identity, revenue integrations, public verification,
// and privacy configuration without exposing server secrets.
// ========================================================================

import { query } from '../config/database.js';
import auditService from './auditService.js';

const ALLOWED_PUBLIC_KEYS = new Set([
  'site_name',
  'site_tagline',
  'site_motto',
  'press_council_registration',
  'editorial_email',
  'ad_sales_email',
  'breaking_news_enabled',
  'adsense_publisher_id',
  'adsense_auto_ads_enabled',
  'ads_provider_type',
  'google_analytics_id',
  'google_search_console_code',
  'youtube_channel_url',
  'youtube_channel_name',
  'featured_youtube_video_id',
  'media_kit_url',
  'advertiser_desk_email',
  'advertiser_desk_phone',
  'privacy_compliance_mode',
  'cookie_consent_required'
]);

export const settingsService = {
  // Get all settings (Admin view)
  async getSettings({ publicOnly = false } = {}) {
    let sql = `SELECT setting_key, setting_value, setting_group, description, updated_at FROM site_settings`;
    if (publicOnly) {
      sql += ` WHERE is_public = 1`;
    }
    const rows = await query(sql);

    const settingsMap = {};
    (rows || []).forEach(r => {
      if (!publicOnly || ALLOWED_PUBLIC_KEYS.has(r.setting_key)) {
        settingsMap[r.setting_key] = r.setting_value;
      }
    });

    return {
      settings: settingsMap,
      details: rows || []
    };
  },

  // Safe public integration settings for client header/footer/scripts
  async getPublicSettings() {
    const rows = await query(`SELECT setting_key, setting_value FROM site_settings WHERE is_public = 1`);
    const publicMap = {};
    (rows || []).forEach(r => {
      if (ALLOWED_PUBLIC_KEYS.has(r.setting_key)) {
        publicMap[r.setting_key] = r.setting_value;
      }
    });
    return publicMap;
  },

  // Update single key
  async updateSetting(key, value, userId, ipAddress) {
    const existing = await query(`SELECT id FROM site_settings WHERE setting_key = ? LIMIT 1`, [key]);
    if (!existing || existing.length === 0) {
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
  },

  // Batch update multiple settings at once (e.g. from Admin Settings page)
  async updateBatch(settingsMap, userId, ipAddress) {
    const updatedKeys = [];
    for (const [key, value] of Object.entries(settingsMap)) {
      const existing = await query(`SELECT id FROM site_settings WHERE setting_key = ? LIMIT 1`, [key]);
      if (!existing || existing.length === 0) {
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
      updatedKeys.push(key);
    }

    await auditService.logAction({
      userId,
      action: 'SETTINGS_BATCH_UPDATE',
      entityType: 'setting',
      details: { updatedKeys },
      ipAddress
    });

    return { success: true, count: updatedKeys.length };
  }
};

export default settingsService;
