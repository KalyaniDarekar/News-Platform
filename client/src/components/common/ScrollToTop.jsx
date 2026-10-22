import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures every navigation transition (including navbar tab switches like Sports, World, Tech, etc.)
 * immediately resets the scroll position to the top of the viewport.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Reset window scroll position
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // Cross-browser safety for HTML / Body scrolling containers
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}
