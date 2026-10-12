import React, { useState } from 'react';
import { Play, Video, Eye, Clock, Share2, Sparkles } from 'lucide-react';
import { MULTIMEDIA_STORIES } from '../../data/mockNewsData';

export default function VideoNewsPage() {
  const [activeVideo, setActiveVideo] = useState(MULTIMEDIA_STORIES[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div style={{ backgroundColor: '#0a0e17', color: '#ffffff', minHeight: '80vh', paddingBottom: '4rem' }}>
      
      {/* Featured Video Stage */}
      <section style={{ backgroundColor: '#000000', padding: '2rem 0', borderBottom: '1px solid #1f2937' }}>
        <div className="container-editorial">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#ef4444', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <Video size={16} /> Chronicle Multimedia Studio • Featured Documentary
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '2rem',
            alignItems: 'center'
          }} className="video-feature-grid">
            
            {/* Video Player Canvas Preview */}
            <div style={{
              position: 'relative',
              aspectRatio: '16/9',
              backgroundColor: '#111827',
              borderRadius: '3px',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6)'
            }}>
              <img
                src={activeVideo.thumbnail}
                alt={activeVideo.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPlaying ? 0.3 : 0.85 }}
              />

              {!isPlaying ? (
                <div 
                  onClick={() => setIsPlaying(true)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'radial-gradient(circle, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 100%)'
                  }}
                >
                  <div style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    backgroundColor: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)',
                    transition: 'transform 200ms ease'
                  }}>
                    <Play size={32} fill="#ffffff" style={{ marginLeft: 4 }} />
                  </div>
                  <span style={{ marginTop: '1rem', fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Watch Full Investigation ({activeVideo.duration})
                  </span>
                </div>
              ) : (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '2rem', textAlign: 'center' }}>
                  <Sparkles size={36} color="#fbbf24" />
                  <h4 style={{ fontSize: '1.25rem', marginTop: '1rem', fontWeight: 700 }}>Broadcasting Demo Stream</h4>
                  <p style={{ fontSize: '0.84rem', color: '#9ca3af', maxWidth: '440px', marginTop: '0.5rem' }}>
                    In production, Phase 2 connects this container to YouTube / Vimeo API or self-hosted HLS video streaming on cPanel/CDN.
                  </p>
                  <button 
                    onClick={() => setIsPlaying(false)}
                    style={{ marginTop: '1.25rem', padding: '0.45rem 1rem', backgroundColor: '#374151', color: '#ffffff', borderRadius: '2px', fontSize: '0.8rem', fontWeight: 700 }}
                  >
                    Reset Video
                  </button>
                </div>
              )}
            </div>

            {/* Video Details & Track Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <span className="badge-tag" style={{ backgroundColor: '#dc2626', color: '#ffffff', alignSelf: 'flex-start' }}>
                {activeVideo.category}
              </span>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25, color: '#f9fafb' }}>
                {activeVideo.title}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> {activeVideo.duration}
                </span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Eye size={13} /> {activeVideo.views}
                </span>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: '0.5rem' }}>
                Exclusive ground report produced by The Bharat Chronicle Special Investigations Unit. Verified audio-visual evidence, expert testimonies, and satellite reconnaissance.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Video Playlist Grid */}
      <section className="container-editorial" style={{ paddingTop: '3rem' }}>
        <div style={{ borderBottom: '1px solid #374151', paddingBottom: '0.75rem', marginBottom: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ffffff' }}>
            Latest Video Dispatches & Interviews
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {MULTIMEDIA_STORIES.map((item) => (
            <div 
              key={item.id} 
              onClick={() => { setActiveVideo(item); setIsPlaying(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                backgroundColor: '#111827',
                padding: '0.75rem',
                borderRadius: '2px',
                border: activeVideo.id === item.id ? '1px solid #ef4444' : '1px solid #1f2937'
              }}
            >
              <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '2px', overflow: 'hidden' }}>
                <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span className="badge-tag badge-video" style={{ position: 'absolute', bottom: 6, right: 6 }}>
                  {item.duration}
                </span>
              </div>

              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f3f4f6', lineHeight: 1.35 }}>
                {item.title}
              </h4>

              <div style={{ fontSize: '0.74rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.category}</span>
                <span>{item.views}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
