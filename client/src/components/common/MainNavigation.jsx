import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Menu, X, Flame, Search, ChevronRight } from 'lucide-react';
import { CATEGORIES, TRENDING_TAGS } from '../../data/mockNewsData';

export default function MainNavigation({ onSearchClick }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleTrendingClick = (tag) => {
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <nav style={{ backgroundColor: 'var(--color-paper)', borderBottom: '1px solid var(--color-ink-200)', position: 'sticky', top: 0, zIndex: 90 }}>
      <div className="container-editorial">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Mobile Hamburger Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
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

            {CATEGORIES.map((cat) => (
              <NavLink
                key={cat.id}
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

          </div>

          {/* Right Micro Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSearchClick}
              style={{
                color: 'var(--color-ink-700)',
                padding: '0.4rem',
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Search"
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
            {TRENDING_TAGS.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => handleTrendingClick(tag)}
                style={{
                  color: 'var(--color-ink-600)',
                  fontWeight: 600,
                  fontSize: '0.74rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--color-breaking)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--color-ink-600)'}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          zIndex: 1000,
          display: 'flex'
        }}>
          <div style={{
            width: '85%',
            maxWidth: '340px',
            backgroundColor: '#ffffff',
            height: '100%',
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: 'var(--shadow-dropdown)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-ink-200)', paddingBottom: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.1rem', fontWeight: 800 }}>
                THE BHARAT CHRONICLE
              </span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.25rem' }}>
                <X size={22} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-400)', letterSpacing: '0.08em' }}>
                Editorial Desks
              </span>
              
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)} 
                style={{ padding: '0.5rem 0', fontWeight: 700, fontSize: '0.95rem', borderBottom: '1px solid var(--color-ink-100)' }}
              >
                Homepage
              </Link>

              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.5rem 0', 
                    fontWeight: 600, 
                    fontSize: '0.9rem', 
                    color: 'var(--color-ink-800)',
                    borderBottom: '1px solid var(--color-ink-100)' 
                  }}
                >
                  {cat.name}
                  <ChevronRight size={14} color="#9ca3af" />
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-ink-200)', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link 
                to="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e40af', padding: '0.5rem', backgroundColor: '#eff6ff', borderRadius: '3px', textAlign: 'center' }}
              >
                Newsroom CMS Portal
              </Link>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', textAlign: 'center' }}>
                Independent National Daily of Record
              </div>
            </div>

          </div>

          <div style={{ flex: 1 }} onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

    </nav>
  );
}
