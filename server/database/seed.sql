-- ========================================================================
-- The Bharat Chronicle — Phase 2 Seed Data with Multilingual Articles
-- Default Password for all seeded users: Editorial@2026
-- Hashed using bcrypt: $2b$10$EjjGmDG1TChKPVBabmF81.GOX3bo8M4sRBk26Ao7.uPjqIWT4dLse
-- ========================================================================

-- 1. Seed Editorial Staff Users
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `designation`, `bio`, `status`)
VALUES 
(1, 'Vikramaditya Sharma', 'admin@bharatchronicle.com', '$2b$10$EjjGmDG1TChKPVBabmF81.GOX3bo8M4sRBk26Ao7.uPjqIWT4dLse', 'super_admin', 'Editor-in-Chief & Managing Director', 'Veteran correspondent with over 25 years covering Indian diplomacy, constitutional law, and national security.', 'active'),
(2, 'Dr. Arundhati Sen', 'editor@bharatchronicle.com', '$2b$10$EjjGmDG1TChKPVBabmF81.GOX3bo8M4sRBk26Ao7.uPjqIWT4dLse', 'editor', 'Senior Editor (National & Economy)', 'Former financial policy researcher covering the Reserve Bank of India, fiscal budgets, and international corridors.', 'active'),
(3, 'Rajeshwari Nair', 'reporter@bharatchronicle.com', '$2b$10$EjjGmDG1TChKPVBabmF81.GOX3bo8M4sRBk26Ao7.uPjqIWT4dLse', 'reporter', 'Chief Technology Bureau Correspondent', 'Specializing in deep tech, semiconductor foundries, AI governance, and space exploration.', 'active'),
(4, 'Siddharth Roy', 'ads@bharatchronicle.com', '$2b$10$EjjGmDG1TChKPVBabmF81.GOX3bo8M4sRBk26Ao7.uPjqIWT4dLse', 'ad_manager', 'Head of Monetization & Ad Operations', 'Managing commercial inventory, sponsored partner programs, and programmatic yield monetization.', 'active')
ON DUPLICATE KEY UPDATE `full_name`=VALUES(`full_name`), `password_hash`=VALUES(`password_hash`), `role`=VALUES(`role`);

-- 2. Seed Role Permissions
INSERT IGNORE INTO `role_permissions` (`role`, `permission_key`, `description`)
VALUES
('super_admin', 'articles:all', 'Complete control over all articles'),
('super_admin', 'users:manage', 'Create, edit, suspend newsroom users'),
('super_admin', 'categories:manage', 'Manage categories and hierarchy'),
('super_admin', 'settings:manage', 'Manage site settings and legal accreditation'),
('super_admin', 'ads:manage', 'Manage commercial campaigns'),
('super_admin', 'audit:view', 'View newsroom audit trail'),
('editor', 'articles:create', 'Create new articles and drafts'),
('editor', 'articles:edit_all', 'Edit any staff article'),
('editor', 'articles:publish', 'Publish or schedule articles to public website'),
('editor', 'articles:delete', 'Archive or delete articles'),
('editor', 'categories:manage', 'Manage categories and hierarchy'),
('editor', 'media:upload', 'Upload media assets'),
('editor', 'audit:view', 'View newsroom audit trail'),
('reporter', 'articles:create', 'Create new articles and drafts'),
('reporter', 'articles:edit_own', 'Edit own drafted articles'),
('reporter', 'media:upload', 'Upload media assets'),
('ad_manager', 'ads:manage', 'Manage ad slots, campaigns and sponsors'),
('ad_manager', 'analytics:view', 'View reader analytics and yield');

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

