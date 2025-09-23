import React from 'react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  trend?: {
    value: number;
    period: string;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  description,
  icon: Icon,
  iconColor = 'text-primary-600',
  trend,
  className,
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-success-600 bg-success-50 border-success-200';
      case 'decrease':
        return 'text-error-600 bg-error-50 border-error-200';
      default:
        return 'text-secondary-600 bg-secondary-50 border-secondary-200';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'decrease':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {value}
            </p>
            {description && (
              <p className="text-xs text-secondary-500 dark:text-secondary-500 mt-1">
                {description}
              </p>
            )}
          </div>
          {Icon && (
            <div className={cn('p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800', iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
        
        {(change || trend) && (
          <div className="mt-4 flex items-center justify-between">
            {change && (
              <Badge 
                variant="outline" 
                className={cn('text-xs', getChangeColor())}
                icon={getChangeIcon()}
              >
                {change}
              </Badge>
            )}
            {trend && (
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                {trend.value > 0 ? '+' : ''}{trend.value}% {trend.period}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
