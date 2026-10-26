import bcrypt from 'bcryptjs';
import { getDbPool } from '../config/database.js';

export async function syncProductionDatabase() {
  const pool = getDbPool();
  if (!pool) {
    console.log('[Sync] No direct MySQL pool available, skipping MySQL sync.');
    return;
  }

  let conn;
  try {
    conn = await pool.getConnection();
    console.log('[Sync] Connected to MySQL. Verifying schema...');

    // 1. Check & add username column to users table
    const [cols] = await conn.query('SHOW COLUMNS FROM users');
    const hasUsername = cols.some(c => c.Field === 'username');
    if (!hasUsername) {
      console.log('[Sync] Adding username column to users table...');
      await conn.query('ALTER TABLE users ADD COLUMN username VARCHAR(60) NULL UNIQUE AFTER id');
      console.log('[Sync] ✓ Added username column to users table');
    }

    // 2. Check & add missing columns to articles table
    const [artCols] = await conn.query('SHOW COLUMNS FROM articles');
    const artColNames = artCols.map(c => c.Field);
    if (!artColNames.includes('alt_text')) {
      await conn.query('ALTER TABLE articles ADD COLUMN alt_text VARCHAR(255) NULL AFTER image_caption');
    }
    if (!artColNames.includes('youtube_url')) {
      await conn.query('ALTER TABLE articles ADD COLUMN youtube_url VARCHAR(255) NULL AFTER alt_text');
    }
    if (!artColNames.includes('expiry_time')) {
      await conn.query('ALTER TABLE articles ADD COLUMN expiry_time DATETIME NULL AFTER publication_time');
    }

    // 3. Check & add file_data column to media_assets table for persistence across restarts
    const [mediaCols] = await conn.query('SHOW COLUMNS FROM media_assets');
    const mediaColNames = mediaCols.map(c => c.Field);
    if (!mediaColNames.includes('file_data')) {
      console.log('[Sync] Adding file_data column to media_assets table...');
      await conn.query('ALTER TABLE media_assets ADD COLUMN file_data LONGBLOB NULL');
      console.log('[Sync] ✓ Added file_data column to media_assets table');
    }

    // 4. Ensure visitor_counter setting exists in site_settings
    const [settingRows] = await conn.query('SELECT setting_value FROM site_settings WHERE setting_key = "visitor_counter" LIMIT 1');
    if (!settingRows || settingRows.length === 0) {
      console.log('[Sync] Seeding baseline visitor_counter in site_settings...');
      await conn.query(
        'INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public, description) VALUES ("visitor_counter", "5000", "analytics", 1, "Audited total website visitor baseline counter")'
      );
      console.log('[Sync] ✓ Seeded visitor_counter in site_settings');
    }

    // Schema verified
    console.log('[Sync] Database schema columns verified.');

    // 4. Upsert production users with exact credentials
    const pSuper = await bcrypt.hash('Admin@123', 10);
    const pEditor = await bcrypt.hash('Editor@123', 10);
    const pReporter = await bcrypt.hash('Reporter@123', 10);

    const users = [
      { id: 1, username: 'SuperAdmin', full_name: 'Super Admin', email: 'superadmin@jantajournal.com', password_hash: pSuper, role: 'super_admin' },
      { id: 2, username: 'Editor', full_name: 'Lead Editor', email: 'editor@jantajournal.com', password_hash: pEditor, role: 'editor' },
      { id: 3, username: 'Reporter', full_name: 'Staff Reporter', email: 'reporter@jantajournal.com', password_hash: pReporter, role: 'reporter' }
    ];

    for (const u of users) {
      await conn.query(
        `INSERT INTO users (id, username, full_name, email, password_hash, role, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE
           username = VALUES(username),
           email = VALUES(email),
           full_name = VALUES(full_name),
           password_hash = VALUES(password_hash),
           role = VALUES(role),
           status = 'active'`,
        [u.id, u.username, u.full_name, u.email, u.password_hash, u.role]
      );
    }
    // Delete any users not in the production staff list
    await conn.query('DELETE FROM users WHERE id > 3');
    console.log('[Sync] ✓ Production accounts updated in MySQL');

    const [uRows] = await conn.query('SELECT id, username, email, role FROM users');
    console.log('[Sync] Current MySQL staff users:', uRows);

    return true;
  } catch (err) {
    console.error('[Sync] MySQL sync error:', err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// CLI direct execution
if (process.argv[1]?.endsWith('sync_production.js')) {
  syncProductionDatabase()
    .then(() => {
      console.log('[Sync] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Sync] Failed:', err);
      process.exit(1);
    });
}
