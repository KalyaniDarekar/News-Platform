import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import apiService from '../../services/api';

export default function AdBanner({ slot = 'headerLeaderboard', className = '' }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchAd() {
      setLoading(true);
      const res = await apiService.getActiveAd(slot);
      if (isMounted && res) {
        setAd(res);
      }
      if (isMounted) setLoading(false);
    }
    fetchAd();
    return () => { isMounted = false; };
  }, [slot]);

  const handleAdClick = (e) => {
    if (ad && ad.id) {
      apiService.recordAdClick(ad.id);
    }
    if (ad && ad.targetUrl) {
      // Allow default link navigation or window.open safely
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isSidebar = slot === 'sidebarRectangle';

  if (isSidebar) {
    return (
      <aside className={`ad-slot-container ${className}`} style={{ width: '100%', maxWidth: '300px', margin: '1.25rem auto' }} aria-label="Commercial Partner Promotion">
        <span className="ad-disclaimer">ADVERTISEMENT • COMMERCIAL PARTNER</span>
        <div style={{
          width: '100%',
          maxWidth: '300px',
          minHeight: '250px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '2px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Subtle background graphic */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(15,23,42,0) 70%)' }}></div>

          <div>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 700 }}>
              {ad?.sponsor || 'SPONSORED PARTNER'}
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.4rem', lineHeight: 1.3, color: '#f8fafc' }}>
              {ad?.title || 'Green Infrastructure Sovereign Bonds 2026'}
            </h4>
          </div>

          <button
            type="button"
            onClick={handleAdClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.55rem 0.85rem',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            Explore Prospectus <ExternalLink size={12} />
          </button>
        </div>
      </aside>
    );
  }

  // Horizontal Leaderboard / Billboard
  return (
    <aside className={`ad-slot-container ${className}`} style={{ width: '100%', margin: '1.25rem 0' }} aria-label="Commercial Sponsor Banner">
      <span className="ad-disclaimer">ADVERTISEMENT • COMMERCIAL SPONSORSHIP</span>
      <div style={{
        width: '100%',
        maxWidth: '100%',
        minHeight: '86px',
        backgroundColor: '#0a0e1a',
        backgroundImage: 'linear-gradient(135deg, #0a0e1a 0%, #172554 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 1.5rem',
        borderRadius: '2px',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '720px' }}>
          <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {ad?.sponsor || 'NATIONAL SPONSOR'}
          </span>
          <div style={{ fontSize: '1.02rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff' }}>
            {ad?.title || 'India Global Tech Summit 2026 — Registration & Delegate Accreditation Open'}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdClick}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '0.76rem',
            fontWeight: 800,
            padding: '0.5rem 1.1rem',
            borderRadius: '2px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
        >
          View Program <ExternalLink size={12} />
        </button>
      </div>
    </aside>
  );
}
