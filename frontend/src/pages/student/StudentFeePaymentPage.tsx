import React, { useEffect, useState } from 'react';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  BanknotesIcon,
  AcademicCapIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useStudentStore } from '../../store/studentStore';
import { useFeeStore } from '../../store/feeStore';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import MainLayout from '../../components/layout/MainLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StudentFeeCard from '../../components/student/StudentFeeCard';
import EnhancedPaymentModal from '../../components/student/EnhancedPaymentModal';
import PaymentHistoryCard from '../../components/student/PaymentHistoryCard';
import { FeeService } from '../../services/feeService';
import { SchoolService } from '../../services/schoolService';
import type { Session, Term } from '../../types/school';
import type { Fee } from '../../types/fee';

const StudentFeePaymentPage: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState<'fees' | 'history'>('fees');

  // New states for term/session selection and approved fees
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [approvedFees, setApprovedFees] = useState<Fee[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Load sessions and terms on component mount
  useEffect(() => {
    loadSessionsAndTerms();
    fetchDashboardData();
    fetchPayments();
    loadNotifications();
  }, [fetchDashboardData, fetchPayments, loadNotifications]);

  // Load approved fees when term selection changes
  useEffect(() => {
    if (selectedTerm) {
      loadApprovedFeesForTerm(selectedTerm);
    } else if (selectedSession) {
      loadApprovedFeesForSession(selectedSession);
    }
  }, [selectedTerm, selectedSession]);

  // Load sessions and terms
  const loadSessionsAndTerms = async () => {
    try {
      setLoadingSessions(true);
      const [sessionsData, termsData] = await Promise.all([
        SchoolService.getSessions(),
        SchoolService.getTerms()
      ]);

      setSessions(sessionsData);
      setTerms(termsData);

      // Auto-select current term if available
      const currentTerm = termsData.find(term => term.isCurrent);
      if (currentTerm) {
        setSelectedTerm(currentTerm._id);
      } else if (termsData.length > 0) {
        setSelectedTerm(termsData[0]._id);
      }
    } catch (error) {
      console.error('Error loading sessions and terms:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Load approved fees for selected term
  const loadApprovedFeesForTerm = async (termId: string) => {
    try {
      setLoadingFees(true);
      const feesData = await FeeService.getApprovedFeesByTerm(termId);
      setApprovedFees(feesData);
    } catch (error) {
      console.error('Error loading approved fees for term:', error);
      setApprovedFees([]);
    } finally {
      setLoadingFees(false);
    }
  };

  // Load approved fees for selected session
  const loadApprovedFeesForSession = async (sessionId: string) => {
    try {
      setLoadingFees(true);
      // Get all terms for the session
      const sessionTerms = terms.filter(term =>
        typeof term.session === 'object' ? term.session._id === sessionId : term.session === sessionId
      );

      // Load fees for all terms in the session
      const allFeesPromises = sessionTerms.map(term =>
        FeeService.getApprovedFeesByTerm(term._id)
      );

      const allFeesArrays = await Promise.all(allFeesPromises);
      const allFees = allFeesArrays.flat();

      setApprovedFees(allFees);
    } catch (error) {
      console.error('Error loading approved fees for session:', error);
      setApprovedFees([]);
    } finally {
      setLoadingFees(false);
    }
  };

  const handlePayFee = (fee: any) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedFee(null);
    // Refresh data after successful payment
    fetchDashboardData();
    fetchPayments();
    // Reload approved fees for current selection
    if (selectedTerm) {
      loadApprovedFeesForTerm(selectedTerm);
    } else if (selectedSession) {
      loadApprovedFeesForSession(selectedSession);
    }
  };

  // Handle session selection
  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    setSelectedTerm(''); // Clear term selection when session is selected
  };

  // Handle term selection
  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId);
    setSelectedSession(''); // Clear session selection when term is selected
  };

  // Get filtered terms for selected session
  const getTermsForSession = (sessionId: string) => {
    return terms.filter(term =>
      typeof term.session === 'object' ? term.session._id === sessionId : term.session === sessionId
    );
  };

  if (loadingSessions) {
    return (
      <MainLayout>
        <LoadingSpinner />
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

  const totalFeesAmount = approvedFees.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                  Fee Payments
                </h1>
                <p className="text-secondary-600 mt-1">
                  Manage your fee payments and view payment history
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Total Fees Amount</p>
              <p className={`text-2xl font-bold ${totalFeesAmount > 0 ? 'text-primary-600' : 'text-gray-600'}`}>
                {FeeService.formatAmount(totalFeesAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Term/Session Selection Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center space-x-4">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by:</span>

            {/* Session Selection */}
            <div className="flex items-center space-x-2">
              <label htmlFor="session-select" className="text-sm text-gray-600">Session:</label>
              <select
                id="session-select"
                value={selectedSession}
                onChange={(e) => handleSessionChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Session</option>
                {sessions.map(session => (
                  <option key={session._id} value={session._id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Term Selection */}
            <div className="flex items-center space-x-2">
              <label htmlFor="term-select" className="text-sm text-gray-600">Term:</label>
              <select
                id="term-select"
                value={selectedTerm}
                onChange={(e) => handleTermChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Term</option>
                {(selectedSession ? getTermsForSession(selectedSession) : terms).map(term => (
                  <option key={term._id} value={term._id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedSession || selectedTerm) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSession('');
                  setSelectedTerm('');
                  setApprovedFees([]);
                }}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <nav className="flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('fees')}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'fees'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AcademicCapIcon className="h-4 w-4 mr-2" />
              Approved Fees
              {approvedFees.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {approvedFees.length}
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
            {/* Selection Info */}
            {(selectedSession || selectedTerm) && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-primary-600 mr-2" />
                  <div>
                    <h4 className="text-sm font-medium text-primary-800">
                      Showing fees for: {' '}
                      {selectedTerm && terms.find(t => t._id === selectedTerm)?.name}
                      {selectedSession && sessions.find(s => s._id === selectedSession)?.name}
                    </h4>
                    <p className="text-sm text-primary-700 mt-1">
                      Click on any fee to make a payment using your school's available payment methods.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-2xl font-semibold text-primary-600">
                      {FeeService.formatAmount(totalFeesAmount)}
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

            {/* Approved Fees List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Approved Fees ({approvedFees.length})
                </h2>
                {loadingFees && (
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Loading fees...
                  </div>
                )}
              </div>

              {!selectedSession && !selectedTerm ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Select a Term or Session</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Please select a term or session above to view approved fees for payment.
                  </p>
                </div>
              ) : loadingFees ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-4 text-sm text-gray-500">Loading approved fees...</p>
                </div>
              ) : approvedFees.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No approved fees found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no approved fees for the selected {selectedTerm ? 'term' : 'session'}.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {approvedFees.map((fee) => (
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
    </MainLayout>
  );
};

export default StudentFeePaymentPage;
