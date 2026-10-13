import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp } from 'lucide-react';
import { TRENDING_TAGS } from '../../data/mockNewsData';
import apiService from '../../services/api';

export default function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tags, setTags] = useState(TRENDING_TAGS);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTags() {
      try {
        const res = await apiService.getTags();
        if (res.data && res.data.length > 0) {
          const names = res.data.map(t => (typeof t === 'object' ? t.name : t)).filter(Boolean);
          if (names.length > 0) setTags(names.slice(0, 10));
        }
      } catch (e) {
        // Fall back to default tags
      }
    }
    if (isOpen) {
      loadTags();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleTagClick = (tag) => {
    onClose();
    navigate(`/search?tag=${encodeURIComponent(tag)}`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(10, 14, 23, 0.75)',
      backdropFilter: 'blur(3px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '10vh'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '680px',
        backgroundColor: '#ffffff',
        borderRadius: '3px',
        boxShadow: 'var(--shadow-dropdown)',
        padding: '1.75rem',
        margin: '0 1rem'
      }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-600)' }}>
            Search The Bharat Chronicle Archive
          </span>
          <button onClick={onClose} style={{ color: 'var(--color-ink-500)', padding: '0.2rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input
            type="text"
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords, topics, authors, or policy files..."
            style={{
              width: '100%',
              padding: '0.85rem 3rem 0.85rem 1rem',
              fontSize: '1.05rem',
              fontFamily: 'var(--font-sans)',
              border: '2px solid var(--color-ink-900)',
              borderRadius: '2px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.5rem',
              backgroundColor: 'var(--color-ink-950)',
              color: '#ffffff',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Search size={18} />
          </button>
        </form>

        {/* Suggested Searches / Trending tags */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-ink-500)', marginBottom: '0.65rem' }}>
            <TrendingUp size={13} style={{ color: 'var(--color-breaking)' }} />
            <span>POPULAR SEARCH TOPICS:</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {tags.map((tag, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTagClick(tag)}
                style={{
                  padding: '0.35rem 0.7rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-ink-100)',
                  color: 'var(--color-ink-800)',
                  borderRadius: '2px',
                  border: '1px solid var(--color-ink-200)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-ink-950)';
                  e.target.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'var(--color-ink-100)';
                  e.target.style.color = 'var(--color-ink-800)';
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
