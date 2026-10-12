import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, Share2, Bookmark, Check, Volume2, MessageSquare, 
  ArrowLeft, ShieldCheck, Link as LinkIcon, Send 
} from 'lucide-react';
import AdBanner from '../../components/common/AdBanner';
import ArticleCard from '../../components/editorial/ArticleCard';
import { ALL_STORIES, LEAD_STORY } from '../../data/mockNewsData';
import apiService from '../../services/api';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      window.scrollTo(0, 0);
      const res = await apiService.getArticleBySlug(slug);
      setArticle(res.data || LEAD_STORY);
      setLoading(false);
    }
    loadArticle();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading || !article) {
    return (
      <div className="container-editorial" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ height: '32px', width: '60%', margin: '0 auto 1.5rem' }}></div>
        <div className="skeleton" style={{ height: '400px', width: '100%', margin: '0 auto' }}></div>
      </div>
    );
  }

  const categoryName = article.category_name || article.category || 'National';
  const categorySlug = article.category_slug || article.categorySlug || 'national';
  const authorName = article.author_name || (article.author && article.author.name) || 'Vikramaditya Sharma';
  const authorTitle = article.author_designation || (article.author && article.author.title) || 'Senior Editorial Correspondent';
  const authorAvatar = article.author_avatar || (article.author && article.author.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const publishedDate = article.published_at || article.publishedAt || 'October 12, 2026';
  const readingTime = article.reading_time_minutes ? `${article.reading_time_minutes} min read` : (article.readingTime || '6 min read');
  const imageUrl = article.featured_image || article.image;
  const imageCaption = article.image_caption || article.imageCaption || 'Photograph: Bureau Archives / The Bharat Chronicle';

  // Related stories (excluding current)
  const relatedStories = ALL_STORIES.filter(s => s.slug !== slug).slice(0, 3);

  return (
    <article style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      
      {/* Top Breadcrumb & Return Link */}
      <div className="container-editorial" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--color-ink-500)' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-ink-700)', fontWeight: 600 }}>
            <ArrowLeft size={13} /> News Home
          </Link>
          <span>/</span>
          <Link to={`/category/${categorySlug}`} style={{ color: 'var(--color-ink-700)', fontWeight: 700, textTransform: 'uppercase' }}>
            {categoryName}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--color-ink-400)' }}>Dispatch</span>
        </div>
      </div>

      {/* Main Article Header Container */}
      <div className="container-narrow">
        
        {/* Kicker */}
        {article.kicker && (
          <span className="kicker" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
            {article.kicker}
          </span>
        )}

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2rem, 3.8vw, 3.25rem)',
          fontWeight: 700,
          lineHeight: 1.15,
          color: 'var(--color-ink-950)',
          marginBottom: '1rem',
          letterSpacing: '-0.01em'
        }}>
          {article.title}
        </h1>

        {/* Lead Excerpt */}
        <p style={{
          fontSize: '1.2rem',
          lineHeight: 1.5,
          color: 'var(--color-ink-700)',
          fontFamily: 'var(--font-serif)',
          marginBottom: '1.5rem',
          borderLeft: '3px solid var(--color-breaking)',
          paddingLeft: '1rem'
        }}>
          {article.summary}
        </p>

        {/* Author Byline & Article Metadata Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1rem 0',
          borderTop: '1px solid var(--color-ink-200)',
          borderBottom: '1px solid var(--color-ink-200)',
          marginBottom: '1.75rem'
        }}>
          {/* Author info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src={authorAvatar}
              alt={authorName}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-ink-900)' }}>
                {authorName}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--color-ink-500)' }}>
                {authorTitle}
              </div>
            </div>
          </div>

          {/* Date, Reading Time & Audio Preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.76rem', color: 'var(--color-ink-500)' }}>
            <div>
              <div>Published: {publishedDate}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                <Clock size={12} /> {readingTime}
              </div>
            </div>

            {/* Audio Listen Button */}
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.75rem',
                backgroundColor: isPlayingAudio ? '#fef2f2' : '#f8fafc',
                color: isPlayingAudio ? 'var(--color-breaking)' : 'var(--color-ink-800)',
                border: isPlayingAudio ? '1px solid #fca5a5' : '1px solid var(--color-ink-300)',
                borderRadius: '2px',
                fontWeight: 700,
                fontSize: '0.74rem'
              }}
            >
              <Volume2 size={14} />
              {isPlayingAudio ? 'Playing Audio Dispatch...' : 'Listen to Report (6m)'}
            </button>
          </div>
        </div>

        {/* Social Share Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-500)', letterSpacing: '0.06em' }}>
              Share Dispatch:
            </span>
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '2px', backgroundColor: 'var(--color-ink-100)', color: 'var(--color-ink-700)', fontSize: '0.72rem', fontWeight: 700 }}
              title="Share on X"
            >
              𝕏
            </button>
            <button 
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '2px', backgroundColor: 'var(--color-ink-100)', color: 'var(--color-ink-700)', fontSize: '0.72rem', fontWeight: 700 }}
              title="Share on LinkedIn"
            >
              in
            </button>
            <button 
              onClick={handleCopyLink}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.25rem', 
                padding: '0.4rem 0.65rem', 
                borderRadius: '2px', 
                backgroundColor: copied ? '#dcfce7' : 'var(--color-ink-100)', 
                color: copied ? '#15803d' : 'var(--color-ink-700)',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
              title="Copy Story Link"
            >
              {copied ? <Check size={13} /> : <LinkIcon size={13} />}
              {copied ? 'Link Copied' : 'Copy'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--color-ink-500)' }}>
            <ShieldCheck size={14} style={{ color: '#059669' }} /> Double-Source Verified
          </div>
        </div>

      </div>

      {/* Featured Image Full Width Container */}
      <div className="container-editorial" style={{ marginBottom: '2.5rem' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div className="editorial-img-wrap" style={{ aspectRatio: '16/9', borderRadius: '2px' }}>
            <img src={imageUrl} alt={article.title} />
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--color-ink-500)', fontStyle: 'italic', marginTop: '0.5rem', textAlign: 'center' }}>
            {imageCaption}
          </div>
        </div>
      </div>

      {/* Article Body Content */}
      <div className="container-narrow">
        
        {/* Key Takeaways Box (Editorial Standard) */}
        {article.keyTakeaways && (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderLeft: '4px solid var(--color-ink-950)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            borderRadius: '2px'
          }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-900)', marginBottom: '0.65rem' }}>
              Key Editorial Takeaways
            </h4>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.92rem', color: 'var(--color-ink-800)', lineHeight: 1.5 }}>
              {article.keyTakeaways.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Formatted Typography Body */}
        <div 
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.15rem',
            lineHeight: 1.8,
            color: 'var(--color-ink-900)'
          }}
          dangerouslySetInnerHTML={{ __html: article.content || `<p>${article.summary}</p><p>Investigation continues with regional correspondent dispatches from the field.</p>` }}
        />

        {/* In-Article Advertisement Break */}
        <div style={{ margin: '2.5rem 0' }}>
          <AdBanner slot="headerLeaderboard" />
        </div>

        {/* Editorial Footnote / Source Disclosure */}
        <div style={{
          backgroundColor: '#fafbfc',
          border: '1px solid var(--color-ink-200)',
          padding: '1.25rem',
          marginTop: '2rem',
          borderRadius: '2px',
          fontSize: '0.78rem',
          color: 'var(--color-ink-600)',
          lineHeight: 1.5
        }}>
          <strong style={{ color: 'var(--color-ink-900)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Editorial Disclosure:</strong> The Bharat Chronicle adheres to strict verification protocols. Dispatches do not contain commercial product endorsements unless explicitly labeled as Partner Content. Report factual errors to <span style={{ color: 'var(--color-breaking)', textDecoration: 'underline' }}>corrections@bharatchronicle.com</span>.
        </div>

        {/* Author Bio Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '1.5rem 0',
          marginTop: '2rem',
          borderTop: '2px solid var(--color-ink-950)',
          borderBottom: '1px solid var(--color-ink-200)'
        }}>
          <img
            src={authorAvatar}
            alt={authorName}
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-ink-900)' }}>
              Written by {authorName}
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-600)', marginTop: '0.25rem', lineHeight: 1.4 }}>
              {authorTitle} for The Bharat Chronicle. Covers sovereign policy, geopolitics, and constitutional developments across South Asia.
            </p>
          </div>
        </div>

      </div>

      {/* Related Stories Section */}
      <section className="container-editorial" style={{ marginTop: '3.5rem' }}>
        <div className="section-header-editorial">
          <h3 className="section-title-editorial">
            Related Dispatches & Analysis
          </h3>
          <Link to={`/category/${categorySlug}`} className="section-link-more">
            More in {categoryName} →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          {relatedStories.map((story) => (
            <ArticleCard key={story.id} article={story} variant="standard" />
          ))}
        </div>
      </section>

    </article>
  );
}
