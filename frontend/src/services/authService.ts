import { ApiService } from './api';
import type { LoginCredentials, AuthResponse, User } from '../types/auth';
import type { ApiResponse } from '../types';
import { API_ENDPOINTS } from '../constants';

export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await ApiService.post<any>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      return response.data;
    } catch (error) {
      // Extract meaningful error message from various error formats
      let errorMessage = 'Login failed. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Handle axios error structure
        const axiosError = error as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }

      // Create a proper Error object with the extracted message
      const loginError = new Error(errorMessage);
      throw loginError;
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      await ApiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Even if logout fails on server, we should clear local state
      console.error('Logout error:', error);
    }
  }

  // Refresh access token
  static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await ApiService.post<any>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    if (!response.success) {
      throw new Error(response.message || 'Token refresh failed');
    }

    return response.data;
  }

  // Forgot password
  static async forgotPassword(email: string): Promise<void> {
    const response = await ApiService.post<ApiResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to send reset email');
    }
  }

  // Reset password
  static async resetPassword(token: string, password: string): Promise<void> {
    const response = await ApiService.post<ApiResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, password }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    const response = await ApiService.get<ApiResponse<User>>(
      API_ENDPOINTS.USERS.PROFILE
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to get user profile');
    }
    
    return response.data!;
  }

  // Update user profile
  static async updateProfile(data: Partial<User>): Promise<User> {
    const response = await ApiService.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.PROFILE,
      data
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to update profile');
    }
    
    return response.data!;
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await ApiService.post<ApiResponse>(
      `${API_ENDPOINTS.USERS.PROFILE}/change-password`,
      { currentPassword, newPassword }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to change password');
    }
  }

  // Upload profile picture
  static async uploadProfilePicture(file: File): Promise<string> {
    const response = await ApiService.uploadFile<ApiResponse<{ url: string }>>(
      `${API_ENDPOINTS.USERS.PROFILE}/upload-picture`,
      file
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to upload profile picture');
    }
    
    return response.data!.url;
  }
}
