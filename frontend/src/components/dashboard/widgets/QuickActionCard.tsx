import React from 'react';

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  disabled?: boolean;
}

export interface QuickActionCardProps {
  title: string;
  actions: QuickAction[];
  className?: string;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  actions,
  className = '',
}) => {
  const getActionColorClasses = (color: QuickAction['color'] = 'primary') => {
    const colorMap = {
      primary: 'bg-primary-50 dark:bg-primary-900 hover:bg-primary-100 dark:hover:bg-primary-800 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-700',
      secondary: 'bg-secondary-50 dark:bg-gray-700 hover:bg-secondary-100 dark:hover:bg-gray-600 text-secondary-700 dark:text-gray-300 border-secondary-200 dark:border-gray-600',
      success: 'bg-success-50 dark:bg-success-900 hover:bg-success-100 dark:hover:bg-success-800 text-success-700 dark:text-success-300 border-success-200 dark:border-success-700',
      warning: 'bg-warning-50 dark:bg-warning-900 hover:bg-warning-100 dark:hover:bg-warning-800 text-warning-700 dark:text-warning-300 border-warning-200 dark:border-warning-700',
      error: 'bg-error-50 dark:bg-error-900 hover:bg-error-100 dark:hover:bg-error-800 text-error-700 dark:text-error-300 border-error-200 dark:border-error-700',
    };
    return colorMap[color];
  };

  const getIconColorClasses = (color: QuickAction['color'] = 'primary') => {
    const colorMap = {
      primary: 'text-primary-600 dark:text-primary-400',
      secondary: 'text-secondary-600 dark:text-gray-400',
      success: 'text-success-600 dark:text-success-400',
      warning: 'text-warning-600 dark:text-warning-400',
      error: 'text-error-600 dark:text-error-400',
    };
    return colorMap[color];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 transition-colors duration-200 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-gray-100 mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled}
              className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                action.disabled
                  ? 'bg-secondary-50 dark:bg-gray-700 text-secondary-400 dark:text-gray-500 border-secondary-200 dark:border-gray-600 cursor-not-allowed'
                  : `${getActionColorClasses(action.color)} hover:shadow-sm`
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <action.icon
                    className={`h-6 w-6 ${
                      action.disabled
                        ? 'text-secondary-400'
                        : getIconColorClasses(action.color)
                    }`}
                  />
                </div>
                <div className="ml-4 flex-1">
                  <p className={`text-sm font-medium ${
                    action.disabled ? 'text-secondary-400 dark:text-gray-500' : ''
                  }`}>
                    {action.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    action.disabled ? 'text-secondary-300 dark:text-gray-600' : 'opacity-75'
                  }`}>
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionCard;
