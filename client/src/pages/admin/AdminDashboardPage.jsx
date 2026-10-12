import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, AlertTriangle, Users, TrendingUp, 
  PlusCircle, CheckCircle2, ChevronRight, Eye, ShieldAlert, Sparkles 
} from 'lucide-react';
import { ALL_STORIES, BREAKING_NEWS } from '../../data/mockNewsData';

export default function AdminDashboardPage() {
  const [breakingActive, setBreakingActive] = useState(true);

  const metrics = [
    { title: 'Articles Published Today', value: '18', change: '+4 vs yesterday', icon: FileText, color: '#2563eb' },
    { title: 'Stories Pending Review', value: '4', change: '2 marked urgent', icon: Clock, color: '#f59e0b' },
    { title: 'Scheduled Embargoed', value: '3', change: 'Next at 16:00 IST', icon: AlertTriangle, color: '#8b5cf6' },
    { title: 'Concurrent Active Readers', value: '3,842', change: '+14% spike', icon: Users, color: '#10b981' },
    { title: 'Commercial Ad CTR', value: '2.48%', change: 'Normal threshold', icon: TrendingUp, color: '#06b6d4' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Dashboard Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Newsroom Central Dashboard
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Real-time editorial desk coordination, publication queue, and commercial telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/admin/articles/new"
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
            <PlusCircle size={15} /> Compose Story
          </Link>
        </div>
      </div>

      {/* Breaking News Global Alert Toggle Strip */}
      <div style={{
        backgroundColor: breakingActive ? '#fef2f2' : '#f8fafc',
        border: breakingActive ? '1px solid #fecaca' : '1px solid #e2e8f0',
        padding: '0.85rem 1.25rem',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: breakingActive ? '#dc2626' : '#94a3b8',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: breakingActive ? '#991b1b' : '#334155' }}>
              Global Breaking News Ticker: {breakingActive ? 'LIVE & BROADCASTING' : 'OFFLINE / PAUSED'}
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              Active lead headline: "{BREAKING_NEWS[0].headline}"
            </div>
          </div>
        </div>

        <button
          onClick={() => setBreakingActive(!breakingActive)}
          style={{
            padding: '0.4rem 0.85rem',
            backgroundColor: breakingActive ? '#991b1b' : '#334155',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 700,
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}
        >
          {breakingActive ? 'Disable Ticker' : 'Activate Ticker'}
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem'
      }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} style={{
              backgroundColor: '#ffffff',
              padding: '1.25rem',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>
                  {m.title}
                </span>
                <div style={{ color: m.color, padding: '0.25rem', backgroundColor: `${m.color}15`, borderRadius: '4px' }}>
                  <Icon size={16} />
                </div>
              </div>

              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                {m.value}
              </div>

              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                {m.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Editorial Queue & Review Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Editorial Queue & Live Dispatches
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Showing latest stories currently active across national, world, and economy desks.
            </p>
          </div>

          <Link to="/admin/articles" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            Full Newsroom Archive <ChevronRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.75rem 1.25rem' }}>Headline & Desk</th>
                <th style={{ padding: '0.75rem 1rem' }}>Author</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Read Time</th>
                <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ALL_STORIES.slice(0, 5).map((story, idx) => (
                <tr key={story.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                      {story.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.72rem', color: '#64748b' }}>
                      <span style={{ fontWeight: 700, color: '#2563eb' }}>{story.category || 'National'}</span>
                      <span>•</span>
                      <span>Published: {story.publishedAt || 'Today'}</span>
                    </div>
                  </td>

                  <td style={{ padding: '1rem 1rem', color: '#334155', fontWeight: 600 }}>
                    {story.author?.name || 'Bureau Staff'}
                  </td>

                  <td style={{ padding: '1rem 1rem' }}>
                    <span style={{ 
                      backgroundColor: idx === 0 ? '#dcfce7' : '#eff6ff', 
                      color: idx === 0 ? '#15803d' : '#1d4ed8', 
                      padding: '0.2rem 0.55rem', 
                      borderRadius: '999px', 
                      fontSize: '0.7rem', 
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {idx === 0 ? 'Lead Story' : 'Published'}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1rem', color: '#64748b' }}>
                    {story.readingTime || '4 min'}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <Link
                        to={`/article/${story.slug}`}
                        target="_blank"
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}
                      >
                        Preview
                      </Link>
                      <Link
                        to="/admin/articles/new"
                        style={{ padding: '0.35rem 0.65rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 600 }}
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
