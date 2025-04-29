'use client'; // Required for hooks and client-side logic

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext'; // Adjust path if necessary

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial authentication check is complete
    if (!loading) {
      if (isAuthenticated) {
        // If authenticated, redirect to the dashboard
        router.replace('/dashboard'); // Use replace to avoid adding '/' to history
      } else {
        // If not authenticated, redirect to the login page
        router.replace('/login');
      }
    }
  }, [isAuthenticated, loading, router]); // Dependencies for the effect

  // Display a loading indicator while checking authentication status
  // This prevents briefly showing this page before redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      {/* Tailwind CSS Spinner */}
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-500 border-t-transparent"></div>
    </div>
  );
}
