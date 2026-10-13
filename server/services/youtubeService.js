// ========================================================================
// YouTube Video News Integration Service (Phase 5)
// Curates approved YouTube broadcasts, extracts clean embed IDs,
// and connects videos to editorial articles and homepage features.
// ========================================================================

import { query } from '../config/database.js';
import auditService from './auditService.js';

export function extractYoutubeId(input) {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname === 'youtu.be') {
      return url.pathname.slice(1);
    }
    if (url.hostname.includes('youtube.com')) {
      if (url.searchParams.has('v')) {
        return url.searchParams.get('v');
      }
      if (url.pathname.startsWith('/embed/')) {
        return url.pathname.replace('/embed/', '');
      }
      if (url.pathname.startsWith('/shorts/')) {
        return url.pathname.replace('/shorts/', '');
      }
      if (url.pathname.startsWith('/v/')) {
        return url.pathname.replace('/v/', '');
      }
    }
  } catch {
    // Regex fallback
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    if (match) return match[1];
  }

  return null;
}

export const youtubeService = {
  // Public endpoint: List approved YouTube video dispatches
  async listVideos({ page = 1, limit = 12, isFeatured = null, search = '' } = {}) {
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    let whereClause = 'WHERE y.is_active = 1';

    if (isFeatured !== null && isFeatured !== undefined) {
      whereClause += ' AND y.is_featured = ?';
      params.push(isFeatured === 'true' || isFeatured === 1 || isFeatured === true ? 1 : 0);
    }
    if (search && search.trim()) {
      whereClause += ' AND (y.title LIKE ? OR y.description LIKE ?)';
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    const countRows = await query(`SELECT COUNT(*) as total FROM youtube_videos y ${whereClause}`, params);
    const total = countRows && countRows[0] ? countRows[0].total : 0;

    const videos = await query(
      `SELECT y.*, 
              a.title as article_title, a.slug as article_slug, a.kicker as article_kicker
       FROM youtube_videos y
       LEFT JOIN articles a ON y.related_article_id = a.id
       ${whereClause}
       ORDER BY y.is_featured DESC, y.display_order ASC, y.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit, 10), parseInt(offset, 10)]
    );

    return {
      data: (videos || []).map(v => ({
        ...v,
        embedUrl: `https://www.youtube.com/embed/${v.youtube_id}?enablejsapi=1&origin=${encodeURIComponent(process.env.CLIENT_URL || 'http://localhost:5173')}`
      })),
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  },

  // Public endpoint: Get current featured video (for Homepage video block)
  async getFeaturedVideo() {
    // Check if site_settings has featured_youtube_video_id configured
    const settingRows = await query(`SELECT setting_value FROM site_settings WHERE setting_key = 'featured_youtube_video_id' LIMIT 1`);
    const settingVideoId = settingRows && settingRows[0] ? settingRows[0].setting_value : null;

    if (settingVideoId) {
      const match = await query(
        `SELECT y.*, a.title as article_title, a.slug as article_slug, a.kicker as article_kicker
         FROM youtube_videos y
         LEFT JOIN articles a ON y.related_article_id = a.id
         WHERE y.youtube_id = ? AND y.is_active = 1
         LIMIT 1`,
        [settingVideoId]
      );
      if (match && match.length > 0) {
        return {
          ...match[0],
          embedUrl: `https://www.youtube.com/embed/${match[0].youtube_id}`
        };
      }
    }

    // Otherwise find the latest is_featured = 1 video
    const featuredRows = await query(
      `SELECT y.*, a.title as article_title, a.slug as article_slug, a.kicker as article_kicker
       FROM youtube_videos y
       LEFT JOIN articles a ON y.related_article_id = a.id
       WHERE y.is_active = 1
       ORDER BY y.is_featured DESC, y.created_at DESC
       LIMIT 1`
    );

    if (featuredRows && featuredRows.length > 0) {
      return {
        ...featuredRows[0],
        embedUrl: `https://www.youtube.com/embed/${featuredRows[0].youtube_id}`
      };
    }

    return null;
  },

  // Admin endpoint: Add approved YouTube video
  async createVideo(data, userId, ipAddress) {
    const { youtubeUrlOrId, title, description = '', thumbnailUrl = null, relatedArticleId = null, isFeatured = false, displayOrder = 0 } = data;
    const cleanId = extractYoutubeId(youtubeUrlOrId);

    if (!cleanId) {
      const err = new Error('Invalid YouTube URL or Video ID');
      err.statusCode = 400;
      err.code = 'INVALID_YOUTUBE_ID';
      throw err;
    }

    const finalThumb = thumbnailUrl || `https://img.youtube.com/vi/${cleanId}/hqdefault.jpg`;

    const result = await query(
      `INSERT INTO youtube_videos (
        youtube_id, title, description, thumbnail_url,
        published_at, is_featured, is_active, related_article_id, display_order
      ) VALUES (?, ?, ?, ?, datetime('now'), ?, 1, ?, ?)`,
      [cleanId, title, description, finalThumb, isFeatured ? 1 : 0, relatedArticleId, displayOrder]
    );

    const newId = result.insertId;

    if (isFeatured) {
      // Update site_settings
      await query(`UPDATE site_settings SET setting_value = ? WHERE setting_key = 'featured_youtube_video_id'`, [cleanId]);
    }

    await auditService.logAction({
      userId,
      action: 'YOUTUBE_VIDEO_ATTACHED',
      entityType: 'youtube_video',
      entityId: newId,
      details: { cleanId, title, relatedArticleId },
      ipAddress
    });

    return {
      id: newId,
      youtube_id: cleanId,
      title,
      thumbnail_url: finalThumb,
      is_featured: isFeatured ? 1 : 0
    };
  },

  // Admin endpoint: Update video
  async updateVideo(id, data, userId, ipAddress) {
    const { title, description, isFeatured, relatedArticleId, displayOrder, isActive } = data;
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (isFeatured !== undefined) { updates.push('is_featured = ?'); params.push(isFeatured ? 1 : 0); }
    if (relatedArticleId !== undefined) { updates.push('related_article_id = ?'); params.push(relatedArticleId); }
    if (displayOrder !== undefined) { updates.push('display_order = ?'); params.push(displayOrder); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive ? 1 : 0); }

    if (updates.length > 0) {
      params.push(id);
      await query(`UPDATE youtube_videos SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    return { id, ...data };
  },

  // Admin endpoint: Delete video
  async deleteVideo(id, userId, ipAddress) {
    await query(`DELETE FROM youtube_videos WHERE id = ?`, [id]);
    await auditService.logAction({
      userId,
      action: 'YOUTUBE_VIDEO_DELETED',
      entityType: 'youtube_video',
      entityId: id,
      ipAddress
    });
    return { success: true };
  }
};

export default youtubeService;
