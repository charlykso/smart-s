import { create } from 'zustand';
import { UserService } from '../services/userService';

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: string[];
  regNo: string;
  school?: string | { _id: string; name: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserFilters {
  search?: string;
  role?: string;
  school?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  filters: UserFilters;
  pagination: UserPagination;

  // Actions
  loadUsers: (filters?: UserFilters) => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User> & { _id: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  setFilters: (filters: UserFilters) => void;
  clearError: () => void;
  searchUsers: (query: string) => Promise<User[]>;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },

  loadUsers: async (filters?: UserFilters) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = filters || get().filters;
      const response = await UserService.getUsers(currentFilters);
      
      set({
        users: response.users || [],
        pagination: {
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        },
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to load users',
        isLoading: false,
      });
    }
  },

  createUser: async (userData: Partial<User>) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = await UserService.createUser(userData);
      const currentUsers = get().users;
      set({
        users: [newUser, ...currentUsers],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to create user',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (userData: Partial<User> & { _id: string }) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await UserService.updateUser(userData._id, userData);
      const currentUsers = get().users;
      const updatedUsers = currentUsers.map(user =>
        user._id === userData._id ? { ...user, ...updatedUser } : user
      );
      
      set({
        users: updatedUsers,
        selectedUser: get().selectedUser?._id === userData._id ? { ...get().selectedUser!, ...updatedUser } : get().selectedUser,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to update user',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      await UserService.deleteUser(userId);
      const currentUsers = get().users;
      const filteredUsers = currentUsers.filter(user => user._id !== userId);
      
      set({
        users: filteredUsers,
        selectedUser: get().selectedUser?._id === userId ? null : get().selectedUser,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to delete user',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedUser: (user: User | null) => {
    set({ selectedUser: user });
  },

  setFilters: (filters: UserFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearError: () => {
    set({ error: null });
  },

  searchUsers: async (query: string) => {
    try {
      const users = await UserService.searchUsers(query);
      return users;
    } catch (error: any) {
      set({ error: error.message || 'Failed to search users' });
      return [];
    }
  },
}));
