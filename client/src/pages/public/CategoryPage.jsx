import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ArticleCard from '../../components/editorial/ArticleCard';
import AdBanner from '../../components/common/AdBanner';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import { CATEGORIES, ALL_STORIES, OPINIONS } from '../../data/mockNewsData';
import apiService from '../../services/api';

export default function CategoryPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  const currentCategory = CATEGORIES.find(c => c.slug === slug) || {
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
    slug,
    desc: 'Comprehensive coverage, investigations, and field dispatches from The Bharat Chronicle bureau.',
    color: '#0A2540'
  };

  useEffect(() => {
    async function loadCategoryArticles() {
      setLoading(true);
      const res = await apiService.getArticles({ category: slug });
      
      // If none explicitly matched the category slug in mock, provide articles from ALL_STORIES
      if (res.data && res.data.length > 0) {
        setArticles(res.data);
      } else {
        // Fallback relevant stories
        setArticles(ALL_STORIES.slice(0, 4));
      }
      setLoading(false);
    }
    loadCategoryArticles();
  }, [slug]);

  return (
    <div className="container-editorial" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Category Header */}
      <header style={{
        borderBottom: `3px solid ${currentCategory.color || '#111827'}`,
        paddingBottom: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: 'var(--color-ink-500)', marginBottom: '0.35rem' }}>
          <Link to="/" style={{ color: 'var(--color-ink-500)' }}>Home</Link>
          <span>/</span>
          <span style={{ color: currentCategory.color }}>{currentCategory.name} Desk</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: 'var(--color-ink-950)', lineHeight: 1.15 }}>
          {currentCategory.name}
        </h1>

        <p style={{ fontSize: '1rem', color: 'var(--color-ink-600)', marginTop: '0.45rem', maxWidth: '750px', lineHeight: 1.5 }}>
          {currentCategory.desc}
        </p>

        {/* Sub-Filters / View Modes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
          {['all', 'latest', 'investigations', 'analysis'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0.35rem 0.75rem',
                borderRadius: '2px',
                backgroundColor: filterType === f ? 'var(--color-ink-950)' : 'var(--color-ink-100)',
                color: filterType === f ? '#ffffff' : 'var(--color-ink-700)',
                transition: 'all var(--transition-fast)'
              }}
            >
              {f === 'all' ? 'All Stories' : f}
            </button>
          ))}
        </div>
      </header>

      {/* Main Layout: 2 Columns (Stories 70%, Sidebar 30%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="category-layout-grid">
        
        {/* Left Column: Stories */}
        <div>
          {loading ? (
            <SkeletonLoader count={4} />
          ) : articles.length === 0 ? (
            <EmptyState 
              title={`No articles yet in ${currentCategory.name}`}
              message="Our editorial desk is currently preparing new reports for this section. Check back shortly."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* First story large horizontal */}
              <ArticleCard article={articles[0]} variant="horizontal" />

              {/* Sub-grid of remaining articles */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.75rem',
                marginTop: '0.5rem'
              }}>
                {articles.slice(1).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="standard" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Ad & Top Perspectives */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Sidebar Medium Rectangle Ad (300x250) */}
          <AdBanner slot="sidebarRectangle" />

          {/* Related Opinions Desk */}
          <div style={{
            backgroundColor: '#fafbfc',
            border: '1px solid var(--color-ink-200)',
            padding: '1.25rem',
            borderRadius: '2px'
          }}>
            <div style={{ borderBottom: '2px solid var(--color-opinion)', paddingBottom: '0.45rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-opinion)' }}>
                Opinions on {currentCategory.name}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {OPINIONS.slice(0, 2).map((op) => (
                <div key={op.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-ink-200)' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-ink-500)' }}>{op.author.name}</span>
                  <Link to={`/article/${op.slug}`} style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 600, fontSize: '0.92rem', color: 'var(--color-ink-950)' }}>
                    "{op.title}"
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

    </div>
  );
}
