import React, { useEffect } from 'react';
import {
  UsersIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
  StudentOverviewCard,
  PaymentSummaryCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';
import { useParentStore } from '../../../store/parentStore';
import { parentService } from '../../../services/parentService';

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboardData,
  } = useParentStore();

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return parentService.formatCurrency(amount);
  };

  // Generate stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Children Enrolled',
      value: dashboardData.overallSummary.totalChildren.toString(),
      description: 'Active students enrolled',
      icon: UsersIcon,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Outstanding Fees',
      value: formatCurrency(dashboardData.overallSummary.totalOutstanding),
      description: dashboardData.overallSummary.totalOutstanding > 0 ? 'Payment due this term' : 'All fees paid',
      icon: CurrencyDollarIcon,
      iconColor: dashboardData.overallSummary.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      title: 'Average Performance',
      value: `${Math.round(dashboardData.overallSummary.averagePerformance)}%`,
      change: dashboardData.overallSummary.averagePerformance >= 75 ? 'Excellent' : 'Good',
      changeType: dashboardData.overallSummary.averagePerformance >= 75 ? 'positive' as const : 'neutral' as const,
      icon: AcademicCapIcon,
      iconColor: parentService.getPerformanceColor(dashboardData.overallSummary.averagePerformance),
      description: 'Across all children',
    },
    {
      title: 'Attendance Rate',
      value: `${Math.round(dashboardData.overallSummary.averageAttendance)}%`,
      change: dashboardData.overallSummary.averageAttendance >= 90 ? 'Excellent' : 'Good',
      changeType: dashboardData.overallSummary.averageAttendance >= 90 ? 'positive' as const : 'neutral' as const,
      icon: CalendarIcon,
      iconColor: parentService.getAttendanceColor(dashboardData.overallSummary.averageAttendance),
      description: 'This term',
    },
  ] : [];

  const quickActions: QuickAction[] = [
    {
      id: 'make-payment',
      title: 'Make Payment',
      description: 'Pay school fees for your children',
      icon: CreditCardIcon,
      onClick: () => console.log('Make payment'),
      color: 'primary',
    },
    {
      id: 'view-reports',
      title: 'Academic Reports',
      description: 'View children\'s academic progress',
      icon: DocumentTextIcon,
      onClick: () => console.log('View reports'),
      color: 'success',
    },
    {
      id: 'contact-school',
      title: 'Contact School',
      description: 'Send message to teachers or admin',
      icon: ChatBubbleLeftRightIcon,
      onClick: () => console.log('Contact school'),
      color: 'warning',
    },
    {
      id: 'view-calendar',
      title: 'School Calendar',
      description: 'View upcoming events and activities',
      icon: CalendarIcon,
      onClick: () => console.log('View calendar'),
      color: 'secondary',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Check important school notifications',
      icon: BellIcon,
      onClick: () => console.log('Notifications'),
      color: 'error',
    },
  ];

  // Generate recent activities from dashboard data
  const recentActivities: Activity[] = dashboardData ?
    dashboardData.recentActivities.slice(0, 5).map((activity) => ({
      id: activity._id,
      title: activity.type === 'payment' ? 'Payment Processed' :
             activity.type === 'academic' ? 'Academic Update' :
             activity.type === 'fee' ? 'Fee Notification' : 'School Update',
      description: `${activity.description} for ${activity.childName}`,
      timestamp: new Date(activity.date),
      type: activity.type as 'payment' | 'academic' | 'fee' | 'system',
      user: activity.type === 'payment' ? 'Payment System' : 'School Admin',
    })) : [];

  // Generate children data from dashboard data
  const children = dashboardData ?
    dashboardData.children.map((child) => {
      const financialData = dashboardData.financialSummary.find(f => f.childId === child._id);
      const academicData = dashboardData.academicSummary.find(a => a.childId === child._id);

      return {
        id: child._id,
        name: `${child.firstname} ${child.lastname}`,
        class: child.classArm?.name || 'Not assigned',
        regNo: child.regNo,
        outstandingFees: financialData?.totalOutstanding || 0,
        academicProgress: academicData?.currentAverage || 0,
        attendanceRate: academicData?.attendanceRate || 0,
      };
    }) : [];

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

      {/* Fee Alert */}
      {dashboardData && dashboardData.overallSummary.totalOutstanding > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Payment Reminder
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                You have outstanding fees of {formatCurrency(dashboardData.overallSummary.totalOutstanding)} across all children. Please make payment soon.
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
              key={`parent-stat-${index}`}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconColor={stat.iconColor}
              description={stat.description}
            />
          ))}
        </div>
      )}

      {/* Children Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child) => (
          <div key={child.id} className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900">
                {child.name}
              </h3>
              <span className="text-sm text-secondary-600">{child.class}</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(child.outstandingFees)}
                </div>
                <div className="text-xs text-secondary-600">Outstanding</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${parentService.getPerformanceColor(child.academicProgress)}`}>
                  {Math.round(child.academicProgress)}%
                </div>
                <div className="text-xs text-secondary-600">Performance</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${parentService.getAttendanceColor(child.attendanceRate)}`}>
                  {Math.round(child.attendanceRate)}%
                </div>
                <div className="text-xs text-secondary-600">Attendance</div>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                Pay Fees
              </button>
              <button className="flex-1 px-3 py-2 text-sm bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200">
                View Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      {dashboardData && !dashboardLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymentSummaryCard
            title="Total Fee Summary"
            totalAmount={dashboardData.overallSummary.totalPaid + dashboardData.overallSummary.totalOutstanding}
            paidAmount={dashboardData.overallSummary.totalPaid}
            pendingAmount={dashboardData.overallSummary.totalOutstanding}
          />

          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">
              Recent Payments
            </h3>
            <div className="space-y-3">
              {dashboardData.financialSummary.length > 0 ? (
                dashboardData.financialSummary
                  .flatMap(child =>
                    child.recentPayments.slice(0, 2).map(payment => ({
                      ...payment,
                      childName: child.childName
                    }))
                  )
                  .slice(0, 3)
                  .map((payment, index) => (
                    <div key={`payment-${index}`} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                      <div>
                        <div className="font-medium text-secondary-900">{payment.childName}</div>
                        <div className="text-sm text-secondary-600">{parentService.formatRelativeTime(payment.trans_date)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-secondary-900">{formatCurrency(payment.amount)}</div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-secondary-600">No recent payments available</p>
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
            title="Parent Services"
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

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          Upcoming School Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { event: 'Parent-Teacher Conference', date: 'Nov 25, 2024', type: 'meeting' },
            { event: 'Sports Day', date: 'Dec 1, 2024', type: 'event' },
            { event: 'End of Term Exams', date: 'Dec 10-17, 2024', type: 'exam' },
            { event: 'Christmas Carol Service', date: 'Dec 18, 2024', type: 'ceremony' },
            { event: 'School Closure', date: 'Dec 20, 2024', type: 'holiday' },
            { event: 'New Term Begins', date: 'Jan 8, 2025', type: 'academic' },
          ].map((event, index) => (
            <div key={`event-${index}`} className="p-4 border border-secondary-200 rounded-lg">
              <div className="font-medium text-secondary-900 mb-1">{event.event}</div>
              <div className="text-sm text-secondary-600 mb-2">{event.date}</div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                event.type === 'exam' ? 'bg-red-100 text-red-800' :
                event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                event.type === 'event' ? 'bg-green-100 text-green-800' :
                event.type === 'ceremony' ? 'bg-purple-100 text-purple-800' :
                event.type === 'holiday' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
