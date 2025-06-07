import React, { useEffect } from 'react';
import {
  UsersIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';
import { usePrincipalStore } from '../../../store/principalStore';
import { principalService } from '../../../services/principalService';

const PrincipalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboardData,
  } = usePrincipalStore();

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return principalService.formatCurrency(amount);
  };

  // Generate stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Total Students',
      value: dashboardData.statistics.totalStudents.toLocaleString(),
      description: 'Currently enrolled students',
      icon: UsersIcon,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Fee Collection',
      value: `${Math.round(dashboardData.financial.collectionRate)}%`,
      description: dashboardData.financial.collectionRate >= 80 ? 'Good collection rate' : 'Needs improvement',
      icon: CurrencyDollarIcon,
      iconColor: principalService.getCollectionRateColor(dashboardData.financial.collectionRate),
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardData.financial.totalRevenue),
      change: 'All time',
      changeType: 'positive' as const,
      icon: BanknotesIcon,
      iconColor: 'text-green-600',
      description: 'School revenue',
    },
    {
      title: 'Staff Members',
      value: (dashboardData.statistics.totalTeachers + dashboardData.statistics.totalStaff).toString(),
      change: `${dashboardData.statistics.totalTeachers} teachers`,
      changeType: 'neutral' as const,
      icon: UserGroupIcon,
      iconColor: 'text-purple-600',
      description: 'Total staff',
    },
  ] : [];

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

  // Generate recent activities from dashboard data
  const recentActivities: Activity[] = dashboardData ?
    dashboardData.recentActivities.slice(0, 5).map((activity) => ({
      id: activity._id,
      title: activity.type === 'payment' ? 'Payment Activity' :
             activity.type === 'academic' ? 'Academic Update' :
             activity.type === 'fee' ? 'Fee Management' :
             activity.type === 'user' ? 'Staff Update' : 'School Activity',
      description: activity.description,
      timestamp: new Date(activity.date),
      type: activity.type as 'payment' | 'academic' | 'fee' | 'user' | 'system',
      user: activity.user,
    })) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Loading State */}
      {dashboardLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-secondary-600">Loading dashboard...</span>
        </div>
      )}

      {/* Error State */}
      {dashboardError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Error Loading Dashboard
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {dashboardError}. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outstanding Fees Alert */}
      {dashboardData && dashboardData.financial.outstandingFees > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Outstanding Fees Alert
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                There are {formatCurrency(dashboardData.financial.outstandingFees)} in outstanding fees. Collection rate is {Math.round(dashboardData.financial.collectionRate)}%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      {!dashboardLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              description={stat.description}
            />
          ))}
        </div>
      )}

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
