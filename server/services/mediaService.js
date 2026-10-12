// ========================================================================
// Media Asset Service
// Tracks photojournalism assets, image dimensions, and upload metadata
// ========================================================================

import { query } from '../config/database.js';
import auditService from './auditService.js';

export const mediaService = {
  async listMedia({ page = 1, limit = 20, mimeType = null } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (mimeType) {
      whereClause += ' AND m.mime_type LIKE ?';
      params.push(`%${mimeType}%`);
    }

    const countRows = await query(`SELECT COUNT(*) as total FROM media_assets m ${whereClause}`, params);
    const total = countRows[0].total;

    const assets = await query(
      `SELECT m.*, u.full_name as uploader_name
       FROM media_assets m
       LEFT JOIN users u ON m.uploaded_by = u.id
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      data: assets,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async registerMediaAsset(data, userId, ipAddress) {
    const {
      filename,
      originalName,
      filePath,
      fileUrl,
      mimeType,
      fileSizeBytes,
      width = null,
      height = null,
      altText = null,
      caption = null
    } = data;

    const result = await query(
      `INSERT INTO media_assets (
         filename, original_name, file_path, file_url, mime_type, file_size_bytes, width, height, alt_text, caption, uploaded_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [filename, originalName, filePath, fileUrl, mimeType, fileSizeBytes, width, height, altText, caption, userId]
    );

    const newId = result.insertId;

    await auditService.logAction({
      userId,
      action: 'MEDIA_UPLOAD',
      entityType: 'media',
      entityId: newId,
      details: { filename, mimeType, fileSizeBytes },
      ipAddress
    });

    return { id: newId, filename, fileUrl, mimeType, fileSizeBytes };
  },

  async deleteMediaAsset(id, userId, ipAddress) {
    const existing = await query(`SELECT filename FROM media_assets WHERE id = ? LIMIT 1`, [id]);
    if (existing.length === 0) {
      const error = new Error('Media asset not found');
      error.statusCode = 404;
      throw error;
    }

    await query(`DELETE FROM media_assets WHERE id = ?`, [id]);

    await auditService.logAction({
      userId,
      action: 'MEDIA_DELETE',
      entityType: 'media',
      entityId: id,
      details: { filename: existing[0].filename },
      ipAddress
    });

    return { success: true, message: `Media asset #${id} deleted` };
  }
};

export default mediaService;
