import { Router } from 'express';
import { getDbPool } from '../config/database.js';

const router = Router();

// GET /api/categories - List active categories
router.get('/', async (req, res) => {
  try {
    const pool = getDbPool();
    const [rows] = await pool.query(
      `SELECT id, name, slug, description, color_badge, display_order 
       FROM categories 
       WHERE is_active = 1 
       ORDER BY display_order ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database query unfulfilled - MySQL connection required for live data.',
      error: error.message
    });
  }
});

export default router;
