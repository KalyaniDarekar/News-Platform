// ========================================================================
// JANTA JOURNAL — Public & Editorial API Client Service
// Connects all public content interfaces to the live Express + MySQL backend.
// ========================================================================

import {
  CATEGORIES,
  MARKET_DATA,
  WEATHER_DATA,
  AD_BANNERS
} from '../data/mockNewsData';
import {
  getMediaUrl,
  handleImageError,
  DEFAULT_NEWS_IMAGE,
  DEFAULT_AVATAR_IMAGE,
  formatArticleContent
} from '../utils/media';

export {
  getMediaUrl,
  handleImageError,
  DEFAULT_NEWS_IMAGE,
  DEFAULT_AVATAR_IMAGE,
  formatArticleContent
};

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'
);

const RAW_API_BASE = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000/api' : 'https://api.jantajournal.in/api');
const API_BASE = RAW_API_BASE.endsWith('/v1') ? RAW_API_BASE : `${RAW_API_BASE.replace(/\/+$/, '')}/v1`;

// Timezone configured for newsroom publications (IST: Asia/Kolkata)
const EDITORIAL_TIMEZONE = 'Asia/Kolkata';

/**
 * Robust UTC Date parser.
 * Handles MySQL DATETIME ("YYYY-MM-DD HH:MM:SS"), ISO strings with or without Z,
 * ensuring timestamps are parsed consistently across all browsers without timezone drift.
 */
export const parseAsUtcDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr;
  let str = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(str)) {
    str = str.replace(' ', 'T');
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str) && !str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    str = `${str}Z`;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

export const formatEditorialDate = (dateStr, options = {}) => {
  if (!dateStr) return '';
  try {
    const date = parseAsUtcDate(dateStr);
    if (!date) return String(dateStr);

    const defaultOptions = {
      timeZone: EDITORIAL_TIMEZONE,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };

    const formatted = new Intl.DateTimeFormat('en-IN', { ...defaultOptions, ...options }).format(date);
    return `${formatted} IST`;
  } catch {
    return String(dateStr);
  }
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  try {
    const date = parseAsUtcDate(dateStr);
    if (!date) return String(dateStr);

    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    const mins = Math.floor(diffSec / 60);
    if (mins === 1) return '1 min ago';
    if (mins < 60) return `${mins} mins ago`;

    const hours = Math.floor(diffSec / 3600);
    if (hours === 1) return '1 hr ago';
    if (hours < 24) return `${hours} hrs ago`;

    const days = Math.floor(diffSec / 86400);
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;

    return formatEditorialDate(dateStr, { hour: undefined, minute: undefined });
  } catch {
    return String(dateStr);
  }
};

/**
 * Editorial Smart Publish Time:
 * - If published less than 1 hour ago (< 3600s): Shows accurate relative time ('Just now', '1 min ago', 'X mins ago')
 * - After 1 hour (>= 3600s): Shows exact formatted time in IST (e.g. '23 Oct 2026, 10:25 PM IST')
 */
export const getPublishTimeDetails = (dateStr) => {
  if (!dateStr) return { display: '', relative: '', exact: '', isWithinOneHour: false };
  const date = parseAsUtcDate(dateStr);
  if (!date) return { display: String(dateStr), relative: '', exact: String(dateStr), isWithinOneHour: false };

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  const exact = formatEditorialDate(date);

  if (diffSec < 3600) {
    let relative = 'Just now';
    if (diffSec >= 60) {
      const mins = Math.floor(diffSec / 60);
      relative = mins === 1 ? '1 min ago' : `${mins} mins ago`;
    }
    return {
      display: relative,
      relative,
      exact,
      isWithinOneHour: true
    };
  }

  return {
    display: exact,
    relative: formatRelativeTime(date),
    exact,
    isWithinOneHour: false
  };
};

export const formatPublishTime = (dateStr) => {
  return getPublishTimeDetails(dateStr).display;
};

