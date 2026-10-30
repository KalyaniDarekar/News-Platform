import React, { useState, useEffect } from 'react';
import { 
  Megaphone, PlusCircle, ToggleLeft, ToggleRight, ExternalLink, 
  TrendingUp, Eye, MousePointer, Calendar, Sparkles, AlertCircle, 
  ShieldAlert, Edit3, Trash2, CheckCircle, RefreshCw, X, Image as ImageIcon,
  Code, Clock, Layers, Database, Check
} from 'lucide-react';
import adminApi from '../../services/adminApi';
import { getMediaUrl } from '../../services/api';

const DEFAULT_AD_PLACEMENTS = [

  { id: 1, placement_code: 'header_leaderboard', name: 'Header Super Leaderboard', dimensions: '970x90' },
  { id: 2, placement_code: 'marquee_top', name: 'Top Marquee Ad (Below Day/Date)', dimensions: 'Single Line Marquee' },
  { id: 3, placement_code: 'marquee_breaking', name: 'Breaking Marquee Ad (Below Breaking News)', dimensions: 'Single Line Marquee' },
  { id: 4, placement_code: 'marquee_both', name: 'Marquee Ad (Both Top & Breaking)', dimensions: 'Single Line Marquee' },
  { id: 5, placement_code: 'homepage_hero_adjacent', name: 'Homepage Hero-Adjacent Half-Page / Display', dimensions: '300x600' },
  { id: 6, placement_code: 'homepage_mid_billboard', name: 'Homepage Mid-Section Billboard', dimensions: '970x120' },
  { id: 7, placement_code: 'article_inline', name: 'In-Article Inline Native Leaderboard', dimensions: '728x90' },
  { id: 8, placement_code: 'article_sidebar_top', name: 'Article Sidebar Top Medium Rectangle', dimensions: '300x250' },
  { id: 9, placement_code: 'category_page_banner', name: 'Category Page Header Billboard', dimensions: '728x90' },
  { id: 10, placement_code: 'footer_banner', name: 'Global Footer Super Leaderboard', dimensions: '970x90' },
  { id: 11, placement_code: 'mobile_anchor_banner', name: 'Responsive Mobile Sticky Anchor Banner', dimensions: '320x50' }
];










