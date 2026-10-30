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
      companyName = 'Public Inbound Desk',
      contactName = 'Anonymous Contributor',
      email,
      phone = null,
      website = null,
      budgetRange = 'General Inquiry / Direct Tip',
      preferredPlacements = [],
      flightStartDate = null,
      campaignObjectives = null,
      message
    } = data;

    const placementsJson = JSON.stringify(preferredPlacements || []);
    const cleanFlightStartDate = flightStartDate && String(flightStartDate).trim() !== '' ? flightStartDate : null;
    const cleanPhone = phone && String(phone).trim() !== '' ? String(phone).trim() : null;
    const cleanWebsite = website && String(website).trim() !== '' ? String(website).trim() : null;
    const cleanObjectives = campaignObjectives && String(campaignObjectives).trim() !== '' ? String(campaignObjectives).trim() : null;
    const cleanCompanyName = (companyName && String(companyName).trim()) || 'Public Inbound Desk';
    const cleanContactName = (contactName && String(contactName).trim()) || 'Anonymous Contributor';
    const cleanBudgetRange = (budgetRange && String(budgetRange).trim()) || 'General Inquiry / Direct Tip';

    const result = await query(
      `INSERT INTO advertiser_enquiries (
        company_name, contact_name, email, phone, website,
        budget_range, preferred_placements, flight_start_date,
        campaign_objectives, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        cleanCompanyName,
        cleanContactName,
        email.toLowerCase().trim(),
        cleanPhone,
        cleanWebsite,
        cleanBudgetRange,
        placementsJson,
        cleanFlightStartDate,
        cleanObjectives,
        message
      ]
    );

    const newId = result.insertId;

    await auditService.logAction({
      action: 'ADVERTISER_ENQUIRY_SUBMITTED',
      entityType: 'advertiser_enquiry',
      entityId: newId,
      details: { companyName: cleanCompanyName, contactName: cleanContactName, budgetRange: cleanBudgetRange },
      ipAddress
    });

    return {
      id: newId,
      companyName: cleanCompanyName,
      contactName: cleanContactName,
      status: 'new',
      message: 'Your inquiry has been successfully transmitted to the newsroom desk. Our team will review and respond promptly.'
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
