import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RotateCcw } from 'lucide-react';
import ArticleCard from '../../components/editorial/ArticleCard';
import EmptyState from '../../components/common/EmptyState';
import { ALL_STORIES, CATEGORIES } from '../../data/mockNewsData';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchTerm });
  };

  const filteredResults = ALL_STORIES.filter((story) => {
    const matchesQuery = !query || 
      story.title.toLowerCase().includes(query.toLowerCase()) ||
      (story.summary && story.summary.toLowerCase().includes(query.toLowerCase())) ||
      (story.kicker && story.kicker.toLowerCase().includes(query.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || 
      (story.categorySlug && story.categorySlug.toLowerCase() === selectedCategory.toLowerCase()) ||
      (story.category && story.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesQuery && matchesCategory;
  });

  return (
    <div className="container-editorial" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      
      {/* Search Header */}
      <div style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-ink-950)' }}>
          Search Chronicle Archive
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-600)', marginTop: '0.35rem' }}>
          Explore published reporting, investigative series, and editorial columns.
        </p>

        {/* In-Page Search Bar */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', maxWidth: '640px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, people, topics..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                fontSize: '0.95rem',
                border: '1px solid var(--color-ink-400)',
                borderRadius: '2px',
                outline: 'none'
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
              letterSpacing: '0.04em'
            }}
          >
            Search
          </button>
        </form>

        {/* Category Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-500)', marginRight: '0.5rem' }}>
            Filter Desk:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.3rem 0.65rem',
              borderRadius: '2px',
              backgroundColor: selectedCategory === 'all' ? 'var(--color-ink-950)' : 'var(--color-ink-100)',
              color: selectedCategory === 'all' ? '#ffffff' : 'var(--color-ink-800)'
            }}
          >
            All Sections
          </button>
          {CATEGORIES.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.slug)}
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.3rem 0.65rem',
                borderRadius: '2px',
                backgroundColor: selectedCategory === c.slug ? 'var(--color-ink-950)' : 'var(--color-ink-100)',
                color: selectedCategory === c.slug ? '#ffffff' : 'var(--color-ink-800)'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results Meta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--color-ink-600)' }}>
        <div>
          Found <strong>{filteredResults.length}</strong> matching dispatches {query && <span>for "<em>{query}</em>"</span>}
        </div>
      </div>

      {/* Results Grid or Empty State */}
      {filteredResults.length === 0 ? (
        <EmptyState 
          title="No Matching Stories Found"
          message={`We couldn't locate any published news matching "${query || 'your filters'}". Try using different keywords or resetting filters.`}
          onReset={() => { setSearchTerm(''); setSearchParams({}); setSelectedCategory('all'); }}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {filteredResults.map((story) => (
            <ArticleCard key={story.id} article={story} variant="standard" />
          ))}
        </div>
      )}

    </div>
  );
}
