-- ========================================================================
-- The Bharat Chronicle — Production MySQL Database Schema (Phase 2)
-- Architecture: cPanel / MySQL 8.0+ / MariaDB 10.4+
-- Character Set: utf8mb4 / utf8mb4_unicode_ci (Supports English, Hindi, Marathi, Multilingual)
-- ========================================================================

-- Drop tables in reverse foreign key order if re-initializing
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users and Role-Based Permissions
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NULL UNIQUE,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'editor', 'reporter', 'ad_manager') NOT NULL DEFAULT 'reporter',
  `designation` VARCHAR(120) DEFAULT 'Staff Correspondent',
  `bio` TEXT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
  `last_login_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Role Permissions (Granular capability matrix)
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `role` ENUM('super_admin', 'editor', 'reporter', 'ad_manager') NOT NULL,
  `permission_key` VARCHAR(80) NOT NULL,
  `description` VARCHAR(200) NULL,
  UNIQUE KEY `uk_role_permission` (`role`, `permission_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Categories (Hierarchical with display order & taxonomy colors)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(140) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `parent_id` INT UNSIGNED NULL DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `color_badge` VARCHAR(20) DEFAULT '#0A2540',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cat_slug` (`slug`),
  INDEX `idx_cat_order` (`display_order`),
  INDEX `idx_cat_active` (`is_active`),
  CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tags
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tag_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. News Articles
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `kicker` VARCHAR(100) NULL COMMENT 'Editorial label above headline e.g. SPECIAL INVESTIGATION',
  `short_description` TEXT NOT NULL,
  `article_body` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(500) NULL,
  `image_caption` VARCHAR(255) NULL,
  `alt_text` VARCHAR(255) NULL COMMENT 'Accessibility alt text for featured image',
  `youtube_url` VARCHAR(500) NULL COMMENT 'Primary YouTube/video embed URL for this article',
  `author_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `status` ENUM('draft', 'in_review', 'scheduled', 'published', 'expired', 'archived') NOT NULL DEFAULT 'draft',
  `priority` INT NOT NULL DEFAULT 0 COMMENT 'Higher number indicates higher editorial placement priority',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_breaking` TINYINT(1) NOT NULL DEFAULT 0,
  `is_sponsored` TINYINT(1) NOT NULL DEFAULT 0,
  `sponsor_client` VARCHAR(150) NULL,
  `reading_time_minutes` INT NOT NULL DEFAULT 4,
  `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `language` VARCHAR(10) NOT NULL DEFAULT 'en' COMMENT 'Language code: en, mr (Marathi), hi (Hindi)',
  `scheduled_publication_time` DATETIME NULL,
  `publication_time` DATETIME NULL,
  `expiry_time` DATETIME NULL,
  `meta_title` VARCHAR(255) NULL,
  `meta_description` VARCHAR(320) NULL,
  `meta_keywords` VARCHAR(255) NULL,
  `canonical_url` VARCHAR(500) NULL,
  `og_image` VARCHAR(500) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_art_status_pub` (`status`, `publication_time`),
  INDEX `idx_art_breaking` (`is_breaking`),
  INDEX `idx_art_featured` (`is_featured`),
  INDEX `idx_art_priority` (`priority`),
  INDEX `idx_art_category` (`category_id`),
  INDEX `idx_art_author` (`author_id`),
  INDEX `idx_art_language` (`language`),
  INDEX `idx_art_scheduled` (`scheduled_publication_time`),
  INDEX `idx_art_expiry` (`status`, `expiry_time`),
  FULLTEXT `ft_art_search` (`title`, `short_description`, `article_body`),
  CONSTRAINT `fk_art_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_art_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Article-Tag Pivot Table
