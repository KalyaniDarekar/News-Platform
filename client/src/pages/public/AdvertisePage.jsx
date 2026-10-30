import React, { useState } from 'react';
import { 
  Building2, Mail, Phone, MapPin, Download, CheckCircle, 
  Send, Sparkles, Layout, Smartphone, Video, Compass, 
  Award, ArrowRight, AlertCircle, FileText
} from 'lucide-react';
import apiService from '../../services/api';

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    budgetRange: 'Tier 2: ₹50,000 – ₹1,50,000 (Targeted Section Sponsorship)',
    preferredPlacements: ['header_leaderboard', 'article_inline'],
    flightStartDate: '',
    campaignObjectives: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const placementOptions = [
    { code: 'header_leaderboard', label: 'Header Super Leaderboard', dims: '970x90 / 728x90', type: 'Desktop & Tablet Top Placement' },
    { code: 'homepage_hero_adjacent', label: 'Homepage Hero-Adjacent Display', dims: '300x600 Half Page', type: 'High Viewability Lead Story Sponsor' },
    { code: 'article_inline', label: 'In-Article Inline Native Banner', dims: '728x90 / 300x250', type: 'Dwell-Time Focused Mid-Story Unit' },
    { code: 'article_sidebar_top', label: 'Article Sidebar Top Display', dims: '300x250 Medium Rect', type: 'Sticky Desktop Reading Companion' },
    { code: 'category_page_banner', label: 'Section & Category Sponsorship', dims: '728x90 Billboard', type: 'Contextual Topic Alignment' },
    { code: 'footer_banner', label: 'Global Footer Super Leaderboard', dims: '970x90 Banner', type: 'Full-Page Scroll Reach' },
    { code: 'mobile_anchor_banner', label: 'Responsive Mobile Sticky Anchor', dims: '320x50 Anchor', type: 'Continuous High Viewability on Mobile' }
  ];

  const handlePlacementToggle = (code) => {
    setFormData(prev => {
      const exists = prev.preferredPlacements.includes(code);
      return {
        ...prev,
        preferredPlacements: exists
          ? prev.preferredPlacements.filter(p => p !== code)
          : [...prev.preferredPlacements, code]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (!formData.companyName || !formData.contactName || !formData.email || !formData.message) {
        throw new Error('Please fill in all required fields (Company, Contact Name, Email, and Message).');
      }

      const payload = {
        ...formData,
        flightStartDate: formData.flightStartDate && formData.flightStartDate.trim() !== '' ? formData.flightStartDate : null,
        phone: formData.phone && formData.phone.trim() !== '' ? formData.phone.trim() : null,
        website: formData.website && formData.website.trim() !== '' ? formData.website.trim() : null,
        campaignObjectives: formData.campaignObjectives && formData.campaignObjectives.trim() !== '' ? formData.campaignObjectives.trim() : null
      };

      const res = await apiService.submitAdvertiserEnquiry(payload);
      setSuccessResult(res.data || res);
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        budgetRange: 'Tier 2: ₹50,000 – ₹1,50,000 (Targeted Section Sponsorship)',
        preferredPlacements: ['header_leaderboard', 'article_inline'],
        flightStartDate: '',
        campaignObjectives: '',
        message: ''
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit advertising enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMediaKitDownload = () => {
    // Media kit summary download
    const mediaKitContent = `JANTA JOURNAL — COMMERCIAL PARTNERSHIPS & MEDIA KIT 2026
Independent National Daily of Record • Established 1928 • Press Council Registration: REG-BC-2026-DEL-0941

COMMERCIAL DESK CONTACT:
• Desk Email: advertising@jantajournal.com
• Phone: +91 (11) 4890-2800
• Address: Chronicle Bhavan, 14 Parliament Street, New Delhi 110001

AVAILABLE COMMERCIAL FORMATS:
1. Header Super Leaderboard (970x90 / 728x90 desktop, 320x50 mobile)
2. Homepage Hero-Adjacent Half-Page (300x600 high dwell display)
3. In-Article Native Display (728x90 / 300x250 contextual units)
4. Desktop Article Sidebar Top (300x250 Medium Rectangle)
5. Section & Category Page Sponsorship (728x90)
6. Global Footer Super Leaderboard (970x90)
7. Mobile Sticky Anchor Placement (320x50)

EDITORIAL STANDARDS & BRAND SAFETY:
All commercial creative is subject to editorial board review. Political endorsements, misleading financial claims, and unverified medical guarantees are strictly prohibited. Advertisements are labeled clearly with "SPONSORED" or "ADVERTISEMENT" in compliance with ASCI and Press Council guidelines.`;

    const blob = new Blob([mediaKitContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Janta_Journal_Media_Kit_2026.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem 4rem 1rem' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Breadcrumb Navigation */}
        <nav style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <a href="/" style={{ color: '#0f172a', textDecoration: 'none', fontWeight: 600 }}>Home</a>
          <span>/</span>
          <span style={{ color: '#64748b' }}>Commercial Partnerships & Advertising</span>
        </nav>

        {/* Hero Section */}
        <div style={{
          backgroundColor: '#0a101f',
          color: '#ffffff',
          borderRadius: '6px',
          padding: 'clamp(1.75rem, 4vw, 3rem) clamp(1.15rem, 3vw, 2.5rem)',
          backgroundImage: 'linear-gradient(135deg, #0a101f 0%, #172554 100%)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2.5rem'
        }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#93c5fd',
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1rem'
            }}>
              <Award size={14} /> Brand-Safe Independent Media Platform
            </span>

            <h1 style={{
              fontFamily: 'var(--font-headline, Georgia, serif)',
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1rem'
            }}>
              Connect With Decision-Makers Across India's Digital Daily of Record
            </h1>

            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '720px' }}>
              JANTA JOURNAL provides verified, high-impact sponsorship placements for organizations, sovereign institutions, and forward-thinking enterprises. Partner directly with an editorial environment committed to journalistic rigor and reader trust.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <a
                href="#enquiry-form"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.35)'
                }}
              >
                Book Campaign Brief <ArrowRight size={16} />
              </a>

              <button
                type="button"
                onClick={handleMediaKitDownload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} /> Download Media Kit (PDF/Text)
              </button>
            </div>
          </div>
        </div>

        {/* Grid: Formats Specifications & Verified Desk Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          
          {/* Format Specifications Column */}
          <div style={{ backgroundColor: '#ffffff', padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
              Standard Inventory Formats
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Standard IAB and bespoke editorial placements engineered for optimal viewability across desktop, tablet, and mobile readers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {placementOptions.map((opt) => (
                <div key={opt.code} style={{ padding: '0.9rem', borderRadius: '4px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{opt.label}</div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.15rem 0.45rem', borderRadius: '3px' }}>
                      {opt.dims}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>{opt.type}</div>
                </div>
              ))}
            </div>

          </div>

          {/* Verified Commercial Desk & Direct Contact Details */}
          <div style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                Commercial Partnerships Desk
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Directly consult with our monetization team for multi-format flight scheduling, customized industry packages, or sovereign institutional briefings.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Direct Sponsorship Inbox</div>
                    <a href="mailto:advertising@jantajournal.com" style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}>
                      advertising@jantajournal.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Commercial Hotline (10:00 - 18:00 IST)</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                      +91 (11) 4890-2800 / +91 (22) 6940-1928
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Commercial Bureau Office</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
                      Chronicle Bhavan, Commercial Affairs Desk<br />
                      14 Parliament Street, New Delhi 110001
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transparency Note */}
            <div style={{ padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '0.76rem', color: '#475569', lineHeight: 1.5 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                <AlertCircle size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Audited Circulation Policy:</strong> In compliance with truthful media representation standards, JANTA JOURNAL does not publish unverified or simulated audience reach claims. Customized flight proposals provide audited delivery metrics upon campaign completion.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Campaign Enquiry Form Section */}
        <div id="enquiry-form" style={{ backgroundColor: '#ffffff', padding: 'clamp(1.25rem, 3.5vw, 2.5rem)', borderRadius: '6px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Direct Advertiser Booking
              </span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)', fontWeight: 900, color: '#0f172a', marginTop: '0.35rem' }}>
                Submit a Campaign Enquiry
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.4rem' }}>
                Provide your campaign specifications below. Our commercial desk will review your requirements and formulate a tailored media proposal.
              </p>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '4px', fontSize: '0.84rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}

            {successResult && (
              <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '4px', marginBottom: '2rem', textAlign: 'center' }}>
                <CheckCircle size={36} color="#16a34a" style={{ margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#166534' }}>
                  Enquiry Successfully Registered (Lead #{successResult.id})
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#15803d', marginTop: '0.4rem', lineHeight: 1.5 }}>
                  {successResult.message || 'Thank you for reaching out. Our commercial team has received your enquiry and will be in touch shortly.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSuccessResult(null)}
                  style={{ marginTop: '1rem', backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Submit Another Brief
                </button>
              </div>
            )}

            {!successResult && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Company & Contact */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. Tata Consultancy Services"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Primary Contact Representative *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="e.g. Anand Mahindra"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                {/* Email, Phone & Website */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Corporate Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="corporate@domain.com"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Direct Phone / Mobile
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Corporate Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://company.com"
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                {/* Preferred Placements (Multi-Select checkboxes) */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                    Select Preferred Advertising Placements
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.6rem' }}>
                    {placementOptions.map((opt) => (
                      <label 
                        key={opt.code} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '4px',
                          border: formData.preferredPlacements.includes(opt.code) ? '1px solid #2563eb' : '1px solid #e2e8f0',
                          backgroundColor: formData.preferredPlacements.includes(opt.code) ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#1e293b'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.preferredPlacements.includes(opt.code)}
                          onChange={() => handlePlacementToggle(opt.code)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget Range & Flight Start Date */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Estimated Campaign Budget *
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem', backgroundColor: '#ffffff' }}
                    >
                      <option value="Tier 1: Under ₹50,000 (Introductory Pilot Placement)">Tier 1: Under ₹50,000 (Pilot Placement)</option>
                      <option value="Tier 2: ₹50,000 – ₹1,50,000 (Targeted Section Sponsorship)">Tier 2: ₹50,000 – ₹1,50,000 (Section Sponsorship)</option>
                      <option value="Tier 3: ₹1,50,000 – ₹5,00,000 (Multi-Placement Monthly Flight)">Tier 3: ₹1,50,000 – ₹5,00,000 (Multi-Placement Flight)</option>
                      <option value="Tier 4: ₹5,00,000+ (Institutional & Annual Partnership)">Tier 4: ₹5,00,000+ (Institutional Annual Partnership)</option>
                      <option value="Custom Enterprise / Discussion Required">Custom Enterprise / To Be Discussed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Target Campaign Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.flightStartDate}
                      onChange={(e) => setFormData({ ...formData, flightStartDate: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                {/* Campaign Message / Objectives */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                    Campaign Brief & Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your campaign objectives, key audiences, target messaging, and any specific requirements..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.88rem', fontFamily: 'inherit' }}
                  />
                </div>

                {/* Submit Button */}
                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      padding: '0.75rem 1.8rem',
                      borderRadius: '4px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      border: 'none',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? 'Submitting Brief...' : (
                      <>
                        <Send size={16} /> Submit Campaign Brief
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
