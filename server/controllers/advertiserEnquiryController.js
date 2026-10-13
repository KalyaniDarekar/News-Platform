// ========================================================================
// Direct Advertiser Enquiries Controller (Phase 5)
// ========================================================================

import advertiserEnquiryService from '../services/advertiserEnquiryService.js';

export const advertiserEnquiryController = {
  // POST /api/v1/advertiser-enquiries (Public lead submission)
  async submitEnquiry(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const result = await advertiserEnquiryService.submitEnquiry(req.body, ipAddress);
      res.status(201).json({
        success: true,
        data: result,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/v1/advertiser-enquiries (Admin / Ad Manager)
  async listEnquiries(req, res, next) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await advertiserEnquiryService.listEnquiries({ page, limit, status, search });
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/v1/advertiser-enquiries/:id/status (Admin / Ad Manager)
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, internalNotes } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const updated = await advertiserEnquiryService.updateStatus(parseInt(id, 10), { status, internalNotes }, req.user.id, ipAddress);
      res.json({
        success: true,
        data: updated,
        message: 'Enquiry status updated'
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/v1/advertiser-enquiries/:id (Admin / Ad Manager)
  async deleteEnquiry(req, res, next) {
    try {
      const { id } = req.params;
      const ipAddress = req.ip || req.connection.remoteAddress;
      await advertiserEnquiryService.deleteEnquiry(parseInt(id, 10), req.user.id, ipAddress);
      res.json({
        success: true,
        message: 'Enquiry record deleted'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default advertiserEnquiryController;
