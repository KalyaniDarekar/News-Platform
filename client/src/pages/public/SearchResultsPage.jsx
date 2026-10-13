import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RotateCcw, AlertCircle, RefreshCw, Tag, ChevronDown } from 'lucide-react';
import ArticleCard from '../../components/editorial/ArticleCard';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import apiService from '../../services/api';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const selectedCat = searchParams.get('category') || 'all';
  const selectedTag = searchParams.get('tag') || '';

  const [searchTerm, setSearchTerm] = useState(query);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Sync searchTerm with URL query param
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // Load available categories and tags on mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const [catRes, tagsRes] = await Promise.all([
          apiService.getCategories(),
          apiService.getTags()
        ]);
        setCategories(catRes.data || []);
        setPopularTags(tagsRes.data || []);
      } catch (err) {
        console.warn('Could not load search filters:', err);
      }
    }
    loadFilters();
  }, []);

  // Perform backend search
  async function performSearch(pageNumber = 1, append = false) {
    if (pageNumber === 1) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = {
        page: pageNumber,
        limit: 9,
        sort: 'publication_time',
        order: 'desc'
      };

      if (query.trim()) params.search = query.trim();
      if (selectedCat && selectedCat !== 'all') params.category = selectedCat;
      if (selectedTag) params.tag = selectedTag;

      const res = await apiService.getArticles(params);
      const list = res.data || [];

      if (append) {
        setArticles(prev => [...prev, ...list]);
      } else {
        setArticles(list);
      }

      setPage(pageNumber);
      const total = res.meta ? res.meta.total : list.length;
      setTotalCount(total);
      const totalPages = res.meta ? res.meta.totalPages : 1;
      setHasMore(pageNumber < totalPages);

    } catch (err) {
      console.error('Search error:', err);
      setError('Search service experienced an issue. Please retry.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // Trigger search on query / filter changes
  useEffect(() => {
    performSearch(1, false);
  }, [query, selectedCat, selectedTag]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    const newParams = {};
    if (trimmed) newParams.q = trimmed;
    if (selectedCat !== 'all') newParams.category = selectedCat;
    if (selectedTag) newParams.tag = selectedTag;
    setSearchParams(newParams);
  };

  const handleCategoryFilter = (catSlug) => {
    const newParams = {};
    if (query) newParams.q = query;
    if (catSlug !== 'all') newParams.category = catSlug;
    if (selectedTag) newParams.tag = selectedTag;
    setSearchParams(newParams);
  };

  const handleTagFilter = (tag) => {
    const newParams = {};
    if (query) newParams.q = query;
    if (selectedCat !== 'all') newParams.category = selectedCat;
    if (tag && tag !== selectedTag) newParams.tag = tag;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div className="container-editorial" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      
      {/* Search Header */}
      <div style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-ink-950)' }}>
          Search Chronicle Archive
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-600)', marginTop: '0.35rem' }}>
          Explore published reporting, investigative series, and editorial columns across the news network.
        </p>

        {/* In-Page Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', maxWidth: '640px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, people, topics, or policy files..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                fontSize: '0.95rem',
                border: '1px solid var(--color-ink-400)',
                borderRadius: '2px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-ink-500)' }} />
          </div>

          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-ink-950)',
              color: '#ffffff',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              border: 0,
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </form>

        {/* Category Desk Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-500)', marginRight: '0.35rem' }}>
            Filter Desk:
          </span>
          <button
            onClick={() => handleCategoryFilter('all')}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.3rem 0.65rem',
              borderRadius: '2px',
              backgroundColor: selectedCat === 'all' ? 'var(--color-ink-950)' : 'var(--color-ink-100)',
              color: selectedCat === 'all' ? '#ffffff' : 'var(--color-ink-800)',
              border: 0,
              cursor: 'pointer'
            }}
          >
            All Desks
          </button>
          {categories.map((c) => (
            <button
              key={c.id || c.slug}
              onClick={() => handleCategoryFilter(c.slug)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.3rem 0.65rem',
                borderRadius: '2px',
                backgroundColor: selectedCat === c.slug ? 'var(--color-ink-950)' : 'var(--color-ink-100)',
                color: selectedCat === c.slug ? '#ffffff' : 'var(--color-ink-800)',
                border: 0,
                cursor: 'pointer'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Popular Tags Filter */}
        {popularTags.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-500)', marginRight: '0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Tag size={12} /> Topics:
            </span>
            {popularTags.slice(0, 8).map((t, idx) => {
              const tagStr = typeof t === 'object' ? t.name : t;
              const isSelected = selectedTag === tagStr;
              return (
                <button
                  key={idx}
                  onClick={() => handleTagFilter(isSelected ? '' : tagStr)}
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '2px',
                    backgroundColor: isSelected ? 'var(--color-breaking)' : 'var(--color-ink-100)',
                    color: isSelected ? '#ffffff' : 'var(--color-ink-700)',
                    border: '1px solid var(--color-ink-200)',
                    cursor: 'pointer'
                  }}
                >
                  #{tagStr}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Header Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-ink-600)' }}>
        <div>
          {loading ? (
            <span>Searching archive dispatches...</span>
          ) : (
            <span>
              Found <strong>{totalCount}</strong> matching {totalCount === 1 ? 'dispatch' : 'dispatches'}
              {query && <span> for "<em>{query}</em>"</span>}
              {selectedCat !== 'all' && <span> in <strong>{selectedCat.toUpperCase()}</strong></span>}
              {selectedTag && <span> tagged with <strong>#{selectedTag}</strong></span>}
            </span>
          )}
        </div>

        {(query || selectedCat !== 'all' || selectedTag) && (
          <button
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontSize: '0.76rem',
              color: 'var(--color-breaking)',
              background: 'none',
              border: 0,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={12} /> Reset Search
          </button>
        )}
      </div>

      {/* Results Grid or States */}
      {loading ? (
        <SkeletonLoader count={6} />
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={36} style={{ color: '#dc2626', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>Search Failed</h3>
          <p style={{ fontSize: '0.86rem', color: '#7f1d1d', marginBottom: '1.25rem' }}>{error}</p>
          <button 
            onClick={() => performSearch(1, false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--color-ink-950)', color: '#ffffff', padding: '0.55rem 1.15rem', borderRadius: '2px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
          >
            <RefreshCw size={13} /> Retry Search
          </button>
        </div>
      ) : articles.length === 0 ? (
        <EmptyState 
          title="No Matching Dispatches Found"
          message={`We couldn't locate any published news matching "${query || 'the active filters'}". The archive strictly excludes expired and draft articles. Try searching for broader terms or clearing filters.`}
          onReset={handleResetFilters}
        />
      ) : (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {articles.map((story) => (
              <ArticleCard key={story.id || story.slug} article={story} variant="standard" />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-ink-200)' }}>
              <button
                onClick={() => performSearch(page + 1, true)}
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
                  border: 0
                }}
              >
                {loadingMore ? 'Searching More...' : <>Load More Results <ChevronDown size={14} /></>}
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
