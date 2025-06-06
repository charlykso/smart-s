import { ApiService } from './api';
import type { Activity } from '../components/dashboard/widgets/RecentActivityCard';

export interface DashboardStats {
  totalStudents?: number;
  totalRevenue?: number;
  pendingPayments?: number;
  collectionRate?: number;
  totalSchools?: number;
  totalUsers?: number;
  systemHealth?: number;
  serverUptime?: number;
  activeUsers?: number;
  systemLoad?: number;
  securityScore?: number;
  outstandingFees?: number;
  academicProgress?: number;
  attendanceRate?: number;
  assignments?: {
    completed: number;
    total: number;
  };
}

export interface SystemStatus {
  status: 'online' | 'offline' | 'maintenance';
  uptime: string;
  lastCheck: Date;
  services: {
    database: 'online' | 'offline';
    paymentGateway: 'online' | 'offline';
    emailService: 'online' | 'offline';
    fileStorage: 'online' | 'offline';
  };
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  userId?: string;
  actionUrl?: string;
}

export class DashboardService {
  // Get dashboard statistics based on user role
  static async getDashboardStats(role: string): Promise<DashboardStats> {
    return ApiService.get<DashboardStats>(`/dashboard/stats?role=${role}`);
  }

  // Get recent activities for dashboard
  static async getRecentActivities(limit: number = 10, role?: string): Promise<Activity[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (role) params.append('role', role);

    return ApiService.get<Activity[]>(`/dashboard/activities?${params.toString()}`);
  }

  // Get system status (for admin/ICT admin)
  static async getSystemStatus(): Promise<SystemStatus> {
    return ApiService.get<SystemStatus>('/dashboard/system-status');
  }

  // Get notifications for user
  static async getNotifications(limit: number = 10): Promise<NotificationData[]> {
    return ApiService.get<NotificationData[]>(`/notifications?limit=${limit}`);
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    return ApiService.post(`/notifications/${notificationId}/mark-read`);
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(): Promise<void> {
    return ApiService.post('/notifications/mark-all-read');
  }

  // Get financial summary (for bursar, principal, admin)
  static async getFinancialSummary(): Promise<{
    totalRevenue: number;
    totalExpected: number;
    collectionRate: number;
    outstandingAmount: number;
    recentPayments: Array<{
      id: string;
      amount: number;
      studentName: string;
      date: Date;
      status: string;
    }>;
  }> {
    return ApiService.get('/dashboard/financial-summary');
  }

  // Get academic summary (for headteacher, principal)
  static async getAcademicSummary(): Promise<{
    totalStudents: number;
    averagePerformance: number;
    attendanceRate: number;
    upcomingExams: number;
    recentResults: Array<{
      examName: string;
      averageScore: number;
      date: Date;
    }>;
  }> {
    return ApiService.get('/dashboard/academic-summary');
  }

  // Get student dashboard data
  static async getStudentDashboard(): Promise<{
    outstandingFees: number;
    academicProgress: number;
    attendanceRate: number;
    assignments: {
      completed: number;
      total: number;
      upcoming: Array<{
        subject: string;
        title: string;
        dueDate: Date;
      }>;
    };
    recentPayments: Array<{
      amount: number;
      date: Date;
      description: string;
    }>;
  }> {
    return ApiService.get('/dashboard/student');
  }

  // Get parent dashboard data
  static async getParentDashboard(studentId?: string): Promise<{
    children: Array<{
      id: string;
      name: string;
      class: string;
      outstandingFees: number;
      academicProgress: number;
      attendanceRate: number;
    }>;
    totalOutstandingFees: number;
    upcomingEvents: Array<{
      title: string;
      date: Date;
      type: string;
    }>;
  }> {
    const params = studentId ? `?studentId=${studentId}` : '';
    return ApiService.get(`/dashboard/parent${params}`);
  }

  // Get audit dashboard data (for auditor)
  static async getAuditDashboard(): Promise<{
    totalAuditEntries: number;
    criticalIssues: number;
    complianceScore: number;
    recentAudits: Array<{
      id: string;
      action: string;
      user: string;
      timestamp: Date;
      severity: 'low' | 'medium' | 'high';
    }>;
    financialIntegrity: {
      score: number;
      issues: string[];
    };
  }> {
    return ApiService.get('/dashboard/audit');
  }

  // Get quick actions based on user role
  static async getQuickActions(role: string): Promise<Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    url: string;
    color: string;
    enabled: boolean;
  }>> {
    return ApiService.get(`/dashboard/quick-actions?role=${role}`);
  }

  // Execute quick action
  static async executeQuickAction(actionId: string, data?: any): Promise<any> {
    return ApiService.post(`/dashboard/quick-actions/${actionId}/execute`, data);
  }
}

export default DashboardService;
