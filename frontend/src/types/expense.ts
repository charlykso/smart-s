import type { School, Session, Term, User } from './index';

export type ExpenseStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'partially_paid'
  | 'paid';

export type ExpenseType =
  | 'StaffSalary'
  | 'StaffAllowance'
  | 'VendorService'
  | 'Consumables'
  | 'FacilitiesMaintenance'
  | 'AcademicResources'
  | 'StudentActivities'
  | 'Transportation'
  | 'Technology'
  | 'Administrative'
  | 'Utilities'
  | 'CapitalProject'
  | 'Others';

export interface Expense {
  _id: string;
  school: School | string;
  session?: Session | string;
  term?: Term | string;
  title: string;
  description?: string;
  type: ExpenseType;
  amount: number;
  currency: string;
  month: string;
  expenseDate: string;
  status: ExpenseStatus;
  notes?: string;
  attachments?: string[];
  totalPaid?: number;
  balance?: number;
  createdBy?: User | string;
  updatedBy?: User | string;
  approvedBy?: User | string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseSummaryEntry = {
  type: ExpenseType;
  totalAmount: number;
  count: number;
};

export type ExpenseSummaryRow = {
  _id: string; // month string eg 2024-04
  expenses: ExpenseSummaryEntry[];
  monthTotal: number;
};

export type PayeeType = 'Staff' | 'Vendor' | 'Other';

export type ExpensePaymentMethod =
  | 'bank_transfer'
  | 'cash'
  | 'cheque'
  | 'mobile_money'
  | 'other';

export interface ExpensePayment {
  _id: string;
  expense: Expense | string;
  school: School | string;
  payeeType: PayeeType;
  payee?: User | string;
  payeeName: string;
  paymentDate: string;
  amountPaid: number;
  currency: string;
  paymentMethod: ExpensePaymentMethod;
  transactionReference?: string;
  periodCovered?: string;
  receiptUrl: string;
  notes?: string;
  breakdown: {
    allowances: number;
    deductions: number;
  };
  recordedBy: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFilters {
  schoolId?: string;
  status?: ExpenseStatus;
  type?: ExpenseType;
  month?: string;
  from?: string;
  to?: string;
  includeTotals?: boolean;
}

export interface CreateExpenseData {
  school: string;
  session?: string;
  term?: string;
  title: string;
  description?: string;
  type: ExpenseType;
  amount: number;
  currency?: string;
  month: string;
  expenseDate?: string;
  notes?: string;
  attachments?: string[];
}

export interface UpdateExpenseData extends Partial<CreateExpenseData> {
  _id: string;
}

export interface ApproveExpensePayload {
  id: string;
}

export interface RejectExpensePayload {
  id: string;
  reason?: string;
}

export interface RecordExpensePaymentData {
  payeeType: PayeeType;
  payeeId?: string;
  payeeName: string;
  paymentDate?: string;
  amountPaid: number;
  currency?: string;
  paymentMethod: ExpensePaymentMethod;
  transactionReference?: string;
  periodCovered?: string;
  notes?: string;
  allowances?: number;
  deductions?: number;
  receipt: File;
}

export interface ExpenseStoreState {
  expenses: Expense[];
  payments: ExpensePayment[];
  summary: ExpenseSummaryRow[];
  selectedExpense: Expense | null;
  isLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

export interface ExpenseStoreActions {
  loadExpenses: (filters?: ExpenseFilters) => Promise<void>;
  loadExpense: (id: string) => Promise<Expense | null>;
  createExpense: (data: CreateExpenseData) => Promise<Expense>;
  updateExpense: (data: UpdateExpenseData) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  approveExpense: (id: string) => Promise<void>;
  rejectExpense: (payload: RejectExpensePayload) => Promise<void>;
  loadSummary: (filters?: ExpenseFilters) => Promise<void>;
  exportExpensesPdf: (filters?: ExpenseFilters) => Promise<void>;
  loadPayments: (expenseId?: string) => Promise<void>;
  recordPayment: (expenseId: string, data: RecordExpensePaymentData) => Promise<void>;
  deletePayment: (paymentId: string, expenseId: string) => Promise<void>;
  setSelectedExpense: (expense: Expense | null) => void;
  clearError: () => void;
  reset: () => void;
}

export type ExpenseStore = ExpenseStoreState & ExpenseStoreActions;
