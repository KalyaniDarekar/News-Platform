import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Clock, Share2, Check, Volume2, ArrowLeft, ShieldCheck, 
  Link as LinkIcon, RefreshCw, AlertCircle, AlertTriangle, 
  MessageSquare, ExternalLink, Calendar, User, Tag
} from 'lucide-react';
import AdBanner from '../../components/common/AdBanner';
import ArticleCard from '../../components/editorial/ArticleCard';
import apiService, { formatEditorialDate, formatRelativeTime } from '../../services/api';

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      setLoading(true);
      setNotFound(false);
      setError(null);
      window.scrollTo(0, 0);

      try {
        const res = await apiService.getArticleBySlug(slug);
        if (!res || !res.data) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const art = res.data;
        setArticle(art);

        // Fetch related articles via backend
        try {
          const relRes = await apiService.getRelatedArticles(slug, 3);
          setRelatedArticles(relRes.data || []);
        } catch (e) {
          console.warn('Could not fetch related articles:', e);
        }

      } catch (err) {
        console.error('Failed to load article:', err);
        if (err.message && err.message.includes('404')) {
          setNotFound(true);
        } else {
          setError('Unable to load dispatch from newsroom servers.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [slug]);

  // Inject SEO Title, Canonical URL & Schema.org NewsArticle + BreadcrumbList JSON-LD
  useEffect(() => {
    if (!article) return;

    const originalTitle = document.title;
    document.title = `${article.title} - The Bharat Chronicle`;

    // Meta description update
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    const oldDesc = metaDesc.content;
    metaDesc.content = article.short_description || article.summary || article.title;

    // Canonical link tag management
    let canonical = document.querySelector('link[rel="canonical"]');
    let createdCanonical = false;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
      createdCanonical = true;
    }
    const oldCanonical = canonical.href;
    canonical.href = window.location.href;

    // Structured Data JSON-LD (NewsArticle + BreadcrumbList)
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-structured-data';
    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'NewsArticle',
          '@id': `${window.location.href}#article`,
          'headline': article.title,
          'description': article.short_description || article.summary,
          'image': [article.featured_image || 'https://bharatchronicle.com/default.jpg'],
          'datePublished': article.publication_time || new Date().toISOString(),
          'dateModified': article.updated_at || article.publication_time || new Date().toISOString(),
          'author': [{
            '@type': 'Person',
            'name': article.author_name || 'Chronicle Bureau Correspondent',
            'jobTitle': article.author_designation || 'Editorial Staff'
          }],
          'publisher': {
            '@type': 'NewsMediaOrganization',
            'name': 'The Bharat Chronicle',
            'url': window.location.origin,
            'logo': {
              '@type': 'ImageObject',
              'url': `${window.location.origin}/logo.png`
            }
          },
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': window.location.href
          }
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${window.location.href}#breadcrumb`,
          'itemListElement': [
            {
              '@type': 'ListItem',
              'position': 1,
              'name': 'News Home',
              'item': window.location.origin
            },
            {
              '@type': 'ListItem',
              'position': 2,
              'name': article.category_name || article.category || 'National',
              'item': `${window.location.origin}/category/${article.category_slug || 'national'}`
            },
            {
              '@type': 'ListItem',
              'position': 3,
              'name': article.title,
              'item': window.location.href
            }
          ]
        }
      ]
    };
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.content = oldDesc;
      if (canonical) {
        if (createdCanonical) canonical.remove();
        else canonical.href = oldCanonical;
      }
      const el = document.getElementById('article-structured-data');
      if (el) el.remove();
    };
  }, [article]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="container-editorial" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="skeleton" style={{ height: '24px', width: '35%', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '48px', width: '90%', marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: '20px', width: '70%', marginBottom: '2rem' }} />
          <div className="skeleton" style={{ height: '420px', width: '100%', borderRadius: '4px' }} />
        </div>
      </div>
    );
  }

  // Not Found / Expired state
  if (notFound || (!article && !error)) {
    return (
      <div className="container-editorial" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '540px', margin: '0 auto', backgroundColor: '#fafbfc', border: '1px solid var(--color-ink-200)', borderRadius: '4px', padding: '2.5rem' }}>
          <AlertCircle size={44} style={{ color: 'var(--color-ink-500)', margin: '0 auto 1.25rem' }} />
          <h1 style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-ink-950)', marginBottom: '0.75rem' }}>
            Story Not Found or Expired
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-ink-600)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            The requested dispatch could not be located in our active public registry. The Bharat Chronicle automatically unpublishes expired or embargoed content to protect archival integrity.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/"
              style={{
                backgroundColor: 'var(--color-ink-950)',
                color: '#ffffff',
                padding: '0.65rem 1.25rem',
                borderRadius: '2px',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Return to Front Page
            </Link>
            <Link
              to="/search"
              style={{
                backgroundColor: 'var(--color-ink-100)',
                color: 'var(--color-ink-900)',
                padding: '0.65rem 1.25rem',
                borderRadius: '2px',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Search Published Archives
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-editorial" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', padding: '2rem' }}>
          <AlertTriangle size={36} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.5rem' }}>
            Transmission Error
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#7f1d1d', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--color-ink-950)',
              color: '#ffffff',
              padding: '0.65rem 1.25rem',
              borderRadius: '2px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const categoryName = article.category_name || article.category || 'National';
  const categorySlug = article.category_slug || article.categorySlug || 'national';
  const authorName = article.author_name || (article.author && article.author.name) || 'Vikramaditya Sharma';
  const authorTitle = article.author_designation || (article.author && article.author.title) || 'Senior Editorial Correspondent';
  const authorAvatar = article.author_avatar || (article.author && article.author.avatar) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
  const publishedDate = article.publication_time 
    ? formatEditorialDate(article.publication_time) 
    : (article.published_at || article.publishedAt || 'October 2026');
  const relativeTime = article.publication_time ? formatRelativeTime(article.publication_time) : 'Recent';
  const readingTime = article.reading_time_minutes 
    ? `${article.reading_time_minutes} min read` 
    : (article.readingTime || '5 min read');
  const imageUrl = article.featured_image || article.image;
  const imageAlt = article.alt_text || article.title;
  const imageCaption = article.image_caption || article.imageCaption || 'Photograph: Bureau Archives / The Bharat Chronicle';
  const youtubeId = extractYouTubeId(article.youtube_url);

  // Parse tags
  let tagsList = [];
  if (Array.isArray(article.tags)) {
    tagsList = article.tags;
  } else if (typeof article.tags === 'string' && article.tags.trim()) {
    try {
      tagsList = JSON.parse(article.tags);
    } catch {
      tagsList = article.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  // Check if article has an editorial update or correction
  const hasUpdate = Boolean(article.updated_at && article.publication_time && new Date(article.updated_at).getTime() - new Date(article.publication_time).getTime() > 1000 * 60 * 10);
  const updatedDate = hasUpdate ? formatEditorialDate(article.updated_at) : null;

  return (
    <article style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      
      {/* Top Breadcrumb & Return Link */}
      <div className="container-editorial" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.78rem', color: 'var(--color-ink-500)' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-ink-700)', fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={13} /> News Home
          </Link>
          <span>/</span>
          <Link to={`/category/${categorySlug}`} style={{ color: 'var(--color-ink-700)', fontWeight: 700, textTransform: 'uppercase', textDecoration: 'none' }}>
            {categoryName}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--color-ink-400)' }}>Editorial Dispatch</span>
        </div>
      </div>

      {/* Main Article Header Container */}
      <div className="container-narrow">
        
        {/* Kicker */}
        {article.kicker && (
          <span className="kicker" style={{ fontSize: '0.82rem', marginBottom: '0.5rem', display: 'inline-block' }}>
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
        {(article.short_description || article.summary) && (
          <p style={{
            fontSize: '1.2rem',
            lineHeight: 1.5,
            color: 'var(--color-ink-700)',
            fontFamily: 'var(--font-serif)',
            marginBottom: '1.5rem',
            borderLeft: '3px solid var(--color-breaking)',
            paddingLeft: '1rem'
          }}>
            {article.short_description || article.summary}
          </p>
        )}

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
          marginBottom: '1.5rem'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.76rem', color: 'var(--color-ink-500)', flexWrap: 'wrap' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={12} />
                <span>Published: {publishedDate} ({relativeTime})</span>
              </div>
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
                fontSize: '0.74rem',
                cursor: 'pointer'
              }}
            >
              <Volume2 size={14} />
              {isPlayingAudio ? 'Audio Stream Playing...' : 'Listen to Report (5m)'}
            </button>
          </div>
        </div>

        {/* Social Share Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-500)', letterSpacing: '0.06em' }}>
              Share Dispatch:
            </span>
            <button 
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '2px', backgroundColor: 'var(--color-ink-100)', color: 'var(--color-ink-700)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              title="Share on X (Twitter)"
            >
              𝕏 Post
            </button>
            <button 
              onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '2px', backgroundColor: 'var(--color-ink-100)', color: 'var(--color-ink-700)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              title="Share on LinkedIn"
            >
              LinkedIn
            </button>
            <button 
              onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${article.title} - ${window.location.href}`)}`, '_blank')}
              style={{ padding: '0.4rem 0.6rem', borderRadius: '2px', backgroundColor: 'var(--color-ink-100)', color: '#16a34a', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
              title="Share on WhatsApp"
            >
              WhatsApp
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
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="Copy Story Link"
            >
              {copied ? <Check size={13} /> : <LinkIcon size={13} />}
              {copied ? 'Link Copied' : 'Copy Link'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--color-ink-500)' }}>
            <ShieldCheck size={14} style={{ color: '#059669' }} /> Double-Source Editorial Verification
          </div>
        </div>

        {/* Editorial Correction / Update Banner (if applicable) */}
        {(hasUpdate || article.correction_note) && (
          <div style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #3b82f6',
            padding: '0.85rem 1.25rem',
            marginBottom: '1.75rem',
            borderRadius: '2px',
            fontSize: '0.82rem',
            color: '#1e3a8a',
            lineHeight: 1.5
          }}>
            <strong style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Editorial Notice:</strong>{' '}
            {article.correction_note || `This report was updated on ${updatedDate} to include latest field developments and official statements.`}
          </div>
        )}

      </div>

      {/* Featured Image Full Width Container */}
      {imageUrl && (
        <div className="container-editorial" style={{ marginBottom: '2.5rem' }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div className="editorial-img-wrap" style={{ aspectRatio: '16/9', borderRadius: '2px', overflow: 'hidden' }}>
              <img 
                src={imageUrl} 
                alt={imageAlt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--color-ink-500)', fontStyle: 'italic', marginTop: '0.5rem', textAlign: 'center' }}>
              {imageCaption}
            </div>
          </div>
        </div>
      )}

      {/* Embedded YouTube Video (if supplied) */}
      {youtubeId && (
        <div className="container-narrow" style={{ marginBottom: '2.5rem' }}>
          <div style={{ borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-breaking)' }}>
              Multimedia Investigation • Embedded Video
            </span>
          </div>
          <div style={{
            position: 'relative',
            aspectRatio: '16/9',
            backgroundColor: '#000000',
            borderRadius: '2px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
              title={`${article.title} - Video Broadcast`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
            />
          </div>
        </div>
      )}

      {/* Article Body & Sidebar Grid Layout */}
      <div className="container-editorial" style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <div className="article-body-grid">
          
          {/* Main Reading Column */}
          <div style={{ minWidth: 0 }}>
            {/* Key Takeaways Box (if present) */}
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
                fontSize: '1.18rem',
                lineHeight: 1.85,
                color: 'var(--color-ink-900)',
                wordBreak: 'break-word'
              }}
              dangerouslySetInnerHTML={{ 
                __html: article.article_body || article.content || `<p>${article.short_description || article.summary || ''}</p><p>Investigation continues with regional correspondent dispatches from the field.</p>` 
              }}
            />

            {/* Non-obstructive In-Article Advertisement Slot */}
            <div style={{ margin: '2.5rem 0' }}>
              <AdBanner slot="inline" />
            </div>

            {/* Tags / Taxonomies */}
            {tagsList.length > 0 && (
              <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-ink-200)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-ink-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Tag size={13} /> TOPICS:
                </span>
                {tagsList.map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.6rem',
                      backgroundColor: 'var(--color-ink-100)',
                      color: 'var(--color-ink-800)',
                      borderRadius: '2px',
                      textDecoration: 'none'
                    }}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

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
              <strong style={{ color: 'var(--color-ink-900)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Editorial Standards & Code:</strong> The Bharat Chronicle adheres strictly to Press Council of India standards. Dispatches do not contain undisclosed commercial endorsements. Report factual errors to <span style={{ color: 'var(--color-breaking)', textDecoration: 'underline' }}>corrections@bharatchronicle.com</span>.
            </div>

            {/* Author Bio Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.25rem',
              padding: '1.5rem 0',
              marginTop: '2rem',
              borderTop: '2px solid var(--color-ink-950)',
              borderBottom: '1px solid var(--color-ink-200)'
            }}>
              <img
                src={authorAvatar}
                alt={authorName}
                style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-ink-900)' }}>
                  Written by {authorName}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-ink-600)', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  {authorTitle} for The Bharat Chronicle. Covers constitutional policy, national affairs, and economic developments.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Right Sidebar */}
          <aside className="article-desktop-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Desktop Sidebar Ad Slot */}
            <div>
              <div style={{ fontSize: '0.66rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-400)', marginBottom: '0.35rem', textAlign: 'center' }}>
                SPONSOR SHOWCASE
              </div>
              <AdBanner slot="sidebarRectangle" />
            </div>

            {/* Direct Advertiser Desk Teaser */}
            <div style={{
              backgroundColor: '#fafbfc',
              border: '1px solid var(--color-ink-200)',
              borderRadius: '3px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem'
            }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--color-breaking)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                COMMERCIAL DESK
              </span>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-ink-950)', margin: 0, lineHeight: 1.3 }}>
                Advertise With The Bharat Chronicle
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-ink-600)', margin: 0, lineHeight: 1.45 }}>
                Direct advertiser packages across 7 audited positions. Access decision-makers across business, policy, and public leadership.
              </p>
              <Link
                to="/advertise"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: 'var(--color-ink-950)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  borderBottom: '1.5px solid var(--color-ink-900)',
                  alignSelf: 'flex-start',
                  paddingBottom: '2px',
                  marginTop: '0.25rem'
                }}
              >
                Media Kit & Rate Inquiries →
              </Link>
            </div>

            {/* Editorial Independence Assurance */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '3px',
              padding: '1rem',
              fontSize: '0.75rem',
              color: '#475569',
              lineHeight: 1.45
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.35rem' }}>
                <ShieldCheck size={14} color="#059669" /> Editorial Independence
              </div>
              The Bharat Chronicle newsroom operates autonomously from commercial sponsorships. Paid placements are strictly labeled.
            </div>
          </aside>

        </div>
      </div>

      {/* Related Stories Section */}
      {relatedArticles.length > 0 && (
        <section className="container-editorial" style={{ marginTop: '3.5rem' }}>
          <div className="section-header-editorial">
            <h3 className="section-title-editorial">
              Related Dispatches & Analysis
            </h3>
            <Link to={`/category/${categorySlug}`} className="section-link-more" style={{ textDecoration: 'none' }}>
              More in {categoryName} →
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.75rem'
          }}>
            {relatedArticles.map((story) => (
              <ArticleCard key={story.id || story.slug} article={story} variant="standard" />
            ))}
          </div>
        </section>
      )}

    </article>
  );
}
