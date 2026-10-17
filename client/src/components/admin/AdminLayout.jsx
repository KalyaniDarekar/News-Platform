import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, PlusCircle, FolderTree, Image, 
  CalendarClock, Megaphone, BarChart3, Settings, LogOut, 
  ExternalLink, Bell, Search, Shield, ChevronRight, Menu, X, Sparkles, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'News Management', path: '/admin/articles', icon: FileText },
    { label: 'Create New Article', path: '/admin/articles/new', icon: PlusCircle },
    { label: 'Categories Desk', path: '/admin/categories', icon: FolderTree },
    { label: 'Media Library', path: '/admin/media', icon: Image },
    { label: 'Scheduled & Expiry', path: '/admin/scheduled', icon: CalendarClock },
    { label: 'Ad Monetization', path: '/admin/ads', icon: Megaphone },
    { label: 'Ad Enquiries & Leads', path: '/admin/enquiries', icon: Briefcase },
    { label: 'Editorial Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-theme" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      
      {/* Admin Sidebar Navigation */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
        flexShrink: 0
      }} className="hidden-mobile-admin">
        
        {/* Brand Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
              EDITORIAL WORKSPACE
            </div>
            <div style={{ fontFamily: 'var(--font-masthead)', fontSize: '1.05rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
              BHARAT CHRONICLE
            </div>
          </div>
          <span style={{ backgroundColor: '#1e3a8a', color: '#bfdbfe', fontSize: '0.62rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '3px' }}>
            CMS v1.0
          </span>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '4px',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#2563eb' : 'transparent',
                  transition: 'all 150ms ease'
                })}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Sidebar: User Profile & Public Site Link */}
        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            to="/"
            target="_blank"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              backgroundColor: '#1e293b',
              color: '#cbd5e1',
              padding: '0.5rem',
              borderRadius: '4px',
              fontSize: '0.76rem',
              fontWeight: 600
            }}
          >
            <span>View Live Public Site</span>
            <ExternalLink size={12} />
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                flexShrink: 0
              }}>
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {user?.fullName || user?.email || 'Editorial Staff'}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                  {user?.role ? user.role.replace('_', ' ') : 'Staff'}
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              title="Sign Out" 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.25rem', display: 'flex', alignItems: 'center' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Admin Top Header */}
        <header style={{
          height: '60px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mobile / Tablet Drawer Toggle Button */}
            <button
              type="button"
              className="show-tablet"
              onClick={() => setSidebarOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.45rem',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#0f172a',
                cursor: 'pointer'
              }}
              title="Open Navigation"
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>

            {/* Newsroom Notice Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '0.25rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <Sparkles size={12} />
              <span className="hidden-mobile">Newsroom CMS Preview Mode</span>
              <span className="show-mobile">CMS Preview</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link
              to="/admin/articles/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '0.45rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              <PlusCircle size={14} /> New Story
            </Link>

            <Link to="/" style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }} className="hidden-mobile">
              Exit to Portal
            </Link>
          </div>

        </header>

        {/* Dynamic Admin Page Outlet with Responsive Container */}
        <main className="admin-main-content">
          <Outlet />
        </main>

      </div>

      {/* Mobile & Tablet Slide-out Drawer */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            zIndex: 1000,
            display: 'flex',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            style={{
              width: '82%',
              maxWidth: '300px',
              backgroundColor: '#0f172a',
              color: '#f8fafc',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                  EDITORIAL WORKSPACE
                </div>
                <div style={{ fontFamily: 'var(--font-masthead)', fontSize: '1rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.04em' }}>
                  BHARAT CHRONICLE
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                style={{ color: '#94a3b8', padding: '0.35rem', cursor: 'pointer' }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <nav style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, overflowY: 'auto' }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '4px',
                      fontSize: '0.84rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#ffffff' : '#94a3b8',
                      backgroundColor: isActive ? '#2563eb' : 'transparent'
                    })}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#1e293b',
                  color: '#cbd5e1',
                  padding: '0.55rem',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <span>View Live Public Site</span>
                <ExternalLink size={13} />
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}>
                    {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {user?.fullName || user?.email || 'Editorial Staff'}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    logout();
                    navigate('/admin/login');
                  }}
                  title="Sign Out" 
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0.35rem' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
