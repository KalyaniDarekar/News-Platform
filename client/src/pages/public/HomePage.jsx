import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Video, TrendingUp, Sparkles } from 'lucide-react';
import HeroPackage from '../../components/editorial/HeroPackage';
import ArticleCard from '../../components/editorial/ArticleCard';
import AdBanner from '../../components/common/AdBanner';
import NewsletterBox from '../../components/editorial/NewsletterBox';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { ALL_STORIES, MULTIMEDIA_STORIES, SPONSORED_STORIES, DEMO_NOTICE } from '../../data/mockNewsData';
import apiService from '../../services/api';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [nationalStories, setNationalStories] = useState([]);
  const [techStories, setTechStories] = useState([]);
  const [dataSource, setDataSource] = useState('DEMONSTRATION_MODE');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await apiService.getArticles({ limit: 12 });
      setDataSource(res.source);
      
      const national = ALL_STORIES.filter(s => s.categorySlug === 'national' || s.id === 105 || s.id === 108 || s.id === 109).slice(0, 3);
      const tech = ALL_STORIES.filter(s => s.categorySlug === 'tech' && !s.isLead).slice(0, 3);
      
      setNationalStories(national.length === 3 ? national : ALL_STORIES.slice(1, 4));
      setTechStories(tech.length === 3 ? tech : ALL_STORIES.slice(2, 5));
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Demo Mode Notice Header */}
      <div className="demo-banner">
        <Sparkles size={13} style={{ color: '#fbbf24' }} />
        <span>{DEMO_NOTICE.text}</span>
        <span style={{ opacity: 0.6 }}>•</span>
        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Data Source: {dataSource}</span>
      </div>

      <div className="container-editorial">
        
        {/* Top Header Leaderboard Ad Banner (IAB Standard 970x90) */}
        <AdBanner slot="headerLeaderboard" />

        {/* Lead Story Editorial Hero Package */}
        {loading ? (
          <SkeletonLoader count={1} type="hero" />
        ) : (
          <HeroPackage />
        )}

        {/* Mid-Page Billboard Banner */}
        <AdBanner slot="midBillboard" />

        {/* ================= SECTION 1: NATIONAL & GOVERNANCE ================= */}
        <section style={{ margin: '2.5rem 0' }}>
          <div className="section-header-editorial">
            <h2 className="section-title-editorial">
              <span style={{ borderLeft: '4px solid var(--color-national)', paddingLeft: '0.5rem' }}>
                National & Governance
              </span>
            </h2>
            <Link to="/category/national" className="section-link-more">
              All National News <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {nationalStories.map((story) => (
              <ArticleCard key={story.id} article={story} variant="standard" />
            ))}
          </div>
        </section>

        {/* ================= SECTION 2: SPONSORED PARTNER FEATURE ================= */}
        {SPONSORED_STORIES.length > 0 && (
          <section style={{
            backgroundColor: '#fefce8',
            border: '1px solid #fef08a',
            padding: '1.5rem',
            margin: '2.5rem 0',
            borderRadius: '2px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span className="badge-tag badge-sponsored">
                PARTNER CONTENT • COMMERCIAL SPONSORSHIP
              </span>
              <span style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 600 }}>
                Presented by {SPONSORED_STORIES[0].client}
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.6fr',
              gap: '1.5rem',
              alignItems: 'center'
            }} className="sponsored-grid">
              <div className="editorial-img-wrap" style={{ aspectRatio: '16/10', borderRadius: '2px' }}>
                <img src={SPONSORED_STORIES[0].image} alt={SPONSORED_STORIES[0].title} />
              </div>

              <div>
                <Link to={`/article/${SPONSORED_STORIES[0].slug}`}>
                  <h3 className="headline-lead" style={{ fontSize: '1.35rem', color: '#78350f' }}>
                    {SPONSORED_STORIES[0].title}
                  </h3>
                </Link>
                <p style={{ fontSize: '0.9rem', color: '#854d0e', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  {SPONSORED_STORIES[0].summary}
                </p>
                <div style={{ marginTop: '0.75rem' }}>
                  <Link to={`/article/${SPONSORED_STORIES[0].slug}`} style={{ fontSize: '0.78rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Read Partner Report →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= SECTION 3: MULTIMEDIA & VIDEO INVESTIGATIONS ================= */}
        <section style={{
          backgroundColor: '#0a0e17',
          color: '#ffffff',
          padding: '2rem',
          margin: '3rem -20px',
          borderRadius: '0'
        }}>
          <div className="container-editorial">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff' }}>
                <Video size={18} style={{ color: '#ef4444' }} /> Chronicle Video News & Documentaries
              </h2>
              <Link to="/videos" style={{ fontSize: '0.76rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
                All Video Broadcasts →
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {MULTIMEDIA_STORIES.map((video) => (
                <ArticleCard key={video.id} article={video} variant="video" />
              ))}
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: TECH, AI & SOVEREIGN INNOVATION ================= */}
        <section style={{ margin: '2.5rem 0' }}>
          <div className="section-header-editorial">
            <h2 className="section-title-editorial">
              <span style={{ borderLeft: '4px solid var(--color-tech)', paddingLeft: '0.5rem' }}>
                Technology & Artificial Intelligence
              </span>
            </h2>
            <Link to="/category/tech" className="section-link-more">
              All Tech & AI Coverage <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.75rem'
          }}>
            {techStories.map((story) => (
              <ArticleCard key={story.id} article={story} variant="standard" />
            ))}
          </div>
        </section>

        {/* Morning Briefing Newsletter Callout */}
        <NewsletterBox />

      </div>
    </div>
  );
}