// ========================================================================
// Reader History Tracking ("How many min ago we read the article")
// ========================================================================
const READ_STORAGE_KEY = 'bc_read_history';

export const recordArticleRead = (identifier) => {
  if (!identifier) return;
  try {
    const existing = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || '{}');
    existing[identifier] = Date.now();
    // Maintain max 150 items
    const keys = Object.keys(existing);
    if (keys.length > 150) {
      const oldest = keys.sort((a, b) => existing[a] - existing[b])[0];
      delete existing[oldest];
    }
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // LocalStorage quota or access denied
  }
};

export const getArticleReadTime = (identifier) => {
  if (!identifier) return null;
  try {
    const existing = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) || '{}');
    return existing[identifier] || null;
  } catch {
    return null;
  }
};

export const formatReadTimeAgo = (timestamp) => {
  if (!timestamp) return null;
  try {
    const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    if (isNaN(time)) return null;
    const diffSec = Math.floor((Date.now() - time) / 1000);

    if (diffSec < 60) return 'Just now';
    const mins = Math.floor(diffSec / 60);
    if (mins === 1) return '1 min ago';
    if (mins < 60) return `${mins} mins ago`;

    const hours = Math.floor(diffSec / 3600);
    if (hours === 1) return '1 hr ago';
    if (hours < 24) return `${hours} hrs ago`;

    const days = Math.floor(diffSec / 86400);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } catch {
    return null;
  }
};

