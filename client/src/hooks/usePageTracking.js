import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../services/api';
import { getStoredConsent } from '../components/common/ConsentBanner';

function getOrCreateSessionId() {
  try {
    let sid = sessionStorage.getItem('bc_analytics_session_id');
    if (!sid) {
      sid = 'sid_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      sessionStorage.setItem('bc_analytics_session_id', sid);
    }
    return sid;
  } catch {
    return 'sid_ephemeral';
  }
}

function detectDeviceType() {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Custom hook to track page views privacy-consciously across client-side navigation.
 * Adheres to DPDP / GDPR consent state and avoids tracking rerenders.
 */
export function usePageTracking() {
  const location = useLocation();
  const lastTrackedPath = useRef('');

  useEffect(() => {
    const currentPath = location.pathname;

    // Do not re-track identical path without navigation
    if (lastTrackedPath.current === currentPath) {
      return;
    }

    // Do not track admin CMS pages to keep reader telemetry pure
    if (currentPath.startsWith('/admin')) {
      lastTrackedPath.current = currentPath;
      return;
    }

    const consent = getStoredConsent();
    // If user explicitly chose essential_only, do not track telemetry
    if (consent === 'essential_only') {
      lastTrackedPath.current = currentPath;
      return;
    }

    lastTrackedPath.current = currentPath;

    // Determine page type
    let pageType = 'page';
    let articleId = null;

    if (currentPath === '/') {
      pageType = 'homepage';
    } else if (currentPath.startsWith('/category/')) {
      pageType = 'category';
    } else if (currentPath.startsWith('/article/')) {
      pageType = 'article';
    } else if (currentPath.startsWith('/videos')) {
      pageType = 'videos';
    } else if (currentPath.startsWith('/search')) {
      pageType = 'search';
    } else if (currentPath.startsWith('/advertise')) {
      pageType = 'commercial';
    }

    const sessionId = getOrCreateSessionId();
    const deviceType = detectDeviceType();

    // Fire telemetry asynchronously
    apiService.trackPageView({
      pagePath: currentPath,
      pageType,
      articleId,
      referrer: document.referrer || '',
      deviceType,
      sessionId
    }).catch(() => {
      // Ignore telemetry failure
    });

  }, [location.pathname]);
}

export default usePageTracking;
