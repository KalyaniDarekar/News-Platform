import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play, Volume2 } from 'lucide-react';
import { BREAKING_NEWS } from '../../data/mockNewsData';

export default function BreakingTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying || BREAKING_NEWS.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentItem = BREAKING_NEWS[currentIndex] || BREAKING_NEWS[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? BREAKING_NEWS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % BREAKING_NEWS.length);
  };

  return (
    <aside className="ticker-bar" aria-label="Breaking News Alert">
      <div className="container-editorial" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        
        {/* Red Breaking Badge */}
        <div className="ticker-badge">
          <span className="pulse-dot"></span>
          <span>BREAKING</span>
        </div>

        {/* Current News Item Display */}
        <div style={{ flex: 1, padding: '0.45rem 1rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <Link 
            to={`/article/${currentItem.slug}`} 
            style={{ 
              color: '#ffffff', 
              fontSize: '0.84rem', 
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              transition: 'color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.target.style.color = '#fca5a5'}
            onMouseLeave={(e) => e.target.style.color = '#ffffff'}
          >
            <span style={{ 
              color: '#f87171', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem', 
              fontWeight: 700 
            }}>
              [{currentItem.time}]
            </span>
            <span>{currentItem.headline}</span>
          </Link>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', paddingRight: '0.5rem' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ color: '#9ca3af', padding: '0.2rem', display: 'inline-flex' }}
            title={isPlaying ? 'Pause Auto-cycle' : 'Resume Auto-cycle'}
            aria-label="Toggle ticker playback"
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>

          <button
            onClick={handlePrev}
            style={{ color: '#9ca3af', padding: '0.2rem', display: 'inline-flex' }}
            title="Previous Alert"
            aria-label="Previous alert"
          >
            <ChevronLeft size={15} />
          </button>

          <button
            onClick={handleNext}
            style={{ color: '#9ca3af', padding: '0.2rem', display: 'inline-flex' }}
            title="Next Alert"
            aria-label="Next alert"
          >
            <ChevronRight size={15} />
          </button>
        </div>

      </div>
    </aside>
  );
}
