import React, { useEffect, useState } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  DocumentTextIcon,
  HomeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';

interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  format: 'currency' | 'number' | 'percentage';
}

const FinancialOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { financialOverview, financialOverviewLoading, financialOverviewError, fetchFinancialOverview } = useAdminStore();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFinancialOverview(selectedPeriod);
  }, [fetchFinancialOverview, selectedPeriod]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFinancialOverview(selectedPeriod);
    setRefreshing(false);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Mock financial metrics (replace with actual data from backend)
  const financialMetrics: FinancialMetric[] = [
    {
      id: 'total-revenue',
      name: 'Total Revenue',
      value: financialOverview?.totalRevenue || 125000,
      change: 12.5,
      changeType: 'increase',
      icon: CurrencyDollarIcon,
      format: 'currency',
    },
    {
      id: 'pending-payments',
      name: 'Pending Payments',
      value: financialOverview?.pendingPayments || 15000,
      change: -5.2,
      changeType: 'decrease',
      icon: ChartBarIcon,
      format: 'currency',
    },
    {
      id: 'completed-transactions',
      name: 'Completed Transactions',
      value: financialOverview?.completedTransactions || 1250,
      change: 8.3,
      changeType: 'increase',
      icon: DocumentTextIcon,
      format: 'number',
    },
    {
      id: 'collection-rate',
      name: 'Collection Rate',
      value: financialOverview?.collectionRate || 89.2,
      change: 2.1,
      changeType: 'increase',
      icon: ArrowTrendingUpIcon,
      format: 'percentage',
    },
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
        return new Intl.NumberFormat().format(value);
      default:
        return value.toString();
    }
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  if (financialOverviewLoading && !financialOverview) {
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
                  Financial Overview
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Overview</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitor revenue, payments, and financial performance across all schools
              </p>
            </div>
            <div className="flex space-x-3">
              {/* Period Selector */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => handlePeriodChange(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
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
        </div>

        {/* Error State */}
        {financialOverviewError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading financial overview</h3>
                <p className="mt-1 text-sm text-red-700">{financialOverviewError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {financialMetrics.map((metric) => {
            const IconComponent = metric.icon;
            const ChangeIcon = metric.changeType === 'increase' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
            const changeColor = metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600';
            
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
                            {formatValue(metric.value, metric.format)}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center">
                    <ChangeIcon className={`h-4 w-4 ${changeColor}`} />
                    <span className={`text-sm font-medium ${changeColor} ml-1`}>
                      {formatChange(metric.change)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                      vs last {selectedPeriod}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts and Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Revenue Trend
              </h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">Chart will be implemented here</p>
              </div>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                Payment Status Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  <span className="text-sm font-medium text-green-600">₦89,500</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="text-sm font-medium text-yellow-600">₦15,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Failed</span>
                  <span className="text-sm font-medium text-red-600">₦2,500</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FinancialOverviewPage;
