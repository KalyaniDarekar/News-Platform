import React from 'react';

export default function TermsPage() {
  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <header style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <span className="kicker kicker-neutral">Terms of Service</span>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--color-ink-950)' }}>
          Terms & Conditions of Use
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-ink-600)', marginTop: '0.45rem' }}>
          Effective: October 2026 • Governing Digital Access and Intellectual Property
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--color-ink-800)' }}>
        <p>
          By accessing or reading dispatches published by JANTA JOURNAL, you agree to comply with and be bound by the following Terms of Service.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink-950)' }}>1. Copyright & Intellectual Property</h3>
        <p>
          All journalistic articles, photographs, infographics, video reels, audio dispatches, and headlines are the protected intellectual property of JANTA JOURNAL Media Network Pvt. Ltd. Unauthorized commercial scraping, automated AI model ingestion without syndication license, or verbatim replication is strictly prohibited under the Indian Copyright Act, 1957.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink-950)' }}>2. Fair Dealing & Quotation</h3>
        <p>
          Scholarly, educational, and commentary citations are permitted under fair dealing provided that clear, prominent attribution with an active canonical hyperlink to the original Janta Journal URL is maintained.
        </p>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-ink-950)' }}>3. Jurisdiction</h3>
        <p>
          Any disputes arising out of the use of this service shall be subject to the exclusive jurisdiction of the competent courts of New Delhi, India.
        </p>
      </div>
    </div>
  );
}
