// Fee Management Types

import type { School, Session, Term, User } from './index';

// Core Fee Types
export interface Fee {
  _id: string;
  term: Term | string;
  school: School | string;
  name: string;
  decription: string; // Note: Backend has typo "decription"
  type: string;
  isActive: boolean;
  isInstallmentAllowed: boolean;
  no_ofInstallments: number;
  amount: number;
  isApproved: boolean;
  dueDate?: string; // Optional due date for fee payment
  createdAt: string;
  updatedAt: string;
}

// Payment Mode Types
export type PaymentMode = 'paystack' | 'flutterwave' | 'bank_transfer' | 'cash';

// Payment Types
export interface Payment {
  _id: string;
  user: User | string;
  fee: Fee | string;
  trans_id?: string;
  trx_ref?: string;
  amount: number;
  trans_date: string;
  mode_of_payment: PaymentMode;
  status: 'pending' | 'success' | 'failed';
  isInstallment: boolean;
  channel?: 'web' | 'mobile' | 'pos' | 'card' | 'cash';
  paid_at?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment Profile Types
export interface PaymentProfile {
  _id: string;
  school: School | string;
  fw_secret_key?: string;
  fw_public_key?: string;
  activate_fw: boolean;
  ps_secret_key?: string;
  ps_public_key?: string;
  activate_ps: boolean;
  account_no?: string;
  account_name?: string;
  bank_name?: string;
  createdAt: string;
  updatedAt: string;
}

// Available Payment Method Configuration
export interface PaymentMethodConfig {
  method: PaymentMode;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  bank_details?: {
    account_no: string;
    account_name: string;
    bank_name: string;
  };
}

// Form Data Types
export interface CreateFeeData {
  school_id: string;
  session_id: string;
  term_id: string;
  name: string;
  decription: string; // Note: Backend has typo
  type: string;
  amount: number;
  isActive?: boolean;
  isInstallmentAllowed?: boolean;
  no_ofInstallments?: number;
  isApproved?: boolean;
}

export interface UpdateFeeData extends Partial<CreateFeeData> {
  _id: string;
}

export interface CreatePaymentData {
  user_id: string;
  fee_id: string;
  amount?: number;
  mode_of_payment: PaymentMode;
}

export interface InitiatePaymentData {
  user_id: string;
  fee_id: string;
  school_id?: string;
  payment_method?: PaymentMode;
}

export interface CashPaymentData {
  user_id: string;
  fee_id: string;
}

export interface CreatePaymentProfileData {
  school_id: string;
  fw_secret_key?: string;
  fw_public_key?: string;
  activate_fw?: boolean;
  ps_secret_key?: string;
  ps_public_key?: string;
  activate_ps?: boolean;
  account_no?: string;
  account_name?: string;
  bank_name?: string;
}

export interface UpdatePaymentProfileData extends Partial<CreatePaymentProfileData> {
  _id: string;
}

// Filter Types
export interface FeeFilters {
  school?: string;
  term?: string;
  type?: string;
  isActive?: boolean;
  isApproved?: boolean;
  search?: string;
}

export interface PaymentFilters {
  user?: string;
  fee?: string;
  status?: 'pending' | 'success' | 'failed';
  mode_of_payment?: PaymentMode;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Statistics Types
export interface FeeStats {
  totalFees: number;
  approvedFees: number;
  pendingApproval: number;
  activeFees: number;
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
}

export interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalAmount: number;
  successfulAmount: number;
  pendingAmount: number;
  paymentsByMethod: {
    paystack: number;
    flutterwave: number;
    bank_transfer: number;
    cash: number;
  };
  recentPayments: Payment[];
}

// Audit Types
export interface FeeAuditLog {
  _id: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  fee: Fee;
  user: User;
  changes?: Record<string, string | number | boolean>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PaymentAuditLog {
  _id: string;
  action: 'initiate' | 'success' | 'failed' | 'refund';
  payment: Payment;
  user: User;
  details?: Record<string, string | number | boolean>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

// Report Types
export interface FeeReport {
  _id: string;
  title: string;
  type: 'fee_summary' | 'payment_summary' | 'reconciliation' | 'audit_trail';
  school?: School;
  term?: Term;
  dateRange: {
    from: string;
    to: string;
  };
  data: Record<string, unknown>;
  generatedBy: User;
  createdAt: string;
}

export interface ReconciliationReport {
  school: School;
  term: Term;
  totalFeesConfigured: number;
  totalFeesAmount: number;
  totalPaymentsReceived: number;
  totalPaymentsAmount: number;
  outstandingAmount: number;
  reconciliationStatus: 'balanced' | 'discrepancy';
  discrepancies: {
    type: string;
    description: string;
    amount: number;
  }[];
  generatedAt: string;
}

// Component Props Types
export interface FeeCardProps {
  fee: Fee;
  onEdit?: (fee: Fee) => void;
  onDelete?: (fee: Fee) => void;
  onApprove?: (fee: Fee) => void;
  onReject?: (fee: Fee) => void;
  showActions?: boolean;
}

export interface PaymentCardProps {
  payment: Payment;
  onView?: (payment: Payment) => void;
  onRefund?: (payment: Payment) => void;
  showActions?: boolean;
}

export interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee?: Fee;
  schools: School[];
  sessions: Session[];
  terms: Term[];
  onSubmit: (data: CreateFeeData | UpdateFeeData) => Promise<void>;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: Fee;
  user?: User;
  onSubmit: (data: InitiatePaymentData) => Promise<void>;
}

export interface PaymentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentProfile?: PaymentProfile;
  schools: School[];
  onSubmit: (data: CreatePaymentProfileData | UpdatePaymentProfileData) => Promise<void>;
}

export interface FeeApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: Fee;
  onApprove: (feeId: string) => Promise<void>;
  onReject: (feeId: string, reason: string) => Promise<void>;
}

