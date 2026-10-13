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

    seedInitialData(sqliteDb);
  } catch (err) {
    console.warn('Hybrid DB Init error:', err.message);
  }

  return sqliteDb;
}

function seedInitialData(db) {
  // Check if users already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  console.log('🌱 Seeding initial newsroom records and Phase 5 commercial inventory into operational store...');

  // 1. Users (bcrypt hash for "Editorial@2026")
  const defaultHash = '$2b$10$EjjGmDG1TChKPVBabmF81.GOX3bo8M4sRBk26Ao7.uPjqIWT4dLse';
  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, role, designation, bio, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(1, 'Vikramaditya Sharma', 'admin@bharatchronicle.com', defaultHash, 'super_admin', 'Editor-in-Chief & Managing Director', 'Veteran correspondent with over 25 years covering Indian diplomacy, constitutional law, and national security.', 'active');
  insertUser.run(2, 'Dr. Arundhati Sen', 'editor@bharatchronicle.com', defaultHash, 'editor', 'Senior Editor (National & Economy)', 'Former financial policy researcher covering the Reserve Bank of India, fiscal budgets, and international corridors.', 'active');
  insertUser.run(3, 'Rajeshwari Nair', 'reporter@bharatchronicle.com', defaultHash, 'reporter', 'Chief Technology Bureau Correspondent', 'Specializing in deep tech, semiconductor foundries, AI governance, and space exploration.', 'active');
  insertUser.run(4, 'Siddharth Roy', 'ads@bharatchronicle.com', defaultHash, 'ad_manager', 'Head of Monetization & Ad Operations', 'Managing commercial inventory, sponsored partner programs, and programmatic yield monetization.', 'active');

  // 2. Categories
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

  // 3. Tags
  const insertTag = db.prepare(`INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)`);
  insertTag.run(1, 'SemiconductorMission', 'semiconductor-mission');
  insertTag.run(2, 'RBIMonetaryPolicy', 'rbi-monetary-policy');
  insertTag.run(3, 'SpaceTech', 'space-tech');
  insertTag.run(4, 'SupremeCourtReview', 'supreme-court-review');
  insertTag.run(5, 'DeepTech', 'deep-tech');
  insertTag.run(6, 'GreenHydrogen', 'green-hydrogen');

  // 4. Articles
  const insertArt = db.prepare(`
    INSERT INTO articles (
      id, title, slug, kicker, short_description, article_body,
      featured_image, image_caption, alt_text, youtube_url, author_id, category_id, status,
      priority, is_featured, is_breaking, is_sponsored, sponsor_client,
      reading_time_minutes, view_count, language, publication_time,
      meta_title, meta_description, canonical_url
    ) VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?
    )
  `);

  insertArt.run(
    1,
    'The Semiconductor Corridor: Inside India’s Multi-Billion Dollar Silicon Fab Buildout',
    'inside-indias-multibillion-dollar-silicon-fab-buildout',
    'SPECIAL INVESTIGATION',
    'From Gujarat\'s Dholera to Karnataka\'s hardware corridors, billions in sovereign capital and global foundry partnerships are racing to anchor domestic microchip sovereignty before the decade turns.',
    '<p class="lead-paragraph">In the arid plains of Dholera, 100 kilometers southwest of Ahmedabad, the drone of precision construction never pauses. Inside mammoth climate-controlled facilities that dwarf football stadiums, vibration-isolated foundation slabs five meters deep have been cast to anchor lithography machines capable of engraving circuits thinner than a strand of DNA.</p><p>This is ground zero for India’s ₹76,000-crore ($9.1 billion) Semiconductor Mission—a calculated gambit to break free from the geopolitical vulnerabilities that have plagued global tech hardware supply chains since the pandemic.</p><blockquote>"Chip autonomy is not simply an industrial objective; it is the cornerstone of national technological sovereignty in the artificial intelligence century."</blockquote><h3>From Silicon Valley to Dholera: The Global Foundry Pivot</h3><p>For decades, India provided the design brains for the world\'s leading semiconductor firms—nearly 20% of global chip design talent is stationed in Bengaluru, Hyderabad, and Noida—while the lucrative, capital-intensive manufacturing stayed locked in Taiwan, South Korea, and the United States.</p><p>Today, that imbalance is undergoing its most radical transformation in fifty years. Joint ventures pairing domestic industrial conglomerates with established Taiwanese, Japanese, and American foundry operators are bringing commercial wafer fabrication onto Indian soil for the first time.</p>',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'Inside the cleanroom facilities of the national advanced packaging facility at Sanand, Gujarat. (Photo: Special Bureau / The Bharat Chronicle)',
    'Advanced semiconductor wafer processing cleanroom',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    3, 4, 'published',
    10, 1, 0, 0, null,
    7, 14820, 'en', '2026-10-12 09:30:00',
    'Inside India’s Semiconductor Corridor Buildout | The Bharat Chronicle',
    'Deep investigation into India’s multi-billion dollar domestic silicon fabrication facilities across Dholera and Sanand.',
    'https://bharatchronicle.com/article/inside-indias-multibillion-dollar-silicon-fab-buildout'
  );

  insertArt.run(
    2,
    'Reserve Bank Signals Liquidity Normalisation as Core Inflation Stabilises at 3.9%',
    'reserve-bank-signals-liquidity-normalisation-inflation-stabilises',
    'CAPITAL MARKETS',
    'Governor\'s Monetary Policy Statement underscores prudent fiscal stewardship while maintaining growth projections at a robust 7.2% for the fiscal year.',
    '<p>The Reserve Bank of India has maintained its key policy repo rate steady while signaling a gradual transition toward liquidity neutrality. The monetary policy committee noted that core inflation has durably settled inside the target band.</p><p>Financial institutions responded favorably, with benchmark government bond yields easing three basis points in early afternoon trade.</p>',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    'Mint Street, Mumbai: Reserve Bank of India central headquarters.',
    'RBI Headquarters building facade in Mumbai',
    'https://www.youtube.com/watch?v=7NOSDKb0HlU',
    2, 3, 'published',
    8, 1, 0, 0, null,
    4, 8410, 'en', '2026-10-12 11:15:00',
    'Reserve Bank Monetary Policy Review 2026 | The Bharat Chronicle',
    'RBI signals monetary policy normalization as inflation drops to 3.9%.',
    'https://bharatchronicle.com/article/reserve-bank-signals-liquidity-normalisation-inflation-stabilises'
  );

  insertArt.run(
    3,
    'Gaganyaan Orbital Test: Crew Module Completes Hypersonic Re-entry in Bay of Bengal',
    'gaganyaan-orbital-test-crew-module-hypersonic-reentry-success',
    'AEROSPACE MILESTONE',
    'Naval divers recover the uncrewed test vehicle within 38 minutes of splashdown, certifying apex thermal shielding systems.',
    '<p>The Indian Space Research Organisation has achieved another decisive validation milestone for the nation’s human spaceflight program.</p><p>Launched aboard the human-rated LVM3 vehicle from the Satish Dhawan Space Centre at Sriharikota, the test craft completed nominal orbital maneuvers before executing a controlled atmospheric descent.</p>',
    'https://images.unsplash.com/photo-1517976487502-570a9a4b087a?auto=format&fit=crop&w=800&q=80',
    'Naval recovery teams alongside the orbital module off the coast of Visakhapatnam.',
    'Gaganyaan crew module splashdown recovery',
    'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    3, 4, 'published',
    9, 1, 1, 0, null,
    5, 11250, 'en', '2026-10-12 14:00:00',
    'Gaganyaan Hypersonic Re-entry Mission Success | The Bharat Chronicle',
    'ISRO crew capsule successfully recovered in Bay of Bengal following uncrewed orbital test.',
    'https://bharatchronicle.com/article/gaganyaan-orbital-test-crew-module-hypersonic-reentry-success'
  );

  // 5. Ad Placements (All 7 standard placements)
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

  // 6. Advertisements
  const insertAd = db.prepare(`
    INSERT INTO advertisements (id, placement_id, title, client_name, ad_type, banner_image_url, target_url, impressions_count, clicks_count, start_date, end_date, is_active, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);
  insertAd.run(1, 1, 'India Global Tech Summit 2026 — Registration Open', 'Confederation of Indian Industry', 'image', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=970&q=80', 'https://example.com/summit', 142400, 3540, '2026-01-01', '2026-12-31', 10);
  insertAd.run(2, 4, 'Green Infrastructure Sovereign Bonds 2026', 'National Infrastructure Investment Fund', 'image', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=300&q=80', 'https://example.com/greenfund', 98200, 2110, '2026-01-01', '2026-12-31', 8);
  insertAd.run(3, 3, 'Bharat Green Hydrogen Mission — Sovereign Portfolio', 'Ministry of New & Renewable Energy Partner', 'image', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=970&q=80', 'https://example.com/hydrogen', 64100, 1420, '2026-01-01', '2026-12-31', 7);
  insertAd.run(4, 2, 'Tata Consultancy Services — Sovereign Cloud Infrastructure', 'Tata Sons', 'image', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', 'https://example.com/tata-cloud', 42000, 950, '2026-01-01', '2026-12-31', 9);
  insertAd.run(5, 5, 'Mahindra Electric Mobility — Commercial Fleet Solutions', 'Mahindra Group', 'image', 'https://images.unsplash.com/photo-1558441719-74e50d60d381?auto=format&fit=crop&w=970&q=80', 'https://example.com/mahindra-ev', 31500, 680, '2026-01-01', '2026-12-31', 6);
  insertAd.run(6, 6, 'State Bank of India — Global Trade Remittance Corridor', 'State Bank of India', 'image', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=970&q=80', 'https://example.com/sbi-trade', 28900, 520, '2026-01-01', '2026-12-31', 5);
  insertAd.run(7, 7, 'Infosys Digital Innovation Award 2026 — Nominate Now', 'Infosys Foundation', 'image', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80', 'https://example.com/infosys-awards', 51200, 1140, '2026-01-01', '2026-12-31', 9);

  // 7. Site Settings
  const insertSetting = db.prepare(`
    INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertSetting.run('site_name', 'The Bharat Chronicle', 'general', 1, 'Master publication brand title');
  insertSetting.run('site_tagline', 'Independent National Daily of Record', 'general', 1, 'Official masthead subtitle');
  insertSetting.run('site_motto', 'Veritas et Libertas • Est. 1928', 'general', 1, 'Classical heritage motto');
  insertSetting.run('press_council_registration', 'REG-BC-2026-DEL-0941', 'compliance', 1, 'Press Council of India accreditation code');
  insertSetting.run('editorial_email', 'editorial@bharatchronicle.com', 'contact', 1, 'Central newsroom desk address');
  insertSetting.run('ad_sales_email', 'advertising@bharatchronicle.com', 'monetization', 1, 'Commercial sponsorships desk email');
  insertSetting.run('breaking_news_enabled', '1', 'editorial', 1, 'Global breaking news ticker master switch');
  insertSetting.run('adsense_publisher_id', '', 'monetization', 1, 'Google AdSense publisher ID (e.g. ca-pub-XXXXXXXXXXXXXXXX)');
  insertSetting.run('adsense_auto_ads_enabled', '0', 'monetization', 1, 'Enable AdSense Auto Ads tag');
  insertSetting.run('ads_provider_type', 'custom', 'monetization', 1, 'Active ad delivery mode: custom, adsense, or hybrid');
  insertSetting.run('google_analytics_id', '', 'integrations', 1, 'Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)');
  insertSetting.run('google_search_console_code', '', 'integrations', 1, 'Google Search Console verification meta tag');
  insertSetting.run('youtube_channel_url', 'https://www.youtube.com/@TheBharatChronicle', 'multimedia', 1, 'Official YouTube channel link');
  insertSetting.run('youtube_channel_name', 'The Bharat Chronicle Digital Newsroom', 'multimedia', 1, 'Display channel branding title');
  insertSetting.run('featured_youtube_video_id', 'dQw4w9WgXcQ', 'multimedia', 1, 'Featured video displayed on homepage');
  insertSetting.run('media_kit_url', '/downloads/Bharat_Chronicle_Media_Kit_2026.pdf', 'monetization', 1, 'Downloadable media kit specifications');
  insertSetting.run('advertiser_desk_email', 'advertising@bharatchronicle.com', 'monetization', 1, 'Commercial partnership enquiries inbox');
  insertSetting.run('advertiser_desk_phone', '+91 (11) 4890-2800', 'monetization', 1, 'Commercial desk direct hotline');
  insertSetting.run('privacy_compliance_mode', 'dpdp_act_india', 'compliance', 1, 'Privacy compliance mode: dpdp_act_india or gdpr');
  insertSetting.run('cookie_consent_required', '1', 'compliance', 1, 'Show consent banner on visitor initial arrival');

  // 8. YouTube Videos
  const insertYt = db.prepare(`
    INSERT INTO youtube_videos (id, youtube_id, title, description, thumbnail_url, published_at, is_featured, is_active, related_article_id, display_order)
    VALUES (?, ?, ?, ?, ?, datetime('now'), ?, 1, ?, ?)
  `);
  insertYt.run(1, 'dQw4w9WgXcQ', 'Inside India’s Semiconductor Corridor: Cleanroom Tour in Sanand', 'Exclusive Bharat Chronicle video dispatch examining the multi-billion dollar domestic chip fabrication buildout in Gujarat.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', 1, 1, 1);
  insertYt.run(2, '7NOSDKb0HlU', 'Monetary Policy Briefing: Reserve Bank Governor on Inflation Targets', 'Key takeaways from the RBI Monetary Policy Committee resolution and economic growth forecast.', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80', 0, 2, 2);
  insertYt.run(3, 'kJQP7kiw5Fk', 'Himalayan Clean Energy: Assessing Run-of-the-River Hydro Projects', 'Field report on ecological balance and clean power transmission in the northern states.', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', 0, 3, 3);

  console.log('✓ Operational store seeded with initial staff, articles, placements, and settings.');
}

// Translate common MySQL functions to SQLite
export function translateMysqlToSqlite(sql) {
  let translated = sql
    .replace(/\bNOW\(\)/gi, "datetime('now')")
    .replace(/\bCURDATE\(\)/gi, "date('now')")
    .replace(/\bRAND\(\)/gi, "random()")
    .replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+HOUR\s*\)/gi, "datetime('now', '-$1 hours')")
    .replace(/DATE_SUB\s*\(\s*NOW\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "datetime('now', '-$1 days')")
    .replace(/DATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi, "date('now', '-$1 days')")
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
