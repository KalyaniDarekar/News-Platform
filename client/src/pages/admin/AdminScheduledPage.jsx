import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CalendarClock, Clock, AlertCircle, CheckCircle, Play, 
  RotateCcw, RefreshCw, Edit, ExternalLink, Calendar, AlertTriangle,
  Megaphone, Tag, Eye, ChevronRight, X, Sparkles, Filter, Search,
  Check, ArrowUpRight, ShieldCheck, Zap
} from 'lucide-react';
import adminApi from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';

export default function AdminScheduledPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canPublish = user?.role === 'super_admin' || user?.role === 'editor';

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'expiring_articles' | 'scheduled_articles' | 'expired_articles' | 'ads'
  const [scheduledArticles, setScheduledArticles] = useState([]);
  const [expiringArticles, setExpiringArticles] = useState([]);
  const [expiredArticles, setExpiredArticles] = useState([]);
  const [adCampaigns, setAdCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringCron, setTriggeringCron] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state for extending article expiry
  const [extendingArticle, setExtendingArticle] = useState(null);
  const [newExpiryInput, setNewExpiryInput] = useState('');
  const [savingExpiry, setSavingExpiry] = useState(false);

  // Format helper for date/time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Not set';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return 'Not set';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to calculate relative time remaining until expiry
  const getTimeRemaining = (expiryStr) => {
    if (!expiryStr) return null;
    const expiryTime = new Date(expiryStr).getTime();
    const now = Date.now();
    const diffMs = expiryTime - now;

    if (diffMs <= 0) {
      const pastMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
      if (pastMinutes < 60) return { isExpired: true, text: `Expired ${pastMinutes}m ago` };
      const pastHours = Math.floor(pastMinutes / 60);
      if (pastHours < 24) return { isExpired: true, text: `Expired ${pastHours}h ago` };
      const pastDays = Math.floor(pastHours / 24);
      return { isExpired: true, text: `Expired ${pastDays}d ago` };
    }

    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 60) {
      return { isExpired: false, isUrgent: true, text: `Expires in ${mins}m` };
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours < 24) {
      return { 
        isExpired: false, 
        isUrgent: hours < 4, 
        text: `Expires in ${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}` 
      };
    }
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return { 
      isExpired: false, 
      isUrgent: false, 
      text: `Expires in ${days}d ${remHours > 0 ? `${remHours}h` : ''}` 
    };
  };

  // Helper for Ad Campaign Flight status
  const getAdFlightStatus = (ad) => {
    const today = new Date().toISOString().slice(0, 10);
    const start = String(ad.start_date || '').slice(0, 10);
    const end = String(ad.end_date || '').slice(0, 10);

    if (!ad.is_active) {
      return { label: 'Paused / Inactive', color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' };
    }
    if (start && start > today) {
      return { label: `Scheduled (Launches ${formatDateOnly(start)})`, color: '#7e22ce', bg: '#f3e8ff', border: '#e9d5ff' };
    }
    if (end && end < today) {
      return { label: `Flight Expired (Ended ${formatDateOnly(end)})`, color: '#c2410c', bg: '#ffedd5', border: '#fed7aa' };
    }
    return { label: `Live Flight (Expires ${formatDateOnly(end)})`, color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' };
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Primary: Use dedicated backend endpoint if available
      try {
        const res = await adminApi.getScheduledAndExpiryOverview();
        if (res.data) {
          setScheduledArticles(res.data.scheduledArticles || []);
          setExpiringArticles(res.data.expiringArticles || []);
          setExpiredArticles(res.data.expiredArticles || []);
          setAdCampaigns(res.data.adCampaigns || []);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Dedicated endpoint unavailable, falling back to multi-service fetch:', err.message);
      }

      // Fallback: Multi-service fetch
      const [schedRes, expRes, pubRes, adsRes] = await Promise.all([
        adminApi.getArticles({ status: 'scheduled', limit: 50 }).catch(() => ({ data: [] })),
        adminApi.getArticles({ status: 'expired', limit: 50 }).catch(() => ({ data: [] })),
        adminApi.getArticles({ status: 'published', limit: 50 }).catch(() => ({ data: [] })),
        adminApi.getAdCampaigns({ limit: 100 }).catch(() => ({ data: [] }))
      ]);

      const allPublished = pubRes.data || [];
      const nowTime = Date.now();

      // Expiring: Published stories with future expiry
      const expiringList = allPublished.filter(a => a.expiry_time && new Date(a.expiry_time).getTime() > nowTime);
      
      // Expired: Explicit expired or passed expiry
      const explicitExpired = expRes.data || [];
      const passedPublished = allPublished.filter(a => a.expiry_time && new Date(a.expiry_time).getTime() <= nowTime);
      const combinedExpired = [...explicitExpired, ...passedPublished.filter(p => !explicitExpired.some(e => e.id === p.id))];

      setScheduledArticles(schedRes.data || []);
      setExpiringArticles(expiringList);
      setExpiredArticles(combinedExpired);
      setAdCampaigns(adsRes.data || []);
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
    setErrorMsg(null);
    try {
      const res = await adminApi.triggerCron();
      if (res.success || res.data) {
        const pubCount = res.data?.publishedCount ?? 0;
        const expCount = res.data?.expiredCount ?? 0;
        const adCount = res.data?.expiredAdsCount ?? 0;
        setFeedback(`✓ Cron processor executed! Auto-Published: ${pubCount} news dispatches, Auto-Expired: ${expCount} stories, Deactivated: ${adCount} expired ad flights.`);
        await fetchData();
      } else {
        throw new Error(res.error?.message || res.message || 'Cron execution failed');
      }
    } catch (err) {
      setErrorMsg(`Cron execution failed: ${err.message}`);
    } finally {
      setTriggeringCron(false);
    }
  };

  // Publish scheduled story immediately
  const handlePublishNow = async (id) => {
    if (!window.confirm('Bypass scheduled embargo and publish this article live to readers immediately?')) return;
    try {
      await adminApi.publishArticle(id);
      setFeedback(`✓ Story #${id} released live immediately!`);
      fetchData();
    } catch (err) {
      setErrorMsg(`Publish failed: ${err.message}`);
    }
  };

  // Expire an article immediately (retire from public)
  const handleExpireNow = async (id, title) => {
    if (!window.confirm(`Retire "${title || `Story #${id}`}" from the public site immediately?`)) return;
    try {
      await adminApi.expireArticleNow(id);
      setFeedback(`✓ Story #${id} has been retired from public view.`);
      fetchData();
    } catch (err) {
      setErrorMsg(`Failed to retire story: ${err.message}`);
    }
  };

  // Open modal to extend expiry
  const handleOpenExtendModal = (art) => {
    setExtendingArticle(art);
    if (art.expiry_time) {
      try {
        const d = new Date(art.expiry_time);
        const pad = (n) => String(n).padStart(2, '0');
        setNewExpiryInput(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
      } catch {
        setNewExpiryInput('');
      }
    } else {
      setNewExpiryInput('');
    }
  };

  const handleApplyPresetHours = (hours) => {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    const pad = (n) => String(n).padStart(2, '0');
    setNewExpiryInput(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
  };

  const handleSaveExtendExpiry = async (clearExpiry = false) => {
    if (!extendingArticle) return;
    setSavingExpiry(true);
    try {
      let expiryPayload = null;
      if (!clearExpiry) {
        if (!newExpiryInput) {
          alert('Please select an expiry date and time, or choose "Make Permanent".');
          setSavingExpiry(false);
          return;
        }
        expiryPayload = new Date(newExpiryInput).toISOString();
      }

      await adminApi.updateArticle(extendingArticle.id, {
        status: 'published',
        expiryTime: expiryPayload
      });

      setFeedback(clearExpiry 
        ? `✓ Story #${extendingArticle.id} set to permanent publication (no auto-expiry).` 
        : `✓ Expiry extended for Story #${extendingArticle.id} to ${formatDateTime(expiryPayload)}.`
      );
      setExtendingArticle(null);
      fetchData();
    } catch (err) {
      alert(`Failed to update expiry: ${err.message}`);
    } finally {
      setSavingExpiry(false);
    }
  };

  // Quick toggle ad status
  const handleToggleAd = async (id, currentActive) => {
    try {
      await adminApi.toggleAdCampaign(id, !currentActive);
      setFeedback(`✓ Ad campaign #${id} ${!currentActive ? 'activated' : 'paused'}.`);
      fetchData();
    } catch (err) {
      setErrorMsg(`Failed to update ad status: ${err.message}`);
    }
  };

  // Filtered counts
  const totalExpiring = expiringArticles.length;
  const totalScheduled = scheduledArticles.length;
  const totalExpired = expiredArticles.length;
  const totalAds = adCampaigns.length;

  // Filter queries by search term
  const filterBySearch = (items, fields) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();
    return items.filter(item => fields.some(f => String(item[f] || '').toLowerCase().includes(q)));
  };

  const filteredExpiring = filterBySearch(expiringArticles, ['title', 'category_name', 'author_name']);
  const filteredScheduled = filterBySearch(scheduledArticles, ['title', 'category_name', 'author_name']);
  const filteredExpired = filterBySearch(expiredArticles, ['title', 'category_name', 'author_name']);
  const filteredAds = filterBySearch(adCampaigns, ['title', 'client_name', 'placement_name', 'placement_code']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Schedule &amp; Expiry Management Desk
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Monitor embargoed news dispatches, track active auto-expiring stories, and manage commercial ad flight lifecycles.
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
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>

          <button
            onClick={handleTriggerCron}
            disabled={triggeringCron}
            title="Executes the newsroom automated lifecycle processor to publish scheduled stories and retire expired dispatches/ads"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#7e22ce',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.82rem',
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
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.85rem 1rem', borderRadius: '4px', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: '#15803d', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.85rem 1rem', borderRadius: '4px', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer', fontSize: '1rem' }}>&times;</button>
        </div>
      )}

      {/* KPI Overview Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {/* Expiring Stories KPI */}
        <div 
          onClick={() => setActiveTab('expiring_articles')}
          style={{
            backgroundColor: activeTab === 'expiring_articles' ? '#fff7ed' : '#ffffff',
            border: `1px solid ${activeTab === 'expiring_articles' ? '#ea580c' : '#e2e8f0'}`,
            padding: '1.25rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#ea580c', letterSpacing: '0.04em' }}>
              Expiring News Stories
            </span>
            <Clock size={16} color="#ea580c" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
            {totalExpiring}
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
            Active stories with auto-expiry timers
          </p>
        </div>

        {/* Scheduled Articles KPI */}
        <div 
          onClick={() => setActiveTab('scheduled_articles')}
          style={{
            backgroundColor: activeTab === 'scheduled_articles' ? '#faf5ff' : '#ffffff',
            border: `1px solid ${activeTab === 'scheduled_articles' ? '#9333ea' : '#e2e8f0'}`,
            padding: '1.25rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#9333ea', letterSpacing: '0.04em' }}>
              Scheduled Releases
            </span>
            <CalendarClock size={16} color="#9333ea" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
            {totalScheduled}
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
            Embargoed dispatches pending release
          </p>
        </div>

        {/* Expired Archive KPI */}
        <div 
          onClick={() => setActiveTab('expired_articles')}
          style={{
            backgroundColor: activeTab === 'expired_articles' ? '#f8fafc' : '#ffffff',
            border: `1px solid ${activeTab === 'expired_articles' ? '#475569' : '#e2e8f0'}`,
            padding: '1.25rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em' }}>
              Expired News Archive
            </span>
            <AlertTriangle size={16} color="#64748b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
            {totalExpired}
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
            Retired stories removed from public
          </p>
        </div>

        {/* Commercial Ads KPI */}
        <div 
          onClick={() => setActiveTab('ads')}
          style={{
            backgroundColor: activeTab === 'ads' ? '#eff6ff' : '#ffffff',
            border: `1px solid ${activeTab === 'ads' ? '#2563eb' : '#e2e8f0'}`,
            padding: '1.25rem',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.04em' }}>
              Commercial Ad Flights
            </span>
            <Megaphone size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
            {totalAds}
          </div>
          <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
            Sponsored flights &amp; placement lifecycles
          </p>
        </div>
      </div>

      {/* Navigation Tabs and Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '0.85rem 1.25rem',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Lifecycles', count: totalExpiring + totalScheduled + totalExpired + totalAds },
            { id: 'expiring_articles', label: 'Expiring News', count: totalExpiring, highlight: '#ea580c' },
            { id: 'scheduled_articles', label: 'Scheduled Releases', count: totalScheduled, highlight: '#9333ea' },
            { id: 'expired_articles', label: 'Expired News', count: totalExpired },
            { id: 'ads', label: 'Ad Campaigns', count: totalAds, highlight: '#2563eb' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                backgroundColor: activeTab === tab.id ? '#0f172a' : '#f8fafc',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#0f172a' : '#e2e8f0',
                padding: '0.4rem 0.85rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                color: activeTab === tab.id ? '#ffffff' : '#334155',
                padding: '0.1rem 0.4rem',
                borderRadius: '999px',
                fontSize: '0.7rem'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', maxWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search headline, sponsor, or desk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem'
              }}
            />
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '3.5rem', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem auto', color: '#94a3b8' }} />
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Loading newsroom schedule &amp; expiry records...</div>
        </div>
      ) : (
        <>
          {/* ==================================================================== */}
          {/* SECTION 1: Active News with Auto-Expiry (At What Time News Is Expiring) */}
          {/* ==================================================================== */}
          {(activeTab === 'all' || activeTab === 'expiring_articles') && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fffaf5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={18} color="#ea580c" />
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      Active News Stories with Auto-Expiry ({filteredExpiring.length})
                    </h2>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.1rem' }}>
                      Published news dispatches ticking down to automatic retirement from the live site.
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#ffedd5', color: '#c2410c', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                  ACTIVE TIMER
                </span>
              </div>

              {filteredExpiring.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No published news stories are currently set with an auto-expiry timer. Standard stories remain published indefinitely.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem 1.25rem' }}>Story Headline</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Published At</th>
                        <th style={{ padding: '0.75rem 1rem' }}>At What Time News Expires</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Time Remaining</th>
                        <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpiring.map((art) => {
                        const remaining = getTimeRemaining(art.expiry_time);
                        return (
                          <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.85rem 1.25rem', maxWidth: '300px' }}>
                              <Link to={`/admin/articles/${art.id}/edit`} style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
                                {art.title}
                              </Link>
                              {art.is_sponsored ? (
                                <span style={{ marginLeft: '0.4rem', fontSize: '0.68rem', backgroundColor: '#fefce8', color: '#854d0e', padding: '0.1rem 0.35rem', borderRadius: '3px', fontWeight: 700 }}>
                                  SPONSORED
                                </span>
                              ) : null}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                              {art.category_name || 'General'}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#64748b' }}>
                              {formatDateTime(art.publication_time || art.created_at)}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 700, color: '#c2410c', fontFamily: 'monospace', fontSize: '0.84rem' }}>
                                {formatDateTime(art.expiry_time)}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {remaining && (
                                <span style={{
                                  backgroundColor: remaining.isUrgent ? '#fee2e2' : '#ffedd5',
                                  color: remaining.isUrgent ? '#991b1b' : '#9a3412',
                                  border: `1px solid ${remaining.isUrgent ? '#fca5a5' : '#fed7aa'}`,
                                  padding: '0.2rem 0.55rem',
                                  borderRadius: '999px',
                                  fontSize: '0.72rem',
                                  fontWeight: 800
                                }}>
                                  {remaining.text}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenExtendModal(art)}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '3px',
                                    backgroundColor: '#eff6ff',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Extend Expiry
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleExpireNow(art.id, art.title)}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '3px',
                                    backgroundColor: '#fee2e2',
                                    color: '#b91c1c',
                                    border: '1px solid #fecaca',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                  title="Retire this story immediately"
                                >
                                  Expire Now
                                </button>
                                <Link
                                  to={`/admin/articles/${art.id}/edit`}
                                  style={{
                                    padding: '0.35rem 0.55rem',
                                    borderRadius: '3px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#334155',
                                    textDecoration: 'none',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                  }}
                                >
                                  Edit
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 2: Scheduled Embargoed Releases */}
          {/* ==================================================================== */}
          {(activeTab === 'all' || activeTab === 'scheduled_articles') && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#faf5ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CalendarClock size={18} color="#9333ea" />
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      Scheduled Embargoed Releases ({filteredScheduled.length})
                    </h2>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.1rem' }}>
                      Embargoed stories waiting for their scheduled publication date &amp; time to unlock live.
                    </p>
                  </div>
                </div>
                <Link to="/admin/articles/new" style={{ fontSize: '0.76rem', color: '#7e22ce', fontWeight: 700, textDecoration: 'none' }}>
                  + Schedule New Story
                </Link>
              </div>

              {filteredScheduled.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No scheduled or embargoed stories are currently pending release.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem 1.25rem' }}>Article Title</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Scheduled Release Time</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Post-Release Expiry</th>
                        <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScheduled.map((art) => (
                        <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1.25rem', maxWidth: '320px' }}>
                            <Link to={`/admin/articles/${art.id}/edit`} style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
                              {art.title}
                            </Link>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                            {art.category_name || 'General'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: '#7e22ce', fontFamily: 'monospace' }}>
                              {formatDateTime(art.scheduled_publication_time)}
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: art.expiry_time ? '#c2410c' : '#94a3b8' }}>
                            {art.expiry_time ? formatDateTime(art.expiry_time) : 'Permanent (No Expiry)'}
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              {canPublish && (
                                <button
                                  type="button"
                                  onClick={() => handlePublishNow(art.id)}
                                  style={{
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '3px',
                                    backgroundColor: '#dcfce7',
                                    color: '#15803d',
                                    border: '1px solid #bbf7d0',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                  title="Release live immediately"
                                >
                                  Release Now
                                </button>
                              )}
                              <Link
                                to={`/admin/articles/${art.id}/edit`}
                                style={{
                                  padding: '0.35rem 0.55rem',
                                  borderRadius: '3px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
                              >
                                Edit / Reschedule
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 3: Commercial Ad Campaigns (Schedule & Expiry) */}
          {/* ==================================================================== */}
          {(activeTab === 'all' || activeTab === 'ads') && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Megaphone size={18} color="#2563eb" />
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      Commercial Ad Campaigns &amp; Flight Expiry ({filteredAds.length})
                    </h2>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.1rem' }}>
                      Track start and end flight dates for header banners, marquee tickers, and sponsored brand posts.
                    </p>
                  </div>
                </div>
                <Link to="/admin/ads" style={{ fontSize: '0.76rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                  Open Ads Manager &rarr;
                </Link>
              </div>

              {filteredAds.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No commercial ad campaigns are currently booked in database. Book new campaigns or publish sponsored stories in the Ads Desk.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem 1.25rem' }}>Campaign &amp; Sponsor</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Placement Slot</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Flight Schedule</th>
                        <th style={{ padding: '0.75rem 1rem' }}>At What Date Ad Expires</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Flight Status</th>
                        <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAds.map((ad) => {
                        const statusBadge = getAdFlightStatus(ad);
                        return (
                          <tr key={ad.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.85rem 1.25rem', maxWidth: '280px' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                                {ad.title}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                                Sponsor: <strong style={{ color: '#1e293b' }}>{ad.client_name}</strong>
                                {ad.article_id ? ' • Sponsored Story' : ''}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.74rem', fontWeight: 600 }}>
                                {ad.placement_name || ad.placement_code}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.78rem', color: '#475569' }}>
                              {formatDateOnly(ad.start_date)} &rarr; {formatDateOnly(ad.end_date)}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                                {formatDateOnly(ad.end_date)}
                              </div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span style={{
                                backgroundColor: statusBadge.bg,
                                color: statusBadge.color,
                                border: `1px solid ${statusBadge.border}`,
                                padding: '0.2rem 0.55rem',
                                borderRadius: '999px',
                                fontSize: '0.72rem',
                                fontWeight: 800
                              }}>
                                {statusBadge.label}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleAd(ad.id, Boolean(ad.is_active))}
                                  style={{
                                    padding: '0.3rem 0.6rem',
                                    borderRadius: '3px',
                                    backgroundColor: ad.is_active ? '#fee2e2' : '#dcfce7',
                                    color: ad.is_active ? '#b91c1c' : '#15803d',
                                    border: 'none',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {ad.is_active ? 'Pause Flight' : 'Activate Flight'}
                                </button>
                                <Link
                                  to="/admin/ads"
                                  style={{
                                    padding: '0.3rem 0.55rem',
                                    borderRadius: '3px',
                                    backgroundColor: '#f1f5f9',
                                    color: '#334155',
                                    textDecoration: 'none',
                                    fontSize: '0.74rem',
                                    fontWeight: 600
                                  }}
                                >
                                  Manage
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================================================================== */}
          {/* SECTION 4: Expired Articles Archive */}
          {/* ==================================================================== */}
          {(activeTab === 'all' || activeTab === 'expired_articles') && (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="#ea580c" />
                  <div>
                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      Expired News Articles Archive ({filteredExpired.length})
                    </h2>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.1rem' }}>
                      Retired stories automatically or deliberately removed from public reader feeds.
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  RETIRED FROM LIVE SITE
                </span>
              </div>

              {filteredExpired.length === 0 ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No expired articles currently in database.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left', fontWeight: 700 }}>
                        <th style={{ padding: '0.75rem 1.25rem' }}>Article Title</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                        <th style={{ padding: '0.75rem 1rem' }}>At What Time It Expired</th>
                        <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpired.map((art) => (
                        <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, maxWidth: '340px' }}>
                            <Link to={`/admin/articles/${art.id}/edit`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                              {art.title}
                            </Link>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                            {art.category_name || 'General'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#c2410c', fontFamily: 'monospace', fontWeight: 700 }}>
                            {formatDateTime(art.expiry_time || art.updated_at)}
                          </td>
                          <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenExtendModal(art)}
                                style={{
                                  padding: '0.35rem 0.7rem',
                                  borderRadius: '3px',
                                  backgroundColor: '#ea580c',
                                  color: '#ffffff',
                                  border: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Republish / Extend
                              </button>
                              <Link
                                to={`/admin/articles/${art.id}/edit`}
                                style={{
                                  padding: '0.35rem 0.55rem',
                                  borderRadius: '3px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  textDecoration: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}
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
              )}
            </div>
          )}
        </>
      )}

      {/* ==================================================================== */}
      {/* EXTEND EXPIRY / REPUBLISH MODAL */}
      {/* ==================================================================== */}
      {extendingArticle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            maxWidth: '540px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase' }}>
                  Story Expiry Management
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                  {extendingArticle.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setExtendingArticle(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                &times;
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Choose a quick extension preset or enter a custom date/time. The article will remain live until the selected timestamp, after which the automated scheduler retires it.
            </div>

            {/* Quick Extension Presets */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.45rem' }}>
                Quick Extension Presets:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {[
                  { label: '+1 Hour', hours: 1 },
                  { label: '+6 Hours', hours: 6 },
                  { label: '+12 Hours', hours: 12 },
                  { label: '+24 Hours', hours: 24 },
                  { label: '+3 Days', hours: 72 },
                  { label: '+7 Days', hours: 168 }
                ].map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyPresetHours(p.hours)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '4px',
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#1e293b',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Expiry Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Exact Expiry Date &amp; Time (Local):
              </label>
              <input
                type="datetime-local"
                value={newExpiryInput}
                onChange={(e) => setNewExpiryInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button
                type="button"
                disabled={savingExpiry}
                onClick={() => handleSaveExtendExpiry(true)}
                style={{
                  padding: '0.55rem 0.85rem',
                  backgroundColor: '#f0fdf4',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Clears expiry date completely so story stays visible permanently"
              >
                Make Permanent (No Expiry)
              </button>

              <div style={{ display: 'flex', gap: '0.45rem' }}>
                <button
                  type="button"
                  onClick={() => setExtendingArticle(null)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingExpiry}
                  onClick={() => handleSaveExtendExpiry(false)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: savingExpiry ? 'not-allowed' : 'pointer'
                  }}
                >
                  {savingExpiry ? 'Saving...' : 'Save Expiry Schedule'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