CREATE TABLE IF NOT EXISTS `article_tags` (
  `article_id` INT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`),
  CONSTRAINT `fk_at_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_at_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Article Revisions (Version history & audit trail)
CREATE TABLE IF NOT EXISTS `article_revisions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `article_id` INT UNSIGNED NOT NULL,
  `revision_number` INT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `short_description` TEXT NOT NULL,
  `article_body` LONGTEXT NOT NULL,
  `edited_by` INT UNSIGNED NOT NULL,
  `revision_notes` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_rev_article` (`article_id`, `revision_number`),
  CONSTRAINT `fk_rev_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_user` FOREIGN KEY (`edited_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Social / Video Embed Metadata
CREATE TABLE IF NOT EXISTS `article_multimedia` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `article_id` INT UNSIGNED NOT NULL,
  `media_type` ENUM('youtube', 'vimeo', 'twitter_x', 'video_upload', 'audio_podcast') NOT NULL,
  `embed_url` VARCHAR(500) NOT NULL,
  `duration_seconds` INT UNSIGNED NULL,
  `thumbnail_url` VARCHAR(500) NULL,
  `transcript` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_mm_article` (`article_id`),
  CONSTRAINT `fk_mm_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Media Assets Library
CREATE TABLE IF NOT EXISTS `media_assets` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size_bytes` BIGINT UNSIGNED NOT NULL,
  `width` INT UNSIGNED NULL,
  `height` INT UNSIGNED NULL,
  `alt_text` VARCHAR(255) NULL,
  `caption` VARCHAR(255) NULL,
  `uploaded_by` INT UNSIGNED NULL,
  `file_data` LONGBLOB NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_media_mime` (`mime_type`),
  CONSTRAINT `fk_media_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Advertisement Placements (Slot Inventory)
CREATE TABLE IF NOT EXISTS `ad_placements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `placement_code` VARCHAR(80) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `dimensions` VARCHAR(50) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Advertisements & Commercial Campaigns
CREATE TABLE IF NOT EXISTS `advertisements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `placement_id` INT UNSIGNED NOT NULL,
  `title` VARCHAR(180) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `ad_type` ENUM('image', 'code') NOT NULL DEFAULT 'image',
  `banner_image_url` VARCHAR(500) NOT NULL,
  `ad_code` TEXT NULL,
  `target_url` VARCHAR(500) NOT NULL,
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

-- 12. Site Settings
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NULL,
  `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
  `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  `description` VARCHAR(255) NULL,
  `updated_by` INT UNSIGNED NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_setting_user` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Aggregated Hourly Article Views & Analytics
CREATE TABLE IF NOT EXISTS `article_views_hourly` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `article_id` INT UNSIGNED NOT NULL,
  `view_hour` DATETIME NOT NULL,
  `view_count` INT UNSIGNED NOT NULL DEFAULT 1,
  `device_mobile_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `device_desktop_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_article_hour` (`article_id`, `view_hour`),
  CONSTRAINT `fk_view_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Newsroom Audit Logs (Editorial compliance & security)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(60) NOT NULL,
  `entity_id` INT UNSIGNED NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_user` (`user_id`),
  INDEX `idx_audit_action` (`action`),
  INDEX `idx_audit_entity` (`entity_type`, `entity_id`),
  INDEX `idx_audit_created` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================================
-- Phase 3 Migration Script
-- Run this block ONLY against an existing Phase 2 database.
-- Safe to skip if running schema.sql fresh on a new database.
-- ========================================================================

-- MIGRATION: Add 'expired' status to articles
-- ALTER TABLE `articles`
--   MODIFY COLUMN `status` ENUM('draft', 'in_review', 'scheduled', 'published', 'expired', 'archived') NOT NULL DEFAULT 'draft';

-- MIGRATION: Add alt_text and youtube_url columns
-- ALTER TABLE `articles`
--   ADD COLUMN `alt_text` VARCHAR(255) NULL COMMENT 'Accessibility alt text for featured image' AFTER `image_caption`,
--   ADD COLUMN `youtube_url` VARCHAR(500) NULL COMMENT 'Primary YouTube/video embed URL' AFTER `alt_text`;

-- MIGRATION: Add composite expiry index
-- ALTER TABLE `articles`
--   ADD INDEX `idx_art_expiry` (`status`, `expiry_time`);
