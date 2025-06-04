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
  id: string; // For compatibility with frontend components
  firstname: string;
  middlename?: string;
  lastname: string;
  email: string;
  phone: string;
  roles: UserRole[];
  status: 'active' | 'inactive';
  isActive: boolean;
  lastLogin?: Date;
  school?: any; // Using any to avoid circular dependency
  classArm?: any;
  profile?: any;
  regNo?: string;
  DOB?: Date;
  gender: 'Male' | 'Female';
  address?: any;
  student?: any;
  type?: 'day' | 'boarding';
  createdAt: string | Date;
  updatedAt: string | Date;
}
