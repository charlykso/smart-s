import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import type {
  Expense,
  ExpenseFilters,
  CreateExpenseData,
  UpdateExpenseData,
  ExpenseSummaryRow,
  ExpensePayment,
  RecordExpensePaymentData,
} from '../types/expense';
import type { ApiResponse } from '../types';

const buildQueryString = (filters?: ExpenseFilters): string => {
  if (!filters) {
    return '';
  }

  const params = new URLSearchParams();

  if (filters.schoolId) params.append('schoolId', filters.schoolId);
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);
  if (filters.month) params.append('month', filters.month);
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);

  const includeTotals = filters.includeTotals ?? true;
  if (includeTotals) {
    params.append('includeTotals', 'true');
  }

  return params.toString();
};

export class ExpenseService {
  static async getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
    const query = buildQueryString(filters ?? { includeTotals: true });
    const endpoint = query
      ? `${API_ENDPOINTS.EXPENSES.ALL}?${query}`
      : `${API_ENDPOINTS.EXPENSES.ALL}?includeTotals=true`;

    const response = await ApiService.get<ApiResponse<Expense[]>>(endpoint);
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to load expenses');
    }
    return response.data || [];
  }

  static async getExpense(id: string): Promise<Expense> {
    const endpoint = API_ENDPOINTS.EXPENSES.BY_ID.replace(':id', id);
    const response = await ApiService.get<ApiResponse<Expense>>(endpoint);
    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'Failed to load expense');
    }
    return response.data;
  }

  static async createExpense(data: CreateExpenseData): Promise<Expense> {
    const response = await ApiService.post<ApiResponse<Expense>>(API_ENDPOINTS.EXPENSES.CREATE, data);
    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'Failed to create expense');
    }
    return response.data;
  }

  static async updateExpense(data: UpdateExpenseData): Promise<Expense> {
    const endpoint = API_ENDPOINTS.EXPENSES.UPDATE.replace(':id', data._id);
    const response = await ApiService.put<ApiResponse<Expense>>(endpoint, data);
    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'Failed to update expense');
    }
    return response.data;
  }

  static async deleteExpense(id: string): Promise<void> {
    const endpoint = API_ENDPOINTS.EXPENSES.DELETE.replace(':id', id);
    const response = await ApiService.delete<ApiResponse>(endpoint);
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to delete expense');
    }
  }

  static async approveExpense(id: string): Promise<Expense> {
    const endpoint = API_ENDPOINTS.EXPENSES.APPROVE.replace(':id', id);
    const response = await ApiService.post<ApiResponse<Expense>>(endpoint, {});
    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'Failed to approve expense');
    }
    return response.data;
  }

  static async rejectExpense(id: string, reason?: string): Promise<Expense> {
    const endpoint = API_ENDPOINTS.EXPENSES.REJECT.replace(':id', id);
    const response = await ApiService.post<ApiResponse<Expense>>(endpoint, { reason });
    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'Failed to reject expense');
    }
    return response.data;
  }

  static async getSummary(filters?: ExpenseFilters): Promise<ExpenseSummaryRow[]> {
    const query = buildQueryString(filters);
    const endpoint = query ? `${API_ENDPOINTS.EXPENSES.SUMMARY}?${query}` : API_ENDPOINTS.EXPENSES.SUMMARY;
    const response = await ApiService.get<ApiResponse<ExpenseSummaryRow[]>>(endpoint);
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to load expense summary');
    }
    return response.data || [];
  }

  static async exportExpenses(filters?: ExpenseFilters): Promise<void> {
    const params = buildQueryString(filters);
    const endpoint = params ? `${API_ENDPOINTS.EXPENSES.EXPORT}?${params}` : API_ENDPOINTS.EXPENSES.EXPORT;
    await ApiService.downloadFile(endpoint, 'expenses-report.pdf');
  }

  static async getPayments(expenseId?: string): Promise<ExpensePayment[]> {
    const endpoint = expenseId
      ? API_ENDPOINTS.EXPENSE_PAYMENTS.BY_EXPENSE.replace(':expenseId', expenseId)
      : API_ENDPOINTS.EXPENSE_PAYMENTS.ALL;
    const response = await ApiService.get<ApiResponse<ExpensePayment[]>>(endpoint);
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to load payments');
    }
    return response.data || [];
  }

  static async recordPayment(
    expenseId: string,
    data: RecordExpensePaymentData,
  ): Promise<{ payment: ExpensePayment; totals: { totalPaid: number; balance: number } }> {
    const endpoint = API_ENDPOINTS.EXPENSE_PAYMENTS.CREATE.replace(':expenseId', expenseId);
    const formData = new FormData();

    formData.append('payeeType', data.payeeType);
    if (data.payeeId) formData.append('payeeId', data.payeeId);
    formData.append('payeeName', data.payeeName);
    if (data.paymentDate) formData.append('paymentDate', data.paymentDate);
    formData.append('amountPaid', String(data.amountPaid));
    if (data.currency) formData.append('currency', data.currency);
    formData.append('paymentMethod', data.paymentMethod);
    if (data.transactionReference) formData.append('transactionReference', data.transactionReference);
    if (data.periodCovered) formData.append('periodCovered', data.periodCovered);
    if (data.notes) formData.append('notes', data.notes);
    if (typeof data.allowances === 'number') formData.append('allowances', String(data.allowances));
    if (typeof data.deductions === 'number') formData.append('deductions', String(data.deductions));
    formData.append('receipt', data.receipt);

  const response = await ApiService.postFormData<ApiResponse<{ payment: ExpensePayment; totals: { totalPaid: number; balance: number } }>>(endpoint, formData);

    if (!response?.success || !response.data) {
      throw new Error(response?.message || 'Failed to record payment');
    }

    return response.data;
  }

  static async deletePayment(paymentId: string): Promise<{ totalPaid: number; balance: number }> {
    const endpoint = API_ENDPOINTS.EXPENSE_PAYMENTS.DELETE.replace(':id', paymentId);
    const response = await ApiService.delete<ApiResponse<{ totals?: { totalPaid: number; balance: number } }>>(endpoint);
    if (!response?.success) {
      throw new Error(response?.message || 'Failed to delete payment');
    }
    return response.data?.totals || { totalPaid: 0, balance: 0 };
  }
}
