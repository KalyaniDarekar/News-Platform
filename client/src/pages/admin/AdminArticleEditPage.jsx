// ========================================================================
// Admin Article Edit & Newsroom Dispatch Desk — Phase 3
// Full editorial workflow: Draft, Review, Schedule, Publish, Expire
// Connected directly to Express /api/v1 API and MySQL database.
// ========================================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Save, Eye, ArrowLeft, Image as ImageIcon, Sparkles, 
  Calendar, Clock, Check, AlertCircle, ShieldAlert, Upload, 
  Trash2, ExternalLink, Video, Tag, Hash, FileText, Send, 
  RefreshCw, Globe, CheckCircle2, ChevronDown, HelpCircle, X
} from 'lucide-react';
import adminApi from '../../services/adminApi';
import { useAuth } from '../../context/AuthContext';

export default function AdminArticleEditPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ---- Form State ----
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);
  const [kicker, setKicker] = useState('SPECIAL REPORT');
  const [categoryId, setCategoryId] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [altText, setAltText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [priority, setPriority] = useState(0);

  // Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsorClient, setSponsorClient] = useState('');

  // Status & Timers
  const [status, setStatus] = useState('draft');
  const [scheduledPublicationTime, setScheduledPublicationTime] = useState('');
  const [expiryTime, setExpiryTime] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // SEO
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Data Loading & Feedback
  const [categories, setCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successToast, setSuccessToast] = useState(null);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'

  const fileInputRef = useRef(null);
  const bodyTextareaRef = useRef(null);

  // ---- 1. Load Initial Categories & Tags ----
  useEffect(() => {
    async function loadMetadata() {
      try {
        const catRes = await adminApi.getCategories();
        if (catRes.data) {
          setCategories(catRes.data);
          if (!isEditMode && catRes.data.length > 0 && !categoryId) {
            setCategoryId(catRes.data[0].id);
          }
        }

        const tagRes = await adminApi.getTags();
        if (tagRes.data) {
          setAvailableTags(tagRes.data);
        }
      } catch (err) {
        console.warn('Metadata load error:', err.message);
      }
    }
    loadMetadata();
  }, []);

  // ---- 2. Load Article if in Edit Mode ----
  useEffect(() => {
    if (!isEditMode) return;

    async function loadArticle() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await adminApi.getArticleById(id);
        const a = res.data;

        setTitle(a.title || '');
        setSlug(a.slug || '');
        setAutoSlug(false);
        setKicker(a.kicker || '');
        setCategoryId(a.category_id || (a.category && a.category.id) || '');
        setShortDescription(a.short_description || '');
        setArticleBody(a.article_body || '');
        setFeaturedImage(a.featured_image || '');
        setImageCaption(a.image_caption || '');
        setAltText(a.alt_text || '');
        setYoutubeUrl(a.youtube_url || '');
        setLanguage(a.language || 'en');
        setPriority(a.priority || 0);

        setIsFeatured(Boolean(a.is_featured));
        setIsBreaking(Boolean(a.is_breaking));
        setIsSponsored(Boolean(a.is_sponsored));
        setSponsorClient(a.sponsor_client || '');
        setStatus(a.status || 'draft');

        if (a.scheduled_publication_time) {
          setScheduledPublicationTime(formatToLocalInput(a.scheduled_publication_time));
        }
        if (a.expiry_time) {
          setExpiryTime(formatToLocalInput(a.expiry_time));
        }

        setMetaTitle(a.meta_title || '');
        setMetaDescription(a.meta_description || '');
        setCanonicalUrl(a.canonical_url || '');

        if (Array.isArray(a.tags)) {
          setTags(a.tags.map(t => (typeof t === 'string' ? t : t.name)));
        }
      } catch (err) {
        setErrorMsg(`Failed to load article #${id}: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadArticle();
  }, [id, isEditMode]);

  // Format ISO date to datetime-local input string YYYY-MM-DDTHH:mm
  const formatToLocalInput = (isoStr) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  // Convert local input string to UTC ISO string
  const toUtcIso = (localStr) => {
    if (!localStr) return null;
    const d = new Date(localStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  // Auto slug generation
  const handleTitleChange = (val) => {
    setTitle(val);
    if (autoSlug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 150);
      setSlug(generated);
    }
    if (!metaTitle) {
      setMetaTitle(val);
    }
  };

  // Expiry preset helper
  const setExpiryPreset = (hours) => {
    const d = new Date();
    d.setHours(d.getHours() + hours);
    setExpiryTime(formatToLocalInput(d.toISOString()));
  };

  // Tag helper
  const handleAddTag = (tagName) => {
    const cleaned = tagName.trim().replace(/^#/, '');
    if (cleaned && !tags.includes(cleaned)) {
      setTags([...tags, cleaned]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // Image Upload Handler
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (altText) formData.append('altText', altText);
      if (imageCaption) formData.append('caption', imageCaption);

      const res = await adminApi.uploadMedia(formData);
      if (res.data?.fileUrl) {
        setFeaturedImage(res.data.fileUrl);
        setSuccessToast('Image uploaded successfully to server library!');
        setTimeout(() => setSuccessToast(null), 3500);
      }
    } catch (err) {
      setErrorMsg(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Rich Text Insertion Helper
  const insertFormatting = (prefix, suffix = '') => {
    const textarea = bodyTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = articleBody.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    const newBody = articleBody.substring(0, start) + replacement + articleBody.substring(end);
    setArticleBody(newBody);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected ? selected.length : 4));
    }, 50);
  };

  // Word count & reading time
  const wordCount = articleBody.trim() ? articleBody.trim().split(/\s+/).length : 0;
  const estimatedReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  // ---- Save Article Action ----
  const handleSave = async (targetStatus = status) => {
    setErrorMsg(null);

    // Client-side validation
    if (!title || title.trim().length < 5) {
      setErrorMsg('Headline must be at least 5 characters long.');
      return;
    }
    if (!shortDescription || shortDescription.trim().length < 10) {
      setErrorMsg('Short description must be at least 10 characters long.');
      return;
    }
    if (!articleBody || articleBody.trim().length < 20) {
      setErrorMsg('Article body must be at least 20 characters long.');
      return;
    }
    if (!categoryId) {
      setErrorMsg('Please select a primary editorial category.');
      return;
    }
    if (targetStatus === 'scheduled' && !scheduledPublicationTime) {
      setErrorMsg('Please select a scheduled publication date and time.');
      return;
    }

    // Confirmation dialogs
    if (targetStatus === 'published' && !window.confirm('Are you sure you want to publish this story live to the public portal immediately?')) {
      return;
    }
    if (targetStatus === 'draft' && status === 'published' && !window.confirm('Revert this article to draft? It will be removed from public view.')) {
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      kicker: kicker.trim() || undefined,
      shortDescription: shortDescription.trim(),
      articleBody: articleBody.trim(),
      featuredImage: featuredImage.trim() || null,
      imageCaption: imageCaption.trim() || null,
      altText: altText.trim() || null,
      youtubeUrl: youtubeUrl.trim() || null,
      categoryId: parseInt(categoryId, 10),
      status: targetStatus,
      priority: parseInt(priority, 10) || 0,
      isFeatured: Boolean(isFeatured),
      isBreaking: Boolean(isBreaking),
      isSponsored: Boolean(isSponsored),
      sponsorClient: isSponsored ? (sponsorClient.trim() || null) : null,
      language,
      scheduledPublicationTime: targetStatus === 'scheduled' ? toUtcIso(scheduledPublicationTime) : null,
      expiryTime: expiryTime ? toUtcIso(expiryTime) : null,
      tags,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      canonicalUrl: canonicalUrl.trim() || null
    };

    try {
      if (isEditMode) {
        await adminApi.updateArticle(id, payload);
        setStatus(targetStatus);
        setSuccessToast(`Story #${id} updated successfully (${targetStatus.toUpperCase()})!`);
      } else {
        const res = await adminApi.createArticle(payload);
        setSuccessToast(`Article created and saved as ${targetStatus.toUpperCase()}!`);
        setTimeout(() => {
          navigate('/admin/articles');
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Helper for human expiry display
  const renderExpiryHuman = () => {
    if (!expiryTime) return 'No expiration set — article stays published indefinitely.';
    const d = new Date(expiryTime);
    if (isNaN(d.getTime())) return 'Invalid date';
    const ist = d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
    const utc = d.toUTCString();
    return `Expires: ${ist} (IST) / ${utc} (UTC)`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
        <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem', color: '#2563eb' }} />
        <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Loading editorial dispatch from newsroom database...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* ================= TOP HEADER & WORKFLOW BAR ================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/admin/articles" style={{ color: '#64748b', display: 'flex', alignItems: 'center', padding: '0.35rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {isEditMode ? `Edit Article #${id}` : 'Compose Editorial Dispatch'}
              </h1>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '0.15rem 0.55rem',
                borderRadius: '999px',
                backgroundColor: status === 'published' ? '#dcfce7' : status === 'scheduled' ? '#f3e8ff' : status === 'expired' ? '#ffedd5' : '#f1f5f9',
                color: status === 'published' ? '#15803d' : status === 'scheduled' ? '#7e22ce' : status === 'expired' ? '#c2410c' : '#475569',
                border: '1px solid currentColor'
              }}>
                {status}
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.15rem' }}>
              Newsroom author: <strong>{user?.fullName || 'Current Staff'}</strong> ({user?.role || 'editor'})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          
          {/* Reader Preview Toggle */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'edit' ? 'preview' : 'edit')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              backgroundColor: activeTab === 'preview' ? '#0f172a' : '#f8fafc',
              color: activeTab === 'preview' ? '#ffffff' : '#334155',
              border: '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            <Eye size={14} /> {activeTab === 'preview' ? 'Back to Editor' : 'Preview Reader View'}
          </button>

          {/* Save Draft */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            style={{
              padding: '0.55rem 0.95rem',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '1px solid #cbd5e1',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            Save Draft
          </button>

          {/* Submit for Review */}
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('in_review')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.95rem',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '1px solid #bfdbfe',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={14} /> Submit for Review
          </button>

          {/* Schedule Trigger */}
          <button
            type="button"
            disabled={saving}
            onClick={() => setShowScheduleModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.55rem 0.95rem',
              backgroundColor: '#faf5ff',
              color: '#7e22ce',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: '1px solid #e9d5ff',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            <Calendar size={14} /> Schedule...
          </button>

          {/* Publish Now */}
          <button
            type="button"
            disabled={saving}
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
              fontWeight: 700,
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
            }}
          >
            <Save size={14} /> {saving ? 'Publishing...' : 'Publish Immediately'}
          </button>

        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successToast && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.75rem 1rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
          <span>{successToast}</span>
        </div>
      )}

      {/* ================= TAB: READER PREVIEW ================= */}
      {activeTab === 'preview' ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          padding: '2.5rem',
          maxWidth: '840px',
          margin: '0 auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {kicker || 'NEWS DISPATCH'}
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {categories.find(c => String(c.id) === String(categoryId))?.name || 'General'}
            </span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {estimatedReadingTime} min read ({wordCount} words)
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-headline, serif)', fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.25, color: '#0f172a', marginBottom: '1rem' }}>
            {title || 'Headline will appear here'}
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.5, marginBottom: '1.5rem', fontStyle: 'italic', borderLeft: '3px solid #2563eb', paddingLeft: '1rem' }}>
            {shortDescription || 'Short description summary...'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '0.75rem 0', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#64748b' }}>
            <strong>By {user?.fullName || 'Newsroom Staff'}</strong>
            <span>•</span>
            <span>Published: Just now</span>
            {expiryTime && (
              <>
                <span>•</span>
                <span style={{ color: '#ea580c' }}>Expires: {new Date(expiryTime).toLocaleDateString()}</span>
              </>
            )}
          </div>

          {featuredImage && (
            <div style={{ marginBottom: '1.5rem' }}>
              <img
                src={featuredImage}
                alt={altText || title}
                style={{ width: '100%', maxHeight: '440px', objectFit: 'cover', borderRadius: '4px' }}
              />
              {imageCaption && (
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.35rem', fontStyle: 'italic' }}>
                  {imageCaption}
                </div>
              )}
            </div>
          )}

          {youtubeUrl && (
            <div style={{ marginBottom: '1.5rem', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '4px', overflow: 'hidden' }}>
              <iframe
                src={youtubeUrl.includes('embed') ? youtubeUrl : `https://www.youtube.com/embed/${youtubeUrl.split('v=')[1] || ''}`}
                title="YouTube Video Embed"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
              />
            </div>
          )}

          <div style={{
            fontSize: '1rem',
            lineHeight: 1.8,
            color: '#1e293b',
            whiteSpace: 'pre-wrap',
            fontFamily: 'var(--font-body, system-ui)'
          }}>
            {articleBody || 'Article body content will render here...'}
          </div>

          {tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              {tags.map(t => (
                <span key={t} style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.72rem', color: '#475569' }}>
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (

        /* ================= 2-COLUMN MAIN EDITING GRID ================= */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.05fr)',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          
          {/* ---- LEFT COLUMN: EDITORIAL CONTENT & BODY ---- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 1. Primary Headline & Kicker */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Kicker / Subject Eyebrow
                </label>
                <input
                  type="text"
                  placeholder="e.g. SPECIAL INVESTIGATION, EXCLUSIVE, PARLIAMENT REPORT"
                  value={kicker}
                  onChange={(e) => setKicker(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                    Story Headline (Title) *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: title.length > 255 ? '#dc2626' : '#64748b' }}>
                    {title.length}/255 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Type clear, compelling, journalistic headline..."
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                    lineHeight: 1.3
                  }}
                />
              </div>

              {/* Slug Row */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>URL Slug:</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setAutoSlug(false);
                  }}
                  style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.78rem', border: '1px solid #e2e8f0', borderRadius: '3px', backgroundColor: autoSlug ? '#f8fafc' : '#ffffff' }}
                />
                <button
                  type="button"
                  onClick={() => setAutoSlug(!autoSlug)}
                  style={{ fontSize: '0.7rem', padding: '0.35rem 0.5rem', borderRadius: '3px', border: '1px solid #cbd5e1', backgroundColor: autoSlug ? '#eff6ff' : '#f1f5f9', color: autoSlug ? '#1d4ed8' : '#475569' }}
                >
                  {autoSlug ? 'Auto-sync ON' : 'Manual'}
                </button>
              </div>

            </div>

            {/* 2. Standfirst / Short Description */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>
                  Standfirst / Short Description (Summary) *
                </label>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {shortDescription.length} characters
                </span>
              </div>
              <textarea
                rows={3}
                required
                placeholder="A concise 1-3 sentence summary displayed on homepage feeds and social preview cards..."
                value={shortDescription}
                onChange={(e) => {
                  setShortDescription(e.target.value);
                  if (!metaDescription) setMetaDescription(e.target.value.slice(0, 160));
                }}
                style={{ width: '100%', padding: '0.65rem 0.75rem', fontSize: '0.88rem', border: '1px solid #cbd5e1', borderRadius: '4px', lineHeight: 1.4 }}
              />
            </div>

            {/* 3. Rich Text Article Body Editor */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  Article Body Composition *
                </label>
                <div style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', gap: '0.75rem' }}>
                  <span>Words: <strong>{wordCount}</strong></span>
                  <span>Est. Read: <strong>{estimatedReadingTime} min</strong></span>
                </div>
              </div>

              {/* Formatting Toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                flexWrap: 'wrap',
                padding: '0.4rem 0.5rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderBottom: 'none',
                borderRadius: '4px 4px 0 0'
              }}>
                <button type="button" onClick={() => insertFormatting('**', '**')} title="Bold" style={toolbarBtnStyle}><strong>B</strong></button>
                <button type="button" onClick={() => insertFormatting('*', '*')} title="Italic" style={toolbarBtnStyle}><em>I</em></button>
                <button type="button" onClick={() => insertFormatting('\n## ', '\n')} title="Heading 2" style={toolbarBtnStyle}>H2</button>
                <button type="button" onClick={() => insertFormatting('\n### ', '\n')} title="Heading 3" style={toolbarBtnStyle}>H3</button>
                <button type="button" onClick={() => insertFormatting('\n> ', '\n')} title="Blockquote" style={toolbarBtnStyle}>“ Quote</button>
                <button type="button" onClick={() => insertFormatting('\n- ', '')} title="Bullet list" style={toolbarBtnStyle}>• List</button>
                <button type="button" onClick={() => insertFormatting('\n1. ', '')} title="Numbered list" style={toolbarBtnStyle}>1. List</button>
                <button type="button" onClick={() => insertFormatting('[', '](https://)')} title="Insert Link" style={toolbarBtnStyle}>Link</button>
              </div>

              <textarea
                ref={bodyTextareaRef}
                rows={16}
                required
                placeholder="Compose full journalistic article content here. Use the formatting toolbar above for headings, quotes, and links..."
                value={articleBody}
                onChange={(e) => setArticleBody(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  border: '1px solid #cbd5e1',
                  borderRadius: '0 0 4px 4px',
                  fontFamily: 'var(--font-body, system-ui)',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* 4. Multimedia & Video Embed */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Video size={16} color="#dc2626" />
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  YouTube Video Broadcast Link (Optional)
                </label>
              </div>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                Automatically normalises and generates an embedded responsive video player on the story detail page.
              </p>
            </div>

            {/* 5. SEO & Social Metadata Accordion */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Globe size={16} color="#2563eb" />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Search Engine Optimization (SEO) & Canonical Tags
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    SEO Title Tag (Page Title)
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Defaults to headline..."
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    SEO Meta Description
                  </label>
                  <input
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Defaults to first 160 characters of summary..."
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Canonical URL (Optional External Attribution)
                  </label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://bharatchronicle.com/article/original-slug"
                    style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ---- RIGHT COLUMN: METADATA, SCHEDULING, EXPIRY & ASSETS ---- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* 1. Expiration & Lifecycle Desk (CORE PHASE 3 REQUIREMENT) */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1.25rem',
              borderRadius: '6px',
              border: '2px solid #fdba74',
              backgroundColor: '#fffaf5'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem', color: '#c2410c' }}>
                <Clock size={16} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                  Publication Expiry Controls
                </h3>
              </div>

              <p style={{ fontSize: '0.74rem', color: '#7c2d12', marginBottom: '0.85rem', lineHeight: 1.35 }}>
                When an article reaches its expiry date, it automatically retires from all public feeds, searches, and RSS while remaining archived for reporting.
              </p>

              {/* Quick Preset Buttons */}
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#9a3412', marginBottom: '0.35rem' }}>
                Quick Presets:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem', marginBottom: '0.75rem' }}>
                <button type="button" onClick={() => setExpiryPreset(1)} style={presetBtnStyle}>+1 Hour</button>
                <button type="button" onClick={() => setExpiryPreset(6)} style={presetBtnStyle}>+6 Hours</button>
                <button type="button" onClick={() => setExpiryPreset(12)} style={presetBtnStyle}>+12 Hours</button>
                <button type="button" onClick={() => setExpiryPreset(24)} style={presetBtnStyle}>+24 Hours</button>
                <button type="button" onClick={() => setExpiryPreset(72)} style={presetBtnStyle}>+3 Days</button>
                <button type="button" onClick={() => setExpiryPreset(168)} style={presetBtnStyle}>+7 Days</button>
              </div>

              {/* Custom Date Input */}
              <div style={{ marginBottom: '0.65rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#431407', marginBottom: '0.25rem' }}>
                  Custom Expiry Date & Time:
                </label>
                <input
                  type="datetime-local"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  style={{ width: '100%', padding: '0.45rem 0.65rem', fontSize: '0.82rem', border: '1px solid #fdba74', borderRadius: '4px', backgroundColor: '#ffffff' }}
                />
              </div>

              {/* Clear button */}
              {expiryTime && (
                <button
                  type="button"
                  onClick={() => setExpiryTime('')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.72rem',
                    color: '#c2410c',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    marginBottom: '0.5rem',
                    fontWeight: 700
                  }}
                >
                  <X size={12} /> Clear Expiration (Keep Published Indefinitely)
                </button>
              )}

              {/* Current status info */}
              <div style={{ backgroundColor: '#ffedd5', padding: '0.5rem 0.65rem', borderRadius: '4px', fontSize: '0.72rem', color: '#9a3412', fontWeight: 600 }}>
                {renderExpiryHuman()}
              </div>
            </div>

            {/* 2. Featured Image & Media Asset */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ImageIcon size={15} /> Featured Image & Media
                </label>
              </div>

              {/* Upload Input & Fallback URL */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '0.75rem' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{ display: 'none' }}
                />

                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    padding: '0.65rem',
                    backgroundColor: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px dashed #3b82f6',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: uploadingImage ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Upload size={14} /> {uploadingImage ? 'Uploading to MySQL / Server...' : 'Upload Image from Computer'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>OR Image URL:</span>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                    style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.78rem', border: '1px solid #cbd5e1', borderRadius: '3px' }}
                  />
                </div>
              </div>

              {/* Image Preview */}
              {featuredImage && (
                <div style={{ marginBottom: '0.75rem', position: 'relative' }}>
                  <img
                    src={featuredImage}
                    alt={altText || 'Featured preview'}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImage('')}
                    title="Remove image"
                    style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Accessibility Alt Text */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                  Image Alternative Text (Accessibility)
                </label>
                <input
                  type="text"
                  placeholder="Describe image for screen-readers & SEO..."
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              {/* Caption */}
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>
                  Image Caption / Byline Source
                </label>
                <input
                  type="text"
                  placeholder="Photo: Staff Bureau / News Agency"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

            </div>

            {/* 3. Category & Taxonomy */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Editorial Category Desk *
              </label>
              
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px', marginBottom: '0.85rem' }}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>

              {/* Tags Section */}
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Editorial Tags
              </label>
              <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Add tag and press Enter..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  style={{ flex: 1, padding: '0.4rem 0.6rem', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
                <button
                  type="button"
                  onClick={() => handleAddTag(tagInput)}
                  style={{ padding: '0.4rem 0.75rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700 }}
                >
                  Add
                </button>
              </div>

              {/* Tag Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.2rem 0.45rem',
                      borderRadius: '3px',
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '0.72rem',
                      fontWeight: 600
                    }}
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#1d4ed8', display: 'flex' }}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Editorial Toggles & Priority */}
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
                Front-Page Editorial Flags
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                
                {/* Breaking News Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isBreaking}
                    onChange={(e) => setIsBreaking(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>
                    <strong style={{ color: '#dc2626' }}>Breaking News Alert</strong> (Displays on top ticker banner)
                  </span>
                </label>

                {/* Lead Story Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>
                    <strong>Featured / Lead Story</strong> (Promoted to homepage masthead)
                  </span>
                </label>

                {/* Sponsored Story */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isSponsored}
                    onChange={(e) => setIsSponsored(e.target.checked)}
                    style={{ width: 16, height: 16 }}
                  />
                  <span>
                    <strong>Sponsored / Brand Post</strong>
                  </span>
                </label>

                {isSponsored && (
                  <input
                    type="text"
                    placeholder="Sponsor Client Name (e.g. Tata Consultancy)"
                    value={sponsorClient}
                    onChange={(e) => setSponsorClient(e.target.value)}
                    style={{ width: '100%', padding: '0.4rem 0.6rem', fontSize: '0.8rem', border: '1px solid #cbd5e1', borderRadius: '4px', marginLeft: '1.5rem' }}
                  />
                )}

                {/* Language & Priority */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{ width: '100%', padding: '0.4rem', fontSize: '0.78rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    >
                      <option value="en">English (en)</option>
                      <option value="hi">Hindi (hi)</option>
                      <option value="mr">Marathi (mr)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '0.2rem' }}>
                      Display Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(parseInt(e.target.value, 10))}
                      style={{ width: '100%', padding: '0.4rem', fontSize: '0.78rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                    >
                      <option value={0}>0 — Standard</option>
                      <option value={1}>1 — High Priority</option>
                      <option value={2}>2 — Lead Banner</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= MODAL: SCHEDULE PUBLICATION ================= */}
      {showScheduleModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            padding: '1.75rem',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#7e22ce' }}>
                <Calendar size={18} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  Schedule Article Release
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '1.25rem' }}>
              The cPanel cron processor will automatically transition this article to <strong>published</strong> status at the scheduled time.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Scheduled Publication Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={scheduledPublicationTime}
                onChange={(e) => setScheduledPublicationTime(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Expiry Date & Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                style={{ padding: '0.55rem 1rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600, backgroundColor: '#f8fafc', color: '#475569' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowScheduleModal(false);
                  handleSave('scheduled');
                }}
                style={{ padding: '0.55rem 1.25rem', borderRadius: '4px', border: 'none', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#7e22ce', color: '#ffffff' }}
              >
                Confirm & Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline styling helpers
const toolbarBtnStyle = {
  padding: '0.25rem 0.5rem',
  fontSize: '0.76rem',
  borderRadius: '3px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  cursor: 'pointer',
  color: '#334155'
};

const presetBtnStyle = {
  padding: '0.35rem',
  fontSize: '0.7rem',
  borderRadius: '3px',
  border: '1px solid #fdba74',
  backgroundColor: '#fff7ed',
  color: '#c2410c',
  fontWeight: 700,
  cursor: 'pointer'
};
