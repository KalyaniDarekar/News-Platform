import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Play } from 'lucide-react';
import { formatRelativeTime } from '../../services/api';

export default function ArticleCard({ 
  article, 
  variant = 'standard', // 'standard' | 'horizontal' | 'compact' | 'video'
  className = '' 
}) {
  if (!article) return null;

  const categoryName = article.category_name || article.category || 'General';
  const categorySlug = article.category_slug || article.categorySlug || 'national';
  const authorName = article.author_name || (article.author && article.author.name) || 'Chronicle Bureau';
  const publishedAt = article.publication_time 
    ? formatRelativeTime(article.publication_time) 
    : (article.published_at || article.publishedAt || 'Recent');
  const readingTime = article.reading_time_minutes 
    ? `${article.reading_time_minutes} min read` 
    : (article.readingTime || '4 min read');
  const imageUrl = article.featured_image || article.image || article.thumbnail;
  const altText = article.alt_text || article.altText || article.title;
  const summary = article.short_description || article.summary || article.excerpt;

  if (variant === 'horizontal') {
    return (
      <article className={`editorial-card-hover article-card-horizontal ${className}`} style={{
        display: 'grid',
        gridTemplateColumns: '180px 1fr',
        gap: '1.25rem',
        alignItems: 'start',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--color-ink-200)'
      }}>
        {imageUrl && (
          <Link to={`/article/${article.slug}`}>
            <div className="editorial-img-wrap" style={{ aspectRatio: '4/3', borderRadius: '2px', overflow: 'hidden' }}>
              <img 
                src={imageUrl} 
                alt={altText} 
                loading="lazy" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </Link>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to={`/category/${categorySlug}`} className="kicker kicker-neutral" style={{ textDecoration: 'none' }}>
              {article.kicker || categoryName}
            </Link>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-400)' }}>•</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-500)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
              <Clock size={11} /> {readingTime}
            </span>
          </div>

          <Link to={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
            <h3 className="headline-card" style={{ fontSize: '1.15rem' }}>
              {article.title}
            </h3>
          </Link>

          {summary && (
            <p style={{ fontSize: '0.84rem', color: 'var(--color-ink-600)', lineHeight: 1.45, marginTop: '0.15rem' }}>
              {summary}
            </p>
          )}

          <div className="byline-text" style={{ marginTop: '0.35rem' }}>
            <span>By <strong style={{ color: 'var(--color-ink-800)' }}>{authorName}</strong></span>
            <span>•</span>
            <span>{publishedAt}</span>
          </div>
        </div>
      </article>
    );
  }

  if (variant === 'video') {
    return (
      <article className={`editorial-card-hover ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <Link to={`/videos`} style={{ textDecoration: 'none' }}>
          <div className="editorial-img-wrap" style={{ aspectRatio: '16/9', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
            <img 
              src={imageUrl} 
              alt={altText} 
              loading="lazy" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
            {/* Play Button Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: 'rgba(201, 24, 43, 0.9)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
            }}>
              <Play size={20} fill="#ffffff" style={{ marginLeft: 3 }} />
            </div>

            {/* Video Duration */}
            <span className="badge-tag badge-video" style={{ position: 'absolute', bottom: 8, right: 8 }}>
              {article.duration || 'VIDEO'}
            </span>
          </div>
        </Link>

        <div>
          <span className="kicker" style={{ color: '#dc2626' }}>
            {categoryName || 'VIDEO DESK'}
          </span>
          <Link to={article.slug ? `/article/${article.slug}` : `/videos`} style={{ textDecoration: 'none' }}>
            <h3 className="headline-card" style={{ fontSize: '1.05rem', marginTop: '0.2rem' }}>
              {article.title}
            </h3>
          </Link>
          <div style={{ fontSize: '0.74rem', color: 'var(--color-ink-500)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{publishedAt}</span>
            <span>•</span>
            <span>{article.views ? `${article.views.toLocaleString()} views` : 'Editorial Broadcast'}</span>
          </div>
        </div>
      </article>
    );
  }

  // Standard Editorial Grid Card
  return (
    <article className={`editorial-card-hover ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      paddingBottom: '1.25rem'
    }}>
      {imageUrl && (
        <Link to={`/article/${article.slug}`}>
          <div className="editorial-img-wrap" style={{ aspectRatio: '16/10', borderRadius: '2px', marginBottom: '0.35rem', overflow: 'hidden' }}>
            <img 
              src={imageUrl} 
              alt={altText} 
              loading="lazy" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </Link>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to={`/category/${categorySlug}`} className="kicker kicker-neutral" style={{ textDecoration: 'none' }}>
          {article.kicker || categoryName}
        </Link>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-500)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
          <Clock size={11} /> {readingTime}
        </span>
      </div>

      <Link to={`/article/${article.slug}`} style={{ textDecoration: 'none' }}>
        <h3 className="headline-card">
          {article.title}
        </h3>
      </Link>

      {summary && (
        <p style={{ fontSize: '0.86rem', color: 'var(--color-ink-600)', lineHeight: 1.45, marginTop: '0.15rem' }}>
          {summary}
        </p>
      )}

      <div className="byline-text" style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
        <span>By <strong style={{ color: 'var(--color-ink-800)' }}>{authorName}</strong></span>
        <span>•</span>
        <span>{publishedAt}</span>
      </div>
    </article>
  );
}
