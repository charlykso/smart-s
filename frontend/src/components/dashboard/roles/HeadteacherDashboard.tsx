import React from 'react';
import {
  AcademicCapIcon,
  UsersIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
  ProgressCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';

const HeadteacherDashboard: React.FC = () => {
  // Mock data for headteacher metrics - academic focus
  const stats = [
    {
      title: 'Total Students',
      value: '1,456',
      description: '+67 enrolled this term',
      icon: UsersIcon,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Academic Performance',
      value: '84%',
      description: '+6% improvement',
      icon: AcademicCapIcon,
      iconColor: 'text-green-600',
    },
    {
      title: 'Attendance Rate',
      value: '91%',
      description: '+2% this term',
      icon: CalendarIcon,
      iconColor: 'text-purple-600',
    },
    {
      title: 'Teaching Staff',
      value: '89',
      change: '+5',
      changeType: 'increase' as const,
      icon: UserGroupIcon,
      iconColor: 'text-orange-600',
      description: 'Active teachers',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'class-assignments',
      title: 'Manage Class Assignments',
      description: 'Assign teachers to classes and subjects',
      icon: ClipboardDocumentListIcon,
      onClick: () => console.log('Class assignments'),
      color: 'primary',
    },
    {
      id: 'curriculum-planning',
      title: 'Curriculum Planning',
      description: 'Plan and manage curriculum activities',
      icon: BookOpenIcon,
      onClick: () => console.log('Curriculum planning'),
      color: 'success',
    },
    {
      id: 'academic-calendar',
      title: 'Academic Calendar',
      description: 'Manage academic calendar and events',
      icon: CalendarIcon,
      onClick: () => console.log('Academic calendar'),
      color: 'warning',
    },
    {
      id: 'performance-reports',
      title: 'Performance Reports',
      description: 'Generate academic performance reports',
      icon: ChartBarIcon,
      onClick: () => console.log('Performance reports'),
      color: 'secondary',
    },
    {
      id: 'teacher-evaluation',
      title: 'Teacher Evaluation',
      description: 'Conduct teacher performance evaluations',
      icon: DocumentTextIcon,
      onClick: () => console.log('Teacher evaluation'),
      color: 'error',
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'New Teacher Assigned',
      description: 'Mathematics teacher assigned to Class 5A',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: 'academic',
      user: 'Head Teacher',
    },
    {
      id: '2',
      title: 'Curriculum Updated',
      description: 'Science curriculum updated for Term 2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: 'academic',
      user: 'Curriculum Team',
    },
    {
      id: '3',
      title: 'Exam Schedule Published',
      description: 'Mid-term examination schedule published',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      type: 'academic',
      user: 'Academic Office',
    },
    {
      id: '4',
      title: 'Parent-Teacher Meeting',
      description: 'PTA meeting scheduled for next Friday',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      type: 'academic',
      user: 'Head Teacher',
    },
    {
      id: '5',
      title: 'Academic Performance Review',
      description: 'Monthly performance review completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'academic',
      user: 'Academic Team',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Academic Overview */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900">
            Academic Overview
          </h3>
          <span className="text-sm text-secondary-600">Current Term Progress</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProgressCard
            title="Curriculum Completion"
            progress={75}
            total={100}
            description="Term 2 Progress"
            color="success"
          />
          <ProgressCard
            title="Examinations Conducted"
            progress={8}
            total={12}
            description="This term"
            color="primary"
          />
          <ProgressCard
            title="Teacher Training"
            progress={45}
            total={60}
            description="Hours completed"
            color="warning"
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
        {stats.map((stat, index) => (
          <StatCard
            key={`stat-${index}`}
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
            title="Academic Management"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent Academic Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>

      {/* Class Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Class Performance Summary
          </h3>
          <div className="space-y-4">
            {[
              { class: 'JSS 1A', students: 45, average: 78, attendance: 94 },
              { class: 'JSS 1B', students: 42, average: 82, attendance: 91 },
              { class: 'JSS 2A', students: 48, average: 75, attendance: 89 },
              { class: 'JSS 2B', students: 44, average: 80, attendance: 93 },
              { class: 'JSS 3A', students: 46, average: 85, attendance: 96 },
            ].map((classData, index) => (
              <div key={`class-${index}`} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <div className="font-medium text-secondary-900">{classData.class}</div>
                  <div className="text-sm text-secondary-600">{classData.students} students</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-secondary-900">{classData.average}% avg</div>
                  <div className="text-xs text-secondary-600">{classData.attendance}% attendance</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Upcoming Academic Events
          </h3>
          <div className="space-y-3">
            {[
              { event: 'Mid-term Examinations', date: 'Nov 15-22, 2024', type: 'exam' },
              { event: 'Parent-Teacher Conference', date: 'Nov 25, 2024', type: 'meeting' },
              { event: 'Science Fair', date: 'Dec 5, 2024', type: 'event' },
              { event: 'End of Term Exams', date: 'Dec 10-17, 2024', type: 'exam' },
              { event: 'Graduation Ceremony', date: 'Dec 20, 2024', type: 'ceremony' },
            ].map((event, index) => (
              <div key={`event-${index}`} className="flex items-center p-3 border border-secondary-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-secondary-900">{event.event}</div>
                  <div className="text-sm text-secondary-600">{event.date}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.type === 'exam' ? 'bg-red-100 text-red-800' :
                  event.type === 'meeting' ? 'bg-blue-100 text-blue-800' :
                  event.type === 'event' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeadteacherDashboard;
