import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Flame, ChevronRight, Bookmark } from 'lucide-react';
import { LEAD_STORY, SECONDARY_LEADS, OPINIONS, THE_WIRE_UPDATES } from '../../data/mockNewsData';

export default function HeroPackage() {
  return (
    <section style={{ paddingTop: '1.5rem', paddingBottom: '2.5rem' }}>
      
      {/* Editorial Grid: 3-Column Asymmetric Balance (Lead 55%, Secondary 23%, Wire & Opinion 22%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.75fr) minmax(0, 0.9fr)',
        gap: '2rem',
        alignItems: 'start'
      }} className="hero-package-grid">
        
        {/* ================= COLUMN 1: THE LEAD INVESTIGATION ================= */}
        <article className="editorial-card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="kicker">{LEAD_STORY.kicker}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ink-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> {LEAD_STORY.readingTime}
            </span>
          </div>

          <Link to={`/article/${LEAD_STORY.slug}`}>
            <h1 className="headline-hero">
              {LEAD_STORY.title}
            </h1>
          </Link>

          {/* Lead Hero Image with Caption */}
          <Link to={`/article/${LEAD_STORY.slug}`}>
            <div className="editorial-img-wrap" style={{ aspectRatio: '16/9', borderRadius: '2px' }}>
              <img 
                src={LEAD_STORY.image} 
                alt={LEAD_STORY.title}
                loading="eager"
              />
            </div>
          </Link>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', fontStyle: 'italic', marginTop: '-0.35rem' }}>
            {LEAD_STORY.imageCaption}
          </div>

          {/* Excerpt */}
          <p style={{
            fontSize: '1.05rem',
            lineHeight: 1.6,
            color: 'var(--color-ink-700)',
            fontFamily: 'var(--font-serif)',
            marginTop: '0.25rem'
          }}>
            {LEAD_STORY.summary}
          </p>

          {/* Author Byline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--color-ink-200)',
            marginTop: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <img
                src={LEAD_STORY.author.avatar}
                alt={LEAD_STORY.author.name}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-ink-900)' }}>
                  By {LEAD_STORY.author.name}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)' }}>
                  {LEAD_STORY.author.title}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--color-ink-500)' }}>
              {LEAD_STORY.publishedAt}
            </div>
          </div>
        </article>

        {/* ================= COLUMN 2: SECONDARY LEADS (STACKED) ================= */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          borderLeft: '1px solid var(--color-ink-200)',
          paddingLeft: '1.5rem'
        }} className="secondary-leads-col">
          
          <div style={{ borderBottom: '1px solid var(--color-ink-950)', paddingBottom: '0.35rem', marginBottom: '-0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-900)' }}>
              Spotlight Analysis
            </span>
          </div>

          {SECONDARY_LEADS.map((story) => (
            <article key={story.id} className="editorial-card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-ink-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="kicker kicker-neutral">{story.kicker}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-500)' }}>{story.readingTime}</span>
              </div>

              <Link to={`/article/${story.slug}`}>
                <div className="editorial-img-wrap" style={{ aspectRatio: '16/10', borderRadius: '2px', marginBottom: '0.45rem' }}>
                  <img src={story.image} alt={story.title} loading="lazy" />
                </div>
              </Link>

              <Link to={`/article/${story.slug}`}>
                <h3 className="headline-lead" style={{ fontSize: '1.2rem', lineHeight: 1.3 }}>
                  {story.title}
                </h3>
              </Link>

              <p style={{ fontSize: '0.86rem', color: 'var(--color-ink-600)', lineHeight: 1.5, marginTop: '0.2rem' }}>
                {story.summary}
              </p>

              <div className="byline-text" style={{ marginTop: '0.35rem' }}>
                <span>By <strong style={{ color: 'var(--color-ink-800)' }}>{story.author.name}</strong></span>
                <span>•</span>
                <span>{story.publishedAt.split('•')[0]}</span>
              </div>
            </article>
          ))}

        </div>

        {/* ================= COLUMN 3: THE WIRE & OPINION DESK ================= */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          borderLeft: '1px solid var(--color-ink-200)',
          paddingLeft: '1.5rem',
          backgroundColor: '#fafbfc',
          padding: '1.25rem',
          borderRadius: '2px'
        }} className="wire-opinion-col">
          
          {/* THE 10-MINUTE WIRE */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '0.45rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-950)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="pulse-dot" style={{ width: 6, height: 6 }}></span> The Fast Wire
              </span>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-500)' }}>LIVE STREAM</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {THE_WIRE_UPDATES.map((item) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingBottom: '0.65rem', borderBottom: '1px dashed var(--color-ink-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-breaking)' }}>
                      {item.time}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--color-ink-500)', textTransform: 'uppercase' }}>
                      {item.category}
                    </span>
                  </div>
                  <Link 
                    to={`/article/${item.slug}`}
                    style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-ink-900)', lineHeight: 1.35 }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--color-breaking)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--color-ink-900)'}
                  >
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* OPINION & EDITORIAL ESSAYS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-opinion)', paddingBottom: '0.45rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-opinion)' }}>
                Opinions & Comment
              </span>
              <Link to="/category/opinion" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-opinion)' }}>
                View All →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {OPINIONS.map((op) => (
                <article key={op.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--color-ink-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src={op.author.avatar}
                      alt={op.author.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-900)' }}>
                        {op.author.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--color-ink-500)', lineHeight: 1.2 }}>
                        {op.author.designation}
                      </div>
                    </div>
                  </div>

                  <Link to={`/article/${op.slug}`} style={{ textDecoration: 'none' }}>
                    <h4 style={{ 
                      fontFamily: 'var(--font-serif)', 
                      fontStyle: 'italic',
                      fontSize: '0.98rem', 
                      fontWeight: 600, 
                      lineHeight: 1.35, 
                      color: 'var(--color-ink-950)',
                      marginTop: '0.2rem'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--color-opinion)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--color-ink-950)'}
                    >
                      "{op.title}"
                    </h4>
                  </Link>

                  <p style={{ fontSize: '0.78rem', color: 'var(--color-ink-600)', lineHeight: 1.45 }}>
                    {op.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
