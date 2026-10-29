import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  formatPublishTime, 
  getMediaUrl, 
  handleImageError, 
  DEFAULT_NEWS_IMAGE, 
  DEFAULT_AVATAR_IMAGE 
} from '../../services/api';
import { isMarathi, getHeadlineClass } from '../../utils/language';

/**
 * SpotlightAutoScroll: Smooth, slow vertical auto-scroller for Spotlight Analysis (Column 2)
 * Smoothly scrolls upward at ~24px/sec, pauses on hover/focus/touch,
 * seamless loop with zero sudden jumps, respects prefers-reduced-motion.
 */
function SpotlightAutoScroll({ items = [] }) {
  const containerRef = useRef(null);
  const firstBlockRef = useRef(null);
  const scrollPosRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchTimerRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !items || items.length <= 1) return;

    let lastTime = performance.now();
    const speed = 24; // 24px per second (20-30 px/s range)

    const loop = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const container = containerRef.current;
      const firstBlock = firstBlockRef.current;

      if (!isPaused && container && firstBlock) {
        const firstHeight = firstBlock.offsetHeight;
        if (container.scrollHeight > container.clientHeight && firstHeight > 0) {
          scrollPosRef.current += speed * delta;
          if (scrollPosRef.current >= firstHeight) {
            scrollPosRef.current -= firstHeight;
          }
          container.scrollTop = scrollPosRef.current;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, [isPaused, items]);

  const handleTouchStart = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      if (containerRef.current) scrollPosRef.current = containerRef.current.scrollTop;
      setIsPaused(false);
    }, 2000);
  };

  const handleScroll = () => {
    if (isPaused && containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollTop;
    }
  };

  if (!items || items.length === 0) return null;

  const canLoop = items.length > 1;

  const renderStory = (story, idx, isClone = false, prefix = 'p') => {
    const sTitle = story.title;
    const sSlug = story.slug;
    const sKicker = story.kicker || story.category_name || 'FEATURE';
    const sImage = getMediaUrl(story.featured_image || story.image);
    const sAlt = story.alt_text || story.title;
    const sSummary = story.short_description || story.summary;
    const sReading = story.reading_time_minutes ? `${story.reading_time_minutes} min read` : (story.readingTime || '4 min read');
    const sAuthor = story.author_name || (story.author && story.author.name) || 'Chronicle Bureau';
    const sDate = story.publication_time ? formatPublishTime(story.publication_time) : (story.published_at || 'Recent');

    return (
      <article 
        key={`${prefix}-spot-${story.id || story.slug || idx}`} 
        className="editorial-card-hover" 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem', 
          paddingBottom: '1.25rem', 
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--color-ink-200)' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="kicker kicker-neutral">{sKicker}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-ink-500)' }}>{sReading}</span>
        </div>

        {sImage && (
          <Link to={`/article/${sSlug}`} tabIndex={isClone ? -1 : undefined}>
            <div className="editorial-img-wrap" style={{ aspectRatio: '16/10', borderRadius: '2px', marginBottom: '0.45rem', overflow: 'hidden' }}>
              <img src={sImage} alt={sAlt} onError={handleImageError} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </Link>
        )}

        <Link to={`/article/${sSlug}`} style={{ textDecoration: 'none' }} tabIndex={isClone ? -1 : undefined}>
          <h3 className={getHeadlineClass('headline-lead', story)} style={{ fontSize: isMarathi(story) ? '1.05rem' : '1.2rem', lineHeight: 1.35 }}>
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
  };

  return (
    <div
      ref={containerRef}
      className="editorial-auto-scroll"
      onScroll={handleScroll}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (containerRef.current) scrollPosRef.current = containerRef.current.scrollTop;
        setIsPaused(false);
      }}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => {
        if (containerRef.current) scrollPosRef.current = containerRef.current.scrollTop;
        setIsPaused(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        maxHeight: '660px',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <div ref={firstBlockRef}>
        {items.map((story, idx) => renderStory(story, idx, false, 'p'))}
      </div>
      {canLoop && (
        <div aria-hidden="true">
          {items.map((story, idx) => renderStory(story, idx, true, 'c'))}
        </div>
      )}
    </div>
  );
}

