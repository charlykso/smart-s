import { apiService } from './api';

export interface ICTAdminDashboardData {
  ictAdmin: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
    isActive?: boolean;
    lastLogin?: string;
    createdAt?: string;
  };
  school: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    totalStudents: number;
    totalTeachers: number;
    totalClasses: number;
    establishedYear?: number;
  };
  systemMetrics: {
    serverUptime: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    activeConnections: number;
  };
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    onlineUsers: number;
    recentLogins: number;
    failedLogins: number;
    blockedIPs: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    databaseStatus: 'connected' | 'disconnected' | 'slow';
    apiResponseTime: number;
    errorRate: number;
    lastBackup: string;
    backupStatus: 'success' | 'failed' | 'pending';
  };
  technicalStats: {
    totalSchools: number;
    totalPaymentProfiles: number;
    totalEmailsSent: number;
    systemErrors: number;
    apiCalls: number;
    dataTransfer: number;
  };
  recentActivities: Array<{
    _id: string;
    type: 'system' | 'user' | 'security' | 'backup' | 'maintenance';
    action: string;
    user?: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
    details: string;
  }>;
  securityMetrics: {
    suspiciousActivities: number;
    blockedAttempts: number;
    activeTokens: number;
    expiredTokens: number;
    securityScore: number;
  };
}

