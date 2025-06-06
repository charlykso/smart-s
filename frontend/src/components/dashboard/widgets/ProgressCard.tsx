import React from 'react';

export interface ProgressCardProps {
  title: string;
  progress: number;
  total: number;
  description?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  progress,
  total,
  description,
  color = 'primary',
  className = '',
}) => {
  const percentage = Math.round((progress / total) * 100);
  
  const getColorClasses = () => {
    const colorMap = {
      primary: 'bg-primary-600',
      success: 'bg-success-600',
      warning: 'bg-warning-600',
      error: 'bg-error-600',
    };
    return colorMap[color];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-secondary-900">
          {title}
        </h3>
        <span className="text-sm font-medium text-secondary-600">
          {progress}/{total}
        </span>
      </div>
      
      <div className="w-full bg-secondary-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColorClasses()}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-secondary-600">
          {percentage}% Complete
        </span>
        {description && (
          <span className="text-xs text-secondary-500">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressCard;
