import React, { useEffect } from 'react';
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

import type { QuickAction } from '../widgets/QuickActionCard';
import type { Activity } from '../widgets/RecentActivityCard';
import { useAuditorStore } from '../../../store/auditorStore';
import { auditorService } from '../../../services/auditorService';
import type { AuditEntry } from '../widgets/AuditTrailCard';

const AuditorDashboard: React.FC = () => {
  const {
    dashboardData,
    dashboardLoading,
    dashboardError,
    fetchDashboardData,
  } = useAuditorStore();

  // Get compliance alert styling
  const getComplianceAlertStyle = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 75) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getComplianceIconStyle = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceTextStyle = (score: number) => {
    if (score >= 90) return 'text-green-800';
    if (score >= 75) return 'text-yellow-800';
    return 'text-red-800';
  };

  const getComplianceDescriptionStyle = (score: number) => {
    if (score >= 90) return 'text-green-700';
    if (score >= 75) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    return 'Needs Attention';
  };

  // Get metric status styling
  const getMetricStatusStyle = (status: string) => {
    if (status === 'excellent') return 'bg-green-100 text-green-800';
    if (status === 'good') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  // Get issue severity styling
  const getIssueSeverityStyle = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-800';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Generate stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Audit Entries',
      value: dashboardData.auditStats.totalAuditEntries.toLocaleString(),
      change: `+${dashboardData.auditStats.recentAuditsCount}`,
      changeType: 'increase' as const,
      icon: DocumentMagnifyingGlassIcon,
      iconColor: 'text-blue-600',
      description: 'This month',
    },
    {
      title: 'Compliance Score',
      value: `${dashboardData.auditStats.complianceScore}%`,
      change: dashboardData.auditStats.complianceScore >= 90 ? 'Excellent' : 'Good',
      changeType: dashboardData.auditStats.complianceScore >= 90 ? 'increase' as const : 'neutral' as const,
      icon: ShieldCheckIcon,
      iconColor: auditorService.getComplianceColor(dashboardData.auditStats.complianceScore),
      description: 'Overall compliance',
    },
    {
      title: 'Critical Issues',
      value: dashboardData.auditStats.criticalIssues.toString(),
      change: dashboardData.auditStats.criticalIssues > 0 ? 'Needs attention' : 'All clear',
      changeType: dashboardData.auditStats.criticalIssues > 0 ? 'decrease' as const : 'increase' as const,
      icon: ExclamationTriangleIcon,
      iconColor: dashboardData.auditStats.criticalIssues > 0 ? 'text-red-600' : 'text-green-600',
      description: 'Require attention',
    },
    {
      title: 'Security Score',
      value: `${dashboardData.auditStats.securityScore}%`,
      change: dashboardData.auditStats.securityScore >= 85 ? 'Secure' : 'Review needed',
      changeType: dashboardData.auditStats.securityScore >= 85 ? 'increase' as const : 'decrease' as const,
      icon: DocumentTextIcon,
      iconColor: auditorService.getComplianceColor(dashboardData.auditStats.securityScore),
      description: 'Security metrics',
    },
  ] : [];

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

  // Generate recent activities from dashboard data
  const recentActivities: Activity[] = dashboardData ?
    dashboardData.recentAudits.slice(0, 5).map((audit) => ({
      id: audit._id,
      title: audit.action,
      description: audit.details,
      timestamp: new Date(audit.timestamp),
      type: 'audit' as const,
      user: audit.user,
    })) : [];

  // Generate audit entries from dashboard data
  const auditEntries: AuditEntry[] = dashboardData ?
    dashboardData.recentAudits.map((audit) => ({
      id: audit._id,
      action: audit.action,
      user: audit.user,
      timestamp: new Date(audit.timestamp),
      details: audit.details,
      severity: audit.severity,
    })) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Loading State */}
      {dashboardLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-secondary-600">Loading audit dashboard...</span>
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

      {/* Compliance Alert */}
      {dashboardData && (
        <div className={`border rounded-lg p-4 ${getComplianceAlertStyle(dashboardData.auditStats.complianceScore)}`}>
          <div className="flex items-center">
            <CheckCircleIcon className={`h-5 w-5 mr-2 ${getComplianceIconStyle(dashboardData.auditStats.complianceScore)}`} />
            <div>
              <h4 className={`text-sm font-medium ${getComplianceTextStyle(dashboardData.auditStats.complianceScore)}`}>
                Compliance Status: {getComplianceStatus(dashboardData.auditStats.complianceScore)}
              </h4>
              <p className={`text-sm mt-1 ${getComplianceDescriptionStyle(dashboardData.auditStats.complianceScore)}`}>
                System compliance is at {dashboardData.auditStats.complianceScore}%.
                {dashboardData.auditStats.criticalIssues > 0
                  ? ` ${dashboardData.auditStats.criticalIssues} critical issues require attention.`
                  : ' All critical requirements are met.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      {!dashboardLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">        {stats.map((stat) => (
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

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Compliance Metrics
          </h3>
          <div className="space-y-4">
            {[
              { category: 'Financial Controls', score: 96, status: 'excellent' },
              { category: 'Data Security', score: 94, status: 'good' },
              { category: 'Access Management', score: 91, status: 'good' },
              { category: 'Audit Trail', score: 98, status: 'excellent' },
              { category: 'Policy Compliance', score: 89, status: 'fair' },
            ].map((metric) => (
              <div key={metric.category} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-secondary-900 dark:text-secondary-100">{metric.category}</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">{metric.score}%</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMetricStatusStyle(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Critical Issues
          </h3>
          <div className="space-y-3">
            {[
              { issue: 'Outdated Password Policy', severity: 'medium', age: '5 days' },
              { issue: 'Missing Backup Verification', severity: 'low', age: '2 days' },
              { issue: 'Incomplete User Training', severity: 'medium', age: '1 week' },
            ].map((issue) => (
              <div key={issue.issue} className="flex items-center justify-between p-3 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                <div>
                  <div className="font-medium text-secondary-900 dark:text-secondary-100">{issue.issue}</div>
                  <div className="text-sm text-secondary-600 dark:text-secondary-400">Age: {issue.age}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getIssueSeverityStyle(issue.severity)}`}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-lg shadow-sm border border-secondary-200 dark:border-secondary-700 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Audit Statistics
          </h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">2,847</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Total Audit Entries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">47</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Reports Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">3</div>
              <div className="text-sm text-secondary-600 dark:text-secondary-400">Critical Issues</div>
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
