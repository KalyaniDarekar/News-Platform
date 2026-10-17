import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';

export default function BreakingTicker() {
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBreaking() {
      const res = await apiService.getBreakingNews();
      if (isMounted) {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data);
        }
        setLoading(false);
      }
    }
    loadBreaking();

    // Auto-refresh breaking alerts every 60 seconds
    const pollInterval = setInterval(loadBreaking, 60000);
    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, items.length]);

  if (loading && items.length === 0) {
    return null;
  }

  if (items.length === 0) {
    return null; // Don't show ticker if no eligible breaking stories
  }

  const currentItem = items[currentIndex] || items[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <aside className="ticker-bar" aria-label="Breaking News Alert" role="region">
      <div className="container-editorial" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.5rem' }}>
        
        {/* Red Breaking Badge */}
        <div className="ticker-badge" style={{ flexShrink: 0 }}>
          <span className="pulse-dot"></span>
          <span>BREAKING</span>
        </div>

        {/* Current News Item Display with Guaranteed Truncation */}
        <div 
          style={{
            flex: 1,
            minWidth: 0,
            padding: '0.45rem 0.5rem',
            overflow: 'hidden'
          }}
          aria-live="polite"
        >
          <Link 
            to={`/article/${currentItem.slug}`} 
            style={{ 
              color: '#ffffff', 
              fontSize: '0.84rem', 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fca5a5'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
          >
            <span style={{ 
              color: '#f87171', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.72rem', 
              fontWeight: 700,
              flexShrink: 0 
            }}>
              [{currentItem.time || 'LIVE'}]
            </span>
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              minWidth: 0
            }}>
              {currentItem.headline}
            </span>
          </Link>
        </div>

        {/* Item count indicator */}
        {items.length > 1 && (
          <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
            {currentIndex + 1}/{items.length}
          </span>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', flexShrink: 0 }}>
          <button
            type="button"
            className="hidden-mobile"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ color: '#9ca3af', padding: '0.3rem', display: 'inline-flex' }}
            title={isPlaying ? 'Pause Auto-cycle' : 'Resume Auto-cycle'}
            aria-label="Toggle ticker playback"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            style={{ color: '#9ca3af', padding: '0.3rem', display: 'inline-flex' }}
            title="Previous Alert"
            aria-label="Previous alert"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={handleNext}
            style={{ color: '#9ca3af', padding: '0.3rem', display: 'inline-flex' }}
            title="Next Alert"
            aria-label="Next alert"
          >
            <ChevronRight size={16} />
          </button>
        </div>

      </div>
    </aside>
  );
}
