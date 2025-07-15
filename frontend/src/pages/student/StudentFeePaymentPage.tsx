import React, { useEffect, useState, useCallback } from 'react';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { STORAGE_KEYS, ENV } from '../../constants';
import MainLayout from '../../components/layout/MainLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StudentFeeCard from '../../components/student/StudentFeeCard';
import EnhancedPaymentModal from '../../components/student/EnhancedPaymentModal';
import PaymentHistoryCard from '../../components/student/PaymentHistoryCard';
import type { Fee, Payment } from '../../types/fee';

const StudentFeePaymentPage: React.FC = () => {
  const { user, token } = useAuthStore();

  // State for data
  const [approvedFees, setApprovedFees] = useState<Fee[]>([]);
  const [outstandingFees, setOutstandingFees] = useState<Fee[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [activeTab, setActiveTab] = useState<'fees' | 'history'>('fees');

  // Helper function to make authenticated API calls
  const makeApiCall = useCallback(async (endpoint: string) => {
    const accessToken = token || localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (!accessToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${ENV.API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }, [token, user]);

  // Load all data
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load approved fees, outstanding fees, and payments in parallel
      const [approvedData, outstandingData, paymentsData] = await Promise.all([
        makeApiCall('/fee/student/approved-fees'),
        makeApiCall('/student/outstanding-fees'), // This endpoint exists and returns outstanding fees
        makeApiCall('/payment/student/my-payments')
      ]);
      
      // Set approved fees
      if (approvedData.success && approvedData.data) {
        setApprovedFees(approvedData.data);
      } else {
        setApprovedFees([]);
      }
      
      // Set outstanding fees (from student outstanding-fees endpoint)
      if (outstandingData.success && outstandingData.data) {
        // Extract outstanding fees from student data
        const fees = outstandingData.data.outstandingFees || [];
        setOutstandingFees(fees);
      } else {
        setOutstandingFees([]);
      }

      // Set payments
      if (paymentsData.success && paymentsData.data) {
        setPayments(paymentsData.data);
      } else {
        setPayments([]);
      }
      
    } catch (error) {
      console.error('Error loading fee data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load fee data');
    } finally {
      setLoading(false);
    }
  }, [user, makeApiCall]);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePayFee = (fee: Fee) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedFee(null);
    // Refresh data after successful payment
    loadData();
  };

  if (loading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Fees</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Calculate fee statistics
  const urgentFees = approvedFees.filter(fee => {
    if (!fee.dueDate) return false;
    const dueDate = new Date(fee.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  });

  const overdueFees = approvedFees.filter(fee => {
    if (!fee.dueDate) return false;
    const dueDate = new Date(fee.dueDate);
    const today = new Date();
    return dueDate < today;
  });

  const totalOutstanding = outstandingFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Fee Payments
                </h1>
                <p className="text-gray-600 mt-1">
                  View and manage your school fees, payment history, and available payment methods.
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Outstanding Amount</p>
              <p className={`text-2xl font-bold ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₦{totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <nav className="flex gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('fees')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'fees'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              Available Fees
              {approvedFees.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {approvedFees.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'history'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Payment History
              {payments.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {payments.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Alert Banners */}
        {overdueFees.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  Overdue Fees Alert
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  You have {overdueFees.length} overdue fee(s). Please make payment immediately to avoid penalties.
                </p>
              </div>
            </div>
          </div>
        )}

        {urgentFees.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Payment Due Soon
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  You have {urgentFees.length} fee(s) due within the next 7 days.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approved Fees Tab */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Fees</p>
                    <p className="text-2xl font-semibold text-blue-600">
                      {approvedFees.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Overdue Fees</p>
                    <p className="text-2xl font-semibold text-yellow-600">{overdueFees.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Due Soon</p>
                    <p className="text-2xl font-semibold text-yellow-600">{urgentFees.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Overdue</p>
                    <p className="text-2xl font-semibold text-red-600">{overdueFees.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Fees List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Available Fees for Payment ({approvedFees.length})
                </h2>
              </div>

              {approvedFees.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No fees available for payment</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All your current fees have been paid. Check back later for new fee notifications.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedFees.map((fee) => (
                    <StudentFeeCard
                      key={fee._id}
                      fee={{
                        _id: fee._id,
                        name: fee.name,
                        amount: fee.amount,
                        type: fee.type,
                        term: typeof fee.term === 'string' 
                          ? { _id: fee.term, name: 'Unknown Term' }
                          : { _id: fee.term._id, name: fee.term.name },
                        dueDate: fee.dueDate,
                        description: fee.decription, // Note: Backend typo
                        isInstallmentAllowed: fee.isInstallmentAllowed,
                        no_ofInstallments: fee.no_ofInstallments,
                      }}
                      onPayNow={handlePayFee}
                      isOverdue={overdueFees.some(f => f._id === fee._id)}
                      isDueSoon={urgentFees.some(f => f._id === fee._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Payment History ({payments.length})
              </h2>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your payment history will appear here once you make payments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <PaymentHistoryCard
                    key={payment._id}
                    payment={{
                      _id: payment._id,
                      amount: payment.amount,
                      fee: typeof payment.fee === 'string'
                        ? {
                            _id: payment.fee,
                            name: 'Unknown Fee',
                            amount: payment.amount,
                            type: 'unknown',
                          }
                        : {
                            _id: payment.fee._id,
                            name: payment.fee.name,
                            amount: payment.fee.amount,
                            type: payment.fee.type,
                            term: payment.fee.term,
                          },
                      status: payment.status,
                      mode_of_payment: payment.mode_of_payment,
                      trans_date: payment.trans_date,
                      trx_ref: payment.trx_ref || '',
                      trans_id: payment.trans_id,
                      channel: payment.channel,
                      isInstallment: payment.isInstallment,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Payment Modal */}
      <EnhancedPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        fee={selectedFee}
        onSuccess={handlePaymentSuccess}
      />
    </MainLayout>
  );
};

export default StudentFeePaymentPage;
