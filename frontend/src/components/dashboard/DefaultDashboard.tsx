import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { WelcomeCard } from './widgets';

const DefaultDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Role Not Configured Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-4" />
          <div>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              Dashboard Not Configured
            </h3>
            <p className="text-yellow-700">
              Your role-specific dashboard is not yet configured. Please contact your system administrator
              for assistance or check back later.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          Available Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full p-3 text-left border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <div className="font-medium text-secondary-900">View Profile</div>
            <div className="text-sm text-secondary-600">Manage your account information</div>
          </button>
          <button className="w-full p-3 text-left border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <div className="font-medium text-secondary-900">Change Password</div>
            <div className="text-sm text-secondary-600">Update your account password</div>
          </button>
          <button className="w-full p-3 text-left border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors">
            <div className="font-medium text-secondary-900">Contact Support</div>
            <div className="text-sm text-secondary-600">Get help from our support team</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefaultDashboard;
