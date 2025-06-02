import React, { useEffect, useState } from 'react';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BanknotesIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useStudentStore } from '../../store/studentStore';
import { useFeeStore } from '../../store/feeStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StudentFeeCard from '../../components/student/StudentFeeCard';
import EnhancedPaymentModal from '../../components/student/EnhancedPaymentModal';
import PaymentHistoryCard from '../../components/student/PaymentHistoryCard';
import { FeeService } from '../../services/feeService';

const StudentFeePaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    dashboardData,
    outstandingFees,
    payments,
    totalOutstanding,
    dashboardLoading,
    fetchDashboardData,
    fetchOutstandingFees,
    fetchPayments,
  } = useStudentStore();

  const { loadApprovedFees, fees, initiatePayment, isLoading } = useFeeStore();
  const { loadNotifications, notifications, unreadCount } = useNotificationStore();

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [activeTab, setActiveTab] = useState<'outstanding' | 'history'>('outstanding');

  useEffect(() => {
    fetchDashboardData();
    fetchOutstandingFees();
    fetchPayments();
    loadApprovedFees(); // Only load approved fees for students
    loadNotifications();
  }, [fetchDashboardData, fetchOutstandingFees, fetchPayments, loadApprovedFees, loadNotifications]);

  const handlePayFee = (fee: any) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedFee(null);
    // Refresh data after successful payment
    fetchDashboardData();
    fetchOutstandingFees();
    fetchPayments();
  };

  if (dashboardLoading && !dashboardData) {
    return <LoadingSpinner />;
  }

  // Filter to only show approved fees for students
  const approvedOutstandingFees = outstandingFees.filter(fee => {
    // Check if fee is approved (either from fee object or from fees store)
    if (fee.isApproved !== undefined) {
      return fee.isApproved;
    }
    // Fallback: check if fee exists in approved fees list
    return fees.some(approvedFee => approvedFee._id === fee._id && approvedFee.isApproved);
  });

  const urgentFees = approvedOutstandingFees.filter(fee => {
    if (!fee.dueDate) return false;
    const dueDate = new Date(fee.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  });

  const overdueFees = approvedOutstandingFees.filter(fee => {
    if (!fee.dueDate) return false;
    const dueDate = new Date(fee.dueDate);
    const today = new Date();
    return dueDate < today;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="mr-4 inline-flex items-center px-3 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <div className="w-4 h-4 bg-primary-500 rounded mr-2 flex items-center justify-center">
                    <HomeIcon className="w-3 h-3 text-white" />
                  </div>
                  Dashboard
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Fee Payments</h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your fee payments and view payment history
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Outstanding</p>
                <p className={`text-2xl font-bold ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {FeeService.formatAmount(totalOutstanding)}
                </p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-6">
              <nav className="flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('outstanding')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'outstanding'
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Outstanding Fees
                  {approvedOutstandingFees.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {approvedOutstandingFees.length}
                    </span>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'history'
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Payment History
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Outstanding Fees Tab */}
        {activeTab === 'outstanding' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
                    <p className="text-2xl font-semibold text-red-600">
                      {FeeService.formatAmount(totalOutstanding)}
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
                    <ClockIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Due Soon</p>
                    <p className="text-2xl font-semibold text-blue-600">{urgentFees.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Outstanding Fees List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Outstanding Fees ({approvedOutstandingFees.length})
                </h2>
              </div>

              {approvedOutstandingFees.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">All fees paid!</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You have no outstanding fees at this time.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedOutstandingFees.map((fee) => (
                    <StudentFeeCard
                      key={fee._id}
                      fee={fee}
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
                    payment={payment}
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
    </div>
  );
};

export default StudentFeePaymentPage;
