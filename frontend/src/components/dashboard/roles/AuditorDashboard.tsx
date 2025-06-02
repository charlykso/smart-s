import React from 'react';
import {
  DocumentMagnifyingGlassIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
  AuditTrailCard,
} from '../widgets';

import type { QuickAction, Activity } from '../widgets/QuickActionCard';
import type { AuditEntry } from '../widgets/AuditTrailCard';

const AuditorDashboard: React.FC = () => {
  // Mock data for auditor metrics - compliance and audit focus
  const stats = [
    {
      title: 'Audit Entries',
      value: '2,847',
      change: '+156',
      changeType: 'increase' as const,
      icon: DocumentMagnifyingGlassIcon,
      iconColor: 'text-blue-600',
      description: 'This month',
    },
    {
      title: 'Compliance Score',
      value: '94%',
      change: '+2%',
      changeType: 'increase' as const,
      icon: ShieldCheckIcon,
      iconColor: 'text-green-600',
      description: 'Overall compliance',
    },
    {
      title: 'Critical Issues',
      value: '3',
      change: '-2',
      changeType: 'decrease' as const,
      icon: ExclamationTriangleIcon,
      iconColor: 'text-red-600',
      description: 'Require attention',
    },
    {
      title: 'Reports Generated',
      value: '47',
      change: '+8',
      changeType: 'increase' as const,
      icon: DocumentTextIcon,
      iconColor: 'text-purple-600',
      description: 'This month',
    },
  ];

  const quickActions: QuickAction[] = [
    {
      id: 'audit-trail',
      title: 'View Audit Trail',
      description: 'Review complete audit trail and logs',
      icon: DocumentMagnifyingGlassIcon,
      onClick: () => console.log('View audit trail'),
      color: 'primary',
    },
    {
      id: 'compliance-check',
      title: 'Compliance Check',
      description: 'Run comprehensive compliance verification',
      icon: ShieldCheckIcon,
      onClick: () => console.log('Compliance check'),
      color: 'success',
    },
    {
      id: 'generate-report',
      title: 'Generate Audit Report',
      description: 'Create detailed audit reports',
      icon: DocumentTextIcon,
      onClick: () => console.log('Generate report'),
      color: 'warning',
    },
    {
      id: 'financial-integrity',
      title: 'Financial Integrity',
      description: 'Verify financial data integrity',
      icon: ChartBarIcon,
      onClick: () => console.log('Financial integrity'),
      color: 'secondary',
    },
    {
      id: 'exception-review',
      title: 'Exception Review',
      description: 'Review flagged exceptions and anomalies',
      icon: ExclamationTriangleIcon,
      onClick: () => console.log('Exception review'),
      color: 'error',
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'Compliance Scan Completed',
      description: 'Monthly compliance scan completed with 94% score',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      type: 'audit',
      user: 'Audit System',
    },
    {
      id: '2',
      title: 'Exception Flagged',
      description: 'Unusual payment pattern detected and flagged',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: 'audit',
      user: 'Monitoring System',
    },
    {
      id: '3',
      title: 'Audit Report Generated',
      description: 'Weekly audit report generated and distributed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      type: 'audit',
      user: 'Auditor',
    },
    {
      id: '4',
      title: 'Data Integrity Check',
      description: 'Financial data integrity verification completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      type: 'audit',
      user: 'System',
    },
    {
      id: '5',
      title: 'Policy Compliance Review',
      description: 'Annual policy compliance review initiated',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      type: 'audit',
      user: 'Auditor',
    },
  ];

  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      action: 'Payment Processed',
      user: 'bursar@school.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      details: 'School fees payment of ₦125,000 processed for student ID: ST2024001',
      severity: 'low',
    },
    {
      id: '2',
      action: 'User Role Modified',
      user: 'admin@school.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      details: 'User role changed from Teacher to Principal for user ID: USR2024045',
      severity: 'medium',
    },
    {
      id: '3',
      action: 'Large Payment Alert',
      user: 'system@school.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      details: 'Payment exceeding ₦500,000 threshold detected and flagged',
      severity: 'high',
    },
    {
      id: '4',
      action: 'Database Backup',
      user: 'system@school.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      details: 'Automated daily database backup completed successfully',
      severity: 'low',
    },
    {
      id: '5',
      action: 'Failed Login Attempt',
      user: 'unknown@external.com',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
      details: 'Multiple failed login attempts detected from IP: 192.168.1.100',
      severity: 'medium',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Compliance Alert */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
          <div>
            <h4 className="text-sm font-medium text-green-800">
              Compliance Status: Good
            </h4>
            <p className="text-sm text-green-700 mt-1">
              System compliance is at 94%. All critical requirements are met with 3 minor issues pending resolution.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={`audit-stat-${index}`}
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

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Compliance Metrics
          </h3>
          <div className="space-y-4">
            {[
              { category: 'Financial Controls', score: 96, status: 'excellent' },
              { category: 'Data Security', score: 94, status: 'good' },
              { category: 'Access Management', score: 91, status: 'good' },
              { category: 'Audit Trail', score: 98, status: 'excellent' },
              { category: 'Policy Compliance', score: 89, status: 'fair' },
            ].map((metric, index) => (
              <div key={`compliance-${index}`} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-secondary-900">{metric.category}</div>
                  <div className="text-sm text-secondary-600">{metric.score}%</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  metric.status === 'excellent' ? 'bg-green-100 text-green-800' :
                  metric.status === 'good' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {metric.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Critical Issues
          </h3>
          <div className="space-y-3">
            {[
              { issue: 'Outdated Password Policy', severity: 'medium', age: '5 days' },
              { issue: 'Missing Backup Verification', severity: 'low', age: '2 days' },
              { issue: 'Incomplete User Training', severity: 'medium', age: '1 week' },
            ].map((issue, index) => (
              <div key={`issue-${index}`} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                <div>
                  <div className="font-medium text-secondary-900">{issue.issue}</div>
                  <div className="text-sm text-secondary-600">Age: {issue.age}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  issue.severity === 'high' ? 'bg-red-100 text-red-800' :
                  issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Audit Statistics
          </h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2,847</div>
              <div className="text-sm text-secondary-600">Total Audit Entries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">47</div>
              <div className="text-sm text-secondary-600">Reports Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">3</div>
              <div className="text-sm text-secondary-600">Critical Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActionCard
            title="Audit Operations"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent Audit Activities"
            activities={recentActivities}
            onViewAll={() => console.log('View all activities')}
          />
        </div>
      </div>

      {/* Audit Trail */}
      <AuditTrailCard
        title="Recent Audit Trail"
        entries={auditEntries}
        onViewAll={() => console.log('View all audit entries')}
      />
    </div>
  );
};

export default AuditorDashboard;
