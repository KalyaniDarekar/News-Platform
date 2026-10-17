// ========================================================================
// Admin Dashboard Overview Desk — Phase 3
// Real-time editorial analytics, expiration alert queue, upcoming releases,
// and audit log activity feed connected directly to MySQL backend.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, AlertTriangle, Users, TrendingUp, 
  PlusCircle, CheckCircle2, ChevronRight, Eye, ShieldAlert, Sparkles,
  RefreshCw, Calendar, ArrowRight, Activity, ExternalLink
} from 'lucide-react';
import adminApi from '../../services/adminApi';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    setErrorMsg(null);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Dashboard stats notice:', err.message);
      // If server or DB is in dev fallback mode, show gentle notice only
      setErrorMsg('Notice: Connecting to local MySQL server. Check server/.env for DB_PASSWORD if tables are not loaded yet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading live newsroom dashboard telemetry...</div>
      </div>
    );
  }

  const counts = stats?.counts || { published: 0, draft: 0, scheduled: 0, in_review: 0, expired: 0, total: 0 };
  const expiringSoon = stats?.expiring_soon_24h || 0;
  const totalViews = stats?.total_views || 0;
  const publishedToday = stats?.published_today || 0;
  const expiringArticles = stats?.expiring_next_7_days || [];
  const upcomingScheduled = stats?.upcoming_scheduled || [];
  const recentActivity = stats?.recent_activity || [];
  const topArticles = stats?.top_articles || [];

  const metrics = [
    { title: 'Live Published Articles', value: counts.published, sub: `${publishedToday} published today`, icon: FileText, color: '#16a34a', bg: '#f0fdf4' },
    { title: 'In Review Queue', value: counts.in_review, sub: 'Needs editorial approval', icon: Clock, color: '#ca8a04', bg: '#fefce8' },
    { title: 'Drafts in Progress', value: counts.draft, sub: 'Saved by reporters', icon: FileText, color: '#475569', bg: '#f8fafc' },
    { title: 'Scheduled Embargoes', value: counts.scheduled, sub: 'Auto-publish on schedule', icon: Calendar, color: '#7e22ce', bg: '#faf5ff' },
    { title: 'Expiring Within 24h', value: expiringSoon, sub: `${counts.expired} already expired`, icon: AlertTriangle, color: '#ea580c', bg: '#fff7ed' },
    { title: 'Cumulative Reader Views', value: totalViews.toLocaleString(), sub: 'Across published network', icon: TrendingUp, color: '#2563eb', bg: '#eff6ff' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Editorial Command Dashboard
            </h1>
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              MYSQL LIVE
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
            Real-time status of editorial releases, publication expiration lifecycles, and staff activity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={fetchStats}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.5rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>

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

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.85rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Expiry Warning Strip if articles are expiring soon */}
      {expiringSoon > 0 && (
        <div style={{
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          padding: '0.85rem 1.25rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#ea580c', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#9a3412' }}>
                Attention: {expiringSoon} article{expiringSoon > 1 ? 's' : ''} expiring within the next 24 hours
              </div>
              <div style={{ fontSize: '0.76rem', color: '#c2410c' }}>
                Stories will auto-retire from reader view unless their publication expiry dates are extended.
              </div>
            </div>
          </div>
          <Link
            to="/admin/scheduled"
            style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ea580c', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Review Scheduled & Expiry Queue <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Metrics 6-Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
        gap: '1rem'
      }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>
                  {m.title}
                </span>
                <div style={{ backgroundColor: m.bg, color: m.color, width: 28, height: 28, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  {m.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Split: Expiring & Scheduled Queue vs Recent Editorial Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left: Expiring in Next 7 Days */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#ea580c" />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Upcoming Expirations (Next 7 Days)
              </h2>
            </div>
            <Link to="/admin/scheduled" style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
              View all
            </Link>
          </div>

          {expiringArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
              No stories scheduled to expire in the next 7 days.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {expiringArticles.map((art) => (
                <div
                  key={art.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #fed7aa',
                    backgroundColor: '#fffaf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <Link
                      to={`/admin/articles/${art.id}/edit`}
                      style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {art.title}
                    </Link>
                    <div style={{ fontSize: '0.72rem', color: '#c2410c', marginTop: '0.15rem' }}>
                      Expires: {new Date(art.expiry_time).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    to={`/admin/articles/${art.id}/edit`}
                    style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.35rem 0.65rem', borderRadius: '3px', backgroundColor: '#ea580c', color: '#ffffff', textDecoration: 'none', flexShrink: 0 }}
                  >
                    Extend
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Newsroom Activity Feed */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={16} color="#2563eb" />
              <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                Recent Newsroom Audit Activity
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Live audit trail</span>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.8rem' }}>
              No recent audit logs recorded.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentActivity.map((log) => (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    fontSize: '0.78rem',
                    borderBottom: '1px solid #f1f5f9',
                    paddingBottom: '0.5rem'
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div>
                      <strong>{log.actor_name || 'Staff User'}</strong> {log.action?.toLowerCase().replace(/_/g, ' ')}
                      {log.entity_id ? ` #${log.entity_id}` : ''}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Top Read Articles Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={16} color="#059669" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Most Read Stories (Telemetry)
            </h2>
          </div>
          <Link to="/admin/articles" style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600 }}>
            Manage all stories
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>Headline</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Category</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Views</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topArticles.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No published articles found in database.
                  </td>
                </tr>
              ) : (
                topArticles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600 }}>
                      <Link to={`/admin/articles/${art.id}/edit`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                        {art.title}
                      </Link>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: '#64748b' }}>
                      {art.category_name || 'General'}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#059669' }}>
                      {art.view_count.toLocaleString()}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '3px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                        {art.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                      <Link to={`/admin/articles/${art.id}/edit`} style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.75rem' }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
