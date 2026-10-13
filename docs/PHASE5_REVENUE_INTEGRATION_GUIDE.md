# Phase 5: Sustainable Digital Media Revenue & Integration Guide
**The Bharat Chronicle • Digital News Platform**  
*Document Version: 5.0 • Target Architecture: React 19, Express, MySQL 8 / cPanel / Node.js 24*

---

## 1. Executive Summary & Revenue Philosophy

Phase 5 transitions *The Bharat Chronicle* from an editorial publication into a sustainable digital media enterprise. Rather than simply embedding intrusive third-party display advertisements that compromise user experience and editorial integrity, this phase provides a **multi-tiered monetization foundation**:

1. **Direct Advertiser Commercial Desk:** High-margin direct sponsorship packages managed internally without ad-tech revenue sharing.
2. **7 Strategic Editorial Ad Placements:** Unobtrusive, responsive placements across Header, Hero-adjacent, In-Article, Desktop Sidebar, Category Pages, Footer, and Mobile Anchor.
3. **Official YouTube Video Integration:** Direct audience growth and syndication via official, compliant YouTube embeds with strictly disabled audio autoplay.
4. **First-Party Privacy-Preserving Analytics:** Audited reader engagement telemetry with 15-minute debouncing, salted IP hashing, and full DPDP Act (India) / GDPR compliance.
5. **Programmatic Ad Network Readiness:** Native support for Google AdSense or regional ad exchanges once the site meets domain maturity and traffic criteria.
6. **Zero Revenue Fabrication Guarantee:** All displayed statistics, page views, and click counts reflect verified database records—never simulated numbers or exaggerated CPM yields.

---

## 2. Architecture & Data Model (MySQL & Hybrid Engine)

### 2.1 Database Schema Extensions (`server/database/schema_phase5.sql`)

Phase 5 introduces four dedicated relational structures and enhances existing tables:

* **`advertisements` (Enhanced):**
  * `ad_type`: `'image'` (uploaded media banner) or `'code'` (sandboxed HTML/AdSense tag).
  * `ad_code`: Raw network script tag (strictly restricted to authorized administrators).
  * `priority`: Integer weighting (1–10) ensuring primary commercial sponsors receive proportional impressions.
  * `start_date` / `end_date`: Time-bound flight scheduling for campaign contracts.
  * `active`: Instant operational kill-switch.
  * `impressions_count` & `clicks_count`: First-party verified event counters.
* **`advertiser_enquiries` (Direct Sales CRM):**
  * Stores commercial leads: company, contact person, email, phone, campaign budget tier, target placements, start date, and brief.
  * Lead lifecycle status: `new` → `contacted` → `proposal_sent` → `closed_won` → `closed_lost`.
  * `admin_notes` & `updated_by` for internal editorial and sales tracking.
* **`youtube_videos` (Broadcast Desk):**
  * Curated list of verified YouTube broadcast dispatches.
  * Auto-extracts standard 11-character YouTube video IDs from any URL format (`watch?v=`, `youtu.be/`, `embed/`).
  * `is_featured` flag for homepage hero broadcast module.
* **`analytics_page_views` & `analytics_ad_events`:**
  * Raw event telemetry logs with salted IP hashes (DPDP compliant) and device categories.
* **`settings` (Public Client Configuration):**
  * Stores public identifiers (`adsense_publisher_id`, `ga4_measurement_id`, `google_search_console_meta`, `youtube_channel_url`, `media_kit_url`, `dpdp_compliance_mode`).

### 2.2 Intelligent Hybrid Fallback System

* **Production (cPanel / Cloud Linux):** Connects to MySQL on port 3306 using connection pooling in `server/config/database.js`.
* **Local Development & Offline Staging:** If MySQL credentials are unauthenticated or offline, the Express server seamlessly falls back to Node 24's native `DatabaseSync` engine (`server/data/chronicle_dev.sqlite`) with pre-seeded staff, dispatches, and Phase 5 ad inventory.

---

## 3. The 7 Editorial Ad Placements

| Slot Identifier | UI Placement | Recommended Dimensions | Desktop / Mobile Behavior |
| :--- | :--- | :--- | :--- |
| `header_leaderboard` | Top Header below Ticker | 970×90 or 728×90 | Displays on homepage and section heads; responsive scaling |
| `homepage_hero_adjacent` | Next to Lead Headline Story | 300×250 or 300×600 | High-impact viewability alongside breaking lead news |
| `article_inline` | Mid-Article Body Flow | 728×90 or 300×250 | Naturally embedded between paragraphs without blocking text |
| `article_sidebar_top` | Desktop Story Detail Column | 300×250 or 300×600 | Sticky desktop showcase beside editorial analysis |
| `category_page_banner` | Category Head Banner | 970×90 or 728×90 | Contextual alignment with section topics (Economy, Defense) |
| `footer_banner` | Above Global Footer Masthead | 970×90 or 728×90 | Sits above publication footer; captures end-of-page readers |
| `mobile_anchor_banner` | Floating Mobile Viewport Bottom | 320×50 or 300×50 | Persistent floating anchor on mobile; collapsible by user |

### Security & Sanitization
* **Role-Based Ad Script Editing:** Ordinary editorial staff can only upload image creatives with validated URLs. Direct HTML/script tags (`ad_type = 'code'`) can only be saved by users with `super_admin` or `ad_manager` roles.
* **Sandboxed Rendering:** Custom ad codes are rendered within sandboxed frames to prevent cross-site scripting (XSS) or DOM poisoning.

---

## 4. Direct Advertiser Business Workflow

