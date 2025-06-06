import React, { useEffect } from 'react';
import {
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CogIcon,
  UserPlusIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
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
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { adminService } from '../../../services/adminService';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboardData,
    systemActivities,
    systemActivitiesLoading,
    systemActivitiesError,
    fetchSystemActivities,
  } = useAdminStore();
  const { user, token, isAuthenticated } = useAuthStore();

  // Fetch dashboard data on component mount
  useEffect(() => {
    if (isAuthenticated && user && token) {
      fetchDashboardData();
      fetchSystemActivities(5); // Fetch 5 recent activities
    }
  }, [fetchDashboardData, fetchSystemActivities, isAuthenticated, user, token]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return adminService.formatCurrency(amount);
  };

  // Generate stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Total Schools',
      value: dashboardData.statistics.totalSchools.toLocaleString(),
      description: 'Active schools in system',
      icon: BuildingOfficeIcon,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Users',
      value: dashboardData.statistics.totalUsers.toLocaleString(),
      description: 'All system users',
      icon: UsersIcon,
      iconColor: 'text-green-600',
    },
    {
      title: 'System Revenue',
      value: formatCurrency(dashboardData.statistics.totalRevenue),
      description: 'Total platform revenue',
      icon: CurrencyDollarIcon,
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Pending Payments',
      value: dashboardData.statistics.pendingPayments.toLocaleString(),
      description: dashboardData.statistics.pendingPayments > 0 ? 'Payment status' : 'All clear from last month',
      icon: ChartBarIcon,
      iconColor: dashboardData.statistics.pendingPayments > 0 ? 'text-red-600' : 'text-green-600',
    },
  ] : [];

  const quickActions: QuickAction[] = [
    {
      id: 'create-school',
      title: 'Add New School',
      description: 'Register a new school in the system',
      icon: BuildingOfficeIcon,
      onClick: () => navigate('/schools'),
      color: 'primary',
    },
    {
      id: 'create-user',
      title: 'Create User Account',
      description: 'Add new admin or staff user',
      icon: UserPlusIcon,
      onClick: () => navigate('/users'),
      color: 'success',
    },
    {
      id: 'system-settings',
      title: 'System Configuration',
      description: 'Manage global system settings',
      icon: CogIcon,
      onClick: () => navigate('/settings'),
      color: 'secondary',
    },
    {
      id: 'audit-reports',
      title: 'Generate Audit Report',
      description: 'Create comprehensive system audit',
      icon: DocumentTextIcon,
      onClick: () => navigate('/reports'),
      color: 'warning',
    },
    {
      id: 'security-review',
      title: 'Security Review',
      description: 'Review security logs and alerts',
      icon: ShieldCheckIcon,
      onClick: () => navigate('/audit'),
      color: 'error',
    },
  ];

  // Transform system activities to match the Activity interface
  const recentActivities: Activity[] = systemActivities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    timestamp: new Date(activity.timestamp),
    type: activity.type as Activity['type'],
    user: activity.user,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Loading State */}
      {(dashboardLoading || systemActivitiesLoading) && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <span className="ml-3 text-secondary-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      )}

      {/* Error State */}
      {(dashboardError || systemActivitiesError) && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 transition-colors duration-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Error Loading Dashboard
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {dashboardError || systemActivitiesError}. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System Alert */}
      {dashboardData && dashboardData.statistics.pendingPayments > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 transition-colors duration-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                System Alert
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                There are {dashboardData.statistics.pendingPayments} pending payments requiring attention across the system.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      {!dashboardLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
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
      )}

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
            onViewAll={() => navigate('/audit')}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
