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
    if (!artColNames.includes('sponsor_placement_code')) {
      await conn.query("ALTER TABLE articles ADD COLUMN sponsor_placement_code VARCHAR(80) NULL DEFAULT 'marquee_top' AFTER sponsor_client");
    }

    // 3. Check & add file_data column to media_assets table for persistence across restarts
    const [mediaCols] = await conn.query('SHOW COLUMNS FROM media_assets');
    const mediaColNames = mediaCols.map(c => c.Field);
    if (!mediaColNames.includes('file_data')) {
      console.log('[Sync] Adding file_data column to media_assets table...');
      await conn.query('ALTER TABLE media_assets ADD COLUMN file_data LONGBLOB NULL');
      console.log('[Sync] ✓ Added file_data column to media_assets table');
    }

    // 4. Ensure ad_placements table and all 11 standard & marquee placements exist
    console.log('[Sync] Verifying ad_placements table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`ad_placements\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`placement_code\` VARCHAR(80) NOT NULL UNIQUE,
        \`name\` VARCHAR(150) NOT NULL,
        \`dimensions\` VARCHAR(50) NOT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const standardPlacements = [
      { code: 'header_leaderboard', name: 'Top Header Super Leaderboard', dims: '970x90' },
      { code: 'marquee_top', name: 'Top Marquee Ad (Below Day/Date)', dims: 'Single Line Marquee' },
      { code: 'marquee_breaking', name: 'Breaking Marquee Ad (Below Breaking News)', dims: 'Single Line Marquee' },
      { code: 'marquee_both', name: 'Marquee Ad (Both Top & Breaking)', dims: 'Single Line Marquee' },
      { code: 'homepage_hero_adjacent', name: 'Homepage Hero-Adjacent Half-Page / Display', dims: '300x600' },
      { code: 'homepage_mid_billboard', name: 'Homepage Mid-Section Billboard', dims: '970x120' },
      { code: 'article_inline', name: 'In-Article Inline Native Leaderboard', dims: '728x90' },
      { code: 'article_sidebar_top', name: 'Article Sidebar Top Medium Rectangle', dims: '300x250' },
      { code: 'category_page_banner', name: 'Category Page Header Billboard', dims: '728x90' },
      { code: 'footer_banner', name: 'Global Footer Super Leaderboard', dims: '970x90' },
      { code: 'mobile_anchor_banner', name: 'Responsive Mobile Sticky Anchor Banner', dims: '320x50' }
    ];

    for (const p of standardPlacements) {
      await conn.query(
        `INSERT INTO ad_placements (placement_code, name, dimensions, is_active)
         VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           dimensions = VALUES(dimensions),
           is_active = 1`,
        [p.code, p.name, p.dims]
      );
    }
    console.log('[Sync] ✓ Verified 11 inventory placement slots (including Marquee placements)');

    // 5. Ensure advertisements table & columns exist and allow code/text ads
    console.log('[Sync] Verifying advertisements table & columns...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`advertisements\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`placement_id\` INT UNSIGNED NOT NULL,
        \`title\` VARCHAR(180) NOT NULL,
        \`client_name\` VARCHAR(150) NOT NULL,
        \`ad_type\` VARCHAR(20) NOT NULL DEFAULT 'image',
        \`banner_image_url\` VARCHAR(500) NULL,
        \`ad_code\` TEXT NULL,
        \`target_url\` VARCHAR(500) NULL,
        \`impressions_count\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
        \`clicks_count\` BIGINT UNSIGNED NOT NULL DEFAULT 0,
        \`start_date\` DATE NOT NULL,
        \`end_date\` DATE NOT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`priority\` INT NOT NULL DEFAULT 5,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_ad_active_dates\` (\`is_active\`, \`start_date\`, \`end_date\`),
        CONSTRAINT \`fk_ad_placement\` FOREIGN KEY (\`placement_id\`) REFERENCES \`ad_placements\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [adCols] = await conn.query('SHOW COLUMNS FROM advertisements');
    const adColNames = adCols.map(c => c.Field);

    if (!adColNames.includes('ad_type')) {
      await conn.query("ALTER TABLE advertisements ADD COLUMN ad_type VARCHAR(20) NOT NULL DEFAULT 'image' AFTER client_name");
    } else {
      await conn.query("ALTER TABLE advertisements MODIFY COLUMN ad_type VARCHAR(20) NOT NULL DEFAULT 'image'");
    }

    if (!adColNames.includes('ad_code')) {
      await conn.query('ALTER TABLE advertisements ADD COLUMN ad_code TEXT NULL AFTER banner_image_url');
    }

    if (!adColNames.includes('priority')) {
      await conn.query('ALTER TABLE advertisements ADD COLUMN priority INT NOT NULL DEFAULT 5 AFTER is_active');
    }
    if (!adColNames.includes('article_id')) {
      await conn.query('ALTER TABLE advertisements ADD COLUMN article_id INT UNSIGNED NULL AFTER placement_id');
      try {
        await conn.query('ALTER TABLE advertisements ADD INDEX idx_ad_article (article_id)');
      } catch (_) {}
    }

    // Make banner_image_url and target_url nullable so code/text/marquee ads don't fail MySQL validation
    try {
      await conn.query('ALTER TABLE advertisements MODIFY COLUMN banner_image_url VARCHAR(500) NULL');
      await conn.query('ALTER TABLE advertisements MODIFY COLUMN target_url VARCHAR(500) NULL');
    } catch (_) {}
    console.log('[Sync] ✓ Verified advertisements table columns');

    // 5b. Back-sync any published sponsored brandposts into advertisements table
    try {
      const [sponsoredArts] = await conn.query(
        `SELECT a.id, a.title, a.slug, a.featured_image, a.sponsor_client, a.sponsor_placement_code, a.priority, a.expiry_time
         FROM articles a
         WHERE a.is_sponsored = 1 AND a.status = 'published'`
      );

      for (const art of (sponsoredArts || [])) {
        const [existing] = await conn.query('SELECT id FROM advertisements WHERE article_id = ? LIMIT 1', [art.id]);
        if (!existing || existing.length === 0) {
          const code = art.sponsor_placement_code || 'marquee_top';
          const [plc] = await conn.query('SELECT id FROM ad_placements WHERE placement_code = ? LIMIT 1', [code]);
          const plcId = plc && plc[0] ? plc[0].id : 2;
          const isMarquee = code.startsWith('marquee_');
          const adType = isMarquee ? 'text' : (art.featured_image ? 'image' : 'text');
          const targetUrl = `/article/${art.slug}`;
          const startDate = new Date().toISOString().split('T')[0];
          const endDate = art.expiry_time ? art.expiry_time.toISOString().split('T')[0] : '2099-12-31';

          await conn.query(
            `INSERT INTO advertisements (placement_id, title, client_name, ad_type, banner_image_url, target_url, start_date, end_date, priority, is_active, article_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
            [plcId, art.title, art.sponsor_client || 'Sponsored Partner', adType, art.featured_image || null, targetUrl, startDate, endDate, art.priority || 5, art.id]
          );
        }
      }
      if (sponsoredArts && sponsoredArts.length > 0) {
        console.log(`[Sync] ✓ Synced ${sponsoredArts.length} sponsored brandpost stories into commercial advertising inventory`);
      }
    } catch (e) {
      console.warn('[Sync Notice] Sponsored articles back-sync:', e.message);
    }

    // 6. Ensure advertiser_enquiries table exists for leads & CRM pipeline
    console.log('[Sync] Verifying advertiser_enquiries table...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`advertiser_enquiries\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`company_name\` VARCHAR(191) NOT NULL,
        \`contact_name\` VARCHAR(150) NOT NULL,
        \`email\` VARCHAR(191) NOT NULL,
        \`phone\` VARCHAR(50) NULL,
        \`website\` VARCHAR(255) NULL,
        \`budget_range\` VARCHAR(100) NOT NULL,
        \`preferred_placements\` JSON NULL,
        \`flight_start_date\` DATE NULL,
        \`campaign_objectives\` TEXT NULL,
        \`message\` TEXT NOT NULL,
        \`status\` ENUM('new', 'contacted', 'proposal_sent', 'closed_won', 'closed_lost') NOT NULL DEFAULT 'new',
        \`internal_notes\` TEXT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_enquiry_status\` (\`status\`),
        INDEX \`idx_enquiry_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[Sync] ✓ Verified advertiser_enquiries table');

    // 7. Ensure analytics and multimedia tables exist
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`analytics_page_views\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`article_id\` INT UNSIGNED NULL,
        \`page_path\` VARCHAR(255) NOT NULL,
        \`page_type\` VARCHAR(50) NOT NULL DEFAULT 'article',
        \`referrer_source\` VARCHAR(100) NOT NULL DEFAULT 'direct',
        \`device_type\` VARCHAR(30) NOT NULL DEFAULT 'desktop',
        \`session_id\` VARCHAR(64) NOT NULL,
        \`ip_hash\` VARCHAR(64) NOT NULL,
        \`viewed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_pv_article\` (\`article_id\`),
        INDEX \`idx_pv_viewed\` (\`viewed_at\`),
        INDEX \`idx_pv_type\` (\`page_type\`),
        INDEX \`idx_pv_referrer\` (\`referrer_source\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`analytics_ad_events\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`ad_id\` INT UNSIGNED NOT NULL,
        \`event_type\` ENUM('impression', 'click') NOT NULL,
        \`placement_code\` VARCHAR(80) NOT NULL,
        \`page_path\` VARCHAR(255) NULL,
        \`ip_hash\` VARCHAR(64) NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_adevent_ad\` (\`ad_id\`, \`event_type\`),
        INDEX \`idx_adevent_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`youtube_videos\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`youtube_id\` VARCHAR(50) NOT NULL UNIQUE,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`thumbnail_url\` VARCHAR(500) NULL,
        \`published_at\` DATETIME NULL,
        \`is_featured\` TINYINT(1) NOT NULL DEFAULT 0,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`related_article_id\` INT UNSIGNED NULL,
        \`display_order\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_yt_featured\` (\`is_featured\`),
        INDEX \`idx_yt_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 8. Ensure site_settings exists and seed baseline settings including Marquee toggles
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`site_settings\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`setting_key\` VARCHAR(100) NOT NULL UNIQUE,
        \`setting_value\` TEXT NULL,
        \`setting_group\` VARCHAR(50) NOT NULL DEFAULT 'general',
        \`is_public\` TINYINT(1) NOT NULL DEFAULT 0,
        \`description\` VARCHAR(255) NULL,
        \`updated_by\` INT UNSIGNED NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT \`fk_setting_user\` FOREIGN KEY (\`updated_by\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const defaultSettings = [
      { key: 'visitor_counter', val: '5000', group: 'analytics', pub: 1, desc: 'Audited total website visitor baseline counter' },
      { key: 'ad_marquee_top_enabled', val: '1', group: 'monetization', pub: 1, desc: 'Master switch for single-line scrolling marquee ad below top date bar' },
      { key: 'ad_marquee_breaking_enabled', val: '1', group: 'monetization', pub: 1, desc: 'Master switch for single-line scrolling marquee ad below breaking news bar' },
      { key: 'ads_provider_type', val: 'custom', group: 'monetization', pub: 1, desc: 'Active ad delivery mode: custom, adsense, or hybrid' },
      { key: 'advertiser_desk_email', val: 'advertising@jantajournal.com', group: 'monetization', pub: 1, desc: 'Commercial partnership enquiries inbox' },
      { key: 'advertiser_desk_phone', val: '+91 (11) 4890-2800', group: 'monetization', pub: 1, desc: 'Commercial desk direct hotline' }
    ];

    for (const s of defaultSettings) {
      await conn.query(
        `INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public, description)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           setting_group = VALUES(setting_group),
           is_public = VALUES(is_public),
           description = VALUES(description)`,
        [s.key, s.val, s.group, s.pub, s.desc]
      );
    }
    console.log('[Sync] ✓ Seeded baseline settings and marquee toggles');

    // 9. Ensure role_permissions table and grant Editor permissions for commercial ad operations
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`role_permissions\` (
        \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`role\` ENUM('super_admin', 'editor', 'reporter', 'ad_manager') NOT NULL,
        \`permission_key\` VARCHAR(80) NOT NULL,
        \`description\` VARCHAR(200) NULL,
        UNIQUE KEY \`uk_role_permission\` (\`role\`, \`permission_key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const perms = [
      ['super_admin', 'ads:manage', 'Manage commercial campaigns'],
      ['super_admin', 'enquiries:manage', 'Manage advertiser leads and enquiries'],
      ['super_admin', 'settings:manage', 'Manage site settings and monetization'],
      ['editor', 'ads:manage', 'Manage commercial campaigns and marquee ads'],
      ['editor', 'enquiries:manage', 'Manage advertiser leads and enquiries'],
      ['editor', 'settings:manage', 'Manage site settings and marquee toggles'],
      ['ad_manager', 'ads:manage', 'Manage commercial campaigns'],
      ['ad_manager', 'enquiries:manage', 'Manage advertiser leads and enquiries']
    ];

    for (const [r, k, d] of perms) {
      await conn.query(
        `INSERT INTO role_permissions (role, permission_key, description)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE description = VALUES(description)`,
        [r, k, d]
      );
    }
    console.log('[Sync] ✓ Granted Editor role permissions for ad monetization & enquiry management');

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
