import React from 'react';
import {
  ServerIcon,
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';

const ICTAdminDashboard: React.FC = () => {
  // Mock data for ICT Admin metrics
  const stats = [
    {
      title: 'Server Uptime',
      value: '99.9%',
      change: '+0.1%',
      changeType: 'increase' as const,
      icon: ServerIcon,
      iconColor: 'text-green-600',
      description: 'Last 30 days',
    },
    {
      title: 'Active Users',
      value: '1,847',
      change: '+23',
      changeType: 'increase' as const,
      icon: UserPlusIcon,
      iconColor: 'text-blue-600',
      description: 'Currently online',
    },
    {
      title: 'System Load',
      value: '45%',
      change: '-5%',
      changeType: 'decrease' as const,
      icon: CpuChipIcon,
      iconColor: 'text-yellow-600',
      description: 'CPU utilization',
    },
    {
      title: 'Security Score',
      value: '98/100',
      change: '+2',
      changeType: 'increase' as const,
      icon: ShieldCheckIcon,
      iconColor: 'text-purple-600',
      description: 'Security rating',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'create-user',
      title: 'Create User Account',
      description: 'Add new user to the system',
      icon: UserPlusIcon,
      onClick: () => console.log('Create user'),
      color: 'primary',
    },
    {
      id: 'system-maintenance',
      title: 'System Maintenance',
      description: 'Run system diagnostics and cleanup',
      icon: WrenchScrewdriverIcon,
      onClick: () => console.log('System maintenance'),
      color: 'warning',
    },
    {
      id: 'backup-system',
      title: 'Backup Database',
      description: 'Create manual system backup',
      icon: CloudIcon,
      onClick: () => console.log('Backup system'),
      color: 'success',
    },
    {
      id: 'security-scan',
      title: 'Security Scan',
      description: 'Run comprehensive security check',
      icon: ShieldCheckIcon,
      onClick: () => console.log('Security scan'),
      color: 'error',
    },
    {
      id: 'system-logs',
      title: 'View System Logs',
      description: 'Check system and error logs',
      icon: DocumentTextIcon,
      onClick: () => console.log('System logs'),
      color: 'secondary',
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'Database Backup Completed',
      description: 'Automated daily backup finished successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      type: 'system',
      user: 'System',
    },
    {
      id: '2',
      title: 'User Account Created',
      description: 'New teacher account for Mary Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      type: 'user',
      user: 'ICT Admin',
    },
    {
      id: '3',
      title: 'Security Update Applied',
      description: 'System security patches installed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      type: 'system',
      user: 'ICT Admin',
    },
    {
      id: '4',
      title: 'Performance Alert',
      description: 'High CPU usage detected and resolved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      type: 'system',
      user: 'Monitoring System',
    },
    {
      id: '5',
      title: 'User Password Reset',
      description: 'Password reset for principal@school.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'user',
      user: 'ICT Admin',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* System Health Alert (if any issues) */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              System Maintenance Scheduled
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              Routine maintenance scheduled for tonight at 2:00 AM. Expected downtime: 30 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            iconColor={stat.iconColor}
            description={stat.description}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActionCard
            title="Technical Operations"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent Technical Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>
    </div>
  );
};

export default ICTAdminDashboard;
