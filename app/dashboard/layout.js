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
        <div className="mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link href="/dashboard" className="text-white font-bold text-lg sm:text-xl">
                TaskMaster
              </Link>
            </div>

            {/* Right side - User menu & notifications */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notification dropdown */}
              <NotificationDropdown />
              
              {/* User dropdown or profile link */}
              <div className="relative">
                <div className="flex items-center">
                  <span className="text-gray-300 mr-2 hidden sm:inline">
                    {user?.name || 'User'}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-300 hover:text-white px-2 py-1"
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
      <main className="mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
