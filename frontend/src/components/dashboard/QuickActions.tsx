import React from 'react';
import {
  UserPlusIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  onClick: () => void;
  roles?: string[];
}

const QuickActions: React.FC = () => {
  const { hasAnyRole } = useAuthStore();

  const actions: QuickAction[] = [
    {
      id: 'add-student',
      title: 'Add Student',
      description: 'Register a new student',
      icon: UserPlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Add student'),
      roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher'],
    },
    {
      id: 'create-fee',
      title: 'Create Fee',
      description: 'Set up new fee structure',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => console.log('Create fee'),
      roles: ['Admin', 'ICT_administrator', 'Principal', 'Headteacher', 'Bursar'],
    },
    {
      id: 'view-payments',
      title: 'View Payments',
      description: 'Check payment history',
      icon: DocumentTextIcon,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('View payments'),
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create financial reports',
      icon: ChartBarIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => console.log('Generate report'),
      roles: ['Admin', 'ICT_administrator', 'Auditor', 'Principal', 'Headteacher', 'Bursar'],
    },
    {
      id: 'audit-logs',
      title: 'Audit Logs',
      description: 'View system audit trail',
      icon: ClipboardDocumentListIcon,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => console.log('Audit logs'),
      roles: ['Admin', 'ICT_administrator', 'Auditor'],
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure system settings',
      icon: Cog6ToothIcon,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => console.log('Settings'),
      roles: ['Admin', 'ICT_administrator'],
    },
  ];

  // Filter actions based on user roles
  const filteredActions = actions.filter(action => {
    if (!action.roles || action.roles.length === 0) return true;
    return hasAnyRole(action.roles);
  });

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {filteredActions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left"
            >
              <div className={`flex-shrink-0 p-2 rounded-md ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {action.title}
                </p>
                <p className="text-xs text-gray-500">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
