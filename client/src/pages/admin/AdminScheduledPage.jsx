import React, { useState } from 'react';
import { CalendarClock, Clock, AlertCircle, CheckCircle, Play, RotateCcw } from 'lucide-react';

export default function AdminScheduledPage() {
  const [scheduledItems, setScheduledItems] = useState([
    {
      id: 1,
      title: 'Diplomatic Communique: Bilateral Indo-Japanese Quantum Computing Accord',
      category: 'World & Technology',
      author: 'Vikramaditya Sharma',
      scheduledFor: '2026-10-12 18:00 IST',
      embargoNote: 'Strict diplomatic embargo until joint prime ministerial press conference at Tokyo',
      status: 'Embargo Active'
    },
    {
      id: 2,
      title: 'Q2 Sovereign Direct Tax Receipts Exceed Budgetary Estimates by 11.4%',
      category: 'Economy & Fiscal Policy',
      author: 'Dr. Arundhati Sen',
      scheduledFor: '2026-10-13 09:00 IST',
      embargoNote: 'Awaits official release by Controller General of Accounts',
      status: 'Scheduled'
    }
  ]);

  const [expiryRules] = useState([
    { rule: 'Intraday Financial Stock Indices', action: 'Auto-archive after 24 hours', status: 'Enabled' },
    { rule: 'Weather & Monsoon Bulletins', action: 'Auto-archive after 48 hours', status: 'Enabled' },
    { rule: 'Election Live Counting Micro-Updates', action: 'Consolidate into static archive after 7 days', status: 'Enabled' }
  ]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
          Scheduled News & Embargo Management
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
          Automate time-locked investigative disclosures, diplomatic embargoes, and stale content auto-expiry.
        </p>
      </div>

      {/* cPanel Cron Status Callout */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem 1.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Clock size={18} color="#2563eb" />
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e40af' }}>
              cPanel Automation Cron Job: */5 * * * *
            </div>
            <div style={{ fontSize: '0.74rem', color: '#3b82f6' }}>
              Scheduled daemon checks the MySQL release table every 5 minutes and auto-publishes expired embargoes.
            </div>
          </div>
        </div>
        <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '999px' }}>
          CRON SERVICE ACTIVE
        </span>
      </div>

      {/* Scheduled Stories Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
          Active Embargoes & Scheduled Releases
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              <th style={{ padding: '0.75rem 1.25rem' }}>Article Title & Embargo Reason</th>
              <th style={{ padding: '0.75rem 1rem' }}>Desk</th>
              <th style={{ padding: '0.75rem 1rem' }}>Release Target</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduledItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.86rem' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <AlertCircle size={12} /> {item.embargoNote}
                  </div>
                </td>

                <td style={{ padding: '1rem 1rem', color: '#475569' }}>
                  {item.category}
                </td>

                <td style={{ padding: '1rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>
                  {item.scheduledFor}
                </td>

                <td style={{ padding: '1rem 1rem' }}>
                  <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '3px' }}>
                    {item.status}
                  </span>
                </td>

                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <button
                    onClick={() => alert(`Phase 1 Preview: Immediate release triggered for "${item.title}".`)}
                    style={{ padding: '0.35rem 0.65rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '3px', fontSize: '0.74rem', fontWeight: 700 }}
                  >
                    Release Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Auto-Expiry Rules Configuration */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Stale Content Expiry & Archival Automation
        </h3>
        <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
          Ensures breaking intraday alerts do not clutter historical archives.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {expiryRules.map((rule, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
              <div>
                <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{rule.rule}</strong>
                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Action: {rule.action}</div>
              </div>
              <span style={{ color: '#059669', fontSize: '0.74rem', fontWeight: 700 }}>● {rule.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