// Store Types
export interface FeeManagementState {
  fees: Fee[];
  payments: Payment[];
  paymentProfiles: PaymentProfile[];
  selectedFee: Fee | null;
  selectedPayment: Payment | null;
  feeStats: FeeStats | null;
  paymentStats: PaymentStats | null;
  pendingApprovals: Fee[];
  isLoading: boolean;
  error: string | null;
}

export interface FeeManagementActions {
  // Fee Actions
  loadFees: (filters?: FeeFilters) => Promise<void>;
  loadFeesByTerm: (termId: string) => Promise<void>;
  loadApprovedFees: () => Promise<void>;
  loadUnapprovedFees: () => Promise<void>;
  createFee: (data: CreateFeeData) => Promise<Fee>;
  updateFee: (data: UpdateFeeData) => Promise<Fee>;
  deleteFee: (id: string) => Promise<void>;
  approveFee: (id: string) => Promise<void>;
  
  // Payment Actions
  loadPayments: (filters?: PaymentFilters) => Promise<void>;
  initiatePayment: (data: InitiatePaymentData) => Promise<{ paymentUrl?: string; message: string }>;
  processCashPayment: (data: CashPaymentData) => Promise<Payment>;
  loadPaymentsByMethod: (method: string) => Promise<void>;
  
  // Payment Profile Actions
  loadPaymentProfiles: () => Promise<void>;
  createPaymentProfile: (data: CreatePaymentProfileData) => Promise<PaymentProfile>;
  updatePaymentProfile: (data: UpdatePaymentProfileData) => Promise<PaymentProfile>;
  
  // Statistics Actions
  loadFeeStats: (schoolId?: string, termId?: string) => Promise<void>;
  loadPaymentStats: (schoolId?: string, termId?: string) => Promise<void>;
  
  // Selection Actions
  setSelectedFee: (fee: Fee | null) => void;
  setSelectedPayment: (payment: Payment | null) => void;
  
  // Utility Actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

// Fee Types Enum
export const FEE_TYPES = {
  TUITION: 'tuition',
  DEVELOPMENT: 'development',
  SPORTS: 'sports',
  LIBRARY: 'library',
  LABORATORY: 'laboratory',
  EXAMINATION: 'examination',
  UNIFORM: 'uniform',
  TRANSPORT: 'transport',
  FEEDING: 'feeding',
  MISCELLANEOUS: 'miscellaneous',
} as const;

export type FeeType = typeof FEE_TYPES[keyof typeof FEE_TYPES];

// Payment Status Enum
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
} as const;

export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

// Payment Method Enum
export const PAYMENT_METHODS = {
  PAYSTACK: 'paystack',
  FLUTTERWAVE: 'flutterwave',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
} as const;

export type PaymentMethodType = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
