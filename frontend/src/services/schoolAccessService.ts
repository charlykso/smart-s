import { ApiService } from './apiService';
import type { User } from '../types';

export interface SchoolValidationReport {
  totalUsers: number;
  usersWithoutSchool: Array<{
    _id: string;
    name: string;
    email: string;
    roles: string[];
  }>;
  usersWithInvalidSchool: Array<{
    _id: string;
    name: string;
    email: string;
    roles: string[];
    invalidSchoolId: string;
  }>;
  validAssignments: number;
  fixedAssignments: number;
}

export interface SchoolFilteredUsersResponse {
  users: User[];
  total: number;
  userSchool: string | null;
  isGeneralAdmin: boolean;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

/**
 * Service for school-based access control operations
 */
export class SchoolAccessService {
  private static readonly BASE_URL = '/school-access';

  /**
   * Validate user school assignments (General Admin only)
   */
  static async validateUserSchoolAssignments(): Promise<SchoolValidationReport> {
    try {
      const response = await ApiService.get<{ data: SchoolValidationReport }>(
        `${this.BASE_URL}/validate-assignments`
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to validate user school assignments');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error validating user school assignments:', error);
      throw error;
    }
  }

  /**
   * Get users filtered by current user's school
   */
  static async getUsersBySchool(filters?: UserFilters): Promise<SchoolFilteredUsersResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.role && filters.role !== 'all') {
        params.append('role', filters.role);
      }
      
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters?.search) {
        params.append('search', filters.search);
      }

      const queryString = params.toString();
      const url = queryString 
        ? `${this.BASE_URL}/users?${queryString}`
        : `${this.BASE_URL}/users`;

      const response = await ApiService.get<{ data: SchoolFilteredUsersResponse }>(url);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to retrieve users');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error retrieving users by school:', error);
      throw error;
    }
  }

  /**
   * Check if current user can access all schools
   */
  static async canAccessAllSchools(): Promise<boolean> {
    try {
      const response = await this.getUsersBySchool();
      return response.isGeneralAdmin;
    } catch (error) {
      console.error('Error checking school access:', error);
      return false;
    }
  }

  /**
   * Get current user's school context
   */
  static async getUserSchoolContext(): Promise<{
    userSchool: string | null;
    isGeneralAdmin: boolean;
    canAccessAllSchools: boolean;
  }> {
    try {
      const response = await this.getUsersBySchool();
      
      return {
        userSchool: response.userSchool,
        isGeneralAdmin: response.isGeneralAdmin,
        canAccessAllSchools: response.isGeneralAdmin,
      };
    } catch (error) {
      console.error('Error getting user school context:', error);
      return {
        userSchool: null,
        isGeneralAdmin: false,
        canAccessAllSchools: false,
      };
    }
  }
}
