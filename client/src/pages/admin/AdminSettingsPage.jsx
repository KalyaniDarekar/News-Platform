import React, { useState, useEffect } from 'react';
import {
  Settings, DollarSign, BarChart3, Video, ShieldCheck,
  Save, Check, AlertCircle, RefreshCw, ExternalLink, Info, Lock
} from 'lucide-react';
import adminApi from '../../services/adminApi';
import apiService from '../../services/api';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Settings state dictionary
  const [settings, setSettings] = useState({
    // Revenue & Monetization
    adsense_publisher_id: '',
    adsense_auto_ads_enabled: 'false',
    advertising_contact_email: 'advertising@jantajournal.in',
    advertising_phone: '+91 (011) 4567-8900',
    media_kit_url: '/media-kit-2026.pdf',

    // External Analytics & Verification
    ga4_measurement_id: '',
    google_search_console_meta: '',

    // YouTube Integration
    youtube_channel_url: 'https://www.youtube.com/@TheBharatChronicle',
    youtube_channel_id: 'UC_bharatchronicle_official',

    // Privacy & DPDP Compliance
    dpdp_compliance_mode: 'strict',
    pci_registration_number: 'REG-BC-2026-DEL-0941',
    editorial_grievance_email: 'grievance@bharatchronicle.com',

    // Masthead & Identity
    site_name: 'The Bharat Chronicle',
    site_tagline: 'Independent National Daily of Record',
    site_motto: 'Veritas et Libertas • Est. 1928',
    editorial_email: 'editorial@bharatchronicle.com'
  });

  const [dbStatus, setDbStatus] = useState(null);
  const [checkingDb, setCheckingDb] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getSettings();
      if (res && res.data) {
        setSettings(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.warn('Could not load live settings, using current defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkDb = async () => {
    setCheckingDb(true);
    try {
      const health = await apiService.checkBackendHealth();
      setDbStatus(health);
    } catch {
      setDbStatus({ status: 'offline' });
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    checkDb();
  }, []);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateSettingsBatch(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to persist settings to server:', err);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    // { id: 'revenue', label: 'Ad Monetization & Direct Sales', icon: DollarSign },
    // { id: 'analytics', label: 'GA4 & Search Console', icon: BarChart3 },
    { id: 'identity', label: 'Masthead & Legal Identity', icon: Settings },
    { id: 'youtube', label: 'YouTube News Broadcast', icon: Video },
    { id: 'privacy', label: 'DPDP Privacy & Compliance', icon: ShieldCheck },

  ];

  return (
    <div style={{ maxWidth: '960px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2563eb' }}>
              Commercial & Revenue Infrastructure
            </span>
            <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '0.66rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '3px' }}>
              Active
            </span>
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Platform Revenue & Integration Settings
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.25rem' }}>
            Configure advertising networks, Google Analytics 4, Search Console ownership, and DPDP consent controls without exposing server secrets.
          </p>
        </div>

        <button
          onClick={checkDb}
          disabled={checkingDb}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.45rem 0.85rem',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '4px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} className={checkingDb ? 'animate-spin' : ''} />
          {dbStatus?.status === 'online' ? 'Backend Online (Port 5000)' : 'Check Backend Health'}
        </button>
      </div>

      {/* Security Isolation Notice */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderLeft: '4px solid #2563eb',
        padding: '0.9rem 1.25rem',
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <Lock size={16} color="#2563eb" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
          <strong>Zero Secrets Exposure Architecture:</strong> The fields configured below are strictly public client identifiers (e.g. AdSense Publisher ID, GA4 Measurement ID, Search Console meta tokens). Private keys, database credentials, and session tokens remain strictly secured inside server environment variables.
        </div>
      </div>

      {savedSuccess && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '0.85rem 1.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.86rem', fontWeight: 700 }}>
          <Check size={18} /> Platform integration settings updated and published to active nodes.
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.25rem', overflowX: 'auto' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '4px 4px 0 0',
                border: 'none',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                backgroundColor: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 120ms ease'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Form Container */}
      <form onSubmit={handleSave} style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>

        {/* ================= TAB 1: REVENUE & ADSENSE 
        {activeTab === 'revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Google AdSense & Commercial Advertising Desk
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Connect third-party ad providers once approved, or operate direct sponsor campaigns through the built-in ad server.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Google AdSense Publisher ID
                </label>
                <input
                  type="text"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  value={settings.adsense_publisher_id || ''}
                  onChange={(e) => handleChange('adsense_publisher_id', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Leave blank until the site receives official AdSense account approval.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  AdSense Auto-Ads Injection
                </label>
                <select
                  value={settings.adsense_auto_ads_enabled || 'false'}
                  onChange={(e) => handleChange('adsense_auto_ads_enabled', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff' }}
                >
                  <option value="false">Disabled (Recommended for Clean Editorial Layout)</option>
                  <option value="true">Enabled (Automated In-Feed / Anchor Injections)</option>
                </select>
                <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  When disabled, only configured ad slots (7 placements) will display inventory.
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem', paddingTop: '0.5rem', borderTop: '1px solid #f8fafc' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Direct Advertising Desk Email
                </label>
                <input
                  type="email"
                  value={settings.advertising_contact_email || ''}
                  onChange={(e) => handleChange('advertising_contact_email', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Advertising Desk Phone
                </label>
                <input
                  type="text"
                  value={settings.advertising_phone || ''}
                  onChange={(e) => handleChange('advertising_phone', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Media Kit Download Path / URL
              </label>
              <input
                type="text"
                placeholder="/media-kit-2026.pdf or https://cdn.bharatchronicle.com/media-kit.pdf"
                value={settings.media_kit_url || ''}
                onChange={(e) => handleChange('media_kit_url', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Displayed to advertisers on the public <code>/advertise</code> commercial page.
              </span>
            </div>
          </div>
        )}================= */}

        {/* ================= TAB 2: ANALYTICS & SEARCH CONSOLE 
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Google Analytics 4 & Search Console Verification
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Complement our privacy-preserving first-party telemetry with external measurement suites.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={settings.ga4_measurement_id || ''}
                onChange={(e) => handleChange('ga4_measurement_id', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Optional. When configured and consented, GA4 gtag client library initializes automatically.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Google Search Console HTML Verification Code / Token
              </label>
              <input
                type="text"
                placeholder="google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={settings.google_search_console_meta || ''}
                onChange={(e) => handleChange('google_search_console_meta', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontFamily: 'monospace' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Injected into head tag to establish site ownership for sitemap indexing and search ranking data.
              </span>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                First-Party Telemetry Status
              </div>
              <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
                Our first-party tracking endpoint (<code>/api/v1/analytics/track</code>) employs in-memory 15-minute debouncing, salted IP hashing, and bot user-agent filtering to protect database capacity and provide audited readership counts.
              </div>
            </div>
          </div>
        )}================= */}

        {/* ================= TAB 3: YOUTUBE INTEGRATION ================= */}
        {activeTab === 'youtube' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                YouTube Channel & Video News Desk
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Connect the client's official YouTube channel for subscriber calls to action and official video embeds.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Official YouTube Channel URL
              </label>
              <input
                type="url"
                value={settings.youtube_channel_url || ''}
                onChange={(e) => handleChange('youtube_channel_url', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Used in subscribe buttons with <code>?sub_confirmation=1</code> across Homepage and <code>/videos</code>.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Channel ID / Canonical Identifier
              </label>
              <input
                type="text"
                value={settings.youtube_channel_id || ''}
                onChange={(e) => handleChange('youtube_channel_id', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '0.9rem', borderRadius: '4px', fontSize: '0.76rem', color: '#92400e', lineHeight: 1.5 }}>
              <strong>Compliance Notice:</strong> The platform uses official responsive YouTube <code>&lt;iframe&gt;</code> embeds with <code>rel=0</code> and strictly avoids autoplay with sound. Videos are streamed directly through Google's CDN without unauthorized redistribution.
            </div>
          </div>
        )}

        {/* ================= TAB 4: DPDP PRIVACY & COMPLIANCE ================= */}
        {activeTab === 'privacy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Data Protection (DPDP Act 2023) & Editorial Compliance
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Mandatory Indian digital privacy controls and Press Council of India registration records.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Consent Banner Policy Level
              </label>
              <select
                value={settings.dpdp_compliance_mode || 'strict'}
                onChange={(e) => handleChange('dpdp_compliance_mode', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff' }}
              >
                <option value="strict">Strict (DPDP Act 2023 & GDPR Opt-In Banner Displayed)</option>
                <option value="standard">Standard (Notice with Quick Dismiss)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Press Council of India (PCI) Accreditation Number
                </label>
                <input
                  type="text"
                  value={settings.pci_registration_number || ''}
                  onChange={(e) => handleChange('pci_registration_number', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Editorial Grievance Officer Contact
                </label>
                <input
                  type="email"
                  value={settings.editorial_grievance_email || ''}
                  onChange={(e) => handleChange('editorial_grievance_email', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: MASTHEAD & IDENTITY ================= */}
        {activeTab === 'identity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Masthead Brand & Editorial Identity
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
                Primary masthead title, tagline, motto, and editorial desk contacts.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Primary Masthead Title
              </label>
              <input
                type="text"
                value={settings.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Official Tagline
                </label>
                <input
                  type="text"
                  value={settings.site_tagline || ''}
                  onChange={(e) => handleChange('site_tagline', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Heritage Motto Stamp
                </label>
                <input
                  type="text"
                  value={settings.site_motto || ''}
                  onChange={(e) => handleChange('site_motto', e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Editorial Bureau Dispatch Email
              </label>
              <input
                type="email"
                value={settings.editorial_email || ''}
                onChange={(e) => handleChange('editorial_email', e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}

        {/* Form Actions Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1.75rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '4px',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              border: 'none',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)'
            }}
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? 'Publishing Changes...' : 'Save & Deploy Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
