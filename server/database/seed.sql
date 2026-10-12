-- ========================================================================
-- The Bharat Chronicle - Initial Seed Data (Phase 1 Baseline)
-- ========================================================================

USE `bharat_chronicle_db`;

-- Insert Editorial Staff Users
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `avatar_url`, `designation`, `bio`, `status`)
VALUES 
(1, 'Vikramaditya Sharma', 'editor@bharatchronicle.com', '$2b$10$eW8mK8.89a9L5W0g7U3RveBvO4oY/2s0s90yFvR4sA1z1s8d1j2e', 'editor_in_chief', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Editor-in-Chief', 'Journalist with over 25 years covering Indian diplomacy, economy, and geopolitical strategy.', 'active'),
(2, 'Dr. Arundhati Sen', 'arundhati.sen@bharatchronicle.com', '$2b$10$eW8mK8.89a9L5W0g7U3RveBvO4oY/2s0s90yFvR4sA1z1s8d1j2e', 'senior_editor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80', 'Senior Editor (Economy & Markets)', 'Former financial policy researcher covering Reserve Bank of India, fiscal budgets, and trade corridors.', 'active'),
(3, 'Rajeshwari Nair', 'r.nair@bharatchronicle.com', '$2b$10$eW8mK8.89a9L5W0g7U3RveBvO4oY/2s0s90yFvR4sA1z1s8d1j2e', 'reporter', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80', 'Technology & Science Bureau Chief', 'Specializing in deep tech, semiconductor ecosystems, AI governance, and space exploration.', 'active'),
(4, 'Siddharth Roy', 's.roy@bharatchronicle.com', '$2b$10$eW8mK8.89a9L5W0g7U3RveBvO4oY/2s0s90yFvR4sA1z1s8d1j2e', 'ad_manager', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 'Head of Monetization & Ad Operations', 'Managing commercial inventory, sponsored partner programs, and programmatic yield.', 'active')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`);

-- Insert News Categories
INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `display_order`, `color_badge`, `is_active`)
VALUES 
(1, 'National', 'national', 'Governance, policy, states, Parliament, and national affairs', 1, '#0A2540', 1),
(2, 'World', 'world', 'Global geopolitics, diplomacy, international security, and bilateral pacts', 2, '#1E3A8A', 1),
(3, 'Economy & Markets', 'economy', 'Fiscal policy, RBI, corporate earnings, stock markets, and trade', 3, '#047857', 1),
(4, 'Tech & AI', 'tech', 'Artificial intelligence, semiconductors, digital public infra, and startups', 4, '#4338CA', 1),
(5, 'Opinion & Editorial', 'opinion', 'In-depth perspectives, analytical essays, and editorial board stances', 5, '#B45309', 1),
(6, 'Climate & Environment', 'climate', 'Clean energy transition, monsoons, agricultural economics, and climate summits', 6, '#065F46', 1),
(7, 'Culture & Life', 'culture', 'Literature, architecture, heritage, art, food, and modern society', 7, '#7C3AED', 1),
(8, 'Sports', 'sports', 'Cricket, Olympic disciplines, chess grandmasters, and world championships', 8, '#C2410C', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Insert Platform Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `description`)
VALUES
('site_name', 'The Bharat Chronicle', 'general', 'Master publication brand title'),
('site_tagline', 'Independent National Daily of Record', 'general', 'Official masthead subtitle'),
('breaking_news_enabled', '1', 'editorial', 'Toggles global breaking news ticker on public frontend'),
('contact_email', 'editorial@bharatchronicle.com', 'contact', 'Public editorial enquiries address'),
('ad_sales_email', 'advertising@bharatchronicle.com', 'monetization', 'Commercial sponsor desk email'),
('press_council_registration', 'REG-BC-2026-DEL-0941', 'compliance', 'Accreditation reference number')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);

-- Insert Sample Advertisements
INSERT INTO `advertisements` (`id`, `title`, `slot_position`, `client_name`, `banner_image_url`, `target_url`, `impressions_count`, `clicks_count`, `is_active`, `start_date`, `end_date`)
VALUES
(1, 'India Global Tech Summit 2026', 'header_leaderboard', 'Confederation of Indian Industry', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=970&q=80', 'https://example.com/summit', 14200, 312, 1, '2026-01-01', '2026-12-31'),
(2, 'Green Energy Infrastructure Fund', 'article_sidebar_top', 'National Infrastructure Bank', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=300&q=80', 'https://example.com/greenfund', 9800, 185, 1, '2026-01-01', '2026-12-31')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);
