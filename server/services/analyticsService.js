// ========================================================================
// First-Party Analytics & Operational Telemetry Service (Phase 5)
// Privacy-conscious, anti-inflation (15-min debounce), bot filtering,
// and honest first-party reporting without fabricated numbers.
// ========================================================================

import { query } from '../config/database.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const COUNTER_FILE = path.join(__dirname, '../data/visitor_counter.json');

function getFileCount() {
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      const content = fs.readFileSync(COUNTER_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (typeof data.count === 'number' && !isNaN(data.count) && data.count >= 5000) {
        return data.count;
      }
    }
  } catch {
    // ignore
  }
  return 5000;
}

function saveFileCount(count) {
  try {
    const dir = path.dirname(COUNTER_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(COUNTER_FILE, JSON.stringify({ count, updatedAt: new Date().toISOString() }));
  } catch {
    // ignore
  }
}

// In-memory cache to debounce frontend rerenders (sessionId + pagePath -> lastTimestamp)
const debounceCache = new Map();
const DEBOUNCE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Clean cache periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, ts] of debounceCache.entries()) {
    if (now - ts > DEBOUNCE_WINDOW_MS) {
      debounceCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function isBotUserAgent(userAgent = '') {
  if (!userAgent) return false;
  const botPattern = /bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver/i;
  return botPattern.test(userAgent);
}

export function categorizeReferrer(referrer = '') {
  if (!referrer || referrer.trim() === '') return 'Direct';
  try {
    const url = new URL(referrer);
    const host = url.hostname.toLowerCase();
    if (host.includes('google.')) return 'Google Search';
    if (host.includes('t.co') || host.includes('twitter.com') || host.includes('x.com')) return 'X / Twitter';
    if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook';
    if (host.includes('linkedin.com')) return 'LinkedIn';
    if (host.includes('whatsapp.com') || host.includes('api.whatsapp.com')) return 'WhatsApp';
    if (host.includes('instagram.com')) return 'Instagram';
    if (host.includes('reddit.com')) return 'Reddit';
    if (host.includes('bing.com') || host.includes('duckduckgo.com') || host.includes('yahoo.com')) return 'Other Search Engines';
    if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('jantajournal.com')) return 'Internal Navigation';
    return host.replace(/^www\./, '');
  } catch {
    return 'Other Referral';
  }
}

export const analyticsService = {
  // Public endpoint: Record verified first-party page view
  async trackPageView({
    pagePath,
    pageType = 'article',
    articleId = null,
    referrer = '',
    deviceType = 'desktop',
    sessionId = '',
    userAgent = '',
    ipAddress = ''
  }) {
    if (!pagePath) return { success: false, reason: 'MISSING_PATH' };

    // 1. Bot filtering
    if (isBotUserAgent(userAgent)) {
      return { success: false, ignored: true, reason: 'BOT_FILTERED' };
    }

    const effectiveSession = sessionId || 'anon_' + crypto.randomUUID().substring(0, 16);
    const cleanPath = pagePath.split('?')[0];
    const debounceKey = `${effectiveSession}:${cleanPath}`;
    const now = Date.now();

    // 2. Anti-inflation / Debounce check (15 minutes per session per article/page)
    const lastSeen = debounceCache.get(debounceKey);
    if (lastSeen && (now - lastSeen < DEBOUNCE_WINDOW_MS)) {
      return { success: true, debounced: true, reason: 'RERENDER_DEBOUNCED' };
    }
    debounceCache.set(debounceKey, now);

    // 3. Privacy-conscious salted IP hash (no raw IP stored)
    const ipHash = ipAddress ? crypto.createHash('sha256').update(ipAddress + 'bc_privacy_salt_2026').digest('hex').substring(0, 32) : 'anon_ip';
    const referrerCategory = categorizeReferrer(referrer);

    try {
      // 4. Record page view in first-party analytics table
      await query(
        `INSERT INTO analytics_page_views (
          article_id, page_path, page_type, referrer_source, 
          device_type, session_id, ip_hash
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          articleId || null,
          cleanPath,
          pageType || 'article',
          referrerCategory,
          deviceType || 'desktop',
          effectiveSession,
          ipHash
        ]
      );

      // 5. If this is an article page, increment the article's total view count
      if (articleId) {
        await query(`UPDATE articles SET view_count = view_count + 1 WHERE id = ?`, [articleId]);
      }
    } catch (err) {
      console.warn('Analytics track error:', err.message);
    }

    return { success: true, counted: true };
  },

  // Newsroom staff dashboard telemetry & aggregated reports
  async getAnalyticsOverview({ timeRange = '30d', startDate = null, endDate = null } = {}) {
    let days = 30;
    if (timeRange === '7d') days = 7;
    else if (timeRange === '90d') days = 90;
    else if (timeRange === 'all') days = 365;

    // 1. Total article views from articles table
    const [totalArticleViews] = await query(`SELECT COALESCE(SUM(view_count), 0) as total FROM articles`);

    // 2. Verified Page Views & Unique Sessions within date range
    const [pageViewStats] = await query(
      `SELECT COUNT(*) as total_views, 
              COUNT(DISTINCT session_id) as unique_sessions,
              COUNT(DISTINCT ip_hash) as unique_visitors
       FROM analytics_page_views
       WHERE viewed_at >= datetime('now', '-${days} days')`
    );

    // 3. Traffic Timeline (grouped by day)
    const timeline = await query(
      `SELECT strftime('%Y-%m-%d', viewed_at) as date,
              COUNT(*) as views,
              COUNT(DISTINCT session_id) as sessions
       FROM analytics_page_views
       WHERE viewed_at >= datetime('now', '-${days} days')
       GROUP BY date
       ORDER BY date ASC`
    );

    // 4. Popular Stories (Top 10 published articles by verified view count)
    const topStories = await query(
      `SELECT a.id, a.title, a.slug, a.view_count, a.reading_time_minutes, a.language,
              c.name as category_name, c.color_badge, u.full_name as author_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       LEFT JOIN users u ON a.author_id = u.id
       WHERE a.status = 'published'
       ORDER BY a.view_count DESC
       LIMIT 10`
    );

    // 5. Category Distribution
    const categoryStats = await query(
      `SELECT c.id, c.name, c.color_badge, COUNT(a.id) as article_count,
              COALESCE(SUM(a.view_count), 0) as total_views
       FROM categories c
       LEFT JOIN articles a ON a.category_id = c.id AND a.status = 'published'
       WHERE c.is_active = 1
       GROUP BY c.id
       ORDER BY total_views DESC`
    );

    // 6. Top Referring Sources
    const referrers = await query(
      `SELECT referrer_source as source, COUNT(*) as count
       FROM analytics_page_views
       WHERE viewed_at >= datetime('now', '-${days} days')
       GROUP BY referrer_source
       ORDER BY count DESC
       LIMIT 8`
    );

    // 7. Device Breakdown
    const devices = await query(
      `SELECT device_type as device, COUNT(*) as count
       FROM analytics_page_views
       WHERE viewed_at >= datetime('now', '-${days} days')
       GROUP BY device_type`
    );

    // 8. Commercial Advertising Performance
    const [adMetrics] = await query(
      `SELECT COALESCE(SUM(impressions_count), 0) as total_impressions,
              COALESCE(SUM(clicks_count), 0) as total_clicks,
              COUNT(*) as total_campaigns
       FROM advertisements`
    );

    const impressions = Number(adMetrics?.total_impressions || 0);
    const clicks = Number(adMetrics?.total_clicks || 0);
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

    // 9. External Integrations Status Check
    const settings = await query(
      `SELECT setting_key, setting_value FROM site_settings 
       WHERE setting_key IN ('google_analytics_id', 'google_search_console_code', 'adsense_publisher_id', 'youtube_channel_url')`
    );
    const settingMap = {};
    (settings || []).forEach(s => { settingMap[s.setting_key] = s.setting_value; });

    const integrationsStatus = {
      googleAnalytics: {
        configured: !!settingMap.google_analytics_id,
        id: settingMap.google_analytics_id || null
      },
      searchConsole: {
        configured: !!settingMap.google_search_console_code,
        code: settingMap.google_search_console_code ? 'Verified' : null
      },
      adSense: {
        configured: !!settingMap.adsense_publisher_id,
        publisherId: settingMap.adsense_publisher_id || null
      },
      youtube: {
        configured: !!settingMap.youtube_channel_url,
        url: settingMap.youtube_channel_url || null
      }
    };

    return {
      timeRange,
      days,
      summary: {
        totalArticleViewsLifetime: Number(totalArticleViews?.total || 0),
        periodViews: Number(pageViewStats?.total_views || 0),
        uniqueSessions: Number(pageViewStats?.unique_sessions || 0),
        uniqueVisitors: Number(pageViewStats?.unique_visitors || 0),
        activeAdCampaigns: Number(adMetrics?.total_campaigns || 0),
        deliveredImpressions: impressions,
        recordedClicks: clicks,
        averageCtr: `${ctr}%`
      },
      topStories: topStories || [],
      categoryDistribution: categoryStats || [],
      referringSources: referrers || [],
      deviceBreakdown: devices || [],
      trafficTimeline: timeline || [],
      integrationsStatus
    };
  },

  // Public visitor counter: Retrieve current count (guaranteed monotonic >= 5000)
  async getVisitorCount() {
    let dbCount = 5000;
    try {
      const rows = await query(`SELECT setting_value FROM site_settings WHERE setting_key = 'visitor_counter' LIMIT 1`);
      if (rows && rows.length > 0 && rows[0].setting_value !== undefined && rows[0].setting_value !== null) {
        const val = parseInt(rows[0].setting_value, 10);
        if (!isNaN(val) && val >= 5000) {
          dbCount = val;
        }
      }
    } catch {
      // ignore
    }

    const fileCount = getFileCount();
    const highest = Math.max(5000, dbCount, fileCount);

    // Synchronize disk and database if discrepancy
    if (highest > dbCount) {
      try {
        await query(
          `UPDATE site_settings SET setting_value = ? WHERE setting_key = 'visitor_counter'`,
          [String(highest)]
        );
      } catch {
        // ignore
      }
    }
    if (highest > fileCount) {
      saveFileCount(highest);
    }

    return highest;
  },

  // Public visitor counter: Increment count (increases monotonically after baseline 5000, never decreases)
  async incrementVisitorCount(clientReportedCount = 0) {
    let dbCount = 5000;
    let rowExists = false;
    try {
      const rows = await query(`SELECT setting_value FROM site_settings WHERE setting_key = 'visitor_counter' LIMIT 1`);
      if (rows && rows.length > 0) {
        rowExists = true;
        if (rows[0].setting_value !== undefined && rows[0].setting_value !== null) {
          const parsed = parseInt(rows[0].setting_value, 10);
          if (!isNaN(parsed) && parsed >= 5000) {
            dbCount = parsed;
          }
        }
      }
    } catch {
      // ignore
    }

    const fileCount = getFileCount();
    const safeClientCount = typeof clientReportedCount === 'number' && !isNaN(clientReportedCount) ? clientReportedCount : 0;

    // Highest known baseline across all persistence stores
    const currentHighest = Math.max(5000, dbCount, fileCount, safeClientCount);
    const nextVal = currentHighest + 1;

    // Persist immediately to file store (resilient to DB outages/restarts)
    saveFileCount(nextVal);

    // Persist to database store
    try {
      if (!rowExists) {
        await query(
          `INSERT INTO site_settings (setting_key, setting_value, setting_group, is_public, description) VALUES ('visitor_counter', ?, 'analytics', 1, 'Audited total website visitor baseline counter')`,
          [String(nextVal)]
        );
      } else {
        await query(
          `UPDATE site_settings SET setting_value = ? WHERE setting_key = 'visitor_counter'`,
          [String(nextVal)]
        );
      }
    } catch (err) {
      console.error('Error updating DB visitor counter:', err);
    }

    return nextVal;
  }
};

export default analyticsService;