export default function AdminAdsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [placements, setPlacements] = useState(DEFAULT_AD_PLACEMENTS);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns'); // 'campaigns' | 'placements'

  // Marquee Tickers Live Settings
  const [marqueeTopEnabled, setMarqueeTopEnabled] = useState(true);
  const [marqueeBreakingEnabled, setMarqueeBreakingEnabled] = useState(true);
  const [updatingSetting, setUpdatingSetting] = useState(false);
  const [syncingDb, setSyncingDb] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [previewAd, setPreviewAd] = useState(null);

  const availablePlacements = placements && placements.length > 0 ? placements : DEFAULT_AD_PLACEMENTS;

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    placementId: 1,
    adType: 'image',
    bannerImageUrl: '',
    adCode: '',
    targetUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    priority: 5,
    isActive: true
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCampaignsAndPlacements = async () => {
    setLoading(true);
    try {
      const [cRes, pRes, sRes] = await Promise.allSettled([
        adminApi.getAdCampaigns(),
        adminApi.getAdPlacements(),
        adminApi.getSettings()
      ]);

      if (cRes.status === 'fulfilled' && cRes.value) {
        const cData = cRes.value.data;
        const list = Array.isArray(cData) ? cData : (cData?.campaigns || cData?.data || []);
        setCampaigns(list);
      } else if (cRes.status === 'rejected') {
        console.warn('Could not fetch ad campaigns:', cRes.reason);
      }

      if (pRes.status === 'fulfilled' && pRes.value) {
        const pData = pRes.value.data;
        const list = Array.isArray(pData) ? pData : (pData?.placements || pData?.data || []);
        if (list.length > 0) {
          setPlacements(list);
        }
      } else if (pRes.status === 'rejected') {
        console.warn('Could not fetch ad placements, using default placement catalog:', pRes.reason);
      }

      if (sRes.status === 'fulfilled' && sRes.value) {
        const sData = sRes.value.data?.settings || sRes.value.data || {};
        if (sData.ad_marquee_top_enabled !== undefined) {
          setMarqueeTopEnabled(sData.ad_marquee_top_enabled === '1' || sData.ad_marquee_top_enabled === 1 || sData.ad_marquee_top_enabled === true || sData.ad_marquee_top_enabled === 'true');
        }
        if (sData.ad_marquee_breaking_enabled !== undefined) {
          setMarqueeBreakingEnabled(sData.ad_marquee_breaking_enabled === '1' || sData.ad_marquee_breaking_enabled === 1 || sData.ad_marquee_breaking_enabled === true || sData.ad_marquee_breaking_enabled === 'true');
        }
      }

      if (availablePlacements.length > 0 && !formData.placementId) {
        setFormData(prev => ({ ...prev, placementId: availablePlacements[0].id }));
      }
    } catch (err) {
      console.error('Failed to load campaigns or placements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignsAndPlacements();
  }, []);

  // Marquee and DB handlers



  const handleToggleMarqueeSetting = async (key, currentVal) => {
    setUpdatingSetting(true);
    const newVal = !currentVal;
    try {
      await adminApi.updateSetting(key, newVal ? '1' : '0');
      if (key === 'ad_marquee_top_enabled') setMarqueeTopEnabled(newVal);
      if (key === 'ad_marquee_breaking_enabled') setMarqueeBreakingEnabled(newVal);
    } catch (err) {
      alert(`Could not update marquee setting: ${err.message}`);
    } finally {
      setUpdatingSetting(false);
    }
  };

  const handleSyncDatabase = async () => {
    setSyncingDb(true);
    setSyncMessage('');
    try {
      const res = await adminApi.syncDatabase();
      setSyncMessage(res.message || 'Database schema, placements, and CRM tables verified successfully!');
      setTimeout(() => setSyncMessage(''), 5000);
      await fetchCampaignsAndPlacements();
    } catch (err) {
      alert(`Database sync failed: ${err.message}`);
    } finally {
      setSyncingDb(false);
    }
  };


  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormError('');
    const defaultId = availablePlacements[0]?.id || 1;
    setFormData({
      title: '',
      clientName: '',
      placementId: defaultId,
      adType: 'image',
      bannerImageUrl: '',
      adCode: '',
      targetUrl: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      priority: 5,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (camp) => {
    setIsEditing(true);
    setCurrentId(camp.id);
    setFormError('');
    setFormData({
      title: camp.title || '',
      clientName: camp.client_name || '',
      placementId: camp.placement_id || (availablePlacements[0]?.id || 1),
      adType: camp.ad_type || 'image',
      bannerImageUrl: camp.banner_image_url || '',
      adCode: camp.ad_code || '',
      targetUrl: camp.target_url || '',
      startDate: camp.start_date ? camp.start_date.split('T')[0] : '',
      endDate: camp.end_date ? camp.end_date.split('T')[0] : '',
      priority: camp.priority !== undefined ? camp.priority : 5,
      isActive: Boolean(camp.is_active)
    });
    setIsModalOpen(true);
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    try {
      if (!formData.title || !formData.clientName) {
        throw new Error('Campaign title and client name are required.');
      }
      if (formData.adType === 'image' && !formData.bannerImageUrl) {
        throw new Error('Banner Image Creative URL is required for image ads.');
      }
      if (formData.adType === 'code' && (!formData.adCode || !formData.adCode.trim())) {
        throw new Error('Approved Ad Code snippet is required for code ads.');
      }
      if (formData.adType === 'text' && !formData.title.trim()) {
        throw new Error('Campaign headline text is required for text/marquee campaigns.');
      }

      if (isEditing && currentId) {
        await adminApi.updateAdCampaign(currentId, formData);
      } else {
        await adminApi.createAdCampaign(formData);
      }

      setIsModalOpen(false);
      fetchCampaignsAndPlacements();
  


    } catch (err) {
      setFormError(err.message || 'Failed to save advertisement campaign.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await adminApi.toggleAdCampaign(id, !currentStatus);
      setCampaigns(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentStatus ? 1 : 0 } : c));
    } catch (err) {
      alert(`Toggle failed: ${err.message}`);
    }
  };

  const handleDeleteCampaign = async (id, title) => {
    if (!window.confirm(`Permanently delete campaign "${title}"?`)) return;
    try {
      await adminApi.deleteAdCampaign(id);
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Metrics summary based on real stored records
  const totalImpressions = campaigns.reduce((acc, c) => acc + (Number(c.impressions_count) || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (Number(c.clicks_count) || 0), 0);
  const platformCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
  const activeCount = campaigns.filter(c => c.is_active).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const activeMarqueeTopAds = campaigns.filter(c => {
    const isAct = Boolean(c.is_active);
    const code = c.placement_code || '';
    const isMarquee = ['marquee_top', 'marquee_both', 'marquee_all'].includes(code);
    const isDateValid = (!c.start_date || c.start_date.split('T')[0] <= todayStr) &&
                        (!c.end_date || c.end_date.split('T')[0] >= todayStr);
    return isAct && isMarquee && isDateValid;
  });

  const activeMarqueeBreakingAds = campaigns.filter(c => {
    const isAct = Boolean(c.is_active);
    const code = c.placement_code || '';
    const isMarquee = ['marquee_breaking', 'marquee_both', 'marquee_all'].includes(code);
    const isDateValid = (!c.start_date || c.start_date.split('T')[0] <= todayStr) &&
                        (!c.end_date || c.end_date.split('T')[0] >= todayStr);
    return isAct && isMarquee && isDateValid;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Commercial Advertising & Inventory Operations
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Configure multi-slot advertising inventory, direct sponsor campaigns, priority scheduling, and approved ad code snippets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={fetchCampaignsAndPlacements}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.55rem 0.9rem',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> Refresh
          </button>

          <button
            type="button"
            onClick={handleSyncDatabase}
            disabled={syncingDb}
            title="Verifies and creates missing MySQL tables and placement slots on cPanel hosting"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#1e3a8a',
              padding: '0.55rem 0.9rem',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: syncingDb ? 'not-allowed' : 'pointer'
            }}
          >
            <Database size={14} />
            {syncingDb ? 'Syncing...' : 'Verify & Sync DB'}
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.55rem 1rem',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37,99,235,0.25)'
            }}
          >
            <PlusCircle size={15} /> Book Sponsor Campaign
          </button>
        </div>
      </div>


      {syncMessage && (
        <div style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          borderRadius: '6px',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={18} color="#2563eb" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Single-Line Marquee Ad Tickers (Live Website Display Control) */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} color="#d97706" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Single-Line Scrolling Marquee Ad Tickers (Live Display Controls)
              </h2>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem', margin: 0 }}>
              Master visibility toggles for the real-time scrolling sponsor banners.
              <strong> Visibility rule:</strong> A marquee bar is <em>only</em> displayed on the website when its toggle is turned ON <strong>and</strong> active/unexpired sponsor ads are published for that slot. If OFF or if 0 ads exist, the bar remains completely hidden.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {/* Top Marquee (Below Day/Date) */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '1rem 1.15rem',
            backgroundColor: marqueeTopEnabled ? '#f8fafc' : '#fcfcfc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Position 1 &bull; Header Placement
                </span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0 0 0' }}>
                  Top Day/Date Marquee Ad Ticker
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleToggleMarqueeSetting('ad_marquee_top_enabled', marqueeTopEnabled)}
                disabled={updatingSetting}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: updatingSetting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '20px',
                  backgroundColor: marqueeTopEnabled ? '#dbeafe' : '#f1f5f9',
                  color: marqueeTopEnabled ? '#1e40af' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  transition: 'all 150ms ease'
                }}
                title={marqueeTopEnabled ? 'Click to turn OFF' : 'Click to turn ON'}
              >
                {marqueeTopEnabled ? <ToggleRight size={22} color="#2563eb" /> : <ToggleLeft size={22} color="#94a3b8" />}
                <span>{marqueeTopEnabled ? 'Turned ON' : 'Turned OFF'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
              Renders directly below the Day/Date Top Info Bar at the very top of all editorial pages.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid #e2e8f0', fontSize: '0.74rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Active Ad Count: </span>
                <strong style={{ color: activeMarqueeTopAds.length > 0 ? '#16a34a' : '#d97706' }}>
                  {activeMarqueeTopAds.length} active ads
                </strong>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}> (slot: marquee_top)</span>
              </div>

              {/* Live Status Pill */}
              {marqueeTopEnabled && activeMarqueeTopAds.length > 0 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
                  <Check size={12} /> Live & Visible on Website
                </span>
              ) : marqueeTopEnabled && activeMarqueeTopAds.length === 0 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
                  <AlertCircle size={12} /> ON, but Hidden (0 active ads)
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
                  Turned OFF (Hidden)
                </span>
              )}
            </div>
          </div>

          {/* Breaking News Marquee (Below Breaking News Ticker) */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '1rem 1.15rem',
            backgroundColor: marqueeBreakingEnabled ? '#f8fafc' : '#fcfcfc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Position 2 &bull; Editorial Ticker Placement
                </span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: '0.15rem 0 0 0' }}>
                  Breaking News Marquee Ad Ticker
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleToggleMarqueeSetting('ad_marquee_breaking_enabled', marqueeBreakingEnabled)}
                disabled={updatingSetting}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: updatingSetting ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '20px',
                  backgroundColor: marqueeBreakingEnabled ? '#dbeafe' : '#f1f5f9',
                  color: marqueeBreakingEnabled ? '#1e40af' : '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  transition: 'all 150ms ease'
                }}
                title={marqueeBreakingEnabled ? 'Click to turn OFF' : 'Click to turn ON'}
              >
                {marqueeBreakingEnabled ? <ToggleRight size={22} color="#2563eb" /> : <ToggleLeft size={22} color="#94a3b8" />}
                <span>{marqueeBreakingEnabled ? 'Turned ON' : 'Turned OFF'}</span>
              </button>
            </div>

            <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>
              Renders directly below the Breaking News Ticker section with high reader engagement.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.65rem', borderTop: '1px solid #e2e8f0', fontSize: '0.74rem' }}>
              <div>
                <span style={{ color: '#64748b' }}>Active Ad Count: </span>
                <strong style={{ color: activeMarqueeBreakingAds.length > 0 ? '#16a34a' : '#d97706' }}>
                  {activeMarqueeBreakingAds.length} active ads
                </strong>
                <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}> (slot: marquee_breaking)</span>
              </div>

              {/* Live Status Pill */}
              {marqueeBreakingEnabled && activeMarqueeBreakingAds.length > 0 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
                  <Check size={12} /> Live & Visible on Website
                </span>
              ) : marqueeBreakingEnabled && activeMarqueeBreakingAds.length === 0 ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
                  <AlertCircle size={12} /> ON, but Hidden (0 active ads)
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#f1f5f9', color: '#64748b', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
                  Turned OFF (Hidden)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verified First-Party Inventory Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active Flights</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {activeCount} <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748b' }}>/ {campaigns.length} total</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 600, marginTop: '0.25rem' }}>
            {availablePlacements.length} configured placement slots
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Delivered Impressions</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {totalImpressions.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
            Verified first-party viewable telemetry
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Recorded Clicks</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {totalClicks.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, marginTop: '0.25rem' }}>
            Audited reader click-through actions
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Average Platform CTR</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {platformCtr}%
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
            Direct brand campaigns average
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('campaigns')}
          style={{
            padding: '0.75rem 1rem',
            border: 'none',
            borderBottom: activeTab === 'campaigns' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'campaigns' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            fontSize: '0.86rem',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
        >
          Booked Campaigns ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('placements')}
          style={{
            padding: '0.75rem 1rem',
            border: 'none',
            borderBottom: activeTab === 'placements' ? '2px solid #2563eb' : '2px solid transparent',
            color: activeTab === 'placements' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            fontSize: '0.86rem',
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
        >
          Inventory Placement Slots ({availablePlacements.length})
        </button>
      </div>

      {/* Tab 1: Booked Campaigns Table */}
      {activeTab === 'campaigns' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Megaphone size={36} style={{ margin: '0 auto 0.75rem auto', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No Active Campaigns Booked</h3>
              <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Click "Book Sponsor Campaign" above to schedule a new campaign.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Campaign & Sponsor</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Placement Slot</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Format</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Flight Dates</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Impressions</th>
                    <th style={{ padding: '0.85rem 1rem' }}>CTR</th>
                    <th style={{ padding: '0.85rem 1rem' }}>State</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((camp) => (
                    <tr key={camp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{camp.title}</span>
                          {camp.article_id && (
                            <span style={{
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '0.1rem 0.45rem',
                              borderRadius: '3px',
                              letterSpacing: '0.04em'
                            }}>
                              SPONSORED STORY
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span>Sponsor: <strong>{camp.client_name}</strong></span>
                          {camp.target_url && (
                            <a
                              href={camp.target_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <span>View Linked Destination</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{camp.placement_name || camp.placement_code}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>{camp.dimensions}</div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          backgroundColor: camp.ad_type === 'code' ? '#f5f3ff' : '#eff6ff',
                          color: camp.ad_type === 'code' ? '#7c3aed' : '#2563eb',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '3px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {camp.ad_type === 'code' ? <Code size={12} /> : <ImageIcon size={12} />}
                          {camp.ad_type || 'image'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1rem', fontSize: '0.76rem', color: '#64748b' }}>
                        <div>From: {camp.start_date ? camp.start_date.split('T')[0] : 'Open'}</div>
                        <div>To: {camp.end_date ? camp.end_date.split('T')[0] : 'Indefinite'}</div>
                      </td>

                      <td style={{ padding: '1rem 1rem', fontWeight: 700, color: '#334155' }}>
                        P-{camp.priority || 5}
                      </td>

                      <td style={{ padding: '1rem 1rem', fontFamily: 'monospace', fontWeight: 600 }}>
                        {(Number(camp.impressions_count) || 0).toLocaleString('en-IN')}
                      </td>

                      <td style={{ padding: '1rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: '#16a34a' }}>
                        {camp.ctr_percentage || '0.00'}%
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(camp.id, Boolean(camp.is_active))}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: camp.is_active ? '#dcfce7' : '#f1f5f9',
                            color: camp.is_active ? '#15803d' : '#64748b',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {camp.is_active ? 'Active' : 'Paused'}
                        </button>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => setPreviewAd(camp)}
                            style={{
                              padding: '0.35rem 0.55rem',
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              borderRadius: '3px',
                              border: 'none',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                            title="Preview Creative"
                          >
                            <Eye size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(camp)}
                            style={{
                              padding: '0.35rem 0.55rem',
                              backgroundColor: '#f0f9ff',
                              color: '#0284c7',
                              borderRadius: '3px',
                              border: 'none',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                            title="Edit Campaign"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                            style={{
                              padding: '0.35rem 0.55rem',
                              backgroundColor: '#fee2e2',
                              color: '#b91c1c',
                              borderRadius: '3px',
                              border: 'none',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                            title="Delete Campaign"
                          >
                            <Trash2 size={13} />
                          </button>
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

      {/* Tab 2: Inventory Placement Slots */}
      {activeTab === 'placements' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {availablePlacements.map((p) => {
            const activeCampaign = campaigns.find(c => c.placement_id === p.id && c.is_active);
            return (
              <div 
                key={p.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.5rem',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700, fontFamily: 'monospace' }}>
                      {p.placement_code}
                    </span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>
                      {p.name}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    backgroundColor: '#f1f5f9',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '3px'
                  }}>
                    {p.dimensions}
                  </span>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>CURRENT FLIGHT SPONSOR:</div>
                  {activeCampaign ? (
                    <div style={{ marginTop: '0.35rem' }}>
                      <strong style={{ color: '#0f172a', fontSize: '0.88rem' }}>{activeCampaign.client_name}</strong>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>"{activeCampaign.title}"</div>
                      <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, marginTop: '0.25rem' }}>
                        Active &bull; {Number(activeCampaign.impressions_count).toLocaleString('en-IN')} impressions delivered
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Unbooked / Available for direct advertiser flight
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book / Edit Campaign Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15,23,42,0.6)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {isEditing ? 'Edit Sponsor Campaign' : 'Book Commercial Sponsor Campaign'}
                </h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Configure creative parameters, target destination, priority weighting, and flight schedule.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {formError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveCampaign} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {/* Campaign Title & Client */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. India Global Tech Summit 2026"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Sponsor / Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="e.g. Confederation of Indian Industry"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* Placement & Ad Type */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Inventory Placement Slot *
                  </label>
                  <select
                    value={formData.placementId || (availablePlacements[0]?.id || 1)}
                    onChange={(e) => setFormData({ ...formData, placementId: parseInt(e.target.value, 10) })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    {availablePlacements.map(p => (
                      <option key={p.id} value={p.id} style={{ color: '#0f172a', backgroundColor: '#ffffff' }}>
                        {p.name} ({p.dimensions})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Creative Delivery Type *
                  </label>
                  <select
                    value={formData.adType}
                    onChange={(e) => setFormData({ ...formData, adType: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  >
                    <option value="image">Direct Creative Image (JPG / PNG / WebP)</option>
                    <option value="text">Sponsored Headline / Text Ad (Single-Line Marquee & Native)</option>
                    <option value="code">Approved Ad Code (Google AdSense / HTML Tag)</option>
                  </select>
                </div>
              </div>

              {/* Image creative vs Text creative vs Code creative */}
              {formData.adType === 'image' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Banner Image Creative URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.bannerImageUrl}
                      onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                    {formData.bannerImageUrl && (
                      <div style={{ marginTop: '0.5rem', maxHeight: '120px', overflow: 'hidden', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                        <img src={getMediaUrl(formData.bannerImageUrl)} alt="Creative Preview" style={{ width: '100%', height: 'auto', display: 'block' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                  </div>


                </>
              )}

              {formData.adType === 'text' && (
                <>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', fontSize: '0.8rem', color: '#166534' }}>
                    <strong>Marquee / Text Ad Display:</strong> The <strong>Campaign Name</strong> entered above will be displayed directly as the prominent scrolling headline text in the Marquee bar alongside <strong>[{formData.clientName || 'Sponsor Name'}]</strong>.
                  </div>



                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Optional Brand Logo / Thumbnail Creative URL
                    </label>
                    <input
                      type="url"
                      value={formData.bannerImageUrl}
                      onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                      placeholder="https://example.com/logo-small.png"
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                    />
                  </div>
                </>
              )}

              {formData.adType === 'code' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                      Approved Partner Ad Code Snippet *
                    </label>
                    <span style={{ fontSize: '0.68rem', color: '#b45309', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldAlert size={12} /> Restricted to Super Admin / Ad Manager
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={formData.adCode}
                    onChange={(e) => setFormData({ ...formData, adCode: e.target.value })}
                    placeholder={`<!-- Google AdSense or Approved Programmatic Unit -->\n<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"\n     data-ad-slot="1234567890"></ins>`}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontFamily: 'monospace' }}
                  />
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Note: Untrusted scripts are sandboxed. Do not include unapproved tracker scripts.
                  </div>
                </div>
              )}

              {/* Dates & Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Flight Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Flight End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                    Priority Weight (0-10)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="isActiveToggle" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
                  Enable campaign for active delivery immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: '#f1f5f9',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.6rem 1.4rem',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Saving Flight...' : (isEditing ? 'Update Campaign' : 'Confirm Campaign Booking')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Visual Creative Preview Modal */}
      {previewAd && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15,23,42,0.6)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            maxWidth: '820px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                  Creative Preview: {previewAd.title}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Placement: {previewAd.placement_name} ({previewAd.dimensions})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAd(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', color: '#64748b', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '160px' }}>
              {previewAd.ad_type === 'image' && previewAd.banner_image_url ? (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <img src={getMediaUrl(previewAd.banner_image_url)} alt={previewAd.title} style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '2px', border: '1px solid #cbd5e1' }} />
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: '#475569' }}>
                    Destination: <a href={previewAd.target_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>{previewAd.target_url}</a>
                  </div>
                </div>
              ) : previewAd.ad_type === 'code' ? (
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>Ad Code Output:</div>
                  <pre style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '4px', fontSize: '0.76rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                    {previewAd.ad_code || '<!-- Empty Ad Code -->'}
                  </pre>
                </div>
              ) : (
                <div style={{ color: '#64748b', fontSize: '0.84rem' }}>No visual creative uploaded.</div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={() => setPreviewAd(null)}
                style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
