// ========================================================================
// Admin Media Library Desk
// Real-time photojournalism asset repository: upload via Multer,
// asset list from database, URL clipboard copy, and asset management.
// ========================================================================

import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Copy, Check, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import adminApi from '../../services/adminApi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export default function AdminMediaPage() {
  const [copiedId, setCopiedId] = useState(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const fileInputRef = useRef(null);

  const fetchMedia = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminApi.getMediaAssets({ limit: 40 });
      if (res.data) setMediaItems(res.data);
    } catch (err) {
      console.error('Failed to load media assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await adminApi.uploadMedia(formData);
      setSuccessMsg(`Asset "${file.name}" uploaded successfully!`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchMedia();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleCopy = (id, url) => {
    const fullUrl = url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete media asset "${name}"?`)) return;
    try {
      await adminApi.deleteMedia(id);
      fetchMedia();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Media &amp; Photography Library
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
            Central media repository for high-resolution photojournalism, charts, and wire photography.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchMedia}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.5rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
            style={{ display: 'none' }}
          />

          <button
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            <UploadCloud size={16} /> {uploading ? 'Uploading...' : 'Upload Photographs'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #93c5fd',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
      >
        <UploadCloud size={36} style={{ color: '#2563eb', margin: '0 auto 0.5rem' }} />
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e3a8a' }}>
          {uploading ? 'Processing upload with Multer...' : 'Drag high-resolution news photographs here, or click to browse'}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
          Supports JPEG, PNG, WebP, GIF, SVG, AVIF up to 10 MB per asset. Auto-indexed in MySQL.
        </div>
      </div>

      {/* Media Grid */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
          Cataloged Assets ({mediaItems.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.85rem' }}>
            Loading media assets...
          </div>
        ) : mediaItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            No media assets uploaded yet. Upload your first photograph above!
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))',
            gap: '1.25rem'
          }}>
            {mediaItems.map((item) => {
              const fullUrl = item.file_url?.startsWith('http') ? item.file_url : `${BACKEND_URL}${item.file_url}`;
              const sizeKb = item.file_size_bytes ? `${Math.round(item.file_size_bytes / 1024)} KB` : 'N/A';

              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ height: '160px', backgroundColor: '#0f172a', position: 'relative' }}>
                    <img
                      src={fullUrl}
                      alt={item.alt_text || item.original_name || item.filename}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '3px' }}>
                      {sizeKb}
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.original_name || item.filename}>
                      {item.original_name || item.filename}
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      Uploaded: {new Date(item.created_at).toLocaleDateString()}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <button
                        onClick={() => handleCopy(item.id, item.file_url)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: copiedId === item.id ? '#f0fdf4' : '#f8fafc',
                          color: copiedId === item.id ? '#15803d' : '#334155',
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === item.id ? 'Copied URL!' : 'Copy URL'}
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.original_name || item.filename)}
                        title="Delete asset record"
                        style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.35rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
