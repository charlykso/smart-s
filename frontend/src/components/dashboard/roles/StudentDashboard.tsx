import React, { useEffect, useState } from 'react';
import {
  AcademicCapIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  CreditCardIcon,
  BellIcon,
  BookOpenIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';
import { useStudentStore } from '../../../store/studentStore';
import { useAuthStore } from '../../../store/authStore';
import { FeeService } from '../../../services/feeService';
import type { PaymentMethod } from '../../../types/fee';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboardData,
  } = useStudentStore();

  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
    loadAvailablePaymentMethods();
  }, [fetchDashboardData]);

  // Load available payment methods for the school
  const loadAvailablePaymentMethods = async () => {
    if (!user?.school) return;

    try {
      setLoadingPaymentMethods(true);
      const methods = await FeeService.getAvailablePaymentMethods(
        typeof user.school === 'string' ? user.school : user.school._id
      );
      setAvailablePaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Fallback: Show default payment methods if API fails
      setAvailablePaymentMethods([
        {
          method: 'cash',
          name: 'Cash Payment',
          description: 'Pay at the Bursar office',
          icon: 'banknotes',
          enabled: true,
        },
        {
          method: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Direct bank transfer (contact school for details)',
          icon: 'building-library',
          enabled: true,
        },
      ]);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'paystack':
      case 'flutterwave':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'bank_transfer':
        return <BuildingLibraryIcon className="h-5 w-5" />;
      case 'cash':
        return <BanknotesIcon className="h-5 w-5" />;
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  // Get payment method color
  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'paystack':
        return 'text-blue-600 bg-blue-50';
      case 'flutterwave':
        return 'text-orange-600 bg-orange-50';
      case 'bank_transfer':
        return 'text-green-600 bg-green-50';
      case 'cash':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Calculate stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Outstanding Fees',
      value: formatCurrency(dashboardData.financial.totalOutstanding),
      change: dashboardData.financial.totalOutstanding > 0 ? 'Payment due' : 'All paid',
      changeType: dashboardData.financial.totalOutstanding > 0 ? 'neutral' as const : 'positive' as const,
      icon: CurrencyDollarIcon,
      iconColor: dashboardData.financial.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600',
      description: 'Amount due this term',
    },
    {
      title: 'Academic Progress',
      value: `${dashboardData.academic.currentAverage}%`,
      change: dashboardData.academic.currentAverage >= 75 ? 'Excellent' : 'Needs improvement',
      changeType: dashboardData.academic.currentAverage >= 75 ? 'positive' as const : 'negative' as const,
      icon: AcademicCapIcon,
      iconColor: dashboardData.academic.currentAverage >= 75 ? 'text-green-600' : 'text-yellow-600',
      description: 'Current term average',
    },
    {
      title: 'Attendance Rate',
      value: `${dashboardData.academic.attendanceRate}%`,
      change: dashboardData.academic.attendanceRate >= 90 ? 'Excellent' : 'Good',
      changeType: dashboardData.academic.attendanceRate >= 90 ? 'positive' as const : 'neutral' as const,
      icon: CalendarIcon,
      iconColor: dashboardData.academic.attendanceRate >= 90 ? 'text-green-600' : 'text-blue-600',
      description: 'This term',
    },
    {
      title: 'Assignments',
      value: `${dashboardData.academic.completedAssignments}/${dashboardData.academic.totalAssignments}`,
      change: `${dashboardData.academic.totalAssignments - dashboardData.academic.completedAssignments} pending`,
      changeType: dashboardData.academic.completedAssignments === dashboardData.academic.totalAssignments ? 'positive' as const : 'neutral' as const,
      icon: DocumentTextIcon,
      iconColor: dashboardData.academic.completedAssignments === dashboardData.academic.totalAssignments ? 'text-green-600' : 'text-purple-600',
      description: 'Completed this term',
    },
  ] : [];

  const quickActions: QuickAction[] = [
    {
      id: 'make-payment',
      title: 'Make Payment',
      description: 'Pay outstanding fees online',
      icon: CreditCardIcon,
      onClick: () => navigate('/student/fees'),
      color: 'primary',
    },
    {
      id: 'view-results',
      title: 'View Results',
      description: 'Check academic performance',
      icon: ChartBarIcon,
      onClick: () => console.log('View results'),
      color: 'success',
    },
    {
      id: 'download-receipt',
      title: 'Download Receipt',
      description: 'Get payment receipts',
      icon: DocumentTextIcon,
      onClick: () => console.log('Download receipt'),
      color: 'secondary',
    },
    {
      id: 'view-timetable',
      title: 'Class Timetable',
      description: 'View your class schedule',
      icon: CalendarIcon,
      onClick: () => console.log('View timetable'),
      color: 'warning',
    },
    {
      id: 'library-access',
      title: 'Library Resources',
      description: 'Access digital library',
      icon: BookOpenIcon,
      onClick: () => console.log('Library access'),
      color: 'error',
    },
  ];

  // Generate recent activities from dashboard data
  const recentActivities: Activity[] = dashboardData ? [
    // Recent payments
    ...dashboardData.financial.recentPayments.slice(0, 3).map((payment, index) => ({
      id: `payment-${payment._id}`,
      title: 'Payment Received',
      description: `${payment.fee.name} payment of ${formatCurrency(payment.amount)} processed`,
      timestamp: new Date(payment.date),
      type: 'payment' as const,
      user: 'Payment System',
    })),
    // Academic activities (mock for now)
    {
      id: 'academic-1',
      title: 'Assignment Submitted',
      description: 'Mathematics assignment submitted successfully',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      type: 'academic' as const,
      user: 'Student Portal',
    },
    {
      id: 'academic-2',
      title: 'Attendance Recorded',
      description: `Current attendance rate: ${dashboardData.academic.attendanceRate}%`,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'academic' as const,
      user: 'Academic System',
    },
  ].slice(0, 5) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Important Notice (if any outstanding fees) */}
      {dashboardData && dashboardData.financial.totalOutstanding > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Outstanding Fees Notice
              </h4>
              <p className="text-sm text-red-700 mt-1">
                You have outstanding fees of {formatCurrency(dashboardData.financial.totalOutstanding)}.
                Please make payment before the deadline to avoid penalties.
              </p>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => navigate('/student/fees')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Pay Fees Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {dashboardError}. Using cached data.
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
            title="Student Services"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Available Payment Methods</h3>
              <p className="text-sm text-gray-500 mt-1">
                Payment channels configured by your school
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/fees')}
              className="inline-flex items-center px-3 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Make Payment
            </button>
          </div>
        </div>

        <div className="p-6">
          {loadingPaymentMethods ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-secondary-600">Loading payment methods...</span>
            </div>
          ) : availablePaymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {availablePaymentMethods.map((method) => (
                <div
                  key={method.method}
                  className={`p-4 rounded-lg border border-gray-200 ${getPaymentMethodColor(method.method)}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getPaymentMethodIcon(method.method)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {method.name}
                      </p>
                      <p className="text-xs opacity-75 truncate">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <h4 className="text-sm font-medium text-gray-900 mb-2">No Payment Methods Available</h4>
              <p className="text-sm text-gray-500">
                Please contact the school administration to configure payment methods.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
