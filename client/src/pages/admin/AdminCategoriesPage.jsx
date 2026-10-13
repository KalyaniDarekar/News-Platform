// ========================================================================
// Admin Categories Desk — Phase 3
// Real-time CRUD for editorial desks, color accents, and navigation taxonomies.
// ========================================================================

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, FolderTree, RefreshCw, X, AlertCircle } from 'lucide-react';
import adminApi from '../../services/adminApi';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({ name: '', slug: '', colorBadge: '#0A2540', description: '' });
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await adminApi.getCategories();
      if (res.data) setCategories(res.data);
    } catch (err) {
      setErrorMsg(`Failed to load categories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormValues({ name: '', slug: '', colorBadge: '#0A2540', description: '' });
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingId(c.id);
    setFormValues({
      name: c.name || '',
      slug: c.slug || '',
      colorBadge: c.color_badge || c.color || '#0A2540',
      description: c.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValues.name.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = {
        name: formValues.name.trim(),
        slug: formValues.slug.trim() || undefined,
        colorBadge: formValues.colorBadge || '#0A2540',
        description: formValues.description.trim() || undefined
      };

      if (editingId) {
        await adminApi.updateCategory(editingId, payload);
      } else {
        await adminApi.createCategory(payload);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setErrorMsg(`Failed to save category: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? Existing articles in this category will become unassigned.`)) return;
    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setErrorMsg(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            Newsroom Categories &amp; Editorial Desks
          </h1>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem' }}>
            Configure newsroom desks, public navigation hierarchy, and color badge tokens.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchCategories}
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

          <button
            onClick={openCreateModal}
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
              cursor: 'pointer'
            }}
          >
            <PlusCircle size={15} /> Add New Desk
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '4px', fontSize: '0.82rem' }}>
          {errorMsg}
        </div>
      )}

      {/* Categories Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.85rem' }}>
            Loading categories from database...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.85rem' }}>
            No categories found in database. Click "Add New Desk" above.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Desk Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>URL Slug</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Color Badge</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Description</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const color = c.color_badge || c.color || '#0a2540';
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }} />
                          {c.name}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', color: '#475569' }}>
                        /category/{c.slug}
                      </td>

                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.45rem', borderRadius: '3px', color: color, fontWeight: 700 }}>
                          {color}
                        </span>
                      </td>

                      <td style={{ padding: '0.85rem 1rem', color: '#64748b', maxWidth: '300px' }}>
                        {c.description || 'General news desk dispatches'}
                      </td>

                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEditModal(c)}
                            title="Edit Category"
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#334155', border: 'none', cursor: 'pointer' }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            title="Delete Category"
                            style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      {showModal && (
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
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {editingId ? 'Edit Editorial Desk' : 'Create New Editorial Desk'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Desk Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Economy &amp; Fiscal Policy"
                  value={formValues.name}
                  onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  URL Slug (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. economy-fiscal-policy"
                  value={formValues.slug}
                  onChange={(e) => setFormValues({ ...formValues, slug: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Hex Color Badge Code
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="color"
                    value={formValues.colorBadge}
                    onChange={(e) => setFormValues({ ...formValues, colorBadge: e.target.value })}
                    style={{ width: 40, height: 36, border: 'none', cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    value={formValues.colorBadge}
                    onChange={(e) => setFormValues({ ...formValues, colorBadge: e.target.value })}
                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                  Scope Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Description of the editorial desk..."
                  value={formValues.description}
                  onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.5rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', backgroundColor: '#f8fafc', color: '#475569' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '0.5rem 1.15rem', borderRadius: '4px', border: 'none', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Desk' : 'Create Desk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
