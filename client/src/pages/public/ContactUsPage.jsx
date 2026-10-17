import React, { useState } from 'react';
import { Mail, Phone, MapPin, Lock, Send, Check } from 'lucide-react';

export default function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'editorial_tip', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      
      <header style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <span className="kicker kicker-neutral">Newsroom Desks & Inquiries</span>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--color-ink-950)' }}>
          Contact The Chronicle
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-ink-600)', marginTop: '0.45rem' }}>
          Connect with our editors, submit secure confidential investigative tips, or reach our commercial advertising desk.
        </p>
      </header>

      {/* Bureau Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-950)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} color="#c9182b" /> Central Bureau (New Delhi)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5 }}>
            Press Enclave, Bahadur Shah Zafar Marg<br />
            New Delhi 110002, India<br />
            <strong>editorial@bharatchronicle.com</strong>
          </p>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-950)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} color="#047857" /> Financial Desk (Mumbai)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5 }}>
            Bandra-Kurla Complex (BKC)<br />
            Mumbai 400051, India<br />
            <strong>markets@bharatchronicle.com</strong>
          </p>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-950)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} color="#4338ca" /> Technology Hub (Bengaluru)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5 }}>
            MG Road / Indiranagar Tech Corridor<br />
            Bengaluru 560001, India<br />
            <strong>techdesk@bharatchronicle.com</strong>
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-ink-300)', padding: '2rem', borderRadius: '2px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink-950)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Lock size={18} style={{ color: 'var(--color-breaking)' }} /> Secure Dispatch / Inquiry Form
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--color-ink-600)', marginBottom: '1.5rem' }}>
          Whistleblowers and anonymous contributors may submit tips here. Source confidentiality is legally protected under journalism privilege.
        </p>

        {submitted ? (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '1.5rem', borderRadius: '2px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Check size={22} />
            <div>
              <strong>Dispatch Received.</strong> Your message has been encrypted and forwarded to the appropriate desk senior editor.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-800)', marginBottom: '0.35rem' }}>
                  Full Name (Optional for anonymous tips)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Anand R."
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', border: '1px solid var(--color-ink-300)', borderRadius: '2px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-800)', marginBottom: '0.35rem' }}>
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@organization.com"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', border: '1px solid var(--color-ink-300)', borderRadius: '2px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-800)', marginBottom: '0.35rem' }}>
                Department / Desk
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', border: '1px solid var(--color-ink-300)', borderRadius: '2px', backgroundColor: '#ffffff' }}
              >
                <option value="editorial_tip">Confidential News Tip / Whistleblower Leak</option>
                <option value="corrections">Factual Correction Request</option>
                <option value="advertising">Commercial Advertising & Sponsored Partnerships</option>
                <option value="syndication">Reprint & Syndication Rights</option>
                <option value="grievance">Statutory Grievance Officer</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-800)', marginBottom: '0.35rem' }}>
                Your Message / Documentation Notes
              </label>
              <textarea
                rows={5}
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Provide specific verifiable facts, dates, entities involved, and contact verification details..."
                style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', border: '1px solid var(--color-ink-300)', borderRadius: '2px', resize: 'vertical' }}
              ></textarea>
            </div>

            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.75rem',
                backgroundColor: 'var(--color-ink-950)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                alignSelf: 'flex-start'
              }}
            >
              <Send size={14} /> Transmit Inquiry
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
