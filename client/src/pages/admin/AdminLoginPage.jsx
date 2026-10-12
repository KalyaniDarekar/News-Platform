import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Shield, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('editor@bharatchronicle.com');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState('Editor-in-Chief');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In Phase 1 preview, navigating to the dashboard
    navigate('/admin');
  };

  const roles = [
    { name: 'Editor-in-Chief', email: 'editor@bharatchronicle.com', desc: 'Full editorial clearance & publish authority' },
    { name: 'Senior Desk Editor', email: 'arundhati.sen@bharatchronicle.com', desc: 'Economy & National desk approvals' },
    { name: 'Commercial Ad Manager', email: 's.roy@bharatchronicle.com', desc: 'Monetization, ad slots & sponsor campaigns' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Brand Stamp */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '1rem' }}>
            <ArrowLeft size={13} /> Back to Public Publication
          </Link>
          <div style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
            THE BHARAT CHRONICLE
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
            Newsroom Content Management System
          </div>
        </div>

        {/* Login Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Editorial Staff Authentication
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
              Restricted workspace for accredited journalists and desk editors.
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Newsroom Identity (Email)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.25rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
                />
                <Mail size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Security Token / Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.25rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
                />
                <Lock size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            {/* Quick Role Preset Picker (Phase 1 Preview Mode) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                Preview As Role (Phase 1):
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {roles.map((r) => (
                  <button
                    key={r.name}
                    type="button"
                    onClick={() => { setSelectedRole(r.name); setEmail(r.email); }}
                    style={{
                      textAlign: 'left',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      border: selectedRole === r.name ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: selectedRole === r.name ? '#eff6ff' : '#f8fafc',
                      color: selectedRole === r.name ? '#1e40af' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block' }}>{r.name}</strong>
                      <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>{r.desc}</span>
                    </div>
                    {selectedRole === r.name && <CheckCircle size={14} color="#2563eb" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              style={{
                marginTop: '0.5rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)'
              }}
            >
              Enter Newsroom Workspace
            </button>
          </form>

          {/* Phase 1 Preview Transparency Callout */}
          <div style={{ marginTop: '1.25rem', padding: '0.65rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
            <Shield size={14} style={{ color: '#2563eb', flexShrink: 0, marginTop: '1px' }} />
            <span>
              <strong>Phase 1 UI Notice:</strong> Live database credential verification with MySQL bcrypt tokens will activate in Phase 2 upon DB link. Clicking Enter loads full CMS preview.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
