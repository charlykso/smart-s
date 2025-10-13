import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';
import { ROUTES } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useSchoolStore } from '../../store/schoolStore';
import type {
  Expense,
  ExpenseStatus,
  ExpenseType,
  PayeeType,
  ExpensePaymentMethod,
} from '../../types/expense';

const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  partially_paid: 'Partially Paid',
  paid: 'Paid',
};

const EXPENSE_STATUS_COLORS: Record<ExpenseStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_approval: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  partially_paid: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-green-100 text-green-700',
};

const PAYEE_TYPES: PayeeType[] = ['Vendor', 'Staff', 'Other'];
const PAYMENT_METHODS: ExpensePaymentMethod[] = ['bank_transfer', 'cash', 'cheque', 'mobile_money', 'other'];
const EXPENSE_TYPES: ExpenseType[] = [
  'StaffSalary',
  'StaffAllowance',
  'VendorService',
  'Consumables',
  'FacilitiesMaintenance',
  'AcademicResources',
  'StudentActivities',
  'Transportation',
  'Technology',
  'Administrative',
  'Utilities',
  'CapitalProject',
  'Others',
];

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount ?? 0);

interface RecordPaymentForm {
  payeeType: PayeeType;
  payeeName: string;
  amountPaid: number;
  paymentMethod: ExpensePaymentMethod;
  paymentDate: string;
  periodCovered: string;
  notes: string;
  allowances: string;
  deductions: string;
  receipt: File | null;
}

const defaultPaymentForm: RecordPaymentForm = {
  payeeType: 'Vendor',
  payeeName: '',
  amountPaid: 0,
  paymentMethod: 'bank_transfer',
  paymentDate: new Date().toISOString().slice(0, 10),
  periodCovered: '',
  notes: '',
  allowances: '',
  deductions: '',
  receipt: null,
};

