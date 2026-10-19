// ========================================================================
// Direct Advertiser Business & Sponsorship Enquiries Service (Phase 5)
// Captures leads, logs audit trails, and manages pipeline lifecycle in MySQL/Store
// ========================================================================

import { query } from '../config/database.js';
import auditService from './auditService.js';

export const advertiserEnquiryService = {
  // Public endpoint: Submit campaign enquiry
  async submitEnquiry(data, ipAddress) {
    const {
      companyName,
      contactName,
      email,
      phone = null,
      website = null,
      budgetRange,
      preferredPlacements = [],
      flightStartDate = null,
      campaignObjectives = null,
      message
    } = data;

    const placementsJson = JSON.stringify(preferredPlacements || []);

    const result = await query(
      `INSERT INTO advertiser_enquiries (
        company_name, contact_name, email, phone, website,
        budget_range, preferred_placements, flight_start_date,
        campaign_objectives, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        companyName,
        contactName,
        email.toLowerCase().trim(),
        phone,
        website,
        budgetRange,
        placementsJson,
        flightStartDate,
        campaignObjectives,
        message
      ]
    );

    const newId = result.insertId;

    await auditService.logAction({
      action: 'ADVERTISER_ENQUIRY_SUBMITTED',
      entityType: 'advertiser_enquiry',
      entityId: newId,
      details: { companyName, contactName, budgetRange },
      ipAddress
    });

    return {
      id: newId,
      companyName,
      contactName,
      status: 'new',
      message: 'Your advertising enquiry has been submitted to JANTA JOURNAL Commercial Desk. Our corporate partnerships team will review and respond within 24 business hours.'
    };
  },

  // Admin endpoint: List enquiries with status filtering & pagination
  async listEnquiries({ page = 1, limit = 20, status = null, search = '' } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    if (search && search.trim()) {
      whereClause += ' AND (company_name LIKE ? OR contact_name LIKE ? OR email LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`, `%${search.trim()}%`);
    }

    const countRows = await query(`SELECT COUNT(*) as total FROM advertiser_enquiries ${whereClause}`, params);
    const total = countRows && countRows[0] ? countRows[0].total : 0;

    const rows = await query(
      `SELECT * FROM advertiser_enquiries
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    // Parse preferred_placements JSON
    const parsedRows = (rows || []).map(r => {
      let placements = [];
      try {
        placements = typeof r.preferred_placements === 'string' ? JSON.parse(r.preferred_placements) : (r.preferred_placements || []);
      } catch {
        placements = [];
      }
      return {
        ...r,
        preferred_placements: placements
      };
    });

    return {
      data: parsedRows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  // Admin endpoint: Update enquiry status & internal notes
  async updateStatus(id, { status, internalNotes }, userId, ipAddress) {
    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (internalNotes !== undefined) {
      updates.push('internal_notes = ?');
      params.push(internalNotes);
    }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE advertiser_enquiries SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    await auditService.logAction({
      userId,
      action: 'ADVERTISER_ENQUIRY_STATUS_UPDATE',
      entityType: 'advertiser_enquiry',
      entityId: id,
      details: { status, internalNotes },
      ipAddress
    });

    return { id, status, internalNotes };
  },

  // Admin endpoint: Delete lead record
  async deleteEnquiry(id, userId, ipAddress) {
    await query(`DELETE FROM advertiser_enquiries WHERE id = ?`, [id]);
    await auditService.logAction({
      userId,
      action: 'ADVERTISER_ENQUIRY_DELETE',
      entityType: 'advertiser_enquiry',
      entityId: id,
      ipAddress
    });
    return { success: true };
  }
};

export default advertiserEnquiryService;
