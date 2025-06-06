import { apiService } from './api';

export interface BursarDashboardData {
  bursar: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
  };
  school: {
    _id: string;
    name: string;
    address?: any;
  } | null;
  financialStats: {
    totalRevenue: number;
    todayRevenue: number;
    thisMonthRevenue: number;
    pendingPayments: number;
    totalTransactions: number;
    outstandingAmount: number;
  };
  recentTransactions: Array<{
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
    mode_of_payment: string;
    trans_date: string;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    totalAmount: number;
    percentage: number;
  }>;
  feeCollectionStatus: Array<{
    feeId: string;
    feeName: string;
    feeAmount: number;
    expectedTotal: number;
    collectedTotal: number;
    paidStudents: number;
    totalStudents: number;
    collectionRate: number;
  }>;
}

export interface PaymentReport {
  _id: string;
  amount: number;
  user: {
    firstname: string;
    lastname: string;
    regNo?: string;
  };
  fee: {
    name: string;
    type: string;
  };
  status: string;
  mode_of_payment: string;
  trans_date: string;
  trx_ref: string;
}

export interface OutstandingFeesReport {
  student: {
    _id: string;
    name: string;
    email: string;
    regNo?: string;
  };
  outstandingFees: Array<{
    _id: string;
    name: string;
    amount: number;
    type: string;
  }>;
  totalOutstanding: number;
}

class BursarService {
  /**
   * Get bursar dashboard data
   */
  async getDashboardData(): Promise<BursarDashboardData> {
    try {
      const response = await apiService.get('/bursar/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching bursar dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get payment reports with optional filters
   */
  async getPaymentReports(params?: {
    startDate?: string;
    endDate?: string;
    feeType?: string;
    paymentMethod?: string;
  }): Promise<{
    payments: PaymentReport[];
    summary: {
      totalAmount: number;
      totalTransactions: number;
      averageAmount: number;
    };
  }> {
    try {
      const response = await apiService.get('/bursar/payment-reports', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment reports:', error);
      throw error;
    }
  }

  /**
   * Get outstanding fees report
   */
  async getOutstandingFeesReport(): Promise<{
    outstandingReport: OutstandingFeesReport[];
    summary: {
      totalStudents: number;
      studentsWithOutstanding: number;
      totalOutstandingAmount: number;
    };
  }> {
    try {
      const response = await apiService.get('/bursar/outstanding-fees-report');
      return response.data;
    } catch (error) {
      console.error('Error fetching outstanding fees report:', error);
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
   * Calculate collection rate percentage
   */
  calculateCollectionRate(collected: number, expected: number): number {
    if (expected === 0) return 0;
    return Math.round((collected / expected) * 100);
  }

  /**
   * Get payment method color for UI
   */
  getPaymentMethodColor(method: string): string {
    switch (method.toLowerCase()) {
      case 'paystack':
        return 'text-blue-600 bg-blue-50';
      case 'flutterwave':
        return 'text-orange-600 bg-orange-50';
      case 'bank_transfer':
        return 'text-green-600 bg-green-50';
      case 'cash':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
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
}

export const bursarService = new BursarService();
