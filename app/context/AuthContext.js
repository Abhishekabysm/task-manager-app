'use client'; // Required for hooks like useState, useEffect, useContext

import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/api'; // Import the configured Axios instance

// 1. Create Context
const AuthContext = createContext(null);

// 2. Create Provider Component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null); // Store user details (id, name, email)
  const [loading, setLoading] = useState(true); // Indicate initial auth check
  const [error, setError] = useState(null); // Store auth-related errors
  const router = useRouter();

  // --- Helper Function to Set Token and User ---
  const setAuthState = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== 'undefined') {
      if (newToken) {
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['x-auth-token'] = newToken; // Update axios default header
      } else {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['x-auth-token']; // Remove header
      }
    }
    setError(null); // Clear previous errors on successful auth change
  };

  // --- Load User Function (Called on initial load and after login/register) ---
  const loadUser = useCallback(async () => {
    console.log('loadUser called, current state:', { hasToken: !!token, hasUser: !!user });

    // Check for token in localStorage on initial load
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // No token found anywhere
    if (!storedToken && !token) {
        console.log('No token found, clearing auth state');
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
    }

    // If we have a token (either from state or storage), try to verify it
    const currentToken = token || storedToken;

    // Should not happen based on above check, but safeguard
    if (!currentToken) {
        console.log('No current token, clearing auth state');
        setToken(null);
        setUser(null);
        setLoading(false);
        return;
    }

    // Set token in state and headers if loaded from storage
    if (!token && storedToken) {
        console.log('Setting token from localStorage');
        setToken(storedToken);
        api.defaults.headers.common['x-auth-token'] = storedToken;
    }

    // If we already have user data and token hasn't changed, no need to fetch again
    if (user && token === currentToken) {
        console.log('User already loaded and token unchanged, skipping fetch');
        setLoading(false);
        return;
    }

    console.log('Fetching user data with token');
    setLoading(true);

    try {
      // Fetch user data with the token
      const response = await api.get('/auth/me');
      console.log('User data fetched successfully:', response.data);

      // Update both token and user
      setToken(currentToken);
      setUser(response.data);

      // Ensure token is in headers
      api.defaults.headers.common['x-auth-token'] = currentToken;

      // Clear any previous errors
      setError(null);
    } catch (err) {
      // Log specific error type if available
      console.error('Failed to load user or verify token:', err.response?.data?.message || err.message);

      // Clear auth state on error (invalid/expired token)
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['x-auth-token'];

      setError('Failed to verify authentication.');
    } finally {
      setLoading(false);
    }
  }, [token, user]); // Dependencies on both token and user

  // --- Effect to Load User on Initial Mount ---
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // --- Login Function ---
  async function login(email, password) {
    setLoading(true);
    setError(null);

    try {
      // First, authenticate with credentials
      const response = await api.post('/auth/login', { email, password });

      if (!response.data.token) {
        throw new Error('No token received from server');
      }

      // Set the token in state and localStorage
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['x-auth-token'] = response.data.token;

      // If user data is included in the response, use it
      if (response.data.user) {
        setUser(response.data.user);

        // Wait to ensure state is updated before redirecting
        setTimeout(() => {
          router.push('/dashboard');
          setLoading(false);
        }, 300);

        return true;
      }

      // If no user data in response, fetch it with the token
      try {
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);

        // Now redirect after we have both token and user data
        setTimeout(() => {
          router.push('/dashboard');
          setLoading(false);
        }, 300);

        return true;
      } catch (userErr) {
        console.error('Failed to fetch user data after login:', userErr);
        // Even if user fetch fails, we still have a token, so consider login successful
        // but log the error
        setTimeout(() => {
          router.push('/dashboard');
          setLoading(false);
        }, 300);

        return true;
      }
    } catch (err) {
      // Handle specific error cases with user-friendly messages
      if (err.response?.status === 400) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 401) {
        setError('Unauthorized. Please check your credentials.');
      } else if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        // Generic fallback error
        setError('Login failed. Please try again later.');
      }

      setLoading(false);
      return false;
    }
  }

  // --- Register Function ---
  const register = async (name, email, password, country) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Registering with data:', { name, email, password: '***', country });
      const response = await api.post('/auth/register', { name, email, password, country });
      console.log('Registration response:', response.data);

      if (!response.data.token) {
        throw new Error('No token received from server');
      }

      // Set the token in state and localStorage
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      api.defaults.headers.common['x-auth-token'] = response.data.token;

      // If user data is included in the response, use it
      if (response.data.user) {
        setUser(response.data.user);

        // Wait to ensure state is updated before redirecting
        setTimeout(() => {
          router.push('/dashboard');
          setLoading(false);
        }, 300);

        return true;
      }

      // If no user data in response, fetch it with the token
      try {
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);

        // Now redirect after we have both token and user data
        setTimeout(() => {
          router.push('/dashboard');
          setLoading(false);
        }, 300);

        return true;
      } catch (userErr) {
        console.error('Failed to fetch user data after registration:', userErr);
        // Even if user fetch fails, we still have a token, so consider registration successful
        setTimeout(() => {
          router.push('/dashboard');
          setLoading(false);
        }, 300);

        return true;
      }
    } catch (err) {
      console.error('Registration failed:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setAuthState(null, null);
      setLoading(false);
      return false; // Indicate failure
    }
  };

  // --- Logout Function ---
  const logout = () => {
    setAuthState(null, null);
    router.push('/login'); // Redirect to login page after logout
  };

  // --- Value Provided by Context ---
  const value = {
    token,
    user,
    isAuthenticated: !!user, // Check for user object instead of just token
    loading,
    error,
    login,
    logout,
    register,
    loadUser, // Expose loadUser if needed externally
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create Custom Hook to Use Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
