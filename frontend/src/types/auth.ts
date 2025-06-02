// Auth-specific types (separated to avoid circular dependencies)
import type { UserRole } from './roles';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Basic User interface for auth (without complex dependencies)
export interface User {
  _id: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  email: string;
  phone: string;
  roles: UserRole[];
  school?: any; // Using any to avoid circular dependency
  classArm?: any;
  profile?: any;
  createdAt: string;
  updatedAt: string;
}
