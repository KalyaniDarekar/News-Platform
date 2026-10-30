-- ========================================================================
-- JANTA JOURNAL — cPanel MySQL Database Repair & Marquee Placements Migration
-- Compatible with cPanel MySQL 8.0+ / MariaDB 10.4+ / CloudLinux LiteSpeed
-- Run this in phpMyAdmin if you want to verify your database manually.
-- ========================================================================

-- 1. Ensure ad_placements table exists and has all 11 placements (including Marquee)
CREATE TABLE IF NOT EXISTS `ad_placements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `placement_code` VARCHAR(80) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `dimensions` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `ad_placements` (`placement_code`, `name`, `dimensions`, `is_active`)
VALUES
  ('header_leaderboard', 'Top Header Super Leaderboard', '970x90', 1),
  ('marquee_top', 'Top Marquee Ad (Below Day/Date)', 'Single Line Marquee', 1),
  ('marquee_breaking', 'Breaking Marquee Ad (Below Breaking News)', 'Single Line Marquee', 1),
  ('marquee_both', 'Marquee Ad (Both Top & Breaking)', 'Single Line Marquee', 1),
  ('homepage_hero_adjacent', 'Homepage Hero-Adjacent Half-Page / Display', '300x600', 1),
  ('homepage_mid_billboard', 'Homepage Mid-Section Billboard', '970x120', 1),
  ('article_inline', 'In-Article Inline Native Leaderboard', '728x90', 1),
  ('article_sidebar_top', 'Article Sidebar Top Medium Rectangle', '300x250', 1),
  ('category_page_banner', 'Category Page Header Billboard', '728x90', 1),
  ('footer_banner', 'Global Footer Super Leaderboard', '970x90', 1),
  ('mobile_anchor_banner', 'Responsive Mobile Sticky Anchor Banner', '320x50', 1)
ON DUPLICATE KEY UPDATE 
  `name` = VALUES(`name`),
  `dimensions` = VALUES(`dimensions`),
  `is_active` = 1;

-- 2. Ensure advertisements table exists and has correct columns & nullability
CREATE TABLE IF NOT EXISTS `advertisements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `placement_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `ad_type` VARCHAR(20) NOT NULL DEFAULT 'image',
  `banner_image_url` VARCHAR(500) NULL,
  `ad_code` TEXT NULL,
  `target_url` VARCHAR(500) NULL,
  `impressions_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `clicks_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `priority` INT NOT NULL DEFAULT 5,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ad_active_dates` (`is_active`, `start_date`, `end_date`),
  CONSTRAINT `fk_ad_placement` FOREIGN KEY (`placement_id`) REFERENCES `ad_placements` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modify existing columns if needed
ALTER TABLE `advertisements` MODIFY COLUMN `banner_image_url` VARCHAR(500) NULL;
ALTER TABLE `advertisements` MODIFY COLUMN `target_url` VARCHAR(500) NULL;

-- 3. Ensure Direct Advertiser Enquiries (CRM Leads) table exists
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

-- 4. Ensure site_settings exists and seed Marquee toggles
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NULL,
  `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
  `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NULL,
  `updated_by` INT UNSIGNED NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `is_public`, `description`)
VALUES
  ('ad_marquee_top_enabled', '1', 'monetization', 1, 'Master switch for single-line scrolling marquee ad below top date bar'),
  ('ad_marquee_breaking_enabled', '1', 'monetization', 1, 'Master switch for single-line scrolling marquee ad below breaking news bar')
ON DUPLICATE KEY UPDATE `is_public` = 1;

-- 5. Grant Editor role permissions for ad monetization & enquiries
INSERT IGNORE INTO `role_permissions` (`role`, `permission_key`, `description`)
VALUES
  ('editor', 'ads:manage', 'Manage commercial campaigns and marquee ads'),
  ('editor', 'enquiries:manage', 'Manage advertiser leads and enquiries'),
  ('editor', 'settings:manage', 'Manage site settings and marquee toggles');



-- 6. Link Sponsored / Brandpost Articles with Commercial Ads Inventory
ALTER TABLE `articles` ADD COLUMN IF NOT EXISTS `sponsor_placement_code` VARCHAR(80) NULL DEFAULT 'marquee_top';
ALTER TABLE `advertisements` ADD COLUMN IF NOT EXISTS `article_id` INT UNSIGNED NULL;
