import { create } from 'zustand';
import { adminService, type AdminDashboardData, type SystemOverview, type UserManagement, type FinancialOverview, type SystemActivity } from '../services/adminService';

interface AdminState {
  // Dashboard data
  dashboardData: AdminDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // System overview
  systemOverview: SystemOverview | null;
  systemOverviewLoading: boolean;
  systemOverviewError: string | null;

  // User management
  userManagement: UserManagement | null;
  userManagementLoading: boolean;
  userManagementError: string | null;

  // Financial overview
  financialOverview: FinancialOverview | null;
  financialOverviewLoading: boolean;
  financialOverviewError: string | null;

  // System activities
  systemActivities: SystemActivity[];
  systemActivitiesLoading: boolean;
  systemActivitiesError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchSystemOverview: () => Promise<void>;
  fetchUserManagement: () => Promise<void>;
  fetchFinancialOverview: (period?: string) => Promise<void>;
  fetchSystemActivities: (limit?: number) => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  // Initial state
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  systemOverview: null,
  systemOverviewLoading: false,
  systemOverviewError: null,

  userManagement: null,
  userManagementLoading: false,
  userManagementError: null,

  financialOverview: null,
  financialOverviewLoading: false,
  financialOverviewError: null,

  systemActivities: [],
  systemActivitiesLoading: false,
  systemActivitiesError: null,

  // Actions
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, dashboardError: null });

    try {
      const data = await adminService.getDashboardData();
      set({
        dashboardData: data,
        dashboardLoading: false,
        dashboardError: null
      });
    } catch (error) {
      console.error('AdminStore - Dashboard data fetch error:', error);
      set({
        dashboardLoading: false,
        dashboardError: error instanceof Error ? error.message : 'Failed to fetch dashboard data'
      });
    }
  },

  fetchSystemOverview: async () => {
    set({ systemOverviewLoading: true, systemOverviewError: null });
    
    try {
      const data = await adminService.getSystemOverview();
      set({ 
        systemOverview: data,
        systemOverviewLoading: false,
        systemOverviewError: null 
      });
    } catch (error) {
      set({ 
        systemOverviewLoading: false,
        systemOverviewError: error instanceof Error ? error.message : 'Failed to fetch system overview'
      });
    }
  },

  fetchUserManagement: async () => {
    set({ userManagementLoading: true, userManagementError: null });
    
    try {
      const data = await adminService.getUserManagement();
      set({ 
        userManagement: data,
        userManagementLoading: false,
        userManagementError: null 
      });
    } catch (error) {
      set({ 
        userManagementLoading: false,
        userManagementError: error instanceof Error ? error.message : 'Failed to fetch user management data'
      });
    }
  },

  fetchFinancialOverview: async (period = '30') => {
    set({ financialOverviewLoading: true, financialOverviewError: null });

    try {
      const data = await adminService.getFinancialOverview(period);
      set({
        financialOverview: data,
        financialOverviewLoading: false,
        financialOverviewError: null
      });
    } catch (error) {
      set({
        financialOverviewLoading: false,
        financialOverviewError: error instanceof Error ? error.message : 'Failed to fetch financial overview'
      });
    }
  },

  fetchSystemActivities: async (limit = 10) => {
    set({ systemActivitiesLoading: true, systemActivitiesError: null });

    try {
      const data = await adminService.getSystemActivities(limit);
      set({
        systemActivities: data,
        systemActivitiesLoading: false,
        systemActivitiesError: null
      });
    } catch (error) {
      set({
        systemActivitiesLoading: false,
        systemActivitiesError: error instanceof Error ? error.message : 'Failed to fetch system activities'
      });
    }
  },

  clearErrors: () => {
    set({
      dashboardError: null,
      systemOverviewError: null,
      userManagementError: null,
      financialOverviewError: null,
      systemActivitiesError: null,
    });
  },

  reset: () => {
    set({
      dashboardData: null,
      dashboardLoading: false,
      dashboardError: null,
      systemOverview: null,
      systemOverviewLoading: false,
      systemOverviewError: null,
      userManagement: null,
      userManagementLoading: false,
      userManagementError: null,
      financialOverview: null,
      financialOverviewLoading: false,
      financialOverviewError: null,
      systemActivities: [],
      systemActivitiesLoading: false,
      systemActivitiesError: null,
    });
  },
}));
