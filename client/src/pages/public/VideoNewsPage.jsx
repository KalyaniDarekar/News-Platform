import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Video, Eye, Clock, Share2, RefreshCw, AlertCircle, Calendar, ExternalLink, Bell, Check } from 'lucide-react';
import apiService, { formatEditorialDate, formatRelativeTime } from '../../services/api';
import SkeletonLoader from '../../components/common/SkeletonLoader';

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export default function VideoNewsPage() {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [channelInfo, setChannelInfo] = useState({
    url: 'https://www.youtube.com/@TheBharatChronicle',
    name: 'The Bharat Chronicle Digital Newsroom'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadVideos() {
    setLoading(true);
    setError(null);
    try {
      const [vRes, sRes] = await Promise.all([
        apiService.getYoutubeVideos({ limit: 16 }),
        apiService.getPublicSettings()
      ]);

      const list = vRes.data || [];
      setVideos(list);
      if (list.length > 0) {
        setActiveVideo(list[0]);
      }

      if (sRes?.data?.youtube_channel_url) {
        setChannelInfo({
          url: sRes.data.youtube_channel_url,
          name: sRes.data.youtube_channel_name || 'The Bharat Chronicle Digital Newsroom'
        });
      }
    } catch (err) {
      console.error('Failed to load video news:', err);
      setError('Unable to load video news dispatches from broadcast server.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  const activeYouTubeId = activeVideo 
    ? (activeVideo.youtube_id || extractYouTubeId(activeVideo.youtube_url))
    : 'dQw4w9WgXcQ';

  const subscribeUrl = channelInfo.url.includes('?') 
    ? `${channelInfo.url}&sub_confirmation=1` 
    : `${channelInfo.url}?sub_confirmation=1`;

  if (loading) {
    return (
      <div style={{ backgroundColor: '#0a0e17', color: '#ffffff', minHeight: '80vh', padding: '3rem 0' }}>
        <div className="container-editorial">
          <SkeletonLoader count={1} type="hero" />
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) {
    return (
      <div style={{ backgroundColor: '#0a0e17', color: '#ffffff', minHeight: '80vh', padding: '4rem 0' }}>
        <div className="container-editorial" style={{ textAlign: 'center' }}>
          <div style={{ maxWidth: '480px', margin: '0 auto', backgroundColor: '#111827', border: '1px solid #1f2937', padding: '2.5rem', borderRadius: '4px' }}>
            <AlertCircle size={40} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f3f4f6', marginBottom: '0.5rem' }}>
              {error || 'No Video Broadcasts Available'}
            </h2>
            <p style={{ fontSize: '0.86rem', color: '#9ca3af', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Our multimedia production studio is preparing new video field dispatches. Please check back shortly.
            </p>
            <button
              onClick={loadVideos}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#dc2626',
                color: '#ffffff',
                padding: '0.6rem 1.25rem',
                borderRadius: '2px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 0,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} /> Refresh Video Desk
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0a0e17', color: '#ffffff', minHeight: '80vh', paddingBottom: '4rem' }}>
      
      {/* YouTube Channel Subscribe Banner */}
      <section style={{ backgroundColor: '#111827', borderBottom: '1px solid #1f2937', padding: '0.85rem 0' }}>
        <div className="container-editorial" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#ff0000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900
            }}>
              <Play size={16} fill="#ffffff" style={{ marginLeft: 2 }} />
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
                {channelInfo.name}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#9ca3af' }}>
                Official YouTube Broadcast Dispatch Channel • Ground Investigations & Mini-Docs
              </div>
            </div>
          </div>

          <a
            href={subscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#ff0000',
              color: '#ffffff',
              padding: '0.55rem 1.15rem',
              borderRadius: '4px',
              fontSize: '0.82rem',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)'
            }}
          >
            <Bell size={14} /> Subscribe on YouTube <ExternalLink size={12} />
          </a>
        </div>
      </section>

      {/* Featured Video Stage (Autoplay with sound disabled) */}
      <section style={{ backgroundColor: '#000000', padding: '2.5rem 0', borderBottom: '1px solid #1f2937' }}>
        <div className="container-editorial">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: '#ef4444', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Video size={16} /> Chronicle Multimedia Studio • Featured Documentary Broadcast
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '2.5rem',
            alignItems: 'center'
          }} className="video-feature-grid">
            
            {/* Video Player Canvas (Official YouTube Embed - autoplay=0 strict compliance) */}
            <div style={{
              position: 'relative',
              aspectRatio: '16/9',
              backgroundColor: '#111827',
              borderRadius: '3px',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.7)'
            }}>
              {activeYouTubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${activeYouTubeId}?autoplay=0&rel=0`}
                  title={activeVideo?.title || 'Featured Video'}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
              ) : (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <img
                    src={activeVideo?.thumbnail_url || activeVideo?.featured_image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
                    alt={activeVideo?.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 68,
                    height: 68,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)'
                  }}>
                    <Play size={28} fill="#ffffff" style={{ marginLeft: 3 }} />
                  </div>
                </div>
              )}
            </div>

            {/* Video Details & Track Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span className="badge-tag" style={{ backgroundColor: '#dc2626', color: '#ffffff', alignSelf: 'flex-start' }}>
                {activeVideo?.category_name || 'SPECIAL BROADCAST'}
              </span>

              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 2.8vw, 2.1rem)', fontWeight: 700, lineHeight: 1.25, color: '#f9fafb' }}>
                {activeVideo?.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#9ca3af', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={13} /> {formatEditorialDate(activeVideo?.published_at || activeVideo?.publication_time)}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> {formatRelativeTime(activeVideo?.published_at || activeVideo?.publication_time)}
                </span>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                {activeVideo?.description || activeVideo?.short_description || activeVideo?.summary || 'Exclusive ground reporting produced by The Bharat Chronicle Special Investigations Unit.'}
              </p>

              {activeVideo?.article_slug ? (
                <div style={{ marginTop: '0.5rem' }}>
                  <Link
                    to={`/article/${activeVideo.article_slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#f87171',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Read Attached Investigative Dispatch &rarr;
                  </Link>
                </div>
              ) : activeVideo?.slug && (
                <div style={{ marginTop: '0.5rem' }}>
                  <Link
                    to={`/article/${activeVideo.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#f87171',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Read Complete Written Investigation &rarr;
                  </Link>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* Video Playlist Grid */}
      <section className="container-editorial" style={{ paddingTop: '3.5rem' }}>
        <div style={{ borderBottom: '1px solid #374151', paddingBottom: '0.75rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffffff' }}>
            All Video Investigations & Interviews ({videos.length})
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#9ca3af' }}>
            CLICK ANY BROADCAST TO LOAD IN STAGE
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '2rem'
        }}>
          {videos.map((item) => {
            const isCurrent = activeVideo && (activeVideo.id === item.id || activeVideo.youtube_id === item.youtube_id);
            const thumb = item.thumbnail_url || item.featured_image || (item.youtube_id ? `https://img.youtube.com/vi/${item.youtube_id}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80');

            return (
              <div 
                key={item.id || item.youtube_id || item.slug} 
                onClick={() => { setActiveVideo(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  backgroundColor: '#111827',
                  padding: '0.85rem',
                  borderRadius: '2px',
                  border: isCurrent ? '2px solid #ef4444' : '1px solid #1f2937',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '2px', overflow: 'hidden' }}>
                  <img 
                    src={thumb} 
                    alt={item.title} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Play size={18} fill="#ffffff" style={{ marginLeft: 2 }} />
                  </div>
                  <span className="badge-tag badge-video" style={{ position: 'absolute', bottom: 6, right: 6 }}>
                    YOUTUBE
                  </span>
                </div>

                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
                    {item.category_name || (item.is_featured ? 'FEATURED' : 'DOCUMENTARY')}
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f3f4f6', lineHeight: 1.35, marginTop: '0.25rem' }}>
                    {item.title}
                  </h4>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <span>{formatRelativeTime(item.published_at || item.publication_time)}</span>
                  <span>Official YouTube Embed</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
