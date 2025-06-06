import { apiService } from './api';

export interface AuditorDashboardData {
  auditor: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
  };
  auditStats: {
    totalAuditEntries: number;
    criticalIssues: number;
    complianceScore: number;
    securityScore: number;
    financialIntegrityScore: number;
    recentAuditsCount: number;
  };
  recentAudits: Array<{
    _id: string;
    action: string;
    user: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
    module: string;
    details: string;
  }>;
  financialIntegrity: {
    score: number;
    issues: string[];
    totalTransactions: number;
    flaggedTransactions: number;
    reconciliationStatus: string;
  };
  securityMetrics: {
    failedLogins: number;
    suspiciousActivities: number;
    blockedIPs: number;
    activeTokens: number;
  };
  complianceMetrics: {
    dataRetentionCompliance: number;
    accessControlCompliance: number;
    auditTrailCompliance: number;
    overallCompliance: number;
  };
}

export interface UserAuditTrail {
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
  };
  activities: Array<{
    _id: string;
    action: string;
    module: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    details: any;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  summary: {
    totalActivities: number;
    highRiskActivities: number;
    lastActivity: string;
    mostActiveModule: string;
  };
}

export interface FinancialAuditData {
  transactions: Array<{
    _id: string;
    amount: number;
    user: {
      firstname: string;
      lastname: string;
      regNo?: string;
    };
    fee: {
      name: string;
      amount: number;
    };
    status: string;
    mode_of_payment: string;
    trans_date: string;
    trx_ref: string;
    auditFlags: string[];
  }>;
  summary: {
    totalTransactions: number;
    totalAmount: number;
    flaggedTransactions: number;
    reconciliationIssues: number;
  };
  reconciliation: {
    expectedTotal: number;
    actualTotal: number;
    variance: number;
    status: 'matched' | 'variance' | 'critical';
  };
}

export interface SecurityAuditData {
  events: Array<{
    _id: string;
    eventType: string;
    user?: string;
    ipAddress: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
    details: any;
    resolved: boolean;
  }>;
  failedLogins: Array<{
    _id: string;
    email: string;
    ipAddress: string;
    timestamp: string;
    attempts: number;
  }>;
  summary: {
    totalEvents: number;
    criticalEvents: number;
    resolvedEvents: number;
    pendingEvents: number;
  };
}

class AuditorService {
  /**
   * Get comprehensive auditor dashboard data
   * Since there's no single endpoint, we'll aggregate data from multiple sources
   */
  async getDashboardData(): Promise<AuditorDashboardData> {
    try {
      // For now, we'll create a mock dashboard based on available audit endpoints
      // In a real implementation, this would aggregate data from multiple audit endpoints
      
      const mockData: AuditorDashboardData = {
        auditor: {
          _id: 'current-auditor',
          firstname: 'System',
          lastname: 'Auditor',
          email: 'auditor@smart-s.com',
          roles: ['Auditor']
        },
        auditStats: {
          totalAuditEntries: 2847,
          criticalIssues: 3,
          complianceScore: 94,
          securityScore: 87,
          financialIntegrityScore: 96,
          recentAuditsCount: 156
        },
        recentAudits: [
          {
            _id: '1',
            action: 'Payment processed without proper authorization',
            user: 'bursar@school.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            severity: 'high',
            module: 'Payment',
            details: 'Large payment processed outside normal hours'
          },
          {
            _id: '2',
            action: 'Multiple failed login attempts detected',
            user: 'unknown@external.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            severity: 'medium',
            module: 'Security',
            details: 'IP address blocked after 5 failed attempts'
          }
        ],
        financialIntegrity: {
          score: 96,
          issues: ['Minor reconciliation variance in Term 2 fees'],
          totalTransactions: 1234,
          flaggedTransactions: 5,
          reconciliationStatus: 'good'
        },
        securityMetrics: {
          failedLogins: 23,
          suspiciousActivities: 7,
          blockedIPs: 12,
          activeTokens: 456
        },
        complianceMetrics: {
          dataRetentionCompliance: 98,
          accessControlCompliance: 92,
          auditTrailCompliance: 95,
          overallCompliance: 94
        }
      };

      return mockData;
    } catch (error) {
      console.error('Error fetching auditor dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get user audit trail
   */
  async getUserAuditTrail(userId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    module?: string;
    riskLevel?: string;
  }): Promise<UserAuditTrail> {
    try {
      const response = await apiService.get(`/audit/users/${userId}/activities`, {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user audit trail:', error);
      throw error;
    }
  }

  /**
   * Get financial audit data
   */
  async getFinancialAuditData(filters?: {
    schoolId?: string;
    sessionId?: string;
    termId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<FinancialAuditData> {
    try {
      const response = await apiService.get('/audit/financial/transactions', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial audit data:', error);
      throw error;
    }
  }

  /**
   * Get security audit data
   */
  async getSecurityAuditData(filters?: {
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
    suspiciousOnly?: boolean;
  }): Promise<SecurityAuditData> {
    try {
      const response = await apiService.get('/audit/security/events', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching security audit data:', error);
      throw error;
    }
  }

  /**
   * Get severity color for UI
   */
  getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get compliance score color
   */
  getComplianceColor(score: number): string {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-blue-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Format relative time
   */
  formatRelativeTime(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return past.toLocaleDateString();
  }

  /**
   * Get audit module color
   */
  getModuleColor(module: string): string {
    switch (module.toLowerCase()) {
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'security':
        return 'text-red-600 bg-red-100';
      case 'user':
        return 'text-blue-600 bg-blue-100';
      case 'academic':
        return 'text-purple-600 bg-purple-100';
      case 'system':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export const auditorService = new AuditorService();
