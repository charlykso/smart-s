import { create } from 'zustand';
import { bursarService, type BursarDashboardData, type PaymentReport, type OutstandingFeesReport } from '../services/bursarService';

interface BursarState {
  // Dashboard data
  dashboardData: BursarDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Payment reports
  paymentReports: PaymentReport[];
  paymentReportsLoading: boolean;
  paymentReportsError: string | null;
  paymentReportsSummary: {
    totalAmount: number;
    totalTransactions: number;
    averageAmount: number;
  } | null;

  // Outstanding fees report
  outstandingFeesReport: OutstandingFeesReport[];
  outstandingFeesLoading: boolean;
  outstandingFeesError: string | null;
  outstandingFeesSummary: {
    totalStudents: number;
    studentsWithOutstanding: number;
    totalOutstandingAmount: number;
  } | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchPaymentReports: (params?: {
    startDate?: string;
    endDate?: string;
    feeType?: string;
    paymentMethod?: string;
  }) => Promise<void>;
  fetchOutstandingFeesReport: () => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
}

export const useBursarStore = create<BursarState>((set, get) => ({
  // Initial state
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  paymentReports: [],
  paymentReportsLoading: false,
  paymentReportsError: null,
  paymentReportsSummary: null,

  outstandingFeesReport: [],
  outstandingFeesLoading: false,
  outstandingFeesError: null,
  outstandingFeesSummary: null,

  // Actions
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    
    try {
      const data = await bursarService.getDashboardData();
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

  fetchPaymentReports: async (params) => {
    set({ paymentReportsLoading: true, paymentReportsError: null });
    
    try {
      const response = await bursarService.getPaymentReports(params);
      set({ 
        paymentReports: response.payments,
        paymentReportsSummary: response.summary,
        paymentReportsLoading: false,
        paymentReportsError: null 
      });
    } catch (error) {
      set({ 
        paymentReportsLoading: false,
        paymentReportsError: error instanceof Error ? error.message : 'Failed to fetch payment reports'
      });
    }
  },

  fetchOutstandingFeesReport: async () => {
    set({ outstandingFeesLoading: true, outstandingFeesError: null });
    
    try {
      const response = await bursarService.getOutstandingFeesReport();
      set({ 
        outstandingFeesReport: response.outstandingReport,
        outstandingFeesSummary: response.summary,
        outstandingFeesLoading: false,
        outstandingFeesError: null 
      });
    } catch (error) {
      set({ 
        outstandingFeesLoading: false,
        outstandingFeesError: error instanceof Error ? error.message : 'Failed to fetch outstanding fees report'
      });
    }
  },

  clearErrors: () => {
    set({
      dashboardError: null,
      paymentReportsError: null,
      outstandingFeesError: null,
    });
  },

  reset: () => {
    set({
      dashboardData: null,
      dashboardLoading: false,
      dashboardError: null,
      paymentReports: [],
      paymentReportsLoading: false,
      paymentReportsError: null,
      paymentReportsSummary: null,
      outstandingFeesReport: [],
      outstandingFeesLoading: false,
      outstandingFeesError: null,
      outstandingFeesSummary: null,
    });
  },
}));
