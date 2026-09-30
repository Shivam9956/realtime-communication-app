import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('omnisync_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify authentication state on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('omnisync_token');
      const storedUser = localStorage.getItem('omnisync_user');

      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      // Preload cached user for fast initial render
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Ignore parse errors on cached state
        }
      }

      try {
        // Validate token with backend /api/auth/me
        const response = await api.auth.getMe();
        if (isMounted && response?.user) {
          setUser(response.user);
          setToken(storedToken);
          localStorage.setItem('omnisync_user', JSON.stringify(response.user));
        }
      } catch (err) {
        console.warn('Authentication token invalid or expired:', err.message);
        if (isMounted) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('omnisync_token');
          localStorage.removeItem('omnisync_user');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * User login handler
   */
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await api.auth.login({ email, password });
      
      const { token: receivedToken, user: receivedUser } = response;
      
      setUser(receivedUser);
      setToken(receivedToken);
      localStorage.setItem('omnisync_token', receivedToken);
      localStorage.setItem('omnisync_user', JSON.stringify(receivedUser));

      return receivedUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * User registration handler
   */
  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const response = await api.auth.register({ name, email, password });
      
      const { token: receivedToken, user: receivedUser } = response;

      setUser(receivedUser);
      setToken(receivedToken);
      localStorage.setItem('omnisync_token', receivedToken);
      localStorage.setItem('omnisync_user', JSON.stringify(receivedUser));

      return receivedUser;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  /**
   * User logout handler
   */
  const logout = async () => {
    try {
      if (token) {
        await api.auth.logout().catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      setAuthError(null);
      localStorage.removeItem('omnisync_token');
      localStorage.removeItem('omnisync_user');
    }
  };

  /**
   * Refresh current user profile
   */
  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await api.auth.getMe();
      if (response?.user) {
        setUser(response.user);
        localStorage.setItem('omnisync_user', JSON.stringify(response.user));
        return response.user;
      }
    } catch (err) {
      console.error('Failed to refresh user:', err.message);
    }
    return null;
  }, [token]);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    authError,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
