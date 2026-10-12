import { Router } from 'express';
import { getDbPool } from '../config/database.js';

const router = Router();

// GET /api/articles - List articles with filtering & pagination
router.get('/', async (req, res) => {
  try {
    const pool = getDbPool();
    const { category, tag, status = 'published', limit = 20, page = 1 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let query = `
      SELECT a.id, a.title, a.slug, a.kicker, a.summary, a.featured_image, a.image_caption,
             a.is_breaking, a.is_lead, a.is_opinion, a.is_sponsored, a.sponsor_name,
             a.reading_time_minutes, a.view_count, a.published_at,
             c.name as category_name, c.slug as category_slug,
             u.full_name as author_name, u.avatar_url as author_avatar
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN users u ON a.author_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }

    query += ` ORDER BY a.published_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);
    res.json({
      success: true,
      data: rows,
      meta: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        count: rows.length
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database query unfulfilled - MySQL connection required for live data.',
      error: error.message,
      phaseNote: 'Phase 1 development mode: Ensure MySQL database is configured with server/database/schema.sql'
    });
  }
});

// GET /api/articles/:slug - Single article detail
router.get('/:slug', async (req, res) => {
  try {
    const pool = getDbPool();
    const { slug } = req.params;

    const [rows] = await pool.query(
      `SELECT a.*, c.name as category_name, c.slug as category_slug,
              u.full_name as author_name, u.avatar_url as author_avatar, u.designation as author_designation, u.bio as author_bio
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.slug = ? LIMIT 1`,
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment view count asynchronously
    pool.query('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [rows[0].id]).catch(() => {});

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database query unfulfilled - MySQL connection required for live data.',
      error: error.message
    });
  }
});

export default router;
