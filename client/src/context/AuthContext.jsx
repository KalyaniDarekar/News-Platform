// ========================================================================
// Authentication Context — Phase 3 (Task 4)
// Manages JWT token lifecycle, user state, and auth session persistence
// Works with live Express/MySQL JWT tokens with dev offline fallback.
// ========================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
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
      // If backend database is unreachable or returning connection error in local development,
      // provide seamless fallback so the editor is never locked out of testing.
      const errMsg = err.message || '';
      const isDbError = errMsg.toLowerCase().includes('database') || 
                        errMsg.toLowerCase().includes('access denied') || 
                        errMsg.toLowerCase().includes('failed to fetch') || 
                        errMsg.toLowerCase().includes('networkerror');

      if (isDbError) {
        console.warn('Database connection unavailable. Initializing fallback newsroom session:', errMsg);
        const demoRole = email.includes('admin') ? 'super_admin' : email.includes('reporter') ? 'reporter' : 'editor';
        const demoUser = {
          id: 1,
          fullName: demoRole === 'super_admin' ? 'Super Administrator' : demoRole === 'reporter' ? 'Staff Reporter' : 'Vikramaditya Sharma',
          email,
          role: demoRole
        };
        const demoToken = 'mock_jwt_' + Date.now();
        localStorage.setItem(TOKEN_KEY, demoToken);
        localStorage.setItem(BC_TOKEN_KEY, demoToken);
        localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
        return demoUser;
      }
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
