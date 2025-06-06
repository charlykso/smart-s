import React from 'react';
import {
  BuildingOfficeIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useSchoolStore } from '../../store/schoolStore';

const SchoolStats: React.FC = () => {
  const { schools, sessions, terms, classArms } = useSchoolStore();

  const stats = [
    {
      name: 'Total Schools',
      value: schools.length,
      icon: BuildingOfficeIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
    },
    {
      name: 'Active Sessions',
      value: sessions.length,
      icon: CalendarDaysIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900',
    },
    {
      name: 'Academic Terms',
      value: terms.length,
      icon: AcademicCapIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
    },
    {
      name: 'Class Arms',
      value: classArms.length,
      icon: UsersIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900 rounded-lg border dark:border-gray-700 p-6 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">School Management Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="relative">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor} transition-colors duration-200`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="font-medium">Active Schools:</span>{' '}
            {schools.filter(school => school.isActive).length} of {schools.length}
          </div>
          <div>
            <span className="font-medium">Current Session:</span>{' '}
            {sessions.length > 0 ? 'Available' : 'None'}
          </div>
          <div>
            <span className="font-medium">Current Term:</span>{' '}
            {terms.length > 0 ? 'Available' : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolStats;