### 4.1 Public Commercial Page (`/advertise`)
Prospective brand partners can visit `/advertise` to review:
* Editorial readership focus (policy makers, enterprise executives, defense analysts).
* Placement specs, viewability standards, and direct commercial contact information.
* Verified Media Kit PDF download.
* Interactive Campaign Enquiry Form with immediate validation and MySQL storage.

### 4.2 Lead Management CRM (`/admin/enquiries`)
Authorized staff manage incoming commercial inquiries through a dedicated CRM interface:
* Filter leads by status (`new`, `contacted`, `proposal_sent`, `closed_won`, `closed_lost`).
* Update internal sales notes and status transitions.
* One-click direct email response integration.

---

## 5. YouTube Channel & Video News Integration

### 5.1 Editorial Video Gallery (`/videos`)
* Aggregates investigative multimedia reports and broadcast dispatches.
* Displays verified YouTube channel subscribe CTA with `?sub_confirmation=1` to build the channel audience.
* Responsive video player modal with official YouTube embeds.

### 5.2 Article Attachment & Homepage Showcase
* Editors can attach any YouTube report URL to an article in the CMS editor (`article.youtube_url`).
* The homepage features a dedicated "Video Newsroom" module showcasing the latest featured video.
* **Autoplay Compliance:** All embeds strictly utilize `autoplay=0` and official iframe parameters (`rel=0`) to ensure no disruptive audio playback occurs on page load.

---

## 6. Privacy-Preserving First-Party Analytics

### 6.1 Telemetry Safeguards
* **15-Minute In-Memory Debouncing:** The backend maintains an in-memory cache keyed by `sessionId:pagePath`. Repeated page rerenders or React 19 strict mode cycles within 15 minutes are discarded, preventing inflated page view figures.
* **Bot & Crawler Filtering:** Known search spiders and automated user-agents (Googlebot, Bingbot, SemrushBot, curl, Python) are logged or filtered from human audience tallies.
* **Salted IP Hashing:** IP addresses are hashed using `crypto.createHash('sha256')` with an environment salt, preserving reader anonymity under the DPDP Act and GDPR.

### 6.2 Admin Analytics Dashboard (`/admin/analytics`)
* Verified metrics: Total Page Views, Unique Reader Sessions, Ad Impressions, and Ad Clicks.
* Traffic trends over time (7 Days, 30 Days, 90 Days, All Time).
* Top performing dispatches and category engagement distribution.
* Reader device breakdown (Desktop, Mobile, Tablet) and verified referring sources.

---

## 7. Connecting Real External Accounts (Step-by-Step)

### 7.1 Google AdSense Setup
1. **Domain Readiness:** Ensure the site has at least 30–50 unique published dispatches, comprehensive About, Contact, Privacy Policy, and Editorial Policies pages, and consistent daily traffic.
2. **Apply for AdSense:** Sign in to [Google AdSense](https://www.google.com/adsense) and submit `https://yourdomain.com`.
3. **Configure `ads.txt`:** Place your verified `ads.txt` file inside `client/public/ads.txt`:
   ```text
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```
4. **Enter Publisher ID:** In the Admin Panel (`/admin/settings` → *Ad Monetization* tab), enter your Publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`).
5. **Slot Activation:** When approved, administrators can create an Ad campaign with `ad_type = 'code'` and insert the approved Google AdSense responsive ad unit code snippet into the designated placement.

### 7.2 Google Analytics 4 (GA4) Setup
1. Create a GA4 property in the [Google Analytics Admin Console](https://analytics.google.com).
2. Create a Web Data Stream and copy the **Measurement ID** (`G-XXXXXXXXXX`).
3. In `/admin/settings` → *GA4 & Search Console* tab, paste the Measurement ID and click **Save & Deploy Settings**.
4. The frontend will dynamically initialize the GA4 tag for readers who provide analytics consent via the DPDP banner.

### 7.3 Google Search Console Setup
1. Open [Google Search Console](https://search.google.com/search-console) and choose **URL Prefix** (`https://yourdomain.com`).
2. Select **HTML Tag** verification method and copy the meta tag string.
3. In `/admin/settings` → *GA4 & Search Console* tab, paste the token.
4. Submit your XML Sitemap URL: `https://yourdomain.com/sitemap.xml`.
5. The backend automatically produces real-time XML sitemaps excluding unpublished or expired stories.

### 7.4 Official YouTube Channel Setup
1. Go to [YouTube Studio](https://studio.youtube.com) → Customization → Basic info.
2. Copy your channel URL (`https://www.youtube.com/@YourChannelName`).
3. In `/admin/settings` → *YouTube News Broadcast* tab, paste the URL.
4. The site's subscribe links will automatically append `?sub_confirmation=1` to convert article readers into channel subscribers.

---

## 8. cPanel & Production Database Migration

When deploying to cPanel or a live Linux host:

1. **Import Database Migration:**
   Open cPanel phpMyAdmin or run MySQL CLI:
   ```bash
   mysql -u chronicle_user -p chronicle_news < server/database/schema_phase5.sql
   ```
2. **Configure Environment Variables (`server/.env`):**
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=localhost
   DB_USER=chronicle_user
   DB_PASSWORD=YourSecureProductionPassword!
   DB_NAME=chronicle_news
   JWT_SECRET=YourProductionSecretKey64CharsLong
   DPDP_SALT=SecureSaltStringForIPHashing
   ```
3. **Run Migration Check:**
   ```bash
   cd server
   node database/migrate.js
   ```
4. **Build Frontend Bundle:**
   ```bash
   cd client
   npm run build
   ```
   Upload the resulting `client/dist/` contents to `public_html/`.

---

*The Bharat Chronicle Editorial & Commercial Engineering Bureau • Phase 5 Deployment Complete*