/**
 * FastWireAutoScroll: Smooth, slow vertical auto-scroller for The Fast Wire (Column 3)
 * Exact same smooth scrolling engine and speed (24px/sec) as Spotlight Analysis.
 */
function FastWireAutoScroll({ items = [] }) {
  const containerRef = useRef(null);
  const firstBlockRef = useRef(null);
  const scrollPosRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchTimerRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !items || items.length <= 1) return;

    let lastTime = performance.now();
    const speed = 24; // 24px per second (exact same speed as Spotlight Analysis)

    const loop = (currentTime) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const container = containerRef.current;
      const firstBlock = firstBlockRef.current;

      if (!isPaused && container && firstBlock) {
        const firstHeight = firstBlock.offsetHeight;
        if (container.scrollHeight > container.clientHeight && firstHeight > 0) {
          scrollPosRef.current += speed * delta;
          if (scrollPosRef.current >= firstHeight) {
            scrollPosRef.current -= firstHeight;
          }
          container.scrollTop = scrollPosRef.current;
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    };
  }, [isPaused, items]);

  const handleTouchStart = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    touchTimerRef.current = setTimeout(() => {
      if (containerRef.current) scrollPosRef.current = containerRef.current.scrollTop;
      setIsPaused(false);
    }, 2000);
  };

  const handleScroll = () => {
    if (isPaused && containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollTop;
    }
  };

  if (!items || items.length === 0) return null;

  const canLoop = items.length > 1;

  const renderItem = (item, idx, isClone = false, prefix = 'p') => {
    const wTime = item.publication_time ? formatPublishTime(item.publication_time) : (item.time || 'Live');
    const wCategory = item.category_name || item.category || 'DISPATCH';

    return (
      <div 
        key={`${prefix}-wire-${item.id || item.slug || idx}`} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.2rem', 
          paddingBottom: '0.65rem', 
          marginBottom: '0.65rem',
          borderBottom: '1px dashed var(--color-ink-200)' 
        }}
      >
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
          tabIndex={isClone ? -1 : undefined}
          style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-ink-900)', lineHeight: 1.35, textDecoration: 'none' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--color-breaking)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--color-ink-900)'}
        >
          {item.title}
        </Link>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className="editorial-auto-scroll"
      onScroll={handleScroll}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (containerRef.current) scrollPosRef.current = containerRef.current.scrollTop;
        setIsPaused(false);
      }}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => {
        if (containerRef.current) scrollPosRef.current = containerRef.current.scrollTop;
        setIsPaused(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        maxHeight: '280px',
        overflowY: 'auto',
        position: 'relative'
      }}
    >
      <div ref={firstBlockRef}>
        {items.map((item, idx) => renderItem(item, idx, false, 'p'))}
      </div>
      {canLoop && (
        <div aria-hidden="true">
          {items.map((item, idx) => renderItem(item, idx, true, 'c1'))}
          {items.map((item, idx) => renderItem(item, idx, true, 'c2'))}
        </div>
      )}
    </div>
  );
}

