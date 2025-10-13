import { create } from 'zustand';
import toast from 'react-hot-toast';
import { ExpenseService } from '../services/expenseService';
import type {
  Expense,
  ExpenseStore,
  ExpenseStoreState,
  ExpenseFilters,
  CreateExpenseData,
  UpdateExpenseData,
  RejectExpensePayload,
  RecordExpensePaymentData,
} from '../types/expense';

const initialState: ExpenseStoreState = {
  expenses: [],
  payments: [],
  summary: [],
  selectedExpense: null,
  isLoading: false,
  actionLoading: false,
  error: null,
};

const deriveStatusFromTotals = (current: Expense, totalPaid: number, balance: number): Expense['status'] => {
  if (balance <= 0) {
    return 'paid';
  }
  if (totalPaid > 0) {
    return 'partially_paid';
  }
  if (current.status === 'rejected') {
    return 'rejected';
  }
  if (current.status === 'draft') {
    return 'draft';
  }
  return 'approved';
};

export const useExpenseStore = create<ExpenseStore>((set) => ({
  ...initialState,

  loadExpenses: async (filters?: ExpenseFilters) => {
    set({ isLoading: true, error: null });
    try {
      const data = await ExpenseService.getExpenses({ ...filters, includeTotals: true });
      set({ expenses: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load expenses';
      set({ error: message, isLoading: false, expenses: [] });
      toast.error(message);
    }
  },

  loadExpense: async (id: string) => {
    try {
      const expense = await ExpenseService.getExpense(id);
      set({ selectedExpense: expense });
      return expense;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load expense';
      toast.error(message);
      return null;
    }
  },

  createExpense: async (data: CreateExpenseData) => {
    set({ actionLoading: true, error: null });
    try {
      const expense = await ExpenseService.createExpense(data);
      set((state) => ({
        expenses: [...state.expenses, expense],
        actionLoading: false,
      }));
      toast.success('Expense created successfully');
      return expense;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create expense';
      set({ actionLoading: false, error: message });
      toast.error(message);
      throw error;
    }
  },

  updateExpense: async (data: UpdateExpenseData) => {
    set({ actionLoading: true, error: null });
    try {
      const expense = await ExpenseService.updateExpense(data);
      set((state) => ({
        expenses: state.expenses.map((item) => (item._id === expense._id ? expense : item)),
        selectedExpense: state.selectedExpense && state.selectedExpense._id === expense._id ? expense : state.selectedExpense,
        actionLoading: false,
      }));
      toast.success('Expense updated successfully');
      return expense;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update expense';
      set({ actionLoading: false, error: message });
      toast.error(message);
      throw error;
    }
  },

  deleteExpense: async (id: string) => {
    set({ actionLoading: true, error: null });
    try {
      await ExpenseService.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((expense) => expense._id !== id),
        selectedExpense: state.selectedExpense && state.selectedExpense._id === id ? null : state.selectedExpense,
        actionLoading: false,
      }));
      toast.success('Expense deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete expense';
      set({ actionLoading: false, error: message });
      toast.error(message);
      throw error;
    }
  },

  approveExpense: async (id: string) => {
    set({ actionLoading: true, error: null });
    try {
      const expense = await ExpenseService.approveExpense(id);
      set((state) => ({
        expenses: state.expenses.map((item) => (item._id === expense._id ? expense : item)),
        selectedExpense: state.selectedExpense && state.selectedExpense._id === expense._id ? expense : state.selectedExpense,
        actionLoading: false,
      }));
      toast.success('Expense approved successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve expense';
      set({ actionLoading: false, error: message });
      toast.error(message);
      throw error;
    }
  },

  rejectExpense: async ({ id, reason }: RejectExpensePayload) => {
    set({ actionLoading: true, error: null });
    try {
      const expense = await ExpenseService.rejectExpense(id, reason);
      set((state) => ({
        expenses: state.expenses.map((item) => (item._id === expense._id ? expense : item)),
        selectedExpense: state.selectedExpense && state.selectedExpense._id === expense._id ? expense : state.selectedExpense,
        actionLoading: false,
      }));
      toast.success('Expense rejected successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject expense';
      set({ actionLoading: false, error: message });
      toast.error(message);
      throw error;
    }
  },

  loadSummary: async (filters?: ExpenseFilters) => {
    try {
      const summary = await ExpenseService.getSummary(filters);
      set({ summary });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load summary';
      set({ error: message });
      toast.error(message);
    }
  },

  exportExpensesPdf: async (filters?: ExpenseFilters) => {
    set({ actionLoading: true, error: null });
    try {
      await ExpenseService.exportExpenses(filters);
      set({ actionLoading: false });
      toast.success('Expense report exported');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export expenses';
      set({ actionLoading: false, error: message });
      toast.error(message);
      throw error;
    }
  },

  loadPayments: async (expenseId?: string) => {
    set({ actionLoading: true, error: null });
    try {
      const payments = await ExpenseService.getPayments(expenseId);
      set({ payments, actionLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load payments';
      set({ actionLoading: false, error: message, payments: [] });
      toast.error(message);
    }
  },

  recordPayment: async (expenseId: string, data: RecordExpensePaymentData) => {
    set({ actionLoading: true, error: null });
    try {
      const result = await ExpenseService.recordPayment(expenseId, data);
      set((state) => {
        const updatedExpenses = state.expenses.map((expense) => {
          if (expense._id !== expenseId) {
            return expense;
          }
          const status = deriveStatusFromTotals(expense, result.totals.totalPaid, result.totals.balance);
          return {
            ...expense,
            totalPaid: result.totals.totalPaid,
            balance: result.totals.balance,
            status,
          };
        });

        const updatedSelected = state.selectedExpense && state.selectedExpense._id === expenseId
          ? {
              ...state.selectedExpense,
              totalPaid: result.totals.totalPaid,
              balance: result.totals.balance,
              status: deriveStatusFromTotals(state.selectedExpense, result.totals.totalPaid, result.totals.balance),
            }
          : state.selectedExpense;

        return {
          expenses: updatedExpenses,
          payments: [result.payment, ...state.payments],
          selectedExpense: updatedSelected,
          actionLoading: false,
        };
      });
      toast.success('Payment recorded successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to record payment';
      set({ actionLoading: false, error: message });
      toast.error(message);
      throw error;
    }
  },

  deletePayment: async (paymentId: string, expenseId: string) => {
    set({ actionLoading: true, error: null });
    try {
      const totals = await ExpenseService.deletePayment(paymentId);
      set((state) => {
        const updatedExpenses = state.expenses.map((expense) => {
          if (expense._id !== expenseId) {
            return expense;
          }
          const status = deriveStatusFromTotals(expense, totals.totalPaid, totals.balance);
          return {
            ...expense,
            totalPaid: totals.totalPaid,
            balance: totals.balance,
            status,
          };
        });

        const updatedSelected = state.selectedExpense && state.selectedExpense._id === expenseId
          ? {
              ...state.selectedExpense,
              totalPaid: totals.totalPaid,
              balance: totals.balance,
              status: deriveStatusFromTotals(state.selectedExpense, totals.totalPaid, totals.balance),
            }
          : state.selectedExpense;

        return {
          expenses: updatedExpenses,
          payments: state.payments.filter((payment) => payment._id !== paymentId),
          selectedExpense: updatedSelected,
          actionLoading: false,
        };
      });
      toast.success('Payment deleted successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete payment';
      set({ actionLoading: false, error: message });
      toast.error(message);
      throw error;
    }
  },

  setSelectedExpense: (expense: Expense | null) => {
    set({ selectedExpense: expense });
  },

  clearError: () => set({ error: null }),

  reset: () => set({ ...initialState }),
}));
