import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { FeeService } from '../services/feeService';
import type {
  Fee,
  Payment,
  CreateFeeData,
  UpdateFeeData,
  InitiatePaymentData,
  CashPaymentData,
  CreatePaymentProfileData,
  UpdatePaymentProfileData,
  FeeFilters,
  PaymentFilters,
  FeeManagementState,
  FeeManagementActions,
} from '../types/fee';

interface FeeStore extends FeeManagementState, FeeManagementActions {}

const initialState: FeeManagementState = {
  fees: [],
  payments: [],
  paymentProfiles: [],
  selectedFee: null,
  selectedPayment: null,
  feeStats: null,
  paymentStats: null,
  pendingApprovals: [],
  isLoading: false,
  error: null,
};

export const useFeeStore = create<FeeStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fee Actions
      loadFees: async (filters?: FeeFilters) => {
        set({ isLoading: true, error: null });
        try {
          const fees = await FeeService.getFees();
          // Apply client-side filtering if filters are provided
          let filteredFees = fees;
          
          if (filters) {
            filteredFees = fees.filter(fee => {
              if (filters.school && typeof fee.school === 'object' && fee.school._id !== filters.school) return false;
              if (filters.term && typeof fee.term === 'object' && fee.term._id !== filters.term) return false;
              if (filters.type && fee.type !== filters.type) return false;
              if (filters.isActive !== undefined && fee.isActive !== filters.isActive) return false;
              if (filters.isApproved !== undefined && fee.isApproved !== filters.isApproved) return false;
              if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                return fee.name.toLowerCase().includes(searchLower) ||
                       fee.decription.toLowerCase().includes(searchLower) ||
                       fee.type.toLowerCase().includes(searchLower);
              }
              return true;
            });
          }
          
          set({ fees: filteredFees, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load fees';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      loadFeesByTerm: async (termId: string) => {
        set({ isLoading: true, error: null });
        try {
          const fees = await FeeService.getFeesByTerm(termId);
          set({ fees, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load fees by term';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      loadApprovedFees: async () => {
        set({ isLoading: true, error: null });
        try {
          const fees = await FeeService.getApprovedFees();
          set({ fees, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load approved fees';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      loadUnapprovedFees: async () => {
        set({ isLoading: true, error: null });
        try {
          const fees = await FeeService.getUnapprovedFees();
          set({ fees, pendingApprovals: fees, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load unapproved fees';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      createFee: async (data: CreateFeeData) => {
        set({ isLoading: true, error: null });
        try {
          const newFee = await FeeService.createFee(data);
          const { fees } = get();
          set({ 
            fees: [...fees, newFee], 
            isLoading: false 
          });
          toast.success('Fee created successfully!');
          return newFee;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create fee';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updateFee: async (data: UpdateFeeData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedFee = await FeeService.updateFee(data);
          const { fees } = get();
          set({ 
            fees: fees.map(fee => fee._id === data._id ? updatedFee : fee), 
            isLoading: false 
          });
          toast.success('Fee updated successfully!');
          return updatedFee;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update fee';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      deleteFee: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await FeeService.deleteFee(id);
          const { fees } = get();
          set({ 
            fees: fees.filter(fee => fee._id !== id), 
            isLoading: false 
          });
          toast.success('Fee deleted successfully!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete fee';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      approveFee: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await FeeService.approveFee(id);
          const { fees, pendingApprovals } = get();
          set({ 
            fees: fees.map(fee => fee._id === id ? { ...fee, isApproved: true } : fee),
            pendingApprovals: pendingApprovals.filter(fee => fee._id !== id),
            isLoading: false 
          });
          toast.success('Fee approved successfully!');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to approve fee';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Payment Actions
      loadPayments: async (filters?: PaymentFilters) => {
        set({ isLoading: true, error: null });
        try {
          const payments = await FeeService.getPayments();
          // Apply client-side filtering if filters are provided
          let filteredPayments = payments;
          
          if (filters) {
            filteredPayments = payments.filter(payment => {
              if (filters.user && typeof payment.user === 'object' && payment.user._id !== filters.user) return false;
              if (filters.fee && typeof payment.fee === 'object' && payment.fee._id !== filters.fee) return false;
              if (filters.status && payment.status !== filters.status) return false;
              if (filters.mode_of_payment && payment.mode_of_payment !== filters.mode_of_payment) return false;
              if (filters.dateFrom && new Date(payment.trans_date) < new Date(filters.dateFrom)) return false;
              if (filters.dateTo && new Date(payment.trans_date) > new Date(filters.dateTo)) return false;
              if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                return payment.trx_ref?.toLowerCase().includes(searchLower) ||
                       payment.trans_id?.toLowerCase().includes(searchLower);
              }
              return true;
            });
          }
          
          set({ payments: filteredPayments, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load payments';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      initiatePayment: async (data: InitiatePaymentData) => {
        set({ isLoading: true, error: null });
        try {
          const result = await FeeService.initiatePayment(data);
          set({ isLoading: false });
          toast.success(result.message);
          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      processCashPayment: async (data: CashPaymentData) => {
        set({ isLoading: true, error: null });
        try {
          const newPayment = await FeeService.processCashPayment(data);
          const { payments } = get();
          set({ 
            payments: [...payments, newPayment], 
            isLoading: false 
          });
          // Don't show toast here - let the component handle it
          return newPayment;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to process cash payment';
          set({ error: errorMessage, isLoading: false });
          // Don't show toast here - let the component handle it
          throw error;
        }
      },

      loadPaymentsByMethod: async (method: string) => {
        set({ isLoading: true, error: null });
        try {
          let payments: Payment[] = [];
          
          switch (method) {
            case 'paystack':
              payments = await FeeService.getPaymentsByPaystack();
              break;
            case 'bank_transfer':
              payments = await FeeService.getPaymentsByBankTransfer();
              break;
            case 'flutterwave':
              payments = await FeeService.getPaymentsByFlutterwave();
              break;
            case 'cash':
              payments = await FeeService.getPaymentsByCash();
              break;
            default:
              throw new Error('Invalid payment method');
          }
          
          set({ payments, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to load ${method} payments`;
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Payment Profile Actions
      loadPaymentProfiles: async () => {
        set({ isLoading: true, error: null });
        try {
          const paymentProfiles = await FeeService.getPaymentProfiles();
          set({ paymentProfiles, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load payment profiles';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      createPaymentProfile: async (data: CreatePaymentProfileData) => {
        set({ isLoading: true, error: null });
        try {
          const newProfile = await FeeService.createPaymentProfile(data);
          const { paymentProfiles } = get();
          set({ 
            paymentProfiles: [...paymentProfiles, newProfile], 
            isLoading: false 
          });
          toast.success('Payment profile created successfully!');
          return newProfile;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create payment profile';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      updatePaymentProfile: async (data: UpdatePaymentProfileData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProfile = await FeeService.updatePaymentProfile(data._id, data);
          const { paymentProfiles } = get();
          set({ 
            paymentProfiles: paymentProfiles.map(profile => 
              profile._id === data._id ? updatedProfile : profile
            ), 
            isLoading: false 
          });
          toast.success('Payment profile updated successfully!');
          return updatedProfile;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update payment profile';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          throw error;
        }
      },

      // Statistics Actions
      loadFeeStats: async (schoolId?: string, termId?: string) => {
        try {
          const feeStats = await FeeService.getFeeStats(schoolId, termId);
          set({ feeStats });
        } catch (error: unknown) {
          // If stats endpoint doesn't exist, calculate from existing fees
          const { fees } = get();
          if (fees.length > 0) {
            const calculatedStats = {
              totalFees: fees.length,
              approvedFees: fees.filter(fee => fee.isApproved).length,
              pendingApproval: fees.filter(fee => !fee.isApproved).length,
              activeFees: fees.filter(fee => fee.isActive).length,
              totalAmount: fees.reduce((sum, fee) => sum + fee.amount, 0),
              approvedAmount: fees.filter(fee => fee.isApproved).reduce((sum, fee) => sum + fee.amount, 0),
              pendingAmount: fees.filter(fee => !fee.isApproved).reduce((sum, fee) => sum + fee.amount, 0),
            };
            set({ feeStats: calculatedStats });
          }
          // Don't show error toast for missing stats endpoint
          console.warn('Fee stats endpoint not available, using calculated stats:', error);
        }
      },

      loadPaymentStats: async (schoolId?: string, termId?: string) => {
        try {
          const paymentStats = await FeeService.getPaymentStats(schoolId, termId);
          set({ paymentStats });
        } catch (error: unknown) {
          // If stats endpoint doesn't exist, calculate from existing payments
          const { payments } = get();
          if (payments.length > 0) {
            const calculatedStats = {
              totalPayments: payments.length,
              successfulPayments: payments.filter(payment => payment.status === 'success').length,
              pendingPayments: payments.filter(payment => payment.status === 'pending').length,
              failedPayments: payments.filter(payment => payment.status === 'failed').length,
              totalAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
              successfulAmount: payments.filter(payment => payment.status === 'success').reduce((sum, payment) => sum + payment.amount, 0),
              pendingAmount: payments.filter(payment => payment.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0),
              paymentsByMethod: {
                paystack: payments.filter(p => p.mode_of_payment === 'paystack').length,
                flutterwave: payments.filter(p => p.mode_of_payment === 'flutterwave').length,
                bank_transfer: payments.filter(p => p.mode_of_payment === 'bank_transfer').length,
                cash: payments.filter(p => p.mode_of_payment === 'cash').length,
              },
              recentPayments: payments.slice(-5), // Add recent payments to match interface
            };
            set({ paymentStats: calculatedStats });
          }
          // Don't show error toast for missing stats endpoint
          console.warn('Payment stats endpoint not available, using calculated stats:', error);
        }
      },

      // Selection Actions
      setSelectedFee: (fee: Fee | null) => {
        set({ selectedFee: fee });
      },

      setSelectedPayment: (payment: Payment | null) => {
        set({ selectedPayment: payment });
      },

      // Utility Actions
      clearError: () => {
        set({ error: null });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'fee-management-store',
      partialize: (state) => ({
        selectedFee: state.selectedFee,
        selectedPayment: state.selectedPayment,
      }),
    }
  )
);
