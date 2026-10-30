import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ExternalLink, Megaphone } from 'lucide-react';
import apiService from '../../services/api';

/**
 * AdMarquee - Single-line Scrolling Commercial Marquee Banner
 * 
 * Strict Visibility Rules:
 * 1. Only visible if admin/editor turned the setting ON in site settings:
 *    - 'ad_marquee_top_enabled' for position="top"
 *    - 'ad_marquee_breaking_enabled' for position="breaking"
 * 2. Even if turned ON, if no active ads are published for this marquee slot,
 *    it remains completely HIDDEN (returns null).
 * 3. Pausable on hover so readers can easily click the sponsor destination.
 */
export default function AdMarquee({ position = 'top', className = '' }) {
  const navigate = useNavigate();
  const [ads, setAds] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const recordedImpressionsRef = useRef(new Set());

  const settingKey = position === 'breaking' ? 'ad_marquee_breaking_enabled' : 'ad_marquee_top_enabled';

  useEffect(() => {
    let isMounted = true;

    async function loadMarqueeData() {
      try {
        const [settingsRes, adsRes] = await Promise.all([
          apiService.getPublicSettings(),
          apiService.getMarqueeAds(position)
        ]);

        if (!isMounted) return;

        // Check if master switch is turned on
        const settingVal = settingsRes?.data ? settingsRes.data[settingKey] : settingsRes?.[settingKey];
        const activeSwitch = settingVal === '1' || settingVal === 1 || settingVal === true || settingVal === 'true';
        setIsEnabled(Boolean(activeSwitch));

        if (Array.isArray(adsRes)) {
          setAds(adsRes);

          // Record impressions once per session for active ads
          adsRes.forEach((ad) => {
            if (ad?.id && !recordedImpressionsRef.current.has(ad.id)) {
              recordedImpressionsRef.current.add(ad.id);
              apiService.recordAdImpression(ad.id, ad.placementCode || `marquee_${position}`, window.location.pathname);
            }
          });
        }
      } catch (err) {
        console.warn(`[AdMarquee:${position}] Load warning:`, err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMarqueeData();

    // Re-check every 60 seconds
    const interval = setInterval(loadMarqueeData, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [position, settingKey]);

  // Visibility Check:
  // 1. If turned OFF by admin/editor -> NOT visible
  // 2. If turned ON but NO ads are published -> NOT visible
  if (!isEnabled || !ads || ads.length === 0) {
    return null;
  }

  const handleItemClick = (e, ad) => {
    e.preventDefault();
    e.stopPropagation();

    if (ad?.id) {
      apiService.recordAdClick(ad.id, ad.placementCode || `marquee_${position}`, window.location.pathname);
      navigate(`/advertisements?id=${ad.id}`);
    } else {
      navigate('/advertisements');
    }
  };

  // Duplicate items for continuous seamless loop if needed
  let displayList = [...ads];
  while (displayList.length < 6) {
    displayList = [...displayList, ...ads];
  }

  const isTop = position === 'top';

  return (
    <aside
      className={`ad-marquee-bar ${isTop ? 'ad-marquee-top' : 'ad-marquee-breaking'} ${className}`}
      aria-label={`${isTop ? 'Top' : 'Breaking'} Sponsored Announcements`}
      style={{
        width: '100%',
        backgroundColor: isTop ? '#090e1a' : '#0c1322',
        borderTop: isTop ? '1px solid #1e293b' : '1px solid #1e293b',
        borderBottom: isTop ? '1px solid #1e293b' : '2px solid #0f172a',
        height: '34px',
        minHeight: '34px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 20
      }}
    >
      <div
        className="container-editorial"
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          paddingLeft: '0.75rem',
          paddingRight: '0.75rem'
        }}
      >
        {/* Left Badge: Sponsored Tag */}
        <div
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: isTop ? '#1e3a8a' : '#854d0e',
            color: isTop ? '#dbeafe' : '#fef08a',
            fontSize: '0.64rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '0.18rem 0.5rem',
            borderRadius: '2px',
            marginRight: '0.75rem',
            boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
        >
          <Sparkles size={11} style={{ flexShrink: 0 }} />
          <span>{isTop ? 'SPONSORED' : 'PARTNER'}</span>
        </div>

        {/* Scrolling Marquee Container */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
            whiteSpace: 'nowrap',
            maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)'
          }}
        >
          <div
            className="ad-marquee-track"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              animation: 'ad-marquee-scroll 32s linear infinite'
            }}
          >
            {displayList.map((ad, idx) => (
              <span
                key={`${ad.id}-${idx}`}
                onClick={(e) => handleItemClick(e, ad)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleItemClick(e, ad);
                }}
                title={ad.targetUrl ? `Click to visit ${ad.sponsor || ad.title}` : ad.title}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.78rem',
                  color: '#e2e8f0',
                  marginRight: '2rem',
                  cursor: ad.targetUrl ? 'pointer' : 'default',
                  textDecoration: 'none',
                  transition: 'color 150ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = isTop ? '#60a5fa' : '#fbbf24';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#e2e8f0';
                }}
              >

                {/* Sponsor Label */}
                <strong
                  style={{
                    color: isTop ? '#93c5fd' : '#fde047',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  [{ad.sponsor || 'Official Sponsor'}]:
                </strong>

                {/* Headline Text */}
                <span style={{ fontWeight: 500, letterSpacing: '0.01em' }}>
                  {ad.title}
                </span>

                {/* Link Icon */}
                {ad.targetUrl && (
                  <ExternalLink size={11} style={{ opacity: 0.7, flexShrink: 0, marginLeft: '0.15rem' }} />
                )}

                {/* Bullet separator */}
                <span style={{ color: '#475569', marginLeft: '1.25rem', fontWeight: 700 }}>&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

