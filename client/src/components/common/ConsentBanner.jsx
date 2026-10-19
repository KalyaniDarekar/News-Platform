import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Lock, X, Check, Settings, ExternalLink } from 'lucide-react';

const CONSENT_STORAGE_KEY = 'bc_dpdp_consent';

export function getStoredConsent() {
  try {
    return localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredConsent(val) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, val);
    window.dispatchEvent(new CustomEvent('bc_consent_updated', { detail: val }));
  } catch {
    // LocalStorage quota or access denied
  }
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true and locked
    analytics: true,
    commercial: true
  });

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      // Delay display slightly so it doesn't jarringly block the initial masthead render
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for user opening consent settings from footer
  useEffect(() => {
    const handleOpen = () => {
      setVisible(true);
      setShowPreferences(true);
    };
    window.addEventListener('bc_open_consent_modal', handleOpen);
    return () => window.removeEventListener('bc_open_consent_modal', handleOpen);
  }, []);

  const handleAcceptAll = () => {
    setStoredConsent('granted_all');
    setVisible(false);
    setShowPreferences(false);
  };

  const handleRejectNonEssential = () => {
    setStoredConsent('essential_only');
    setVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    const choice = preferences.analytics ? 'granted_analytics' : 'essential_only';
    setStoredConsent(choice);
    setVisible(false);
    setShowPreferences(false);
  };

  if (!visible) return null;

  return (
    <>
      {/* Floating Bottom Toast Banner */}
      {!showPreferences && (
        <aside
          role="region"
          aria-label="Privacy & Cookie Consent"
          style={{
            position: 'fixed',
            bottom: '0.75rem',
            left: '0.75rem',
            right: '0.75rem',
            maxWidth: '960px',
            margin: '0 auto',
            backgroundColor: '#0f172a',
            color: '#f8fafc',
            borderRadius: '6px',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            zIndex: 9999,
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            animation: 'fadeInUp 250ms ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <div style={{
                backgroundColor: 'rgba(37, 99, 235, 0.2)',
                color: '#60a5fa',
                padding: '0.5rem',
                borderRadius: '4px',
                flexShrink: 0
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', marginBottom: '0.25rem' }}>
                  Privacy & Data Stewardship Notice (DPDP Act & Global Compliance)
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0, maxWidth: '680px' }}>
                  JANTA JOURNAL operates strictly first-party, privacy-preserving telemetry and essential operational cookies. We do not sell your personal data or execute cross-site tracking brokers. In compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and GDPR, you have full control over analytics and advertising preferences.
                </p>
              </div>
            </div>

            <button
              onClick={handleRejectNonEssential}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.25rem'
              }}
              title="Dismiss & Keep Essential Only"
              aria-label="Dismiss banner"
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.74rem', color: '#94a3b8' }}>
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#60a5fa',
                  textDecoration: 'underline',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Customize Preferences
              </button>
              <span>•</span>
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'underline' }}
              >
                Read Editorial Privacy Policy
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                style={{
                  backgroundColor: 'transparent',
                  color: '#e2e8f0',
                  border: '1px solid #475569',
                  borderRadius: '3px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)'
                }}
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.25rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            maxWidth: '560px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} color="#2563eb" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Manage Privacy & Telemetry Choices
                </h3>
              </div>
              <button
                onClick={() => setShowPreferences(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.2rem' }}
                aria-label="Close preferences"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '65vh', overflowY: 'auto' }}>
              
              {/* Category 1: Essential */}
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lock size={14} color="#059669" />
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Strictly Necessary & Security Cookies</strong>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#166534', padding: '0.15rem 0.5rem', borderRadius: '3px' }}>
                    ALWAYS ACTIVE
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Essential for newsroom authentication, cryptographic token protection, session continuity, and CDN edge security. Cannot be switched off.
                </p>
              </div>

              {/* Category 2: First-Party Analytics */}
              <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Cookie size={14} color="#2563eb" />
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>First-Party Editorial Telemetry</strong>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                    />
                  </label>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Measures aggregated article reads, popular categories, and reading time using privacy-preserving salted IP hashes. Helps our editorial desk understand public interest. No cross-site profiling.
                </p>
              </div>

              {/* Category 3: Commercial & Sponsorship */}
              <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ShieldCheck size={14} color="#7c3aed" />
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>Sponsorship & Ad Viewability Counting</strong>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.commercial}
                      onChange={(e) => setPreferences({ ...preferences, commercial: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                    />
                  </label>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  Allows counting total impressions and clicks for independent sponsor banners on this website to sustain investigative reporting.
                </p>
              </div>

            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: '#f8fafc' }}>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '3px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                Save My Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
