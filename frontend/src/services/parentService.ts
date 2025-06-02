import { apiService } from './api';

export interface ParentDashboardData {
  parent: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
  };
  children: Array<{
    _id: string;
    firstname: string;
    lastname: string;
    regNo?: string;
    school?: any;
    classArm?: any;
  }>;
  financialSummary: Array<{
    childId: string;
    childName: string;
    totalOutstanding: number;
    totalPaid: number;
    recentPayments: Array<{
      _id: string;
      amount: number;
      fee: {
        name: string;
        amount: number;
      };
      trans_date: string;
    }>;
  }>;
  academicSummary: Array<{
    childId: string;
    childName: string;
    currentAverage: number;
    attendanceRate: number;
    position?: number;
    totalStudents?: number;
  }>;
  recentActivities: Array<{
    _id: string;
    type: string;
    description: string;
    childId: string;
    childName: string;
    date: string;
  }>;
  overallSummary: {
    totalChildren: number;
    totalOutstanding: number;
    totalPaid: number;
    averagePerformance: number;
    averageAttendance: number;
  };
}

export interface ChildDetails {
  child: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    regNo?: string;
    school?: any;
    classArm?: any;
  };
  payments: Array<{
    _id: string;
    amount: number;
    fee: {
      name: string;
      amount: number;
    };
    status: string;
    mode_of_payment: string;
    trans_date: string;
  }>;
  outstandingFees: Array<{
    _id: string;
    name: string;
    amount: number;
    type: string;
    dueDate?: string;
  }>;
  academicPerformance: {
    currentAverage: number;
    attendanceRate: number;
    position?: number;
    totalStudents?: number;
    subjects: Array<{
      name: string;
      score: number;
      grade: string;
    }>;
  };
  financialSummary: {
    totalPaid: number;
    totalOutstanding: number;
  };
}

export interface PaymentHistory {
  payments: Array<{
    _id: string;
    amount: number;
    fee: {
      name: string;
      amount: number;
    };
    child: {
      firstname: string;
      lastname: string;
      regNo?: string;
    };
    status: string;
    mode_of_payment: string;
    trans_date: string;
    trx_ref: string;
  }>;
  summary: {
    totalAmount: number;
    totalTransactions: number;
    successfulPayments: number;
    pendingPayments: number;
  };
}

class ParentService {
  /**
   * Get parent dashboard data
   */
  async getDashboardData(): Promise<ParentDashboardData> {
    try {
      const response = await apiService.get('/parent/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching parent dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get specific child details
   */
  async getChildDetails(childId: string): Promise<ChildDetails> {
    try {
      const response = await apiService.get(`/parent/child/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching child details:', error);
      throw error;
    }
  }

  /**
   * Get payment history for all children
   */
  async getPaymentHistory(params?: {
    startDate?: string;
    endDate?: string;
    childId?: string;
    status?: string;
  }): Promise<PaymentHistory> {
    try {
      const response = await apiService.get('/parent/payment-history', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
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
   * Calculate academic performance color
   */
  getPerformanceColor(average: number): string {
    if (average >= 80) return 'text-green-600';
    if (average >= 70) return 'text-blue-600';
    if (average >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Calculate attendance color
   */
  getAttendanceColor(rate: number): string {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-blue-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get payment status color for UI
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
}

export const parentService = new ParentService();
