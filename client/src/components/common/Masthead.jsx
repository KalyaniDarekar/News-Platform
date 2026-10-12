import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Sparkles } from 'lucide-react';

export default function Masthead({ onSearchClick }) {
  return (
    <header style={{ backgroundColor: 'var(--color-paper)', borderBottom: '1px solid var(--color-ink-200)' }}>
      <div className="container-editorial" style={{ paddingTop: '1.25rem', paddingBottom: '1rem' }}>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: '1rem'
        }}>
          
          {/* Left Masthead Pillar: Motto & Heritage Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ 
              fontSize: '0.72rem', 
              fontFamily: 'var(--font-serif)', 
              fontStyle: 'italic', 
              color: 'var(--color-ink-500)',
              letterSpacing: '0.02em'
            }}>
              Veritas et Libertas • Est. 1928
            </span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-ink-700)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              National Daily of Record
            </span>
          </div>

          {/* Center: Brand Masthead */}
          <div style={{ textAlign: 'center', padding: '0 1rem' }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
                <span style={{ 
                  fontFamily: 'var(--font-masthead)', 
                  fontSize: 'clamp(1.75rem, 3.8vw, 3.25rem)', 
                  fontWeight: 900, 
                  letterSpacing: '0.04em',
                  color: 'var(--color-ink-950)',
                  lineHeight: 1
                }}>
                  THE BHARAT CHRONICLE
                </span>
              </div>
            </Link>
            <div style={{ 
              fontSize: '0.73rem', 
              letterSpacing: '0.12em', 
              textTransform: 'uppercase', 
              fontWeight: 700, 
              color: 'var(--color-ink-600)',
              marginTop: '0.35rem' 
            }}>
              Journal of Strategic Affairs, Economy, Science & Public Conscience
            </div>
          </div>

          {/* Right: Search, Subscribe & Member Access */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.85rem' }}>
            <button 
              onClick={onSearchClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '2px',
                border: '1px solid var(--color-ink-300)',
                backgroundColor: 'var(--color-ink-50)',
                color: 'var(--color-ink-700)',
                fontSize: '0.8rem',
                fontWeight: 600,
                transition: 'all var(--transition-fast)'
              }}
              aria-label="Search articles"
            >
              <Search size={14} />
              <span className="hidden-sm">Search</span>
            </button>

            <button 
              onClick={() => alert('Subscription Dialog: Premium member access, ad-free reading & archive research access.')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.48rem 1rem',
                borderRadius: '2px',
                backgroundColor: 'var(--color-breaking)',
                color: '#ffffff',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 2px 4px rgba(201, 24, 43, 0.25)',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <Sparkles size={13} />
              Subscribe
            </button>
          </div>

        </div>

        {/* Double Editorial Hairline Rules */}
        <div className="editorial-rule-double" style={{ marginTop: '0.85rem' }}></div>
      </div>
    </header>
  );
}
