import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Shield, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('editor@bharatchronicle.com');
  const [password, setPassword] = useState('Editorial@2026');
  const [selectedRole, setSelectedRole] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successUser, setSuccessUser] = useState(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Authentication failed. Please verify credentials.');
      }

      // Store JWT token and user profile in storage
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.data.user));
      setSuccessUser(data.data.user);

      setTimeout(() => {
        navigate('/admin');
      }, 500);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const seedPresets = [
    { roleKey: 'super_admin', title: 'Super Admin', email: 'admin@bharatchronicle.com', desc: 'Full system administration & user access control' },
    { roleKey: 'editor', title: 'Editor-in-Chief', email: 'editor@bharatchronicle.com', desc: 'Article publication clearance & category curation' },
    { roleKey: 'reporter', title: 'Staff Reporter', email: 'reporter@bharatchronicle.com', desc: 'Draft composition & investigative reporting' }
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
            Production Newsroom CMS (Phase 2)
          </div>
        </div>

        {/* Login Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Editorial Staff Authentication
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
              Secure bcrypt + JWT login linked to real MySQL database.
            </p>
          </div>

          {errorMsg && (
            <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b91c1c', fontSize: '0.8rem' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successUser && (
            <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d', fontSize: '0.8rem' }}>
              <CheckCircle size={15} style={{ flexShrink: 0 }} />
              <span>Authenticated as {successUser.fullName} ({successUser.role}). Redirecting...</span>
            </div>
          )}

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
                Password (Default: Editorial@2026)
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

            {/* Quick Role Preset Picker (MySQL Seed Accounts) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                Live MySQL Staff Accounts:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {seedPresets.map((r) => (
                  <button
                    key={r.roleKey}
                    type="button"
                    onClick={() => { setSelectedRole(r.roleKey); setEmail(r.email); setPassword('Editorial@2026'); }}
                    style={{
                      textAlign: 'left',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.74rem',
                      border: selectedRole === r.roleKey ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      backgroundColor: selectedRole === r.roleKey ? '#eff6ff' : '#f8fafc',
                      color: selectedRole === r.roleKey ? '#1e40af' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block' }}>{r.title}</strong>
                      <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>{r.desc}</span>
                    </div>
                    {selectedRole === r.roleKey && <CheckCircle size={14} color="#2563eb" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                backgroundColor: loading ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.3)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Authenticating with MySQL...' : 'Sign In to Newsroom Workspace'}
            </button>
          </form>

          {/* Real MySQL Connection Badge */}
          <div style={{ marginTop: '1.25rem', padding: '0.65rem', backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '4px', fontSize: '0.72rem', color: '#166534', display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
            <Shield size={14} style={{ color: '#16a34a', flexShrink: 0, marginTop: '1px' }} />
            <span>
              <strong>Phase 2 Active:</strong> Connected to live MySQL database on port 3306 with bcrypt password validation and JWT token generation.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
