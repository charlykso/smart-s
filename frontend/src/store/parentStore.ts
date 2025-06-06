import { create } from 'zustand';
import { parentService, type ParentDashboardData, type ChildDetails, type PaymentHistory } from '../services/parentService';

interface ParentState {
  // Dashboard data
  dashboardData: ParentDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Child details
  childDetails: { [childId: string]: ChildDetails };
  childDetailsLoading: { [childId: string]: boolean };
  childDetailsError: { [childId: string]: string | null };

  // Payment history
  paymentHistory: PaymentHistory | null;
  paymentHistoryLoading: boolean;
  paymentHistoryError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchChildDetails: (childId: string) => Promise<void>;
  fetchPaymentHistory: (params?: {
    startDate?: string;
    endDate?: string;
    childId?: string;
    status?: string;
  }) => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
}

export const useParentStore = create<ParentState>((set, get) => ({
  // Initial state
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  childDetails: {},
  childDetailsLoading: {},
  childDetailsError: {},

  paymentHistory: null,
  paymentHistoryLoading: false,
  paymentHistoryError: null,

  // Actions
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    
    try {
      const data = await parentService.getDashboardData();
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

  fetchChildDetails: async (childId: string) => {
    const currentState = get();
    set({ 
      childDetailsLoading: { 
        ...currentState.childDetailsLoading, 
        [childId]: true 
      },
      childDetailsError: { 
        ...currentState.childDetailsError, 
        [childId]: null 
      }
    });
    
    try {
      const data = await parentService.getChildDetails(childId);
      const currentState = get();
      set({ 
        childDetails: { 
          ...currentState.childDetails, 
          [childId]: data 
        },
        childDetailsLoading: { 
          ...currentState.childDetailsLoading, 
          [childId]: false 
        },
        childDetailsError: { 
          ...currentState.childDetailsError, 
          [childId]: null 
        }
      });
    } catch (error) {
      const currentState = get();
      set({ 
        childDetailsLoading: { 
          ...currentState.childDetailsLoading, 
          [childId]: false 
        },
        childDetailsError: { 
          ...currentState.childDetailsError, 
          [childId]: error instanceof Error ? error.message : 'Failed to fetch child details'
        }
      });
    }
  },

  fetchPaymentHistory: async (params) => {
    set({ paymentHistoryLoading: true, paymentHistoryError: null });
    
    try {
      const data = await parentService.getPaymentHistory(params);
      set({ 
        paymentHistory: data,
        paymentHistoryLoading: false,
        paymentHistoryError: null 
      });
    } catch (error) {
      set({ 
        paymentHistoryLoading: false,
        paymentHistoryError: error instanceof Error ? error.message : 'Failed to fetch payment history'
      });
    }
  },

  clearErrors: () => {
    set({
      dashboardError: null,
      childDetailsError: {},
      paymentHistoryError: null,
    });
  },

  reset: () => {
    set({
      dashboardData: null,
      dashboardLoading: false,
      dashboardError: null,
      childDetails: {},
      childDetailsLoading: {},
      childDetailsError: {},
      paymentHistory: null,
      paymentHistoryLoading: false,
      paymentHistoryError: null,
    });
  },
}));
