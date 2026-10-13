// ========================================================================
// Admin Articles Desk — Phase 3
// Real-time MySQL-backed article management: list, filter, search,
// status moderation, quick publish/unpublish, and archive controls.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, Search, Filter, Edit, Trash2, Eye, 
  CheckCircle2, Clock, FileEdit, Flame, Sparkles, RefreshCw, 
  ChevronLeft, ChevronRight, AlertCircle, ExternalLink, Archive, Send
} from 'lucide-react';
import adminApi from '../../services/adminApi';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await adminApi.getCategories();
        if (res.data) setCategories(res.data);
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    }
    loadCategories();
  }, []);

  // Fetch Articles on filter/page change
  const fetchArticles = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminApi.getArticles({
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter || undefined,
        search: searchTerm.trim() || undefined,
        page: currentPage,
        limit: 15
      });

      if (res.data) {
        setArticles(res.data);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalCount(res.pagination.total || res.data.length);
        }
      }
    } catch (err) {
      setErrorMsg(`Failed to load articles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [statusFilter, categoryFilter, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  // Quick Action: Publish
  const handlePublish = async (id) => {
    if (!window.confirm('Publish this article live to the public portal immediately?')) return;
    try {
      await adminApi.publishArticle(id);
      setActionFeedback(`Article #${id} published live!`);
      setTimeout(() => setActionFeedback(null), 3000);
      fetchArticles();
    } catch (err) {
      setErrorMsg(`Publish failed: ${err.message}`);
    }
  };

  // Quick Action: Unpublish (draft)
  const handleUnpublish = async (id) => {
    if (!window.confirm('Revert this article to draft status? It will be removed from public view.')) return;
    try {
      await adminApi.unpublishArticle(id);
      setActionFeedback(`Article #${id} reverted to draft.`);
      setTimeout(() => setActionFeedback(null), 3000);
      fetchArticles();
    } catch (err) {
      setErrorMsg(`Unpublish failed: ${err.message}`);
    }
  };

  // Quick Action: Archive (soft delete)
  const handleArchive = async (id) => {
    if (!window.confirm('Archive this article? It will be soft-deleted and removed from public view while preserving audit logs.')) return;
    try {
      await adminApi.deleteArticle(id);
      setActionFeedback(`Article #${id} moved to archive.`);
      setTimeout(() => setActionFeedback(null), 3000);
      fetchArticles();
    } catch (err) {
      setErrorMsg(`Archive failed: ${err.message}`);
    }
  };

  const statusBadges = {
    published: { bg: '#dcfce7', text: '#15803d', label: 'Published' },
    scheduled: { bg: '#faf5ff', text: '#7e22ce', label: 'Scheduled' },
    in_review: { bg: '#fefce8', text: '#ca8a04', label: 'In Review' },
    draft:     { bg: '#f1f5f9', text: '#475569', label: 'Draft' },
    expired:   { bg: '#fff7ed', text: '#c2410c', label: 'Expired' },
    archived:  { bg: '#fee2e2', text: '#991b1b', label: 'Archived' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
              Newsroom Articles Desk
            </h1>
            <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
              {totalCount} Total
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
            Full lifecycle control: authoring, moderation, embargoes, and automatic publication retirement.
          </p>
        </div>

        <Link
          to="/admin/articles/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            padding: '0.55rem 1rem',
            borderRadius: '4px',
            fontSize: '0.82rem',
            fontWeight: 700,
            boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
          }}
        >
          <PlusCircle size={15} /> Compose Story
        </Link>
      </div>

      {/* Notifications */}
      {actionFeedback && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.65rem 1rem', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 600 }}>
          {actionFeedback}
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.65rem 1rem', borderRadius: '4px', fontSize: '0.82rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '1rem 1.25rem',
        borderRadius: '6px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Dispatches' },
            { id: 'published', label: 'Published' },
            { id: 'in_review', label: 'In Review' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'draft', label: 'Drafts' },
            { id: 'expired', label: 'Expired' },
            { id: 'archived', label: 'Archived' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: statusFilter === tab.id ? 700 : 500,
                backgroundColor: statusFilter === tab.id ? '#0f172a' : '#f1f5f9',
                color: statusFilter === tab.id ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flex: 1, minWidth: '240px', gap: '0.35rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search headlines, slugs, summaries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.65rem 0.45rem 2rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
              <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
            <button
              type="submit"
              style={{ padding: '0.45rem 0.85rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Search
            </button>
          </form>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem', border: '1px solid #cbd5e1', borderRadius: '4px', backgroundColor: '#ffffff' }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            style={{ fontSize: '0.75rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Reset Filters
          </button>
        </div>

      </div>

      {/* Articles Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#64748b' }}>
            <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 0.75rem', color: '#2563eb' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Loading articles from newsroom database...</div>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
            <FileEdit size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>No articles match your search</div>
            <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try clearing filters or compose a new editorial story.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left', fontWeight: 700 }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Article Headline</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Author / Byline</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Expiry Schedule</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((art) => {
                  const badge = statusBadges[art.status] || { bg: '#f1f5f9', text: '#475569', label: art.status };
                  return (
                    <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      
                      {/* Title & Flags */}
                      <td style={{ padding: '0.85rem 1rem', maxWidth: '340px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                          {art.is_breaking ? (
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#dc2626', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: '2px' }}>
                              BREAKING
                            </span>
                          ) : null}
                          {art.is_featured ? (
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, backgroundColor: '#2563eb', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: '2px' }}>
                              LEAD
                            </span>
                          ) : null}
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>#{art.id}</span>
                        </div>
                        <Link
                          to={`/admin/articles/${art.id}/edit`}
                          style={{ fontWeight: 700, color: '#0f172a', textDecoration: 'none', lineHeight: 1.3, display: 'block' }}
                        >
                          {art.title}
                        </Link>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '0.85rem 1rem', color: '#334155' }}>
                        <span style={{ backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '3px', fontSize: '0.74rem', fontWeight: 600 }}>
                          {art.category_name || 'General'}
                        </span>
                      </td>

                      {/* Author */}
                      <td style={{ padding: '0.85rem 1rem', color: '#64748b' }}>
                        {art.author_name || 'Newsroom Staff'}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: '1px solid currentColor'
                        }}>
                          {badge.label}
                        </span>
                      </td>

                      {/* Expiry Details */}
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.74rem' }}>
                        {art.expiry_time ? (
                          <div style={{ color: '#c2410c' }}>
                            <div style={{ fontWeight: 700 }}>
                              {new Date(art.expiry_time) < new Date() ? 'Expired on:' : 'Expires:'}
                            </div>
                            <div>{new Date(art.expiry_time).toLocaleDateString()} {new Date(art.expiry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>No expiry</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem' }}>
                          
                          {/* Edit */}
                          <Link
                            to={`/admin/articles/${art.id}/edit`}
                            title="Edit Article"
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#1e293b', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                          >
                            <Edit size={14} />
                          </Link>

                          {/* Quick Publish / Unpublish */}
                          {art.status !== 'published' ? (
                            <button
                              onClick={() => handlePublish(art.id)}
                              title="Publish Live Now"
                              style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnpublish(art.id)}
                              title="Revert to Draft"
                              style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: '#fefce8', color: '#ca8a04', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Clock size={14} />
                            </button>
                          )}

                          {/* View Reader Link if published */}
                          {art.status === 'published' && art.slug && (
                            <Link
                              to={`/article/${art.slug}`}
                              target="_blank"
                              title="View Live Reader Page"
                              style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center' }}
                            >
                              <ExternalLink size={14} />
                            </Link>
                          )}

                          {/* Archive */}
                          {art.status !== 'archived' && (
                            <button
                              onClick={() => handleArchive(art.id)}
                              title="Archive Article"
                              style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                              <Archive size={14} />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{
            padding: '0.85rem 1.25rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
