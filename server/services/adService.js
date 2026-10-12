// ========================================================================
// Advertisement Inventory & Sponsorship Campaigns Service
// ========================================================================

import { query } from '../config/database.js';
import auditService from './auditService.js';

export const adService = {
  // Public endpoint: Fetch currently active ad by placement code
  async getActiveAdByPlacement(placementCode) {
    const today = new Date().toISOString().split('T')[0];
    const ads = await query(
      `SELECT a.id, a.title, a.client_name, a.banner_image_url, a.target_url,
              p.placement_code, p.dimensions, p.name as placement_name
       FROM advertisements a
       JOIN ad_placements p ON a.placement_id = p.id
       WHERE p.placement_code = ? 
         AND a.is_active = 1 
         AND a.start_date <= ? 
         AND a.end_date >= ?
       ORDER BY RAND() LIMIT 1`,
      [placementCode, today, today]
    );

    if (ads.length === 0) return null;

    // Asynchronously record an impression
    query(`UPDATE advertisements SET impressions_count = impressions_count + 1 WHERE id = ?`, [ads[0].id]).catch(() => {});

    return ads[0];
  },

  // Record ad click
  async recordClick(adId) {
    await query(`UPDATE advertisements SET clicks_count = clicks_count + 1 WHERE id = ?`, [adId]);
    return { success: true };
  },

  // List all available placement slots
  async listPlacements() {
    return await query(`SELECT * FROM ad_placements ORDER BY id ASC`);
  },

  // List campaigns with metrics (Admin capability)
  async listCampaigns({ page = 1, limit = 20, placementId = null, isActive = null } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (placementId) {
      whereClause += ' AND a.placement_id = ?';
      params.push(parseInt(placementId, 10));
    }
    if (isActive !== null && isActive !== undefined) {
      whereClause += ' AND a.is_active = ?';
      params.push(isActive === 'true' || isActive === 1 || isActive === true ? 1 : 0);
    }

    const countRows = await query(`SELECT COUNT(*) as total FROM advertisements a ${whereClause}`, params);
    const total = countRows[0].total;

    const campaigns = await query(
      `SELECT a.*, p.placement_code, p.dimensions, p.name as placement_name,
              CASE 
                WHEN a.impressions_count > 0 THEN ROUND((a.clicks_count / a.impressions_count) * 100, 2)
                ELSE 0.00
              END as ctr_percentage
       FROM advertisements a
       JOIN ad_placements p ON a.placement_id = p.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      data: campaigns,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  // Create new campaign
  async createCampaign(data, userId, ipAddress) {
    const { placementId, title, clientName, bannerImageUrl, targetUrl, startDate, endDate, isActive = true } = data;

    const result = await query(
      `INSERT INTO advertisements (placement_id, title, client_name, banner_image_url, target_url, start_date, end_date, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [placementId, title, clientName, bannerImageUrl, targetUrl, startDate, endDate, isActive ? 1 : 0]
    );

    const newId = result.insertId;

    await auditService.logAction({
      userId,
      action: 'AD_CAMPAIGN_CREATE',
      entityType: 'advertisement',
      entityId: newId,
      details: { title, clientName },
      ipAddress
    });

    return { id: newId, title, clientName, is_active: isActive ? 1 : 0 };
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
