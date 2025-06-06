import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotificationStore, startNotificationPolling, stopNotificationPolling } from '../../store/notificationStore';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const { unreadCount, loadUnreadCount, loadNotifications } = useNotificationStore();
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  useEffect(() => {
    // Load initial data
    loadUnreadCount();
    loadNotifications();

    // Start polling for new notifications
    startNotificationPolling();

    // Request browser notification permission with proper error handling
    const requestNotificationPermission = async () => {
      try {
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (error) {
        // Silently handle permission request errors
        console.warn('Notification permission request failed:', error);
      }
    };

    requestNotificationPermission();

    // Cleanup on unmount
    return () => {
      stopNotificationPolling();
    };
  }, [loadUnreadCount, loadNotifications]);

  const handleBellClick = () => {
    setIsNotificationCenterOpen(true);
  };

  const handleCloseNotificationCenter = () => {
    setIsNotificationCenterOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleBellClick}
        className="relative p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 focus:ring-primary-500 rounded-full transition-colors"
        title="Notifications"
      >
        <BellIcon className="h-6 w-6" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 dark:bg-red-500 rounded-full min-w-[1.25rem] h-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-5 w-5 rounded-full bg-red-400 dark:bg-red-500 opacity-75 animate-ping"></span>
        )}
      </button>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={isNotificationCenterOpen}
        onClose={handleCloseNotificationCenter}
      />
    </>
  );
};

export default NotificationBell;
