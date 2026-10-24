import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import apiService from '../services/api';

const DEFAULT_BASELINE = 5000;
const STORAGE_KEY = 'jj_site_visitor_count';

function getStoredCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= DEFAULT_BASELINE) {
        return parsed;
      }
    }
  } catch {
    // localStorage restricted or unavailable
  }
  return DEFAULT_BASELINE;
}

export function useVisitorCounter() {
  const [count, setCount] = useState(getStoredCount);
  const [isBumping, setIsBumping] = useState(false);
  const location = useLocation();

  const lastTriggerTimeRef = useRef(0);
  const tabWasHiddenRef = useRef(false);
  const windowWasBlurredRef = useRef(false);
  const previousLocationRef = useRef(location.pathname);
  const initialMountDoneRef = useRef(false);

  // Core increment logic with local persistence & backend synchronization
  const triggerIncrement = useCallback(() => {
    const now = Date.now();
    // Throttle to prevent immediate duplicate execution (e.g. simultaneous focus + visibilitychange)
    if (now - lastTriggerTimeRef.current < 800) {
      return;
    }
    lastTriggerTimeRef.current = now;

    // Calculate next value starting from baseline 5000
    const current = Math.max(DEFAULT_BASELINE, getStoredCount());
    const nextVal = current + 1;

    try {
      localStorage.setItem(STORAGE_KEY, String(nextVal));
    } catch {
      // ignore
    }

    setCount(prev => Math.max(prev, nextVal, DEFAULT_BASELINE));
    setIsBumping(true);
    setTimeout(() => setIsBumping(false), 500);

    // Broadcast update across components & tabs
    window.dispatchEvent(new CustomEvent('jj_visitor_count_updated', { detail: nextVal }));

    // Async sync with backend (safely guarded with client count)
    if (apiService && typeof apiService.incrementVisitorCount === 'function') {
      apiService.incrementVisitorCount(nextVal).then(serverCount => {
        if (typeof serverCount === 'number' && serverCount >= DEFAULT_BASELINE) {
          setCount(prev => {
            const authoritative = Math.max(prev, serverCount, nextVal);
            try {
              localStorage.setItem(STORAGE_KEY, String(authoritative));
            } catch {
              // ignore
            }
            return authoritative;
          });
        }
      }).catch(() => {
        // Keep optimistic local count
      });
    }
  }, []);

  // 1. Initial Visit & Page Refresh trigger
  useEffect(() => {
    if (!initialMountDoneRef.current) {
      initialMountDoneRef.current = true;
      triggerIncrement();
    }
  }, [triggerIncrement]);

  // 2. Browser Tab Switch trigger (switching tab and coming back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        tabWasHiddenRef.current = true;
      } else if (document.visibilityState === 'visible') {
        if (tabWasHiddenRef.current) {
          tabWasHiddenRef.current = false;
          triggerIncrement();
        }
      }
    };

    const handleWindowBlur = () => {
      windowWasBlurredRef.current = true;
    };

    const handleWindowFocus = () => {
      if (windowWasBlurredRef.current) {
        windowWasBlurredRef.current = false;
        triggerIncrement();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [triggerIncrement]);

  // 3. Navigation trigger: Switching internal page/tab and coming back to Home tab
  useEffect(() => {
    const current = location.pathname;
    const prev = previousLocationRef.current;

    if (prev && prev !== '/' && current === '/') {
      // Returned to Home tab from another section
      triggerIncrement();
    }
    previousLocationRef.current = current;
  }, [location.pathname, triggerIncrement]);

  // 4. Synchronization listener across tabs and custom events
  useEffect(() => {
    const handleCustomEvent = (e) => {
      if (e.detail && typeof e.detail === 'number') {
        setCount(prev => Math.max(prev, e.detail));
      }
    };

    const handleStorageEvent = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const val = parseInt(e.newValue, 10);
        if (!isNaN(val) && val >= DEFAULT_BASELINE) {
          setCount(prev => Math.max(prev, val));
        }
      }
    };

    window.addEventListener('jj_visitor_count_updated', handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener('jj_visitor_count_updated', handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  return { count, isBumping, triggerIncrement };
}

export default useVisitorCounter;
