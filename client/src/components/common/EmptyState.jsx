import React from 'react';
import { Newspaper, RotateCcw } from 'lucide-react';

export default function EmptyState({ 
  title = "No Articles Found", 
  message = "No published dispatches match your current criteria. Please modify your search filters or check back shortly.",
  onReset
}) {
  return (
    <div style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      backgroundColor: '#fafbfc',
      border: '1px dashed var(--color-ink-300)',
      borderRadius: '2px',
      margin: '2rem 0'
    }}>
      <div style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        backgroundColor: 'var(--color-ink-100)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-ink-600)',
        marginBottom: '1rem'
      }}>
        <Newspaper size={28} />
      </div>

      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-ink-900)', marginBottom: '0.45rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-600)', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
        {message}
      </p>

      {onReset && (
        <button
          onClick={onReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-ink-950)',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: 700,
            borderRadius: '2px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          <RotateCcw size={14} /> Reset Filters
        </button>
      )}
    </div>
  );
}
