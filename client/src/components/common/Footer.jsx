import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, CheckCircle, Award, ArrowUp } from 'lucide-react';
import AdBanner from './AdBanner';
import { CATEGORIES } from '../../data/mockNewsData';
import VisitorCounter from './VisitorCounter';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ backgroundColor: '#0a0e17', color: '#f3f4f6', borderTop: '4px solid #111827', marginTop: '4rem' }}>
      
      {/* Top Footer Banner */}
      <div style={{ borderBottom: '1px solid #1f2937', padding: '1.25rem 0' }}>
        <div className="container-editorial" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
              JANTA JOURNAL
            </span>
            <p style={{ fontSize: '0.76rem', color: '#9ca3af', marginTop: '0.2rem' }}>
              Independent National Journal of Record • Committed to Truth, Analytical Rigour and Public Interest
            </p>
          </div>

          <button 
            onClick={scrollToTop}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#9ca3af',
              fontSize: '0.78rem',
              fontWeight: 600,
              padding: '0.4rem 0.75rem',
              border: '1px solid #374151',
              borderRadius: '2px',
              transition: 'all var(--transition-fast)'
            }}
          >
            Back to Top <ArrowUp size={13} />
          </button>
        </div>
      </div>

      {/* Footer Commercial Super Leaderboard Placement (Section A) */}
      <div className="container-editorial" style={{ paddingTop: '1.5rem' }}>
        <AdBanner slot="footerBanner" />
      </div>

      {/* Main Footer Links Columns */}
      <div className="container-editorial" style={{ padding: '1.5rem 20px 2rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
          gap: '2rem'
        }}>
          
          {/* Column 1: News Desks */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.4rem' }}>
              News Desks
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              {CATEGORIES.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} style={{ color: '#9ca3af' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Features & Multimedia */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.4rem' }}>
              Special Reports
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              {CATEGORIES.slice(5).map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} style={{ color: '#9ca3af' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/videos" style={{ color: '#f87171', fontWeight: 600 }}>
                  ● Video Investigations
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Editorial Standards & Legal */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.4rem' }}>
              Standards & Partnerships
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
              {/* <li><Link to="/advertise" style={{ color: '#60a5fa', fontWeight: 700 }}>★ Direct Advertising & Media Kit</Link></li> */}
              <li><Link to="/about" style={{ color: '#9ca3af' }}>About Our Newsroom</Link></li>
              <li><Link to="/contact" style={{ color: '#9ca3af' }}>Contact Bureaus & Tip-offs</Link></li>
              <li><Link to="/policies" style={{ color: '#9ca3af' }}>Corrections & Editorial Code</Link></li>
              <li><Link to="/privacy-policy" style={{ color: '#9ca3af' }}>Privacy Policy (DPDP & GDPR)</Link></li>
              <li>
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('bc_open_consent_modal'))}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#9ca3af',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                  onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
                >
                  Cookie & Consent Preferences
                </button>
              </li>
              <li><Link to="/terms" style={{ color: '#9ca3af' }}>Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsroom Verification & Accreditation */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '1rem', borderBottom: '1px solid #374151', paddingBottom: '0.4rem' }}>
              Editorial Integrity
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.78rem', color: '#9ca3af' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <CheckCircle size={15} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                <span>Accredited with the Press Council of India (Reg. BC-2026-DEL-0941).</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <Shield size={15} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} />
                <span>Compliant with the Information Technology (Intermediary & Digital Media) Ethics Rules.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <Award size={15} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                <span>Committed to rigorous double-sourced fact verification before dispatch.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Real-time Audited Visitor Counter */}
        <VisitorCounter />

        {/* Bottom Bar: Copyright, Grievance Contact & Development Attribution */}
        <div style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #1f2937',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          fontSize: '0.74rem',
          color: '#6b7280'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              © 2026 JANTA JOURNAL Media Network Pvt. Ltd. All rights reserved.
            </div>
            <div>
              Grievance Officer: <strong style={{ color: '#d1d5db' }}>grievance@jantajournal.com</strong> • New Delhi, India
            </div>
          </div>

          <div style={{
            paddingTop: '0.65rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#9ca3af'
          }}>
            Designed and Developed by the{' '}
            <a
              href="https://dypcoeiincubationcentre.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#10b981',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
                e.currentTarget.style.color = '#34d399';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
                e.currentTarget.style.color = '#10b981';
              }}
            >
              DYPCOEI Incubation Centre
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
