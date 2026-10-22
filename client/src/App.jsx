import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Common Public UI
import TopInfoBar from './components/common/TopInfoBar';
import Masthead from './components/common/Masthead';
import MainNavigation from './components/common/MainNavigation';
import BreakingTicker from './components/common/BreakingTicker';
import Footer from './components/common/Footer';
import SearchModal from './components/common/SearchModal';
import ConsentBanner from './components/common/ConsentBanner';
import AdBanner from './components/common/AdBanner';
import ScrollToTop from './components/common/ScrollToTop';
import usePageTracking from './hooks/usePageTracking';

// Public Pages
import HomePage from './pages/public/HomePage';
import CategoryPage from './pages/public/CategoryPage';
import ArticleDetailPage from './pages/public/ArticleDetailPage';
import SearchResultsPage from './pages/public/SearchResultsPage';
import VideoNewsPage from './pages/public/VideoNewsPage';
import AdvertisePage from './pages/public/AdvertisePage';
import AboutUsPage from './pages/public/AboutUsPage';
import ContactUsPage from './pages/public/ContactUsPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import TermsPage from './pages/public/TermsPage';
import EditorialPoliciesPage from './pages/public/EditorialPoliciesPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin CMS Components & Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminArticlesPage from './pages/admin/AdminArticlesPage';
import AdminArticleEditPage from './pages/admin/AdminArticleEditPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminMediaPage from './pages/admin/AdminMediaPage';
import AdminScheduledPage from './pages/admin/AdminScheduledPage';
import AdminAdsPage from './pages/admin/AdminAdsPage';
import AdminEnquiriesPage from './pages/admin/AdminEnquiriesPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// Protected Route Guard for Admin Panel
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.9rem' }}>
        Verifying newsroom credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

// Public Website Shell Layout
function PublicLayout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Privacy-conscious, debounced first-party page view telemetry
  usePageTracking();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopInfoBar />
      <Masthead onSearchClick={() => setIsSearchOpen(true)} />
      <MainNavigation onSearchClick={() => setIsSearchOpen(true)} />
      <BreakingTicker />
      
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <Footer />

      {/* Floating Responsive Mobile Anchor Ad Slot */}
      <AdBanner slot="mobileAnchor" />

      {/* DPDP Act 2023 & GDPR Consent Controller */}
      <ConsentBanner />

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          
          {/* ================= PUBLIC WEBSITE ROUTES ================= */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="article/:slug" element={<ArticleDetailPage />} />
            <Route path="search" element={<SearchResultsPage />} />
            <Route path="videos" element={<VideoNewsPage />} />
            <Route path="advertise" element={<AdvertisePage />} />
            <Route path="about" element={<AboutUsPage />} />
            <Route path="contact" element={<ContactUsPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="policies" element={<EditorialPoliciesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* ================= ADMIN CMS ROUTES ================= */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="articles" element={<AdminArticlesPage />} />
            <Route path="review" element={<AdminArticlesPage defaultStatus="in_review" />} />
            <Route path="articles/new" element={<AdminArticleEditPage />} />
            <Route path="articles/:id/edit" element={<AdminArticleEditPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="media" element={<AdminMediaPage />} />
            <Route path="scheduled" element={<AdminScheduledPage />} />
            <Route path="ads" element={<AdminAdsPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
