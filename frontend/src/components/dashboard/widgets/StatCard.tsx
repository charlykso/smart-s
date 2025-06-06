import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  iconColor?: string;
  description?: string;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  iconColor = 'text-primary-600',
  description,
  loading = false,
  onClick,
  className = '',
}) => {
  const isClickable = !!onClick;

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-success-600 dark:text-success-400';
      case 'decrease':
        return 'text-error-600 dark:text-error-400';
      default:
        return 'text-secondary-600 dark:text-gray-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpIcon className="h-4 w-4" />;
      case 'decrease':
        return <ArrowDownIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900 rounded-lg border border-secondary-200 dark:border-gray-700 transition-colors duration-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-secondary-200 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-secondary-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-secondary-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm dark:shadow-gray-900 rounded-lg border border-secondary-200 dark:border-gray-700 transition-all duration-200 ${
        isClickable ? 'hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <div className="p-4 sm:p-5">
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center min-w-0 flex-1">
            <div className="flex-shrink-0">
              <div className={`p-2 rounded-lg bg-secondary-50 dark:bg-gray-700`}>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor} dark:text-primary-400`} aria-hidden="true" />
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-secondary-600 dark:text-gray-400 truncate">
                {title}
              </p>
            </div>
          </div>
          {change && (
            <div className={`flex items-center flex-shrink-0 ml-2 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="text-xs sm:text-sm font-medium ml-1 truncate">
                {change}
              </span>
            </div>
          )}
        </div>

        {/* Value and Description */}
        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-bold text-secondary-900 dark:text-gray-100 truncate">
            {value}
          </p>
          {description && (
            <p className="text-xs text-secondary-500 dark:text-gray-500 truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom section with change details */}
      {change && (
        <div className="bg-secondary-50 dark:bg-gray-700 px-4 sm:px-5 py-2 sm:py-3 border-t border-secondary-100 dark:border-gray-600">
          <div className="text-xs sm:text-sm">
            <span className={`font-medium ${getChangeColor()} truncate inline-block max-w-full`}>
              {change}
            </span>
            <span className="text-secondary-500 dark:text-gray-400 ml-1 truncate"> from last month</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
