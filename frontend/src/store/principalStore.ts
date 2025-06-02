import { create } from 'zustand';
import { principalService, type PrincipalDashboardData, type AcademicOverview, type StaffManagement } from '../services/principalService';

interface PrincipalState {
  // Dashboard data
  dashboardData: PrincipalDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // Academic overview
  academicOverview: AcademicOverview | null;
  academicOverviewLoading: boolean;
  academicOverviewError: string | null;

  // Staff management
  staffManagement: StaffManagement | null;
  staffManagementLoading: boolean;
  staffManagementError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchAcademicOverview: () => Promise<void>;
  fetchStaffManagement: () => Promise<void>;
  clearErrors: () => void;
  reset: () => void;
}

export const usePrincipalStore = create<PrincipalState>((set, get) => ({
  // Initial state
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  academicOverview: null,
  academicOverviewLoading: false,
  academicOverviewError: null,

  staffManagement: null,
  staffManagementLoading: false,
  staffManagementError: null,

  // Actions
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    
    try {
      const data = await principalService.getDashboardData();
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

  fetchAcademicOverview: async () => {
    set({ academicOverviewLoading: true, academicOverviewError: null });
    
    try {
      const data = await principalService.getAcademicOverview();
      set({ 
        academicOverview: data,
        academicOverviewLoading: false,
        academicOverviewError: null 
      });
    } catch (error) {
      set({ 
        academicOverviewLoading: false,
        academicOverviewError: error instanceof Error ? error.message : 'Failed to fetch academic overview'
      });
    }
  },

  fetchStaffManagement: async () => {
    set({ staffManagementLoading: true, staffManagementError: null });
    
    try {
      const data = await principalService.getStaffManagement();
      set({ 
        staffManagement: data,
        staffManagementLoading: false,
        staffManagementError: null 
      });
    } catch (error) {
      set({ 
        staffManagementLoading: false,
        staffManagementError: error instanceof Error ? error.message : 'Failed to fetch staff management data'
      });
    }
  },

  clearErrors: () => {
    set({
      dashboardError: null,
      academicOverviewError: null,
      staffManagementError: null,
    });
  },

  reset: () => {
    set({
      dashboardData: null,
      dashboardLoading: false,
      dashboardError: null,
      academicOverview: null,
      academicOverviewLoading: false,
      academicOverviewError: null,
      staffManagement: null,
      staffManagementLoading: false,
      staffManagementError: null,
    });
  },
}));
