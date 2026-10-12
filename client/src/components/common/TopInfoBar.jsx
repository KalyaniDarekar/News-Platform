import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, CloudSun, Calendar, ShieldCheck, Globe } from 'lucide-react';
import { MARKET_DATA, WEATHER_DATA } from '../../data/mockNewsData';

export default function TopInfoBar() {
  const [edition, setEdition] = useState('India (New Delhi)');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formatted);
  }, []);

  return (
    <div className="top-info-bar">
      <div className="container-editorial">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          
          {/* Left: Date, Edition, Weather */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
              <Calendar size={13} style={{ color: 'var(--color-ink-500)' }} />
              {currentDate || 'Monday, October 12, 2026'}
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
              >
                <option value="India (New Delhi)">Edition: India (New Delhi)</option>
                <option value="Global Edition">Edition: International (Global)</option>
                <option value="Bengaluru Tech">Edition: Bengaluru & South</option>
                <option value="Mumbai Financial">Edition: Mumbai Capital</option>
              </select>
            </div>

            <span style={{ color: 'var(--color-ink-300)' }}>|</span>

            {/* Weather & Air Quality */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CloudSun size={14} style={{ color: '#d97706' }} />
              <span>{WEATHER_DATA.city} {WEATHER_DATA.temp}</span>
              <span style={{ 
                fontSize: '0.68rem', 
                backgroundColor: '#fef3c7', 
                color: '#92400e', 
                padding: '0.1rem 0.35rem', 
                borderRadius: '2px', 
                fontWeight: 600 
              }}>
                AQI {WEATHER_DATA.aqi}
              </span>
            </div>
          </div>

          {/* Right: Financial Ticker Preview & Admin Quicklink */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.74rem' }}>
              {MARKET_DATA.slice(0, 2).map((item, idx) => (
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
              <a 
                href="#epaper" 
                onClick={(e) => { e.preventDefault(); alert('e-Paper Reader: Digital replica of today’s print edition will open here in Phase 2.'); }}
                style={{ fontWeight: 600, color: 'var(--color-ink-700)', fontSize: '0.75rem' }}
              >
                e-Paper
              </a>
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
                  border: '1px solid #bfdbfe'
                }}
              >
                <ShieldCheck size={12} /> Newsroom CMS
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
