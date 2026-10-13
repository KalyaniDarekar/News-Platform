import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Search, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container-editorial" style={{ paddingTop: '4rem', paddingBottom: '6rem', textAlign: 'center' }}>
      <div style={{
        maxWidth: '580px',
        margin: '0 auto',
        backgroundColor: '#fafbfc',
        border: '1px solid var(--color-ink-200)',
        borderRadius: '3px',
        padding: '3rem 2rem'
      }}>
        <div style={{
          fontSize: '4.5rem',
          fontFamily: 'var(--font-serif)',
          fontWeight: 900,
          color: 'var(--color-breaking)',
          lineHeight: 1,
          marginBottom: '0.5rem'
        }}>
          404
        </div>

        <h1 style={{
          fontFamily: 'var(--font-masthead)',
          fontSize: '1.85rem',
          fontWeight: 900,
          color: 'var(--color-ink-950)',
          marginBottom: '1rem'
        }}>
          Editorial Dispatch Not Found
        </h1>

        <p style={{
          fontSize: '0.92rem',
          color: 'var(--color-ink-600)',
          lineHeight: 1.6,
          marginBottom: '2rem'
        }}>
          The page or story dispatch you requested does not exist or may have been retired under our editorial expiration standards. The Bharat Chronicle ensures all public records remain verified.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--color-ink-950)',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '2px',
              fontSize: '0.84rem',
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <Home size={15} /> Return to Front Page
          </Link>

          <Link
            to="/search"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--color-ink-100)',
              color: 'var(--color-ink-900)',
              padding: '0.75rem 1.5rem',
              borderRadius: '2px',
              fontSize: '0.84rem',
              fontWeight: 700,
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            <Search size={15} /> Search Archives
          </Link>
        </div>
      </div>
    </div>
  );
}
