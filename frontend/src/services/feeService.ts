import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse } from '../types';
import type {
  Fee,
  Payment,
  PaymentProfile,
  PaymentMethodConfig,
  CreateFeeData,
  UpdateFeeData,
  InitiatePaymentData,
  CashPaymentData,
  CreatePaymentProfileData,
  FeeStats,
  PaymentStats,
} from '../types/fee';

export class FeeService {
  // Fee Management
  static async getFees(): Promise<Fee[]> {
    const response = await ApiService.get<Fee[]>(API_ENDPOINTS.FEES.ALL);
    return response || [];
  }

  static async getFee(id: string): Promise<Fee> {
    const response = await ApiService.get<Fee>(`${API_ENDPOINTS.FEES.BY_ID}/${id}`);
    if (!response) {
      throw new Error('Fee not found');
    }
    return response;
  }

  static async getFeesByTerm(termId: string): Promise<Fee[]> {
    const response = await ApiService.get<Fee[]>(`${API_ENDPOINTS.FEES.BY_TERM}/${termId}`);
    return response || [];
  }

  static async getApprovedFees(schoolId?: string): Promise<Fee[]> {
    // For students, use the student-specific endpoint
    // For other users, use the general approved fees endpoint
    const response = await ApiService.get<Fee[]>(API_ENDPOINTS.FEES.STUDENT_APPROVED_FEES);
    return response || [];
  }

  static async getUnapprovedFees(): Promise<Fee[]> {
    const response = await ApiService.get<Fee[]>(API_ENDPOINTS.FEES.UNAPPROVED);
    return response || [];
  }

  static async getApprovedFeesByTerm(termId: string): Promise<Fee[]> {
    const endpoint = API_ENDPOINTS.FEES.APPROVED_BY_TERM.replace(':term_id', termId);
    const response = await ApiService.get<Fee[]>(endpoint);
    return response || [];
  }

  static async getUnapprovedFeesByTerm(termId: string): Promise<Fee[]> {
    const endpoint = API_ENDPOINTS.FEES.UNAPPROVED_BY_TERM.replace(':term_id', termId);
    const response = await ApiService.get<Fee[]>(endpoint);
    return response || [];
  }

  static async createFee(data: CreateFeeData): Promise<Fee> {
    const response = await ApiService.post<ApiResponse<Fee>>(
      API_ENDPOINTS.FEES.CREATE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create fee');
    }
    
    return response.data!;
  }

  static async updateFee(data: UpdateFeeData): Promise<Fee> {
    const endpoint = API_ENDPOINTS.FEES.UPDATE.replace(':id', data._id);
    const response = await ApiService.put<Fee>(endpoint, data);

    // Backend returns the fee directly, not wrapped in ApiResponse
    return response;
  }

