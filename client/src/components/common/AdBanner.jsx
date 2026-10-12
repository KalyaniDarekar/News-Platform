import React from 'react';
import { ExternalLink } from 'lucide-react';
import { AD_BANNERS } from '../../data/mockNewsData';

export default function AdBanner({ slot = 'headerLeaderboard', className = '' }) {
  const ad = AD_BANNERS[slot] || AD_BANNERS.headerLeaderboard;

  if (slot === 'sidebarRectangle') {
    return (
      <div className={`ad-slot-container ${className}`} style={{ width: '100%', maxWidth: '300px', margin: '1.25rem auto' }}>
        <span className="ad-disclaimer">ADVERTISEMENT • COMMERCIAL PARTNER</span>
        <div style={{
          width: '300px',
          height: '250px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '2px'
        }}>
          {/* Subtle background graphic */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, rgba(15,23,42,0) 70%)' }}></div>
          
          <div>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 700 }}>
              {ad.sponsor}
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.4rem', lineHeight: 1.3, color: '#f8fafc' }}>
              {ad.title}
            </h4>
          </div>

          <a 
            href={ad.url}
            onClick={(e) => { e.preventDefault(); alert('Commercial Partner Link: In production, records ad click impression in MySQL.'); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 700,
              padding: '0.5rem 0.85rem',
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {ad.cta} <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-slot-container ${className}`} style={{ width: '100%' }}>
      <span className="ad-disclaimer">ADVERTISEMENT • COMMERCIAL SPONSORSHIP</span>
      <div style={{
        width: '100%',
        maxWidth: '970px',
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
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {ad.sponsor}
          </span>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff' }}>
            {ad.title}
          </div>
        </div>

        <a 
          href={ad.url}
          onClick={(e) => { e.preventDefault(); alert('Commercial Partner Link: In production, records ad click impression in MySQL.'); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            fontSize: '0.76rem',
            fontWeight: 800,
            padding: '0.45rem 1rem',
            borderRadius: '2px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          {ad.cta} <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
}
