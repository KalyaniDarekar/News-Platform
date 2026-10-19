import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <header style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <span className="kicker kicker-neutral">Legal Compliance & Data Governance</span>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--color-ink-950)' }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-600)', marginTop: '0.45rem' }}>
          Last Updated: October 12, 2026 • Compliant with the Digital Personal Data Protection (DPDP) Act, 2023.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--color-ink-800)' }}>
        <p>
          JANTA JOURNAL Media Network Pvt. Ltd. ("we", "our", or "the Platform") respects reader privacy. This Policy outlines how data is gathered, processed, and safeguarded when you access our digital publications.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink-950)' }}>1. Data We Collect</h3>
        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><strong>Information You Provide:</strong> Email address for newsletter subscriptions or account registrations.</li>
          <li><strong>Technical Metadata:</strong> Anonymized IP addresses, browser agent, operating system, and reading duration metrics for editorial analytics.</li>
          <li><strong>Cookies & Session Storage:</strong> Lightweight functional cookies used strictly for user session preferences and edition localization.</li>
        </ul>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink-950)' }}>2. How Information is Used</h3>
        <p>
          We use data exclusively to deliver news dispatches, fulfill newsletter deliveries, prevent fraudulent bot traffic, and optimize site delivery speed. We do not sell or broker reader personal information to third-party commercial data brokers.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink-950)' }}>3. Data Principal Rights (DPDP Act)</h3>
        <p>
          Under Indian data protection laws, readers have the right to request access to their collected email records, seek correction, or request erasure of subscriber accounts at any time by contacting our Data Protection Officer at <strong>privacy@jantajournal.com</strong>.
        </p>
      </div>
    </div>
  );
}
