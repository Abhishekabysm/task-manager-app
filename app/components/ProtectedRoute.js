'use client'; // Required for hooks and client-side logic

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial authentication check is complete
    if (!loading) {
      if (!isAuthenticated) {
        // If not authenticated after loading, redirect to login
        router.push('/login');
      }
      // If authenticated, do nothing (allow rendering children)
    }
  }, [isAuthenticated, loading, router]); // Re-run effect if auth status or loading changes

  // While loading the authentication status, show a loading indicator
  // Or if not authenticated (and the redirect effect hasn't kicked in yet),
  // also show loading to prevent brief flashes of protected content.
  if (loading || !isAuthenticated) {
    // You can replace this with a more sophisticated loading spinner component
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-600">
        Loading authentication status...
      </div>
    );
  }

  // If loading is finished and user is authenticated, render the protected content
  return children;
};

export default ProtectedRoute;
