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
      primary: 'bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-200',
      secondary: 'bg-secondary-50 hover:bg-secondary-100 text-secondary-700 border-secondary-200',
      success: 'bg-success-50 hover:bg-success-100 text-success-700 border-success-200',
      warning: 'bg-warning-50 hover:bg-warning-100 text-warning-700 border-warning-200',
      error: 'bg-error-50 hover:bg-error-100 text-error-700 border-error-200',
    };
    return colorMap[color];
  };

  const getIconColorClasses = (color: QuickAction['color'] = 'primary') => {
    const colorMap = {
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
    };
    return colorMap[color];
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          {title}
        </h3>
        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                action.disabled
                  ? 'bg-secondary-50 text-secondary-400 border-secondary-200 cursor-not-allowed'
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
                    action.disabled ? 'text-secondary-400' : ''
                  }`}>
                    {action.title}
                  </p>
                  <p className={`text-xs mt-1 ${
                    action.disabled ? 'text-secondary-300' : 'opacity-75'
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
