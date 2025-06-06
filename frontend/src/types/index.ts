// Import UserRole from separate file to avoid circular dependencies
import type { UserRole } from './roles';

// Re-export UserRole for convenience
export type { UserRole } from './roles';

// Basic Types (without circular references)
export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupSchool {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  groupSchool: GroupSchool;
  address: Address;
  createdAt: string;
  updatedAt: string;
}

export interface ClassArm {
  _id: string;
  name: string;
  capacity: number;
  school: School;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  _id: string;
  user: string;
  profilePicture?: string;
  address?: Address;
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  createdAt: string;
  updatedAt: string;
}

// User Types
export interface User {
  _id: string;
  firstname: string;
  middlename?: string;
  lastname: string;
  email: string;
  phone: string;
  roles: UserRole[];
  school?: School;
  classArm?: ClassArm;
  profile?: Profile;
  createdAt: string;
  updatedAt: string;
}

// Academic Types
export interface Session {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  school: School;
  createdAt: string;
  updatedAt: string;
}

export interface Term {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  session: Session;
  school: School;
  createdAt: string;
  updatedAt: string;
}



// Fee Types
export interface Fee {
  _id: string;
  name: string;
  description: string;
  type: string;
  amount: number;
  isActive: boolean;
  isApproved: boolean;
  isInstallmentAllowed: boolean;
  no_ofInstallments: number;
  term: Term;
  school: School;
  createdAt: string;
  updatedAt: string;
}

// Payment Types
export interface Payment {
  _id: string;
  user: User;
  fee: Fee;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  mode_of_payment: 'paystack' | 'flutterwave' | 'bank_transfer' | 'cash';
  trans_date: string;
  trx_ref?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentProfile {
  _id: string;
  user: User;
  fees: Fee[];
  totalAmount: number;
  amountPaid: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: any;
}

// UI Types
export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  path?: string;
  children?: MenuItem[];
  roles?: UserRole[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

// Notification Types
export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
}

// Filter and Search Types
export interface FilterOptions {
  search?: string;
  status?: string;
  role?: UserRole;
  school?: string;
  term?: string;
  session?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// Audit Types
export interface AuditLog {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  user: User;
  changes?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditReport {
  _id: string;
  title: string;
  description: string;
  type: 'payment' | 'user' | 'fee' | 'system';
  generatedBy: User;
  dateRange: {
    from: string;
    to: string;
  };
  data: any;
  createdAt: string;
}
