import React from 'react';
import {
  UsersIcon,
  CurrencyDollarIcon,
  AcademicCapIcon,
  CalendarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
  StudentOverviewCard,
  PaymentSummaryCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';

const ParentDashboard: React.FC = () => {
  // Mock data for parent metrics - child-focused
  const stats = [
    {
      title: 'Children Enrolled',
      value: '2',
      change: '+1',
      changeType: 'increase' as const,
      icon: UsersIcon,
      iconColor: 'text-blue-600',
      description: 'Active students',
    },
    {
      title: 'Outstanding Fees',
      value: '₦185K',
      change: '-₦25K',
      changeType: 'decrease' as const,
      icon: CurrencyDollarIcon,
      iconColor: 'text-red-600',
      description: 'Total pending',
    },
    {
      title: 'Average Performance',
      value: '82%',
      change: '+4%',
      changeType: 'increase' as const,
      icon: AcademicCapIcon,
      iconColor: 'text-green-600',
      description: 'Across all children',
    },
    {
      title: 'Attendance Rate',
      value: '94%',
      change: '+1%',
      changeType: 'increase' as const,
      icon: CalendarIcon,
      iconColor: 'text-purple-600',
      description: 'This term',
    },
  ];

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

  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'Payment Processed',
      description: 'School fees payment of ₦125,000 for John Doe processed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: 'payment',
      user: 'Payment Gateway',
    },
    {
      id: '2',
      title: 'Academic Report Available',
      description: 'Mid-term report for Sarah Doe is now available',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      type: 'academic',
      user: 'Academic Office',
    },
    {
      id: '3',
      title: 'Parent-Teacher Meeting',
      description: 'Meeting scheduled with Mathematics teacher',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'academic',
      user: 'School Admin',
    },
    {
      id: '4',
      title: 'Fee Reminder',
      description: 'Reminder: Term fees due in 5 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      type: 'fee',
      user: 'Bursar Office',
    },
    {
      id: '5',
      title: 'Event Notification',
      description: 'Sports Day scheduled for next Friday',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      type: 'academic',
      user: 'School Admin',
    },
  ];

  // Mock children data
  const children = [
    {
      id: '1',
      name: 'John Doe',
      class: 'JSS 2A',
      outstandingFees: 95000,
      academicProgress: 85,
      attendanceRate: 96,
    },
    {
      id: '2',
      name: 'Sarah Doe',
      class: 'Primary 5B',
      outstandingFees: 90000,
      academicProgress: 79,
      attendanceRate: 92,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Fee Alert */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <BellIcon className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              Payment Reminder
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              You have outstanding fees of ₦185,000 across all children. Payment is due in 5 days.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={`parent-stat-${index}`}
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
                  ₦{(child.outstandingFees / 1000).toFixed(0)}K
                </div>
                <div className="text-xs text-secondary-600">Outstanding</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {child.academicProgress}%
                </div>
                <div className="text-xs text-secondary-600">Performance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {child.attendanceRate}%
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentSummaryCard
          title="Total Fee Summary"
          totalAmount={370000}
          paidAmount={185000}
          pendingAmount={185000}
        />

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Recent Payments
          </h3>
          <div className="space-y-3">
            {[
              { child: 'John Doe', amount: '₦125,000', date: '2 days ago', status: 'Completed' },
              { child: 'Sarah Doe', amount: '₦60,000', date: '1 week ago', status: 'Completed' },
              { child: 'John Doe', amount: '₦95,000', date: '2 weeks ago', status: 'Completed' },
            ].map((payment, index) => (
              <div key={`payment-${index}`} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                <div>
                  <div className="font-medium text-secondary-900">{payment.child}</div>
                  <div className="text-sm text-secondary-600">{payment.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-secondary-900">{payment.amount}</div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {payment.status}
                  </span>
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
