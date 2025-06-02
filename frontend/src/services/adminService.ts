import { apiService } from './api';

export interface AdminDashboardData {
  admin: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
  };
  statistics: {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalSchools: number;
    totalPayments: number;
    totalRevenue: number;
    pendingPayments: number;
  };
  recentActivities: {
    users: Array<{
      _id: string;
      firstname: string;
      lastname: string;
      email: string;
      roles: string[];
      createdAt: string;
    }>;
    payments: Array<{
      _id: string;
      amount: number;
      user: {
        firstname: string;
        lastname: string;
        regNo?: string;
      };
      fee: {
        name: string;
      };
      status: string;
      trans_date: string;
    }>;
  };
  analytics: {
    monthlyRevenue: Array<{
      _id: string;
      total: number;
      count: number;
    }>;
    usersByRole: Array<{
      _id: string;
      count: number;
    }>;
  };
}

export interface SystemOverview {
  systemHealth: {
    status: string;
    uptime: number;
    lastCheck: string;
  };
  serverMetrics: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
  databaseStats: {
    totalCollections: number;
    totalDocuments: number;
    indexCount: number;
  };
  securityMetrics: {
    failedLogins: number;
    suspiciousActivities: number;
    activeTokens: number;
  };
}

export interface UserManagement {
  users: Array<{
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
  }>;
  userStats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Array<{
      role: string;
      count: number;
    }>;
  };
}

export interface FinancialOverview {
  paymentStats: Array<{
    _id: string;
    count: number;
    total: number;
  }>;
  dailyRevenue: Array<{
    _id: string;
    revenue: number;
    count: number;
  }>;
  summary: {
    totalRevenue: number;
    successfulPayments: number;
    pendingPayments: number;
    failedPayments: number;
  };
}

class AdminService {
  /**
   * Get admin dashboard data
   */
  async getDashboardData(): Promise<AdminDashboardData> {
    try {
      const response = await apiService.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get system overview data
   */
  async getSystemOverview(): Promise<SystemOverview> {
    try {
      const response = await apiService.get('/admin/system-overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching system overview:', error);
      throw error;
    }
  }

  /**
   * Get user management data
   */
  async getUserManagement(): Promise<UserManagement> {
    try {
      const response = await apiService.get('/admin/user-management');
      return response.data;
    } catch (error) {
      console.error('Error fetching user management data:', error);
      throw error;
    }
  }

  /**
   * Get financial overview
   */
  async getFinancialOverview(period: string = '30'): Promise<FinancialOverview> {
    try {
      const response = await apiService.get('/admin/financial-overview', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      throw error;
    }
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate growth percentage
   */
  calculateGrowth(current: number, previous: number): {
    percentage: number;
    isPositive: boolean;
  } {
    if (previous === 0) return { percentage: 0, isPositive: true };
    
    const growth = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(Math.round(growth)),
      isPositive: growth >= 0
    };
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
   * Get user role color
   */
  getUserRoleColor(role: string): string {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'text-red-600 bg-red-100';
      case 'principal':
        return 'text-blue-600 bg-blue-100';
      case 'teacher':
        return 'text-green-600 bg-green-100';
      case 'student':
        return 'text-purple-600 bg-purple-100';
      case 'parent':
        return 'text-pink-600 bg-pink-100';
      case 'bursar':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
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
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Format uptime
   */
  formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  /**
   * Get metric color based on value and thresholds
   */
  getMetricColor(value: number, thresholds: { warning: number; critical: number }): string {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  }
}

export const adminService = new AdminService();
