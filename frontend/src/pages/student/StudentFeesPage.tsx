import React, { useEffect, useState, useCallback } from 'react';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  FunnelIcon,
  DocumentTextIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { useStudentStore } from '../../store/studentStore';
import { useAuthStore } from '../../store/authStore';
import MainLayout from '../../components/layout/MainLayout';
import { FeeService } from '../../services/feeService';
import { SchoolService } from '../../services/schoolService';
import EnhancedPaymentModal from '../../components/student/EnhancedPaymentModal';
import toast from 'react-hot-toast';
import type { Fee, PaymentMethod, Payment } from '../../types/fee';
import type { Session, Term } from '../../types/school';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const StudentFeesPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    fetchDashboardData,
  } = useStudentStore();

  // Tab state
  const [activeTab, setActiveTab] = useState<'all-fees' | 'payment-history' | 'payment-methods'>('all-fees');

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);

  // Filter states
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [feeTypeFilter, setFeeTypeFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Data states
  const [loadingFees, setLoadingFees] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [allFees, setAllFees] = useState<Fee[]>([]);
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);

  // Load sessions and terms
  const loadSessionsAndTerms = useCallback(async () => {
    try {
      const [sessionsData, termsData] = await Promise.all([
        SchoolService.getSessions(),
        SchoolService.getTerms()
      ]);
      
      setSessions(sessionsData);
      setTerms(termsData);
      
      // Set current term as default
      const currentTerm = termsData.find((term: Term & { isCurrent?: boolean }) => term.isCurrent);
      if (currentTerm) {
        setSelectedTerm(currentTerm._id);
      }
    } catch (error) {
      console.error('Error loading sessions and terms:', error);
    }
  }, []);

  const loadAllFees = useCallback(async () => {
    try {
      setLoadingFees(true);
      
      if (!user?.school) {
        throw new Error('School information not found');
      }
      
      const feesData = await FeeService.getApprovedFees(user.school);
      setAllFees(feesData);
    } catch (error) {
      console.error('Error loading fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoadingFees(false);
    }
  }, [user?.school]);

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoadingPaymentMethods(true);
      
      // For now, set some default payment methods
      const defaultMethods: PaymentMethod[] = [
        {
          method: 'paystack',
          name: 'Card Payment',
          description: 'Pay with your debit/credit card via Paystack',
          icon: 'card',
          enabled: true,
        },
        {
          method: 'cash',
          name: 'Cash Payment',
          description: 'Pay with cash at the bursar office',
          icon: 'cash',
          enabled: true,
        },
      ];
      setPaymentMethods(defaultMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, []);

  const loadStudentPayments = useCallback(async () => {
    try {
      setLoadingPayments(true);
      
      // For now, we'll load an empty array since the API endpoint might not exist yet
      setStudentPayments([]);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoadingPayments(false);
    }
  }, []);

  // Filter fees based on selected criteria
  const filterFees = useCallback(() => {
    let filtered = allFees;

    // Filter by session
    if (selectedSession !== 'all') {
      filtered = filtered.filter(fee => 
        typeof fee.term === 'string' ? fee.term === selectedSession : fee.term._id === selectedSession
      );
    }

    // Filter by term
    if (selectedTerm !== 'all') {
      filtered = filtered.filter(fee => 
        typeof fee.term === 'string' ? fee.term === selectedTerm : fee.term._id === selectedTerm
      );
    }

    // Filter by fee type
    if (feeTypeFilter !== 'all') {
      filtered = filtered.filter(fee => fee.type === feeTypeFilter);
    }

    // Filter by payment status
    if (paymentStatusFilter !== 'all') {
      const isPaid = paymentStatusFilter === 'paid';
      filtered = filtered.filter(fee => {
        const payment = studentPayments.find(p => 
          typeof p.fee === 'string' ? p.fee === fee._id : p.fee._id === fee._id
        );
        return isPaid ? !!payment : !payment;
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(fee =>
        fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.decription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredFees(filtered);
  }, [allFees, selectedSession, selectedTerm, feeTypeFilter, paymentStatusFilter, searchTerm, studentPayments]);

  // Handle payment modal
  const handlePayFee = (fee: Fee) => {
    setSelectedFee(fee);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedFee(null);
    // Reload data to reflect the new payment
    loadStudentPayments();
    fetchDashboardData();
    toast.success('Payment successful!');
  };

  // Handle receipt printing
  const handlePrintReceipt = (fee: Fee) => {
    const payment = studentPayments.find(p => 
      typeof p.fee === 'string' ? p.fee === fee._id : p.fee._id === fee._id
    );
    if (!payment) {
      toast.error('No payment record found for this fee');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Unable to open print window');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .content { margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
            .field { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Payment Receipt</h2>
            <p>${user?.school ?? 'School Name'}</p>
          </div>
          <div class="content">
            <div class="field">
              <span class="label">Student:</span> ${user?.firstname} ${user?.lastname}
            </div>
            <div class="field">
              <span class="label">Fee:</span> ${fee.name}
            </div>
            <div class="field">
              <span class="label">Amount:</span> ₦${fee.amount.toLocaleString()}
            </div>
            <div class="field">
              <span class="label">Payment Method:</span> ${payment.mode_of_payment}
            </div>
            <div class="field">
              <span class="label">Transaction ID:</span> ${payment.trans_id ?? 'N/A'}
            </div>
            <div class="field">
              <span class="label">Date:</span> ${new Date(payment.createdAt).toLocaleDateString()}
            </div>
            <div class="field">
              <span class="label">Status:</span> ${payment.status}
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your payment!</p>
            <p>Printed on: ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Get unique fee types for filter
  const getFeeTypes = () => {
    const types = [...new Set(allFees.map(fee => fee.type))];
    return types;
  };

  // Get payment status for a fee
  const getPaymentStatus = (fee: Fee) => {
    const payment = studentPayments.find(p => 
      typeof p.fee === 'string' ? p.fee === fee._id : p.fee._id === fee._id
    );
    return payment ? payment.status : 'pending';
  };

  // Check if fee is paid
  const isFeePaid = (fee: Fee) => {
    const payment = studentPayments.find(p => 
      typeof p.fee === 'string' ? p.fee === fee._id : p.fee._id === fee._id
    );
    return payment && payment.status === 'success';
  };

  // Initialize data on mount
  useEffect(() => {
    loadSessionsAndTerms();
    loadAllFees();
    loadPaymentMethods();
    loadStudentPayments();
  }, [loadSessionsAndTerms, loadAllFees, loadPaymentMethods, loadStudentPayments]);

  // Filter fees when dependencies change
  useEffect(() => {
    filterFees();
  }, [filterFees]);

  const renderTabButton = (tabKey: typeof activeTab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(tabKey)}
      className={classNames(
        'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        activeTab === tabKey
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      )}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  const renderAllFeesTab = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-gray-900 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex items-center mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Session Filter */}
          <div>
            <label htmlFor="session-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Session
            </label>
            <select
              id="session-filter"
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              aria-label="Filter by session"
            >
              <option value="all">All Sessions</option>
              {sessions.map((session) => (
                <option key={session._id} value={session._id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Term Filter */}
          <div>
            <label htmlFor="term-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Term
            </label>
            <select
              id="term-filter"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              aria-label="Filter by term"
            >
              <option value="all">All Terms</option>
              {terms.map((term) => (
                <option key={term._id} value={term._id}>
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Type Filter */}
          <div>
            <label htmlFor="fee-type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Fee Type
            </label>
            <select
              id="fee-type-filter"
              value={feeTypeFilter}
              onChange={(e) => setFeeTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              aria-label="Filter by fee type"
            >
              <option value="all">All Types</option>
              {getFeeTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label htmlFor="payment-status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              id="payment-status-filter"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              aria-label="Filter by payment status"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search-fees" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="search-fees"
                type="text"
                placeholder="Search fees by name, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fees List */}
      <div className="space-y-4">
        {loadingFees ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading fees...</p>
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="text-center py-8">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No fees found matching your criteria.</p>
          </div>
        ) : (
          filteredFees.map((fee) => {
            const isPaid = isFeePaid(fee);
            const paymentStatus = getPaymentStatus(fee);
            
            return (
              <div key={fee._id} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{fee.name}</h3>
                      <span className={classNames(
                        'ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        isPaid
                          ? 'bg-green-100 text-green-800'
                          : paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {isPaid ? (
                          <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Paid
                          </>
                        ) : paymentStatus === 'pending' ? (
                          <>
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        ) : (
                          <>
                            <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                            Unpaid
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      <p className="text-gray-600 dark:text-gray-300">{fee.decription}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Type: {fee.type}</span>
                        <span>Session: {sessions.find(s => s._id === (typeof fee.term === 'string' ? fee.term : fee.term._id))?.name ?? 'N/A'}</span>
                        <span>Term: {terms.find(t => t._id === (typeof fee.term === 'string' ? fee.term : fee.term._id))?.name ?? 'N/A'}</span>
                        <span>Created: {new Date(fee.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₦{fee.amount.toLocaleString()}
                    </p>
                    <div className="mt-4 space-y-2">
                      {isPaid ? (
                        <button
                          onClick={() => handlePrintReceipt(fee)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                          <PrinterIcon className="h-4 w-4 mr-1" />
                          Print Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePayFee(fee)}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <CreditCardIcon className="h-4 w-4 mr-1" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderPaymentHistoryTab = () => (
    <div className="space-y-4">
      {loadingPayments ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment history...</p>
        </div>
      ) : studentPayments.length === 0 ? (
        <div className="text-center py-8">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No payment history found.</p>
        </div>
      ) : (
        studentPayments.map((payment) => {
          const fee = allFees.find(f => f._id === (typeof payment.fee === 'string' ? payment.fee : payment.fee._id));
          
          return (
            <div key={payment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {fee?.name ?? 'Unknown Fee'}
                    </h3>
                    <span className={classNames(
                      'ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      payment.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    )}>
                      {payment.status === 'success' ? (
                        <>
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Completed
                        </>
                      ) : payment.status === 'pending' ? (
                        <>
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Pending
                        </>
                      ) : (
                        <>
                          <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                          Failed
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Method: {payment.mode_of_payment}</span>
                      <span>Transaction ID: {payment.trans_id ?? 'N/A'}</span>
                      <span>Date: {new Date(payment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6 text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₦{payment.amount.toLocaleString()}
                  </p>
                  {payment.status === 'success' && fee && (
                    <div className="mt-4">
                      <button
                        onClick={() => handlePrintReceipt(fee)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <PrinterIcon className="h-4 w-4 mr-1" />
                        Print Receipt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const renderPaymentMethodsTab = () => (
    <div className="space-y-4">
      {loadingPaymentMethods ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment methods...</p>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="text-center py-8">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No payment methods configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paymentMethods.map((method, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="flex items-center">
                {method.method === 'paystack' || method.method === 'flutterwave' ? (
                  <CreditCardIcon className="h-8 w-8 text-blue-600" />
                ) : method.method === 'bank_transfer' ? (
                  <BuildingLibraryIcon className="h-8 w-8 text-green-600" />
                ) : (
                  <BanknotesIcon className="h-8 w-8 text-yellow-600" />
                )}
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{method.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
                </div>
              </div>
              
              {method.enabled ? (
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Available
                  </span>
                </div>
              ) : (
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    Unavailable
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <p className="mt-2 text-gray-600">
            View and manage your school fees, payment history, and available payment methods.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {renderTabButton('all-fees', 'All Fees', <CurrencyDollarIcon className="h-5 w-5" />)}
            {renderTabButton('payment-history', 'Payment History', <DocumentTextIcon className="h-5 w-5" />)}
            {renderTabButton('payment-methods', 'Payment Methods', <CreditCardIcon className="h-5 w-5" />)}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'all-fees' && renderAllFeesTab()}
          {activeTab === 'payment-history' && renderPaymentHistoryTab()}
          {activeTab === 'payment-methods' && renderPaymentMethodsTab()}
        </div>

        {/* Payment Modal */}
        {isPaymentModalOpen && selectedFee && (
          <EnhancedPaymentModal
            fee={selectedFee}
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedFee(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default StudentFeesPage;