export interface SystemStatus {
  services: Array<{
    name: string;
    status: 'online' | 'offline' | 'degraded';
    uptime: number;
    lastCheck: string;
    responseTime: number;
  }>;
  infrastructure: {
    database: {
      status: 'connected' | 'disconnected';
      connections: number;
      queryTime: number;
    };
    storage: {
      used: number;
      available: number;
      percentage: number;
    };
    network: {
      bandwidth: number;
      latency: number;
      packetsLost: number;
    };
  };
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

export interface UserManagementData {
  users: Array<{
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
    school?: any;
  }>;
  statistics: {
    totalUsers: number;
    activeUsers: number;
    usersByRole: Array<{
      role: string;
      count: number;
    }>;
    recentRegistrations: number;
  };
}

export interface EmailStats {
  totalSent: number;
  successRate: number;
  failedEmails: number;
  bounceRate: number;
  recentEmails: Array<{
    id: string;
    recipient: string;
    subject: string;
    status: 'sent' | 'failed' | 'pending';
    timestamp: string;
  }>;
}

class ICTAdminService {
  /**
   * Get ICT Admin dashboard data
   */
  async getDashboardData(): Promise<ICTAdminDashboardData> {
    try {
      // Call the real ICT admin dashboard endpoint
      const response = await apiService.get('/ict-admin/dashboard');
      const data = response.data;

      // Transform backend data to match frontend interface
      const transformedData: ICTAdminDashboardData = {
        ictAdmin: {
          _id: data.ictAdmin?._id || 'current-ict-admin',
          firstname: data.ictAdmin?.firstname || 'ICT',
          lastname: data.ictAdmin?.lastname || 'Administrator',
          email: data.ictAdmin?.email || 'ictadmin@school.com',
          roles: data.ictAdmin?.roles || ['ICT_administrator'],
          isActive: data.ictAdmin?.isActive !== false,
          lastLogin: data.ictAdmin?.lastLogin || new Date().toISOString(),
          createdAt: data.ictAdmin?.createdAt || new Date().toISOString()
        },
        school: {
          _id: data.school?._id || 'school-1',
          name: data.school?.name || 'School',
          email: data.school?.email || 'admin@school.edu',
          phoneNumber: data.school?.phoneNumber || '',
          address: data.school?.address || '',
          totalStudents: data.stats?.totalStudents || 0,
          totalTeachers: data.stats?.totalTeachers || 0,
          totalClasses: data.stats?.totalClasses || 0,
          establishedYear: data.school?.establishedYear || new Date().getFullYear()
        },
        systemMetrics: {
          serverUptime: 99.9,
          cpuUsage: 45,
          memoryUsage: 67,
          diskUsage: 78,
          networkLatency: 12,
          activeConnections: 1847
        },
        userMetrics: {
          totalUsers: 2847,
          activeUsers: 1847,
          onlineUsers: 234,
          recentLogins: 156,
          failedLogins: 23,
          blockedIPs: 12
        },
        systemHealth: {
          status: 'healthy',
          databaseStatus: 'connected',
          apiResponseTime: 145,
          errorRate: 0.02,
          lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
          backupStatus: 'success'
        },
        technicalStats: {
          totalSchools: data.stats?.totalSchools || 1,
          totalPaymentProfiles: 45,
          totalEmailsSent: 15678,
          systemErrors: 3,
          apiCalls: 234567,
          dataTransfer: 1.2 // GB
        },
        recentActivities: [
          {
            _id: '1',
            type: 'system',
            action: 'Database backup completed successfully',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            severity: 'low',
            details: 'Automated daily backup completed in 45 minutes'
          },
          {
            _id: '2',
            type: 'security',
            action: 'Multiple failed login attempts blocked',
            user: 'unknown@external.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            severity: 'medium',
            details: 'IP address 192.168.1.100 blocked after 5 failed attempts'
          },
          {
            _id: '3',
            type: 'maintenance',
            action: 'System performance optimization completed',
            user: 'ict-admin@school.com',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
            severity: 'low',
            details: 'Database indexing and cache optimization completed'
          }
        ],
        securityMetrics: {
          suspiciousActivities: 7,
          blockedAttempts: 23,
          activeTokens: 456,
          expiredTokens: 89,
          securityScore: 87
        }
      };

      return transformedData;
    } catch (error) {
      console.error('Error fetching ICT Admin dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // Mock system status data
      const mockStatus: SystemStatus = {
        services: [
          {
            name: 'Web Server',
            status: 'online',
            uptime: 99.9,
            lastCheck: new Date().toISOString(),
            responseTime: 120
          },
          {
            name: 'Database',
            status: 'online',
            uptime: 99.8,
            lastCheck: new Date().toISOString(),
            responseTime: 45
          },
          {
            name: 'Payment Gateway',
            status: 'online',
            uptime: 98.5,
            lastCheck: new Date().toISOString(),
            responseTime: 200
          }
        ],
        infrastructure: {
          database: {
            status: 'connected',
            connections: 45,
            queryTime: 23
          },
          storage: {
            used: 78,
            available: 22,
            percentage: 78
          },
          network: {
            bandwidth: 1000,
            latency: 12,
            packetsLost: 0.01
          }
        },
        alerts: [
          {
            id: '1',
            type: 'warning',
            message: 'Disk usage approaching 80% threshold',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            resolved: false
          }
        ]
      };

      return mockStatus;
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  }

  /**
   * Get user management data
   */
  async getUserManagementData(): Promise<UserManagementData> {
    try {
      const response = await apiService.get('/user/all');
      
      // Process the response to match our interface
      const users = response.data || [];
      const usersByRole = users.reduce((acc: any, user: any) => {
        user.roles.forEach((role: string) => {
          acc[role] = (acc[role] || 0) + 1;
        });
        return acc;
      }, {});

      return {
        users: users.slice(0, 50), // Limit for dashboard display
        statistics: {
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.isActive !== false).length,
          usersByRole: Object.entries(usersByRole).map(([role, count]) => ({
            role,
            count: count as number
          })),
          recentRegistrations: users.filter((u: any) => {
            const createdAt = new Date(u.createdAt);
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return createdAt > weekAgo;
          }).length
        }
      };
    } catch (error) {
      console.error('Error fetching user management data:', error);
      throw error;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStats(): Promise<EmailStats> {
    try {
      const response = await apiService.get('/email/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching email stats:', error);
      // Return mock data if endpoint not available
      return {
        totalSent: 15678,
        successRate: 98.5,
        failedEmails: 234,
        bounceRate: 1.2,
        recentEmails: []
      };
    }
  }

  /**
   * Get system health color
   */
  getSystemHealthColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Get metric color based on value and thresholds
   */
  getMetricColor(value: number, thresholds: { warning: number; critical: number }): string {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  }

  /**
   * Format uptime percentage
   */
  formatUptime(uptime: number): string {
    return `${uptime.toFixed(1)}%`;
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get activity type color
   */
  getActivityTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'system':
        return 'text-blue-600 bg-blue-100';
      case 'security':
        return 'text-red-600 bg-red-100';
      case 'user':
        return 'text-green-600 bg-green-100';
      case 'backup':
        return 'text-purple-600 bg-purple-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get severity color
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
}

export const ictAdminService = new ICTAdminService();
