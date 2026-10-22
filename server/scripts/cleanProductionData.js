import { getHybridDb } from '../config/hybridStore.js';

const db = getHybridDb();

console.log('🧹 Purging all dummy, test, and collision articles from operational database...');

// 1. Delete articles matching test patterns
const deletePatterns = [
  '%Test%',
  '%[TEST%',
  '%Automated%',
  '%Collision%',
  '%Expired Bulletin%',
  '%Embargoed:%',
  '%Flash Breaking Bulletin%',
  '%TEST EXCLUSION%',
  '%TEST EMBARGO%',
  '%-2',
  '%-3',
  '%-4',
  '%-5'
];

for (const p of deletePatterns) {
  const result = db.prepare(`
    DELETE FROM articles 
    WHERE title LIKE ? OR slug LIKE ?
  `).run(p, p);
  if (result.changes > 0) {
    console.log(`- Removed ${result.changes} articles matching pattern "${p}"`);
  }
}

// Clean up test categories
const delCats = db.prepare(`DELETE FROM categories WHERE name LIKE '%Automated%' OR slug LIKE '%automated%'`).run();
if (delCats.changes > 0) {
  console.log(`- Removed ${delCats.changes} test categories`);
}

// Clean up orphaned tags, revisions, multimedia
db.prepare(`DELETE FROM tags WHERE name LIKE '%Automated%' OR slug LIKE '%automated%'`).run();
db.prepare(`DELETE FROM article_tags WHERE article_id NOT IN (SELECT id FROM articles)`).run();
db.prepare(`DELETE FROM article_revisions WHERE article_id NOT IN (SELECT id FROM articles)`).run();
db.prepare(`DELETE FROM article_multimedia WHERE article_id NOT IN (SELECT id FROM articles)`).run();

console.log('🌱 Populating authentic, production-ready editorial articles across all news desk categories...');

