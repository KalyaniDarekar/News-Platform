import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, FolderTree, Check } from 'lucide-react';
import { CATEGORIES } from '../../data/mockNewsData';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', color: '#0a2540', desc: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (newCat.name) {
      const added = {
        id: categories.length + 1,
        name: newCat.name,
        slug: newCat.slug || newCat.name.toLowerCase().replace(/\s+/g, '-'),
        color: newCat.color,
        desc: newCat.desc || 'General news desk dispatches'
      };
      setCategories([...categories, added]);
      setShowModal(false);
      setNewCat({ name: '', slug: '', color: '#0a2540', desc: '' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Newsroom Categories & Desks
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Configure editorial desks, navigation sorting, and taxonomy color accents.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
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
          <PlusCircle size={15} /> Add New Desk
        </button>
      </div>

      {/* Categories Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Desk Name</th>
              <th style={{ padding: '0.85rem 1rem' }}>URL Slug</th>
              <th style={{ padding: '0.85rem 1rem' }}>Accent Token</th>
              <th style={{ padding: '0.85rem 1rem' }}>Scope / Description</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c, idx) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c.color }}></span>
                    {c.name}
                  </div>
                </td>

                <td style={{ padding: '1rem 1rem', fontFamily: 'monospace', color: '#475569' }}>
                  /category/{c.slug}
                </td>

                <td style={{ padding: '1rem 1rem' }}>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '0.72rem', 
                    backgroundColor: '#f1f5f9', 
                    padding: '0.2rem 0.45rem', 
                    borderRadius: '2px',
                    color: c.color,
                    fontWeight: 700
                  }}>
                    {c.color}
                  </span>
                </td>

                <td style={{ padding: '1rem 1rem', color: '#64748b', maxWidth: '320px' }}>
                  {c.desc}
                </td>

                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                    <button
                      onClick={() => alert(`Phase 1: Edit ${c.name} properties.`)}
                      style={{ padding: '0.35rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '3px' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => alert(`Phase 1: Cannot delete primary desk with active stories.`)}
                      style={{ padding: '0.35rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '3px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Desk Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '4px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-dropdown)' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Create Editorial Desk
            </h2>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Desk Name</label>
                <input
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g. Geopolitics & Defence"
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Category Slug</label>
                <input
                  type="text"
                  value={newCat.slug}
                  onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                  placeholder="e.g. defence"
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Hex Accent Color</label>
                <input
                  type="color"
                  value={newCat.color}
                  onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                  style={{ width: '60px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>Description</label>
                <textarea
                  rows={2}
                  value={newCat.desc}
                  onChange={(e) => setNewCat({ ...newCat, desc: e.target.value })}
                  placeholder="Short editorial mandate for this desk..."
                  style={{ width: '100%', padding: '0.55rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '4px', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.25rem', backgroundColor: '#2563eb', color: '#ffffff', borderRadius: '4px', fontWeight: 700 }}
                >
                  Add Desk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
