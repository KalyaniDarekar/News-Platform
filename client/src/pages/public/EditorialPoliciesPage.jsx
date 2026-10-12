import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

export default function EditorialPoliciesPage() {
  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      
      <header style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <span className="kicker kicker-neutral">Institutional Ethics Code</span>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--color-ink-950)' }}>
          Editorial Standards & Policies
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--color-ink-600)', marginTop: '0.45rem' }}>
          Our operational code governing verification, factual corrections, sponsored content demarcation, and commercial independence.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', fontSize: '0.96rem', lineHeight: 1.7, color: 'var(--color-ink-800)' }}>
        
        {/* Policy 1: Corrections & Clarifications */}
        <section id="corrections" style={{ borderBottom: '1px solid var(--color-ink-200)', paddingBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-ink-950)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={22} style={{ color: 'var(--color-breaking)' }} /> 1. Factual Corrections Policy
          </h2>
          <p>
            The Bharat Chronicle is committed to immediate, transparent correction of factual errors. When a report is found to contain inaccurate information:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>The error is corrected in the digital text promptly.</li>
            <li>A distinct, italicized <strong>Correction Note</strong> is appended at the top or bottom of the article specifying exactly what was erroneous, the date/time of amendment, and the updated record.</li>
            <li>Significant errors of law or public fact are logged in our public monthly Corrections Record.</li>
            <li>Readers may submit correction requests with supporting documentation directly to <strong>corrections@bharatchronicle.com</strong>.</li>
          </ul>
        </section>

        {/* Policy 2: Advertising & Commercial Separation */}
        <section id="advertising" style={{ borderBottom: '1px solid var(--color-ink-200)', paddingBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-ink-950)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} style={{ color: '#b45309' }} /> 2. Commercial Advertising & Sponsored Content
          </h2>
          <p>
            Editorial integrity is our primary commercial asset. To protect reader trust:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Strict Division:</strong> Editorial journalists never write, edit, or approve paid advertising campaigns or commercial partner articles.</li>
            <li><strong>Clear Labeling:</strong> Any content financed by an advertiser is explicitly badged as <em>"PARTNER CONTENT"</em> or <em>"SPONSORED FEATURE"</em> in a distinct color and typography.</li>
            <li><strong>Prohibited Advertisements:</strong> We do not accept advertising from predatory financial lending schemes, unregulated gambling, hate groups, or entities promoting scientifically disproven health cures.</li>
            <li><strong>Ad Placement:</strong> Advertisers have zero advance preview or veto rights over independent news dispatches.</li>
          </ul>
        </section>

        {/* Policy 3: Fact-Checking & Sourcing */}
        <section id="fact-checking" style={{ borderBottom: '1px solid var(--color-ink-200)', paddingBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-ink-950)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={22} style={{ color: '#059669' }} /> 3. Verification & Sourcing Standards
          </h2>
          <p>
            We require primary documentation—such as court affidavits, parliamentary transcripts, audited corporate filings, or scientific pre-prints—to corroborate assertions of fact.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Anonymous Sources:</strong> Unnamed sources are permitted only when revealing matters of vital public interest where the source faces demonstrable threats to personal safety or livelihood, and the information is corroborated by at least two independent records.
          </p>
        </section>

        {/* Policy 4: AI & Synthetic Media Ethics */}
        <section id="ai-ethics">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-ink-950)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={22} style={{ color: '#4338ca' }} /> 4. AI & Synthetic Media Usage
          </h2>
          <p>
            We do not publish AI-generated synthetic news articles or synthetic journalistic photography. When AI computational tools are used for large-scale document analysis or data summarization, the methodology is transparently stated in the dispatch.
          </p>
        </section>

      </div>

    </div>
  );
}