export const apiService = {
  // Check backend service health
  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const rootUrl = RAW_API_BASE.replace(/\/api(\/v1)?\/?$/, '');
      const res = await fetch(`${rootUrl}/api/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
      return { status: 'offline', note: 'Backend returned non-200 status' };
    } catch {
      return { status: 'offline', note: 'Backend server unreachable' };
    }
  },

  // List published articles with rich filtering, search, and pagination
  async getArticles({
    category = null,
    tag = null,
    language = null,
    isBreaking = null,
    isFeatured = null,
    hasVideo = null,
    search = null,
    sort = 'latest',
    page = 1,
    limit = 12
  } = {}) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (tag) params.append('tag', tag);
      if (language) params.append('language', language);
      if (isBreaking !== null) params.append('isBreaking', isBreaking);
      if (isFeatured !== null) params.append('isFeatured', isFeatured);
      if (hasVideo !== null) params.append('hasVideo', hasVideo);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      if (page) params.append('page', page);
      if (limit) params.append('limit', limit);

      const res = await fetch(`${API_BASE}/articles?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return {
            data: json.data || [],
            pagination: json.pagination || { page: 1, limit, total: json.data?.length || 0, totalPages: 1 },
            source: 'LIVE'
          };
        }
      }
    } catch (err) {
      console.warn('[API Warning] Articles fetch failed:', err.message);
    }

    return {
      data: [],
      pagination: { page: 1, limit, total: 0, totalPages: 1 },
      source: 'LIVE'
    };
  },

  // Get single article by unique slug
  async getArticleBySlug(slug) {
    try {
      const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return { data: json.data, source: 'LIVE' };
        }
      }
      if (res.status === 404 || res.status === 410) {
        return { data: null, error: res.status === 410 ? 'EXPIRED' : 'NOT_FOUND', status: res.status };
      }
    } catch (err) {
      console.warn(`[API Warning] getArticleBySlug("${slug}") failed:`, err.message);
    }

    return { data: null, error: 'NOT_FOUND', status: 404 };
  },

  // Get related articles for article detail page
  async getRelatedArticles(slug, limit = 4) {
    try {
      const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}/related?limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn(`[API Warning] getRelatedArticles("${slug}") failed:`, err.message);
    }

    return { data: [], source: 'LIVE' };
  },

  // Get active categories
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories?activeOnly=true`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getCategories failed:', err.message);
    }

    return { data: CATEGORIES, source: 'LIVE' };
  },

  // Get single category by slug
  async getCategoryBySlug(slug) {
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn(`[API Warning] getCategoryBySlug("${slug}") failed:`, err.message);
    }

    const found = CATEGORIES.find(c => c.slug === slug);
    return { data: found || null };
  },

  // Get live breaking news items (only currently eligible published articles)
  async getBreakingNews() {
    try {
      const res = await fetch(`${API_BASE}/articles?isBreaking=true&limit=10`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return {
            data: json.data.map(item => ({
              id: item.id,
              headline: item.title,
              slug: item.slug,
              time: formatRelativeTime(item.publication_time),
              kicker: item.kicker || 'BREAKING'
            })),
            source: 'LIVE'
          };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getBreakingNews failed:', err.message);
    }

    return { data: [], source: 'LIVE' };
  },

  // Get video news articles (articles with youtube_url)
  async getVideoNews(options = {}) {
    const limit = typeof options === 'number' ? options : (options?.limit || 12);
    try {
      const res = await fetch(`${API_BASE}/articles?hasVideo=true&limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getVideoNews failed:', err.message);
    }

    return {
      data: [],
      source: 'LIVE'
    };
  },

  // Get trending & most-read news based on view telemetry
  async getTrendingArticles(options = {}) {
    const limit = typeof options === 'number' ? options : (options?.limit || 8);
    try {
      const res = await fetch(`${API_BASE}/articles?sort=views&limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getTrendingArticles failed:', err.message);
    }

    return { data: [], source: 'LIVE' };
  },

  // Get editorial featured stories
  async getFeaturedArticles(options = {}) {
    const limit = typeof options === 'number' ? options : (options?.limit || 6);
    try {
      const res = await fetch(`${API_BASE}/articles?isFeatured=true&limit=${limit}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getFeaturedArticles failed:', err.message);
    }

    return { data: [], source: 'LIVE' };
  },

  // Get active advertisement for placement slot (supports all 7 standard slots)
  async getActiveAd(placementCode) {
    const codeMap = {
      headerLeaderboard: 'header_leaderboard',
      heroAdjacent: 'homepage_hero_adjacent',
      midBillboard: 'homepage_mid_billboard',
      inline: 'article_inline',
      sidebarRectangle: 'article_sidebar_top',
      categoryBanner: 'category_page_banner',
      footerBanner: 'footer_banner',
      mobileAnchor: 'mobile_anchor_banner'
    };
    const targetCode = codeMap[placementCode] || placementCode;

    try {
      const res = await fetch(`${API_BASE}/ads/active/${targetCode}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            id: json.data.id,
            title: json.data.title,
            sponsor: json.data.client_name,
            adType: json.data.ad_type || 'image',
            imageUrl: getMediaUrl(json.data.banner_image_url),
            adCode: json.data.ad_code,
            targetUrl: json.data.target_url,
            placementCode: json.data.placement_code,
            dimensions: json.data.dimensions,
            source: 'LIVE'
          };
        }
      }
    } catch (err) {
      console.warn(`[API Warning] getActiveAd("${targetCode}") failed:`, err.message);
    }

    // When no active commercial advertisement is found, return null instead of fallback partnership promo
    return null;
  },

  // Record advertisement impression telemetry
  async recordAdImpression(adId, placementCode = '', pagePath = '') {
    if (!adId) return;
    try {
      await fetch(`${API_BASE}/ads/${adId}/impression`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placementCode, pagePath: pagePath || window.location.pathname })
      });
    } catch {
      // Silently ignored
    }
  },

  // Record advertisement click telemetry
  async recordAdClick(adId, placementCode = '', pagePath = '') {
    if (!adId) return;
    try {
      await fetch(`${API_BASE}/ads/${adId}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placementCode, pagePath: pagePath || window.location.pathname })
      });
    } catch {
      // Silently ignored
    }
  },

  // Submit direct advertiser commercial enquiry
  async submitAdvertiserEnquiry(payload) {
    try {
      const res = await fetch(`${API_BASE}/advertiser-enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || json.message || 'Submission failed');
      }
      return json;
    } catch (err) {
      throw err;
    }
  },

  // List approved YouTube video broadcasts
  async getYoutubeVideos({ page = 1, limit = 12, search = '', isFeatured = null } = {}) {
    try {
      const params = new URLSearchParams();
      if (page) params.set('page', page);
      if (limit) params.set('limit', limit);
      if (search) params.set('search', search);
      if (isFeatured !== null) params.set('isFeatured', isFeatured);

      const res = await fetch(`${API_BASE}/videos?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return { data: json.data, pagination: json.pagination, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getYoutubeVideos failed:', err.message);
    }

    return {
      data: [],
      source: 'LIVE'
    };
  },

  // Get featured YouTube video for Homepage spotlight
  async getFeaturedVideo() {
    try {
      const res = await fetch(`${API_BASE}/videos/featured`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getFeaturedVideo failed:', err.message);
    }

    return {
      data: null,
      source: 'LIVE'
    };
  },

  // Record first-party page view telemetry (debounced, privacy-conscious)
  async trackPageView({ pagePath, pageType = 'article', articleId = null, referrer = '', deviceType = 'desktop', sessionId = '' } = {}) {
    try {
      await fetch(`${API_BASE}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pagePath: pagePath || window.location.pathname,
          pageType,
          articleId,
          referrer: referrer || document.referrer || '',
          deviceType,
          sessionId
        })
      });
    } catch {
      // Telemetry error silently ignored
    }
  },

  // Public visitor counter: Get current count
  async getVisitorCount() {
    try {
      const res = await fetch(`${API_BASE}/analytics/visitor-count`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && typeof json.count === 'number') {
          return json.count;
        }
      }
    } catch {
      // Fallback handled locally
    }
    return null;
  },

  // Public visitor counter: Increment count (increases after baseline 5000)
  async incrementVisitorCount(currentCount = 0) {
    try {
      const res = await fetch(`${API_BASE}/analytics/visitor-count/increment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentCount })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && typeof json.count === 'number') {
          return json.count;
        }
      }
    } catch {
      // Fallback handled locally
    }
    return null;
  },

  // Get safe public integration settings (GA4, AdSense, YouTube channel)
  async getPublicSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings/public`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getPublicSettings failed:', err.message);
    }

    return {
      data: {
        site_name: 'JANTA JOURNAL',
        site_tagline: 'Independent National Daily of Record',
        site_motto: 'Veritas et Libertas • Est. 1928',
        youtube_channel_url: 'https://www.youtube.com/@JantaJournal',
        youtube_channel_name: 'JANTA JOURNAL Digital Newsroom',
        featured_youtube_video_id: '',
        media_kit_url: '/downloads/Janta_Journal_Media_Kit_2026.pdf',
        advertiser_desk_email: 'advertising@jantajournal.com',
        advertiser_desk_phone: '+91 (11) 4890-2800',
        privacy_compliance_mode: 'dpdp_act_india',
        cookie_consent_required: '1'
      },
      source: 'LIVE'
    };
  },

  // Get public site settings (masthead, tagline, editorial contact)
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE}/settings`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getSettings failed:', err.message);
    }

    return {
      data: {
        site_name: 'JANTA JOURNAL',
        site_tagline: 'Independent National Daily of Record',
        site_motto: 'Veritas et Libertas • Est. 1928',
        editorial_email: 'editorial@jantajournal.com',
        press_council_registration: 'REG-BC-2026-DEL-0941'
      },
      source: 'LIVE'
    };
  },

  // Get active tags list
  async getTags() {
    try {
      const res = await fetch(`${API_BASE}/tags`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return { data: json.data, source: 'LIVE' };
        }
      }
    } catch (err) {
      console.warn('[API Warning] getTags failed:', err.message);
    }

    return { data: [], source: 'LIVE' };
  },

  // Financial and weather indicators
  getMarketData() {
    return MARKET_DATA;
  },

  getWeatherData() {
    return WEATHER_DATA;
  }
};

export { adminApi } from './adminApi';
export default apiService;
