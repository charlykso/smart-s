import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginCredentials } from '../types/auth';
import { STORAGE_KEYS } from '../constants';
import { AuthService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  rememberMe: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  refreshAccessToken: () => Promise<{ token: string; refreshToken: string }>;
  clearAuth: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  initializeAuth: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  rememberMe: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });

        try {
          // Use AuthService for consistent API handling
          const authResponse = await AuthService.login(credentials);

          const { user, token, refreshToken } = authResponse;

          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            rememberMe: credentials.rememberMe || false,
          });

          // Store tokens in localStorage if remember me is checked
          if (credentials.rememberMe) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
            localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
          }

          toast.success('Successfully logged in!');
        } catch (error) {
          set({ isLoading: false });
          // Don't show toast error here - the API interceptor will handle it
          // This prevents duplicate error messages
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call backend logout endpoint
          await AuthService.logout();
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with local logout even if backend call fails
        }

        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);

        // Reset state
        set(initialState);

        toast.success('Successfully logged out!');
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (token: string, refreshToken: string) => {
        set({ token, refreshToken, isAuthenticated: true });
        
        // Update localStorage if remember me is enabled
        const { rememberMe } = get();
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          // Use AuthService for consistent API handling
          const tokenResponse = await AuthService.refreshToken(refreshToken);

          const { token, refreshToken: newRefreshToken } = tokenResponse;

          set({
            token,
            refreshToken: newRefreshToken,
          });

          // Update localStorage if remember me is enabled
          const { rememberMe } = get();
          if (rememberMe) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
          }

          return { token, refreshToken: newRefreshToken };
        } catch (error) {
          // If refresh fails, logout user
          console.error('Token refresh failed:', error);
          get().logout();
          throw error;
        }
      },

      clearAuth: () => {
        set(initialState);
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.roles?.includes(role as any) || false;
      },

      hasAnyRole: (roles: string[]) => {
        const { user } = get();
        if (!user?.roles) return false;
        return roles.some(role => user.roles.includes(role as any));
      },

      initializeAuth: async () => {
        const rememberMe = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true';
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (rememberMe && token && refreshToken) {
          try {
            // Validate token by trying to refresh it
            const tokenResponse = await AuthService.refreshToken(refreshToken);

            // Get current user data
            const userData = await AuthService.getCurrentUser();

            set({
              user: userData,
              token: tokenResponse.token,
              refreshToken: tokenResponse.refreshToken,
              isAuthenticated: true,
              rememberMe: true,
            });

            // Update localStorage with new tokens
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokenResponse.refreshToken);
          } catch (error) {
            console.error('Token validation failed:', error);
            // Clear invalid tokens
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
            set(initialState);
          }
        } else {
          // No valid tokens, ensure state is cleared
          set(initialState);
        }
      },
    }),
    {
      name: STORAGE_KEYS.USER_DATA,
      partialize: (state) => ({
        user: state.user,
        token: state.rememberMe ? state.token : null,
        refreshToken: state.rememberMe ? state.refreshToken : null,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);


