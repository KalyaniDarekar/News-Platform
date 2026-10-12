import React, { useState } from 'react';
import { Mail, Check, ShieldCheck } from 'lucide-react';

export default function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div style={{
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '2rem',
      borderRadius: '2px',
      margin: '2.5rem 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
          <Mail size={14} /> Morning Editorial Intelligence
        </div>

        <h3 style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.02em', marginBottom: '0.5rem' }}>
          The Chronicle Daily Briefing
        </h3>

        <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Delivered every morning at 06:30 IST. Authoritative geopolitical analysis, market indicators, diplomatic dispatches, and curated investigative reporting directly to your inbox.
        </p>

        {subscribed ? (
          <div style={{ 
            backgroundColor: 'rgba(16, 185, 129, 0.2)', 
            border: '1px solid #10b981', 
            padding: '0.85rem 1.25rem', 
            borderRadius: '2px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#a7f3d0',
            fontSize: '0.86rem',
            fontWeight: 600
          }}>
            <Check size={18} /> Thank you. Your morning briefing subscription has been registered.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your professional email address..."
              style={{
                flex: '1',
                minWidth: '260px',
                maxWidth: '380px',
                padding: '0.75rem 1rem',
                fontSize: '0.88rem',
                border: '1px solid #475569',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                borderRadius: '2px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--color-breaking)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '0.75rem 1.5rem',
                borderRadius: '2px',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              Subscribe Free
            </button>
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.7rem', color: '#94a3b8' }}>
          <ShieldCheck size={13} /> Strict zero-spam policy. Unsubscribe anytime with a single click.
        </div>
      </div>
    </div>
  );
}
