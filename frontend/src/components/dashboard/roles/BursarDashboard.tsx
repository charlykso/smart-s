import React, { useEffect } from 'react';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
  PaymentSummaryCard,
  FinancialChart,
} from '../widgets';

import type { QuickAction } from '../widgets/QuickActionCard';
import type { Activity } from '../widgets/RecentActivityCard';

// Interface for payment method from API response
interface PaymentMethodResponse {
  method?: string;
  _id?: string;
  totalAmount?: number;
  total?: number;
  percentage?: number;
  count?: number;
}
import { useBursarStore } from '../../../store/bursarStore';
import { bursarService } from '../../../services/bursarService';

const BursarDashboard: React.FC = () => {
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboardData,
  } = useBursarStore();

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return bursarService.formatCurrency(amount);
  };

  // Calculate collection rate from fee collection status
  const calculateOverallCollectionRate = () => {
    if (!dashboardData?.feeCollectionStatus.length) return 0;

    const totalExpected = dashboardData.feeCollectionStatus.reduce(
      (sum, fee) => sum + fee.expectedTotal, 0
    );
    const totalCollected = dashboardData.feeCollectionStatus.reduce(
      (sum, fee) => sum + fee.collectedTotal, 0
    );

    return totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;
  };

  // Generate stats from dashboard data
  const stats = dashboardData && dashboardData.financialStats ? [
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboardData.financialStats?.totalRevenue || 0),
      change: `${dashboardData.financialStats?.totalTransactions || 0} transactions`,
      changeType: 'neutral' as const,
      icon: CurrencyDollarIcon,
      iconColor: 'text-green-600',
      description: 'All time',
    },
    {
      title: 'Collection Rate',
      value: `${calculateOverallCollectionRate()}%`,
      change: 'Overall rate',
      changeType: calculateOverallCollectionRate() >= 80 ? 'increase' as const : 'decrease' as const,
      icon: ChartBarIcon,
      iconColor: calculateOverallCollectionRate() >= 80 ? 'text-blue-600' : 'text-yellow-600',
      description: 'Fee collection',
    },
    {
      title: 'Outstanding Fees',
      value: formatCurrency(dashboardData.financialStats?.outstandingAmount || 0),
      change: `${dashboardData.financialStats?.pendingPayments || 0} pending`,
      changeType: 'neutral' as const,
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-600',
      description: 'Pending payments',
    },
    {
      title: 'Today\'s Revenue',
      value: formatCurrency(dashboardData.financialStats?.todayRevenue || 0),
      change: 'Today',
      changeType: 'increase' as const,
      icon: BanknotesIcon,
      iconColor: 'text-purple-600',
      description: 'Processed today',
    },
  ] : [];

  const quickActions: QuickAction[] = [
    {
      id: 'process-payments',
      title: 'Process Payments',
      description: 'Review and process pending payments',
      icon: CreditCardIcon,
      onClick: () => console.log('Process payments'),
      color: 'primary',
    },
    {
      id: 'generate-receipts',
      title: 'Generate Receipts',
      description: 'Create payment receipts and invoices',
      icon: DocumentTextIcon,
      onClick: () => console.log('Generate receipts'),
      color: 'success',
    },
    {
      id: 'financial-reports',
      title: 'Financial Reports',
      description: 'Generate comprehensive financial reports',
      icon: ChartBarIcon,
      onClick: () => console.log('Financial reports'),
      color: 'warning',
    },
    {
      id: 'reconciliation',
      title: 'Bank Reconciliation',
      description: 'Reconcile bank statements',
      icon: BanknotesIcon,
      onClick: () => console.log('Bank reconciliation'),
      color: 'secondary',
    },
    {
      id: 'outstanding-fees',
      title: 'Outstanding Fees',
      description: 'Track and follow up on outstanding fees',
      icon: ClockIcon,
      onClick: () => console.log('Outstanding fees'),
      color: 'error',
    },
  ];

  // Generate recent activities from dashboard data
  const recentActivities: Activity[] = dashboardData && dashboardData.recentTransactions ?
    dashboardData.recentTransactions.slice(0, 5).map((transaction) => ({
      id: transaction._id || `transaction-${Date.now()}`,
      title: 'Payment Processed',
      description: `${transaction.fee?.name || 'Unknown Fee'} payment of ${formatCurrency(transaction.amount || 0)} from ${transaction.user?.firstname || 'Unknown'} ${transaction.user?.lastname || ''}${transaction.user?.regNo ? ` (${transaction.user.regNo})` : ''}`,
      timestamp: new Date(transaction.trans_date || Date.now()),
      type: 'payment' as const,
      user: transaction.mode_of_payment === 'cash' ? 'Bursar Office' : 'Payment Gateway',
    })) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Loading State */}
      {dashboardLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-secondary-600 dark:text-gray-400">Loading dashboard...</span>
        </div>
      )}

      {/* Error State */}
      {dashboardError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300">
                Error Loading Dashboard
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {dashboardError}. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Alert */}
      {dashboardData && dashboardData.financialStats && dashboardData.financialStats.pendingPayments > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Payment Processing Alert
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                {dashboardData.financialStats.pendingPayments} payments are pending verification. Please review and process them today.
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
              key={`bursar-stat-${index}`}
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

      {/* Payment Summary */}
      {dashboardData && dashboardData.financialStats && !dashboardLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PaymentSummaryCard
            title="Total Revenue"
            totalAmount={dashboardData.financialStats.totalRevenue || 0}
            paidAmount={(dashboardData.financialStats.totalRevenue || 0) - (dashboardData.financialStats.outstandingAmount || 0)}
            pendingAmount={dashboardData.financialStats.outstandingAmount || 0}
          />
          <PaymentSummaryCard
            title="This Month"
            totalAmount={(dashboardData.financialStats.thisMonthRevenue || 0) + (dashboardData.financialStats.outstandingAmount || 0)}
            paidAmount={dashboardData.financialStats.thisMonthRevenue || 0}
            pendingAmount={dashboardData.financialStats.outstandingAmount || 0}
          />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Payment Methods
            </h3>
            <div className="space-y-3">
              {dashboardData.paymentMethods && dashboardData.paymentMethods.length > 0 ? (
                dashboardData.paymentMethods.map((payment: PaymentMethodResponse, index) => {
                  // Handle different data structures safely
                  const method = payment.method ?? payment._id ?? 'Unknown';
                  const totalAmount = payment.totalAmount ?? payment.total ?? 0;
                  const percentage = payment.percentage ?? 0;
                  
                  return (
                    <div key={`payment-method-${index}`} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-secondary-900 dark:text-white capitalize">
                          {method && typeof method === 'string' ? method.replace('_', ' ') : method}
                        </div>
                        <div className="text-sm text-secondary-600 dark:text-gray-400">
                          {formatCurrency(totalAmount)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-secondary-900 dark:text-white">{percentage}%</div>
                        <div className="w-16 bg-secondary-200 dark:bg-gray-600 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary-600 dark:bg-primary-500 h-2 rounded-full"
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-secondary-600 dark:text-gray-400">No payment methods data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActionCard
            title="Financial Operations"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent Financial Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialChart
          title="Revenue Trend (Last 6 Months)"
          data={[]}
          type="line"
        />
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {dashboardData && dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.slice(0, 5).map((transaction) => {
                const timeAgo = new Date(transaction.trans_date || Date.now()).toLocaleDateString();
                const statusDisplay = transaction.status === 'success' ? 'Completed' :
                                    transaction.status === 'pending' ? 'Pending' : 'Failed';

                return (
                  <div key={transaction._id || `transaction-${Date.now()}`} className="flex items-center justify-between p-3 border border-secondary-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <div className="font-medium text-secondary-900 dark:text-white">
                        {transaction.user?.firstname || 'Unknown'} {transaction.user?.lastname || ''}
                        {transaction.user?.regNo && ` (${transaction.user.regNo})`}
                      </div>
                      <div className="text-sm text-secondary-600 dark:text-gray-400">{timeAgo}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-secondary-900 dark:text-white">{formatCurrency(transaction.amount || 0)}</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        statusDisplay === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        statusDisplay === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {statusDisplay === 'Completed' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                        {statusDisplay === 'Pending' && <ClockIcon className="h-3 w-3 mr-1" />}
                        {statusDisplay === 'Failed' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                        {statusDisplay}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-secondary-600 dark:text-gray-400">No recent transactions available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BursarDashboard;
