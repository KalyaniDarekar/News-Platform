// ========================================================================
// Tags Service
// ========================================================================

import { query } from '../config/database.js';

export const tagService = {
  async listTags() {
    return await query(`
      SELECT t.*, COUNT(at.article_id) as article_count
      FROM tags t
      LEFT JOIN article_tags at ON t.id = at.tag_id
      GROUP BY t.id
      ORDER BY article_count DESC, t.name ASC
    `);
  },

  async createTag(name) {
    const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
    const existing = await query(`SELECT * FROM tags WHERE slug = ? LIMIT 1`, [slug]);
    if (existing.length > 0) return existing[0];

    const result = await query(`INSERT INTO tags (name, slug) VALUES (?, ?)`, [name.trim(), slug]);
    return { id: result.insertId, name: name.trim(), slug };
  }
};

export default tagService;
