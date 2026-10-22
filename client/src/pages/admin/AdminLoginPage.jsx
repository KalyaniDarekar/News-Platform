import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successUser, setSuccessUser] = useState(null);
  const navigate = useNavigate();
  const auth = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await auth.login(usernameOrEmail.trim(), password);
      setSuccessUser(user);

      setTimeout(() => {
        navigate('/admin');
      }, 500);
    } catch (err) {
      console.error('Authentication error:', err.message);
      setErrorMsg('Invalid username, email, or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        
        {/* Brand Stamp */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '1rem', textDecoration: 'none' }}>
            <ArrowLeft size={13} /> Back to Public Publication
          </Link>
          <div style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
            JANTA JOURNAL
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>
            Newsroom Editorial Workspace
          </div>
        </div>

        {/* Login Card */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Editorial Staff Sign In
            </h2>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>
              Enter your authorized staff credentials to access the newsroom.
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
                Username or Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="e.g. SuperAdmin or user@jantajournal.com"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.25rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }}
                />
                <User size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.85rem 0.65rem 2.25rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }}
                />
                <Lock size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
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
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In to Newsroom Workspace'}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
