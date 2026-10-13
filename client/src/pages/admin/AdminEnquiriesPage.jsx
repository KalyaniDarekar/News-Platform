import React, { useState, useEffect } from 'react';
import { 
  Building2, Mail, Phone, Calendar, Search, Filter, 
  CheckCircle, Clock, FileText, Trash2, Edit3, ExternalLink, 
  ChevronDown, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react';
import adminApi from '../../services/adminApi';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [statusDraft, setStatusDraft] = useState('');

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAdvertiserEnquiries({
        status: statusFilter,
        search: searchQuery
      });
      setEnquiries(res.data || []);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEnquiries();
  };

  const handleOpenDetail = (item) => {
    setSelectedEnquiry(item);
    setStatusDraft(item.status);
    setInternalNotes(item.internal_notes || '');
  };

  const handleUpdateStatusAndNotes = async () => {
    if (!selectedEnquiry) return;
    setUpdatingId(selectedEnquiry.id);
    try {
      await adminApi.updateEnquiryStatus(selectedEnquiry.id, {
        status: statusDraft,
        internalNotes
      });
      // Refresh local list
      setEnquiries(prev => prev.map(e => e.id === selectedEnquiry.id ? { ...e, status: statusDraft, internal_notes: internalNotes } : e));
      setSelectedEnquiry(prev => ({ ...prev, status: statusDraft, internal_notes: internalNotes }));
      alert('Lead status and internal notes saved successfully.');
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm(`Delete lead record #${id}? This action cannot be undone.`)) return;
    try {
      await adminApi.deleteEnquiry(id);
      setEnquiries(prev => prev.filter(e => e.id !== id));
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      new: { label: 'New Lead', bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
      contacted: { label: 'Contacted', bg: '#fefce8', color: '#854d0e', border: '#fef08a' },
      proposal_sent: { label: 'Proposal Sent', bg: '#f3e8ff', color: '#6b21a8', border: '#e9d5ff' },
      closed_won: { label: 'Closed Won (Contract)', bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
      closed_lost: { label: 'Closed Lost', bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
    };
    const s = map[status] || map.new;
    return (
      <span style={{
        backgroundColor: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: '0.2rem 0.55rem',
        borderRadius: '999px',
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.04em'
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Direct Advertiser Leads & Enquiries
          </h1>
          <p style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.2rem' }}>
            Manage inbound corporate sponsorship briefs, track proposal stages, and maintain internal client notes.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEnquiries}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#334155',
            padding: '0.5rem 0.85rem',
            borderRadius: '4px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} /> Refresh Leads
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '1rem 1.25rem',
        borderRadius: '4px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Status Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Leads' },
            { id: 'new', label: 'New' },
            { id: 'contacted', label: 'In Contact' },
            { id: 'proposal_sent', label: 'Proposal Sent' },
            { id: 'closed_won', label: 'Won' },
            { id: 'closed_lost', label: 'Archived' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                backgroundColor: statusFilter === tab.id ? '#0f172a' : '#f8fafc',
                color: statusFilter === tab.id ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: statusFilter === tab.id ? '#0f172a' : '#e2e8f0',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.4rem', width: '100%', maxWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search company, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '0.45rem 0.75rem',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem'
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '0.45rem 0.75rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            <Search size={15} />
          </button>
        </form>
      </div>

      {/* Main Content: Table and Detail Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedEnquiry ? '1fr 380px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Enquiries Table */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
              Loading advertiser enquiries...
            </div>
          ) : enquiries.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Building2 size={36} style={{ margin: '0 auto 0.75rem auto', color: '#94a3b8' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No Enquiries Found</h3>
              <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                {statusFilter !== 'all' ? `No leads in status "${statusFilter}".` : 'No advertiser enquiries have been submitted yet.'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    <th style={{ padding: '0.85rem 1.25rem' }}>Company & Contact</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Budget Range</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Received Date</th>
                    <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((enquiry) => (
                    <tr 
                      key={enquiry.id} 
                      style={{ 
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: selectedEnquiry?.id === enquiry.id ? '#f0f9ff' : 'transparent',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleOpenDetail(enquiry)}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>{enquiry.company_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.15rem' }}>
                          {enquiry.contact_name} &bull; <span style={{ color: '#2563eb' }}>{enquiry.email}</span>
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{enquiry.budget_range}</span>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        {getStatusBadge(enquiry.status)}
                      </td>

                      <td style={{ padding: '1rem 1rem', fontSize: '0.78rem', color: '#64748b' }}>
                        {new Date(enquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleOpenDetail(enquiry); }}
                          style={{
                            padding: '0.35rem 0.7rem',
                            backgroundColor: '#2563eb',
                            color: '#ffffff',
                            borderRadius: '3px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginRight: '0.4rem'
                          }}
                        >
                          Review
                        </button>

                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDeleteEnquiry(enquiry.id); }}
                          style={{
                            padding: '0.35rem 0.5rem',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            borderRadius: '3px',
                            border: 'none',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                          title="Delete enquiry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Lead Review & Notes Drawer */}
        {selectedEnquiry && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Lead #{selectedEnquiry.id}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>
                  {selectedEnquiry.company_name}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>CONTACT PERSON</div>
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{selectedEnquiry.contact_name}</div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>EMAIL</div>
                <a href={`mailto:${selectedEnquiry.email}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                  {selectedEnquiry.email}
                </a>
              </div>

              {selectedEnquiry.phone && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>PHONE</div>
                  <a href={`tel:${selectedEnquiry.phone}`} style={{ color: '#0f172a', fontWeight: 600 }}>
                    {selectedEnquiry.phone}
                  </a>
                </div>
              )}

              {selectedEnquiry.website && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>WEBSITE</div>
                  <a href={selectedEnquiry.website} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                    {selectedEnquiry.website}
                  </a>
                </div>
              )}

              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>PREFERRED PLACEMENTS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                  {Array.isArray(selectedEnquiry.preferred_placements) && selectedEnquiry.preferred_placements.length > 0 ? (
                    selectedEnquiry.preferred_placements.map((p, idx) => (
                      <span key={idx} style={{ backgroundColor: '#f1f5f9', color: '#334155', padding: '0.15rem 0.45rem', borderRadius: '3px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {p}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: '#94a3b8' }}>General campaign enquiry</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>CAMPAIGN BRIEF & MESSAGE</div>
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#1e293b', lineHeight: 1.45, marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>

            {/* Pipeline Stage Updater */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Update Pipeline Status
              </label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.82rem', marginBottom: '0.85rem' }}
              >
                <option value="new">New Lead (Awaiting Response)</option>
                <option value="contacted">Contacted (In Discussion)</option>
                <option value="proposal_sent">Proposal Sent (Pricing Flight Drafted)</option>
                <option value="closed_won">Closed Won (Contract Confirmed)</option>
                <option value="closed_lost">Closed Lost (Archived)</option>
              </select>

              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                Internal Notes (Editorial / Ad Sales)
              </label>
              <textarea
                rows={3}
                placeholder="Log internal sales progress, pricing discussions, or client requirements..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontFamily: 'inherit', marginBottom: '0.85rem' }}
              />

              <button
                type="button"
                disabled={updatingId !== null}
                onClick={handleUpdateStatusAndNotes}
                style={{
                  width: '100%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '0.6rem',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {updatingId ? 'Saving...' : 'Save Pipeline Status & Notes'}
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
