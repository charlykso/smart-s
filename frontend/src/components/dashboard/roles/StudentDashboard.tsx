import React, { useEffect } from 'react';
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
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';
import { useStudentStore } from '../../../store/studentStore';

const StudentDashboard: React.FC = () => {
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboardData,
  } = useStudentStore();

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
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
      onClick: () => console.log('Make payment'),
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
                  onClick={() => window.location.href = '/student/fees'}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
};

export default StudentDashboard;
