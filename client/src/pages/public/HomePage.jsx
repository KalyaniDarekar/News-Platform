import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Video, TrendingUp, Clock, Eye, AlertCircle, RefreshCw, Flame, Play } from 'lucide-react';
import HeroPackage from '../../components/editorial/HeroPackage';
import ArticleCard from '../../components/editorial/ArticleCard';
import AdBanner from '../../components/common/AdBanner';
import NewsletterBox from '../../components/editorial/NewsletterBox';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import apiService, { formatPublishTime, getMediaUrl, handleImageError, DEFAULT_NEWS_IMAGE } from '../../services/api';
import { isMarathi } from '../../utils/language';

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editorial section datasets
  const [leadStory, setLeadStory] = useState(null);
  const [secondaryStories, setSecondaryStories] = useState([]);
  const [wireUpdates, setWireUpdates] = useState([]);
  const [opinions, setOpinions] = useState([]);
  const [latestFeed, setLatestFeed] = useState([]);
  const [trendingStories, setTrendingStories] = useState([]);
  const [nationalStories, setNationalStories] = useState([]);
  const [economyStories, setEconomyStories] = useState([]);
  const [techStories, setTechStories] = useState([]);
  const [worldStories, setWorldStories] = useState([]);
  const [videoStories, setVideoStories] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [partnerStory, setPartnerStory] = useState(null);

  async function loadHomeData() {
    setLoading(true);
    setError(null);

    try {
      // Parallel fetch from backend APIs
      const [
        allRes,
        trendingRes,
        videoRes,
        nationalRes,
        economyRes,
        techRes,
        worldRes,
        opinionRes
      ] = await Promise.all([
        apiService.getArticles({ limit: 15, sort: 'publication_time', order: 'desc' }),
        apiService.getTrendingArticles(5),
        apiService.getVideoNews(6),
        apiService.getArticles({ category: 'national', limit: 4 }),
        apiService.getArticles({ category: 'economy', limit: 4 }),
        apiService.getArticles({ category: 'tech', limit: 4 }),
        apiService.getArticles({ category: 'world', limit: 4 }),
        apiService.getArticles({ category: 'opinion', limit: 4 })
      ]);

      const articles = allRes.data || [];

      // Find lead story: article with is_lead === 1, or fallback to first
      const lead = articles.find(a => a.is_lead === 1 || a.is_lead === true) || articles[0];
      setLeadStory(lead);

      // Secondary spotlights: stories with is_featured === 1 or next 2 stories (excluding lead)
      const nonLead = articles.filter(a => a.id !== (lead && lead.id));
      const featured = nonLead.filter(a => a.is_featured === 1 || a.is_featured === true);
      const secondaries = featured.length >= 2 ? featured.slice(0, 2) : nonLead.slice(0, 2);
      setSecondaryStories(secondaries);

      // Fast wire updates: 5 most recent articles
      setWireUpdates(articles.slice(0, 5));

      // Opinions
      const ops = (opinionRes.data && opinionRes.data.length > 0) ? opinionRes.data : nonLead.slice(2, 4);
      setOpinions(ops.slice(0, 3));

      // Latest news feed
      setLatestFeed(articles.slice(0, 8));

      // Trending stories
      const trending = trendingRes.data || [];
      setTrendingStories(trending);

      // Category sections
      setNationalStories(nationalRes.data || []);
      setEconomyStories(economyRes.data || []);
      setTechStories(techRes.data || []);
      setWorldStories(worldRes.data || []);

      // Video news
      const vids = videoRes.data || [];
      setVideoStories(vids);
      if (vids.length > 0) {
        setActiveVideo(vids[0]);
      }

      // Partner / Sponsored content
      const sponsored = articles.find(a => a.is_sponsored === 1 || a.category_slug === 'sponsored');
      setPartnerStory(sponsored || null);

    } catch (err) {
      console.error('Failed to load homepage data:', err);
      setError('Unable to reach newsroom broadcast server. Please verify network connection.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomeData();
  }, []);

  if (error && !leadStory) {
    return (
      <div className="container-editorial" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '2rem' }}>
          <AlertCircle size={36} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>
            Connection Disrupted
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#7f1d1d', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {error}
          </p>
          <button
            onClick={loadHomeData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--color-ink-950)',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '2px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> Retry Dispatch
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container-editorial">
        
        {/* Top Header Leaderboard Ad Banner (IAB Standard 970x90) */}
        <AdBanner slot="headerLeaderboard" />

        {/* Lead Story Editorial Hero Package */}
        {loading ? (
          <SkeletonLoader count={1} type="hero" />
        ) : (
          <HeroPackage 
            leadStory={leadStory}
            secondaryStories={secondaryStories}
            wireUpdates={wireUpdates}
            opinions={opinions}
          />
        )}

        {/* Mid-Page Billboard Banner */}
        <AdBanner slot="midBillboard" />

        {/* ================= SECTION: LATEST DISPATCHES & TRENDING DESK ================= */}
        <section style={{ margin: '3rem 0', borderTop: '2px solid var(--color-ink-950)', paddingTop: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '2.5rem',
            alignItems: 'start'
          }} className="home-latest-trending-grid">
            
            {/* Left: Latest News Feed with Timestamps */}
            <div>
              <div className="section-header-editorial" style={{ marginBottom: '1.25rem' }}>
                <h2 className="section-title-editorial" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} style={{ color: 'var(--color-breaking)' }} />
                  <span>The Real-Time Newsroom Feed</span>
                </h2>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-ink-500)', fontFamily: 'var(--font-mono)' }}>
                  UPDATED EVERY 60 SECONDS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {latestFeed.slice(0, 5).map((article) => (
                  <ArticleCard key={article.id || article.slug} article={article} variant="horizontal" />
                ))}
              </div>
            </div>

            {/* Right: Trending & Most-Read Analytics */}
            <aside style={{
              backgroundColor: '#fafbfc',
              border: '1px solid var(--color-ink-200)',
              padding: '1.5rem',
              borderRadius: '2px'
            }}>
              <div style={{ borderBottom: '2px solid var(--color-breaking)', paddingBottom: '0.5rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-950)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={16} style={{ color: 'var(--color-breaking)' }} /> Most Read Today
                </h3>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-ink-500)', textTransform: 'uppercase' }}>
                  BY READER VIEWS
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {trendingStories.map((story, idx) => (
                  <article key={story.id || story.slug} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: idx < trendingStories.length - 1 ? '1px dashed var(--color-ink-200)' : 'none' }}>
                    <span style={{
                      fontSize: '1.75rem',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 900,
                      color: idx === 0 ? 'var(--color-breaking)' : 'var(--color-ink-400)',
                      lineHeight: 1,
                      width: '1.5rem',
                      textAlign: 'center',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span className="kicker kicker-neutral" style={{ fontSize: '0.65rem' }}>
                        {story.category_name || story.category || 'ANALYSIS'}
                      </span>
                      <Link 
                        to={`/article/${story.slug}`}
                        className={isMarathi(story) ? 'lang-mr' : ''}
                        style={{
                          fontFamily: isMarathi(story) ? 'var(--font-marathi)' : 'inherit',
                          fontSize: isMarathi(story) ? '0.84rem' : '0.92rem',
                          fontWeight: 700,
                          lineHeight: isMarathi(story) ? 1.45 : 1.35,
                          color: 'var(--color-ink-950)',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--color-breaking)'}
                        onMouseLeave={(e) => e.target.style.color = 'var(--color-ink-950)'}
                      >
                        {story.title}
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.7rem', color: 'var(--color-ink-500)', marginTop: '0.15rem' }}>
                        <span>{formatPublishTime(story.publication_time)}</span>
                        <span>•</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Eye size={11} /> {story.views ? Number(story.views).toLocaleString() : '1.2k'} reads
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Sidebar Rectangle Ad */}
              <div style={{ marginTop: '1.5rem' }}>
                <AdBanner slot="sidebarRectangle" />
              </div>
            </aside>

          </div>
        </section>

        {/* ================= SECTION: NATIONAL & GOVERNANCE ================= */}
        {nationalStories.length > 0 && (
          <section style={{ margin: '3rem 0', borderTop: '1px solid var(--color-ink-200)', paddingTop: '1.5rem' }}>
            <div className="section-header-editorial">
              <h2 className="section-title-editorial">
                <span style={{ borderLeft: '4px solid var(--color-national)', paddingLeft: '0.65rem' }}>
                  National & Governance
                </span>
              </h2>
              <Link to="/category/national" className="section-link-more">
                All National Coverage <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem'
            }}>
              {nationalStories.slice(0, 3).map((story) => (
                <ArticleCard key={story.id || story.slug} article={story} variant="standard" />
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION: ECONOMY & MARKETS ================= */}
        {economyStories.length > 0 && (
          <section style={{ margin: '3rem 0', borderTop: '1px solid var(--color-ink-200)', paddingTop: '1.5rem' }}>
            <div className="section-header-editorial">
              <h2 className="section-title-editorial">
                <span style={{ borderLeft: '4px solid #059669', paddingLeft: '0.65rem' }}>
                  Economy, Finance & Global Trade
                </span>
              </h2>
              <Link to="/category/economy" className="section-link-more">
                All Economy & Market News <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem'
            }}>
              {economyStories.slice(0, 3).map((story) => (
                <ArticleCard key={story.id || story.slug} article={story} variant="standard" />
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION: SPONSORED PARTNER FEATURE ================= */}
        {partnerStory && (
          <section style={{
            backgroundColor: '#fefce8',
            border: '1px solid #fef08a',
            padding: '1.5rem',
            margin: '3rem 0',
            borderRadius: '2px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span className="badge-tag badge-sponsored">
                PARTNER CONTENT • COMMERCIAL SPONSORSHIP
              </span>
              <span style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600 }}>
                Presented by {partnerStory.author_name || 'Enterprise Partners Desk'}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.6fr',
              gap: '1.5rem',
              alignItems: 'center'
            }} className="sponsored-grid">
              <div className="editorial-img-wrap" style={{ aspectRatio: '16/10', borderRadius: '2px', overflow: 'hidden' }}>
                <img 
                  src={getMediaUrl(partnerStory.featured_image) || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80'} 
                  alt={partnerStory.alt_text || partnerStory.title} 
                  onError={handleImageError}
                  loading="lazy" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div>
                <Link to={`/article/${partnerStory.slug}`} style={{ textDecoration: 'none' }}>
                  <h3 className="headline-lead" style={{ fontSize: '1.35rem', color: '#78350f' }}>
                    {partnerStory.title}
                  </h3>
                </Link>
                <p style={{ fontSize: '0.9rem', color: '#854d0e', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  {partnerStory.short_description || partnerStory.summary}
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to={`/article/${partnerStory.slug}`} style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Read Partner Report →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= SECTION: VIDEO NEWS WITH RESPONSIVE YOUTUBE EMBED ================= */}
        {videoStories.length > 0 && (
          <section style={{
            backgroundColor: '#0a0e17',
            color: '#ffffff',
            padding: '2rem 1.25rem',
            margin: '3rem 0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                  <Video size={18} style={{ color: '#ef4444' }} /> Chronicle Video News & Documentary Investigations
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <a
                    href="https://www.youtube.com/@JantaJournal?sub_confirmation=1"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#ff0000',
                      color: '#ffffff',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '3px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textDecoration: 'none'
                    }}
                  >
                    <Play size={12} fill="#ffffff" /> Subscribe on YouTube
                  </a>
                  <Link to="/videos" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', textDecoration: 'none' }}>
                    All Broadcasts →
                  </Link>
                </div>
              </div>

              {/* Active Player Showcase */}
              {activeVideo && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
                  gap: '2rem',
                  alignItems: 'center',
                  marginBottom: '2.5rem',
                  backgroundColor: '#111827',
                  padding: '1.5rem',
                  borderRadius: '2px',
                  border: '1px solid #1f2937'
                }} className="video-feature-grid">
                  
                  {/* Responsive YouTube Player Iframe (autoplay=0 strict compliance) */}
                  <div style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    backgroundColor: '#000000',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
                  }}>
                    {(activeVideo.youtube_id || extractYouTubeId(activeVideo.youtube_url)) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${activeVideo.youtube_id || extractYouTubeId(activeVideo.youtube_url)}?autoplay=0&rel=0`}
                        title={activeVideo.title}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 0
                        }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <img
                          src={getMediaUrl(activeVideo.featured_image) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                          alt={activeVideo.alt_text || activeVideo.title}
                          onError={handleImageError}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Play size={24} fill="#ffffff" style={{ marginLeft: 3 }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Video Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span className="badge-tag" style={{ backgroundColor: '#dc2626', color: '#ffffff', alignSelf: 'flex-start' }}>
                      {activeVideo.category_name || 'EXCLUSIVE INVESTIGATION'}
                    </span>
                    <Link to={`/article/${activeVideo.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.25, color: '#f9fafb' }}>
                        {activeVideo.title}
                      </h3>
                    </Link>
                    <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.5 }}>
                      {activeVideo.short_description || activeVideo.summary}
                    </p>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <span>By {activeVideo.author_name || 'Chronicle Investigations Desk'}</span>
                      <span>•</span>
                      <span>{formatPublishTime(activeVideo.publication_time)}</span>
                    </div>
                  </div>

                </div>
              )}

              {/* Video Grid Playlist */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem'
              }}>
                {videoStories.map((video) => (
                  <div 
                    key={video.id || video.slug} 
                    onClick={() => setActiveVideo(video)} 
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      borderRadius: '2px',
                      backgroundColor: activeVideo && activeVideo.id === video.id ? '#1f2937' : 'transparent',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '2px', overflow: 'hidden' }}>
                      <img
                        src={getMediaUrl(video.featured_image) || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'}
                        alt={video.alt_text || video.title}
                        onError={handleImageError}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Play size={16} fill="#ffffff" style={{ marginLeft: 2 }} />
                      </div>
                    </div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f3f4f6', lineHeight: 1.3, marginTop: '0.2rem' }}>
                      {video.title}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                      {formatPublishTime(video.publication_time)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================= SECTION: TECHNOLOGY & ARTIFICIAL INTELLIGENCE ================= */}
        {techStories.length > 0 && (
          <section style={{ margin: '3rem 0', borderTop: '1px solid var(--color-ink-200)', paddingTop: '1.5rem' }}>
            <div className="section-header-editorial">
              <h2 className="section-title-editorial">
                <span style={{ borderLeft: '4px solid var(--color-tech)', paddingLeft: '0.65rem' }}>
                  Technology & Sovereign Innovation
                </span>
              </h2>
              <Link to="/category/tech" className="section-link-more">
                All Tech Coverage <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem'
            }}>
              {techStories.slice(0, 3).map((story) => (
                <ArticleCard key={story.id || story.slug} article={story} variant="standard" />
              ))}
            </div>
          </section>
        )}

        {/* ================= SECTION: WORLD AFFAIRS & GEOPOLITICS ================= */}
        {worldStories.length > 0 && (
          <section style={{ margin: '3rem 0', borderTop: '1px solid var(--color-ink-200)', paddingTop: '1.5rem' }}>
            <div className="section-header-editorial">
              <h2 className="section-title-editorial">
                <span style={{ borderLeft: '4px solid #4f46e5', paddingLeft: '0.65rem' }}>
                  World Affairs & Strategic Intelligence
                </span>
              </h2>
              <Link to="/category/world" className="section-link-more">
                All World Dispatches <ArrowRight size={13} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem'
            }}>
              {worldStories.slice(0, 3).map((story) => (
                <ArticleCard key={story.id || story.slug} article={story} variant="standard" />
              ))}
            </div>
          </section>
        )}

        {/* Morning Briefing Newsletter Callout */}
        <NewsletterBox />

      </div>
    </div>
  );
}
