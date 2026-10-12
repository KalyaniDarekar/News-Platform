import React, { useState, useEffect } from 'react';
import { Settings, Database, Save, Check, RefreshCw, ShieldCheck } from 'lucide-react';
import apiService from '../../services/api';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('The Bharat Chronicle');
  const [tagline, setTagline] = useState('Independent National Daily of Record');
  const [motto, setMotto] = useState('Veritas et Libertas • Est. 1928');
  const [editorialEmail, setEditorialEmail] = useState('editorial@bharatchronicle.com');
  const [adEmail, setAdEmail] = useState('advertising@bharatchronicle.com');
  const [regNumber, setRegNumber] = useState('REG-BC-2026-DEL-0941');
  const [saved, setSaved] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [checkingDb, setCheckingDb] = useState(false);

  const checkDb = async () => {
    setCheckingDb(true);
    const health = await apiService.checkBackendHealth();
    setDbStatus(health);
    setCheckingDb(false);
  };

  useEffect(() => {
    checkDb();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
          Publication & Platform Settings
        </h1>
        <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
          Configure masthead identity, institutional contacts, legal accreditation, and database telemetry.
        </p>
      </div>

      {saved && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <Check size={16} /> Configuration updated successfully.
        </div>
      )}

      {/* Backend / MySQL Health Check Card */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} color="#2563eb" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>
              Database & Express API Connection Status
            </span>
          </div>

          <button
            onClick={checkDb}
            disabled={checkingDb}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.75rem',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              borderRadius: '4px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} className={checkingDb ? 'animate-spin' : ''} /> Check Live DB
          </button>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '4px', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
          {dbStatus?.status === 'online' ? (
            <div style={{ color: '#059669', fontWeight: 600 }}>
              ● Backend online. MySQL status: {dbStatus.database?.message || 'Connected'}.
            </div>
          ) : (
            <div>
              <span style={{ color: '#b45309', fontWeight: 700 }}>● Operating in Phase 1 Demonstration Mode.</span>
              <div style={{ marginTop: '0.25rem', color: '#64748b' }}>
                Backend service configured at <code>http://localhost:5000/api</code>. MySQL schema prepared in <code>server/database/schema.sql</code>. Live database connection will bind in Phase 2.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
          Publication Masthead Identity
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
            Primary Masthead Title
          </label>
          <input
            type="text"
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Official Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Motto & Heritage Stamp
            </label>
            <input
              type="text"
              value={motto}
              onChange={(e) => setMotto(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>
        </div>

        <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem', marginTop: '0.5rem', fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
          Institutional Disclosures & Legal Registration
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
            Press Council of India Accreditation Number
          </label>
          <input
            type="text"
            value={regNumber}
            onChange={(e) => setRegNumber(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Editorial Bureau Email
            </label>
            <input
              type="email"
              value={editorialEmail}
              onChange={(e) => setEditorialEmail(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.3rem' }}>
              Commercial Ad Sales Desk Email
            </label>
            <input
              type="email"
              value={adEmail}
              onChange={(e) => setAdEmail(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.85rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
            />
          </div>
        </div>

        <button
          type="submit"
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.65rem 1.5rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '4px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginTop: '0.5rem'
          }}
        >
          <Save size={15} /> Save Platform Settings
        </button>
      </form>

    </div>
  );
}
