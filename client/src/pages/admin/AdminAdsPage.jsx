import React, { useState } from 'react';
import { Megaphone, PlusCircle, ToggleLeft, ToggleRight, ExternalLink, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminAdsPage() {
  const [ads, setAds] = useState([
    {
      id: 1,
      slot: 'Header Super Leaderboard (970x90)',
      sponsor: 'Confederation of Indian Industry',
      campaign: 'India Global Tech Summit 2026',
      impressions: '142,400',
      clicks: '3,540',
      ctr: '2.48%',
      revenue: '₹1,85,000',
      active: true
    },
    {
      id: 2,
      slot: 'Article Sidebar Top (300x250)',
      sponsor: 'National Infrastructure Investment Fund',
      campaign: 'Green Infrastructure Sovereign Bonds',
      impressions: '98,200',
      clicks: '2,110',
      ctr: '2.15%',
      revenue: '₹1,20,000',
      active: true
    },
    {
      id: 3,
      slot: 'Homepage Mid-Billboard (970x120)',
      sponsor: 'Ministry of New & Renewable Energy Partner',
      campaign: 'Solar Mission Grid Expansion',
      impressions: '64,100',
      clicks: '1,420',
      ctr: '2.21%',
      revenue: '₹95,000',
      active: true
    }
  ]);

  const toggleAd = (id) => {
    setAds(ads.map(ad => ad.id === id ? { ...ad, active: !ad.active } : ad));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Commercial Advertising & Inventory Operations
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Manage direct sponsor campaigns, IAB ad slots, programmatic tags, and yield monetization.
          </p>
        </div>

        <button
          onClick={() => alert('New Campaign: In Phase 2, connects to MySQL advertisements table.')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '0.55rem 1rem',
            borderRadius: '4px',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <PlusCircle size={15} /> Book Sponsor Campaign
        </button>
      </div>

      {/* Revenue Snapshot Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Total Monthly Ad Yield</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>₹4,00,000</div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>+18% over last month</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Delivered Impressions</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>304,700</div>
          <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600 }}>98.4% fill rate</div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Average Platform CTR</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>2.31%</div>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Industry benchmark: 0.8%</div>
        </div>
      </div>

      {/* Inventory Slots Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Inventory Slot & Dimension</th>
              <th style={{ padding: '0.85rem 1rem' }}>Active Sponsor / Campaign</th>
              <th style={{ padding: '0.85rem 1rem' }}>Impressions</th>
              <th style={{ padding: '0.85rem 1rem' }}>CTR</th>
              <th style={{ padding: '0.85rem 1rem' }}>Gross Value</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {ads.map((ad) => (
              <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{ad.slot}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Position: Above Fold</div>
                </td>

                <td style={{ padding: '1rem 1rem' }}>
                  <strong style={{ color: '#0f172a' }}>{ad.sponsor}</strong>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>"{ad.campaign}"</div>
                </td>

                <td style={{ padding: '1rem 1rem', fontFamily: 'monospace' }}>
                  {ad.impressions}
                </td>

                <td style={{ padding: '1rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#047857' }}>
                  {ad.ctr}
                </td>

                <td style={{ padding: '1rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                  {ad.revenue}
                </td>

                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <button
                    onClick={() => toggleAd(ad.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      backgroundColor: ad.active ? '#dcfce7' : '#f1f5f9',
                      color: ad.active ? '#15803d' : '#64748b',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {ad.active ? 'Active' : 'Paused'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
