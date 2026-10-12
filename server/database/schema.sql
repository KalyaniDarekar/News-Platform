-- ========================================================================
-- The Bharat Chronicle - Production MySQL Database Schema
-- Architecture Target: cPanel MySQL / MariaDB 10.4+ / MySQL 8.0+
-- Encoding: utf8mb4_unicode_ci
-- ========================================================================

CREATE DATABASE IF NOT EXISTS `bharat_chronicle_db` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `bharat_chronicle_db`;

-- 1. Users & Editorial Staff
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('editor_in_chief', 'senior_editor', 'reporter', 'ad_manager', 'super_admin') NOT NULL DEFAULT 'reporter',
  `avatar_url` VARCHAR(500) NULL,
  `designation` VARCHAR(100) DEFAULT 'Staff Correspondent',
  `bio` TEXT NULL,
  `status` ENUM('active', 'suspended', 'inactive') NOT NULL DEFAULT 'active',
  `last_login_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `description` VARCHAR(255) NULL,
  `parent_id` INT UNSIGNED NULL DEFAULT NULL,
  `display_order` INT NOT NULL DEFAULT 0,
  `color_badge` VARCHAR(20) DEFAULT '#0A2540',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cat_slug` (`slug`),
  INDEX `idx_cat_order` (`display_order`),
  CONSTRAINT `fk_cat_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Articles (News & Op-Ed Stories)
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `kicker` VARCHAR(100) NULL COMMENT 'Small label above headline e.g. DIPLOMATIC BRIEF',
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `featured_image` VARCHAR(500) NULL,
  `image_caption` VARCHAR(255) NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `author_id` INT UNSIGNED NOT NULL,
  `status` ENUM('draft', 'in_review', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'draft',
  `is_breaking` TINYINT(1) NOT NULL DEFAULT 0,
  `is_lead` TINYINT(1) NOT NULL DEFAULT 0,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `is_opinion` TINYINT(1) NOT NULL DEFAULT 0,
  `is_sponsored` TINYINT(1) NOT NULL DEFAULT 0,
  `sponsor_name` VARCHAR(150) NULL,
  `reading_time_minutes` INT NOT NULL DEFAULT 3,
  `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `meta_title` VARCHAR(255) NULL,
  `meta_description` VARCHAR(320) NULL,
  `scheduled_at` DATETIME NULL,
  `published_at` DATETIME NULL,
  `expires_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_art_status_pub` (`status`, `published_at`),
  INDEX `idx_art_breaking` (`is_breaking`),
  INDEX `idx_art_lead` (`is_lead`),
  INDEX `idx_art_category` (`category_id`),
  INDEX `idx_art_author` (`author_id`),
  FULLTEXT `ft_art_search` (`title`, `summary`, `content`),
  CONSTRAINT `fk_art_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_art_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tags
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tag_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Article-Tag Pivot Table
CREATE TABLE IF NOT EXISTS `article_tags` (
  `article_id` INT UNSIGNED NOT NULL,
  `tag_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`article_id`, `tag_id`),
  CONSTRAINT `fk_at_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_at_tag` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Media Library
CREATE TABLE IF NOT EXISTS `media` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `file_size_bytes` BIGINT UNSIGNED NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `alt_text` VARCHAR(255) NULL,
  `caption` VARCHAR(255) NULL,
  `uploaded_by` INT UNSIGNED NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_media_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Advertising Inventory & Campaigns (Monetization Engine)
CREATE TABLE IF NOT EXISTS `advertisements` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `slot_position` ENUM(
    'header_leaderboard', 
    'article_sidebar_top', 
    'article_sidebar_bottom', 
    'article_inline_content', 
    'homepage_mid_billboard',
    'footer_sticky'
  ) NOT NULL,
  `client_name` VARCHAR(150) NOT NULL,
  `banner_image_url` VARCHAR(500) NOT NULL,
  `target_url` VARCHAR(500) NOT NULL,
  `target_blank` TINYINT(1) NOT NULL DEFAULT 1,
  `impressions_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `clicks_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ad_slot` (`slot_position`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Platform Global Settings
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE,
  `setting_value` TEXT NULL,
  `setting_group` VARCHAR(50) NOT NULL DEFAULT 'general',
  `description` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Newsroom Audit Log
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(50) NOT NULL,
  `entity_id` INT UNSIGNED NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_user` (`user_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
