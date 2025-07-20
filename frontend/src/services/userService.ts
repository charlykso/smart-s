import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import type { User } from '../types/auth';

// Add school access service for school-filtered endpoints
const SCHOOL_ACCESS_ENDPOINTS = {
  USERS_BY_SCHOOL: '/school-access/users',
  VALIDATE_ASSIGNMENTS: '/school-access/validate-assignments',
} as const;

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  roles: string[];
  password?: string;
  type?: string;
  gender?: string;
  regNo?: string;
  school?: string;
}

export interface UpdateUserRequest {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  address?: string;
  roles?: string[];
  status?: 'active' | 'inactive';
}

export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'all';
  page?: number;
  limit?: number;
}

export class UserService {
  // Get users with proper school filtering
  static async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

    const queryString = params.toString();
    const url = queryString 
      ? `${SCHOOL_ACCESS_ENDPOINTS.USERS_BY_SCHOOL}?${queryString}` 
      : SCHOOL_ACCESS_ENDPOINTS.USERS_BY_SCHOOL;

    try {
      const response = await ApiService.get<any>(url);

      // Helper function to normalize user data
      const normalizeUser = (user: any): User => ({
        ...user,
        id: user._id || user.id,
        status: user.status || 'active',
        isActive: user.isActive !== undefined ? user.isActive : true,
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
      });

      if (response.success && response.data) {
        // School-filtered response format
        return {
          users: (response.data.users || []).map(normalizeUser),
          total: response.data.total || 0,
          page: filters?.page || 1,
          limit: filters?.limit || 50,
        };
      } else {
        // Fallback for error handling
        return {
          users: [],
          total: 0,
          page: 1,
          limit: 50,
        };
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Try fallback to direct endpoint for general admins
      try {
        const fallbackUrl = queryString 
          ? `${API_ENDPOINTS.USERS.ALL}?${queryString}` 
          : API_ENDPOINTS.USERS.ALL;
        
        const fallbackResponse = await ApiService.get<any>(fallbackUrl);
        
        const normalizeUser = (user: any): User => ({
          ...user,
          id: user._id || user.id,
          status: user.status || 'active',
          isActive: user.isActive !== undefined ? user.isActive : true,
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
          createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
          updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date(),
        });

        if (Array.isArray(fallbackResponse)) {
          return {
            users: fallbackResponse.map(normalizeUser),
            total: fallbackResponse.length,
            page: filters?.page || 1,
            limit: filters?.limit || 50,
          };
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
      
      throw error;
    }
  }

  // Create new user (uses appropriate endpoint based on role and current user permissions)
  static async createUser(userData: CreateUserRequest): Promise<User> {
    const roles = userData.roles || [];
    const primaryRole = roles[0];

    // System Admin creating ICT Admin - use admin endpoint
    if (primaryRole === 'ICT_administrator') {
      const ictAdminData = {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phone: userData.phone,
        schoolId: userData.school, // Admin endpoint expects schoolId
        gender: userData.gender,
        type: userData.type,
        regNo: userData.regNo,
      };

      const response = await ApiService.post<any>('/admin/ict-administrators', ictAdminData);
      return response.user; // Admin endpoint returns { success, message, user, defaultPassword }
    }

    // For other roles, use the ICT admin user management endpoint
    const userManagementData = {
      ...userData,
      school: userData.school, // User management endpoint expects school
    };

    return ApiService.post<User>('/users', userManagementData);
  }

  // Update user
  static async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    return ApiService.put<User>(`${API_ENDPOINTS.USERS.UPDATE}/${userId}`, userData);
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    return ApiService.delete(`${API_ENDPOINTS.USERS.DELETE}/${userId}`);
  }

  // Get user profile
  static async getUserProfile(): Promise<User> {
    return ApiService.get<User>(API_ENDPOINTS.USERS.PROFILE);
  }

  // Update user profile
  static async updateProfile(profileData: UpdateUserRequest): Promise<User> {
    return ApiService.put<User>(API_ENDPOINTS.USERS.PROFILE, profileData);
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return ApiService.post('/user/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Upload profile picture
  static async uploadProfilePicture(file: File, onProgress?: (progress: number) => void): Promise<{ profilePicture: string }> {
    return ApiService.uploadFile<{ profilePicture: string }>('/user/upload-profile-picture', file, onProgress);
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<User> {
    return ApiService.get<User>(`${API_ENDPOINTS.USERS.ALL}/${userId}`);
  }

  // Bulk operations
  static async bulkUpdateUsers(userIds: string[], updates: UpdateUserRequest): Promise<User[]> {
    return ApiService.post<User[]>('/user/bulk-update', {
      userIds,
      updates,
    });
  }

  static async bulkDeleteUsers(userIds: string[]): Promise<void> {
    return ApiService.post('/user/bulk-delete', { userIds });
  }

  // Search users
  static async searchUsers(query: string): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('search', query);
    return ApiService.get<User[]>(`${API_ENDPOINTS.USERS.ALL}/search?${params.toString()}`);
  }

  // User statistics for dashboard
  static async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    usersByRole: Record<string, number>;
  }> {
    return ApiService.get('/user/stats');
  }
}

export default UserService;
