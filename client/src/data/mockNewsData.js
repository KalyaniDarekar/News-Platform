// Realistic Demonstration Dataset for The Bharat Chronicle
// Clearly flagged as demonstration content until production MySQL database connection is established.

export const IS_DEMO_DATA = true;

export const DEMO_NOTICE = {
  text: "DEMONSTRATION EDITION: This portal is currently presenting high-fidelity sample editorial content for Phase 1 UI architecture & layout verification.",
  version: "Phase 1 Preview Build"
};

export const MARKET_DATA = [
  { symbol: "SENSEX", value: "84,312.40", change: "+542.10", percent: "+0.65%", positive: true },
  { symbol: "NIFTY 50", value: "25,815.75", change: "+168.30", percent: "+0.66%", positive: true },
  { symbol: "USD / INR", value: "₹83.88", change: "-0.08", percent: "-0.10%", positive: true },
  { symbol: "GOLD (10g)", value: "₹78,620", change: "+340", percent: "+0.43%", positive: true },
  { symbol: "BRENT CRUDE", value: "$76.40", change: "-1.12", percent: "-1.44%", positive: false }
];

export const WEATHER_DATA = {
  city: "New Delhi",
  temp: "27°C",
  condition: "Clear Sky",
  aqi: "114",
  aqiLabel: "Moderate",
  otherCities: [
    { city: "Mumbai", temp: "29°C", cond: "Partly Cloudy" },
    { city: "Bengaluru", temp: "22°C", cond: "Mild Showers" },
    { city: "Kolkata", temp: "28°C", cond: "Humid" }
  ]
};

export const BREAKING_NEWS = [
  {
    id: 1,
    time: "14:42 IST",
    headline: "ISRO's Shukrayaan Deep-Space Mission completes autonomous orbital insertion ahead of schedule",
    slug: "isro-shukrayaan-deep-space-mission-orbital-insertion"
  },
  {
    id: 2,
    time: "14:15 IST",
    headline: "Sensex rallies 540 points as manufacturing PMI surges to 18-month high; Rupee firms to 83.88",
    slug: "sensex-rallies-manufacturing-pmi-surges"
  },
  {
    id: 3,
    time: "13:50 IST",
    headline: "Parliamentary Standing Committee tables comprehensive Digital Infrastructure & AI Safety Framework",
    slug: "parliamentary-committee-tables-ai-safety-framework"
  },
  {
    id: 4,
    time: "13:10 IST",
    headline: "India-EU Free Trade Agreement negotiations enter decisive ministerial session in Brussels",
    slug: "india-eu-free-trade-agreement-negotiations-ministerial"
  }
];

export const CATEGORIES = [
  { id: 1, name: "National", slug: "national", color: "#0A2540", desc: "Governance, Parliament, Supreme Court, policy and state developments" },
  { id: 2, name: "World", slug: "world", color: "#1E3A8A", desc: "Global diplomacy, bilateral summits, security and international alliances" },
  { id: 3, name: "Economy & Markets", slug: "economy", color: "#047857", desc: "Fiscal policy, Reserve Bank, corporate earnings, trade and capital flows" },
  { id: 4, name: "Tech & AI", slug: "tech", color: "#4338CA", desc: "Semiconductors, generative AI, sovereign compute, startups and science" },
  { id: 5, name: "Opinion & Editorial", slug: "opinion", color: "#B45309", desc: "Analytical essays, editorial stances, guest columns and debate" },
  { id: 6, name: "Climate & Energy", slug: "climate", color: "#065F46", desc: "Renewable energy transition, monsoon tracking and green infrastructure" },
  { id: 7, name: "Culture & Life", slug: "culture", color: "#7C3AED", desc: "Heritage, literature, architecture, arts, society and lifestyle" },
  { id: 8, name: "Sports", slug: "sports", color: "#C2410C", desc: "Cricket, Olympic disciplines, chess championships and athletic leagues" },
  { id: 9, name: "Video News", slug: "video", color: "#DC2626", desc: "Special ground reports, broadcast discussions and documentary shorts" }
];

