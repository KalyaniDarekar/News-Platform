import React from 'react';
import { BarChart3, TrendingUp, Users, Smartphone, Globe, Eye } from 'lucide-react';
import { ALL_STORIES } from '../../data/mockNewsData';

export default function AdminAnalyticsPage() {
  const topArticles = [
    { title: 'The Semiconductor Corridor: Inside India’s Silicon Fab Buildout', reads: '148,200', time: '5m 12s', share: '32%' },
    { title: 'Reserve Bank Signals Liquidity Normalisation as Core Inflation Stabilises', reads: '84,100', time: '3m 45s', share: '18%' },
    { title: 'Strategic Realignment: Quad Foreign Ministers Affirm Free Navigation', reads: '72,400', time: '4m 10s', share: '15%' },
    { title: 'ISRO Shukrayaan Deep-Space Mission Orbital Insertion', reads: '61,900', time: '2m 50s', share: '13%' }
  ];

  const cityTraffic = [
    { city: 'New Delhi (NCR)', share: '34%', readers: '132,000' },
    { city: 'Mumbai Financial Hub', share: '24%', readers: '93,000' },
    { city: 'Bengaluru Tech Corridor', share: '19%', readers: '74,000' },
    { city: 'Hyderabad & South', share: '11%', readers: '42,000' },
    { city: 'Global / NRI Diaspora (US, UK, UAE)', share: '12%', readers: '46,000' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
          Editorial Reader Analytics & Intelligence
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
          Telemetry on reader attention, dispatch engagement, geographic clusters, and referral sources.
        </p>
      </div>

      {/* High Level KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Monthly Page Impressions</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>2,480,000</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>+24% month-on-month</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Average Attention Time</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>4m 12s</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>High deep-read ratio</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Device Distribution</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>68% Mobile</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>26% Desktop • 6% Tablet</div>
        </div>
      </div>

      {/* 2-Column Analytics Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Top Performing Dispatches */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} color="#2563eb" /> Top Investigative Dispatches by Reader Volume
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topArticles.map((art, idx) => (
              <div key={idx} style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', flex: 1, paddingRight: '1rem' }}>
                    {idx + 1}. {art.title}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: '#2563eb' }}>
                    {art.reads}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                  <span>Avg reading time: {art.time}</span>
                  <span>Share of total traffic: {art.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Globe size={16} color="#059669" /> Readers by City & Diaspora
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cityTraffic.map((c, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{c.city}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.share}</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: c.share, backgroundColor: idx === 0 ? '#2563eb' : '#64748b', borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
