import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Users, Smartphone, Globe, Eye, 
  Calendar, MousePointer, ShieldCheck, CheckCircle2, 
  AlertCircle, ExternalLink, RefreshCw, Layers, PieChart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminApi from '../../services/adminApi';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAnalyticsOverview({ timeRange });
      setData(res.data || null);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const summary = data?.summary || {};
  const topStories = data?.topStories || [];
  const categories = data?.categoryDistribution || [];
  const referrers = data?.referringSources || [];
  const devices = data?.deviceBreakdown || [];
  const timeline = data?.trafficTimeline || [];
  const integrations = data?.integrationsStatus || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header and Date Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            First-Party Audience & Yield Intelligence
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Verified first-party readership analytics, bot-filtered telemetry, dwell attention, and commercial impression tracking.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1', padding: '0.2rem' }}>
            {[
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '90d', label: 'Last 90 Days' },
              { id: 'all', label: 'All Time' }
            ].map(range => (
              <button
                key={range.id}
                type="button"
                onClick={() => setTimeRange(range.id)}
                style={{
                  padding: '0.4rem 0.8rem',
                  border: 'none',
                  borderRadius: '3px',
                  backgroundColor: timeRange === range.id ? '#0f172a' : 'transparent',
                  color: timeRange === range.id ? '#ffffff' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              color: '#334155',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards: Honest First-Party Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Lifetime Article Reads</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {(summary.totalArticleViewsLifetime || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, marginTop: '0.25rem' }}>
            Cumulative article view telemetry
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Period Page Views</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {(summary.periodViews || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, marginTop: '0.25rem' }}>
            Filtered & debounced events ({timeRange})
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Unique Reader Sessions</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {(summary.uniqueSessions || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
            Privacy-conscious session tracking
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Commercial Delivery CTR</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {summary.averageCtr || '0.00%'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
            {(summary.recordedClicks || 0).toLocaleString('en-IN')} clicks / {(summary.deliveredImpressions || 0).toLocaleString('en-IN')} views
          </div>
        </div>
      </div>

      {/* Traffic Over Time Timeline */}
      <div style={{ backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Audience Traffic Flow Over Time
            </h3>
            <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Daily page views and reader sessions across the active time window
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.25rem 0.6rem', borderRadius: '4px' }}>
            {timeRange.toUpperCase()} Interval
          </span>
        </div>

        {timeline.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.84rem' }}>
            Telemetry gathering initiated. Daily trends will graph here as readers browse articles.
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '140px', paddingTop: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            {timeline.map((point, idx) => {
              const maxViews = Math.max(...timeline.map(t => t.views), 1);
              const heightPercent = Math.max(15, Math.round((point.views / maxViews) * 100));
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.2rem' }}>{point.views}</span>
                  <div 
                    style={{ 
                      width: '100%', 
                      maxWidth: '36px', 
                      height: `${heightPercent}%`, 
                      backgroundColor: '#2563eb', 
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease'
                    }} 
                    title={`${point.date}: ${point.views} views (${point.sessions} sessions)`}
                  />
                  <span style={{ fontSize: '0.62rem', color: '#64748b', marginTop: '0.4rem', whiteSpace: 'nowrap' }}>
                    {point.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2-Column: Popular Stories and Referral Sources */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Popular Stories */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={18} color="#2563eb" /> Most-Read Stories by Verified Reads
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Aggregated article engagement from the production dispatches database.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {topStories.slice(0, 6).map((art, idx) => (
              <div key={art.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.85rem', borderBottom: idx < 5 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b' }}>#{idx + 1}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: art.color_badge || '#2563eb', backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '2px' }}>
                      {art.category_name}
                    </span>
                  </div>
                  <a 
                    href={`/article/${art.slug}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', textDecoration: 'none', lineHeight: 1.35, display: 'block' }}
                  >
                    {art.title}
                  </a>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                    By {art.author_name} &bull; {art.reading_time_minutes}m read
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.92rem', color: '#2563eb' }}>
                    {(Number(art.view_count) || 0).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>verified reads</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referring Sources & Category Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Referring Sources */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Globe size={18} color="#059669" /> Top Referring Sources
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Inbound navigation channels and search discovery origins.
            </p>

            {referrers.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '1rem 0' }}>
                Direct and internal navigation currently dominating traffic.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {referrers.map((r, idx) => {
                  const totalRef = referrers.reduce((acc, curr) => acc + curr.count, 0) || 1;
                  const pct = Math.round((r.count / totalRef) * 100);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 700, color: '#334155' }}>{r.source}</span>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{r.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: idx === 0 ? '#059669' : '#3b82f6', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* External Integrations Status */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                Public Revenue & SEO Integrations
              </h3>
              <Link to="/admin/settings" style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                Configure in Settings &rarr;
              </Link>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1rem' }}>
              Status of verified external analytics, search console ownership, and monetization accounts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>GOOGLE ANALYTICS 4</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {integrations.googleAnalytics?.configured ? (
                    <>
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>Connected ({integrations.googleAnalytics.id})</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} color="#d97706" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#b45309' }}>Pending Measurement ID</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>SEARCH CONSOLE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {integrations.searchConsole?.configured ? (
                    <>
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>Verification Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} color="#d97706" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#b45309' }}>Pending Verification Meta</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>GOOGLE ADSENSE</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {integrations.adSense?.configured ? (
                    <>
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>Publisher ID Linked</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} color="#64748b" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Ready for Approval</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ padding: '0.75rem', borderRadius: '4px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>YOUTUBE CHANNEL</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {integrations.youtube?.configured ? (
                    <>
                      <CheckCircle2 size={14} color="#16a34a" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>Channel Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} color="#d97706" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#b45309' }}>Unconfigured</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Compliance & Privacy Footer Note */}
      <div style={{ padding: '1rem 1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#475569' }}>
        <ShieldCheck size={20} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong>Privacy-Preserving Telemetry Architecture:</strong> Reader IPs are salted and hashed cryptographically before storage; raw IP addresses are never recorded in database logs. A 15-minute debouncing window eliminates double-counting on frontend client rerenders. Fully compatible with India's DPDP Act 2023 and GDPR guidelines.
        </div>
      </div>

    </div>
  );
}