export const TRENDING_TAGS = [
  "SemiconductorMission",
  "RBI MonetaryPolicy",
  "SpaceTech",
  "GreenHydrogen",
  "DigitalIndia",
  "SupremeCourtReview",
  "WorldCup2026"
];

export const LEAD_STORY = {
  id: 101,
  title: "The Semiconductor Corridor: Inside India’s Multi-Billion Dollar Silicon Fab Buildout",
  slug: "inside-indias-multibillion-dollar-silicon-fab-buildout",
  kicker: "SPECIAL INVESTIGATION",
  summary: "From Gujarat's Dholera to Karnataka's hardware corridors, billions in sovereign capital and global foundry partnerships are racing to anchor domestic microchip sovereignty before the decade turns.",
  category: "Tech & AI",
  categorySlug: "tech",
  author: {
    name: "Rajeshwari Nair",
    title: "Chief Science & Technology Bureau",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80"
  },
  publishedAt: "October 12, 2026 • 09:30 IST",
  readingTime: "7 min read",
  image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  imageCaption: "Inside the cleanroom facilities of the national advanced packaging facility at Sanand, Gujarat. (Photo: Special Bureau / The Bharat Chronicle)",
  isLead: true,
  isBreaking: false,
  keyTakeaways: [
    "Three sovereign-backed semiconductor manufacturing units are entering active cleanroom commissioning this quarter.",
    "Over 18,000 highly specialized engineers are completing training across joint European-Indian academic incubators.",
    "Critical supply chains for ultra-pure chemical inputs and specialty gases are being localized across 4 dedicated industrial parks."
  ],
  content: `
    <p class="lead-paragraph">In the arid plains of Dholera, 100 kilometers southwest of Ahmedabad, the drone of precision construction never pauses. Inside mammoth climate-controlled facilities that dwarf football stadiums, vibration-isolated foundation slabs five meters deep have been cast to anchor lithography machines capable of engraving circuits thinner than a strand of DNA.</p>
    
    <p>This is ground zero for India’s ₹76,000-crore ($9.1 billion) Semiconductor Mission—a calculated gambit to break free from the geopolitical vulnerabilities that have plagued global tech hardware supply chains since the pandemic.</p>

    <blockquote>"Chip autonomy is not simply an industrial objective; it is the cornerstone of national technological sovereignty in the artificial intelligence century."</blockquote>

    <h3>From Silicon Valley to Dholera: The Global Foundry Pivot</h3>
    <p>For decades, India provided the design brains for the world's leading semiconductor firms—nearly 20% of global chip design talent is stationed in Bengaluru, Hyderabad, and Noida—while the lucrative, capital-intensive manufacturing stayed locked in Taiwan, South Korea, and the United States.</p>

    <p>Today, that imbalance is undergoing its most radical transformation in fifty years. Joint ventures pairing domestic industrial conglomerates with established Taiwanese, Japanese, and American foundry operators are bringing commercial wafer fabrication onto Indian soil for the first time.</p>

    <p>The strategic benefits extend far beyond electronics. Electric vehicles, defense radar networks, telecommunications gear, and the burgeoning domestic AI compute clusters all demand uninterrupted supplies of silicon.</p>
  `
};

