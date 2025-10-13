import type { UserRole } from '../types/roles';

const metaEnv = typeof import.meta !== 'undefined' ? import.meta.env : undefined;

// User Roles
export const USER_ROLES: Record<UserRole, string> = {
  Admin: 'Administrator',
  ICT_administrator: 'ICT Administrator',
  Auditor: 'Auditor',
  Proprietor: 'Proprietor',
  Principal: 'Principal',
  Headteacher: 'Head Teacher',
  Bursar: 'Bursar',
  Student: 'Student',
  Parent: 'Parent',
};

// Payment Methods
export const PAYMENT_METHODS = {
  paystack: 'Paystack',
  flutterwave: 'Flutterwave',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash Payment',
};

// Payment Status
export const PAYMENT_STATUS = {
  pending: 'Pending',
  success: 'Successful',
  failed: 'Failed',
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    ALL: '/user/all',
    CREATE: '/user/create',
    STUDENT_CREATE: '/user/student/create',
    CREATE_STUDENT: '/user/create-student',
    UPDATE: '/user/update',
    UPDATE_STUDENT: '/user/update-student/:id',
    DELETE: '/user/delete',
    BY_ID: '/user/:id',
    PROFILE: '/user/profile',
    STUDENTS: '/user/students',
    STUDENT_STATS: '/user/students/stats',
    STUDENT_SEARCH: '/user/students/search',
    STUDENT_EXPORT: '/user/students/export',
    STUDENT_IMPORT: '/user/students/import',
  },
  SCHOOLS: {
    ALL: '/school/all',
    CREATE: '/school/create',
    UPDATE: '/school/update',
    DELETE: '/school/delete',
    BY_ID: '/school',
    BY_ADDRESS: '/school/by-address',
    BY_GROUP: '/school/by-groupSchool',
  },
  GROUP_SCHOOLS: {
    ALL: '/groupSchool/all',
    CREATE: '/groupSchool/create',
    UPDATE: '/groupSchool',
    DELETE: '/groupSchool/delete',
    BY_ID: '/groupSchool',
    UPLOAD_LOGO: '/groupSchool',
  },
  SESSIONS: {
    ALL: '/Session/all',
    CREATE: '/Session/create',
    UPDATE: '/Session/:id/update',
    DELETE: '/Session/:id/delete',
    BY_ID: '/Session',
    BY_SCHOOL: '/Session/by-school',
    TERMS: '/Session/sessions/term',
  },
  TERMS: {
    ALL: '/Term/all',
    CREATE: '/Term/create',
    UPDATE: '/Term/:id/update',
    DELETE: '/Term/:id/delete',
    BY_ID: '/Term',
    BY_SESSION: '/Term/by-session',
  },
  CLASS_ARMS: {
    ALL: '/ClassArm/all',
    CREATE: '/ClassArm',
    UPDATE: '/ClassArm/:id/update',
    DELETE: '/ClassArm/:id/delete',
    BY_ID: '/ClassArm',
    BY_SCHOOL: '/ClassArm/by-school',
  },
  FEES: {
    ALL: '/fee/all',
    CREATE: '/fee/create',
    UPDATE: '/fee/:id/update',
    DELETE: '/fee/:id/delete',
    BY_ID: '/fee',
    BY_TERM: '/fee/term',
    APPROVED: '/fee/get-approved-fees',
    UNAPPROVED: '/fee/get-unapproved-fees',
    APPROVED_BY_TERM: '/fee/:term_id/get-approved-fees',
    UNAPPROVED_BY_TERM: '/fee/:term_id/get-unapproved-fees',
    APPROVE: '/approve/:fee_id/approve',
    STUDENT_APPROVED_FEES: '/fee/student/approved-fees',
  },
  PAYMENTS: {
    ALL: '/payment/all',
    INITIATE: '/payment/initiate',
    CASH: '/payment/pay-with-cash',
    PAYSTACK: '/payment/get-paystack',
    BANK_TRANSFER: '/payment/get-Bank_transfer',
    FLUTTERWAVE: '/payment/get-payments-by-flutterwave',
    CASH_PAYMENTS: '/payment/get-payments-by-cash',
    PAYSTACK_CALLBACK: '/payment/paystack_callback',
    FLUTTERWAVE_CALLBACK: '/payment/flutterwave_callback',
    AVAILABLE_METHODS: '/payment/available-methods',
    STUDENT_PAYMENTS: '/payment/student/my-payments',
  },
  PAYMENT_PROFILES: {
    ALL: '/paymentprofile/all',
    CREATE: '/paymentprofile/create',
    UPDATE: '/paymentprofile/update',
  },
  EXPENSES: {
    ALL: '/expenses',
    SUMMARY: '/expenses/summary',
    EXPORT: '/expenses/export/pdf',
    CREATE: '/expenses',
    UPDATE: '/expenses/:id',
    DELETE: '/expenses/:id',
    APPROVE: '/expenses/:id/approve',
    REJECT: '/expenses/:id/reject',
    BY_ID: '/expenses/:id',
  },
  EXPENSE_PAYMENTS: {
    ALL: '/expense-payments',
    BY_EXPENSE: '/expense-payments/expense/:expenseId',
    CREATE: '/expense-payments/expense/:expenseId',
    UPDATE: '/expense-payments/:id',
    DELETE: '/expense-payments/:id',
  },
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    PAYMENTS: '/student/payments',
    OUTSTANDING_FEES: '/student/outstanding-fees',
  },
  NOTIFICATIONS: {
    ALL: '/notification/all',
    UNREAD_COUNT: '/notification/unread-count',
    MARK_READ: '/notification/:id/mark-read',
    MARK_ALL_READ: '/notification/mark-all-read',
    DELETE: '/notification/:id',
    PAYMENT_REMINDERS: '/notification/payment-reminders',
    CREATE_REMINDER: '/notification/payment-reminder',
    SEND_REMINDER: '/notification/payment-reminder/:id/send',
    PREFERENCES: '/notification/preferences',
    SYSTEM: '/notification/system',
    BULK: '/notification/bulk',
  },
  EMAIL: {
    SEND: '/email/send',
    SEND_BULK: '/email/send-bulk',
    TEMPLATES: '/email/templates',
    CONFIG: '/email/config',
    TEST: '/email/test',
    STATS: '/email/stats',
  },
  AUDIT: {
    LOGS: '/audit/logs',
    REPORTS: '/audit/reports',
    GENERATE_REPORT: '/audit/generate-report',
  },
  ADDRESSES: {
    ALL: '/address/all',
    CREATE: '/address/create',
    UPDATE: '/address/update',
    DELETE: '/address/delete',
  },
  DASHBOARDS: {
    BURSAR: '/bursar/dashboard',
    PARENT: '/parent/dashboard',
    PRINCIPAL: '/principal/dashboard',
    ADMIN: '/admin/dashboard',
    STUDENT: '/student/dashboard',
    AUDITOR: '/auditor/dashboard',
    ICT_ADMIN: '/ict-admin/dashboard',
  },
  BURSAR: {
    DASHBOARD: '/bursar/dashboard',
    PAYMENT_REPORTS: '/bursar/payment-reports',
    OUTSTANDING_FEES_REPORT: '/bursar/outstanding-fees-report',
  },
  PARENT: {
    DASHBOARD: '/parent/dashboard',
    CHILD_DETAILS: '/parent/child',
    PAYMENT_HISTORY: '/parent/payment-history',
  },
  PRINCIPAL: {
    DASHBOARD: '/principal/dashboard',
    ACADEMIC_OVERVIEW: '/principal/academic-overview',
    STAFF_MANAGEMENT: '/principal/staff-management',
  },
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SYSTEM_OVERVIEW: '/admin/system-overview',
    USER_MANAGEMENT: '/admin/user-management',
    FINANCIAL_OVERVIEW: '/admin/financial-overview',
  },
  AUDITOR: {
    DASHBOARD: '/auditor/dashboard',
    USER_AUDIT_TRAIL: '/audit/users',
    FINANCIAL_AUDIT: '/audit/financial/transactions',
    SECURITY_AUDIT: '/audit/security/events',
    FAILED_LOGINS: '/audit/security/failed-logins',
  },
  ICT_ADMIN: {
    DASHBOARD: '/ict-admin/dashboard',
    SYSTEM_STATUS: '/ict-admin/system-status',
    USER_MANAGEMENT: '/user/all',
    EMAIL_STATS: '/email/stats',
    SYSTEM_LOGS: '/ict-admin/system-logs',
    BACKUP_STATUS: '/ict-admin/backup-status',
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ledgrio_access_token',
  REFRESH_TOKEN: 'ledgrio_refresh_token',
  USER_DATA: 'ledgrio_user_data',
  REMEMBER_ME: 'ledgrio_remember_me',
  THEME: 'ledgrio_theme',
  SIDEBAR_COLLAPSED: 'ledgrio_sidebar_collapsed',
};

