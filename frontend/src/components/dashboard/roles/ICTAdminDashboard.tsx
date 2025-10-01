import React, { useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';
import { useICTAdminStore } from '../../../store/ictAdminStore';
import { ictAdminService } from '../../../services/ictAdminService';

const ICTAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboardData,
  } = useICTAdminStore();

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Generate stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Server Uptime',
      value: ictAdminService.formatUptime(dashboardData.systemMetrics.serverUptime),
      description: dashboardData.systemHealth.status === 'healthy' ? 'Excellent system availability' : 'Needs attention',
      icon: ServerIcon,
      iconColor: ictAdminService.getSystemHealthColor(dashboardData.systemHealth.status),
    },
    {
      title: 'Active Users',
      value: dashboardData.userMetrics.activeUsers.toLocaleString(),
      change: `${dashboardData.userMetrics.onlineUsers} online`,
      changeType: 'positive' as const,
      icon: UserPlusIcon,
      iconColor: 'text-blue-600',
      description: 'Currently active',
    },
    {
      title: 'System Load',
      value: `${dashboardData.systemMetrics.cpuUsage}%`,
      change: dashboardData.systemMetrics.cpuUsage < 70 ? 'Normal' : 'High',
      changeType: dashboardData.systemMetrics.cpuUsage < 70 ? 'positive' as const : 'negative' as const,
      icon: CpuChipIcon,
      iconColor: ictAdminService.getMetricColor(dashboardData.systemMetrics.cpuUsage, { warning: 70, critical: 90 }),
      description: 'CPU utilization',
    },
    {
      title: 'Security Score',
      value: `${dashboardData.securityMetrics.securityScore}%`,
      change: dashboardData.securityMetrics.securityScore >= 85 ? 'Secure' : 'Review needed',
      changeType: dashboardData.securityMetrics.securityScore >= 85 ? 'positive' as const : 'negative' as const,
      icon: ShieldCheckIcon,
      iconColor: ictAdminService.getMetricColor(dashboardData.securityMetrics.securityScore, { warning: 75, critical: 60 }),
      description: 'Security metrics',
    },
  ] : [];

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

  // Generate recent activities from dashboard data
  const recentActivities: Activity[] = dashboardData ?
    dashboardData.recentActivities.slice(0, 5).map((activity) => ({
      id: activity._id,
      title: activity.action,
      description: activity.details,
      timestamp: new Date(activity.timestamp),
      type: activity.type as 'system' | 'user' | 'security' | 'backup' | 'maintenance',
      user: activity.user || 'System',
    })) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Loading State */}
      {dashboardLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-secondary-600">Loading system dashboard...</span>
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

      {/* System Health Alert */}
      {dashboardData && (
        <div className={`border rounded-lg p-4 ${
          dashboardData.systemHealth.status === 'healthy'
            ? 'bg-green-50 border-green-200'
            : dashboardData.systemHealth.status === 'warning'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            <ExclamationTriangleIcon className={`h-5 w-5 mr-2 ${
              dashboardData.systemHealth.status === 'healthy'
                ? 'text-green-600'
                : dashboardData.systemHealth.status === 'warning'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`} />
            <div>
              <h4 className={`text-sm font-medium ${
                dashboardData.systemHealth.status === 'healthy'
                  ? 'text-green-800'
                  : dashboardData.systemHealth.status === 'warning'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}>
                System Status: {dashboardData.systemHealth.status === 'healthy' ? 'All Systems Operational' :
                                dashboardData.systemHealth.status === 'warning' ? 'Minor Issues Detected' : 'Critical Issues'}
              </h4>
              <p className={`text-sm mt-1 ${
                dashboardData.systemHealth.status === 'healthy'
                  ? 'text-green-700'
                  : dashboardData.systemHealth.status === 'warning'
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}>
                Database: {dashboardData.systemHealth.databaseStatus} |
                API Response: {dashboardData.systemHealth.apiResponseTime}ms |
                Last Backup: {dashboardData.systemHealth.backupStatus}
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
            title="Technical Operations"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        {/* <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent Technical Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div> */}
      </div>
    </div>
  );
};

export default ICTAdminDashboard;
