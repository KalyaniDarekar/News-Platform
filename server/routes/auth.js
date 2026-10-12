import { Router } from 'express';
import { getDbPool } from '../config/database.js';

const router = Router();

// POST /api/auth/login - Editorial newsroom authentication endpoint
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const pool = getDbPool();
    const [rows] = await pool.query(
      `SELECT id, full_name, email, password_hash, role, avatar_url, designation, status 
       FROM users 
       WHERE email = ? AND status = 'active' LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid newsroom credentials' });
    }

    // In production Phase 2, bcrypt.compare is run here
    res.json({
      success: true,
      message: 'Authentication endpoint verified (Phase 2 will bind bcrypt/JWT tokens)',
      user: {
        id: rows[0].id,
        name: rows[0].full_name,
        email: rows[0].email,
        role: rows[0].role,
        designation: rows[0].designation
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database query unfulfilled - MySQL connection required for live authentication.',
      error: error.message
    });
  }
});

// GET /api/auth/me - Verify session
router.get('/me', (req, res) => {
  res.json({
    authenticated: false,
    message: 'Phase 1 development mode. Admin UI currently operates in Preview Mode with realistic demo state.'
  });
});

export default router;
