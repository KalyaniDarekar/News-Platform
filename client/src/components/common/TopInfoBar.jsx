import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, CloudSun, Calendar, ShieldCheck, Globe, BookOpen, X, Download } from 'lucide-react';
import apiService, { formatEditorialDate } from '../../services/api';

export default function TopInfoBar() {
  const [edition, setEdition] = useState('India (New Delhi)');
  const [currentDate, setCurrentDate] = useState('');
  const [isEpaperOpen, setIsEpaperOpen] = useState(false);
  const [marketData, setMarketData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    // Current date formatted in editorial timezone (IST)
    const now = new Date();
    const formatted = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(now);
    setCurrentDate(formatted);

    setMarketData(apiService.getMarketData());
    setWeatherData(apiService.getWeatherData());
  }, []);

  return (
    <>
      <div className="top-info-bar">
        <div className="container-editorial">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            
            {/* Left: Date, Edition, Weather */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
                <Calendar size={13} style={{ color: 'var(--color-ink-500)' }} />
                {currentDate || 'Tuesday, October 13, 2026'}
              </span>

              <span style={{ color: 'var(--color-ink-300)' }}>|</span>

              {/* Edition Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Globe size={13} style={{ color: 'var(--color-ink-500)' }} />
                <select
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-ink-700)',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  aria-label="Editorial edition selector"
                >
                  <option value="India (New Delhi)">Edition: India (New Delhi)</option>
                  <option value="Global Edition">Edition: International (Global)</option>
                  <option value="Bengaluru Tech">Edition: Bengaluru & South</option>
                  <option value="Mumbai Financial">Edition: Mumbai Capital</option>
                </select>
              </div>

              <span style={{ color: 'var(--color-ink-300)' }}>|</span>

              {/* Weather & Air Quality */}
              {weatherData && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CloudSun size={14} style={{ color: '#d97706' }} />
                  <span>{weatherData.city} {weatherData.temp}</span>
                  <span style={{ 
                    fontSize: '0.68rem', 
                    backgroundColor: '#fef3c7', 
                    color: '#92400e', 
                    padding: '0.1rem 0.35rem', 
                    borderRadius: '2px', 
                    fontWeight: 600 
                  }}>
                    AQI {weatherData.aqi}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Financial Ticker Preview, e-Paper & Admin Link */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.74rem' }}>
                {marketData.slice(0, 2).map((item, idx) => (
                  <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                    <strong style={{ color: 'var(--color-ink-800)' }}>{item.symbol}:</strong>
                    <span>{item.value}</span>
                    <span style={{ 
                      color: item.positive ? '#047857' : '#dc2626', 
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}>
                      {item.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {item.percent}
                    </span>
                  </span>
                ))}
              </div>

              <span style={{ color: 'var(--color-ink-300)' }}>|</span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* e-Paper Interactive Modal Trigger */}
                <button
                  type="button"
                  onClick={() => setIsEpaperOpen(true)}
                  style={{
                    fontWeight: 600,
                    color: 'var(--color-ink-700)',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    cursor: 'pointer'
                  }}
                  title="View Digital e-Paper Replica"
                >
                  <BookOpen size={12} style={{ color: 'var(--color-breaking)' }} /> e-Paper
                </button>

                {/* Newsroom Admin Link */}
                <Link 
                  to="/admin" 
                  style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.25rem', 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    color: '#1e40af', 
                    backgroundColor: '#eff6ff', 
                    padding: '0.15rem 0.45rem', 
                    borderRadius: '2px',
                    border: '1px solid #bfdbfe',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                >
                  <ShieldCheck size={12} /> Newsroom CMS
                </Link>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* e-Paper Reader Modal */}
      {isEpaperOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(10, 14, 23, 0.8)',
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
            maxWidth: '680px',
            borderRadius: '4px',
            boxShadow: 'var(--shadow-dropdown)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 1.5rem',
              backgroundColor: '#0a0e17',
              color: '#ffffff'
            }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.04em' }}>
                  THE BHARAT CHRONICLE — DIGITAL E-PAPER
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                  {currentDate} • Daily Print Replica (16 Pages)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEpaperOpen(false)}
                style={{ color: '#9ca3af', padding: '0.25rem' }}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.75rem', textAlign: 'center' }}>
              <div style={{
                aspectRatio: '16/10',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '3px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                marginBottom: '1.5rem'
              }}>
                <BookOpen size={44} style={{ color: 'var(--color-ink-400)', marginBottom: '0.75rem' }} />
                <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-ink-950)' }}>
                  Today's Complete Delhi Edition Print Replica
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-600)', marginTop: '0.35rem', maxWidth: '420px' }}>
                  Archived high-resolution page facsimile with full-text search, offline download, and zoomable typography.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setIsEpaperOpen(false)}
                  style={{
                    backgroundColor: 'var(--color-breaking)',
                    color: '#ffffff',
                    padding: '0.6rem 1.25rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    borderRadius: '2px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  Read Today's e-Paper (16 Pages)
                </button>
                <button
                  type="button"
                  onClick={() => setIsEpaperOpen(false)}
                  style={{
                    backgroundColor: 'var(--color-ink-100)',
                    color: 'var(--color-ink-800)',
                    padding: '0.6rem 1.25rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    borderRadius: '2px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Download size={14} /> Download PDF (28 MB)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
