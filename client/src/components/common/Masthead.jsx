import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, Sparkles, Check, Mail, X } from 'lucide-react';
import apiService from '../../services/api';

export default function Masthead({ onSearchClick }) {
  const [siteSettings, setSiteSettings] = useState({
    site_name: 'THE BHARAT CHRONICLE',
    site_tagline: 'Journal of Strategic Affairs, Economy, Science & Public Conscience',
    site_motto: 'Veritas et Libertas • Est. 1928'
  });
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      const res = await apiService.getSettings();
      if (isMounted && res && res.data) {
        setSiteSettings(prev => ({
          ...prev,
          site_name: res.data.site_name ? res.data.site_name.toUpperCase() : prev.site_name,
          site_tagline: res.data.site_tagline || prev.site_tagline,
          site_motto: res.data.site_motto || prev.site_motto
        }));
      }
    }
    loadSettings();
    return () => { isMounted = false; };
  }, []);

  const handleSubscribeSubmit = (e) => {
    e.preventDefault();
    if (subEmail && subEmail.includes('@')) {
      setSubSuccess(true);
      setTimeout(() => {
        setIsSubscribeOpen(false);
        setSubSuccess(false);
        setSubEmail('');
      }, 3000);
    }
  };

  return (
    <>
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
                {siteSettings.site_motto}
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
                    {siteSettings.site_name}
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
                {siteSettings.site_tagline}
              </div>
            </div>

            {/* Right: Search, Subscribe & Member Access */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.85rem' }}>
              <button 
                type="button"
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
                type="button"
                onClick={() => setIsSubscribeOpen(true)}
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
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-breaking-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-breaking)'}
              >
                Subscribe
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* Subscription Dialog Modal */}
      {isSubscribeOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 14, 23, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '520px',
            borderRadius: '3px',
            boxShadow: 'var(--shadow-dropdown)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-ink-200)'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-breaking)' }}>
                Member Subscription Desk
              </span>
              <button
                type="button"
                onClick={() => setIsSubscribeOpen(false)}
                style={{ color: 'var(--color-ink-500)', padding: '0.25rem' }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {subSuccess ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Check size={26} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-ink-950)' }}>
                    Welcome to The Bharat Chronicle Circle
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-600)', marginTop: '0.5rem' }}>
                    A confirmation dispatch and morning editorial brief has been sent to <strong>{subEmail}</strong>.
                  </p>
                </div>
              ) : (
                <>
                  <h3 style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-ink-950)' }}>
                    Support Independent Public Journalism
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-600)', marginTop: '0.4rem', lineHeight: 1.5 }}>
                    Subscribe to receive daily verified dispatches, investigative dossiers, and complete uninhibited archive access.
                  </p>

                  <ul style={{ margin: '1.25rem 0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--color-ink-700)' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="#15803d" /> Unlimited access to all editorial dispatches and deep investigations
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="#15803d" /> Morning Executive Brief delivered at 06:30 IST daily
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Check size={14} color="#15803d" /> Full digital replica access to 16-page daily print e-Paper
                    </li>
                  </ul>

                  <form onSubmit={handleSubscribeSubmit} style={{ marginTop: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="email"
                        required
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        placeholder="Enter your email address..."
                        style={{
                          flex: 1,
                          padding: '0.65rem 0.85rem',
                          border: '1px solid var(--color-ink-400)',
                          borderRadius: '2px',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          backgroundColor: 'var(--color-breaking)',
                          color: '#ffffff',
                          padding: '0.65rem 1.25rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          borderRadius: '2px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        Join Circle
                      </button>
                    </div>
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-ink-400)', marginTop: '0.5rem' }}>
                      No commercial spam. Unsubscribe at any time with one click.
                    </span>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
