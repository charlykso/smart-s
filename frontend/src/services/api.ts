import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { ENV, STORAGE_KEYS } from '../constants';
import toast from 'react-hot-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Don't make requests if page is being unloaded
    if (document.visibilityState === 'hidden' && performance.navigation?.type === 1) {
      return Promise.reject(new Error('Page is being unloaded'));
    }

    const token = useAuthStore.getState().token || localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and errors
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip error handling if page is being unloaded
    if (error.message === 'Page is being unloaded' ||
        document.visibilityState === 'hidden') {
      return Promise.reject(error);
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await useAuthStore.getState().refreshAccessToken();

        // Retry the original request with new token
        const newToken = useAuthStore.getState().token;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response) {
      const { status, data } = error.response;

      // Don't show toast errors if page is hidden
      if (document.visibilityState !== 'hidden') {
        switch (status) {
          case 400:
            toast.error(data.message || 'Bad request');
            break;
          case 403:
            toast.error('You are not authorized to perform this action');
            break;
          case 404:
            // Don't show 404 errors for notification endpoints
            if (!originalRequest.url?.includes('/notification/')) {
              toast.error('Resource not found');
            }
            break;
          case 422:
            toast.error(data.message || 'Validation error');
            break;
          case 500:
            toast.error('Internal server error. Please try again later.');
            break;
          default:
            toast.error(data.message || 'An unexpected error occurred');
        }
      }
    } else if (error.request && document.visibilityState !== 'hidden') {
      // Only show network errors if page is visible
      toast.error('Network error. Please check your connection.');
    } else if (document.visibilityState !== 'hidden') {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// API service class
export class ApiService {
  // Generic GET request
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.get<T>(url, config);
    return response.data;
  }

  // Generic POST request
  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request
  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.put<T>(url, data, config);
    return response.data;
  }

  // Generic PATCH request
  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.patch<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request
  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<T>(url, config);
    return response.data;
  }

  // File upload
  static async uploadFile<T = any>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.post<T>(url, formData, config);
    return response.data;
  }

  // POST with FormData
  static async postFormData<T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.post<T>(url, formData, config);
    return response.data;
  }

  // PUT with FormData
  static async putFormData<T = any>(url: string, formData: FormData, onProgress?: (progress: number) => void): Promise<T> {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await api.put<T>(url, formData, config);
    return response.data;
  }

  // Download file
  static async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// Create an instance of the ApiService for easier use
export const apiService = ApiService;

// Export the axios instance for direct use if needed
export default api;
