import React from 'react';
import { Award, ShieldCheck, Users, Globe, BookOpen } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="container-narrow" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      
      <header style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
        <span className="kicker kicker-neutral">Institutional Charter</span>
        <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, color: 'var(--color-ink-950)', lineHeight: 1.15 }}>
          About The Bharat Chronicle
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--color-ink-600)', fontFamily: 'var(--font-serif)', marginTop: '0.75rem', lineHeight: 1.5 }}>
          Founded on principles of unwavering truth, fearless inquiry, and constitutional values, The Bharat Chronicle is India’s independent digital daily of record.
        </p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '1.05rem', lineHeight: 1.8, fontFamily: 'var(--font-serif)', color: 'var(--color-ink-800)' }}>
        <p>
          Established as a beacon of independent journalism, <strong>The Bharat Chronicle</strong> serves readers across India and the global diaspora who demand deep investigative reporting, macroeconomic insight, and strategic geopolitical clarity without partisan noise.
        </p>

        <p>
          In an era crowded with ephemeral social media updates and algorithmic outrage, our newsroom adheres to classic journalistic virtues: shoe-leather reporting, verified document caches, and multi-sourced accountability.
        </p>

        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          margin: '1rem 0',
          borderRadius: '2px',
          fontFamily: 'var(--font-sans)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e3a8a', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={18} /> Editorial Independence
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
              Strict separation between editorial reporting desks and commercial revenue teams. No corporate influence on coverage.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <Award size={18} /> Double-Check Verification
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
              Every investigative lead is vetted across at least two independent primary records before publication.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.35rem' }}>
              <Globe size={18} /> National & Global Reach
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.5 }}>
              Permanent news bureaus stationed across New Delhi, Mumbai, Bengaluru, Washington D.C., and London.
            </p>
          </div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-ink-950)', marginTop: '1rem' }}>
          Our Editorial Leadership
        </h2>

        <p>
          Our newsroom is helmed by veteran correspondents with decades of experience covering Parliament, the Supreme Court of India, the Reserve Bank of India, and global multilateral institutions.
        </p>

        <div style={{
          backgroundColor: '#fafbfc',
          borderLeft: '4px solid var(--color-ink-950)',
          padding: '1.25rem 1.5rem',
          fontSize: '0.92rem',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-ink-700)'
        }}>
          <strong>Statutory Accreditation:</strong> The Bharat Chronicle is registered under the Press Council of India and adheres to the ethical code framed under the Working Journalists and Other Newspaper Employees Act.
        </div>
      </section>

    </div>
  );
}
