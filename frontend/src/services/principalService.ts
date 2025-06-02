import { apiService } from './api';

export interface PrincipalDashboardData {
  principal: {
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
  statistics: {
    totalStudents: number;
    totalTeachers: number;
    totalStaff: number;
    activeTerms: number;
  };
  financial: {
    totalRevenue: number;
    outstandingFees: number;
    collectionRate: number;
    thisMonthRevenue: number;
  };
  recentActivities: Array<{
    _id: string;
    type: string;
    description: string;
    user: string;
    date: string;
  }>;
  currentAcademic: {
    currentSession?: any;
    currentTerm?: any;
    totalClasses: number;
    totalSubjects: number;
  };
}

export interface AcademicOverview {
  studentsByClass: Array<{
    className: string;
    totalStudents: number;
    maleStudents: number;
    femaleStudents: number;
  }>;
  feeCollection: Array<{
    feeName: string;
    amount: number;
    totalStudents: number;
    paidStudents: number;
    collectionRate: number;
  }>;
}

export interface StaffManagement {
  teachers: Array<{
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    subjects: string[];
    classes: string[];
  }>;
  staffSummary: {
    totalTeachers: number;
    totalAdminStaff: number;
    totalSupportStaff: number;
  };
}

class PrincipalService {
  /**
   * Get principal dashboard data
   */
  async getDashboardData(): Promise<PrincipalDashboardData> {
    try {
      const response = await apiService.get('/principal/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching principal dashboard data:', error);
      throw error;
    }
  }

  /**
   * Get academic overview data
   */
  async getAcademicOverview(): Promise<AcademicOverview> {
    try {
      const response = await apiService.get('/principal/academic-overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching academic overview:', error);
      throw error;
    }
  }

  /**
   * Get staff management data
   */
  async getStaffManagement(): Promise<StaffManagement> {
    try {
      const response = await apiService.get('/principal/staff-management');
      return response.data;
    } catch (error) {
      console.error('Error fetching staff management data:', error);
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
   * Get collection rate color for UI
   */
  getCollectionRateColor(rate: number): string {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get performance indicator color
   */
  getPerformanceColor(value: number, threshold: { good: number; excellent: number }): string {
    if (value >= threshold.excellent) return 'text-green-600';
    if (value >= threshold.good) return 'text-blue-600';
    return 'text-yellow-600';
  }

  /**
   * Format relative time
   */
  formatRelativeTime(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return past.toLocaleDateString();
  }

  /**
   * Get activity type color
   */
  getActivityTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'academic':
        return 'text-blue-600 bg-blue-100';
      case 'fee':
        return 'text-yellow-600 bg-yellow-100';
      case 'user':
        return 'text-purple-600 bg-purple-100';
      case 'system':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Calculate growth percentage
   */
  calculateGrowth(current: number, previous: number): {
    percentage: number;
    isPositive: boolean;
  } {
    if (previous === 0) return { percentage: 0, isPositive: true };
    
    const growth = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(Math.round(growth)),
      isPositive: growth >= 0
    };
  }

  /**
   * Get gender distribution color
   */
  getGenderColor(gender: 'male' | 'female'): string {
    return gender === 'male' ? 'text-blue-600' : 'text-pink-600';
  }
}

export const principalService = new PrincipalService();
