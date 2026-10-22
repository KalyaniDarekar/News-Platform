-- ========================================================================
-- JANTA JOURNAL — Production Seed Data
-- Default Users, Role Permissions, Editorial Taxonomies & Site Settings
-- ========================================================================

-- 1. Seed Editorial Staff Users
INSERT INTO `users` (`id`, `username`, `full_name`, `email`, `password_hash`, `role`, `designation`, `bio`, `status`)
VALUES 
(1, 'SuperAdmin', 'Super Admin', 'superadmin@jantajournal.com', '$2b$10$zGfw4eriJ2NoGUuFPLwh9.Sgb9tsUgoNUnKrD6c5W9yUbEEV9JnPO', 'super_admin', 'Editor-in-Chief & Managing Director', 'Managing Director and SuperAdmin of Janta Journal.', 'active'),
(2, 'Editor', 'Lead Editor', 'editor@jantajournal.com', '$2b$10$6mkekFVJNYxAvxIK3xSRPOAqHOXPrCZVV19PvqXmis80FDHYe4tbq', 'editor', 'Senior News Editor', 'Editorial desk clearance and quality review.', 'active'),
(3, 'Reporter', 'Staff Reporter', 'reporter@jantajournal.com', '$2b$10$uuOr5P2boHyrAjzv5l9PsukvKVRGBP0QIN7BKD9Jkcvo9mipidc6m', 'reporter', 'Chief Technology Bureau Correspondent', 'Specializing in reporting and dispatches.', 'active')
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`), `email`=VALUES(`email`), `full_name`=VALUES(`full_name`), `password_hash`=VALUES(`password_hash`), `role`=VALUES(`role`), `status`='active';

-- 2. Seed Role Permissions
INSERT IGNORE INTO `role_permissions` (`role`, `permission_key`, `description`)
VALUES
('super_admin', 'articles:all', 'Complete control over all articles'),
('super_admin', 'articles:publish', 'Publish or schedule articles to public website'),
('super_admin', 'articles:review', 'Review and approve articles submitted by staff'),
('super_admin', 'users:manage', 'Create, edit, suspend newsroom users'),
('super_admin', 'categories:manage', 'Manage categories and hierarchy'),
('super_admin', 'settings:manage', 'Manage site settings and legal accreditation'),
('super_admin', 'ads:manage', 'Manage commercial campaigns'),
('super_admin', 'audit:view', 'View newsroom audit trail'),
('editor', 'articles:create', 'Create new articles and drafts'),
('editor', 'articles:edit_all', 'Edit any staff article'),
('editor', 'articles:review', 'Review and approve articles submitted by staff'),
('editor', 'articles:publish', 'Publish or schedule articles to public website'),
('editor', 'articles:delete', 'Archive or delete articles'),
('editor', 'categories:manage', 'Manage categories and hierarchy'),
('editor', 'media:upload', 'Upload media assets'),
('editor', 'audit:view', 'View newsroom audit trail'),
('reporter', 'articles:create', 'Create new articles and drafts'),
('reporter', 'articles:edit_own', 'Edit own drafted articles'),
('reporter', 'articles:submit_review', 'Submit articles for editorial review'),
('reporter', 'media:upload', 'Upload media assets');

-- 3. Seed Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `display_order`, `color_badge`, `is_active`)
VALUES 
(1, 'National', 'national', 'Governance, policy, states, Parliament, and national affairs', NULL, 1, '#0A2540', 1),
(2, 'World', 'world', 'Global geopolitics, diplomacy, international security, and bilateral pacts', NULL, 2, '#1E3A8A', 1),
(3, 'Economy & Markets', 'economy', 'Fiscal policy, RBI, corporate earnings, stock markets, and trade', NULL, 3, '#047857', 1),
(4, 'Tech & AI', 'tech', 'Artificial intelligence, semiconductors, digital public infra, and startups', NULL, 4, '#4338CA', 1),
(5, 'Opinion & Editorial', 'opinion', 'In-depth perspectives, analytical essays, and editorial board stances', NULL, 5, '#B45309', 1),
(6, 'Climate & Environment', 'climate', 'Clean energy transition, monsoons, agricultural economics, and climate summits', NULL, 6, '#065F46', 1),
(7, 'Culture & Life', 'culture', 'Literature, architecture, heritage, art, food, and modern society', NULL, 7, '#7C3AED', 1),
(8, 'Sports', 'sports', 'Cricket, Olympic disciplines, chess grandmasters, and world championships', NULL, 8, '#C2410C', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `slug`=VALUES(`slug`);

-- 4. Seed Tags
INSERT INTO `tags` (`id`, `name`, `slug`)
VALUES
(1, 'SemiconductorMission', 'semiconductor-mission'),
(2, 'RBIMonetaryPolicy', 'rbi-monetary-policy'),
(3, 'SpaceTech', 'space-tech'),
(4, 'SupremeCourtReview', 'supreme-court-review'),
(5, 'DeepTech', 'deep-tech'),
(6, 'GreenHydrogen', 'green-hydrogen')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 5. Seed Ad Placements
INSERT INTO `ad_placements` (`id`, `placement_code`, `name`, `dimensions`, `is_active`)
VALUES
(1, 'header_leaderboard', 'Top Header Super Leaderboard', '970x90', 1),
(2, 'article_sidebar_top', 'Article Sidebar Top Rectangle', '300x250', 1),
(3, 'homepage_mid_billboard', 'Homepage Mid-Section Billboard', '970x120', 1),
(4, 'article_inline', 'In-Article Inline Leaderboard', '728x90', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 6. Seed Platform Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `is_public`, `description`)
VALUES
('site_name', 'JANTA JOURNAL', 'general', 1, 'Master publication brand title'),
('site_tagline', 'Independent National Daily of Record', 'general', 1, 'Official masthead subtitle'),
('site_motto', 'Veritas et Libertas • Est. 1928', 'general', 1, 'Classical heritage motto'),
('press_council_registration', 'REG-BC-2026-DEL-0941', 'compliance', 1, 'Press Council of India accreditation code'),
('editorial_email', 'editorial@jantajournal.com', 'contact', 1, 'Central newsroom desk address'),
('ad_sales_email', 'advertising@jantajournal.com', 'monetization', 1, 'Commercial sponsorships desk email'),
('breaking_news_enabled', '1', 'editorial', 1, 'Global breaking news ticker master switch'),
('comments_require_approval', '1', 'moderation', 0, 'Auto-quarantine reader submissions')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);

-- 7. Seed Initial System Audit Log
INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`)
VALUES
(1, 'SYSTEM_INIT', 'system', NULL, '{"event": "Database schema and core staff initialized for production"}', '127.0.0.1');
