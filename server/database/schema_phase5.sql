-- ========================================================================
-- JANTA JOURNAL — Phase 5 Database Schema Migration
-- Revenue Infrastructure, Ad Placements, Direct Enquiries & First-Party Analytics
-- Compatible with MySQL 8.0+ / MariaDB 10.4+ / cPanel MySQL
-- ========================================================================

-- 1. Ensure all 7 standard ad placements exist
INSERT INTO `ad_placements` (`id`, `placement_code`, `name`, `dimensions`, `is_active`)
VALUES
  (1, 'header_leaderboard', 'Header Super Leaderboard', '970x90', 1),
  (2, 'homepage_hero_adjacent', 'Homepage Hero-Adjacent Half-Page / Display', '300x600', 1),
  (3, 'article_inline', 'In-Article Inline Native Leaderboard', '728x90', 1),
  (4, 'article_sidebar_top', 'Article Sidebar Top Medium Rectangle', '300x250', 1),
  (5, 'category_page_banner', 'Category Page Header Billboard', '728x90', 1),
  (6, 'footer_banner', 'Global Footer Super Leaderboard', '970x90', 1),
  (7, 'mobile_anchor_banner', 'Responsive Mobile Sticky Anchor Banner', '320x50', 1)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `dimensions` = VALUES(`dimensions`),
  `is_active` = VALUES(`is_active`);

-- 2. Enhance advertisements table for Phase 5 (support ad code, priority, and rich scheduling)
-- Add columns if not already present
SET @dbname = DATABASE();
SET @tablename = 'advertisements';

-- Column: ad_type ('image' or 'code')
SET @col1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'ad_type');
SET @sql1 = IF(@col1 = 0, 'ALTER TABLE `advertisements` ADD COLUMN `ad_type` ENUM(\'image\', \'code\') NOT NULL DEFAULT \'image\' AFTER `client_name`;', 'SELECT 1;');
PREPARE stmt1 FROM @sql1; EXECUTE stmt1; DEALLOCATE PREPARE stmt1;

-- Column: ad_code (sanitized AdSense or partner snippet)
SET @col2 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'ad_code');
SET @sql2 = IF(@col2 = 0, 'ALTER TABLE `advertisements` ADD COLUMN `ad_code` TEXT NULL AFTER `banner_image_url`;', 'SELECT 1;');
PREPARE stmt2 FROM @sql2; EXECUTE stmt2; DEALLOCATE PREPARE stmt2;

-- Column: priority (higher integer = higher placement weight)
SET @col3 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = @tablename AND COLUMN_NAME = 'priority');
SET @sql3 = IF(@col3 = 0, 'ALTER TABLE `advertisements` ADD COLUMN `priority` INT NOT NULL DEFAULT 5 AFTER `is_active`;', 'SELECT 1;');
PREPARE stmt3 FROM @sql3; EXECUTE stmt3; DEALLOCATE PREPARE stmt3;

-- 3. Direct Advertiser Enquiries Table (Lead capture and CRM pipeline)
CREATE TABLE IF NOT EXISTS `advertiser_enquiries` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(191) NOT NULL,
  `contact_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `website` VARCHAR(255) NULL,
  `budget_range` VARCHAR(100) NOT NULL,
  `preferred_placements` JSON NULL COMMENT 'Array of selected placement codes',
  `flight_start_date` DATE NULL,
  `campaign_objectives` TEXT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('new', 'contacted', 'proposal_sent', 'closed_won', 'closed_lost') NOT NULL DEFAULT 'new',
  `internal_notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_enquiry_status` (`status`),
  INDEX `idx_enquiry_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. YouTube Video News Gallery
CREATE TABLE IF NOT EXISTS `youtube_videos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `youtube_id` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `thumbnail_url` VARCHAR(500) NULL,
  `published_at` DATETIME NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `related_article_id` INT UNSIGNED NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_yt_featured` (`is_featured`),
  INDEX `idx_yt_active` (`is_active`),
  CONSTRAINT `fk_yt_article` FOREIGN KEY (`related_article_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. First-Party Analytics: Page Views Telemetry
CREATE TABLE IF NOT EXISTS `analytics_page_views` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `article_id` INT UNSIGNED NULL,
  `page_path` VARCHAR(255) NOT NULL,
  `page_type` VARCHAR(50) NOT NULL DEFAULT 'article',
  `referrer_source` VARCHAR(100) NOT NULL DEFAULT 'direct',
  `device_type` VARCHAR(30) NOT NULL DEFAULT 'desktop',
  `session_id` VARCHAR(64) NOT NULL,
  `ip_hash` VARCHAR(64) NOT NULL,
  `viewed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pv_article` (`article_id`),
  INDEX `idx_pv_viewed` (`viewed_at`),
  INDEX `idx_pv_type` (`page_type`),
  INDEX `idx_pv_referrer` (`referrer_source`),
  INDEX `idx_pv_dedup` (`session_id`, `page_path`, `viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. First-Party Analytics: Ad Impressions and Clicks Telemetry
CREATE TABLE IF NOT EXISTS `analytics_ad_events` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `ad_id` INT UNSIGNED NOT NULL,
  `event_type` ENUM('impression', 'click') NOT NULL,
  `placement_code` VARCHAR(80) NOT NULL,
  `page_path` VARCHAR(255) NULL,
  `ip_hash` VARCHAR(64) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_adevent_ad` (`ad_id`, `event_type`),
  INDEX `idx_adevent_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Seed Phase 5 Commercial Revenue and Public Integration Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `is_public`, `description`)