// Query Keys for React Query
export const QUERY_KEYS = {
  USERS: 'users',
  SCHOOLS: 'schools',
  GROUP_SCHOOLS: 'group_schools',
  SESSIONS: 'sessions',
  TERMS: 'terms',
  CLASS_ARMS: 'class_arms',
  FEES: 'fees',
  PAYMENTS: 'payments',
  PAYMENT_PROFILES: 'payment_profiles',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  AUDIT_REPORTS: 'audit_reports',
  ADDRESSES: 'addresses',
  PROFILE: 'profile',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USERS: '/users',
  SCHOOLS: '/schools',
  GROUP_SCHOOLS: '/group-schools',
  SESSIONS: '/sessions',
  TERMS: '/terms',
  CLASS_ARMS: '/class-arms',
  FEES: '/fees',
  PAYMENTS: '/payments',
  EXPENSES: '/expenses',
  STUDENT_FEES: '/student/fees',
  STUDENT_MANAGEMENT: '/admin/students',
  BURSAR_CASH_PAYMENTS: '/bursar/cash-payments',
  EMAIL_CONFIG: '/admin/email-config',
  PAYMENT_CONFIG: '/admin/payment-config',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  AUDIT: '/audit',
  NOTIFICATIONS: '/notifications',
  // School Management Sub-routes
  SCHOOL_MANAGEMENT: '/school-management',
  ACADEMIC_CALENDAR: '/academic-calendar',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN: 'Password must be at least 8 characters',
  PASSWORD_MATCH: 'Passwords do not match',
  PHONE: 'Please enter a valid phone number',
  NUMBER: 'Please enter a valid number',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be no more than ${max}`,
};

// Toast Messages
export const TOAST_MESSAGES = {
  SUCCESS: {
    LOGIN: 'Successfully logged in!',
    LOGOUT: 'Successfully logged out!',
    CREATE: 'Successfully created!',
    UPDATE: 'Successfully updated!',
    DELETE: 'Successfully deleted!',
    SAVE: 'Successfully saved!',
  },
  ERROR: {
    LOGIN: 'Login failed. Please check your credentials.',
    NETWORK: 'Network error. Please try again.',
    GENERIC: 'Something went wrong. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    NOT_FOUND: 'Resource not found.',
  },
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
};

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
];

// Status Colors
export const STATUS_COLORS = {
  active: 'text-green-600 bg-green-100',
  inactive: 'text-red-600 bg-red-100',
  pending: 'text-yellow-600 bg-yellow-100',
  approved: 'text-green-600 bg-green-100',
  rejected: 'text-red-600 bg-red-100',
  success: 'text-green-600 bg-green-100',
  failed: 'text-red-600 bg-red-100',
};

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (matching Tailwind CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Environment Variables
export const ENV = {
  API_BASE_URL: (() => {
    // Handle both Vite environment and fallback
    if (metaEnv) {
      return metaEnv.VITE_API_BASE_URL || 
             (metaEnv.VITE_BACKEND_URL ? metaEnv.VITE_BACKEND_URL + '/api/v1' : null) ||
             (metaEnv.DEV ? '/api/v1' : 'http://localhost:3000/api/v1');
    }
    // Fallback for Node.js or when import.meta is not available
    return process.env.VITE_API_BASE_URL || 
           (process.env.VITE_BACKEND_URL ? process.env.VITE_BACKEND_URL + '/api/v1' : null) ||
           '/api/v1';
  })(),
  APP_NAME: metaEnv?.VITE_APP_NAME || 'Ledgrio School Management',
  PAYSTACK_PUBLIC_KEY: metaEnv?.VITE_PAYSTACK_PUBLIC_KEY || '',
  CLOUDINARY_CLOUD_NAME: metaEnv?.VITE_CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_UPLOAD_PRESET: metaEnv?.VITE_CLOUDINARY_UPLOAD_PRESET || '',
  APP_VERSION: metaEnv?.VITE_APP_VERSION || '1.0.0',
  APP_ENVIRONMENT: metaEnv?.VITE_APP_ENVIRONMENT || 'development',
};
