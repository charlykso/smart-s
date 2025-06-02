import React from 'react';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  UserPlusIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';

const AdminDashboard: React.FC = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: 'Total Schools',
      value: '12',
      change: '+2',
      changeType: 'increase' as const,
      icon: BuildingOfficeIcon,
      iconColor: 'text-blue-600',
      description: 'Active schools in system',
    },
    {
      title: 'Total Users',
      value: '2,847',
      change: '+156',
      changeType: 'increase' as const,
      icon: UsersIcon,
      iconColor: 'text-green-600',
      description: 'All system users',
    },
    {
      title: 'System Revenue',
      value: '₦45.2M',
      change: '+12%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      iconColor: 'text-yellow-600',
      description: 'Total platform revenue',
    },
    {
      title: 'System Health',
      value: '99.8%',
      change: '+0.2%',
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      iconColor: 'text-purple-600',
      description: 'Uptime this month',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'create-school',
      title: 'Add New School',
      description: 'Register a new school in the system',
      icon: BuildingOfficeIcon,
      onClick: () => console.log('Add school'),
      color: 'primary',
    },
    {
      id: 'create-user',
      title: 'Create User Account',
      description: 'Add new admin or staff user',
      icon: UserPlusIcon,
      onClick: () => console.log('Create user'),
      color: 'success',
    },
    {
      id: 'system-settings',
      title: 'System Configuration',
      description: 'Manage global system settings',
      icon: CogIcon,
      onClick: () => console.log('System settings'),
      color: 'secondary',
    },
    {
      id: 'audit-reports',
      title: 'Generate Audit Report',
      description: 'Create comprehensive system audit',
      icon: DocumentTextIcon,
      onClick: () => console.log('Audit report'),
      color: 'warning',
    },
    {
      id: 'security-review',
      title: 'Security Review',
      description: 'Review security logs and alerts',
      icon: ShieldCheckIcon,
      onClick: () => console.log('Security review'),
      color: 'error',
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'New School Registered',
      description: 'Greenfield Academy was added to the system',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: 'system',
      user: 'System Admin',
    },
    {
      id: '2',
      title: 'User Account Created',
      description: 'Principal account created for John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: 'user',
      user: 'Admin User',
    },
    {
      id: '3',
      title: 'System Backup Completed',
      description: 'Daily backup completed successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      type: 'system',
      user: 'System',
    },
    {
      id: '4',
      title: 'Security Alert Resolved',
      description: 'Failed login attempts from IP blocked',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      type: 'audit',
      user: 'Security System',
    },
    {
      id: '5',
      title: 'Payment Gateway Updated',
      description: 'Paystack integration updated to v2.1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'system',
      user: 'ICT Admin',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

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
            title="Administrative Actions"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent System Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
