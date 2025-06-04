import React from 'react';
import { useAuthStore } from '../../../store/authStore';

export interface WelcomeCardProps {
  customMessage?: string;
  showDate?: boolean;
  showRole?: boolean;
  className?: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({
  customMessage,
  showDate = true,
  showRole = true,
  className = '',
}) => {
  const { user } = useAuthStore();

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: Record<string, string> = {
      'Admin': 'Administrator',
      'ICT_administrator': 'ICT Administrator',
      'Proprietor': 'Proprietor',
      'Principal': 'Principal',
      'Headteacher': 'Head Teacher',
      'Bursar': 'Bursar',
      'Auditor': 'Auditor',
      'Student': 'Student',
      'Parent': 'Parent',
    };
    return roleMap[role] || role;
  };

  const getWelcomeMessage = () => {
    if (customMessage) return customMessage;
    
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    
    if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    } else if (hour >= 17) {
      greeting = 'Good evening';
    }
    
    return `${greeting}, ${user?.firstname || 'User'}!`;
  };

  const getSubMessage = () => {
    const role = user?.roles?.[0];
    switch (role) {
      case 'Admin':
        return "Here's your system overview and administrative tools.";
      case 'ICT_administrator':
        return "Monitor system health and manage technical operations.";
      case 'Proprietor':
        return "Review your schools' performance and strategic insights.";
      case 'Principal':
        return "Manage your school operations and approve activities.";
      case 'Headteacher':
        return "Oversee academic activities and student progress.";
      case 'Bursar':
        return "Track financial operations and payment processing.";
      case 'Auditor':
        return "Review audit trails and ensure compliance.";
      case 'Student':
        return "Check your academic progress and payment status.";
      case 'Parent':
        return "Monitor your child's progress and manage payments.";
      default:
        return "Welcome to your dashboard.";
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-gray-100 mb-1">
            {getWelcomeMessage()}
          </h1>
          <p className="text-secondary-600 dark:text-gray-400 mb-2">
            {getSubMessage()}
          </p>
          {showRole && user?.roles && (
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                >
                  {getRoleDisplayName(role)}
                </span>
              ))}
            </div>
          )}
        </div>
        {showDate && (
          <div className="text-right">
            <p className="text-sm text-secondary-500 dark:text-gray-400 font-medium">
              {getCurrentDate()}
            </p>
            <p className="text-xs text-secondary-400 dark:text-gray-500 mt-1">
              {getCurrentTime()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeCard;
