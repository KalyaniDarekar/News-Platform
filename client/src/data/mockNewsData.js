// JANTA JOURNAL — Production Static Metadata & Fallback Taxonomies
export const IS_DEMO_DATA = false;
export const DEMO_NOTICE = null;

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
  "NationalNews",
  "Economy",
  "PolicyReview",
  "Technology",
  "GlobalAffairs",
  "ClimateAction",
  "SportsDesk"
];

// Production defaults (no demo articles)
export const BREAKING_NEWS = [];
export const LEAD_STORY = null;
export const SECONDARY_LEADS = [];
export const OPINIONS = [];
export const THE_WIRE_UPDATES = [];
export const ALL_STORIES = [];

export const AD_BANNERS = {
  headerLeaderboard: {
    slot: "header_leaderboard",
    dimension: "970x90",
    title: "Partner with JANTA JOURNAL",
    sponsor: "Commercial Desk",
    cta: "Advertise With Us",
    url: "/advertise"
  },
  sidebarRectangle: {
    slot: "article_sidebar_top",
    dimension: "300x250",
    title: "Partner with JANTA JOURNAL",
    sponsor: "Commercial Desk",
    cta: "Advertise With Us",
    url: "/advertise"
  },
  midBillboard: {
    slot: "homepage_mid_billboard",
    dimension: "970x120",
    title: "Partner with JANTA JOURNAL",
    sponsor: "Commercial Desk",
    cta: "Advertise With Us",
    url: "/advertise"
  }
};
