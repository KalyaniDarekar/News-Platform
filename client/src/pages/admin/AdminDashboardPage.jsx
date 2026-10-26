import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, Clock, AlertTriangle, Users, TrendingUp, 
  PlusCircle, CheckCircle2, ChevronRight, Eye, ShieldAlert, Sparkles,
  RefreshCw, Calendar, ArrowRight, Activity, ExternalLink, Briefcase,
  Building2, Mail, Phone
} from 'lucide-react';
import adminApi from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user } = useAuth();
  const canPublish = user?.role === 'super_admin' || user?.role === 'editor';

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await adminApi.getDashboardStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
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
  const inReviewArticles = stats?.in_review_articles || [];
  const expiringArticles = stats?.expiring_next_7_days || [];
  const upcomingScheduled = stats?.upcoming_scheduled || [];
  const recentActivity = stats?.recent_activity || [];
  const topArticles = stats?.top_articles || [];
  const newEnquiries = stats?.new_enquiries_count ?? counts.new_enquiries ?? 0;
  const totalEnquiries = stats?.total_enquiries_count ?? counts.total_enquiries ?? 0;
  const recentEnquiries = stats?.recent_enquiries || [];

  const metrics = [
    { title: 'Live Published Articles', value: counts.published, sub: `${publishedToday} published today`, icon: FileText, color: '#16a34a', bg: '#f0fdf4', link: '/admin/articles?status=published' },
    { title: 'In Review Queue', value: counts.in_review, sub: 'Needs editorial approval', icon: Clock, color: '#ca8a04', bg: '#fefce8', link: '/admin/review' },
    { title: 'New Commercial Leads', value: newEnquiries, sub: `${totalEnquiries} total sponsor leads`, icon: Briefcase, color: '#0284c7', bg: '#f0f9ff', link: '/admin/enquiries' },
    { title: 'Drafts in Progress', value: counts.draft, sub: 'Saved by reporters', icon: FileText, color: '#475569', bg: '#f8fafc', link: '/admin/articles?status=draft' },
    { title: 'Scheduled Embargoes', value: counts.scheduled, sub: 'Auto-publish on schedule', icon: Calendar, color: '#7e22ce', bg: '#faf5ff', link: '/admin/scheduled' },
    { title: 'Expiring Within 24h', value: expiringSoon, sub: `${counts.expired} already expired`, icon: AlertTriangle, color: '#ea580c', bg: '#fff7ed', link: '/admin/scheduled' },
    { title: 'Cumulative Reader Views', value: totalViews.toLocaleString(), sub: 'Across published network', icon: TrendingUp, color: '#2563eb', bg: '#eff6ff', link: '/admin/analytics' }
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

      {/* Review Queue Alert Strip for Editors / Super Admins */}
      {counts.in_review > 0 && canPublish && (
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fef08a',
          padding: '0.85rem 1.25rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#ca8a04', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#854d0e' }}>
                Editorial Review Alert: {counts.in_review} story{counts.in_review > 1 ? 'ies' : ''} awaiting review
              </div>
              <div style={{ fontSize: '0.76rem', color: '#a16207' }}>
                Staff correspondents have submitted dispatches requiring your editorial approval before publishing live.
              </div>
            </div>
          </div>
          <Link
            to="/admin/review"
            style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Open Review & Approval Desk <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* New Advertiser Enquiries Alert Strip */}
      {newEnquiries > 0 && (
        <div style={{
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          padding: '0.85rem 1.25rem',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#0284c7', color: '#fff', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0369a1' }}>
                New Campaign Lead Alert: {newEnquiries} new advertiser enquir{newEnquiries > 1 ? 'ies' : 'y'} received
              </div>
              <div style={{ fontSize: '0.76rem', color: '#0284c7' }}>
                Direct brand sponsors have submitted campaign flight proposals awaiting commercial response.
              </div>
            </div>
          </div>
          <Link
            to="/admin/enquiries"
            style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          >
            Review Advertiser Leads <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Stories Awaiting Editorial Review Card (for Editor / Super Admin) */}
      {inReviewArticles.length > 0 && canPublish && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #fef08a', padding: '1.25rem', boxShadow: '0 2px 6px rgba(202, 138, 4, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="#ca8a04" />
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#854d0e' }}>
                Pending Editorial Review Queue ({inReviewArticles.length})
              </h2>
            </div>
            <Link to="/admin/review" style={{ fontSize: '0.78rem', color: '#ca8a04', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Manage All Review Items <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {inReviewArticles.map((art) => (
              <div
                key={art.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #fef08a',
                  backgroundColor: '#fffdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Link
                    to={`/admin/articles/${art.id}/edit`}
                    style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {art.title}
                  </Link>
                  <div style={{ fontSize: '0.72rem', color: '#854d0e', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span>By: <strong>{art.author_name || 'Staff Reporter'}</strong></span>
                    {art.category_name && <span>Category: <strong>{art.category_name}</strong></span>}
                    <span>Submitted: {new Date(art.updated_at || art.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link
                    to={`/admin/articles/${art.id}/edit`}
                    style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.4rem 0.85rem', borderRadius: '4px', backgroundColor: '#ca8a04', color: '#ffffff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <CheckCircle2 size={13} /> Review & Approve
                  </Link>
                </div>
              </div>
            ))}
          </div>
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
            <Link
              key={idx}
              to={m.link}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '1.15rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow 150ms ease, transform 150ms ease'
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
            </Link>
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

      {/* Direct Advertiser Enquiries Section */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={16} color="#0284c7" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Direct Advertiser & Campaign Enquiries ({totalEnquiries})
            </h2>
            {newEnquiries > 0 && (
              <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.12rem 0.5rem', borderRadius: '999px' }}>
                {newEnquiries} New
              </span>
            )}
          </div>
          <Link to="/admin/enquiries" style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            Manage All Leads (CRM) <ArrowRight size={13} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>Company / Sponsor</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Contact</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Budget Tier</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Date Received</th>
                <th style={{ padding: '0.5rem 0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No commercial campaign enquiries registered yet. Submissions from public sponsor enquiry form will appear here.
                  </td>
                </tr>
              ) : (
                recentEnquiries.map((enq) => {
                  const statusColors = {
                    new: { bg: '#eff6ff', color: '#1d4ed8' },
                    contacted: { bg: '#fefce8', color: '#854d0e' },
                    proposal_sent: { bg: '#f3e8ff', color: '#6b21a8' },
                    closed_won: { bg: '#f0fdf4', color: '#15803d' },
                    closed_lost: { bg: '#f1f5f9', color: '#475569' }
                  };
                  const sc = statusColors[enq.status] || statusColors.new;

                  return (
                    <tr key={enq.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{enq.company_name}</div>
                        {enq.preferred_placements && enq.preferred_placements.length > 0 && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem' }}>
                            {enq.preferred_placements.length} placement{enq.preferred_placements.length > 1 ? 's' : ''} requested
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <div style={{ color: '#334155', fontWeight: 600 }}>{enq.contact_name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{enq.email}</div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#475569', fontSize: '0.76rem' }}>
                        {enq.budget_range ? enq.budget_range.split(':')[0] : 'Standard Flight'}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '3px', backgroundColor: sc.bg, color: sc.color, fontWeight: 700, textTransform: 'uppercase' }}>
                          {enq.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', color: '#64748b', fontSize: '0.74rem' }}>
                        {new Date(enq.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                        <Link to="/admin/enquiries" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', textDecoration: 'none' }}>
                          Review Lead &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
