import React, { useState } from 'react';
import { Mail, Phone, MapPin, Lock, Send, Check, AlertCircle, RefreshCw } from 'lucide-react';
import apiService from '../../services/api';

export default function ContactUsPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    subject: 'editorial_tip', 
    message: '' 
  });

  const subjectLabels = {
    editorial_tip: 'Confidential News Tip / Whistleblower Leak',
    corrections: 'Factual Correction Request',
    advertising: 'Commercial Advertising & Sponsored Partnerships',
    syndication: 'Reprint & Syndication Rights',
    grievance: 'Statutory Grievance Officer'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const deptLabel = subjectLabels[formData.subject] || 'General Inquiry';

      const payload = {
        companyName: `[Contact Desk] ${deptLabel}`,
        contactName: formData.name?.trim() || 'Anonymous Contributor',
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        budgetRange: `Contact Desk: ${deptLabel}`,
        preferredPlacements: [deptLabel],
        campaignObjectives: `Inquiry Department: ${deptLabel}`,
        message: formData.message.trim()
      };

      const res = await apiService.submitContactEnquiry(payload);
      setSuccessData(res.data || res);
      setSubmitted(true);
    } catch (err) {
      console.error('Contact form transmission failed:', err);
      setErrorMsg(err.message || 'Failed to transmit inquiry to the newsroom desk. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', subject: 'editorial_tip', message: '' });
    setSubmitted(false);
    setSuccessData(null);
    setErrorMsg('');
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>

      <header style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <span className="kicker kicker-neutral">Newsroom Desks & Inquiries</span>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--color-ink-950)' }}>
          Contact The Janta Journal
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
            <strong>editorial@jantajournal.com</strong>
          </p>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-950)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} color="#047857" /> Financial Desk (Mumbai)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5 }}>
            Bandra-Kurla Complex (BKC)<br />
            Mumbai 400051, India<br />
            <strong>markets@jantajournal.com</strong>
          </p>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '2px' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-950)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={15} color="#4338ca" /> Technology Hub (Bengaluru)
          </h3>
          <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: 1.5 }}>
            MG Road / Indiranagar Tech Corridor<br />
            Bengaluru 560001, India<br />
            <strong>techdesk@jantajournal.com</strong>
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-ink-300)', padding: '2rem', borderRadius: '2px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink-950)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Lock size={18} style={{ color: 'var(--color-breaking)' }} /> Secure Dispatch / Inquiry Form
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--color-ink-600)', marginBottom: '1.5rem' }}>
          Whistleblowers and anonymous contributors may submit tips here. Inquiries are logged directly into the newsroom editorial review CRM.
        </p>

        {errorMsg && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.85rem 1rem',
            borderRadius: '2px',
            fontSize: '0.82rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} color="#dc2626" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            padding: '1.5rem',
            borderRadius: '2px',
            color: '#065f46'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <Check size={24} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065f46', marginBottom: '0.35rem' }}>
                  Dispatch Successfully Received {successData?.id ? `(Inquiry Reference #${successData.id})` : ''}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#047857', lineHeight: 1.5 }}>
                  {successData?.message || 'Your inquiry has been encrypted and submitted to the newsroom desk. Senior editors have been notified.'}
                </p>
                <div style={{ marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: '#059669',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '2px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={13} /> Submit Another Inquiry / Tip
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-800)', marginBottom: '0.35rem' }}>
                  Full Name (Optional)
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
                  Contact Email <span style={{ color: '#dc2626' }}>*</span>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-800)', marginBottom: '0.35rem' }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', fontSize: '0.88rem', border: '1px solid var(--color-ink-300)', borderRadius: '2px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-800)', marginBottom: '0.35rem' }}>
                Department / Desk <span style={{ color: '#dc2626' }}>*</span>
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
                Your Message / Documentation Notes <span style={{ color: '#dc2626' }}>*</span>
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
              disabled={submitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.75rem',
                backgroundColor: submitting ? '#64748b' : 'var(--color-ink-950)',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '2px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                alignSelf: 'flex-start',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              <Send size={14} /> {submitting ? 'Transmitting Dispatch...' : 'Transmit Inquiry'}
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