-- 5. Seed Articles (English, Marathi, Hindi)
INSERT INTO `articles` (
  `id`, `title`, `slug`, `kicker`, `short_description`, `article_body`, 
  `featured_image`, `image_caption`, `author_id`, `category_id`, `status`, 
  `priority`, `is_featured`, `is_breaking`, `is_sponsored`, `sponsor_client`, 
  `reading_time_minutes`, `view_count`, `language`, `scheduled_publication_time`, 
  `publication_time`, `meta_title`, `meta_description`, `canonical_url`
)
VALUES
(
  1,
  'The Semiconductor Corridor: Inside India’s Multi-Billion Dollar Silicon Fab Buildout',
  'inside-indias-multibillion-dollar-silicon-fab-buildout',
  'SPECIAL INVESTIGATION',
  'From Gujarat\'s Dholera to Karnataka\'s hardware corridors, billions in sovereign capital and global foundry partnerships are racing to anchor domestic microchip sovereignty before the decade turns.',
  '<p class="lead-paragraph">In the arid plains of Dholera, 100 kilometers southwest of Ahmedabad, the drone of precision construction never pauses. Inside mammoth climate-controlled facilities that dwarf football stadiums, vibration-isolated foundation slabs five meters deep have been cast to anchor lithography machines capable of engraving circuits thinner than a strand of DNA.</p><p>This is ground zero for India’s ₹76,000-crore ($9.1 billion) Semiconductor Mission—a calculated gambit to break free from the geopolitical vulnerabilities that have plagued global tech hardware supply chains since the pandemic.</p><blockquote>"Chip autonomy is not simply an industrial objective; it is the cornerstone of national technological sovereignty in the artificial intelligence century."</blockquote><h3>From Silicon Valley to Dholera: The Global Foundry Pivot</h3><p>For decades, India provided the design brains for the world\'s leading semiconductor firms—nearly 20% of global chip design talent is stationed in Bengaluru, Hyderabad, and Noida—while the lucrative, capital-intensive manufacturing stayed locked in Taiwan, South Korea, and the United States.</p><p>Today, that imbalance is undergoing its most radical transformation in fifty years. Joint ventures pairing domestic industrial conglomerates with established Taiwanese, Japanese, and American foundry operators are bringing commercial wafer fabrication onto Indian soil for the first time.</p>',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'Inside the cleanroom facilities of the national advanced packaging facility at Sanand, Gujarat. (Photo: Special Bureau / The Bharat Chronicle)',
  3, 4, 'published', 10, 1, 0, 0, NULL, 7, 14820, 'en', NULL,
  '2026-10-12 09:30:00',
  'Inside India’s Semiconductor Corridor Buildout | The Bharat Chronicle',
  'Deep investigation into India’s multi-billion dollar domestic silicon fabrication facilities across Dholera and Sanand.',
  'https://bharatchronicle.com/article/inside-indias-multibillion-dollar-silicon-fab-buildout'
),
(
  2,
  'Reserve Bank Signals Liquidity Normalisation as Core Inflation Stabilises at 3.9%',
  'reserve-bank-signals-liquidity-normalisation-inflation-stabilises',
  'CAPITAL MARKETS',
  'Governor\'s Monetary Policy Statement underscores prudent fiscal stewardship while maintaining growth projections at a robust 7.2% for the fiscal year.',
  '<p>The Reserve Bank of India has maintained its key policy repo rate steady while signaling a gradual transition toward liquidity neutrality. The monetary policy committee noted that core inflation has durably settled inside the target band.</p><p>Financial institutions responded favorably, with benchmark government bond yields easing three basis points in early afternoon trade.</p>',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
  'Mint Street, Mumbai: Reserve Bank of India central headquarters.',
  2, 3, 'published', 8, 1, 0, 0, NULL, 4, 8410, 'en', NULL,
  '2026-10-12 11:15:00',
  'Reserve Bank Monetary Policy Review 2026 | The Bharat Chronicle',
  'RBI signals monetary policy normalization as inflation drops to 3.9%.',
  'https://bharatchronicle.com/article/reserve-bank-signals-liquidity-normalisation-inflation-stabilises'
),
(
  3,
  'भारताची सेमीकंडक्टर क्रांती: देशांतर्गत चिप उत्पादनात ऐतिहासिक भरारी',
  'marathi-indias-semiconductor-revolution',
  'विशेष वृत्त',
  'गुजरातच्या धोलेरा आणि महाराष्ट्रातील तळेगाव कॉरिडॉरमध्ये जागतिक दर्जाच्या सेमीकंडक्टर फॅब युनिट्सची उभारणी सुरू असून, भारत आता चिप उत्पादनात आत्मनिर्भरतेकडे वेगाने वाटचाल करत आहे.',
  '<p>भारताच्या तंत्रज्ञान इतिहासातील सर्वात मोठ्या औद्योगिक प्रकल्पाचे काम आता अंतिम टप्प्यात पोहोचले आहे. धोलेरा येथील अत्याधुनिक चीप उत्पादन प्रकल्पातून पहिल्या व्यावसायिक सिलिकॉन वेफर्सचे उत्पादन सुरू होणार आहे.</p><p>या ऐतिहासिक प्रकल्पामुळे देशातील ऑटोमोबाईल, सौर ऊर्जा आणि संरक्षण क्षेत्रासाठी आवश्यक असणाऱ्या मायक्रोचिप्सचा पुरवठा देशांतर्गत उपलब्ध होणार आहे.</p>',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'धोलेरा येथील प्रगत सेमीकंडक्टर फॅब केंद्र (छायाचित्र: विशेष प्रतिनिधी / भारत क्रॉनिकल)',
  3, 4, 'published', 5, 0, 0, 0, NULL, 5, 4200, 'mr', NULL,
  '2026-10-12 12:00:00',
  'भारताची सेमीकंडक्टर क्रांती | द भारत क्रॉनिकल',
  'धोलेरा व महाराष्ट्रातील सेमीकंडक्टर फॅब्रिकेशन प्रकल्पाचा सविस्तर आढावा.',
  'https://bharatchronicle.com/article/marathi-indias-semiconductor-revolution'
),
(
  4,
  'भारतीय अंतरिक्ष अनुसंधान संगठन: शुक्रयान मिशन के लिए गहरी अंतरिक्ष में सफल कक्षीय प्रविष्टि',
  'hindi-isro-shukrayaan-mission-deep-space',
  'ताज़ा खबर',
  'इसरो के शुक्रयान अंतरिक्ष यान ने निर्धारित समय से पूर्व स्वायत्त प्रक्षेपवक्र सुधार पूरा कर सौर मंडल के सबसे जटिल अन्वेषण की दिशा में ऐतिहासिक छलांग लगाई।',
  '<p>बेंगलुरु स्थित इसरो टेलीमेट्री, ट्रैकिंग और कमांड नेटवर्क (इस्ट्रैक) से वैज्ञानिकों ने पुष्टि की है कि शुक्रयान उपग्रह ने अपनी महत्वपूर्ण थ्रस्टर प्रज्वलन प्रक्रिया पूरी कर ली है।</p><p>यह मिशन शुक्र के सघन वायुमंडल, ज्वालामुखी गतिविधियों और उप-सतही चुंबकीय क्षेत्रों का गहन अध्ययन करेगा।</p>',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'इसरो का डीप स्पेस ट्रैकिंग केंद्र, ब्यालालु (फोटो: द भारत क्रॉनिकल)',
  1, 1, 'published', 9, 1, 1, 0, NULL, 4, 9150, 'hi', NULL,
  '2026-10-12 14:00:00',
  'इसरो शुक्रयान मिशन | द भारत क्रॉनिकल',
  'इसरो के शुक्रयान डीप-स्पेस मिशन की ताज़ा प्रगति रिपोर्ट।',
  'https://bharatchronicle.com/article/hindi-isro-shukrayaan-mission-deep-space'
),
(
  5,
  'Supreme Court Constitution Bench to Deliberate on Inter-State River Water Sharing Principles',
  'supreme-court-bench-inter-state-water-sharing',
  'JUDICIARY',
  'Seven-judge constitutional bench will establish binding federal guidelines on riparian allocations amidst climate-induced precipitation volatility.',
  '<p>The Supreme Court of India today listed landmark petitions concerning inter-state water sharing arrangements. The Chief Justice observed that constitutional mechanisms must evolve to address localized drought cycles and changing seasonal discharge patterns.</p>',
  'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
  'Supreme Court of India, Tilak Marg, New Delhi.',
  1, 1, 'published', 4, 0, 0, 0, NULL, 5, 3120, 'en', NULL,
  '2026-10-11 18:30:00',
  'Supreme Court Riparian Rights Review | The Bharat Chronicle',
  'Seven-judge Supreme Court bench to review inter-state river basin allocations.',
  'https://bharatchronicle.com/article/supreme-court-bench-inter-state-water-sharing'
),
(
  6,
  'Decarbonising Heavy Industry: The New Standard for Green Cement and Steel in India',
  'partner-decarbonising-heavy-industry-cii',
  'PARTNER CONTENT',
  'How next-generation carbon capture and green hydrogen are redefining India\'s industrial backbone ahead of global carbon border adjustments.',
  '<p>Presented in partnership with the Confederation of Indian Industry, this policy blueprint examines the technical and economic pathways enabling primary industrial producers to achieve net-zero emission parity without sacrificing manufacturing competitiveness.</p>',
  'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'Commercial partner report photography: Industrial energy transition.',
  4, 3, 'published', 3, 0, 0, 1, 'Confederation of Indian Industry', 6, 5200, 'en', NULL,
  '2026-10-11 10:00:00',
  'Green Industry Transition Blueprint | Partner Content',
  'CII and Clean Energy Alliance industrial decarbonization report.',
  'https://bharatchronicle.com/article/partner-decarbonising-heavy-industry-cii'
),
(
  7,
  'Diplomatic Brief: Bilateral Indo-Japanese Quantum Computing Accord Initialed in Tokyo',
  'diplomatic-brief-indo-japanese-quantum-accord',
  'EMBARGOED DISPATCH',
  'Joint ministerial communique confirms reciprocal access to supercomputing clusters and collaborative post-quantum cryptography standards.',
  '<p>Draft dispatch under strict embargo until joint prime ministerial press conference at Tokyo...</p>',
  'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
  'Tokyo Diplomatic Chancery: Quantum accord initialing ceremony.',
  1, 2, 'scheduled', 6, 0, 0, 0, NULL, 4, 0, 'en',
  '2026-10-13 18:00:00', NULL,
  'Bilateral Indo-Japanese Quantum Accord | The Bharat Chronicle',
  'Confidential scheduled dispatch awaiting diplomatic release.',
  'https://bharatchronicle.com/article/diplomatic-brief-indo-japanese-quantum-accord'
),
(
  8,
  'Investigative Draft: High-Speed Regional Rail Fare Subsidy Model Under Fiscal Scrutiny',
  'investigative-draft-regional-rail-fare-subsidies',
  'INVESTIGATION DRAFT',
  'Internal finance ministry audit highlights differing revenue realization rates across western rapid transit corridors.',
  '<p>Early working draft awaiting editorial desk source corroboration and response from the urban transit authority.</p>',
  'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80',
  'Regional rapid transit corridor trials.',
  3, 1, 'draft', 1, 0, 0, 0, NULL, 4, 0, 'en',
  NULL, NULL,
  'Draft: Regional Rail Fare Subsidy | The Bharat Chronicle',
  'Internal working draft.',
  NULL
)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`), `short_description`=VALUES(`short_description`);

-- 6. Seed Article Tags
INSERT IGNORE INTO `article_tags` (`article_id`, `tag_id`)
VALUES
(1, 1), (1, 5),
(2, 2),
(3, 1), (3, 5),
(4, 3),
(5, 4),
(6, 6);

-- 7. Seed Article Revisions (Revision history tracking)
INSERT INTO `article_revisions` (`id`, `article_id`, `revision_number`, `title`, `short_description`, `article_body`, `edited_by`, `revision_notes`)
VALUES
(1, 1, 1, 'Inside India’s Semiconductor Fab Buildout', 'Early investigative draft of the semiconductor corridor.', '<p>Preliminary notes on Dholera fab buildout...</p>', 3, 'Initial correspondent draft submitted from Sanand'),
(2, 1, 2, 'The Semiconductor Corridor: Inside India’s Multi-Billion Dollar Silicon Fab Buildout', 'From Gujarat\'s Dholera to Karnataka\'s hardware corridors, billions in sovereign capital and global foundry partnerships are racing to anchor domestic microchip sovereignty before the decade turns.', '<p class="lead-paragraph">In the arid plains of Dholera, 100 kilometers southwest of Ahmedabad, the drone of precision construction never pauses...</p>', 1, 'Final editorial verification and lead package elevation')
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 8. Seed Ad Placements
INSERT INTO `ad_placements` (`id`, `placement_code`, `name`, `dimensions`, `is_active`)
VALUES
(1, 'header_leaderboard', 'Top Header Super Leaderboard', '970x90', 1),
(2, 'article_sidebar_top', 'Article Sidebar Top Rectangle', '300x250', 1),
(3, 'homepage_mid_billboard', 'Homepage Mid-Section Billboard', '970x120', 1),
(4, 'article_inline', 'In-Article Inline Leaderboard', '728x90', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 9. Seed Advertisements
INSERT INTO `advertisements` (`id`, `placement_id`, `title`, `client_name`, `banner_image_url`, `target_url`, `impressions_count`, `clicks_count`, `start_date`, `end_date`, `is_active`)
VALUES
(1, 1, 'India Global Tech Summit 2026 — Registration Open', 'Confederation of Indian Industry', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=970&q=80', 'https://example.com/summit', 142400, 3540, '2026-01-01', '2026-12-31', 1),
(2, 2, 'Green Infrastructure Sovereign Bonds 2026', 'National Infrastructure Investment Fund', 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=300&q=80', 'https://example.com/greenfund', 98200, 2110, '2026-01-01', '2026-12-31', 1),
(3, 3, 'Bharat Green Hydrogen Mission — Sovereign Portfolio', 'Ministry of New & Renewable Energy Partner', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=970&q=80', 'https://example.com/hydrogen', 64100, 1420, '2026-01-01', '2026-12-31', 1)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 10. Seed Platform Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `setting_group`, `is_public`, `description`)
VALUES
('site_name', 'The Bharat Chronicle', 'general', 1, 'Master publication brand title'),
('site_tagline', 'Independent National Daily of Record', 'general', 1, 'Official masthead subtitle'),
('site_motto', 'Veritas et Libertas • Est. 1928', 'general', 1, 'Classical heritage motto'),
('press_council_registration', 'REG-BC-2026-DEL-0941', 'compliance', 1, 'Press Council of India accreditation code'),
('editorial_email', 'editorial@bharatchronicle.com', 'contact', 1, 'Central newsroom desk address'),
('ad_sales_email', 'advertising@bharatchronicle.com', 'monetization', 1, 'Commercial sponsorships desk email'),
('breaking_news_enabled', '1', 'editorial', 1, 'Global breaking news ticker master switch'),
('comments_require_approval', '1', 'moderation', 0, 'Auto-quarantine reader submissions')
ON DUPLICATE KEY UPDATE `setting_value`=VALUES(`setting_value`);

-- 11. Seed Initial Audit Logs
INSERT INTO `audit_logs` (`user_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`)
VALUES
(1, 'SYSTEM_INIT', 'system', NULL, '{"event": "Database schema and seed records initialized for Phase 2"}', '127.0.0.1'),
(1, 'ARTICLE_PUBLISH', 'article', 1, '{"slug": "inside-indias-multibillion-dollar-silicon-fab-buildout", "status": "published"}', '127.0.0.1');
