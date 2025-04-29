'use client';

import Link from 'next/link';
import NotificationDropdown from '../components/NotificationDropdown';
import { useAuth } from '../context/AuthContext';
// Other imports you might have

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header/Navigation */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-white font-bold text-xl">
                TaskMaster
              </Link>
            </div>

            {/* Right side - User menu & notifications */}
            <div className="flex items-center space-x-4">
              {/* Notification dropdown */}
              <NotificationDropdown />
              
              {/* User dropdown or profile link */}
              <div className="relative">
                <div className="flex items-center">
                  <span className="text-gray-300 mr-2">
                    {user?.name || 'User'}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-300 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
