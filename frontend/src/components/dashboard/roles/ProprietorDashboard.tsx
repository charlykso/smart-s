import React from 'react';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
  FinancialChart,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';

const ProprietorDashboard: React.FC = () => {
  // Mock data for proprietor metrics - multi-school overview
  const stats = [
    {
      title: 'Total Schools',
      value: '12',
      change: '+2',
      changeType: 'increase' as const,
      icon: BuildingOfficeIcon,
      iconColor: 'text-blue-600',
      description: 'Schools under management',
    },
    {
      title: 'Total Revenue',
      value: '₦125.8M',
      change: '+18%',
      changeType: 'increase' as const,
      icon: CurrencyDollarIcon,
      iconColor: 'text-green-600',
      description: 'Across all schools',
    },
    {
      title: 'Total Students',
      value: '15,847',
      change: '+1,234',
      changeType: 'increase' as const,
      icon: UsersIcon,
      iconColor: 'text-purple-600',
      description: 'Enrolled students',
    },
    {
      title: 'Performance Score',
      value: '87%',
      change: '+5%',
      changeType: 'increase' as const,
      icon: ChartBarIcon,
      iconColor: 'text-orange-600',
      description: 'Average across schools',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'add-school',
      title: 'Add New School',
      description: 'Register a new school in the network',
      icon: BuildingOfficeIcon,
      onClick: () => console.log('Add school'),
      color: 'primary',
    },
    {
      id: 'financial-overview',
      title: 'Financial Overview',
      description: 'View consolidated financial reports',
      icon: DocumentChartBarIcon,
      onClick: () => console.log('Financial overview'),
      color: 'success',
    },
    {
      id: 'performance-analysis',
      title: 'Performance Analysis',
      description: 'Analyze school performance metrics',
      icon: ArrowTrendingUpIcon,
      onClick: () => console.log('Performance analysis'),
      color: 'warning',
    },
    {
      id: 'strategic-planning',
      title: 'Strategic Planning',
      description: 'Access strategic planning tools',
      icon: ChartBarIcon,
      onClick: () => console.log('Strategic planning'),
      color: 'secondary',
    },
    {
      id: 'revenue-analytics',
      title: 'Revenue Analytics',
      description: 'Deep dive into revenue analytics',
      icon: BanknotesIcon,
      onClick: () => console.log('Revenue analytics'),
      color: 'error',
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'New School Onboarded',
      description: 'Greenfield International Academy joined the network',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      type: 'system',
      user: 'System',
    },
    {
      id: '2',
      title: 'Monthly Revenue Target Achieved',
      description: 'Network achieved 105% of monthly revenue target',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      type: 'payment',
      user: 'Financial System',
    },
    {
      id: '3',
      title: 'Performance Review Completed',
      description: 'Q3 performance review for all schools completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
      type: 'academic',
      user: 'Academic Team',
    },
    {
      id: '4',
      title: 'Strategic Meeting Scheduled',
      description: 'Board meeting scheduled for next week',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'system',
      user: 'Executive Assistant',
    },
    {
      id: '5',
      title: 'Expansion Proposal Approved',
      description: 'New campus expansion proposal approved',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      type: 'system',
      user: 'Board of Directors',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Key Performance Indicators */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            Network Performance Overview
          </h3>
          <span className="text-sm text-secondary-600">Last updated: 2 hours ago</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">98.5%</div>
            <div className="text-sm text-secondary-600">Collection Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">₦45.2M</div>
            <div className="text-sm text-secondary-600">Monthly Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">94%</div>
            <div className="text-sm text-secondary-600">Student Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">12</div>
            <div className="text-sm text-secondary-600">Active Schools</div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActionCard
            title="Strategic Actions"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent Network Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>

      {/* Financial Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialChart
          title="Revenue Trend (Last 6 Months)"
          data={[]}
          type="line"
        />
        <FinancialChart
          title="School Performance Comparison"
          data={[]}
          type="bar"
        />
      </div>
    </div>
  );
};

export default ProprietorDashboard;
