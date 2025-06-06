import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { WelcomeCard } from './widgets';

const DefaultDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Role Not Configured Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 transition-colors duration-200">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-4" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              Dashboard Not Configured
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Your role-specific dashboard is not yet configured. Please contact your system administrator
              for assistance or check back later.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-gray-100 mb-4">
          Available Actions
        </h3>
        <div className="space-y-3">
          <button type="button" className="w-full p-3 text-left border border-secondary-200 dark:border-gray-600 rounded-lg hover:bg-secondary-50 dark:hover:bg-gray-700 transition-colors">
            <div className="font-medium text-secondary-900 dark:text-gray-100">View Profile</div>
            <div className="text-sm text-secondary-600 dark:text-gray-400">Manage your account information</div>
          </button>
          <button type="button" className="w-full p-3 text-left border border-secondary-200 dark:border-gray-600 rounded-lg hover:bg-secondary-50 dark:hover:bg-gray-700 transition-colors">
            <div className="font-medium text-secondary-900 dark:text-gray-100">Change Password</div>
            <div className="text-sm text-secondary-600 dark:text-gray-400">Update your account password</div>
          </button>
          <button type="button" className="w-full p-3 text-left border border-secondary-200 dark:border-gray-600 rounded-lg hover:bg-secondary-50 dark:hover:bg-gray-700 transition-colors">
            <div className="font-medium text-secondary-900 dark:text-gray-100">Contact Support</div>
            <div className="text-sm text-secondary-600 dark:text-gray-400">Get help from our support team</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefaultDashboard;
