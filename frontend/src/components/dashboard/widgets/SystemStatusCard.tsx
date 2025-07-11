import React from 'react';

export interface SystemStatusCardProps {
  title: string;
  status: 'online' | 'offline' | 'maintenance';
  uptime?: string;
  lastCheck?: Date;
  className?: string;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  title,
  status,
  uptime,
  lastCheck,
  className = '',
}) => {
  const getStatusColor = () => {
    const colorMap = {
      online: 'text-green-600 bg-green-100',
      offline: 'text-red-600 bg-red-100',
      maintenance: 'text-yellow-600 bg-yellow-100',
    };
    return colorMap[status];
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200 ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-600">Status</span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
        {uptime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-600">Uptime</span>
            <span className="text-sm font-medium text-secondary-900">{uptime}</span>
          </div>
        )}
        {lastCheck && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-600">Last Check</span>
            <span className="text-sm text-secondary-500">{lastCheck.toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemStatusCard;
