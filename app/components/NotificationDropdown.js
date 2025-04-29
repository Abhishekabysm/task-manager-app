'use client';

import { useEffect, useRef, useState } from 'react';
import { getNotifications, markNotificationRead } from '../lib/api';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      // Handle the error silently to avoid disrupting the user experience
      // The dropdown can just show an empty state if notifications fail to load
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications
    const interval = setInterval(() => {
      if (!isOpen) { // Only fetch when dropdown is closed
        fetchNotifications();
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle marking notification as read
  const handleNotificationClick = async (taskId) => {
    try {
      await markNotificationRead(taskId);
      setNotifications(notifications.filter(task => task._id !== taskId));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  // Format date function
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-400 rounded-full hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
        aria-label="View notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        
        {/* Notification badge */}
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
        )}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="px-4 py-2 border-b border-gray-700">
              <h3 className="text-sm font-medium text-white">Notifications</h3>
            </div>
            
            {loading ? (
              <div className="px-4 py-3 text-sm text-gray-300 text-center">
                Loading notifications...
              </div>
            ) : notifications.length > 0 ? (
              <>
                {notifications.map((task) => (
                  <div 
                    key={task._id} 
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleNotificationClick(task._id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">
                          {task.title}
                        </p>
                        <div className="mt-1 text-xs text-gray-300">
                          {task.notifications[0]?.message || 'New task assigned to you'}
                        </div>
                        <div className="mt-1 text-xs text-gray-400">
                          {formatTimeAgo(task.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="px-4 py-2 text-center border-t border-gray-700">
                  <button 
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                    onClick={() => {
                      Promise.all(notifications.map(task => 
                        markNotificationRead(task._id)
                      )).then(() => {
                        setNotifications([]);
                      });
                    }}
                  >
                    Mark all as read
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-300 text-center">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}