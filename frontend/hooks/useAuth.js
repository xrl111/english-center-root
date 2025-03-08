import { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/router';
import axios from '../utils/api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Fetch user profile
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const handleRedirection = userData => {
    // Only handle redirection if we're on an auth page
    if (router.pathname.startsWith('/auth/')) {
      // Check if there's a returnUrl in the query parameters
      const returnUrl = router.query.returnUrl;
      if (returnUrl && typeof returnUrl === 'string') {
        router.push(returnUrl);
      } else {
        // Default role-based redirection
        if (userData.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    }
  };

  const fetchUserProfile = async (isInitialLogin = false) => {
    try {
      const response = await axios.get('/auth/profile');
      setUser(response.data);

      // Handle redirection only if it's an initial login or we're on an auth page
      if (isInitialLogin || router.pathname.startsWith('/auth/')) {
        handleRedirection(response.data);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      // Only clear tokens if it's not immediately after login
      if (!isInitialLogin) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        router.push('/auth/login');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async authData => {
    try {
      const { accessToken, refreshToken } = authData;

      // Set tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch user profile and handle redirection
      await fetchUserProfile(true);
    } catch (error) {
      // If profile fetch fails during login, clean up
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      router.push('/auth/login');
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await axios.post('/auth/refresh', { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      return newAccessToken;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      router.push('/auth/login');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
