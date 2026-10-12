import { Router } from 'express';
import { getDbPool } from '../config/database.js';

const router = Router();

// GET /api/ads/active - Get active advertisements for public slots
router.get('/active', async (req, res) => {
  try {
    const pool = getDbPool();
    const today = new Date().toISOString().split('T')[0];
    const [rows] = await pool.query(
      `SELECT id, title, slot_position, client_name, banner_image_url, target_url 
       FROM advertisements 
       WHERE is_active = 1 AND start_date <= ? AND end_date >= ?`,
      [today, today]
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