VALUES
  ('adsense_publisher_id', '', 'monetization', 1, 'Google AdSense publisher ID (e.g. ca-pub-XXXXXXXXXXXXXXXX)'),
  ('adsense_auto_ads_enabled', '0', 'monetization', 1, 'Enable AdSense Auto Ads tag'),
  ('ads_provider_type', 'custom', 'monetization', 1, 'Active ad delivery mode: custom (direct), adsense, or hybrid'),
  ('google_analytics_id', '', 'integrations', 1, 'Google Analytics 4 Measurement ID (e.g. G-XXXXXXXXXX)'),
  ('google_search_console_code', '', 'integrations', 1, 'Google Search Console verification meta tag value'),
  ('youtube_channel_url', 'https://www.youtube.com/@JantaJournal', 'multimedia', 1, 'Official YouTube channel link for audience subscriptions'),
  ('youtube_channel_name', 'JANTA JOURNAL Digital Newsroom', 'multimedia', 1, 'Display channel branding title'),
  ('featured_youtube_video_id', 'dQw4w9WgXcQ', 'multimedia', 1, 'Featured video displayed in homepage broadcast block'),
  ('media_kit_url', '/downloads/Janta_Journal_Media_Kit_2026.pdf', 'monetization', 1, 'Direct link to downloadable media kit specifications'),
  ('advertiser_desk_email', 'advertising@jantajournal.com', 'monetization', 1, 'Commercial partnership enquiries inbox'),
  ('advertiser_desk_phone', '+91 (11) 4890-2800', 'monetization', 1, 'Commercial desks direct hotline'),
  ('privacy_compliance_mode', 'dpdp_act_india', 'compliance', 1, 'Privacy compliance mode: dpdp_act_india or gdpr'),
  ('cookie_consent_required', '1', 'compliance', 1, 'Show consent banner on visitor initial arrival')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 8. Seed Sample Approved YouTube Videos
INSERT INTO `youtube_videos` (`id`, `youtube_id`, `title`, `description`, `thumbnail_url`, `published_at`, `is_featured`, `is_active`, `related_article_id`, `display_order`)
VALUES
  (1, 'dQw4w9WgXcQ', 'Inside India’s Semiconductor Corridor: Cleanroom Tour in Sanand', 'Exclusive Janta Journal video dispatch examining the multi-billion dollar domestic chip fabrication buildout in Gujarat.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80', NOW(), 1, 1, 1, 1),
  (2, '7NOSDKb0HlU', 'Monetary Policy Briefing: Reserve Bank Governor on Inflation Targets', 'Key takeaways from the RBI Monetary Policy Committee resolution and economic growth forecast.', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80', NOW(), 0, 1, 2, 2),
  (3, 'kJQP7kiw5Fk', 'Himalayan Clean Energy: Assessing Run-of-the-River Hydro Projects', 'Field report on ecological balance and clean power transmission in the northern states.', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', NOW(), 0, 1, 3, 3)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- 9. Seed Sample Verified Direct Advertisers across new placements
INSERT INTO `advertisements` (`id`, `placement_id`, `title`, `client_name`, `ad_type`, `banner_image_url`, `target_url`, `impressions_count`, `clicks_count`, `start_date`, `end_date`, `is_active`, `priority`)
VALUES
  (4, 2, 'Tata Consultancy Services — Sovereign Cloud Infrastructure', 'Tata Sons', 'image', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80', 'https://example.com/tata-cloud', 42000, 950, '2026-01-01', '2026-12-31', 1, 8),
  (5, 5, 'Mahindra Electric Mobility — Commercial Fleet Solutions', 'Mahindra Group', 'image', 'https://images.unsplash.com/photo-1558441719-74e50d60d381?auto=format&fit=crop&w=970&q=80', 'https://example.com/mahindra-ev', 31500, 680, '2026-01-01', '2026-12-31', 1, 5),
  (6, 6, 'State Bank of India — Global Trade Remittance Corridor', 'State Bank of India', 'image', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=970&q=80', 'https://example.com/sbi-trade', 28900, 520, '2026-01-01', '2026-12-31', 1, 6),
  (7, 7, 'Infosys Digital Innovation Award 2026 — Nominate Now', 'Infosys Foundation', 'image', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80', 'https://example.com/infosys-awards', 51200, 1140, '2026-01-01', '2026-12-31', 1, 9)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
