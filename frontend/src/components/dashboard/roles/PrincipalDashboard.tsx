import React from 'react';
import {
  UsersIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';

const PrincipalDashboard: React.FC = () => {
  // Mock data for principal metrics
  const stats = [
    {
      title: 'Total Students',
      value: '1,234',
      change: '+45',
      changeType: 'increase' as const,
      icon: UsersIcon,
      iconColor: 'text-blue-600',
      description: 'Enrolled this term',
    },
    {
      title: 'Fee Collection',
      value: '87%',
      change: '+5%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      iconColor: 'text-green-600',
      description: 'Collection rate',
    },
    {
      title: 'Academic Performance',
      value: '82%',
      change: '+3%',
      changeType: 'increase' as const,
      icon: AcademicCapIcon,
      iconColor: 'text-purple-600',
      description: 'Average grade',
    },
    {
      title: 'Pending Approvals',
      value: '12',
      change: '-3',
      changeType: 'decrease' as const,
      icon: DocumentCheckIcon,
      iconColor: 'text-orange-600',
      description: 'Awaiting approval',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'approve-fees',
      title: 'Approve Fees',
      description: 'Review and approve pending fee structures',
      icon: DocumentCheckIcon,
      onClick: () => console.log('Approve fees'),
      color: 'primary',
    },
    {
      id: 'view-reports',
      title: 'School Reports',
      description: 'View comprehensive school reports',
      icon: ChartBarIcon,
      onClick: () => console.log('View reports'),
      color: 'success',
    },
    {
      id: 'manage-staff',
      title: 'Manage Staff',
      description: 'Staff assignments and management',
      icon: UserGroupIcon,
      onClick: () => console.log('Manage staff'),
      color: 'secondary',
    },
    {
      id: 'financial-overview',
      title: 'Financial Overview',
      description: 'Review school financial status',
      icon: BanknotesIcon,
      onClick: () => console.log('Financial overview'),
      color: 'warning',
    },
    {
      id: 'academic-review',
      title: 'Academic Review',
      description: 'Monitor academic performance',
      icon: ClipboardDocumentCheckIcon,
      onClick: () => console.log('Academic review'),
      color: 'error',
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'Fee Structure Approved',
      description: 'Term 2 fee structure approved for all classes',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: 'fee',
      user: 'Principal',
    },
    {
      id: '2',
      title: 'New Teacher Assigned',
      description: 'Mathematics teacher assigned to Class 5A',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: 'user',
      user: 'Principal',
    },
    {
      id: '3',
      title: 'Academic Report Generated',
      description: 'Monthly academic performance report completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      type: 'academic',
      user: 'Academic Office',
    },
    {
      id: '4',
      title: 'Payment Milestone Reached',
      description: '85% fee collection target achieved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      type: 'payment',
      user: 'Bursar Office',
    },
    {
      id: '5',
      title: 'Parent Meeting Scheduled',
      description: 'PTA meeting scheduled for next Friday',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'academic',
      user: 'Principal',
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
            title="Principal Actions"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent School Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
