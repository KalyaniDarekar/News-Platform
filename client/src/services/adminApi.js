// ========================================================================
// Admin API Service Layer
// Communicates with Express /api/v1 backend with Bearer JWT tokens.
// ========================================================================

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'
);

const RAW_API_BASE = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000/api' : 'https://api.jantajournal.in/api');
const API_BASE = RAW_API_BASE.replace(/\/v1\/?$/, '');
const TOKEN_KEY = 'auth_token';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('bc_auth_token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const url = `${API_BASE}/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('auth_user');
    if (!window.location.pathname.includes('/admin/login')) {
      window.location.href = '/admin/login';
    }
  }

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMsg = data.error?.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.details = data.error?.details;
    throw err;
  }

  return data;
}

export const adminApi = {
  // ---- Dashboard Endpoints ----
  async getDashboardStats() {
    return request('/dashboard/stats');
  },

  async getQuickCounts() {
    return request('/dashboard/counts');
  },

  // ---- Articles CRUD & Lifecycle ----
  async getArticles(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/articles${queryString}`);
  },

  async getArticleById(id) {
    return request(`/articles/id/${id}`);
  },

  async createArticle(payload) {
    return request('/articles', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateArticle(id, payload) {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteArticle(id) {
    return request(`/articles/${id}`, {
      method: 'DELETE'
    });
  },

  async publishArticle(id) {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'published', expiryTime: null })
    });
  },

  async submitForReview(id) {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'in_review' })
    });
  },

  async approveAndPublishArticle(id) {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'published', expiryTime: null })
    });
  },

  async rejectArticleToDraft(id, revisionNotes = 'Returned to draft by editor for revisions') {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'draft', revisionNotes })
    });
  },

  async unpublishArticle(id) {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'draft' })
    });
  },

  async scheduleArticle(id, scheduledPublicationTime, expiryTime = null) {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'scheduled',
        scheduledPublicationTime,
        expiryTime
      })
    });
  },

  async extendExpiry(id, newExpiryTime) {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        expiryTime: newExpiryTime
      })
    });
  },

  async republishExpired(id, newExpiryTime = null) {
    return request(`/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'published',
        expiryTime: newExpiryTime
      })
    });
  },

  // ---- Categories Endpoints ----
  async getCategories() {
    return request('/categories');
  },

  async createCategory(payload) {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateCategory(id, payload) {
    return request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteCategory(id) {
    return request(`/categories/${id}`, {
      method: 'DELETE'
    });
  },

  // ---- Tags Endpoints ----
  async getTags() {
    return request('/tags');
  },

  // ---- Media Endpoints ----
  async uploadMedia(formData) {
    return request('/media/upload', {
      method: 'POST',
      body: formData
    });
  },

  async getMediaAssets(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.mimeType) query.set('mimeType', params.mimeType);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/media${queryString}`);
  },

  async deleteMedia(id) {
    return request(`/media/${id}`, {
      method: 'DELETE'
    });
  },

  // ---- Staff / Auth Endpoints ----
  async login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  async logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('bc_auth_token');
    localStorage.removeItem('auth_user');
  },

  async getMe() {
    return request('/auth/me');
  },

  // ================= COMMERCIAL & REVENUE ENDPOINTS ================= //

  // ---- Commercial Ad Management ----
  async getAdPlacements() {
    return request('/ads/placements');
  },

  async getAdCampaigns(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.placementId) query.set('placementId', params.placementId);
    if (params.isActive !== undefined && params.isActive !== '') query.set('isActive', params.isActive);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/ads/campaigns${queryString}`);
  },

  async createAdCampaign(payload) {
    return request('/ads/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateAdCampaign(id, payload) {
    return request(`/ads/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteAdCampaign(id) {
    return request(`/ads/campaigns/${id}`, {
      method: 'DELETE'
    });
  },

  async toggleAdCampaign(id, isActive) {
    return request(`/ads/campaigns/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive })
    });
  },

  // ---- Direct Advertiser Enquiries (CRM) ----
  async getAdvertiserEnquiries(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/advertiser-enquiries${queryString}`);
  },

  async updateEnquiryStatus(id, payload) {
    return request(`/advertiser-enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  async deleteEnquiry(id) {
    return request(`/advertiser-enquiries/${id}`, {
      method: 'DELETE'
    });
  },

  // ---- YouTube Video Gallery & Attachments ----
  async getYoutubeVideos(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.isFeatured !== undefined) query.set('isFeatured', params.isFeatured);
    if (params.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/videos${queryString}`);
  },

  async createYoutubeVideo(payload) {
    return request('/videos', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateYoutubeVideo(id, payload) {
    return request(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteYoutubeVideo(id) {
    return request(`/videos/${id}`, {
      method: 'DELETE'
    });
  },

  // ---- First-Party Analytics Dashboard ----
  async getAnalyticsOverview(params = {}) {
    const query = new URLSearchParams();
    if (params.timeRange) query.set('timeRange', params.timeRange);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/analytics/overview${queryString}`);
  },

  // ---- Revenue Readiness & Settings ----
  async getSettings() {
    return request('/settings');
  },

  async updateSetting(key, value) {
    return request(`/settings/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  },

  async updateSettingsBatch(payload) {
    return request('/settings/batch', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }
};

export default adminApi;
