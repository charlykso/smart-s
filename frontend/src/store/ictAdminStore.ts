import { create } from 'zustand';
import { ictAdminService, type ICTAdminDashboardData, type SystemStatus, type UserManagementData, type EmailStats } from '../services/ictAdminService';

interface ICTAdminState {
  // Dashboard data
  dashboardData: ICTAdminDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // System status
  systemStatus: SystemStatus | null;
  systemStatusLoading: boolean;
  systemStatusError: string | null;

  // User management
  userManagementData: UserManagementData | null;
  userManagementLoading: boolean;
  userManagementError: string | null;

  // Email statistics
  emailStats: EmailStats | null;
  emailStatsLoading: boolean;
  emailStatsError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchSystemStatus: () => Promise<void>;
  fetchUserManagementData: () => Promise<void>;
  fetchEmailStats: () => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
}

export const useICTAdminStore = create<ICTAdminState>((set, get) => ({
  // Initial state
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  systemStatus: null,
  systemStatusLoading: false,
  systemStatusError: null,

  userManagementData: null,
  userManagementLoading: false,
  userManagementError: null,

  emailStats: null,
  emailStatsLoading: false,
  emailStatsError: null,

  // Actions
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    
    try {
      const data = await ictAdminService.getDashboardData();
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

  fetchSystemStatus: async () => {
    set({ systemStatusLoading: true, systemStatusError: null });
    
    try {
      const data = await ictAdminService.getSystemStatus();
      set({ 
        systemStatus: data,
        systemStatusLoading: false,
        systemStatusError: null 
      });
    } catch (error) {
      set({ 
        systemStatusLoading: false,
        systemStatusError: error instanceof Error ? error.message : 'Failed to fetch system status'
      });
    }
  },

  fetchUserManagementData: async () => {
    set({ userManagementLoading: true, userManagementError: null });
    
    try {
      const data = await ictAdminService.getUserManagementData();
      set({ 
        userManagementData: data,
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

  fetchEmailStats: async () => {
    set({ emailStatsLoading: true, emailStatsError: null });
    
    try {
      const data = await ictAdminService.getEmailStats();
      set({ 
        emailStats: data,
        emailStatsLoading: false,
        emailStatsError: null 
      });
    } catch (error) {
      set({ 
        emailStatsLoading: false,
        emailStatsError: error instanceof Error ? error.message : 'Failed to fetch email statistics'
      });
    }
  },

  clearErrors: () => {
    set({
      dashboardError: null,
      systemStatusError: null,
      userManagementError: null,
      emailStatsError: null,
    });
  },

  reset: () => {
    set({
      dashboardData: null,
      dashboardLoading: false,
      dashboardError: null,
      systemStatus: null,
      systemStatusLoading: false,
      systemStatusError: null,
      userManagementData: null,
      userManagementLoading: false,
      userManagementError: null,
      emailStats: null,
      emailStatsLoading: false,
      emailStatsError: null,
    });
  },
}));
