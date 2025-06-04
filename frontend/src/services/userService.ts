import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import type { User } from '../types/auth';

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
  roles: string[];
  password: string;
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
  // Get all users with filters
  static async getUsers(filters?: UserFilters): Promise<UserListResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.role && filters.role !== 'all') params.append('role', filters.role);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.USERS.ALL}?${queryString}` : API_ENDPOINTS.USERS.ALL;

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

      // Handle different response formats from backend
      if (Array.isArray(response)) {
        // Direct array response from /user/all endpoint
        return {
          users: response.map(normalizeUser),
          total: response.length,
          page: filters?.page || 1,
          limit: filters?.limit || 50,
        };
      } else if (response.success && response.data) {
        // Admin endpoint response format
        return {
          users: (response.data.users || []).map(normalizeUser),
          total: response.data.pagination?.total || 0,
          page: response.data.pagination?.page || 1,
          limit: response.data.pagination?.limit || 10,
        };
      } else {
        // Fallback
        return {
          users: (response.users || []).map(normalizeUser),
          total: response.total || 0,
          page: response.page || 1,
          limit: response.limit || 10,
        };
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Create new user
  static async createUser(userData: CreateUserRequest): Promise<User> {
    return ApiService.post<User>(API_ENDPOINTS.USERS.CREATE, userData);
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
