import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { LEAD_STORY, SECONDARY_LEADS, OPINIONS, THE_WIRE_UPDATES } from '../../data/mockNewsData';
import { formatRelativeTime } from '../../services/api';

export default function HeroPackage({ 
  leadStory, 
  secondaryStories, 
  wireUpdates, 
  opinions 
}) {
  // Use provided props or graceful defaults
  const lead = leadStory || LEAD_STORY;
  const secondaries = (secondaryStories && secondaryStories.length > 0) ? secondaryStories : SECONDARY_LEADS;
  const wire = (wireUpdates && wireUpdates.length > 0) ? wireUpdates : THE_WIRE_UPDATES;
  const opList = (opinions && opinions.length > 0) ? opinions : OPINIONS;

  const leadTitle = lead.title;
  const leadSlug = lead.slug;
  const leadSummary = lead.short_description || lead.summary;
  const leadImage = lead.featured_image || lead.image;
  const leadAlt = lead.alt_text || lead.title;
  const leadKicker = lead.kicker || lead.category_name || 'LEAD INVESTIGATION';
  const leadReadingTime = lead.reading_time_minutes ? `${lead.reading_time_minutes} min read` : (lead.readingTime || '5 min read');
  const leadAuthorName = lead.author_name || (lead.author && lead.author.name) || 'Vikramaditya Sharma';
  const leadAuthorTitle = lead.author_designation || (lead.author && lead.author.title) || 'Senior Editorial Correspondent';
  const leadAuthorAvatar = lead.author_avatar || (lead.author && lead.author.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const leadPublishedAt = lead.publication_time ? formatRelativeTime(lead.publication_time) : (lead.published_at || lead.publishedAt || 'Today');

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
            <span className="kicker">{leadKicker}</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ink-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> {leadReadingTime}
            </span>
          </div>

          <Link to={`/article/${leadSlug}`} style={{ textDecoration: 'none' }}>
            <h1 className="headline-hero">
              {leadTitle}
            </h1>
          </Link>

          {/* Lead Hero Image with Caption */}
          {leadImage && (
            <Link to={`/article/${leadSlug}`}>
              <div className="editorial-img-wrap" style={{ aspectRatio: '16/9', borderRadius: '2px', overflow: 'hidden' }}>
                <img 
                  src={leadImage} 
                  alt={leadAlt}
                  loading="eager"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </Link>
          )}
          <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', fontStyle: 'italic', marginTop: '-0.35rem' }}>
            {lead.image_caption || lead.imageCaption || `Photograph: Bureau Archives / The Bharat Chronicle`}
          </div>

          {/* Excerpt */}
          {leadSummary && (
            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              color: 'var(--color-ink-700)',
              fontFamily: 'var(--font-serif)',
              marginTop: '0.25rem'
            }}>
              {leadSummary}
            </p>
          )}

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
                src={leadAuthorAvatar}
                alt={leadAuthorName}
                style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-ink-900)' }}>
                  By {leadAuthorName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)' }}>
                  {leadAuthorTitle}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--color-ink-500)' }}>
              {leadPublishedAt}
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

          {secondaries.map((story) => {
            const sTitle = story.title;
            const sSlug = story.slug;
            const sKicker = story.kicker || story.category_name || 'FEATURE';
            const sImage = story.featured_image || story.image;
            const sAlt = story.alt_text || story.title;
            const sSummary = story.short_description || story.summary;
            const sReading = story.reading_time_minutes ? `${story.reading_time_minutes} min read` : (story.readingTime || '4 min read');
            const sAuthor = story.author_name || (story.author && story.author.name) || 'Chronicle Bureau';
            const sDate = story.publication_time ? formatRelativeTime(story.publication_time) : (story.published_at || 'Recent');

            return (
              <article key={story.id || story.slug} className="editorial-card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--color-ink-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="kicker kicker-neutral">{sKicker}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-500)' }}>{sReading}</span>
                </div>

                {sImage && (
                  <Link to={`/article/${sSlug}`}>
                    <div className="editorial-img-wrap" style={{ aspectRatio: '16/10', borderRadius: '2px', marginBottom: '0.45rem', overflow: 'hidden' }}>
                      <img src={sImage} alt={sAlt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  </Link>
                )}

                <Link to={`/article/${sSlug}`} style={{ textDecoration: 'none' }}>
                  <h3 className="headline-lead" style={{ fontSize: '1.2rem', lineHeight: 1.3 }}>
                    {sTitle}
                  </h3>
                </Link>

                {sSummary && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--color-ink-600)', lineHeight: 1.5, marginTop: '0.2rem' }}>
                    {sSummary}
                  </p>
                )}

                <div className="byline-text" style={{ marginTop: '0.35rem' }}>
                  <span>By <strong style={{ color: 'var(--color-ink-800)' }}>{sAuthor}</strong></span>
                  <span>•</span>
                  <span>{sDate}</span>
                </div>
              </article>
            );
          })}

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
              {wire.map((item) => {
                const wTime = item.publication_time ? formatRelativeTime(item.publication_time) : (item.time || 'Live');
                const wCategory = item.category_name || item.category || 'DISPATCH';
                return (
                  <div key={item.id || item.slug} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', paddingBottom: '0.65rem', borderBottom: '1px dashed var(--color-ink-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-breaking)' }}>
                        {wTime}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--color-ink-500)', textTransform: 'uppercase' }}>
                        {wCategory}
                      </span>
                    </div>
                    <Link 
                      to={`/article/${item.slug}`}
                      style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-ink-900)', lineHeight: 1.35, textDecoration: 'none' }}
                      onMouseEnter={(e) => e.target.style.color = 'var(--color-breaking)'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--color-ink-900)'}
                    >
                      {item.title}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OPINION & EDITORIAL ESSAYS */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-opinion)', paddingBottom: '0.45rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-opinion)' }}>
                Opinions & Comment
              </span>
              <Link to="/category/opinion" style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-opinion)', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {opList.map((op) => {
                const authorName = op.author_name || (op.author && op.author.name) || 'Editorial Board';
                const authorDesig = op.author_designation || (op.author && op.author.designation) || (op.author && op.author.title) || 'Guest Columnist';
                const authorAvatar = op.author_avatar || (op.author && op.author.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
                const excerpt = op.short_description || op.excerpt || op.summary;

                return (
                  <article key={op.id || op.slug} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--color-ink-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-ink-900)' }}>
                          {authorName}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--color-ink-500)', lineHeight: 1.2 }}>
                          {authorDesig}
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

                    {excerpt && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--color-ink-600)', lineHeight: 1.45 }}>
                        {excerpt}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
