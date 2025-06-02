import React from 'react';
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

import type { QuickAction, Activity } from '../widgets/QuickActionCard';

const BursarDashboard: React.FC = () => {
  // Mock data for bursar metrics - financial focus
  const stats = [
    {
      title: 'Total Revenue',
      value: '₦45.8M',
      change: '+12%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      iconColor: 'text-green-600',
      description: 'This term',
    },
    {
      title: 'Collection Rate',
      value: '87%',
      change: '+5%',
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      iconColor: 'text-blue-600',
      description: 'Fee collection',
    },
    {
      title: 'Outstanding Fees',
      value: '₦6.2M',
      change: '-8%',
      changeType: 'decrease' as const,
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-600',
      description: 'Pending payments',
    },
    {
      title: 'Processed Today',
      value: '₦245K',
      change: '+15%',
      changeType: 'increase' as const,
      icon: BanknotesIcon,
      iconColor: 'text-purple-600',
      description: '47 transactions',
    },
  ];

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

  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'Payment Processed',
      description: 'School fees payment of ₦125,000 processed for John Doe',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      type: 'payment',
      user: 'Payment Gateway',
    },
    {
      id: '2',
      title: 'Receipt Generated',
      description: 'Payment receipt #RF2024001234 generated',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      type: 'payment',
      user: 'Bursar',
    },
    {
      id: '3',
      title: 'Bank Reconciliation',
      description: 'Daily bank reconciliation completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: 'payment',
      user: 'Finance Team',
    },
    {
      id: '4',
      title: 'Outstanding Fee Alert',
      description: 'Reminder sent to 45 students with outstanding fees',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      type: 'fee',
      user: 'System',
    },
    {
      id: '5',
      title: 'Financial Report Generated',
      description: 'Monthly financial report generated and sent',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'payment',
      user: 'Bursar',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Financial Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              Payment Processing Alert
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              47 payments are pending verification. Please review and process them today.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Payment Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PaymentSummaryCard
          title="Term Fee Collection"
          totalAmount={52000000}
          paidAmount={45800000}
          pendingAmount={6200000}
        />
        <PaymentSummaryCard
          title="Monthly Target"
          totalAmount={15000000}
          paidAmount={12450000}
          pendingAmount={2550000}
        />
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Payment Methods
          </h3>
          <div className="space-y-3">
            {[
              { method: 'Bank Transfer', amount: '₦28.5M', percentage: 62 },
              { method: 'Online Payment', amount: '₦12.8M', percentage: 28 },
              { method: 'Cash Payment', amount: '₦4.5M', percentage: 10 },
            ].map((payment, index) => (
              <div key={`payment-method-${index}`} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-secondary-900">{payment.method}</div>
                  <div className="text-sm text-secondary-600">{payment.amount}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-secondary-900">{payment.percentage}%</div>
                  <div className="w-16 bg-secondary-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{ width: `${payment.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {[
              { student: 'John Doe', amount: '₦125,000', status: 'Completed', time: '2 hours ago' },
              { student: 'Jane Smith', amount: '₦98,500', status: 'Pending', time: '3 hours ago' },
              { student: 'Mike Johnson', amount: '₦110,000', status: 'Completed', time: '5 hours ago' },
              { student: 'Sarah Wilson', amount: '₦87,500', status: 'Failed', time: '6 hours ago' },
              { student: 'David Brown', amount: '₦156,000', status: 'Completed', time: '8 hours ago' },
            ].map((transaction, index) => (
              <div key={`transaction-${index}`} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                <div>
                  <div className="font-medium text-secondary-900">{transaction.student}</div>
                  <div className="text-sm text-secondary-600">{transaction.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-secondary-900">{transaction.amount}</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status === 'Completed' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                    {transaction.status === 'Pending' && <ClockIcon className="h-3 w-3 mr-1" />}
                    {transaction.status === 'Failed' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BursarDashboard;
