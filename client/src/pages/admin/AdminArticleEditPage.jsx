import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Save, Eye, ArrowLeft, Image as ImageIcon, Sparkles, 
  Calendar, Check, AlertCircle, ShieldAlert 
} from 'lucide-react';
import { CATEGORIES } from '../../data/mockNewsData';

export default function AdminArticleEditPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [kicker, setKicker] = useState('SPECIAL REPORT');
  const [category, setCategory] = useState('national');
  const [author, setAuthor] = useState('Vikramaditya Sharma');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80');
  const [caption, setCaption] = useState('Photo: Bureau Archives / The Bharat Chronicle');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isLead, setIsLead] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsorClient, setSponsorClient] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  // Auto-generate slug when title changes
  const handleTitleChange = (val) => {
    setTitle(val);
    const generated = val
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generated);
    if (!metaTitle) setMetaTitle(val);
  };

  const handleSave = (status) => {
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      navigate('/admin/articles');
    }, 2000);
  };

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* Top Header & Save Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/articles" style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Create / Compose Editorial Dispatch
            </h1>
            <p style={{ fontSize: '0.76rem', color: '#64748b' }}>
              Drafting for The Bharat Chronicle Digital Publishing Network.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={() => handleSave('draft')}
            style={{
              padding: '0.55rem 1rem',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '1px solid #cbd5e1'
            }}
          >
            Save Draft
          </button>

          <button
            type="button"
            onClick={() => handleSave('published')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 1.25rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            <Save size={15} /> Publish Live to Web
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {savedToast && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '0.85rem 1.25rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <Check size={18} /> Story saved in editorial workspace! Redirecting to Articles desk...
        </div>
      )}

      {/* 2-Column Editorial Grid: Main Form (65%) & Settings/Metadata Sidebar (35%) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)',
        gap: '2rem',
        alignItems: 'start'
      }}>
        
        {/* Main Composition Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Headline */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
              Article Headline (Required)
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. The Semiconductor Corridor: Inside India’s Multi-Billion Dollar Silicon Fab Buildout"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1.15rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none'
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
              <strong>Permanent Slug:</strong>
              <span>/article/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={{ flex: 1, padding: '0.2rem 0.4rem', fontSize: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '2px' }}
              />
            </div>
          </div>

          {/* Kicker & Summary */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                Editorial Kicker (Small Label Above Headline)
              </label>
              <input
                type="text"
                value={kicker}
                onChange={(e) => setKicker(e.target.value)}
                placeholder="e.g. SPECIAL INVESTIGATION, POLICY BRIEF, DIPLOMACY"
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569', marginBottom: '0.35rem' }}>
                Summary / Lead Excerpt
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Crisp 2-3 sentence overview that hooks readers on the homepage..."
                style={{ width: '100%', padding: '0.65rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical' }}
              ></textarea>
            </div>
          </div>

          {/* Full Article Body */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>
                Article Narrative & Body Content
              </label>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Supports HTML / Rich Text</span>
            </div>

            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="<p>Full investigation narrative...</p><blockquote>Quote pullout</blockquote><h3>Section Subtitle</h3>"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.92rem',
                fontFamily: 'monospace',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                lineHeight: 1.6,
                resize: 'vertical'
              }}
            ></textarea>
          </div>

        </div>

        {/* Sidebar Settings & Publishing Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Classification & Byline */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
              Desk & Byline
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Primary Desk / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Staff Author Byline
              </label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              >
                <option value="Vikramaditya Sharma">Vikramaditya Sharma (Editor-in-Chief)</option>
                <option value="Dr. Arundhati Sen">Dr. Arundhati Sen (Senior Editor, Economy)</option>
                <option value="Rajeshwari Nair">Rajeshwari Nair (Chief Technology Bureau)</option>
                <option value="Chronicle Special Bureau">Chronicle Special Bureau</option>
              </select>
            </div>
          </div>

          {/* Featured Image Asset */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
              Featured Photography
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Image URL (Unsplash or Media Library)
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            {imageUrl && (
              <div style={{ aspectRatio: '16/9', borderRadius: '2px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Image Caption & Accreditation
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>
          </div>

          {/* Editorial Display Flags */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
              Editorial Flags
            </h3>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
              />
              <span style={{ fontWeight: 600, color: '#dc2626' }}>Broadcast on Breaking News Ticker</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isLead}
                onChange={(e) => setIsLead(e.target.checked)}
              />
              <span style={{ fontWeight: 600, color: '#0f172a' }}>Feature as Homepage Big Hero Lead</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isSponsored}
                onChange={(e) => setIsSponsored(e.target.checked)}
              />
              <span style={{ fontWeight: 600, color: '#b45309' }}>Partner / Sponsored Content Flag</span>
            </label>

            {isSponsored && (
              <div style={{ marginTop: '0.35rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>
                  Sponsor Client Name
                </label>
                <input
                  type="text"
                  value={sponsorClient}
                  onChange={(e) => setSponsorClient(e.target.value)}
                  placeholder="e.g. Confederation of Indian Industry"
                  style={{ width: '100%', padding: '0.4rem', fontSize: '0.78rem', border: '1px solid #fde68a', borderRadius: '2px', backgroundColor: '#fefce8' }}
                />
              </div>
            )}
          </div>

          {/* SEO Meta Fields */}
          <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '4px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f172a', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
              SEO & Social Meta
            </h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Meta Title ({metaTitle.length}/60 chars)
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '0.25rem' }}>
                Meta Description ({metaDesc.length}/160 chars)
              </label>
              <textarea
                rows={2}
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                style={{ width: '100%', padding: '0.45rem', fontSize: '0.78rem', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical' }}
              ></textarea>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