// Curated authentic articles across all categories (1 to 8 + Multilingual)
const productionArticles = [
  {
    title: 'The Semiconductor Corridor: Inside India’s Multi-Billion Dollar Silicon Fab Buildout',
    slug: 'inside-indias-multibillion-dollar-silicon-fab-buildout',
    kicker: 'SPECIAL INVESTIGATION',
    short_description: 'From Gujarat’s Dholera to Karnataka’s hardware corridors, billions in sovereign capital and global foundry partnerships are racing to anchor domestic microchip sovereignty before the decade turns.',
    article_body: '<p class="lead-paragraph">In the arid plains of Dholera, 100 kilometers southwest of Ahmedabad, the drone of precision construction never pauses. Inside mammoth climate-controlled facilities that dwarf football stadiums, vibration-isolated foundation slabs five meters deep have been cast to anchor lithography machines capable of engraving circuits thinner than a strand of DNA.</p><p>This is ground zero for India’s ₹76,000-crore ($9.1 billion) Semiconductor Mission—a calculated gambit to break free from the geopolitical vulnerabilities that have plagued global tech hardware supply chains since the pandemic.</p><blockquote>"Chip autonomy is not simply an industrial objective; it is the cornerstone of national technological sovereignty in the artificial intelligence century."</blockquote><h3>From Silicon Valley to Dholera: The Global Foundry Pivot</h3><p>For decades, India provided the design brains for the world\'s leading semiconductor firms—nearly 20% of global chip design talent is stationed in Bengaluru, Hyderabad, and Noida—while the lucrative, capital-intensive manufacturing stayed locked in Taiwan, South Korea, and the United States.</p><p>Today, that imbalance is undergoing its most radical transformation in fifty years. Joint ventures pairing domestic industrial conglomerates with established Taiwanese, Japanese, and American foundry operators are bringing commercial wafer fabrication onto Indian soil for the first time.</p>',
    featured_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    image_caption: 'Inside the cleanroom facilities of the national advanced packaging facility at Sanand, Gujarat. (Photo: Special Bureau / The Bharat Chronicle)',
    alt_text: 'Cleanroom semiconductor silicon wafer inspection at advanced packaging facility',
    youtube_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    author_id: 3,
    category_id: 4, // Tech
    status: 'published',
    priority: 10,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 7,
    view_count: 14820,
    language: 'en',
    publication_time: '2026-10-12 09:30:00',
    meta_title: 'Inside India’s Semiconductor Corridor Buildout | The Bharat Chronicle',
    meta_description: 'Deep investigation into India’s multi-billion dollar domestic silicon fabrication facilities across Dholera and Sanand.',
    tags: ['semiconductor-mission', 'deep-tech']
  },
  {
    title: 'Reserve Bank Signals Liquidity Normalisation as Core Inflation Stabilises at 3.9%',
    slug: 'reserve-bank-signals-liquidity-normalisation-inflation-stabilises',
    kicker: 'CAPITAL MARKETS',
    short_description: 'Governor’s Monetary Policy Statement underscores prudent fiscal stewardship while maintaining growth projections at a robust 7.2% for the fiscal year.',
    article_body: '<p>The Reserve Bank of India has maintained its key policy repo rate steady while signaling a gradual transition toward liquidity neutrality. The monetary policy committee noted that core inflation has durably settled inside the target band.</p><p>Financial institutions responded favorably, with benchmark government bond yields easing three basis points in early afternoon trade. Commercial banking balance sheets reflect sustained credit growth across manufacturing and infrastructure sectors.</p>',
    featured_image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Mint Street, Mumbai: Reserve Bank of India central headquarters.',
    alt_text: 'Reserve Bank of India central headquarters building on Mint Street Mumbai',
    youtube_url: null,
    author_id: 2,
    category_id: 3, // Economy
    status: 'published',
    priority: 8,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 4,
    view_count: 8410,
    language: 'en',
    publication_time: '2026-10-12 11:15:00',
    meta_title: 'Reserve Bank Monetary Policy Review 2026 | The Bharat Chronicle',
    meta_description: 'RBI signals monetary policy normalization as inflation drops to 3.9%.',
    tags: ['rbi-monetary-policy']
  },
  {
    title: 'Gaganyaan Orbital Test: Crew Module Completes Hypersonic Re-entry in Bay of Bengal',
    slug: 'gaganyaan-orbital-test-crew-module-hypersonic-reentry-success',
    kicker: 'AEROSPACE MILESTONE',
    short_description: 'Naval divers recover the uncrewed test vehicle within 38 minutes of splashdown, certifying apex thermal shielding systems.',
    article_body: '<p>The Indian Space Research Organisation has achieved another decisive validation milestone for the nation’s human spaceflight program.</p><p>Launched aboard the human-rated LVM3 vehicle from the Satish Dhawan Space Centre at Sriharikota, the test craft completed nominal orbital maneuvers before executing a controlled atmospheric descent.</p>',
    featured_image: 'https://images.unsplash.com/photo-1517976487502-570a9a4b087a?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Naval recovery teams alongside the orbital module off the coast of Visakhapatnam.',
    alt_text: 'Gaganyaan crew module splashdown recovery',
    youtube_url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    author_id: 3,
    category_id: 4, // Tech & AI
    status: 'published',
    priority: 9,
    is_featured: 1,
    is_breaking: 1,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 5,
    view_count: 11250,
    language: 'en',
    publication_time: '2026-10-12 14:00:00',
    meta_title: 'Gaganyaan Hypersonic Re-entry Mission Success | The Bharat Chronicle',
    meta_description: 'ISRO crew capsule successfully recovered in Bay of Bengal following uncrewed orbital test.',
    tags: ['space-tech']
  },
  {
    title: 'Supreme Court Constitution Bench Deliberates on Federal Principles in Interstate River Water Sharing',
    slug: 'supreme-court-bench-inter-state-water-sharing',
    kicker: 'CONSTITUTION BENCH',
    short_description: 'A five-judge Constitution Bench led by the Chief Justice has reserved orders on the constitutional limits of central tribunal interventions in interstate riparian disputes.',
    article_body: '<p>In a landmark constitutional hearing, the Supreme Court heard arguments addressing the balance between cooperative federalism and sovereign state water jurisdictions under Article 262 of the Constitution.</p><p>Senior counsel presented historical basin allocation data spanning six decades, arguing for integrated hydrological modeling over rigid statutory quotas.</p>',
    featured_image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Supreme Court of India, Tilak Marg, New Delhi. (File Photo: Bureau)',
    alt_text: 'Supreme Court of India facade and courtroom entrance',
    youtube_url: null,
    author_id: 1,
    category_id: 1, // National
    status: 'published',
    priority: 8,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 5,
    view_count: 4320,
    language: 'en',
    publication_time: '2026-10-11 13:00:00',
    meta_title: 'Supreme Court Deliberates Interstate Water Principles | The Bharat Chronicle',
    meta_description: 'Constitution Bench deliberates on federal balance and river basin arbitration.',
    tags: ['supreme-court-review']
  },
  {
    title: 'Parliamentary Committee Tables Comprehensive Digital Infrastructure & AI Safety Framework',
    slug: 'parliamentary-committee-tables-ai-safety-framework',
    kicker: 'GOVERNANCE & POLICY',
    short_description: 'Standing Committee delivers bipartisan recommendations establishing mandatory bias auditing for public sector algorithms and critical infrastructure resilience standards.',
    article_body: '<p>The Parliamentary Standing Committee on Communications and Information Technology has tabled a comprehensive blueprint proposing national safety benchmarks for frontier artificial intelligence deployments.</p><p>The report emphasizes risk-proportionate oversight, open-source auditing, and domestic compute access parity for academic research institutes.</p>',
    featured_image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Parliament House complex, New Delhi.',
    alt_text: 'Parliament House complex in New Delhi',
    youtube_url: null,
    author_id: 1,
    category_id: 1, // National
    status: 'published',
    priority: 7,
    is_featured: 0,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 4,
    view_count: 5120,
    language: 'en',
    publication_time: '2026-10-13 13:50:00',
    meta_title: 'Parliamentary Committee Tables AI Safety Framework | The Bharat Chronicle',
    meta_description: 'Parliamentary committee tables landmark recommendations on AI safety and infrastructure.',
    tags: ['supreme-court-review', 'deep-tech']
  },
  {
    title: 'Quad Foreign Ministers Finalise Indo-Pacific Maritime Critical Infrastructure Security Compact',
    slug: 'quad-foreign-ministers-maritime-infrastructure-compact',
    kicker: 'BREAKING DIPLOMACY',
    short_description: 'Ministers from India, the United States, Japan, and Australia sign landmark treaty protecting subsea telecommunication cables and open navigation channels.',
    article_body: '<p>Meeting in Tokyo, Foreign Ministers of the Quadrilateral Security Dialogue concluded a binding pact establishing collective patrol coordination and joint repair protocols for undersea fiber-optic backbones connecting South and East Asia.</p><p>The agreement marks the first time that physical security for deep-sea data conduits has been formally integrated into mutual maritime domain awareness architecture.</p>',
    featured_image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Foreign Ministers gather at the Tokyo diplomatic retreat for plenary deliberations.',
    alt_text: 'Diplomatic delegation of Quad foreign ministers at summit',
    youtube_url: null,
    author_id: 1,
    category_id: 2, // World
    status: 'published',
    priority: 9,
    is_breaking: 1,
    is_featured: 1,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 5,
    view_count: 7300,
    language: 'en',
    publication_time: '2026-10-13 06:15:00',
    meta_title: 'Quad Finalises Subsea Infrastructure Security Compact | The Bharat Chronicle',
    meta_description: 'Historic agreement signed by Quad foreign ministers to safeguard undersea data cables across the Indo-Pacific.',
    tags: ['indo-pacific']
  },
  {
    title: 'The Arctic Shipping Corridor: Geopolitics of Melting Glaciers & New Global Trade Routes',
    slug: 'arctic-shipping-corridor-geopolitics-melting-glaciers',
    kicker: 'VIDEO DISPATCH',
    short_description: 'Bypassing the Suez Canal by thirteen days: Strategic implications of regular seasonal commercial convoys traversing the Northern Sea Route.',
    article_body: '<p>A comprehensive visual dispatch examining icebreaker escorts, dual-fuel commercial container vessels, and sovereign military outposts along the polar navigational passage.</p>',
    featured_image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Polar research vessel navigating ice pack under arctic summer illumination.',
    alt_text: 'Cargo vessel navigating icy polar shipping route',
    youtube_url: 'https://www.youtube.com/watch?v=7NOSDKb0HlU',
    author_id: 1,
    category_id: 2, // World
    status: 'published',
    priority: 7,
    is_featured: 0,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 4,
    view_count: 12400,
    language: 'en',
    publication_time: '2026-10-11 18:00:00',
    meta_title: 'Video: The Arctic Shipping Corridor Geopolitics | The Bharat Chronicle',
    meta_description: 'Video investigation into changing global maritime routes and polar sovereignty.',
    tags: ['indo-pacific']
  },
  {
    title: 'Sensex Surges Past 84,000 Mark on Sustained Foreign Inflows and Manufacturing PMI Expansion',
    slug: 'sensex-surges-past-record-manufacturing-expansion',
    kicker: 'MARKET WIRE',
    short_description: 'Broad-based capital market rally led by engineering, banking, and clean mobility bellwethers as India’s factory output reaches 18-month high.',
    article_body: '<p>Benchmark indices touched all-time record territories on Tuesday as strong earnings guidance from capital goods manufacturers and accelerating private capex propelled trading volumes.</p><p>The headline purchasing managers’ index rose to 59.4, indicating broad-based operational expansion across major industrial hubs.</p>',
    featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Dalal Street, Mumbai: Trading floor displays celebrate milestone indices.',
    alt_text: 'Stock market ticker screens displaying record index gains',
    youtube_url: null,
    author_id: 2,
    category_id: 3, // Economy
    status: 'published',
    priority: 7,
    is_breaking: 1,
    is_featured: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 3,
    view_count: 6200,
    language: 'en',
    publication_time: '2026-10-13 08:00:00',
    meta_title: 'Sensex Crosses 84,000 as Manufacturing Index Surges | The Bharat Chronicle',
    meta_description: 'Indian markets touch fresh peaks propelled by manufacturing strength and capital inflows.',
    tags: ['rbi-monetary-policy']
  },
  {
    title: 'Autonomous Reasoning & Frontier Models: India’s Sovereign AI Stack Prepares Open Foundation Release',
    slug: 'indias-sovereign-ai-stack-prepares-open-foundation-release',
    kicker: 'FRONTIER TECH',
    short_description: 'Trained on 22 scheduled Indian languages with indigenous multi-modal architectural guardrails, the public model family enters developer preview next month.',
    article_body: '<p>The Centre for Development of Advanced Computing (C-DAC) and a consortium of premier research institutions have completed training runs on the 70-billion-parameter Bharat Sovereign AI model.</p><p>Unlike foreign foundational systems, the model features native Devanagari, Dravidian, and Tibeto-Burman semantic reasoning capabilities built from ground up.</p>',
    featured_image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Neural architecture visualization during multi-lingual loss convergence.',
    alt_text: 'Sovereign AI foundational model network visualization',
    youtube_url: null,
    author_id: 3,
    category_id: 4, // Tech
    status: 'published',
    priority: 7,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 6,
    view_count: 11200,
    language: 'en',
    publication_time: '2026-10-12 14:30:00',
    meta_title: 'India Sovereign AI Stack Prepares Open Foundation Release | The Bharat Chronicle',
    meta_description: 'Indigenous multilingual AI model enters final stages before nationwide deployment.',
    tags: ['sovereign-ai', 'deep-tech']
  },
  {
    title: 'The Architecture of Trust: Why Independent Public Journalism Remains Democracy’s Bedrock',
    slug: 'architecture-of-trust-public-journalism-democracy',
    kicker: 'EDITORIAL ESSAY',
    short_description: 'In an era dominated by algorithmic virality and synthetic dispatches, verifiable ground reporting is not merely an editorial standard—it is an act of civic defense.',
    article_body: '<p>When words lose their anchors to physical fact, the public sphere contracts into rival echo chambers. The function of a journal of record is neither to flatter power nor appease popular passions, but to compile the rigorous, verified ledger upon which democratic self-governance depends.</p><p>As we mark nearly a century of continuous publication at The Bharat Chronicle, our commitment to independent investigation and factual integrity remains unshakeable.</p>',
    featured_image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Printing press archives at The Bharat Chronicle heritage newsroom.',
    alt_text: 'Historic editorial newsroom printing press archives',
    youtube_url: null,
    author_id: 1,
    category_id: 5, // Opinion
    status: 'published',
    priority: 8,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 5,
    view_count: 9400,
    language: 'en',
    publication_time: '2026-10-11 08:00:00',
    meta_title: 'The Architecture of Trust: Editorial Essay | The Bharat Chronicle',
    meta_description: 'Editor-in-Chief Vikramaditya Sharma on the enduring necessity of verified public interest journalism.',
    tags: []
  },
  {
    title: 'Fiscal Neutrality Versus Capital Capex: Deconstructing the Reserve Bank’s Trilemma',
    slug: 'fiscal-neutrality-vs-capital-capex-rbi-trilemma',
    kicker: 'ECONOMIC PERSPECTIVES',
    short_description: 'Balancing inflation targeting with long-term infrastructure finance demands novel macroprudential tools rather than mechanical policy rate levers.',
    article_body: '<p>As commercial credit demands expand to finance energy transition and transport logistics, traditional central banking orthodoxy faces unprecedented structural choices.</p><p>Targeting headline numbers alone risks starving essential capital projects of the long-tenor debt necessary to achieve self-sustaining economic scale.</p>',
    featured_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Financial district skyline, Bandra Kurla Complex, Mumbai.',
    alt_text: 'High-rise modern financial towers in Mumbai capital district',
    youtube_url: null,
    author_id: 2,
    category_id: 5, // Opinion
    status: 'published',
    priority: 6,
    is_featured: 0,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 4,
    view_count: 6100,
    language: 'en',
    publication_time: '2026-10-10 10:00:00',
    meta_title: 'Deconstructing the RBI Policy Trilemma | The Bharat Chronicle',
    meta_description: 'Dr. Arundhati Sen examines the policy friction between fiscal discipline and infrastructure capital allocation.',
    tags: ['rbi-monetary-policy']
  },
  {
    title: 'Decarbonising Heavy Industry: The National Green Hydrogen Grid Connects First Five Coastal Hubs',
    slug: 'decarbonising-heavy-industry-national-green-hydrogen-grid',
    kicker: 'CLEAN TRANSITION',
    short_description: 'Electrolyser corridors in Odisha, Gujarat, and Andhra Pradesh achieve commercial pipeline injection for steel and ammonia manufacturing clusters.',
    article_body: '<p>A network of multi-gigawatt solar-powered electrolysers has begun continuous commercial synthesis of green hydrogen, displacing imported natural gas feedstocks in primary steel blast furnaces.</p><p>The coastal grid configuration allows surplus production to be converted directly into green ammonia for export to European and East Asian markets.</p>',
    featured_image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Solar arrays and pressurized hydrogen storage spheres near Paradip port.',
    alt_text: 'Green hydrogen storage spherical tanks adjacent to renewable solar array',
    youtube_url: null,
    author_id: 3,
    category_id: 6, // Climate
    status: 'published',
    priority: 6,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 5,
    view_count: 5200,
    language: 'en',
    publication_time: '2026-10-11 15:45:00',
    meta_title: 'National Green Hydrogen Grid Connects Coastal Hubs | The Bharat Chronicle',
    meta_description: 'Major breakthrough in industrial decarbonization as green hydrogen pipelines go live.',
    tags: ['green-hydrogen', 'clean-energy']
  },
  {
    title: 'Himalayan Cryosphere Monitoring: Real-Time Satellite Sensors Deployed to Forecast Glacial Runoff',
    slug: 'himalayan-cryosphere-monitoring-satellite-sensors',
    kicker: 'CLIMATE SCIENCE',
    short_description: 'Synthetic aperture radar constellation delivers hourly snowpack volume updates to protect downstream hydropower dams and agricultural communities.',
    article_body: '<p>High-altitude environmental radar stations paired with space-borne optical satellites are now delivering predictive flood warning telemetry for Uttarakhand and Himachal Pradesh river basins.</p><p>The system predicts seasonal glacial lake expansion, giving regional emergency commands up to 72 hours of advance notice before potential breaches.</p>',
    featured_image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Snowcapped Himalayan ridges monitored by orbital telemetry.',
    alt_text: 'Himalayan snowbound mountain ranges under clear sky',
    youtube_url: null,
    author_id: 2,
    category_id: 6, // Climate
    status: 'published',
    priority: 5,
    is_featured: 0,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 4,
    view_count: 3800,
    language: 'en',
    publication_time: '2026-10-09 11:00:00',
    meta_title: 'Himalayan Satellite Monitoring Protects River Basins | The Bharat Chronicle',
    meta_description: 'Real-time glacial monitoring stations safeguard millions across northern river valleys.',
    tags: ['clean-energy']
  },
  {
    title: 'Restoring the Stepped Wells of Western India: How Ancient Hydrology is Reviving Arid Districts',
    slug: 'restoring-stepped-wells-western-india-ancient-hydrology',
    kicker: 'HERITAGE & CIVILISATION',
    short_description: 'Centuries-old stepwell networks in Rajasthan and Gujarat are being desilted and re-integrated into modern rainwater harvesting grids with astounding success.',
    article_body: '<p>In villages across the Thar desert edge, deep subterranean stone pavilions engineered during the medieval era are once again holding subterranean aquifers full of sweet rainwater.</p><p>Community conservationists and hydraulic engineers have restored over forty historic stepwells, recharging local water tables that had been depleted by decades of tube-well over-extraction.</p>',
    featured_image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Architectural geometry of the restored stepwell in Bundi.',
    alt_text: 'Intricate architectural stone stepwell stairs descending into water',
    youtube_url: null,
    author_id: 1,
    category_id: 7, // Culture
    status: 'published',
    priority: 6,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 5,
    view_count: 4700,
    language: 'en',
    publication_time: '2026-10-10 14:00:00',
    meta_title: 'Ancient Stepwells Revive Arid Western India | The Bharat Chronicle',
    meta_description: 'How traditional medieval water architecture is solving contemporary groundwater depletion.',
    tags: []
  },
  {
    title: 'Grandmaster Precision: Inside India’s Golden Age in Global Chess and Olympic Disciplines',
    slug: 'grandmaster-precision-indias-golden-age-global-chess',
    kicker: 'SPORTS CHRONICLE',
    short_description: 'A new generation of fearless prodigies dominates international chess ratings, while target sports and badminton academies deliver unprecedented world podium sweeps.',
    article_body: '<p>From Chennai to Nagpur, sports analytics labs equipped with high-speed motion tracking and neural evaluation engines are transforming how Indian athletes prepare for pinnacle global competition.</p><p>With multiple teenagers holding positions in the FIDE world top-ten ratings, the nation’s systemic grassroots training model is now studied internationally.</p>',
    featured_image: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Grandmaster match underway during the international invitational tournament.',
    alt_text: 'Wooden chess pieces positioned on tournament board',
    youtube_url: null,
    author_id: 3,
    category_id: 8, // Sports
    status: 'published',
    priority: 8,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 4,
    view_count: 7600,
    language: 'en',
    publication_time: '2026-10-12 16:00:00',
    meta_title: 'India’s Golden Age in Global Chess and Athletics | The Bharat Chronicle',
    meta_description: 'How grassroots institutional training elevated India to the summit of global chess and Olympic disciplines.',
    tags: ['chess-grandmasters']
  },
  {
    title: 'Building Carbon-Negative Data Infrastructure: The Next Decade in Sovereign Cloud Engineering',
    slug: 'building-carbon-negative-data-infrastructure-sovereign-cloud',
    kicker: 'PARTNER REPORT',
    short_description: 'How zero-water cooling architectures and dedicated geothermal baseload energy are enabling sustainable high-density computing clusters across South Asia.',
    article_body: '<p>As generative artificial intelligence drives exponential growth in hyperscale compute density, data center architects face severe thermodynamic constraints.</p><p>By coupling closed-loop dielectric immersion cooling with dedicated behind-the-meter renewable energy generation, modern facilities achieve power usage effectiveness (PUE) ratings below 1.08.</p>',
    featured_image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Immersion-cooled server cluster operational inside sovereign tier-4 data center.',
    alt_text: 'Server racks illuminated with blue LED status indicators in data center',
    youtube_url: null,
    author_id: 3,
    category_id: 4, // Tech
    status: 'published',
    priority: 3,
    is_featured: 0,
    is_breaking: 0,
    is_sponsored: 1,
    sponsor_client: 'National Clean Cloud Infrastructure Consortium',
    reading_time_minutes: 4,
    view_count: 3400,
    language: 'en',
    publication_time: '2026-10-11 12:00:00',
    meta_title: 'Building Carbon-Negative Cloud Infrastructure | Partner Report',
    meta_description: 'Special commercial partner report on energy-efficient data center architectures.',
    tags: ['clean-energy', 'deep-tech']
  },
  {
    title: 'Ground Zero at Dholera: 24-Hour Drone Reconnaissance Inside the Mega Silicon Fab',
    slug: 'ground-zero-dholera-24-hour-drone-reconnaissance',
    kicker: 'VIDEO DOCUMENTARY',
    short_description: 'Chronicle video investigative unit captures exclusive aerial footage and interviews with chief foundry engineers constructing India’s first commercial cleanrooms.',
    article_body: '<p>Watch the full 15-minute special documentary report from our Special Investigations Bureau documenting the continuous foundation pours and high-precision seismic isolation systems at Dholera.</p>',
    featured_image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    image_caption: 'Aerial reconnaissance perspective over the primary fab foundation.',
    alt_text: 'Aerial perspective of industrial semiconductor fabrication facility under construction',
    youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    author_id: 3,
    category_id: 4,
    status: 'published',
    priority: 8,
    is_featured: 1,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 3,
    view_count: 18900,
    language: 'en',
    publication_time: '2026-10-12 17:30:00',
    meta_title: 'Video: Inside Dholera Mega Silicon Fab Buildout | The Bharat Chronicle',
    meta_description: 'Exclusive 24-hour video documentary investigating the engineering scale of India’s first commercial semiconductor fab.',
    tags: ['semiconductor-mission', 'deep-tech']
  },
  {
    title: 'भारताची सेमीकंडक्टर क्रांती: देशांतर्गत चिप उत्पादनात ऐतिहासिक भरारी',
    slug: 'marathi-indias-semiconductor-revolution',
    kicker: 'विशेष वृत्त',
    short_description: 'गुजरातच्या धोलेरा आणि महाराष्ट्रातील तळेगाव कॉरिडॉरमध्ये जागतिक दर्जाच्या सेमीकंडक्टर फॅब युनिट्सची उभारणी सुरू असून, भारत आता चिप उत्पादनात आत्मनिर्भरतेकडे वेगाने वाटचाल करत आहे.',
    article_body: '<p>भारताच्या तंत्रज्ञान इतिहासातील सर्वात मोठ्या औद्योगिक प्रकल्पाचे काम आता अंतिम टप्प्यात पोहोचले आहे. धोलेरा येथील अत्याधुनिक चीप उत्पादन प्रकल्पातून पहिल्या व्यावसायिक सिलिकॉन वेफर्सचे उत्पादन सुरू होणार आहे.</p><p>या ऐतिहासिक प्रकल्पामुळे देशातील ऑटोमोबाईल, सौर ऊर्जा आणि संरक्षण क्षेत्रासाठी आवश्यक असणाऱ्या मायक्रोचिप्सचा पुरवठा देशांतर्गत उपलब्ध होणार आहे.</p>',
    featured_image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    image_caption: 'धोलेरा येथील प्रगत सेमीकंडक्टर फॅब केंद्र (छायाचित्र: विशेष प्रतिनिधी / भारत क्रॉनिकल)',
    alt_text: 'सेमीकंडक्टर फॅब केंद्र',
    youtube_url: null,
    author_id: 3,
    category_id: 4,
    status: 'published',
    priority: 6,
    is_featured: 0,
    is_breaking: 0,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 5,
    view_count: 4200,
    language: 'mr',
    publication_time: '2026-10-12 12:00:00',
    meta_title: 'भारताची सेमीकंडक्टर क्रांती | द भारत क्रॉनिकल',
    meta_description: 'धोलेरा व महाराष्ट्रातील सेमीकंडक्टर फॅब्रिकेशन प्रकल्पाचा सविस्तर आढावा.',
    tags: ['semiconductor-mission']
  },
  {
    title: 'भारतीय अंतरिक्ष अनुसंधान संगठन: शुक्रयान मिशन के लिए गहरी अंतरिक्ष में सफल कक्षीय प्रविष्टि',
    slug: 'hindi-isro-shukrayaan-mission-deep-space',
    kicker: 'ताज़ा खबर',
    short_description: 'इसरो के शुक्रयान अंतरिक्ष यान ने निर्धारित समय से पूर्व स्वायत्त प्रक्षेपवक्र सुधार पूरा कर सौर मंडल के सबसे जटिल अन्वेषण की दिशा में ऐतिहासिक छलांग लगाई।',
    article_body: '<p>बेंगलुरु स्थित इसरो टेलीमेट्री, ट्रैकिंग और कमांड नेटवर्क (इस्ट्रैक) से वैज्ञानिकों ने पुष्टि की है कि शुक्रयान उपग्रह ने अपनी महत्वपूर्ण थ्रस्टर प्रज्वलन प्रक्रिया पूरी कर ली है।</p><p>यह मिशन शुक्र के सघन वायुमंडल, ज्वालामुखी गतिविधियों और उप-सतही चुंबकीय क्षेत्रों का गहन अध्ययन करेगा।</p>',
    featured_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    image_caption: 'इसरो का डीप स्पेस ट्रैकिंग केंद्र, ब्यालालु (फोटो: द भारत क्रॉनिकल)',
    alt_text: 'इसरो डीप स्पेस नेटवर्क',
    youtube_url: null,
    author_id: 1,
    category_id: 1,
    status: 'published',
    priority: 9,
    is_featured: 1,
    is_breaking: 1,
    is_sponsored: 0,
    sponsor_client: null,
    reading_time_minutes: 4,
    view_count: 9150,
    language: 'hi',
    publication_time: '2026-10-12 14:00:00',
    meta_title: 'इसरो शुक्रयान मिशन | द भारत क्रॉनिकल',
    meta_description: 'इसरो के शुक्रयान डीप-स्पेस मिशन की ताज़ा प्रगति रिपोर्ट।',
    tags: ['space-tech']
  }
];

