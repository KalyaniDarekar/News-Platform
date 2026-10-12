import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, Search, Filter, Edit, Trash2, Eye, 
  CheckCircle2, Clock, FileEdit, Flame, Sparkles 
} from 'lucide-react';
import { ALL_STORIES, CATEGORIES } from '../../data/mockNewsData';

export default function AdminArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = ALL_STORIES.filter((a) => {
    const matchesSearch = !searchTerm || a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || 
      (a.categorySlug && a.categorySlug.toLowerCase() === selectedCategory.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Newsroom Articles Management
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Curate, edit, schedule, and moderate all published news and op-ed content.
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
            fontWeight: 700
          }}
        >
          <PlusCircle size={15} /> Compose New Article
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '1rem',
        borderRadius: '4px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Dispatches (${ALL_STORIES.length})` },
            { id: 'published', label: 'Published (6)' },
            { id: 'review', label: 'In Review (1)' },
            { id: 'scheduled', label: 'Scheduled (1)' },
            { id: 'drafts', label: 'Drafts (2)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: activeTab === tab.id ? '#0f172a' : '#f1f5f9',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                border: 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '480px', justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search headline..."
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2rem',
                fontSize: '0.82rem',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                outline: 'none'
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.82rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              outline: 'none'
            }}
          >
            <option value="all">All Desks</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Articles Table */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
              <th style={{ padding: '0.85rem 1.25rem' }}>Article Details</th>
              <th style={{ padding: '0.85rem 1rem' }}>Desk / Category</th>
              <th style={{ padding: '0.85rem 1rem' }}>Byline</th>
              <th style={{ padding: '0.85rem 1rem' }}>Flags</th>
              <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem 1.25rem', maxWidth: '380px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', lineHeight: 1.35 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Slug: /{item.slug} • {item.readingTime || '5 min'}
                  </div>
                </td>

                <td style={{ padding: '1rem 1rem' }}>
                  <span style={{ 
                    backgroundColor: '#eff6ff', 
                    color: '#1e40af', 
                    fontWeight: 700, 
                    fontSize: '0.72rem', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '3px' 
                  }}>
                    {item.category || 'National'}
                  </span>
                </td>

                <td style={{ padding: '1rem 1rem', color: '#334155', fontWeight: 600 }}>
                  {item.author?.name || 'Staff Reporter'}
                </td>

                <td style={{ padding: '1rem 1rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {item.isLead && (
                      <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.35rem', borderRadius: '2px' }}>
                        HERO LEAD
                      </span>
                    )}
                    {item.kicker && (
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.35rem', borderRadius: '2px' }}>
                        {item.kicker}
                      </span>
                    )}
                  </div>
                </td>

                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                    <Link
                      to={`/article/${item.slug}`}
                      target="_blank"
                      title="View on site"
                      style={{ padding: '0.35rem', backgroundColor: '#f1f5f9', color: '#334155', borderRadius: '3px' }}
                    >
                      <Eye size={14} />
                    </Link>
                    <Link
                      to="/admin/articles/new"
                      title="Edit article"
                      style={{ padding: '0.35rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '3px' }}
                    >
                      <Edit size={14} />
                    </Link>
                    <button
                      onClick={() => alert(`Phase 1 Preview: Delete action for "${item.title}". MySQL delete query executed in Phase 2.`)}
                      title="Delete article"
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

    </div>
  );
}