export const SECONDARY_LEADS = [
  {
    id: 102,
    title: "Reserve Bank Signals Liquidity Normalisation as Core Inflation Stabilises at 3.9%",
    slug: "reserve-bank-signals-liquidity-normalisation-inflation-stabilises",
    kicker: "CAPITAL MARKETS",
    summary: "Governor's Monetary Policy Statement underscores prudent fiscal stewardship while maintaining growth projections at a robust 7.2% for the fiscal year.",
    category: "Economy & Markets",
    categorySlug: "economy",
    author: {
      name: "Dr. Arundhati Sen",
      title: "Senior Editor (Economy)",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 12, 2026 • 11:15 IST",
    readingTime: "4 min read",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 103,
    title: "Strategic Realignment: Quad Foreign Ministers Affirm Free Navigation Mandate",
    slug: "strategic-realignment-quad-foreign-ministers-affirm-free-navigation",
    kicker: "DIPLOMACY",
    summary: "A joint communique from the New Delhi ministerial session emphasizes maritime domain awareness, submarine cable security, and critical minerals supply corridors.",
    category: "World",
    categorySlug: "world",
    author: {
      name: "Vikramaditya Sharma",
      title: "Editor-in-Chief",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 12, 2026 • 10:45 IST",
    readingTime: "5 min read",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 104,
    title: "The High-Altitude Green Corridor: Ladakh's 13GW Solar-Wind Mega Complex Clears Wildlife Audit",
    slug: "ladakh-solar-wind-mega-complex-wildlife-audit",
    kicker: "ENERGY TRANSITION",
    summary: "World's highest renewable energy farm secures ecological clearance with wildlife crossings and subterranean transmission cables feeding northern grids.",
    category: "Climate & Energy",
    categorySlug: "climate",
    author: {
      name: "Kavita Krishnamurthy",
      title: "Environment Bureau",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 12, 2026 • 08:20 IST",
    readingTime: "4 min read",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80"
  }
];

export const OPINIONS = [
  {
    id: 201,
    title: "Fiscal Prudence vs Capex Ambition: Balancing the Republic’s Balance Sheet",
    slug: "fiscal-prudence-vs-capex-ambition",
    kicker: "THE MONDAY ESSAY",
    excerpt: "Infrastructure capital expenditure has driven India's post-pandemic growth, but the next phase requires crowding in private enterprise without bloating sovereign debt.",
    author: {
      name: "Dr. Arundhati Sen",
      designation: "Former Member, Prime Minister's Economic Advisory Council",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
    },
    readTime: "6 min read"
  },
  {
    id: 202,
    title: "The Geopolitics of South Asian Energy Grids: Delhi’s Power Diplomacy",
    slug: "geopolitics-of-south-asian-energy-grids",
    kicker: "EDITORIAL PERSPECTIVE",
    excerpt: "Cross-border electricity trading with Nepal, Bhutan, and Bangladesh is quietly doing what decades of formal summits couldn't: integrating the sub-continent.",
    author: {
      name: "Vikramaditya Sharma",
      designation: "Editor-in-Chief, The Bharat Chronicle",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
    },
    readTime: "5 min read"
  },
  {
    id: 203,
    title: "AI Governance Cannot Be Delegated to Big Tech: A Constitutional View",
    slug: "ai-governance-cannot-be-delegated-to-big-tech",
    kicker: "GUEST COLUMN",
    excerpt: "When algorithms mediate credit scores, bail hearings, and public welfare distribution, due process and algorithmic transparency must be enforceable rights.",
    author: {
      name: "Justice (Retd.) K. Venkatesh",
      designation: "Former Judge & Constitutional Jurist",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
    },
    readTime: "7 min read"
  }
];

export const THE_WIRE_UPDATES = [
  { id: 301, time: "14:40 IST", category: "TECH", title: "Open-source Indic LLM consortium releases 22-language multimodal foundation model", slug: "indic-llm-consortium-releases-22-language-model" },
  { id: 302, time: "14:22 IST", category: "MARKETS", title: "Crude oil slips below $77 as OPEC+ maintains gradual output expansion calendar", slug: "crude-oil-slips-opec-expansion" },
  { id: 303, time: "13:58 IST", category: "POLICY", title: "Civil Aviation Ministry notifies revised drone airspace maps covering 120 tier-2 cities", slug: "civil-aviation-drone-airspace-maps" },
  { id: 304, time: "13:30 IST", category: "DEFENCE", title: "Indigenous Tejas Mk-1A squadron deploys to Western Air Command forward base", slug: "tejas-mk1a-squadron-deployment" },
  { id: 305, time: "12:50 IST", category: "HERITAGE", title: "Archaeological Survey identifies 11th-century temple inscriptions near Hampi sanctuary", slug: "asi-inscriptions-hampi-sanctuary" }
];

export const MULTIMEDIA_STORIES = [
  {
    id: 401,
    title: "Ground Report: Inside the Deepest Underground Tunnel of the Himalayan Rail Link",
    duration: "14:25",
    category: "Video News",
    views: "248K views",
    thumbnail: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80",
    slug: "himalayan-rail-link-ground-report"
  },
  {
    id: 402,
    title: "Explained: How India's Sovereign Rupee Vostro Accounts Bypass SWIFT Friction",
    duration: "09:42",
    category: "Economy Watch",
    views: "185K views",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80",
    slug: "rupee-vostro-accounts-explained"
  },
  {
    id: 403,
    title: "Conversations: Isro Chairman on Gaganyaan Human Spaceflight Timelines",
    duration: "21:10",
    category: "Special Interview",
    views: "310K views",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    slug: "isro-chairman-interview-gaganyaan"
  }
];

export const SPONSORED_STORIES = [
  {
    id: 501,
    title: "Decarbonising Heavy Industry: The New Standard for Green Cement and Steel in India",
    client: "Confederation of Indian Industry (CII) & Clean Energy Alliance",
    category: "Partner Content",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    slug: "partner-decarbonising-heavy-industry-cii",
    summary: "How next-generation carbon capture and green hydrogen are redefining India's industrial backbone ahead of global carbon border adjustments."
  }
];

export const ALL_STORIES = [
  LEAD_STORY,
  ...SECONDARY_LEADS,
  {
    id: 105,
    title: "Supreme Court Constitution Bench to Hear Petitions on Inter-State River Water Sharing",
    slug: "supreme-court-bench-inter-state-water-sharing",
    kicker: "JUDICIARY",
    summary: "Seven-judge bench will deliberate on federal mechanisms to adjudicate riparian rights amidst changing precipitation patterns.",
    category: "National",
    categorySlug: "national",
    author: {
      name: "Vikramaditya Sharma",
      title: "Editor-in-Chief",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 11, 2026 • 18:30 IST",
    readingTime: "5 min read",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
    content: "<p>The Supreme Court will commence arguments on riparian rights in the coming term...</p>"
  },
  {
    id: 108,
    title: "Parliamentary Standing Committee Tables Omnibus Digital Infrastructure & AI Safety Regulatory Framework",
    slug: "parliament-standing-committee-ai-safety-framework",
    kicker: "GOVERNANCE",
    summary: "Cross-party panel recommends statutory auditing for critical compute models and domestic data protection safeguards.",
    category: "National",
    categorySlug: "national",
    author: {
      name: "Vikramaditya Sharma",
      title: "Editor-in-Chief",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 11, 2026 • 14:10 IST",
    readingTime: "4 min read",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
    content: "<p>The Parliamentary Standing Committee has formally tabled its comprehensive digital safety report...</p>"
  },
  {
    id: 109,
    title: "Green Freight Corridor: 1,200 km Dedicated Electric Rail Link Clears Final Phase",
    slug: "green-freight-corridor-electric-rail-link",
    kicker: "INFRASTRUCTURE",
    summary: "High-speed logistics route connecting northern industrial clusters to western ports cuts transit freight times by 40%.",
    category: "National",
    categorySlug: "national",
    author: {
      name: "Kavita Krishnamurthy",
      title: "Environment & Infra Bureau",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 11, 2026 • 11:20 IST",
    readingTime: "4 min read",
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
    content: "<p>The Dedicated Freight Corridor Corporation confirmed commercial trials...</p>"
  },
  {
    id: 110,
    title: "Quantum Computing Sovereign Hub Inaugurated in Pune with 64-Qubit Coherence Testbed",
    slug: "quantum-computing-hub-pune-64-qubit",
    kicker: "DEEP TECH",
    summary: "Joint national consortium brings together top academic labs and defense research to test fault-tolerant quantum algorithms.",
    category: "Tech & AI",
    categorySlug: "tech",
    author: {
      name: "Rajeshwari Nair",
      title: "Chief Science & Technology Bureau",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 10, 2026 • 16:45 IST",
    readingTime: "5 min read",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
    content: "<p>India's National Quantum Mission entered a significant milestone...</p>"
  },
  {
    id: 111,
    title: "Indigenous RISC-V Microprocessor 'Shakti-64' Enters Automotive Production Testing",
    slug: "indigenous-risc-v-shakti-automotive-testing",
    kicker: "SEMICONDUCTORS",
    summary: "Domestic silicon architecture designed by IIT Madras and C-DAC secures automotive safety certification for electric vehicles.",
    category: "Tech & AI",
    categorySlug: "tech",
    author: {
      name: "Rajeshwari Nair",
      title: "Chief Science & Technology Bureau",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 10, 2026 • 12:15 IST",
    readingTime: "4 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80",
    content: "<p>Automotive grade microprocessor verification has cleared compliance checks...</p>"
  },
  {
    id: 112,
    title: "ISRO Deep-Space Optical Communications Terminal Commissioned at High-Altitude Observatory",
    slug: "isro-deep-space-optical-communications-terminal",
    kicker: "SPACE EXPLORATION",
    summary: "Laser-based interplanetary uplink achieves 10x bandwidth boost for future Mars and Venus robotic missions.",
    category: "Tech & AI",
    categorySlug: "tech",
    author: {
      name: "Rajeshwari Nair",
      title: "Chief Science & Technology Bureau",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 09, 2026 • 17:30 IST",
    readingTime: "5 min read",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    content: "<p>Laser communication between planetary orbits and ground stations...</p>"
  },
  {
    id: 106,
    title: "Indian Grandmaster D. Gukesh Takes Sole Lead at FIDE Candidates in Montreal",
    slug: "gukesh-fide-candidates-montreal-lead",
    kicker: "CHESS",
    summary: "With a masterclass in positional endgame play against the world number three, the 20-year-old moves half a point clear of the field.",
    category: "Sports",
    categorySlug: "sports",
    author: {
      name: "Sanjay Manjrekar",
      title: "Sports Correspondent",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 11, 2026 • 22:15 IST",
    readingTime: "3 min read",
    image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=600&q=80",
    content: "<p>In an extraordinary display of deep calculation, Gukesh navigated a 64-move rook endgame...</p>"
  },
  {
    id: 107,
    title: "Ancient Stepwells of Rajasthan: Modern Lessons in Decentralised Water Conservation",
    slug: "stepwells-rajasthan-water-conservation",
    kicker: "HERITAGE & ARCHITECTURE",
    summary: "Architects and hydrologists are turning to 800-year-old subterranean stepwells to solve water table depletion in drought-prone districts.",
    category: "Culture & Life",
    categorySlug: "culture",
    author: {
      name: "Ananya Deshpande",
      title: "Arts & Culture Editor",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
    },
    publishedAt: "October 10, 2026 • 15:40 IST",
    readingTime: "6 min read",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
    content: "<p>The geometric symmetry of Chand Baori has captivated historians for centuries...</p>"
  }
];

export const AD_BANNERS = {
  headerLeaderboard: {
    slot: "header_leaderboard",
    dimension: "970x90",
    title: "India Global Tech Summit 2026 — Registration Open",
    sponsor: "Confederation of Indian Industry",
    cta: "Explore Summit Agenda",
    url: "#"
  },
  sidebarRectangle: {
    slot: "article_sidebar_top",
    dimension: "300x250",
    title: "National Infrastructure Investment Fund",
    sponsor: "NIIF Sovereign Partner",
    cta: "Download Annual Report",
    url: "#"
  },
  midBillboard: {
    slot: "homepage_mid_billboard",
    dimension: "970x120",
    title: "Bharat Green Bonds 2026 — Sovereign Yield Portfolio",
    sponsor: "Ministry of New & Renewable Energy Partner",
    cta: "Learn More",
    url: "#"
  }
};
