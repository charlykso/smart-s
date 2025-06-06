import { create } from 'zustand';
import { auditorService, type AuditorDashboardData, type UserAuditTrail, type FinancialAuditData, type SecurityAuditData } from '../services/auditorService';

interface AuditorState {
  // Dashboard data
  dashboardData: AuditorDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // User audit trail
  userAuditTrail: UserAuditTrail | null;
  userAuditTrailLoading: boolean;
  userAuditTrailError: string | null;

  // Financial audit data
  financialAuditData: FinancialAuditData | null;
  financialAuditDataLoading: boolean;
  financialAuditDataError: string | null;

  // Security audit data
  securityAuditData: SecurityAuditData | null;
  securityAuditDataLoading: boolean;
  securityAuditDataError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchUserAuditTrail: (userId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
    module?: string;
    riskLevel?: string;
  }) => Promise<void>;
  fetchFinancialAuditData: (filters?: {
    schoolId?: string;
    sessionId?: string;
    termId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => Promise<void>;
  fetchSecurityAuditData: (filters?: {
    dateFrom?: string;
    dateTo?: string;
    eventType?: string;
    suspiciousOnly?: boolean;
  }) => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
}

export const useAuditorStore = create<AuditorState>((set, get) => ({
  // Initial state
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  userAuditTrail: null,
  userAuditTrailLoading: false,
  userAuditTrailError: null,

  financialAuditData: null,
  financialAuditDataLoading: false,
  financialAuditDataError: null,

  securityAuditData: null,
  securityAuditDataLoading: false,
  securityAuditDataError: null,

  // Actions
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    
    try {
      const data = await auditorService.getDashboardData();
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

  fetchUserAuditTrail: async (userId: string, filters) => {
    set({ userAuditTrailLoading: true, userAuditTrailError: null });
    
    try {
      const data = await auditorService.getUserAuditTrail(userId, filters);
      set({ 
        userAuditTrail: data,
        userAuditTrailLoading: false,
        userAuditTrailError: null 
      });
    } catch (error) {
      set({ 
        userAuditTrailLoading: false,
        userAuditTrailError: error instanceof Error ? error.message : 'Failed to fetch user audit trail'
      });
    }
  },

  fetchFinancialAuditData: async (filters) => {
    set({ financialAuditDataLoading: true, financialAuditDataError: null });
    
    try {
      const data = await auditorService.getFinancialAuditData(filters);
      set({ 
        financialAuditData: data,
        financialAuditDataLoading: false,
        financialAuditDataError: null 
      });
    } catch (error) {
      set({ 
        financialAuditDataLoading: false,
        financialAuditDataError: error instanceof Error ? error.message : 'Failed to fetch financial audit data'
      });
    }
  },

  fetchSecurityAuditData: async (filters) => {
    set({ securityAuditDataLoading: true, securityAuditDataError: null });
    
    try {
      const data = await auditorService.getSecurityAuditData(filters);
      set({ 
        securityAuditData: data,
        securityAuditDataLoading: false,
        securityAuditDataError: null 
      });
    } catch (error) {
      set({ 
        securityAuditDataLoading: false,
        securityAuditDataError: error instanceof Error ? error.message : 'Failed to fetch security audit data'
      });
    }
  },

  clearErrors: () => {
    set({
      dashboardError: null,
      userAuditTrailError: null,
      financialAuditDataError: null,
      securityAuditDataError: null,
    });
  },

  reset: () => {
    set({
      dashboardData: null,
      dashboardLoading: false,
      dashboardError: null,
      userAuditTrail: null,
      userAuditTrailLoading: false,
      userAuditTrailError: null,
      financialAuditData: null,
      financialAuditDataLoading: false,
      financialAuditDataError: null,
      securityAuditData: null,
      securityAuditDataLoading: false,
      securityAuditDataError: null,
    });
  },
}));
