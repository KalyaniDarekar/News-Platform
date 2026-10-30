import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Sparkles, ExternalLink, ArrowRight, ShieldCheck, Calendar,
  Layers, Search, Filter, Megaphone, Eye, CheckCircle2, ChevronRight,
  FileText, ArrowUpRight, X, Building2
} from 'lucide-react';
import apiService, { getMediaUrl } from '../../services/api';

/**
 * AdvertisementsPage - Public Commercial Bulletin & Sponsored Directory
 * 
 * Requirement:
 * - When clicking on any ad across the website, opens this page.
 * - All active ads are visible on this page in concise "short" format.
 * - Clicking on any ad expands/displays the "full ad" in high resolution with complete creative details.
 */
export default function AdvertisementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const adIdParam = searchParams.get('id');

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'marquee' | 'display' | 'story'
  const [searchQuery, setSearchQuery] = useState('');

  const fullAdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchAds() {
      setLoading(true);
      try {
        const directory = await apiService.getPublicAdDirectory();
        if (!isMounted) return;
        setAds(directory);

        // If URL has ?id=..., auto-select that ad
        if (adIdParam && directory.length > 0) {
          const match = directory.find(a => String(a.id) === String(adIdParam));
          if (match) {
            setSelectedAd(match);
          } else {
            setSelectedAd(directory[0]);
          }
        } else if (directory.length > 0) {
          // Default to top priority ad for immediate full creative view
          setSelectedAd(directory[0]);
        }
      } catch (err) {
        console.error('Failed to load ad directory:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAds();
    return () => { isMounted = false; };
  }, [adIdParam]);

  const handleSelectAd = (ad) => {
    setSelectedAd(ad);
    setSearchParams({ id: ad.id });

    // Record verified click telemetry when opened from directory
    if (ad?.id) {
      apiService.recordAdClick(ad.id, ad.placementCode || 'ad_directory', window.location.pathname);
    }

    if (fullAdRef.current) {
      fullAdRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredAds = ads.filter(ad => {
    // Placement / format filter
    if (activeFilter === 'marquee') {
      const isMarquee = (ad.placementCode || '').startsWith('marquee_');
      if (!isMarquee) return false;
    } else if (activeFilter === 'display') {
      const isDisplay = ad.adType === 'image' && !(ad.placementCode || '').startsWith('marquee_');
      if (!isDisplay) return false;
    } else if (activeFilter === 'story') {
      if (!ad.articleId && !(ad.targetUrl || '').startsWith('/article/')) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (ad.title || '').toLowerCase().includes(q);
      const sponsorMatch = (ad.sponsor || ad.clientName || '').toLowerCase().includes(q);
      const placementMatch = (ad.placementName || '').toLowerCase().includes(q);
      if (!titleMatch && !sponsorMatch && !placementMatch) return false;
    }

    return true;
  });

  return (
    <div className="container-editorial" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
        <ChevronRight size={12} />
        <span style={{ color: '#0f172a', fontWeight: 600 }}>Commercial Bulletin & Sponsor Directory</span>
      </nav>

      {/* Hero Header */}
      <header style={{
        backgroundColor: '#090e1a',
        color: '#ffffff',
        borderRadius: '6px',
        padding: '2rem 1.75rem',
        marginBottom: '2rem',
        border: '1px solid #1e293b',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#1e3a8a', color: '#93c5fd', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0.2rem 0.6rem', borderRadius: '2px', marginBottom: '0.75rem' }}>
          <Sparkles size={12} />
          <span>Official Commercial Bulletin</span>
        </div>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#f8fafc', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Commercial Releases & Sponsored Brand Directory
        </h1>

        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.6rem', maxWidth: '750px', lineHeight: 1.55, margin: '0.6rem 0 0 0' }}>
          Explore all active brand sponsorships, verified commercial flights, and enterprise partner reports published across the Janta Journal digital newsroom. Click on any announcement below to inspect its full creative presentation.
        </p>

        {/* Filter & Search Bar */}
        <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid #1e293b' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Flights (${ads.length})` },
              { id: 'marquee', label: 'Marquee Tickers' },
              { id: 'display', label: 'Display Banners' },
              { id: 'story', label: 'Sponsored Stories' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                style={{
                  backgroundColor: activeFilter === f.id ? '#2563eb' : '#1e293b',
                  color: activeFilter === f.id ? '#ffffff' : '#cbd5e1',
                  border: '1px solid',
                  borderColor: activeFilter === f.id ? '#3b82f6' : '#334155',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 120ms ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search sponsor or flight..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '4px',
                padding: '0.45rem 0.75rem 0.45rem 2.2rem',
                color: '#f8fafc',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </header>

      {/* FULL AD VIEW (The prominent expanded showcase card) */}
      {selectedAd && (
        <section
          ref={fullAdRef}
          aria-label="Full Advertisement Showcase"
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #2563eb',
            borderRadius: '6px',
            padding: '1.75rem',
            marginBottom: '2.5rem',
            boxShadow: '0 10px 25px -5px rgba(37,99,235,0.15)',
            position: 'relative'
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '2px'
                }}>
                  <ShieldCheck size={12} />
                  <span>Verified Commercial Flight</span>
                </span>

                <span style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '2px'
                }}>
                  {selectedAd.placementName || selectedAd.placementCode} &bull; {selectedAd.dimensions}
                </span>

                {selectedAd.articleId && (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '2px'
                  }}>
                    PARTNER EDITORIAL STORY
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', marginTop: '0.6rem', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                {selectedAd.title}
              </h2>

              <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
                Presented by <strong style={{ color: '#0f172a' }}>{selectedAd.sponsor || selectedAd.clientName}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAd(null)}
              style={{
                background: 'none',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                padding: '0.35rem 0.7rem',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="Close full view"
            >
              <X size={13} />
              <span>Minimize Full View</span>
            </button>
          </div>

          {/* Full Ad Creative Presentation */}
          <div style={{ marginBottom: '1.5rem' }}>
            {selectedAd.adType === 'image' && selectedAd.imageUrl ? (
              <div style={{
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#0f172a',
                border: '1px solid #e2e8f0',
                maxHeight: '480px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={selectedAd.imageUrl}
                  alt={selectedAd.title}
                  style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'contain', display: 'block' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            ) : selectedAd.adType === 'code' && selectedAd.adCode ? (
              <div
                style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', overflowX: 'auto' }}
                dangerouslySetInnerHTML={{ __html: selectedAd.adCode }}
              />
            ) : (
              // Text or Marquee Ad Creative Box
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderLeft: '4px solid #2563eb',
                borderRadius: '4px',
                padding: '1.5rem'
              }}>
                <div style={{ fontSize: '0.76rem', color: '#2563eb', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  Headline Announcement
                </div>
                <blockquote style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, lineHeight: 1.45, fontStyle: 'normal' }}>
                  "{selectedAd.title}"
                </blockquote>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.75rem' }}>
                  Directly flighted in the <strong>{selectedAd.placementName || selectedAd.placementCode}</strong> single-line ticker stream.
                </div>
              </div>
            )}
          </div>

          {/* Connected Sponsored Story Card (If this is a Brandpost) */}
          {(selectedAd.articleId || (selectedAd.targetUrl && selectedAd.targetUrl.startsWith('/article/'))) && (
            <div style={{
              backgroundColor: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: '4px',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ★ Connected Partner Editorial Dispatch
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#78350f', margin: '0.25rem 0 0.4rem 0' }}>
                {selectedAd.title}
              </h3>
              {selectedAd.articleSummary && (
                <p style={{ fontSize: '0.82rem', color: '#854d0e', margin: '0 0 0.85rem 0', lineHeight: 1.5 }}>
                  {selectedAd.articleSummary}
                </p>
              )}
              <Link
                to={selectedAd.targetUrl || `/article/${selectedAd.articleSlug}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#78350f',
                  color: '#ffffff',
                  padding: '0.5rem 1rem',
                  borderRadius: '3px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                <span>Read Full Sponsored Article</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* Full Ad Metadata & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              <span>Flight Schedule: </span>
              <strong>{selectedAd.startDate || 'Current'} &rarr; {selectedAd.endDate || 'Active'}</strong>
              <span style={{ marginLeft: '0.75rem', color: '#94a3b8' }}>&bull; Audited first-party impression delivery</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedAd.targetUrl && !selectedAd.targetUrl.startsWith('/article/') && (
                <a
                  href={selectedAd.targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '0.55rem 1.15rem',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
                  }}
                >
                  <span>Visit Advertiser Website</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ALL ADS IN SHORT FORMAT (The directory grid) */}
      <section aria-label="Active Commercial Directory">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              All Active Commercial Flights ({filteredAds.length})
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              Shown in concise summary format. Click any announcement card below to open its full presentation.
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
            Loading active commercial inventory...
          </div>
        ) : filteredAds.length === 0 ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No Commercial Flights Found</h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>
              {searchQuery ? `No active ads matching "${searchQuery}".` : 'No commercial flights are active under this category.'}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ marginTop: '0.75rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}>
            {filteredAds.map((ad) => {
              const isSelected = selectedAd && selectedAd.id === ad.id;
              const isMarquee = (ad.placementCode || '').startsWith('marquee_');
              const isStory = Boolean(ad.articleId || (ad.targetUrl && ad.targetUrl.startsWith('/article/')));

              return (
                <article
                  key={ad.id}
                  onClick={() => handleSelectAd(ad)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleSelectAd(ad);
                  }}
                  style={{
                    backgroundColor: '#ffffff',
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '1.15rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 14px rgba(37,99,235,0.18)' : '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 150ms ease',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Top Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        backgroundColor: isStory ? '#fef3c7' : '#dbeafe',
                        color: isStory ? '#92400e' : '#1e40af',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '2px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        {isStory ? 'Sponsored Story' : (isMarquee ? 'Marquee Ticker' : 'Display Banner')}
                      </span>

                      <span style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }}></span>
                        Live
                      </span>
                    </div>

                    {/* Creative Thumbnail if image ad */}
                    {ad.imageUrl && (
                      <div style={{
                        height: '110px',
                        backgroundColor: '#0f172a',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}

                    {/* Sponsor Label */}
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {ad.sponsor || ad.clientName}
                    </div>

                    {/* Headline in Short format */}
                    <h3 style={{
                      fontSize: '0.96rem',
                      fontWeight: 800,
                      color: isSelected ? '#1d4ed8' : '#0f172a',
                      margin: '0.25rem 0 0.5rem 0',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {ad.title}
                    </h3>

                    {/* Placement context */}
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                      Slot: <span style={{ color: '#475569' }}>{ad.placementName || ad.placementCode}</span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {ad.dimensions}
                    </span>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: isSelected ? '#2563eb' : '#0284c7'
                    }}>
                      <span>{isSelected ? 'Viewing Full Ad' : 'View Full Ad'}</span>
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer Commercial Information Card */}
      <aside style={{
        marginTop: '3.5rem',
        padding: '1.75rem',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Advertise with Janta Journal
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Book high-visibility marquee tickers, super leaderboards, or sponsored brand articles.
          </p>
        </div>

        <Link
          to="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '0.55rem 1.15rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <span>Commercial Partnerships Desk</span>
          <ArrowRight size={13} />
        </Link>
      </aside>
    </div>
  );
}

