// API Service Layer for The Bharat Chronicle
// Designed for seamless transition from Phase 1 demonstration data to Phase 2 MySQL/Express backend.

import { 
  ALL_STORIES, 
  CATEGORIES, 
  BREAKING_NEWS, 
  MARKET_DATA, 
  WEATHER_DATA,
  AD_BANNERS,
  IS_DEMO_DATA 
} from '../data/mockNewsData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiService = {
  // Check if live backend server is reachable
  async checkBackendHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
      return { status: 'offline', note: 'Backend returned non-200 status' };
    } catch {
      return { 
        status: 'demo_mode', 
        note: 'Backend not running or unreachable. Using Phase 1 demonstration dataset.' 
      };
    }
  },

  // Fetch articles with optional category filter
  async getArticles({ category = null, limit = 20 } = {}) {
    try {
      const url = category ? `${API_BASE}/articles?category=${category}&limit=${limit}` : `${API_BASE}/articles?limit=${limit}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          return { data: json.data, source: 'MYSQL_LIVE' };
        }
      }
    } catch {
      // Graceful fallback to demonstration data
    }

    let filtered = [...ALL_STORIES];
    if (category) {
      filtered = filtered.filter(item => 
        (item.categorySlug && item.categorySlug.toLowerCase() === category.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(category.toLowerCase()))
      );
    }

    return {
      data: filtered.slice(0, limit),
      source: 'DEMONSTRATION_MODE',
      isDemo: IS_DEMO_DATA
    };
  },

  // Get article by unique slug
  async getArticleBySlug(slug) {
    try {
      const res = await fetch(`${API_BASE}/articles/${slug}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) return { data: json.data, source: 'MYSQL_LIVE' };
      }
    } catch {
      // Fallback
    }

    const found = ALL_STORIES.find(item => item.slug === slug);
    return {
      data: found || ALL_STORIES[0], // fallback to first article if specific slug not found in demo
      source: 'DEMONSTRATION_MODE',
      isDemo: IS_DEMO_DATA
    };
  },

  // Get categories
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data.length > 0) return { data: json.data, source: 'MYSQL_LIVE' };
      }
    } catch {
      // Fallback
    }

    return { data: CATEGORIES, source: 'DEMONSTRATION_MODE' };
  },

  // Get breaking news ticker items
  async getBreakingNews() {
    return { data: BREAKING_NEWS, source: 'DEMONSTRATION_MODE' };
  },

  // Get market indicators
  getMarketData() {
    return MARKET_DATA;
  },

  // Get weather indicators
  getWeatherData() {
    return WEATHER_DATA;
  },

  // Get advertising inventory slots
  getAds() {
    return AD_BANNERS;
  }
};

export { adminApi } from './adminApi';
export default apiService;
