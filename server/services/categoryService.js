// ========================================================================
// Categories Service
// ========================================================================

import { query } from '../config/database.js';
import auditService from './auditService.js';

export const categoryService = {
  async listCategories({ activeOnly = false } = {}) {
    let sql = `
      SELECT c.*, 
             COUNT(a.id) as article_count,
             p.name as parent_name
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
    `;

    if (activeOnly) {
      sql += ` WHERE c.is_active = 1`;
    }

    sql += ` GROUP BY c.id ORDER BY c.display_order ASC, c.name ASC`;
    return await query(sql);
  },

  async getCategoryBySlug(slug) {
    const rows = await query(`SELECT * FROM categories WHERE slug = ? LIMIT 1`, [slug]);
    if (rows.length === 0) {
      const error = new Error(`Category '${slug}' not found`);
      error.statusCode = 404;
      error.code = 'CATEGORY_NOT_FOUND';
      throw error;
    }
    return rows[0];
  },

  async createCategory(data, userId, ipAddress) {
    const { name, slug, description = null, parentId = null, displayOrder = 0, colorBadge = '#0A2540' } = data;
    const finalSlug = (slug || name).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    const result = await query(
      `INSERT INTO categories (name, slug, description, parent_id, display_order, color_badge, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [name, finalSlug, description, parentId, displayOrder, colorBadge]
    );

    const newId = result.insertId;

    await auditService.logAction({
      userId,
      action: 'CATEGORY_CREATE',
      entityType: 'category',
      entityId: newId,
      details: { name, slug: finalSlug },
      ipAddress
    });

    return { id: newId, name, slug: finalSlug, colorBadge, is_active: 1 };
  },

  async updateCategory(id, data, userId, ipAddress) {
    const existing = await query(`SELECT * FROM categories WHERE id = ? LIMIT 1`, [id]);
    if (existing.length === 0) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    const name = data.name !== undefined ? data.name : existing[0].name;
    const slug = data.slug !== undefined ? data.slug : existing[0].slug;
    const description = data.description !== undefined ? data.description : existing[0].description;
    const parentId = data.parentId !== undefined ? data.parentId : existing[0].parent_id;
    const displayOrder = data.displayOrder !== undefined ? data.displayOrder : existing[0].display_order;
    const colorBadge = data.colorBadge !== undefined ? data.colorBadge : existing[0].color_badge;
    const isActive = data.isActive !== undefined ? (data.isActive ? 1 : 0) : existing[0].is_active;

    await query(
      `UPDATE categories SET
         name = ?, slug = ?, description = ?, parent_id = ?, display_order = ?, color_badge = ?, is_active = ?
       WHERE id = ?`,
      [name, slug, description, parentId, displayOrder, colorBadge, isActive, id]
    );

    await auditService.logAction({
      userId,
      action: 'CATEGORY_UPDATE',
      entityType: 'category',
      entityId: id,
      details: { name, slug },
      ipAddress
    });

    return { id, name, slug, colorBadge, is_active: isActive };
  },

  async deleteCategory(id, userId, ipAddress) {
    // Check if any articles depend on this category
    const articles = await query(`SELECT COUNT(*) as count FROM articles WHERE category_id = ?`, [id]);
    if (articles[0].count > 0) {
      const error = new Error(`Cannot delete category because ${articles[0].count} article(s) are associated with it.`);
      error.statusCode = 409;
      error.code = 'CATEGORY_IN_USE';
      throw error;
    }

    await query(`DELETE FROM categories WHERE id = ?`, [id]);

    await auditService.logAction({
      userId,
      action: 'CATEGORY_DELETE',
      entityType: 'category',
      entityId: id,
      ipAddress
    });

    return { success: true, message: `Category #${id} deleted successfully` };
  }
};

export default categoryService;
