import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Copy, Check, Trash2, Search, Filter } from 'lucide-react';
import { ALL_STORIES } from '../../data/mockNewsData';

export default function AdminMediaPage() {
  const [copiedId, setCopiedId] = useState(null);
  const [mediaItems, setMediaItems] = useState([
    {
      id: 1,
      filename: 'semiconductor-cleanroom-dholera.jpg',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
      size: '1.4 MB',
      dimensions: '1920x1080',
      uploadedBy: 'Rajeshwari Nair',
      date: 'Oct 12, 2026'
    },
    {
      id: 2,
      filename: 'reserve-bank-mumbai-headquarters.jpg',
      url: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1000&q=80',
      size: '890 KB',
      dimensions: '1600x1000',
      uploadedBy: 'Dr. Arundhati Sen',
      date: 'Oct 12, 2026'
    },
    {
      id: 3,
      filename: 'quad-ministerial-summit-delhi.jpg',
      url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80',
      size: '2.1 MB',
      dimensions: '2048x1365',
      uploadedBy: 'Vikramaditya Sharma',
      date: 'Oct 11, 2026'
    },
    {
      id: 4,
      filename: 'ladakh-solar-wind-farm.jpg',
      url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1000&q=80',
      size: '1.1 MB',
      dimensions: '1800x1200',
      uploadedBy: 'Kavita Krishnamurthy',
      date: 'Oct 10, 2026'
    }
  ]);

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Media & Photography Library
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Asset repository for high-resolution photojournalism, charts, and wire photography.
          </p>
        </div>

        <button
          onClick={() => alert('Media Upload Trigger: In Phase 2, files upload to cPanel /uploads via Express Multer middleware.')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '0.55rem 1rem',
            borderRadius: '4px',
            fontSize: '0.82rem',
            fontWeight: 700
          }}
        >
          <UploadCloud size={16} /> Upload Photographs
        </button>
      </div>

      {/* Simulated Upload Dropzone */}
      <div 
        onClick={() => alert('Upload Dropzone: In Phase 2, drag & drop uploads raw TIFF/JPEG assets directly into the cPanel storage directory.')}
        style={{
          border: '2px dashed #cbd5e1',
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer'
        }}
      >
        <UploadCloud size={32} style={{ color: '#2563eb', margin: '0 auto 0.5rem' }} />
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
          Drag high-resolution news photographs here, or click to browse
        </div>
        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.25rem' }}>
          Supported: JPEG, WebP, PNG, SVG (Maximum size 10MB per image asset)
        </div>
      </div>

      {/* Media Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        {mediaItems.map((item) => (
          <div key={item.id} style={{
            backgroundColor: '#ffffff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ aspectRatio: '16/10', backgroundColor: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
              <img src={item.url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.7)', color: '#ffffff', fontSize: '0.65rem', padding: '0.15rem 0.35rem', borderRadius: '2px', fontFamily: 'monospace' }}>
                {item.dimensions}
              </span>
            </div>

            <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.filename}
              </div>

              <div style={{ fontSize: '0.7rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.size}</span>
                <span>{item.date}</span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => handleCopy(item.id, item.url)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: copiedId === item.id ? '#15803d' : '#2563eb',
                    padding: '0.25rem 0.45rem',
                    backgroundColor: copiedId === item.id ? '#dcfce7' : '#eff6ff',
                    borderRadius: '2px'
                  }}
                >
                  {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                  {copiedId === item.id ? 'URL Copied' : 'Copy Asset Link'}
                </button>

                <button
                  onClick={() => setMediaItems(mediaItems.filter(m => m.id !== item.id))}
                  title="Remove asset"
                  style={{ color: '#ef4444', padding: '0.2rem' }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
