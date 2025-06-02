import React from 'react';
import { formatDistanceToNow } from 'date-fns';

export interface Activity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'payment' | 'user' | 'system' | 'audit' | 'academic' | 'fee';
  user?: string;
  icon?: React.ComponentType<any>;
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
      payment: 'bg-success-100 text-success-800',
      user: 'bg-primary-100 text-primary-800',
      system: 'bg-secondary-100 text-secondary-800',
      audit: 'bg-warning-100 text-warning-800',
      academic: 'bg-purple-100 text-purple-800',
      fee: 'bg-blue-100 text-blue-800',
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
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            {title}
          </h3>
          {showViewAll && onViewAll && activities.length > maxItems && (
            <button
              onClick={onViewAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </button>
          )}
        </div>

        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-secondary-400 text-4xl mb-2">📋</div>
            <p className="text-secondary-500 text-sm">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-start space-x-3 ${
                  index !== displayedActivities.length - 1 ? 'pb-4 border-b border-secondary-100' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {activity.icon ? (
                    <div className="p-2 rounded-full bg-secondary-100">
                      <activity.icon className="h-4 w-4 text-secondary-600" />
                    </div>
                  ) : (
                    <div className="text-lg">
                      {getActivityTypeIcon(activity.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {activity.title}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                      {activity.type}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-600 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    {activity.user && (
                      <p className="text-xs text-secondary-500">
                        by {activity.user}
                      </p>
                    )}
                    <p className="text-xs text-secondary-400">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
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
