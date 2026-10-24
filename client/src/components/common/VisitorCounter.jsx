import React from 'react';
import { Users, Activity, Eye, Sparkles } from 'lucide-react';
import useVisitorCounter from '../../hooks/useVisitorCounter';

export default function VisitorCounter() {
  const { count = 5000, isBumping = false } = useVisitorCounter() || {};

  // Safely format count into individual digits string, e.g. "5,001"
  const safeCount = typeof count === 'number' && !isNaN(count) ? Math.max(5000, count) : 5000;
  const formattedString = safeCount.toLocaleString('en-IN');
  const digits = formattedString.split('');

  return (
    <div 
      className="visitor-counter-container"
      style={{
        marginTop: '2rem',
        marginBottom: '1rem',
        padding: '1.25rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)',
        border: '1px solid #1f2937',
        borderLeft: '4px solid #10b981',
        borderRadius: '6px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(16, 185, 129, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.25rem'
      }}
    >
      {/* Left Column: Label, Live Indicator & Audited Explanation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
        <div 
          style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981',
            flexShrink: 0
          }}
        >
          <Activity size={22} style={{ animation: isBumping ? 'spin 0.5s linear' : 'none' }} />
          {/* Pulsing Live Dot */}
          <span 
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '10px',
              height: '10px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              boxShadow: '0 0 8px #10b981'
            }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span 
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '0.15rem 0.5rem',
                borderRadius: '3px',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}
            >
              Live Traffic Counter
            </span>
            <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
              Baseline 5,000+
            </span>
          </div>

          <h4 
            style={{
              margin: '0.25rem 0 0',
              fontFamily: 'var(--font-masthead, Cinzel, serif)',
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.03em'
            }}
          >
            Total Website Visitors
          </h4>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.74rem', color: '#9ca3af', lineHeight: 1.4 }}>
            Real-time reader telemetry • Automatically updates on page visits, refreshes, tab switching &amp; returning to home
          </p>
        </div>
      </div>

      {/* Right Column: Digital Odometer / Digit Cards Display */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.35rem'
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: '0.4rem 0.6rem',
            backgroundColor: '#030712',
            borderRadius: '6px',
            border: isBumping ? '1px solid #10b981' : '1px solid #374151',
            boxShadow: isBumping ? '0 0 15px rgba(16, 185, 129, 0.35)' : 'inset 0 2px 6px rgba(0, 0, 0, 0.8)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <Users size={16} style={{ color: '#9ca3af', marginRight: '0.25rem' }} />
          
          {digits.map((char, index) => {
            const isComma = char === ',';
            return (
              <span
                key={`${char}-${index}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: isComma ? '10px' : '26px',
                  height: '34px',
                  backgroundColor: isComma ? 'transparent' : 'rgba(31, 41, 55, 0.7)',
                  borderRadius: isComma ? '0' : '4px',
                  border: isComma ? 'none' : '1px solid #4b5563',
                  fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: isBumping ? '#10b981' : '#f9fafb',
                  textShadow: isBumping ? '0 0 10px rgba(16, 185, 129, 0.8)' : '0 1px 3px rgba(0, 0, 0, 0.8)',
                  transform: isBumping ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', color: '#6b7280' }}>
          <Eye size={12} style={{ color: '#10b981' }} />
          <span>Audited Readership Metrics</span>
          {isBumping && (
            <span style={{ color: '#10b981', fontWeight: 700, animation: 'fadeIn 0.2s' }}>
              +1 Visit Recorded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
