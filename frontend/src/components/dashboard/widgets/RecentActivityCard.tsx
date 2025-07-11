import React from 'react';
import { formatTimestamp } from '../../../utils/dateUtils';

export interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'payment' | 'user' | 'system' | 'audit' | 'academic' | 'fee';
  user?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface RecentActivityCardProps {
  title: string;
  activities: Activity[];
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
  className?: string;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  title,
  activities,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
  className = '',
}) => {
  const getActivityTypeColor = (type: Activity['type']) => {
    const colorMap = {
      payment: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
      user: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
      system: 'bg-secondary-100 dark:bg-gray-700 text-secondary-800 dark:text-gray-200',
      audit: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
      academic: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      fee: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    };
    return colorMap[type];
  };

  const getActivityTypeIcon = (type: Activity['type']) => {
    // Default icons for different activity types
    const iconMap = {
      payment: '💳',
      user: '👤',
      system: '⚙️',
      audit: '📊',
      academic: '📚',
      fee: '💰',
    };
    return iconMap[type];
  };

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 transition-colors duration-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">
            {title}
          </h3>
          {showViewAll && onViewAll && activities.length > maxItems && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              View all
            </button>
          )}
        </div>

        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-secondary-400 dark:text-gray-500 text-4xl mb-2">📋</div>
            <p className="text-secondary-500 dark:text-gray-400 text-sm">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 ${
                  index !== displayedActivities.length - 1 ? 'pb-4 border-b border-secondary-100 dark:border-gray-700' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {activity.icon ? (
                    <div className="p-2 rounded-full bg-secondary-100 dark:bg-gray-700">
                      <activity.icon className="h-4 w-4 text-secondary-600 dark:text-gray-400" />
                    </div>
                  ) : (
                    <div className="text-lg">
                      {getActivityTypeIcon(activity.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-secondary-900 dark:text-gray-100 truncate">
                      {activity.title}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-600 dark:text-gray-300 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {activity.user && (
                      <p className="text-xs text-secondary-500 dark:text-gray-400">
                        by {activity.user}
                      </p>
                    )}
                    <p className="text-xs text-secondary-400 dark:text-gray-500">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivityCard;
