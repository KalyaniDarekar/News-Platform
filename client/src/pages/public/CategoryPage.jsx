import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle, TrendingUp, Sparkles, Filter, ChevronDown } from 'lucide-react';
import ArticleCard from '../../components/editorial/ArticleCard';
import AdBanner from '../../components/common/AdBanner';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import apiService, { formatPublishTime } from '../../services/api';

export default function CategoryPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('publication_time'); // 'publication_time' | 'views'
  const [trendingArticles, setTrendingArticles] = useState([]);

  // Load category details and first page
  async function loadInitial() {
    setLoading(true);
    setError(null);
    setPage(1);

    try {
      // Fetch category metadata
      const catRes = await apiService.getCategories();
      const matched = (catRes.data || []).find(c => c.slug === slug);
      if (matched) {
        setCategoryInfo(matched);
      } else {
        setCategoryInfo({
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          slug,
          description: `Authoritative reporting, investigations, and field dispatches from the ${slug.toUpperCase()} bureau.`
        });
      }

      // Fetch first page of articles
      const artRes = await apiService.getArticles({
        category: slug,
        page: 1,
        limit: 8,
        sort: sortBy,
        order: 'desc'
      });

      const list = artRes.data || [];
      setArticles(list);
      setTotalCount(artRes.meta ? artRes.meta.total : list.length);
      const totalPages = artRes.meta ? artRes.meta.totalPages : 1;
      setHasMore(1 < totalPages);

      // Fetch trending for sidebar
      const trendRes = await apiService.getTrendingArticles(4);
      setTrendingArticles(trendRes.data || []);

    } catch (err) {
      console.error('Failed to load category:', err);
      setError('Unable to retrieve editorial category archives. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Reload when slug or sortBy changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadInitial();
  }, [slug, sortBy]);

  // Load more articles
  async function handleLoadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await apiService.getArticles({
        category: slug,
        page: nextPage,
        limit: 8,
        sort: sortBy,
        order: 'desc'
      });

      const nextList = res.data || [];
      setArticles(prev => [...prev, ...nextList]);
      setPage(nextPage);

      const totalPages = res.meta ? res.meta.totalPages : 1;
      setHasMore(nextPage < totalPages);
    } catch (err) {
      console.error('Failed to load more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  }

  const categoryName = categoryInfo ? categoryInfo.name : (slug.charAt(0).toUpperCase() + slug.slice(1));
  const categoryDesc = categoryInfo && categoryInfo.description 
    ? categoryInfo.description 
    : `In-depth analysis, verified field reporting, and editorial commentary on ${categoryName}.`;

  return (
    <div className="container-editorial" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      
      {/* Category Header */}
      <header style={{
        borderBottom: '3px solid var(--color-ink-950)',
        paddingBottom: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: 'var(--color-ink-500)', marginBottom: '0.5rem' }}>
          <Link to="/" style={{ color: 'var(--color-ink-500)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--color-breaking)' }}>{categoryName} Desk</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--color-ink-950)', lineHeight: 1.1 }}>
              {categoryName}
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--color-ink-600)', marginTop: '0.5rem', maxWidth: '720px', lineHeight: 1.5 }}>
              {categoryDesc}
            </p>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--color-ink-500)', fontWeight: 600 }}>
            {totalCount} {totalCount === 1 ? 'Dispatch' : 'Dispatches'} Published
          </div>
        </div>

        {/* Sub-Filters / Sort Modes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={13} /> Order By:
          </span>
          <button
            onClick={() => setSortBy('publication_time')}
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '0.4rem 0.85rem',
              borderRadius: '2px',
              backgroundColor: sortBy === 'publication_time' ? 'var(--color-ink-950)' : 'var(--color-ink-100)',
              color: sortBy === 'publication_time' ? '#ffffff' : 'var(--color-ink-800)',
              cursor: 'pointer',
              border: 0,
              transition: 'all var(--transition-fast)'
            }}
          >
            Latest Dispatches
          </button>
          <button
            onClick={() => setSortBy('views')}
            style={{
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              padding: '0.4rem 0.85rem',
              borderRadius: '2px',
              backgroundColor: sortBy === 'views' ? 'var(--color-ink-950)' : 'var(--color-ink-100)',
              color: sortBy === 'views' ? '#ffffff' : 'var(--color-ink-800)',
              cursor: 'pointer',
              border: 0,
              transition: 'all var(--transition-fast)'
            }}
          >
            Most Read / Trending
          </button>
        </div>
      </header>

      {/* Category-Page Placement Banner (728x90 Billboard) */}
      <AdBanner slot="categoryBanner" />

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
          ) : error ? (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '2rem', textAlign: 'center' }}>
              <AlertCircle size={36} style={{ color: '#dc2626', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>Failed to Load</h3>
              <p style={{ fontSize: '0.86rem', color: '#7f1d1d', marginBottom: '1.25rem' }}>{error}</p>
              <button 
                onClick={loadInitial}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--color-ink-950)', color: '#ffffff', padding: '0.55rem 1.15rem', borderRadius: '2px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
              >
                <RefreshCw size={13} /> Retry
              </button>
            </div>
          ) : articles.length === 0 ? (
            <EmptyState 
              title={`No articles currently in ${categoryName}`}
              message="Our editorial desk is actively compiling upcoming reports for this section. Please check back shortly or explore other news desks."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Lead Horizontal Card */}
              {articles[0] && (
                <ArticleCard article={articles[0]} variant="horizontal" />
              )}

              {/* Sub-grid of Remaining Articles */}
              {articles.length > 1 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: '1.75rem',
                  marginTop: '0.5rem'
                }}>
                  {articles.slice(1).map((article) => (
                    <ArticleCard key={article.id || article.slug} article={article} variant="standard" />
                  ))}
                </div>
              )}

              {/* Efficient Load More Button / Pagination */}
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-ink-200)' }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 2rem',
                      backgroundColor: 'var(--color-ink-950)',
                      color: '#ffffff',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      cursor: loadingMore ? 'not-allowed' : 'pointer',
                      opacity: loadingMore ? 0.7 : 1,
                      border: 0,
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw size={14} className="spin-animation" /> Loading Dispatches...
                      </>
                    ) : (
                      <>
                        Load More Stories <ChevronDown size={14} />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Ad & Trending Desk */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Sidebar Medium Rectangle Ad (300x250) */}
          <AdBanner slot="sidebarRectangle" />

          {/* Network-wide Trending Stories */}
          <div style={{
            backgroundColor: '#fafbfc',
            border: '1px solid var(--color-ink-200)',
            padding: '1.25rem',
            borderRadius: '2px'
          }}>
            <div style={{ borderBottom: '2px solid var(--color-breaking)', paddingBottom: '0.45rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-950)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <TrendingUp size={14} style={{ color: 'var(--color-breaking)' }} /> Trending Network Stories
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {trendingArticles.map((story, idx) => (
                <div key={story.id || story.slug} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: idx < trendingArticles.length - 1 ? '1px dashed var(--color-ink-200)' : 'none' }}>
                  <span style={{ fontSize: '1.1rem', fontFamily: 'var(--font-serif)', fontWeight: 800, color: 'var(--color-ink-400)', width: '1rem', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <div>
                    <Link to={`/article/${story.slug}`} style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-ink-950)', textDecoration: 'none', lineHeight: 1.3 }} onMouseEnter={(e) => e.target.style.color = 'var(--color-breaking)'} onMouseLeave={(e) => e.target.style.color = 'var(--color-ink-950)'}>
                      {story.title}
                    </Link>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-ink-500)', marginTop: '0.2rem' }}>
                      {formatPublishTime(story.publication_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
}
