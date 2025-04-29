'use client';

import Link from 'next/link';
import NotificationDropdown from '../components/NotificationDropdown';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header/Navigation with reduced margins */}
      <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo */}
            <div className="flex-shrink-0">
              <Link 
                href="/dashboard" 
                className="text-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
              >
                TaskMaster
              </Link>
            </div>

            {/* Right side - User menu & notifications */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <NotificationDropdown />
              </div>
              
              {/* User section */}
              <div className="flex items-center space-x-3 border-l border-gray-700/50 pl-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  
                  <span className="text-sm font-medium text-gray-300 hidden sm:inline">
                    {user?.name || 'User'}
                  </span>
                  
                  <button
                    onClick={logout}
                    className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-md transition-colors duration-200 hover:bg-gray-800/50 border border-gray-700/50 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content with reduced margins */}
      <main className="px-4 py-4">
        {children}
      </main>
    </div>
  );
}
