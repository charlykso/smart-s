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
        return 'text-success-600';
      case 'decrease':
        return 'text-error-600';
      default:
        return 'text-secondary-600';
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
      <div className={`bg-white overflow-hidden shadow-sm rounded-lg border border-secondary-200 ${className}`}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-secondary-200 rounded"></div>
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-secondary-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white overflow-hidden shadow-sm rounded-lg border border-secondary-200 transition-all duration-200 ${
        isClickable ? 'hover:shadow-md hover:border-primary-300 cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-2 rounded-lg bg-secondary-50`}>
              <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600 truncate">
                  {title}
                </p>
                <p className="text-2xl font-bold text-secondary-900">
                  {value}
                </p>
                {description && (
                  <p className="text-xs text-secondary-500 mt-1">
                    {description}
                  </p>
                )}
              </div>
              {change && (
                <div className={`flex items-center ${getChangeColor()}`}>
                  {getChangeIcon()}
                  <span className="text-sm font-medium ml-1">
                    {change}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {change && (
        <div className="bg-secondary-50 px-6 py-3 border-t border-secondary-100">
          <div className="text-sm">
            <span className={`font-medium ${getChangeColor()}`}>
              {change}
            </span>
            <span className="text-secondary-500"> from last month</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
