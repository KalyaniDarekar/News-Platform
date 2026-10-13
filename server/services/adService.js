// ========================================================================
// Advertisement Inventory & Sponsorship Campaigns Service (Phase 5)
// Supports multi-format placements (Image & Approved Code), Priority weighting,
// Granular Scheduling, and Privacy-Conscious First-Party Telemetry
// ========================================================================

import { query } from '../config/database.js';
import auditService from './auditService.js';
import crypto from 'crypto';

export const adService = {
  // Public endpoint: Fetch currently active ad by placement code
  async getActiveAdByPlacement(placementCode) {
    const today = new Date().toISOString().split('T')[0];

    // Priority descending, randomized among highest priority active matches
    const ads = await query(
      `SELECT a.id, a.title, a.client_name, a.ad_type, a.banner_image_url, 
              a.ad_code, a.target_url, a.priority, a.start_date, a.end_date,
              p.placement_code, p.dimensions, p.name as placement_name
       FROM advertisements a
       JOIN ad_placements p ON a.placement_id = p.id
       WHERE p.placement_code = ? 
         AND a.is_active = 1 
         AND a.start_date <= ? 
         AND a.end_date >= ?
       ORDER BY a.priority DESC, RAND() 
       LIMIT 1`,
      [placementCode, today, today]
    );

    if (!ads || ads.length === 0) return null;

    const selectedAd = ads[0];

    // Increment impressions count asynchronously
    query(`UPDATE advertisements SET impressions_count = impressions_count + 1 WHERE id = ?`, [selectedAd.id]).catch(() => {});

    return selectedAd;
  },

  // Record verified impression event
  async recordImpression(adId, placementCode = '', ipAddress = '', pagePath = '') {
    if (!adId) return { success: false };
    const ipHash = ipAddress ? crypto.createHash('sha256').update(ipAddress + 'bc_salt_2026').digest('hex').substring(0, 32) : 'anonymous';

    try {
      await query(
        `INSERT INTO analytics_ad_events (ad_id, event_type, placement_code, page_path, ip_hash)
         VALUES (?, 'impression', ?, ?, ?)`,
        [adId, placementCode, pagePath, ipHash]
      );
      await query(`UPDATE advertisements SET impressions_count = impressions_count + 1 WHERE id = ?`, [adId]);
    } catch {
      // Telemetry error silently caught
    }
    return { success: true };
  },

  // Record verified ad click event
  async recordClick(adId, placementCode = '', ipAddress = '', pagePath = '') {
    if (!adId) return { success: false };
    const ipHash = ipAddress ? crypto.createHash('sha256').update(ipAddress + 'bc_salt_2026').digest('hex').substring(0, 32) : 'anonymous';

    try {
      await query(
        `INSERT INTO analytics_ad_events (ad_id, event_type, placement_code, page_path, ip_hash)
         VALUES (?, 'click', ?, ?, ?)`,
        [adId, placementCode, pagePath, ipHash]
      );
      await query(`UPDATE advertisements SET clicks_count = clicks_count + 1 WHERE id = ?`, [adId]);
    } catch {
      // Fallback update
      await query(`UPDATE advertisements SET clicks_count = clicks_count + 1 WHERE id = ?`, [adId]).catch(() => {});
    }
    return { success: true };
  },

  // List all available placement slots (7 standard placements)
  async listPlacements() {
    return await query(`SELECT * FROM ad_placements ORDER BY id ASC`);
  },

  // List campaigns with metrics & schedule status (Admin / Ad Manager)
  async listCampaigns({ page = 1, limit = 20, placementId = null, isActive = null, search = '' } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (placementId) {
      whereClause += ' AND a.placement_id = ?';
      params.push(parseInt(placementId, 10));
    }
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      whereClause += ' AND a.is_active = ?';
      params.push(isActive === 'true' || isActive === 1 || isActive === true ? 1 : 0);
    }
    if (search && search.trim()) {
      whereClause += ' AND (a.title LIKE ? OR a.client_name LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const countRows = await query(`SELECT COUNT(*) as total FROM advertisements a ${whereClause}`, params);
    const total = countRows && countRows[0] ? countRows[0].total : 0;

    const campaigns = await query(
      `SELECT a.*, p.placement_code, p.dimensions, p.name as placement_name,
              CASE 
                WHEN a.impressions_count > 0 THEN ROUND((a.clicks_count * 100.0 / a.impressions_count), 2)
                ELSE 0.00
              END as ctr_percentage
       FROM advertisements a
       JOIN ad_placements p ON a.placement_id = p.id
       ${whereClause}
       ORDER BY a.priority DESC, a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      data: campaigns || [],
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  // Create new campaign
  async createCampaign(data, user, ipAddress) {
    const {
      placementId,
      title,
      clientName,
      adType = 'image',
      bannerImageUrl = null,
      adCode = null,
      targetUrl = null,
      startDate,
      endDate,
      priority = 5,
      isActive = true
    } = data;

    // Security check: Only super_admin or ad_manager can submit or modify adCode
    if (adType === 'code' && user && user.role !== 'super_admin' && user.role !== 'ad_manager') {
      const error = new Error('Unauthorized: Only authorized Ad Managers and Super Administrators may configure custom ad code snippets.');
      error.statusCode = 403;
      error.code = 'AD_CODE_RESTRICTED';
      throw error;
    }

    const result = await query(
      `INSERT INTO advertisements (
        placement_id, title, client_name, ad_type, banner_image_url, 
        ad_code, target_url, start_date, end_date, priority, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        placementId,
        title,
        clientName,
        adType,
        bannerImageUrl,
        adCode,
        targetUrl,
        startDate,
        endDate,
        parseInt(priority, 10) || 5,
        isActive ? 1 : 0
      ]
    );

    const newId = result.insertId;

    await auditService.logAction({
      userId: user?.id,
      action: 'AD_CAMPAIGN_CREATE',
      entityType: 'advertisement',
      entityId: newId,
      details: { title, clientName, adType, placementId },
      ipAddress
    });

    return {
      id: newId,
      title,
      client_name: clientName,
      ad_type: adType,
      is_active: isActive ? 1 : 0,
      priority
    };
  },

  // Update existing campaign
  async updateCampaign(id, data, user, ipAddress) {
    const {
      placementId,
      title,
      clientName,
      adType,
      bannerImageUrl,
      adCode,
      targetUrl,
      startDate,
      endDate,
      priority,
      isActive
    } = data;

    if (adType === 'code' && user && user.role !== 'super_admin' && user.role !== 'ad_manager') {
      const error = new Error('Unauthorized: Only authorized Ad Managers and Super Administrators may configure custom ad code snippets.');
      error.statusCode = 403;
      error.code = 'AD_CODE_RESTRICTED';
      throw error;
    }

    const updates = [];
    const params = [];

    if (placementId !== undefined) { updates.push('placement_id = ?'); params.push(placementId); }
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (clientName !== undefined) { updates.push('client_name = ?'); params.push(clientName); }
    if (adType !== undefined) { updates.push('ad_type = ?'); params.push(adType); }
    if (bannerImageUrl !== undefined) { updates.push('banner_image_url = ?'); params.push(bannerImageUrl); }
    if (adCode !== undefined) { updates.push('ad_code = ?'); params.push(adCode); }
    if (targetUrl !== undefined) { updates.push('target_url = ?'); params.push(targetUrl); }
    if (startDate !== undefined) { updates.push('start_date = ?'); params.push(startDate); }
    if (endDate !== undefined) { updates.push('end_date = ?'); params.push(endDate); }
    if (priority !== undefined) { updates.push('priority = ?'); params.push(priority); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive ? 1 : 0); }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE advertisements SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    await auditService.logAction({
      userId: user?.id,
      action: 'AD_CAMPAIGN_UPDATE',
      entityType: 'advertisement',
      entityId: id,
      details: { updatedFields: Object.keys(data) },
      ipAddress
    });

    return { id, ...data };
  },

  // Delete campaign
  async deleteCampaign(id, userId, ipAddress) {
    await query(`DELETE FROM advertisements WHERE id = ?`, [id]);
    await auditService.logAction({
      userId,
      action: 'AD_CAMPAIGN_DELETE',
      entityType: 'advertisement',
      entityId: id,
      ipAddress
    });
    return { success: true };
  },

  // Toggle active status
  async toggleCampaign(id, isActive, userId, ipAddress) {
    await query(`UPDATE advertisements SET is_active = ? WHERE id = ?`, [isActive ? 1 : 0, id]);

    await auditService.logAction({
      userId,
      action: 'AD_CAMPAIGN_TOGGLE',
      entityType: 'advertisement',
      entityId: id,
      details: { isActive },
      ipAddress
    });

    return { id, is_active: isActive ? 1 : 0 };
  }
};

export default adService;
