// ========================================================================
// The Bharat Chronicle — High-Performance Hybrid Operational Store
// Built with Node 24 native DatabaseSync for instantaneous local dev & tests
// Pre-seeded with Phase 1 to Phase 5 newsroom tables, users, and commercial data
// ========================================================================

import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let sqliteDb = null;

export function getHybridDb() {
  if (sqliteDb) return sqliteDb;

  // Store in memory with optional local persistence in data directory
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'chronicle_dev.sqlite');
  sqliteDb = new DatabaseSync(dbPath);

  // Setup custom functions for MySQL compatibility
  try {
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'reporter',
        designation TEXT DEFAULT 'Staff Correspondent',
        bio TEXT,
        avatar_url TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        last_login_at TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS role_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL,
        permission_key TEXT NOT NULL,
        description TEXT,
        UNIQUE(role, permission_key)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER,
        display_order INTEGER NOT NULL DEFAULT 0,
        color_badge TEXT DEFAULT '#0A2540',
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        kicker TEXT,
        short_description TEXT NOT NULL,
        article_body TEXT NOT NULL,
        featured_image TEXT,
        image_caption TEXT,
        alt_text TEXT,
        youtube_url TEXT,
        author_id INTEGER NOT NULL,
        category_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        priority INTEGER NOT NULL DEFAULT 0,
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_breaking INTEGER NOT NULL DEFAULT 0,
        is_sponsored INTEGER NOT NULL DEFAULT 0,
        sponsor_client TEXT,
        reading_time_minutes INTEGER NOT NULL DEFAULT 4,
        view_count INTEGER NOT NULL DEFAULT 0,
        language TEXT NOT NULL DEFAULT 'en',
        scheduled_publication_time TEXT,
        publication_time TEXT,
        expiry_time TEXT,
        meta_title TEXT,
        meta_description TEXT,
        meta_keywords TEXT,
        canonical_url TEXT,
        og_image TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS article_tags (
        article_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (article_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS article_multimedia (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER NOT NULL,
        media_type TEXT NOT NULL,
        embed_url TEXT NOT NULL,
        duration_seconds INTEGER,
        thumbnail_url TEXT,
        transcript TEXT,
        caption TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS article_revisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER NOT NULL,
        revision_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        short_description TEXT NOT NULL,
        article_body TEXT NOT NULL,
        edited_by INTEGER NOT NULL,
        revision_notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS media_assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_url TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        file_size_bytes INTEGER NOT NULL,
        width INTEGER,
        height INTEGER,
        alt_text TEXT,
        caption TEXT,
        uploaded_by INTEGER,
        file_data BLOB,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS ad_placements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        placement_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        dimensions TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS advertisements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        placement_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        client_name TEXT NOT NULL,
        ad_type TEXT NOT NULL DEFAULT 'image',
        banner_image_url TEXT,
        ad_code TEXT,
        target_url TEXT,
        impressions_count INTEGER NOT NULL DEFAULT 0,
        clicks_count INTEGER NOT NULL DEFAULT 0,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        priority INTEGER NOT NULL DEFAULT 5,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS advertiser_enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        website TEXT,
        budget_range TEXT NOT NULL,
        preferred_placements TEXT,
        flight_start_date TEXT,
        campaign_objectives TEXT,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        internal_notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS youtube_videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        youtube_id TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        published_at TEXT,
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        related_article_id INTEGER,
        display_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT NOT NULL UNIQUE,
        setting_value TEXT,
        setting_group TEXT NOT NULL DEFAULT 'general',
        is_public INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        updated_by INTEGER,
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS analytics_page_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER,
        page_path TEXT NOT NULL,
        page_type TEXT NOT NULL DEFAULT 'article',
        referrer_source TEXT NOT NULL DEFAULT 'direct',
        device_type TEXT NOT NULL DEFAULT 'desktop',
        session_id TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        viewed_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS analytics_ad_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        placement_code TEXT NOT NULL,
        page_path TEXT,
        ip_hash TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS article_views_hourly (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER NOT NULL,
        view_hour TEXT NOT NULL,
        view_count INTEGER NOT NULL DEFAULT 1,
        device_mobile_count INTEGER NOT NULL DEFAULT 0,
        device_desktop_count INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details TEXT,
        ip_address TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Migration guards for dev db
    try { sqliteDb.exec(`ALTER TABLE users ADD COLUMN username TEXT`); } catch (_) {}
    try { sqliteDb.exec(`ALTER TABLE article_multimedia ADD COLUMN duration_seconds INTEGER`); } catch (_) {}
    try { sqliteDb.exec(`ALTER TABLE article_multimedia ADD COLUMN thumbnail_url TEXT`); } catch (_) {}
    try { sqliteDb.exec(`ALTER TABLE article_multimedia ADD COLUMN transcript TEXT`); } catch (_) {}
    try { sqliteDb.exec(`ALTER TABLE media_assets ADD COLUMN file_data BLOB`); } catch (_) {}

    seedInitialData(sqliteDb);
  } catch (err) {
    console.warn('Hybrid DB Init error:', err.message);
  }

  return sqliteDb;
}

function seedInitialData(db) {
  console.log('🌱 Ensuring initial newsroom records, taxonomy, permissions and settings are seeded in operational store...');

  // 1. Production Users
  const insertOrReplaceUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, username, full_name, email, password_hash, role, designation, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `);

  insertOrReplaceUser.run(
    1,
    'SuperAdmin',
    'Super Admin',
    'superadmin@jantajournal.com',
    '$2b$10$zGfw4eriJ2NoGUuFPLwh9.Sgb9tsUgoNUnKrD6c5W9yUbEEV9JnPO',
    'super_admin',
    'Editor-in-Chief & Managing Director'
  );

  insertOrReplaceUser.run(
    2,
    'Editor',
    'Editorial Lead',
    'editor@jantajournal.com',
    '$2b$10$6mkekFVJNYxAvxIK3xSRPOAqHOXPrCZVV19PvqXmis80FDHYe4tbq',
    'editor',
    'Senior News Editor'
  );

  insertOrReplaceUser.run(
    3,
    'Reporter',
    'Newsroom Reporter',
    'reporter@jantajournal.com',
    '$2b$10$uuOr5P2boHyrAjzv5l9PsukvKVRGBP0QIN7BKD9Jkcvo9mipidc6m',
    'reporter',
    'Field Correspondent'
  );

  // 1b. Role Permissions (Granular capability matrix)
  const insertPerm = db.prepare(`
    INSERT OR IGNORE INTO role_permissions (role, permission_key, description)
    VALUES (?, ?, ?)
  `);
  insertPerm.run('super_admin', 'articles:all', 'Complete control over all articles');
  insertPerm.run('super_admin', 'articles:publish', 'Publish or schedule articles to public website');
  insertPerm.run('super_admin', 'articles:review', 'Review and approve articles submitted by staff');
  insertPerm.run('super_admin', 'users:manage', 'Create, edit, suspend newsroom users');
  insertPerm.run('super_admin', 'categories:manage', 'Manage categories and hierarchy');
  insertPerm.run('super_admin', 'settings:manage', 'Manage site settings and legal accreditation');
  insertPerm.run('super_admin', 'ads:manage', 'Manage commercial campaigns');
  insertPerm.run('super_admin', 'audit:view', 'View newsroom audit trail');

  insertPerm.run('editor', 'articles:create', 'Create new articles and drafts');
  insertPerm.run('editor', 'articles:edit_all', 'Edit any staff article');
  insertPerm.run('editor', 'articles:review', 'Review and approve articles submitted by staff');
  insertPerm.run('editor', 'articles:publish', 'Publish or schedule articles to public website');
  insertPerm.run('editor', 'articles:delete', 'Archive or delete articles');
  insertPerm.run('editor', 'categories:manage', 'Manage categories and hierarchy');
  insertPerm.run('editor', 'media:upload', 'Upload media assets');
  insertPerm.run('editor', 'audit:view', 'View newsroom audit trail');

  insertPerm.run('reporter', 'articles:create', 'Create new articles and drafts');
  insertPerm.run('reporter', 'articles:edit_own', 'Edit own drafted articles');
  insertPerm.run('reporter', 'articles:submit_review', 'Submit articles for editorial review');
  insertPerm.run('reporter', 'media:upload', 'Upload media assets');

  insertPerm.run('ad_manager', 'ads:manage', 'Manage ad slots, campaigns and sponsors');
  insertPerm.run('ad_manager', 'analytics:view', 'View reader analytics and yield');

  // 2. Categories
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (catCount === 0) {
    const insertCat = db.prepare(`
      INSERT INTO categories (id, name, slug, description, parent_id, display_order, color_badge, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);
    insertCat.run(1, 'National', 'national', 'Governance, policy, states, Parliament, and national affairs', null, 1, '#0A2540');
    insertCat.run(2, 'World', 'world', 'Global geopolitics, diplomacy, international security, and bilateral pacts', null, 2, '#1E3A8A');
    insertCat.run(3, 'Economy & Markets', 'economy', 'Fiscal policy, RBI, corporate earnings, stock markets, and trade', null, 3, '#047857');
    insertCat.run(4, 'Tech & AI', 'tech', 'Artificial intelligence, semiconductors, digital public infra, and startups', null, 4, '#4338CA');
    insertCat.run(5, 'Opinion & Editorial', 'opinion', 'In-depth perspectives, analytical essays, and editorial board stances', null, 5, '#B45309');
    insertCat.run(6, 'Climate & Environment', 'climate', 'Clean energy transition, monsoons, agricultural economics, and climate summits', null, 6, '#065F46');
    insertCat.run(7, 'Culture & Life', 'culture', 'Literature, architecture, heritage, art, food, and modern society', null, 7, '#7C3AED');
    insertCat.run(8, 'Sports', 'sports', 'Cricket, Olympic disciplines, chess grandmasters, and world championships', null, 8, '#C2410C');
  }

  // 3. Tags
  const tagCount = db.prepare('SELECT COUNT(*) as count FROM tags').get().count;
  if (tagCount === 0) {
    const insertTag = db.prepare(`INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)`);
    insertTag.run(1, 'SemiconductorMission', 'semiconductor-mission');
    insertTag.run(2, 'RBIMonetaryPolicy', 'rbi-monetary-policy');
    insertTag.run(3, 'SpaceTech', 'space-tech');
    insertTag.run(4, 'SupremeCourtReview', 'supreme-court-review');
    insertTag.run(5, 'DeepTech', 'deep-tech');
    insertTag.run(6, 'GreenHydrogen', 'green-hydrogen');
  }

  // 4. Articles: Clean production store (no demo data)
  // 5. Ad Placements (All 7 standard placements)
  const placementCount = db.prepare('SELECT COUNT(*) as count FROM ad_placements').get().count;
  if (placementCount === 0) {
    const insertPlacement = db.prepare(`
      INSERT INTO ad_placements (id, placement_code, name, dimensions, is_active)
      VALUES (?, ?, ?, ?, 1)
    `);
    insertPlacement.run(1, 'header_leaderboard', 'Header Super Leaderboard', '970x90');
    insertPlacement.run(2, 'homepage_hero_adjacent', 'Homepage Hero-Adjacent Half-Page / Display', '300x600');
    insertPlacement.run(3, 'article_inline', 'In-Article Inline Native Leaderboard', '728x90');
    insertPlacement.run(4, 'article_sidebar_top', 'Article Sidebar Top Medium Rectangle', '300x250');
    insertPlacement.run(5, 'category_page_banner', 'Category Page Header Billboard', '728x90');
    insertPlacement.run(6, 'footer_banner', 'Global Footer Super Leaderboard', '970x90');
    insertPlacement.run(7, 'mobile_anchor_banner', 'Responsive Mobile Sticky Anchor Banner', '320x50');
  }

  // 6. Site Settings
  const settingCount = db.prepare('SELECT COUNT(*) as count FROM site_settings').get().count;
  if (settingCount === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertSetting.run('site_name', 'Janta Journal', 'general', 1, 'Master publication brand title');
    insertSetting.run('site_tagline', 'Independent National Daily of Record', 'general', 1, 'Official masthead subtitle');
    insertSetting.run('site_motto', 'Veritas et Libertas', 'general', 1, 'Classical heritage motto');
    insertSetting.run('press_council_registration', 'REG-JJ-2026-DEL-0941', 'compliance', 1, 'Press Council of India accreditation code');
    insertSetting.run('editorial_email', 'editorial@jantajournal.com', 'contact', 1, 'Central newsroom desk address');
    insertSetting.run('ad_sales_email', 'advertising@jantajournal.com', 'monetization', 1, 'Commercial sponsorships desk email');
    insertSetting.run('breaking_news_enabled', '1', 'editorial', 1, 'Global breaking news ticker master switch');
    insertSetting.run('adsense_publisher_id', '', 'monetization', 1, 'Google AdSense publisher ID (e.g. ca-pub-XXXXXXXXXXXXXXXX)');
    insertSetting.run('adsense_auto_ads_enabled', '0', 'monetization', 1, 'Enable AdSense Auto Ads tag');
    insertSetting.run('ads_provider_type', 'custom', 'monetization', 1, 'Active ad delivery mode: custom, adsense, or hybrid');
    insertSetting.run('google_analytics_id', '', 'integrations', 1, 'Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)');
    insertSetting.run('google_search_console_code', '', 'integrations', 1, 'Google Search Console verification meta tag');
    insertSetting.run('youtube_channel_url', '', 'multimedia', 1, 'Official YouTube channel link');
    insertSetting.run('youtube_channel_name', 'Janta Journal Digital Newsroom', 'multimedia', 1, 'Display channel branding title');
    insertSetting.run('featured_youtube_video_id', '', 'multimedia', 1, 'Featured video displayed on homepage');
    insertSetting.run('media_kit_url', '', 'monetization', 1, 'Downloadable media kit specifications');
    insertSetting.run('advertiser_desk_email', 'advertising@jantajournal.com', 'monetization', 1, 'Commercial partnership enquiries inbox');
    insertSetting.run('advertiser_desk_phone', '+91 (11) 4890-2800', 'monetization', 1, 'Commercial desk direct hotline');
    insertSetting.run('privacy_compliance_mode', 'dpdp_act_india', 'compliance', 1, 'Privacy compliance mode: dpdp_act_india or gdpr');
    insertSetting.run('cookie_consent_required', '1', 'compliance', 1, 'Show consent banner on visitor initial arrival');
    insertSetting.run('visitor_counter', '5000', 'analytics', 1, 'Audited total website visitor baseline counter');
  }

  // Ensure visitor_counter exists in hybrid site_settings even if previously seeded
  try {
    const existingVc = db.prepare("SELECT setting_value FROM site_settings WHERE setting_key = 'visitor_counter'").get();
    if (!existingVc) {
      db.prepare("INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public, description) VALUES ('visitor_counter', '5000', 'analytics', 1, 'Audited total website visitor baseline counter')").run();
    }
  } catch (_) {}

  // Purge lingering demo seed data to keep production store completely clean
  try {
    db.exec(`
      DELETE FROM articles WHERE slug IN (
        'inside-indias-multibillion-dollar-silicon-fab-buildout',
        'reserve-bank-signals-liquidity-normalisation-inflation-stabilises',
        'gaganyaan-orbital-test-crew-module-hypersonic-reentry-success',
        'supreme-court-bench-inter-state-water-sharing',
        'quad-foreign-ministers-maritime-infrastructure-compact',
        'sensex-surges-past-record-manufacturing-expansion',
        'indias-sovereign-ai-stack-prepares-open-foundation-release',
        'architecture-of-trust-public-journalism-democracy',
        'fiscal-neutrality-vs-capital-capex-rbi-trilemma',
        'decarbonising-heavy-industry-national-green-hydrogen-grid',
        'himalayan-cryosphere-monitoring-satellite-sensors',
        'restoring-stepped-wells-western-india-ancient-hydrology',
        'grandmaster-precision-indias-golden-age-global-chess',
        'building-carbon-negative-data-infrastructure-sovereign-cloud',
        'ground-zero-dholera-24-hour-drone-reconnaissance',
        'arctic-shipping-corridor-geopolitics-melting-glaciers',
        'marathi-indias-semiconductor-revolution',
        'hindi-isro-shukrayaan-mission-deep-space'
      );
      DELETE FROM advertisements WHERE client_name IN (
        'Confederation of Indian Industry',
        'National Infrastructure Investment Fund',
        'Ministry of New & Renewable Energy Partner',
        'Tata Sons',
        'Mahindra Group',
        'State Bank of India',
        'Infosys Foundation'
      );
    `);
  } catch (_) {}

  console.log('✓ Operational store initialized with production taxonomy, permissions and settings.');
}

// Translate common MySQL functions to SQLite
export function translateMysqlToSqlite(sql) {
  let translated = sql
    .replace(/\bINSERT\s+IGNORE\s+INTO\b/gi, 'INSERT OR IGNORE INTO')
    .replace(/DATE_ADD\s*\(\s*(?:NOW\(\)|datetime\('now'\))\s*,\s*INTERVAL\s+(\d+)\s+MINUTE\s*\)/gi, "datetime('now', '+$1 minutes')")
    .replace(/DATE_ADD\s*\(\s*(?:NOW\(\)|datetime\('now'\))\s*,\s*INTERVAL\s+(\d+)\s+HOUR\s*\)/gi, "datetime('now', '+$1 hours')")
    .replace(/DATE_ADD\s*\(\s*(?:NOW\(\)|datetime\('now'\))\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "datetime('now', '+$1 days')")
    .replace(/DATE_ADD\s*\(\s*(?:CURDATE\(\)|date\('now'\))\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "date('now', '+$1 days')")
    .replace(/DATE_SUB\s*\(\s*(?:NOW\(\)|datetime\('now'\))\s*,\s*INTERVAL\s+(\d+)\s+MINUTE\s*\)/gi, "datetime('now', '-$1 minutes')")
    .replace(/DATE_SUB\s*\(\s*(?:NOW\(\)|datetime\('now'\))\s*,\s*INTERVAL\s+(\d+)\s+HOUR\s*\)/gi, "datetime('now', '-$1 hours')")
    .replace(/DATE_SUB\s*\(\s*(?:NOW\(\)|datetime\('now'\))\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "datetime('now', '-$1 days')")
    .replace(/DATE_SUB\s*\(\s*(?:CURDATE\(\)|date\('now'\))\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "date('now', '-$1 days')")
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    .replace(/\bCURDATE\(\)/gi, "date('now')")
    .replace(/\bRAND\(\)/gi, "random()")
    .replace(/DATE\s*\(([^)]+)\)\s*=\s*CURDATE\(\)/gi, "date($1) = date('now')")
    .replace(/DATE_FORMAT\s*\(\s*([^,]+)\s*,\s*'%Y-%m-%d %H:00'\s*\)/gi, "strftime('%Y-%m-%d %H:00', $1)")
    .replace(/DATE_FORMAT\s*\(\s*([^,]+)\s*,\s*'%Y-%m-%d'\s*\)/gi, "strftime('%Y-%m-%d', $1)")
    .replace(/\bMATCH\s*\([^)]+\)\s*AGAINST\s*\([^)]+\)/gi, "1=1"); // Fulltext fallback to true
  return translated;
}

export function executeHybridQuery(sql, params = []) {
  const db = getHybridDb();
  const cleanSql = translateMysqlToSqlite(sql).trim();

  // Determine query type
  const isSelect = /^SELECT\b/i.test(cleanSql);
  const isInsert = /^INSERT\b/i.test(cleanSql);
  const isUpdate = /^UPDATE\b/i.test(cleanSql);
  const isDelete = /^DELETE\b/i.test(cleanSql);

  const flatParams = Array.isArray(params) ? params.flat() : [];

  if (isSelect) {
    const stmt = db.prepare(cleanSql);
    return stmt.all(...flatParams);
  }

  if (isInsert) {
    const stmt = db.prepare(cleanSql);
    const result = stmt.run(...flatParams);
    return {
      insertId: Number(result.lastInsertRowid),
      affectedRows: Number(result.changes)
    };
  }

  if (isUpdate || isDelete) {
    const stmt = db.prepare(cleanSql);
    const result = stmt.run(...flatParams);
    return {
      affectedRows: Number(result.changes)
    };
  }

  // Fallback exec
  return db.exec(cleanSql);
}
