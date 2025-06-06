import { create } from 'zustand';
import { studentService, type StudentDashboardData, type StudentPayment, type OutstandingFee, type AcademicSummary } from '../services/studentService';

interface StudentState {
  // Dashboard data
  dashboardData: StudentDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Payments
  payments: StudentPayment[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  paymentsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Outstanding fees
  outstandingFees: OutstandingFee[];
  outstandingFeesLoading: boolean;
  outstandingFeesError: string | null;
  totalOutstanding: number;

  // Academic summary
  academicSummary: AcademicSummary | null;
  academicSummaryLoading: boolean;
  academicSummaryError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchPayments: (params?: { page?: number; limit?: number; status?: string; term?: string }) => Promise<void>;
  fetchOutstandingFees: () => Promise<void>;
  fetchAcademicSummary: () => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
}

export const useStudentStore = create<StudentState>((set, get) => ({
  // Initial state
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  payments: [],
  paymentsLoading: false,
  paymentsError: null,
  paymentsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  outstandingFees: [],
  outstandingFeesLoading: false,
  outstandingFeesError: null,
  totalOutstanding: 0,

  academicSummary: null,
  academicSummaryLoading: false,
  academicSummaryError: null,

  // Actions
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    
    try {
      const data = await studentService.getDashboardData();
      set({ 
        dashboardData: data,
        dashboardLoading: false,
        dashboardError: null 
      });
    } catch (error) {
      set({ 
        dashboardLoading: false,
        dashboardError: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
      });
    }
  },

  fetchPayments: async (params) => {
    set({ paymentsLoading: true, paymentsError: null });
    
    try {
      const response = await studentService.getPayments(params);
      set({ 
        payments: response.payments,
        paymentsPagination: response.pagination,
        paymentsLoading: false,
        paymentsError: null 
      });
    } catch (error) {
      set({ 
        paymentsLoading: false,
        paymentsError: error instanceof Error ? error.message : 'Failed to fetch payments'
      });
    }
  },

  fetchOutstandingFees: async () => {
    set({ outstandingFeesLoading: true, outstandingFeesError: null });
    
    try {
      const response = await studentService.getOutstandingFees();
      set({ 
        outstandingFees: response.outstandingFees,
        totalOutstanding: response.totalAmount,
        outstandingFeesLoading: false,
        outstandingFeesError: null 
      });
    } catch (error) {
      set({ 
        outstandingFeesLoading: false,
        outstandingFeesError: error instanceof Error ? error.message : 'Failed to fetch outstanding fees'
      });
    }
  },

  fetchAcademicSummary: async () => {
    set({ academicSummaryLoading: true, academicSummaryError: null });
    
    try {
      const data = await studentService.getAcademicSummary();
      set({ 
        academicSummary: data,
        academicSummaryLoading: false,
        academicSummaryError: null 
      });
    } catch (error) {
      set({ 
        academicSummaryLoading: false,
        academicSummaryError: error instanceof Error ? error.message : 'Failed to fetch academic summary'
      });
    }
  },

  clearErrors: () => {
    set({
      dashboardError: null,
      paymentsError: null,
      outstandingFeesError: null,
      academicSummaryError: null,
    });
  },

  reset: () => {
    set({
      dashboardData: null,
      dashboardLoading: false,
      dashboardError: null,
      payments: [],
      paymentsLoading: false,
      paymentsError: null,
      paymentsPagination: {
        page: 1,
        limit: 10,
        total: 0,
        pages: 0,
      },
      outstandingFees: [],
      outstandingFeesLoading: false,
      outstandingFeesError: null,
      totalOutstanding: 0,
      academicSummary: null,
      academicSummaryLoading: false,
      academicSummaryError: null,
    });
  },
}));