  static async deleteFee(id: string): Promise<void> {
    const endpoint = API_ENDPOINTS.FEES.DELETE.replace(':id', id);
    const response = await ApiService.delete<ApiResponse>(endpoint);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete fee');
    }
  }

  static async approveFee(feeId: string): Promise<void> {
    const endpoint = API_ENDPOINTS.FEES.APPROVE.replace(':fee_id', feeId);
    const response = await ApiService.put<ApiResponse>(endpoint, { isApproved: true });
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to approve fee');
    }
  }

  // Payment Management
  static async getPayments(): Promise<Payment[]> {
    const response = await ApiService.get<Payment[]>(API_ENDPOINTS.PAYMENTS.ALL);
    return response || [];
  }

  static async initiatePayment(data: InitiatePaymentData): Promise<{ paymentUrl?: string; message: string }> {
    const response = await ApiService.post<ApiResponse<{ paymentUrl?: string; message: string }>>(
      API_ENDPOINTS.PAYMENTS.INITIATE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to initiate payment');
    }
    
    return response.data!;
  }

  static async processCashPayment(data: CashPaymentData): Promise<Payment> {
    const response = await ApiService.post<ApiResponse<Payment>>(
      API_ENDPOINTS.PAYMENTS.CASH,
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to process cash payment');
    }

    return response.data!;
  }

  static async getAvailablePaymentMethods(schoolId: string): Promise<PaymentMethodConfig[]> {
    const response = await ApiService.get<ApiResponse<PaymentMethodConfig[]>>(
      `${API_ENDPOINTS.PAYMENTS.AVAILABLE_METHODS}/${schoolId}`
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to get available payment methods');
    }

    return response.data!;
  }

  // Student-specific method to get approved fees
  static async getStudentApprovedFees(): Promise<Fee[]> {
    const response = await ApiService.get<{ success: boolean; data: Fee[]; message: string }>(
      API_ENDPOINTS.FEES.STUDENT_APPROVED_FEES
    );
    
    if (!response) {
      return [];
    }
    
    // Handle the response structure that includes success, data, and message
    if (response.success && response.data) {
      return response.data;
    }
    
    // Fallback for different response structures
    return Array.isArray(response) ? response : [];
  }

  static async getPaymentsByPaystack(): Promise<Payment[]> {
    const response = await ApiService.get<Payment[]>(API_ENDPOINTS.PAYMENTS.PAYSTACK);
    return response || [];
  }

  static async getPaymentsByBankTransfer(): Promise<Payment[]> {
    const response = await ApiService.get<Payment[]>(API_ENDPOINTS.PAYMENTS.BANK_TRANSFER);
    return response || [];
  }

  static async getPaymentsByFlutterwave(): Promise<Payment[]> {
    const response = await ApiService.get<Payment[]>(API_ENDPOINTS.PAYMENTS.FLUTTERWAVE);
    return response || [];
  }

  static async getPaymentsByCash(): Promise<Payment[]> {
    const response = await ApiService.get<Payment[]>(API_ENDPOINTS.PAYMENTS.CASH_PAYMENTS);
    return response || [];
  }

  // Payment Profile Management
  static async getPaymentProfiles(): Promise<PaymentProfile[]> {
    const response = await ApiService.get<ApiResponse<PaymentProfile[]>>(API_ENDPOINTS.PAYMENT_PROFILES.ALL);

    if (!response.success) {
      throw new Error(response.message || 'Failed to get payment profiles');
    }

    return response.data || [];
  }

  static async getPaymentProfilesForSchool(schoolId: string): Promise<PaymentProfile[]> {
    const response = await ApiService.get<ApiResponse<PaymentProfile[]>>(`/paymentProfile/all/${schoolId}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to get payment profiles for school');
    }

    return response.data || [];
  }

  static async createPaymentProfile(data: CreatePaymentProfileData): Promise<PaymentProfile> {
    const response = await ApiService.post<ApiResponse<PaymentProfile>>(
      API_ENDPOINTS.PAYMENT_PROFILES.CREATE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to create payment profile');
    }
    
    return response.data!;
  }

  static async updatePaymentProfile(id: string, data: Partial<CreatePaymentProfileData>): Promise<PaymentProfile> {
    const response = await ApiService.put<ApiResponse<PaymentProfile>>(
      `${API_ENDPOINTS.PAYMENT_PROFILES.UPDATE}/${id}`,
      data
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to update payment profile');
    }

    return response.data!;
  }

  // Statistics and Analytics
  static async getFeeStats(schoolId?: string, termId?: string): Promise<FeeStats> {
    const params = new URLSearchParams();
    if (schoolId) params.append('school_id', schoolId);
    if (termId) params.append('term_id', termId);
    
    const response = await ApiService.get<FeeStats>(
      `${API_ENDPOINTS.FEES.ALL}/stats?${params.toString()}`
    );
    
    if (!response) {
      throw new Error('Failed to fetch fee statistics');
    }
    
    return response;
  }

  static async getPaymentStats(schoolId?: string, termId?: string): Promise<PaymentStats> {
    const params = new URLSearchParams();
    if (schoolId) params.append('school_id', schoolId);
    if (termId) params.append('term_id', termId);
    
    const response = await ApiService.get<PaymentStats>(
      `${API_ENDPOINTS.PAYMENTS.ALL}/stats?${params.toString()}`
    );
    
    if (!response) {
      throw new Error('Failed to fetch payment statistics');
    }
    
    return response;
  }

  // Utility Methods
  static formatAmount(amount: number | undefined | null): string {
    // Handle null, undefined, or NaN values
    if (amount == null || isNaN(amount)) {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
      }).format(0);
    }

    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  }

  static getPaymentStatusColor(status: string): string {
    switch (status) {
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

  static getPaymentMethodIcon(method: string): string {
    switch (method) {
      case 'paystack':
        return '💳';
      case 'flutterwave':
        return '🦋';
      case 'bank_transfer':
        return '🏦';
      case 'cash':
        return '💵';
      default:
        return '💰';
    }
  }

  static getFeeTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'tuition':
        return 'text-blue-600 bg-blue-100';
      case 'development':
        return 'text-green-600 bg-green-100';
      case 'sports':
        return 'text-orange-600 bg-orange-100';
      case 'library':
        return 'text-purple-600 bg-purple-100';
      case 'laboratory':
        return 'text-red-600 bg-red-100';
      case 'examination':
        return 'text-yellow-600 bg-yellow-100';
      case 'uniform':
        return 'text-indigo-600 bg-indigo-100';
      case 'transport':
        return 'text-cyan-600 bg-cyan-100';
      case 'feeding':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  static calculateInstallmentAmount(totalAmount: number, numberOfInstallments: number): number {
    return Math.ceil(totalAmount / numberOfInstallments);
  }

  static isInstallmentPaymentComplete(payments: Payment[], fee: Fee): boolean {
    const totalPaid = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return totalPaid >= fee.amount;
  }

  static getOutstandingAmount(payments: Payment[], fee: Fee): number {
    const totalPaid = payments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + p.amount, 0);
    
    return Math.max(0, fee.amount - totalPaid);
  }

  // Get payments for the current authenticated user (student)
  static async getStudentPayments(): Promise<Payment[]> {
    const response = await ApiService.get<ApiResponse<Payment[]>>(
      API_ENDPOINTS.PAYMENTS.STUDENT_PAYMENTS
    );

    if (!response || !response.success) {
      return [];
    }

    // The student payment endpoint returns wrapped in success/data
    return response.data || [];
  }

  // Get approved fees by school (overloaded method) - remove duplicate
  // ...existing code...
}
