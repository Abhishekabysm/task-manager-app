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
    // Check for token in localStorage on initial load
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!storedToken && !token) { // No token found anywhere
        setAuthState(null, null);
        setLoading(false);
        return;
    }

    // If we have a token (either from state or storage), try to verify it
    const currentToken = token || storedToken;
    if (!currentToken) { // Should not happen based on above check, but safeguard
        setAuthState(null, null);
        setLoading(false);
        return;
    }

    // Set token in state and headers if loaded from storage
    if (!token && storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['x-auth-token'] = storedToken;
    }

    setLoading(true);
    try {
      // We need an endpoint to get user data based on the token
      // Let's assume '/api/auth/me' exists (we need to create this endpoint)
      // If '/api/auth/me' doesn't exist yet, this will fail.
      // For now, we might just store the token and assume validity
      // until we implement the '/me' route.

      // --- Actual implementation using /api/auth/me ---
      const response = await api.get('/auth/me'); // Call the backend endpoint
      setAuthState(currentToken, response.data); // Set token and user data from response
      // --- End actual implementation ---

    } catch (err) {
      // Log specific error type if available (e.g., from interceptor)
      console.error('Failed to load user or verify token:', err.response?.data?.message || err.message);
      setAuthState(null, null); // Clear state on error (e.g., invalid/expired token)
      setError('Failed to verify authentication.');
    } finally {
      setLoading(false);
    }
  }, [token]); // Dependency on token ensures we re-check if token changes externally

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
      const response = await api.post('/auth/login', { email, password });
      
      // Handle successful login
      setAuthState(response.data.token, response.data.user);
      router.push('/dashboard');
      
      setLoading(false);
      return true;
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
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const newToken = response.data.token;
      setAuthState(newToken, null);
      // await loadUser(); // Or fetch user data directly if register returns it
      router.push('/dashboard'); // Redirect to dashboard after registration
      return true; // Indicate success
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setAuthState(null, null);
      return false; // Indicate failure
    } finally {
      setLoading(false);
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
    isAuthenticated: !!token, // Simple check if token exists
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
