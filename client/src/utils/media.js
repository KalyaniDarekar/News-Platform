// ========================================================================
// Media URL Resolution & Fallback Utilities
// Resolves local /uploads/ URLs to active backend origin, handles fallbacks
// ========================================================================

export const DEFAULT_NEWS_IMAGE = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
export const DEFAULT_AVATAR_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

/**
 * Returns the base URL of the backend API server (without /api or /v1)
 */
export const getBackendBaseUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api(\/v1)?\/?$/, '').replace(/\/+$/, '');
  }
  // In development, if Vite proxies /uploads, return empty string so relative URLs hit the proxy
  if (import.meta.env.DEV) {
    return '';
  }
  return 'https://news-platform-2goj.onrender.com';
};

/**
 * Resolves any image URL to a full, loadable URL.
 * Handles full external URLs, data URLs, blobs, and relative /uploads/... paths.
 */
export const getMediaUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const backendBase = getBackendBaseUrl();
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  if (!backendBase) {
    return cleanPath;
  }

  return `${backendBase}${cleanPath}`;
};

/**
 * Image onError handler to cleanly replace broken images with a fallback
 */
export const handleImageError = (e, fallback = DEFAULT_NEWS_IMAGE) => {
  if (e?.currentTarget && e.currentTarget.src !== fallback) {
    e.currentTarget.onerror = null; // Prevent infinite error loops
    e.currentTarget.src = fallback;
  }
};

/**
 * Formats HTML body content, ensuring all embedded images and media URLs
 * resolve to the correct backend host, and converts markdown image syntax.
 */
export const formatArticleContent = (content) => {
  if (!content || typeof content !== 'string') return '';

  const backendBase = getBackendBaseUrl();
  let formatted = content;

  // 1. Convert Markdown images ![alt](url) to HTML figures
  formatted = formatted.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
    const fullUrl = getMediaUrl(url);
    const captionHtml = alt ? `<figcaption style="font-size:0.8rem;color:#64748b;font-style:italic;margin-top:0.5rem;text-align:center;">${alt}</figcaption>` : '';
    return `<figure style="margin:2rem 0;text-align:center;"><img src="${fullUrl}" alt="${alt || 'Article visual'}" style="max-width:100%;height:auto;border-radius:4px;" loading="lazy" />${captionHtml}</figure>`;
  });

  // 2. Rewrite any relative /uploads/ src in existing HTML tags
  if (backendBase) {
    formatted = formatted.replace(/src=["'](\/uploads\/[^"']+)["']/gi, (match, p) => {
      return `src="${backendBase}${p}"`;
    });
  }

  return formatted;
};
