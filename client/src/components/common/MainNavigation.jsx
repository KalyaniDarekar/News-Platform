import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Flame, Search, ChevronRight } from 'lucide-react';
import apiService from '../../services/api';

export default function MainNavigation({ onSearchClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    async function loadNavData() {
      const [catsRes, tagsRes] = await Promise.all([
        apiService.getCategories(),
        apiService.getTags()
      ]);

      if (isMounted) {
        if (catsRes && Array.isArray(catsRes.data) && catsRes.data.length > 0) {
          // Sort by display order
          const sorted = [...catsRes.data].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
          setCategories(sorted);
        }
        if (tagsRes && Array.isArray(tagsRes.data) && tagsRes.data.length > 0) {
          setTrendingTags(tagsRes.data.slice(0, 6));
        } else {
          setTrendingTags([
            { name: 'SemiconductorMission', slug: 'semiconductor-mission' },
            { name: 'RBIMonetaryPolicy', slug: 'rbi-monetary-policy' },
            { name: 'DeepTech', slug: 'deep-tech' },
            { name: 'IndoPacific', slug: 'indo-pacific' },
            { name: 'GreenHydrogen', slug: 'green-hydrogen' }
          ]);
        }
      }
    }
    loadNavData();
    return () => { isMounted = false; };
  }, []);

  const handleTrendingClick = (tagSlug) => {
    navigate(`/search?tag=${encodeURIComponent(tagSlug)}`);
  };

  return (
    <nav style={{ backgroundColor: 'var(--color-paper)', borderBottom: '1px solid var(--color-ink-200)', position: 'sticky', top: 0, zIndex: 90 }} aria-label="Main Editorial Navigation">
      <div className="container-editorial">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Mobile Hamburger Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 0.5rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--color-ink-900)'
              }}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              <span style={{ textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.05em' }}>Sections</span>
            </button>
          </div>

          {/* Desktop Primary Nav Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            overflowX: 'auto',
            padding: '0.5rem 0',
            scrollbarWidth: 'none'
          }} className="desktop-nav-scroll">
            
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                fontSize: '0.86rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: isActive ? 'var(--color-breaking)' : 'var(--color-ink-950)',
                padding: '0.35rem 0',
                borderBottom: isActive ? '2px solid var(--color-breaking)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              })}
            >
              Home
            </NavLink>

            {categories.map((cat) => (
              <NavLink
                key={cat.id || cat.slug}
                to={`/category/${cat.slug}`}
                style={({ isActive }) => ({
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: isActive ? 'var(--color-breaking)' : 'var(--color-ink-800)',
                  padding: '0.35rem 0',
                  borderBottom: isActive ? '2px solid var(--color-breaking)' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'all var(--transition-fast)'
                })}
              >
                {cat.name}
              </NavLink>
            ))}

            <NavLink
              to="/videos"
              style={({ isActive }) => ({
                fontSize: '0.84rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: isActive ? 'var(--color-breaking)' : '#dc2626',
                padding: '0.35rem 0',
                borderBottom: isActive ? '2px solid var(--color-breaking)' : '2px solid transparent',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              })}
            >
              <span>● Video Desk</span>
            </NavLink>

          </div>

          {/* Right Micro Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onSearchClick}
              style={{
                color: 'var(--color-ink-700)',
                padding: '0.4rem',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Search Archives"
              aria-label="Open search dialog"
            >
              <Search size={18} />
            </button>
          </div>

        </div>

        {/* Trending Sub-Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.35rem 0',
          borderTop: '1px solid var(--color-ink-100)',
          fontSize: '0.74rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none'
        }}>
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            fontWeight: 800, 
            color: 'var(--color-breaking)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            <Flame size={12} /> Trending:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {trendingTags.map((tag, idx) => (
              <button
                key={tag.id || idx}
                type="button"
                onClick={() => handleTrendingClick(tag.slug)}
                style={{
                  color: 'var(--color-ink-600)',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-breaking)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-ink-600)'}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            zIndex: 1000,
            display: 'flex'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            style={{
              width: '85%',
              maxWidth: '340px',
              backgroundColor: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-dropdown)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-ink-200)', paddingBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-masthead)', fontWeight: 900, fontSize: '1.1rem', color: 'var(--color-ink-950)' }}>
                JANTA JOURNAL
              </span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-ink-600)' }} aria-label="Close menu">
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-breaking)', padding: '0.35rem 0' }}
              >
                Newsroom Home
              </Link>

              {categories.map((cat) => (
                <Link
                  key={cat.id || cat.slug}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-ink-800)',
                    padding: '0.4rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--color-ink-100)'
                  }}
                >
                  <span>{cat.name}</span>
                  <ChevronRight size={14} color="var(--color-ink-400)" />
                </Link>
              ))}

              <Link
                to="/videos"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#dc2626',
                  padding: '0.4rem 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--color-ink-100)'
                }}
              >
                <span>● Video Investigations</span>
                <ChevronRight size={14} color="var(--color-ink-400)" />
              </Link>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-ink-200)', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--color-ink-600)' }}>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About Our Newsroom</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact Bureaus</Link>
              <Link to="/policies" onClick={() => setMobileMenuOpen(false)}>Editorial & Correction Policies</Link>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1e40af', fontWeight: 700 }}>Staff CMS Login</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