const ExpenseStatusBadge: React.FC<{ status: ExpenseStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${EXPENSE_STATUS_COLORS[status]}`}
  >
    {EXPENSE_STATUS_LABELS[status]}
  </span>
);

const ExpenseManagementPage: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const {
    expenses,
    payments,
    isLoading,
    actionLoading,
    selectedExpense,
    loadExpenses,
    loadSummary,
  loadPayments,
  approveExpense,
  rejectExpense,
  createExpense,
  recordPayment,
  deleteExpense,
  deletePayment,
    setSelectedExpense,
    exportExpensesPdf,
    clearError,
  } = useExpenseStore();
  const { schools, loadSchools } = useSchoolStore();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('');
  const [schoolFilter, setSchoolFilter] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState<RecordPaymentForm>(defaultPaymentForm);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    schoolId: '',
    title: '',
    description: '',
  type: EXPENSE_TYPES[0],
    amount: '',
    currency: 'NGN',
    month: new Date().toISOString().slice(0, 7),
    expenseDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const allowedRoles = ['Admin', 'Bursar', 'Principal', 'Proprietor', 'Auditor'];
  const hasAccess = user?.roles?.some((role) => allowedRoles.includes(role)) ?? false;

  useEffect(() => {
    if (!hasAccess) {
      return;
    }
    loadExpenses({
      status: statusFilter ? (statusFilter as ExpenseStatus) : undefined,
      type: typeFilter ? (typeFilter as ExpenseType) : undefined,
      month: monthFilter || undefined,
      schoolId: schoolFilter || undefined,
      includeTotals: true,
    });
    loadSummary({ schoolId: schoolFilter || undefined });
  }, [hasAccess, statusFilter, typeFilter, monthFilter, schoolFilter, loadExpenses, loadSummary]);

  useEffect(() => {
    if (hasAccess && user?.roles?.includes('Admin') && schools.length === 0) {
      loadSchools();
    }
  }, [hasAccess, user?.roles, loadSchools, schools.length]);

  const totals = useMemo(() => {
    const totalAmount = expenses.reduce((acc, expense) => acc + (expense.amount || 0), 0);
    const totalPaid = expenses.reduce((acc, expense) => acc + (expense.totalPaid || 0), 0);
    const outstanding = totalAmount - totalPaid;
    const awaitingApproval = expenses.filter((expense) => expense.status === 'pending_approval').length;
    return {
      totalAmount,
      totalPaid,
      outstanding,
      awaitingApproval,
    };
  }, [expenses]);

  const canApprove = user?.roles?.some((role) => ['Principal', 'Proprietor', 'Admin'].includes(role)) ?? false;
  const canRecordPayment = user?.roles?.some((role) => ['Bursar', 'Admin'].includes(role)) ?? false;
  const canCreateExpense = user?.roles?.some((role) => ['Bursar', 'Admin'].includes(role)) ?? false;
  const canDeleteExpense = canRecordPayment;

  const resolvedUserSchoolId = useMemo(() => {
    if (!user?.school) {
      return '';
    }
    if (typeof user.school === 'string') {
      return user.school;
    }
    return user.school._id ?? '';
  }, [user?.school]);

  const handleSelectExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    loadPayments(expense._id);
  };

  const handleApproveExpense = async (expenseId: string) => {
    try {
      await approveExpense(expenseId);
    } catch (error) {
      console.warn('approveExpense failed', error);
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    const reason = window.prompt('Please provide a reason for rejection (optional):');
    try {
      await rejectExpense({ id: expenseId, reason: reason || undefined });
    } catch (error) {
      console.warn('rejectExpense failed', error);
    }
  };

  const handleRecordPaymentClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setPaymentForm({
      ...defaultPaymentForm,
      paymentDate: new Date().toISOString().slice(0, 10),
    });
    setShowPaymentModal(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      console.warn('deleteExpense failed', error);
    }
  };

  const handleDeletePayment = async (paymentId: string, expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) {
      return;
    }
    try {
      await deletePayment(paymentId, expenseId);
    } catch (error) {
      console.warn('deletePayment failed', error);
    }
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentForm(defaultPaymentForm);
    clearError();
  };

  const handlePaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedExpense) {
      toast.error('Please select an expense');
      return;
    }
    if (!paymentForm.receipt) {
      toast.error('Receipt upload is required');
      return;
    }
    try {
      await recordPayment(selectedExpense._id, {
        payeeType: paymentForm.payeeType,
        payeeName: paymentForm.payeeName,
        amountPaid: Number(paymentForm.amountPaid),
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: paymentForm.paymentDate,
        periodCovered: paymentForm.periodCovered || undefined,
        notes: paymentForm.notes || undefined,
        allowances: paymentForm.allowances ? Number(paymentForm.allowances) : undefined,
        deductions: paymentForm.deductions ? Number(paymentForm.deductions) : undefined,
        receipt: paymentForm.receipt,
      });
      setShowPaymentModal(false);
      setPaymentForm(defaultPaymentForm);
    } catch (error) {
      console.warn('recordPayment failed', error);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!hasAccess) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (isLoading && expenses.length === 0) {
    return (
      <MainLayout>
        <CenteredLoader message="Loading expenses..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-10 w-10 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
                <p className="text-gray-600 dark:text-gray-300">Track school expenses, approvals, and payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {canCreateExpense && (
                <button
                  type="button"
                  onClick={() => {
                    setCreateForm((prev) => ({
                      ...prev,
                      schoolId: '',
                      title: '',
                      description: '',
                      amount: '',
                      notes: '',
                      month: new Date().toISOString().slice(0, 7),
                      expenseDate: new Date().toISOString().slice(0, 10),
                    }));
                    setShowCreateModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  New Expense
                </button>
              )}
              <button
                type="button"
                onClick={() => loadExpenses({ includeTotals: true })}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                type="button"
                onClick={() => exportExpensesPdf({
                  status: statusFilter ? (statusFilter as ExpenseStatus) : undefined,
                  type: typeFilter ? (typeFilter as ExpenseType) : undefined,
                  month: monthFilter || undefined,
                  schoolId: schoolFilter || undefined,
                })}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</span>
              <CurrencyDollarIcon className="h-5 w-5 text-primary-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.totalAmount)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Paid Out</span>
              <BanknotesIcon className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.totalPaid)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Outstanding</span>
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(totals.outstanding)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Awaiting Approval</span>
              <ClockIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{totals.awaitingApproval}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {user?.roles?.includes('Admin') && (
              <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  School
                </label>
                <select
                  id="school"
                  value={schoolFilter}
                  onChange={(event) => setSchoolFilter(event.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
                >
                  <option value="">All Schools</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                {Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                {EXPENSE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Month
              </label>
              <input
                id="month"
                type="text"
                inputMode="numeric"
                placeholder="YYYY-MM"
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Expenses ({expenses.length})</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className={`border rounded-lg p-5 bg-white dark:bg-gray-800 shadow-sm transition hover:shadow-md ${
                  selectedExpense?._id === expense._id
                    ? 'border-primary-500 ring-2 ring-primary-200'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{expense.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{expense.description || 'No description provided'}</p>
                  </div>
                  <ExpenseStatusBadge status={expense.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Amount</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Paid</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(expense.totalPaid)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Balance</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(expense.balance)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Month</p>
                    <p className="font-medium text-gray-900 dark:text-white">{expense.month}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  {canApprove && ['pending_approval', 'rejected'].includes(expense.status) && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleApproveExpense(expense._id);
                      }}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                  )}
                  {canApprove && expense.status === 'pending_approval' && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRejectExpense(expense._id);
                      }}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  )}
                  {canRecordPayment && ['approved', 'partially_paid'].includes(expense.status) && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRecordPaymentClick(expense);
                      }}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                      disabled={actionLoading}
                    >
                      <ShieldCheckIcon className="h-4 w-4 mr-1" />
                      Record Payment
                    </button>
                  )}
                  {canDeleteExpense && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteExpense(expense._id);
                      }}
                      className="inline-flex items-center px-3 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      disabled={actionLoading}
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleSelectExpense(expense)}
                    className="inline-flex items-center px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100"
                    aria-pressed={selectedExpense?._id === expense._id}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedExpense && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payments for {selectedExpense.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Showing {payments.length} payment records</p>
              </div>
              {canRecordPayment && ['approved', 'partially_paid'].includes(selectedExpense.status) && (
                <button
                  type="button"
                  onClick={() => handleRecordPaymentClick(selectedExpense)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  disabled={actionLoading}
                >
                  <ShieldCheckIcon className="h-4 w-4 mr-2" />
                  Record Payment
                </button>
              )}
            </div>
            {payments.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No payments recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Date</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Payee</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Method</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-300">Amount</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Reference</th>
                      {canDeleteExpense && (
                        <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-300">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((payment) => (
                      <tr key={payment._id}>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{payment.payeeName}</td>
                        <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{payment.paymentMethod}</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-white font-medium">
                          {formatCurrency(payment.amountPaid)}
                        </td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-400">{payment.transactionReference || '—'}</td>
                        {canDeleteExpense && (
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => selectedExpense && handleDeletePayment(payment._id, selectedExpense._id)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                              disabled={actionLoading}
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && canCreateExpense && (
  <dialog open className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop:bg-black/40 border-none bg-transparent">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Expense</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Submit a new expense for approval.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();

                const schoolId = user?.roles?.includes('Admin') ? createForm.schoolId : resolvedUserSchoolId;

                if (!schoolId) {
                  toast.error('Select a school before creating an expense');
                  return;
                }

                if (!createForm.title.trim()) {
                  toast.error('Expense title is required');
                  return;
                }

                const amountNumber = Number(createForm.amount);
                if (Number.isNaN(amountNumber) || amountNumber <= 0) {
                  toast.error('Enter a valid amount greater than zero');
                  return;
                }

                try {
                  await createExpense({
                    school: schoolId,
                    title: createForm.title,
                    description: createForm.description || undefined,
                    type: createForm.type,
                    amount: amountNumber,
                    currency: createForm.currency || 'NGN',
                    month: createForm.month,
                    expenseDate: createForm.expenseDate,
                    notes: createForm.notes || undefined,
                  });
                  setShowCreateModal(false);
                } catch (error) {
                  console.warn('createExpense failed', error);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.roles?.includes('Admin') && (
                  <div className="sm:col-span-2">
                    <label htmlFor="create-school" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      School
                    </label>
                    <select
                      id="create-school"
                      value={createForm.schoolId}
                      onChange={(event) => setCreateForm((prev) => ({ ...prev, schoolId: event.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select school</option>
                      {schools.map((school) => (
                        <option key={school._id} value={school._id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label htmlFor="create-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    id="create-title"
                    value={createForm.title}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="create-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="create-description"
                    rows={3}
                    value={createForm.description}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="create-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expense Type
                  </label>
                  <select
                    id="create-type"
                    value={createForm.type}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, type: event.target.value as ExpenseType }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  >
                    {EXPENSE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="create-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount (NGN)
                  </label>
                  <input
                    id="create-amount"
                    type="number"
                    min={0}
                    step="0.01"
                    value={createForm.amount}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, amount: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="create-month" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Month
                  </label>
                  <input
                    id="create-month"
                    type="text"
                    inputMode="numeric"
                    placeholder="YYYY-MM"
                    value={createForm.month}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, month: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="create-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expense Date
                  </label>
                  <input
                    id="create-date"
                    type="date"
                    value={createForm.expenseDate}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, expenseDate: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="create-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="create-notes"
                    rows={3}
                    value={createForm.notes}
                    onChange={(event) => setCreateForm((prev) => ({ ...prev, notes: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Expense'
                  )}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}

      {showPaymentModal && selectedExpense && (
  <dialog open className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop:bg-black/40 border-none bg-transparent">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedExpense.title}</p>
              </div>
              <button
                type="button"
                onClick={closePaymentModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="payeeType">
                    Payee Type
                  </label>
                  <select
                    id="payeeType"
                    value={paymentForm.payeeType}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, payeeType: event.target.value as PayeeType }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  >
                    {PAYEE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="paymentDate">
                    Payment Date
                  </label>
                  <input
                    id="paymentDate"
                    type="date"
                    value={paymentForm.paymentDate}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentDate: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="payeeName">
                    Payee Name
                  </label>
                  <input
                    id="payeeName"
                    value={paymentForm.payeeName}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, payeeName: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="amountPaid">
                    Amount Paid (NGN)
                  </label>
                  <input
                    id="amountPaid"
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentForm.amountPaid}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, amountPaid: Number(event.target.value) }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="paymentMethod">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={paymentForm.paymentMethod}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentMethod: event.target.value as ExpensePaymentMethod }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="periodCovered">
                    Period Covered
                  </label>
                  <input
                    id="periodCovered"
                    value={paymentForm.periodCovered}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, periodCovered: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="allowances">
                    Allowances (optional)
                  </label>
                  <input
                    id="allowances"
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentForm.allowances}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, allowances: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="deductions">
                    Deductions (optional)
                  </label>
                  <input
                    id="deductions"
                    type="number"
                    min={0}
                    step="0.01"
                    value={paymentForm.deductions}
                    onChange={(event) => setPaymentForm((prev) => ({ ...prev, deductions: event.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, notes: event.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="receipt">
                  Receipt Upload
                </label>
                <input
                  id="receipt"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setPaymentForm((prev) => ({ ...prev, receipt: file }));
                  }}
                  className="w-full text-sm text-gray-600 dark:text-gray-300"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closePaymentModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </MainLayout>
  );
};

export default ExpenseManagementPage;
