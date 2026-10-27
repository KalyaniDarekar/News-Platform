// ========================================================================
// Admin Scheduled & Expiry Management Desk
// Real-time control of scheduled releases, expiring articles, and automated trigger.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarClock, Clock, AlertCircle, CheckCircle, Play, 
  RotateCcw, RefreshCw, Edit, ExternalLink, Calendar, AlertTriangle
} from 'lucide-react';
import adminApi from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'
);

const API_BASE = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000/api' : 'https://api.jantajournal.in/api');

export default function AdminScheduledPage() {
  const { user } = useAuth();
  const canPublish = user?.role === 'super_admin' || user?.role === 'editor';

  const [scheduledArticles, setScheduledArticles] = useState([]);
  const [expiredArticles, setExpiredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [schedRes, expRes] = await Promise.all([
        adminApi.getArticles({ status: 'scheduled' }),
        adminApi.getArticles({ status: 'expired' })
      ]);

      if (schedRes.data) setScheduledArticles(schedRes.data);
      if (expRes.data) setExpiredArticles(expRes.data);
    } catch (err) {
      setErrorMsg(`Failed to load scheduled/expiry queue: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Trigger server-side cron processor immediately
  const handleTriggerCron = async () => {
    setTriggeringCron(true);
    setFeedback(null);
    try {
      const res = await fetch(`${API_BASE}/v1/articles/cron/publish`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setFeedback(`Cron processor executed! Published: ${data.data?.publishedCount || 0}, Expired: ${data.data?.expiredCount || 0}`);
        fetchData();
      } else {
        throw new Error(data.error?.message || 'Cron execution failed');
      }
    } catch (err) {
      setErrorMsg(`Cron trigger error: ${err.message}`);
    } finally {
      setTriggeringCron(false);
    }
  };

  const handlePublishNow = async (id) => {
    if (!window.confirm('Bypass schedule and publish this article immediately?')) return;
    try {
      await adminApi.publishArticle(id);
      setFeedback(`Article #${id} released live to readers!`);
      fetchData();
    } catch (err) {
      setErrorMsg(`Publish failed: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Scheduled Releases & Expiry Desk
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
            Automate embargoed investigative disclosures and time-based publication retirements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchData}
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
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>

          <button
            onClick={handleTriggerCron}
            disabled={triggeringCron}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#7e22ce',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: triggeringCron ? 'not-allowed' : 'pointer'
            }}
          >
            <Play size={14} /> {triggeringCron ? 'Running Processor...' : 'Trigger Cron Processor'}
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
          {feedback}
        </div>
      )}

      {/* Cron Info Callout */}
      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem 1.25rem', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Clock size={18} color="#2563eb" />
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e40af' }}>
              Automated Lifecycle Processor: <code>node server/cron/expiry-processor.js</code>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#3b82f6', marginTop: '0.15rem' }}>
              All database times stored in UTC. The cron evaluates <code>scheduled_publication_time &lt;= NOW()</code> and <code>expiry_time &lt;= NOW()</code>.
            </div>
          </div>
        </div>
        <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
          AUTOMATED &amp; AUDITED
        </span>
      </div>

      {/* SECTION 1: Scheduled Embargoes Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} color="#7e22ce" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Scheduled Publications ({scheduledArticles.length})
            </h2>
          </div>
          <Link to="/admin/articles/new" style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
            + Schedule New
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', fontSize: '0.85rem' }}>
            Loading scheduled releases...
          </div>
        ) : scheduledArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            No embargoed or scheduled releases currently pending in database.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Article Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Release Target</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Expiry Setting</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scheduledArticles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, maxWidth: '320px' }}>
                      <Link to={`/admin/articles/${art.id}/edit`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                        {art.title}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                      {art.category_name || 'General'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#7e22ce', fontWeight: 700 }}>
                      {art.scheduled_publication_time ? new Date(art.scheduled_publication_time).toLocaleString() : 'Not set'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', color: art.expiry_time ? '#c2410c' : '#94a3b8' }}>
                      {art.expiry_time ? new Date(art.expiry_time).toLocaleString() : 'No expiry'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <Link
                          to={`/admin/articles/${art.id}/edit`}
                          style={{ padding: '0.3rem 0.5rem', borderRadius: '3px', backgroundColor: '#f1f5f9', color: '#334155', textDecoration: 'none', fontSize: '0.75rem' }}
                        >
                          Edit
                        </Link>
                        {canPublish && (
                          <button
                            onClick={() => handlePublishNow(art.id)}
                            style={{ padding: '0.3rem 0.6rem', borderRadius: '3px', backgroundColor: '#dcfce7', color: '#15803d', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            Release Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: Expired Articles Queue */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} color="#ea580c" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
              Expired Articles Archive ({expiredArticles.length})
            </h2>
          </div>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            Retired from public reader views
          </span>
        </div>

        {expiredArticles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            No expired articles currently in database.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Article Title</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Expired At</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expiredArticles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, maxWidth: '340px' }}>
                      <Link to={`/admin/articles/${art.id}/edit`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                        {art.title}
                      </Link>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>
                      {art.category_name || 'General'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#c2410c', fontFamily: 'monospace', fontWeight: 600 }}>
                      {art.expiry_time ? new Date(art.expiry_time).toLocaleString() : 'Expired'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <Link
                        to={`/admin/articles/${art.id}/edit`}
                        style={{ padding: '0.3rem 0.65rem', borderRadius: '3px', backgroundColor: '#ea580c', color: '#ffffff', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Republish / Extend
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