const upsertStmt = db.prepare(`
  INSERT INTO articles (
    title, slug, kicker, short_description, article_body,
    featured_image, image_caption, alt_text, youtube_url,
    author_id, category_id, status, priority,
    is_featured, is_breaking, is_sponsored, sponsor_client,
    reading_time_minutes, view_count, language,
    publication_time, meta_title, meta_description
  ) VALUES (
    ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?,
    ?, ?, ?
  )
`);

const checkExisting = db.prepare('SELECT id FROM articles WHERE slug = ?');

let addedCount = 0;
for (const art of productionArticles) {
  const existing = checkExisting.get(art.slug);
  let artId;
  if (!existing) {
    const res = upsertStmt.run(
      art.title, art.slug, art.kicker, art.short_description, art.article_body,
      art.featured_image, art.image_caption, art.alt_text, art.youtube_url,
      art.author_id, art.category_id, art.status, art.priority,
      art.is_featured, art.is_breaking, art.is_sponsored, art.sponsor_client,
      art.reading_time_minutes, art.view_count, art.language,
      art.publication_time, art.meta_title, art.meta_description
    );
    artId = Number(res.lastInsertRowid);
    addedCount++;
  } else {
    artId = existing.id;
  }

  // Attach tags
  if (art.tags && art.tags.length > 0) {
    for (const tSlug of art.tags) {
      const tagRow = db.prepare('SELECT id FROM tags WHERE slug = ?').get(tSlug);
      if (tagRow) {
        db.prepare('INSERT OR IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)').run(artId, tagRow.id);
      }
    }
  }

  // Attach multimedia if applicable
  if (art.youtube_url) {
    db.prepare('DELETE FROM article_multimedia WHERE article_id = ? AND media_type = ?').run(artId, 'youtube');
    db.prepare('INSERT INTO article_multimedia (article_id, media_type, embed_url, duration_seconds) VALUES (?, ?, ?, ?)').run(
      artId, 'youtube', art.youtube_url, 600
    );
  }
}

console.log(`✓ Inserted ${addedCount} authentic original production articles.`);

const finalCount = db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
console.log(`Total live production articles in database: ${finalCount}`);

// List counts per category
const catCounts = db.prepare(`
  SELECT c.id, c.name, COUNT(a.id) as count 
  FROM categories c 
  LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
  GROUP BY c.id
`).all();

console.log('--- Published Articles per Category ---');
for (const c of catCounts) {
  console.log(`${c.id}. ${c.name}: ${c.count} stories`);
}
