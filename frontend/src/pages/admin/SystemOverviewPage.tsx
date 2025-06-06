import React, { useEffect, useState } from 'react';
import {
  ServerIcon,
  CpuChipIcon,
  CloudIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  HomeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';

interface SystemMetric {
  id: string;
  name: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  description: string;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

const SystemOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { systemOverview, systemOverviewLoading, systemOverviewError, fetchSystemOverview } = useAdminStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemOverview();
  }, [fetchSystemOverview]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemOverview();
    setRefreshing(false);
  };

  // Mock data for system metrics (replace with actual data from backend)
  const systemMetrics: SystemMetric[] = [
    {
      id: 'server-status',
      name: 'Server Status',
      value: 'Online',
      status: 'healthy',
      icon: ServerIcon,
      description: 'Main application server is running normally',
    },
    {
      id: 'database-status',
      name: 'Database Status',
      value: 'Connected',
      status: 'healthy',
      icon: CpuChipIcon,
      description: 'Database connection is stable',
    },
    {
      id: 'storage-usage',
      name: 'Storage Usage',
      value: '45%',
      status: 'healthy',
      icon: CloudIcon,
      description: 'Storage utilization is within normal limits',
    },
    {
      id: 'active-users',
      name: 'Active Users',
      value: systemOverview?.activeUsers || 0,
      status: 'healthy',
      icon: ChartBarIcon,
      description: 'Currently logged in users',
    },
  ];

  // Mock system alerts (replace with actual data from backend)
  const systemAlerts: SystemAlert[] = [
    {
      id: '1',
      type: 'info',
      message: 'System backup completed successfully',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'warning',
      message: 'High memory usage detected on server',
      timestamp: '4 hours ago',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return CheckCircleIcon;
      case 'warning':
        return ExclamationTriangleIcon;
      case 'critical':
        return ExclamationTriangleIcon;
      default:
        return ClockIcon;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  if (systemOverviewLoading && !systemOverview) {
    return (
      <MainLayout>
        <CenteredLoader />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  System Overview
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Overview</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitor system health, performance metrics, and alerts
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error State */}
        {systemOverviewError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading system overview</h3>
                <p className="mt-1 text-sm text-red-700">{systemOverviewError}</p>
              </div>
            </div>
          </div>
        )}

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric) => {
            const StatusIcon = getStatusIcon(metric.status);
            const IconComponent = metric.icon;
            
            return (
              <div
                key={metric.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {metric.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {metric.value}
                          </div>
                          <div className="ml-2 flex items-baseline text-sm">
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(metric.status)}`} />
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* System Alerts */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              Recent System Alerts
            </h3>
            <div className="space-y-3">
              {systemAlerts.length > 0 ? (
                systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-md p-3 ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <span className="text-xs opacity-75">{alert.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No recent alerts
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SystemOverviewPage;
