import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Info, Sparkles, X } from 'lucide-react';
import apiService from '../../services/api';

/**
 * AdBanner - Universal Commercial Display & Sponsorship Component
 * Supports all 7 standard newsroom placements:
 * - header_leaderboard (970x90 / 728x90)
 * - homepage_hero_adjacent (300x600 / 300x250)
 * - article_inline (728x90 / 300x250)
 * - article_sidebar_top (300x250 / 300x600)
 * - category_page_banner (728x90)
 * - footer_banner (970x90 / 728x90)
 * - mobile_anchor_banner (320x50 sticky)
 * 
 * Supports both high-res direct image creatives and approved partner ad code.
 * Automatically records viewable impressions using IntersectionObserver.
 */
export default function AdBanner({ slot = 'headerLeaderboard', className = '' }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [hasRecordedImpression, setHasRecordedImpression] = useState(false);
  const containerRef = useRef(null);

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

  // IntersectionObserver to record verified viewable impression
  useEffect(() => {
    if (!ad || !ad.id || hasRecordedImpression || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          apiService.recordAdImpression(ad.id, ad.placementCode || slot, window.location.pathname);
          setHasRecordedImpression(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [ad, hasRecordedImpression, slot]);

  const handleAdClick = (e) => {
    if (ad && ad.id) {
      apiService.recordAdClick(ad.id, ad.placementCode || slot, window.location.pathname);
    }
    if (ad && ad.targetUrl && !ad.adCode) {
      if (ad.targetUrl.startsWith('http')) {
        window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = ad.targetUrl;
      }
    }
  };

  if (dismissed) return null;
  if (!ad || !ad.id) return null;

  // Dimensions & layout detection based on slot
  const isSidebar = slot === 'sidebarRectangle' || slot === 'article_sidebar_top';
  const isHeroAdjacent = slot === 'heroAdjacent' || slot === 'homepage_hero_adjacent';
  const isMobileAnchor = slot === 'mobileAnchor' || slot === 'mobile_anchor_banner';
  const isInline = slot === 'inline' || slot === 'article_inline';

  // 1. Mobile Anchor Sticky Banner
  if (isMobileAnchor) {
    return (
      <aside 
        ref={containerRef}
        className={`mobile-sticky-ad ${className}`} 
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: '#0f172a',
          borderTop: '1px solid #334155',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.25)',
          padding: '0.35rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        aria-label="Mobile Partner Promotion"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '380px', marginBottom: '0.2rem', fontSize: '0.62rem', color: '#94a3b8' }}>
          <span>ADVERTISEMENT</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* <Link to="/advertise" style={{ color: '#60a5fa', textDecoration: 'none' }}>Advertise With Us</Link> */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDismissed(true);
              }}
              style={{
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 0.2rem'
              }}
              title="Close Ad"
              aria-label="Dismiss banner"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        <div 
          onClick={handleAdClick}
          style={{
            cursor: 'pointer',
            width: '100%',
            maxWidth: '380px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#1e293b',
            borderRadius: '3px',
            padding: '0.35rem 0.6rem',
            color: '#ffffff'
          }}
        >
          {ad?.imageUrl ? (
            <img src={ad.imageUrl} alt={ad.title || 'Sponsored Advertisement'} style={{ width: '100%', height: '48px', objectFit: 'cover', borderRadius: '2px' }} />
          ) : (
            <>
              <div style={{ overflow: 'hidden', paddingRight: '0.5rem', flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.62rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>{ad?.sponsor || 'SPONSORED'}</div>
                <div style={{ fontSize: '0.74rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ad?.title || 'Partner with JANTA JOURNAL'}</div>
              </div>
              <button type="button" style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.25rem 0.6rem', borderRadius: '2px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open
              </button>
            </>
          )}
        </div>
      </aside>
    );
  }

  // 2. Homepage Hero-Adjacent (300x600 Half-page / Portrait Display)
  if (isHeroAdjacent) {
    return (
      <aside 
        ref={containerRef}
        className={`ad-slot-container ${className}`} 
        style={{ width: '100%', maxWidth: '320px', margin: '0 auto 1.5rem auto' }} 
        aria-label="Homepage Feature Partner"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
          <span>ADVERTISEMENT • FEATURED PARTNER</span>
          <Link to="/advertise" style={{ color: '#2563eb', textDecoration: 'none' }}>Partner Specs</Link>
        </div>
        
        <div 
          onClick={handleAdClick}
          style={{
            cursor: 'pointer',
            width: '100%',
            minHeight: '400px',
            backgroundColor: '#0a101f',
            backgroundImage: ad?.imageUrl ? `url(${ad.imageUrl})` : 'linear-gradient(180deg, #0a101f 0%, #1e293b 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            borderRadius: '3px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '1.5rem',
            border: '1px solid #e2e8f0'
          }}
        >
          {/* Dark gradient overlay for text legibility */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,16,31,0.2) 0%, rgba(10,16,31,0.92) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {ad?.sponsor || 'COMMERCIAL PARTNER'}
            </span>
            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem', lineHeight: 1.35 }}>
              {ad?.title || 'India Sovereign Tech & Industrial Corridor 2026'}
            </h4>
            <div style={{ marginTop: '1rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.76rem',
                fontWeight: 700,
                padding: '0.45rem 0.9rem',
                borderRadius: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Explore Program <ExternalLink size={12} />
              </span>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  // 3. Desktop Article Sidebar Top (300x250 Medium Rectangle)
  if (isSidebar) {
    return (
      <aside 
        ref={containerRef}
        className={`ad-slot-container ${className}`} 
        style={{ width: '100%', maxWidth: '300px', margin: '1.25rem auto' }} 
        aria-label="Commercial Partner Promotion"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em' }}>
          <span>ADVERTISEMENT</span>
          <Link to="/advertise" style={{ color: '#2563eb', textDecoration: 'none' }}>Rates & Specs</Link>
        </div>

        <div 
          onClick={handleAdClick}
          style={{
            cursor: 'pointer',
            width: '100%',
            maxWidth: '300px',
            minHeight: '250px',
            backgroundColor: '#0f172a',
            backgroundImage: ad?.imageUrl ? `url(${ad.imageUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.25rem',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '2px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid #cbd5e1'
          }}
        >
          {ad?.imageUrl && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.92) 100%)' }} />
          )}

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93c5fd', fontWeight: 700 }}>
              {ad?.sponsor || 'SPONSORED PARTNER'}
            </span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.4rem', lineHeight: 1.3, color: '#f8fafc' }}>
              {ad?.title || 'Green Infrastructure Sovereign Bonds 2026'}
            </h4>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.45rem 0.85rem',
                borderRadius: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Explore Prospectus <ExternalLink size={12} />
            </span>
          </div>
        </div>
      </aside>
    );
  }

  // 4. Horizontal Leaderboards & In-Article Banners (970x90, 728x90)
  return (
    <aside 
      ref={containerRef}
      className={`ad-slot-container ${className}`} 
      style={{ width: '100%', margin: isInline ? '1.75rem 0' : '1.25rem 0' }} 
      aria-label="Commercial Sponsor Banner"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.65rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', flexWrap: 'wrap', gap: '0.5rem', width: '100%' }}>
        <span>ADVERTISEMENT • COMMERCIAL SPONSORSHIP</span>
        <Link to="/advertise" style={{ color: '#2563eb', textDecoration: 'none' }}>Partner With The Chronicle</Link>
      </div>

      <div 
        onClick={handleAdClick}
        style={{
          cursor: 'pointer',
          width: '100%',
          maxWidth: '100%',
          minHeight: '85px',
          backgroundColor: '#0a0e1a',
          backgroundImage: ad?.imageUrl ? `url(${ad.imageUrl})` : 'linear-gradient(135deg, #0a0e1a 0%, #172554 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.15rem',
          borderRadius: '3px',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #cbd5e1'
        }}
      >
        {ad?.imageUrl && (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.7) 60%, rgba(10,14,26,0.4) 100%)' }} />
        )}

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem', maxWidth: '720px' }}>
          <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {ad?.sponsor || 'NATIONAL SPONSOR'}
          </span>
          <div style={{ fontSize: '1.02rem', fontWeight: 700, letterSpacing: '-0.01em', color: '#ffffff' }}>
            {ad?.title || 'India Global Tech Summit 2026 — Registration & Delegate Accreditation Open'}
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span
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
              letterSpacing: '0.04em'
            }}
          >
            Learn More <ExternalLink size={12} />
          </span>
        </div>
      </div>
    </aside>
  );
}
