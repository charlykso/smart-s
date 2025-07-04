import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export interface NotificationCardProps {
  title: string;
  notifications: Notification[];
  maxItems?: number;
  onMarkAsRead?: (id: string) => void;
  onViewAll?: () => void;
  className?: string;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  notifications,
  maxItems = 5,
  onMarkAsRead,
  onViewAll,
  className = '',
}) => {
  const displayedNotifications = notifications.slice(0, maxItems);
  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type: Notification['type']) => {
    const colorMap = {
      info: 'text-blue-600 bg-blue-100',
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
    };
    return colorMap[type];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 transition-colors duration-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-secondary-600 mr-2" />
            <h3 className="text-lg font-semibold text-secondary-900">
              {title}
            </h3>
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount}
              </span>
            )}
          </div>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          )}
        </div>

        {displayedNotifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-secondary-400 text-4xl mb-2">🔔</div>
            <p className="text-secondary-500 text-sm">No notifications</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border ${
                  notification.read ? 'bg-secondary-50 border-secondary-200' : 'bg-white border-primary-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      {!notification.read && (
                        <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full"></span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-secondary-900 mt-2">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-secondary-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-secondary-400 mt-2">
                      {notification.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.read && onMarkAsRead && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-xs text-primary-600 hover:text-primary-700 ml-2"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
