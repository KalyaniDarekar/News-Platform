// ========================================================================
// Authentication Context
// Manages JWT token lifecycle, user state, and auth session persistence
// ========================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const isLocalhost = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '::1'
);

const API_BASE = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:5000/api' : 'https://news-platform-2goj.onrender.com/api');
const TOKEN_KEY = 'auth_token';
const BC_TOKEN_KEY = 'bc_auth_token';
const USER_KEY = 'auth_user';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => 
    localStorage.getItem(TOKEN_KEY) || localStorage.getItem(BC_TOKEN_KEY) || null
  );
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate stored token against /api/v1/auth/me on mount
  useEffect(() => {
    async function verifyAuth() {
      const savedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(BC_TOKEN_KEY);
      if (!savedToken) {
        setLoading(false);
        return;
      }

      // If mock dev session, maintain it
      if (savedToken.startsWith('mock_jwt_')) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/v1/auth/me`, {
          headers: {
            'Authorization': `Bearer ${savedToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.user) {
            setUser(data.data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
          }
        } else if (res.status === 401) {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.warn('Auth token verification check failed (offline or network error):', err.message);
      } finally {
        setLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (identifier, password) => {
    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, username: identifier, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Authentication failed. Please verify credentials.');
      }

      const { token: receivedToken, user: receivedUser } = data.data;
      localStorage.setItem(TOKEN_KEY, receivedToken);
      localStorage.setItem(BC_TOKEN_KEY, receivedToken);
      localStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
      setToken(receivedToken);
      setUser(receivedUser);

      return receivedUser;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(BC_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