export default function HeroPackage({ 
  leadStory, 
  specialReportStories = [],
  secondaryStories = [], 
  wireUpdates = [], 
  opinions = [] 
}) {
  const navigate = useNavigate();
  const secondaries = secondaryStories || [];
  const wire = wireUpdates || [];
  const opList = opinions || [];

  // Determine eligible special report slides; fallback to leadStory
  const slides = (specialReportStories && specialReportStories.length > 0)
    ? specialReportStories
    : (leadStory ? [leadStory] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fadeState, setFadeState] = useState(true);

  // Automatically switch to the next article every 6 seconds
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setFadeState(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setFadeState(true);
      }, 160);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length, currentIndex]);

  const changeSlide = (newIndex) => {
    setFadeState(false);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setFadeState(true);
    }, 160);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    changeSlide((currentIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    changeSlide((currentIndex + 1) % slides.length);
  };

  const handleGoTo = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (idx !== currentIndex) {
      changeSlide(idx);
    }
  };

  if (slides.length === 0) {
    return (
      <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid var(--color-ink-200)', margin: '1.5rem 0' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-ink-900)', marginBottom: '0.4rem' }}>
          No Articles Published Yet
        </h2>
        <p style={{ margin: 0, color: 'var(--color-ink-500)', fontSize: '0.88rem' }}>
          The editorial desk is currently preparing the latest dispatches. Published stories will appear here in real-time.
        </p>
      </div>
    );
  }

  const safeIndex = currentIndex % slides.length;
  const current = slides[safeIndex] || slides[0];

  const leadTitle = current.title;
  const leadSlug = current.slug;
  const leadSummary = current.short_description || current.summary;
  const leadImage = getMediaUrl(current.featured_image || current.image);
  const leadAlt = current.alt_text || current.title;
  const leadKicker = current.kicker || 'SPECIAL REPORT';
  const categoryName = current.category_name || (current.category && current.category.name) || current.category;
  const leadReadingTime = current.reading_time_minutes ? `${current.reading_time_minutes} min read` : (current.readingTime || '5 min read');
  const leadAuthorName = current.author_name || (current.author && current.author.name) || 'Staff Reporter';
  const leadAuthorTitle = current.author_designation || (current.author && current.author.title) || 'Editorial Bureau';
  const leadAuthorAvatar = getMediaUrl(current.author_avatar || (current.author && current.author.avatar), DEFAULT_AVATAR_IMAGE);
  const leadPublishedAt = current.publication_time ? formatPublishTime(current.publication_time) : (current.published_at || current.publishedAt || 'Today');

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    if (leadSlug) {
      navigate(`/article/${leadSlug}`);
    }
  };

  return (
    <section style={{ paddingTop: '1.5rem', paddingBottom: '2.5rem' }}>
      
      {/* Editorial Grid: 3-Column Asymmetric Balance (Lead 55%, Secondary 23%, Wire & Opinion 22%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.35fr) minmax(0, 0.75fr) minmax(0, 0.9fr)',
        gap: '2rem',
        alignItems: 'start'
      }} className="hero-package-grid">
        
        {/* ================= COLUMN 1: THE SPECIAL REPORT AUTOMATIC SLIDER ================= */}
        <article 
          className="editorial-card-hover special-report-slider"
          onClick={handleCardClick}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.85rem',
            position: 'relative',
            cursor: 'pointer'
          }}
        >
          {/* Top Category / Kicker, Reading Time & Slider Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <span className="kicker" style={{ margin: 0, color: 'var(--color-breaking)' }}>
                {leadKicker}
              </span>
              {categoryName && (
                <span style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                  • {categoryName}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-ink-500)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {leadReadingTime}
              </span>

              {slides.length > 1 && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous special report"
                    title="Previous story"
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-ink-300)',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--color-ink-700)',
                      padding: 0,
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-breaking)';
                      e.currentTarget.style.color = 'var(--color-breaking)';
                      e.currentTarget.style.backgroundColor = 'var(--color-breaking-soft)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-ink-300)';
                      e.currentTarget.style.color = 'var(--color-ink-700)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <ChevronLeft size={14} />
                  </button>

                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-ink-600)', minWidth: '2.5rem', textAlign: 'center' }}>
                    {safeIndex + 1} / {slides.length}
                  </span>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next special report"
                    title="Next story"
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-ink-300)',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--color-ink-700)',
                      padding: 0,
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-breaking)';
                      e.currentTarget.style.color = 'var(--color-breaking)';
                      e.currentTarget.style.backgroundColor = 'var(--color-breaking-soft)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-ink-300)';
                      e.currentTarget.style.color = 'var(--color-ink-700)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Animated Slide Content (Smooth Opacity & Subtle Y-Translation) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            opacity: fadeState ? 1 : 0.25,
            transform: fadeState ? 'translateY(0)' : 'translateY(3px)',
            transition: 'opacity 160ms ease, transform 160ms ease'
          }}>
            {/* Clickable Large Red Serif Headline */}
            <Link to={`/article/${leadSlug}`} style={{ textDecoration: 'none' }}>
              <h1 
                className={getHeadlineClass('headline-hero', current)}
                style={{
                  color: 'var(--color-breaking)',
                  marginBottom: '0.75rem',
                  transition: 'color var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-breaking-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-breaking)'}
              >
                {leadTitle}
              </h1>
            </Link>

            {/* Featured Image with Caption */}
            {leadImage && (
              <Link to={`/article/${leadSlug}`}>
                <div className="editorial-img-wrap" style={{ aspectRatio: '16/9', borderRadius: '2px', overflow: 'hidden' }}>
                  <img 
                    src={leadImage} 
                    alt={leadAlt}
                    onError={handleImageError}
                    loading="eager"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </Link>
            )}
            <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-500)', fontStyle: 'italic', marginTop: '-0.35rem' }}>
              {current.image_caption || current.imageCaption || `Photograph: Bureau Archives / JANTA JOURNAL`}
            </div>

            {/* Slide Indicators (Pills) */}
            {slides.length > 1 && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  marginTop: '0.2rem', 
                  marginBottom: '0.1rem' 
                }}
              >
                {slides.map((s, idx) => (
                  <button
                    key={s.id || s.slug || idx}
                    type="button"
                    onClick={(e) => handleGoTo(idx, e)}
                    aria-label={`Go to special report ${idx + 1}`}
                    title={`Slide ${idx + 1}: ${s.title}`}
                    style={{
                      width: idx === safeIndex ? 24 : 8,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: idx === safeIndex ? 'var(--color-breaking)' : 'var(--color-ink-300)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 250ms ease'
                    }}
                  />
                ))}
              </div>
            )}

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
              marginTop: '0.5rem',
              flexWrap: 'wrap',
              gap: '0.65rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <img
                  src={leadAuthorAvatar}
                  alt={leadAuthorName}
                  onError={(e) => handleImageError(e, DEFAULT_AVATAR_IMAGE)}
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

              <div style={{ fontSize: '0.74rem', color: 'var(--color-ink-500)', whiteSpace: 'nowrap' }}>
                {leadPublishedAt}
              </div>
            </div>
          </div>
        </article>

        {/* ================= COLUMN 2: SECONDARY LEADS (SPOTLIGHT ANALYSIS AUTO-SCROLL) ================= */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--color-ink-200)',
          paddingLeft: '1.5rem'
        }} className="secondary-leads-col">
          
          <div style={{ borderBottom: '1px solid var(--color-ink-950)', paddingBottom: '0.35rem', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-ink-900)' }}>
              Spotlight Analysis
            </span>
          </div>

          <SpotlightAutoScroll items={secondaries} />

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
          
          {/* THE 10-MINUTE WIRE (AUTO-SCROLL) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid var(--color-ink-950)', paddingBottom: '0.45rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-950)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="pulse-dot" style={{ width: 6, height: 6 }}></span> The Fast Wire
              </span>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-500)' }}>LIVE STREAM</span>
            </div>

            <FastWireAutoScroll items={wire} />
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
                const authorAvatar = getMediaUrl(op.author_avatar || (op.author && op.author.avatar), DEFAULT_AVATAR_IMAGE);
                const excerpt = op.short_description || op.excerpt || op.summary;

                return (
                  <article key={op.id || op.slug} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--color-ink-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={authorAvatar}
                        alt={authorName}
                        onError={(e) => handleImageError(e, DEFAULT_AVATAR_IMAGE)}
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
                      <h4 
                        className={getHeadlineClass('headline-compact', op)}
                        style={{ 
                          fontFamily: isMarathi(op) ? 'var(--font-marathi)' : 'var(--font-serif)', 
                          fontStyle: isMarathi(op) ? 'normal' : 'italic',
                          fontSize: isMarathi(op) ? '0.88rem' : '0.98rem', 
                          fontWeight: 600, 
                          lineHeight: 1.4, 
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
