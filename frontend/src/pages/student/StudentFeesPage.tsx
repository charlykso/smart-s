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
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useStudentStore } from '../../store/studentStore';
import { useAuthStore } from '../../store/authStore';
import MainLayout from '../../components/layout/MainLayout';
import { FeeService } from '../../services/feeService';
import EnhancedPaymentModal from '../../components/student/EnhancedPaymentModal';
import toast from 'react-hot-toast';
import type { Fee, PaymentMethodConfig, Payment } from '../../types/fee';
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [studentPayments, setStudentPayments] = useState<Payment[]>([]);

  // Load sessions and terms - Student version (using data from approved fees)
  const loadSessionsAndTerms = useCallback(async () => {
    try {
      // For students, we'll extract sessions and terms from their fee data
      // instead of calling admin-only endpoints
      console.log('Sessions and terms will be loaded from fee data for students');
      
      // We can extract unique sessions and terms from the fees data later
      // This avoids calling admin-only /Session/all and /Term/all endpoints
    } catch (error) {
      console.error('Error loading sessions and terms:', error);
    }
  }, []);

  const loadAllFees = useCallback(async () => {
    try {
      setLoadingFees(true);
      
      // Use student-specific endpoint that doesn't require school ID
      const feesData = await FeeService.getStudentApprovedFees();
      console.log('Fetched fees data:', feesData);
      console.log('Number of fees:', feesData.length);
      
      setAllFees(feesData);
      
      // Extract unique terms from the fees data
      const uniqueTerms = [...new Set(feesData.map(fee => 
        typeof fee.term === 'string' ? fee.term : fee.term?.name ?? 'Unknown'
      ))];
      
      // Extract unique sessions from the fees data
      const uniqueSessions = [...new Set(feesData.map(fee => 
        typeof fee.term === 'string' ? 'Unknown Session' : fee.term?.session?.name ?? 'Unknown Session'
      ))];
      
      console.log('Unique terms:', uniqueTerms);
      console.log('Unique sessions:', uniqueSessions);
      
      // Create session objects for filters
      const sessionObjects = uniqueSessions.map((name, index) => ({
        _id: `session-${index}`,
        name,
        year: new Date().getFullYear(),
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isActive: true,
        school: typeof feesData[0]?.school === 'string' ? feesData[0].school : feesData[0]?.school?._id ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      // Create term objects for filters
      const termObjects = uniqueTerms.map((name, index) => ({
        _id: `term-${index}`,
        name,
        school: typeof feesData[0]?.school === 'string' ? feesData[0].school : feesData[0]?.school?._id ?? '',
        session: sessionObjects[0]?._id || '',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      setSessions(sessionObjects);
      setTerms(termObjects);
      
    } catch (error) {
      console.error('Error loading fees:', error);
      toast.error('Failed to load fees');
    } finally {
      setLoadingFees(false);
    }
  }, []);

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoadingPaymentMethods(true);
      
      // Try to get available payment methods for the user's school
      if (user?.school?._id) {
        try {
          const methods = await FeeService.getAvailablePaymentMethods(user.school._id);
          setPaymentMethods(methods);
          return;
        } catch (error) {
          console.warn('Failed to load payment methods from API, using defaults:', error);
        }
      }
      
      // Fallback to default payment methods
      const defaultMethods: PaymentMethodConfig[] = [
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
  }, [user?.school?._id]);

  const loadStudentPayments = useCallback(async () => {
    try {
      setLoadingPayments(true);
      
      // Use the student payments endpoint
      const allPayments = await FeeService.getStudentPayments();
      
      // Filter payments to only include those for the current user
      const userPayments = allPayments.filter(payment => {
        const paymentUserId = typeof payment.user === 'string' 
          ? payment.user 
          : payment.user?._id;
        return paymentUserId === user?._id;
      });
      
      console.log('All payments:', allPayments.length);
      console.log('User payments:', userPayments.length);
      console.log('Current user ID:', user?._id);
      
      setStudentPayments(userPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoadingPayments(false);
    }
  }, [user?._id]);

  // Filter fees based on selected criteria
  const filterFees = useCallback(() => {
    let filtered = allFees;

    // Filter by session
    if (selectedSession !== 'all') {
      const selectedSessionName = sessions.find(s => s._id === selectedSession)?.name;
      filtered = filtered.filter(fee => {
        const feeSessionName = typeof fee.term === 'string' 
          ? 'Unknown Session' 
          : fee.term?.session?.name ?? 'Unknown Session';
        return feeSessionName === selectedSessionName;
      });
    }

    // Filter by term
    if (selectedTerm !== 'all') {
      const selectedTermName = terms.find(t => t._id === selectedTerm)?.name;
      filtered = filtered.filter(fee => {
        const feeTermName = typeof fee.term === 'string' 
          ? fee.term 
          : fee.term?.name ?? 'Unknown';
        return feeTermName === selectedTermName;
      });
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
  }, [allFees, selectedSession, selectedTerm, feeTypeFilter, paymentStatusFilter, searchTerm, studentPayments, sessions, terms]);

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

    try {
      // Create a new window with specific dimensions
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      if (!printWindow) {
        toast.error('Unable to open print window. Please check your popup blocker.');
        return;
      }

      const receiptHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payment Receipt - ${fee.name}</title>
            <meta charset="UTF-8">
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                background: white;
                color: black;
                line-height: 1.6;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #333; 
                padding-bottom: 15px; 
                margin-bottom: 20px;
              }
              .header h2 {
                margin: 0;
                color: #333;
                font-size: 24px;
              }
              .school-name {
                font-size: 16px;
                color: #666;
                margin-top: 5px;
              }
              .content { 
                margin: 20px 0; 
              }
              .field { 
                margin: 12px 0; 
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px dotted #ccc;
              }
              .label { 
                font-weight: bold; 
                color: #333;
                min-width: 120px;
              }
              .value {
                text-align: right;
                flex: 1;
                font-weight: normal;
              }
              .amount {
                font-size: 20px;
                font-weight: bold;
                color: #2563eb;
              }
              .footer { 
                margin-top: 30px; 
                font-size: 12px; 
                color: #666; 
                text-align: center;
                border-top: 1px solid #eee;
                padding-top: 15px;
              }
              .status {
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
                background: #dcfce7;
                color: #166534;
              }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Payment Receipt</h2>
              <div class="school-name">${user?.school?.name || user?.school || 'Smart School'}</div>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Student:</span> 
                <span class="value">${user?.firstname || ''} ${user?.lastname || ''}</span>
              </div>
              <div class="field">
                <span class="label">Registration No:</span> 
                <span class="value">${user?.regNo || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Fee:</span> 
                <span class="value">${fee.name}</span>
              </div>
              <div class="field">
                <span class="label">Fee Type:</span> 
                <span class="value">${fee.type}</span>
              </div>
              <div class="field">
                <span class="label">Amount:</span> 
                <span class="value amount">₦${fee.amount.toLocaleString()}</span>
              </div>
              <div class="field">
                <span class="label">Payment Method:</span> 
                <span class="value">${payment.mode_of_payment}</span>
              </div>
              <div class="field">
                <span class="label">Transaction ID:</span> 
                <span class="value">${payment.trx_ref || payment.trans_id || 'N/A'}</span>
              </div>
              <div class="field">
                <span class="label">Payment Date:</span> 
                <span class="value">${new Date(payment.trans_date || payment.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="field">
                <span class="label">Status:</span> 
                <span class="value"><span class="status">${payment.status}</span></span>
              </div>
            </div>
            <div class="footer">
              <p><strong>Thank you for your payment!</strong></p>
              <p>Receipt generated on: ${new Date().toLocaleString()}</p>
              <p>This is a computer-generated receipt and does not require signature.</p>
            </div>
            
            <div class="no-print" style="margin-top: 20px; text-align: center;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Print Receipt</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
          </body>
        </html>
      `;

      // Write the HTML content
      printWindow.document.write(receiptHTML);
      printWindow.document.close();

      // Wait for content to load before printing
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 500);
      };

      // Fallback if onload doesn't work
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.focus();
          printWindow.print();
        }
      }, 1000);

      toast.success('Receipt opened in new window');
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast.error('Failed to print receipt. Please try again.');
    }
  };

  // Handle receipt download
  const handleDownloadReceipt = (fee: Fee) => {
    const payment = studentPayments.find(p => 
      typeof p.fee === 'string' ? p.fee === fee._id : p.fee._id === fee._id
    );
    if (!payment) {
      toast.error('No payment record found for this fee');
      return;
    }

    try {
      const receiptContent = `
PAYMENT RECEIPT
=====================================

School: ${user?.school?.name || user?.school || 'Smart School'}
Student: ${user?.firstname || ''} ${user?.lastname || ''}
Registration No: ${user?.regNo || 'N/A'}

=====================================

Fee: ${fee.name}
Fee Type: ${fee.type}
Amount: ₦${fee.amount.toLocaleString()}
Payment Method: ${payment.mode_of_payment}
Transaction ID: ${payment.trx_ref || payment.trans_id || 'N/A'}
Payment Date: ${new Date(payment.trans_date || payment.createdAt).toLocaleDateString()}
Status: ${payment.status.toUpperCase()}

=====================================

Thank you for your payment!
Receipt generated on: ${new Date().toLocaleString()}

This is a computer-generated receipt.
      `;

      // Create a blob and download link
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${fee.name.replace(/[^a-zA-Z0-9]/g, '-')}-${payment.trx_ref || payment.trans_id || Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt. Please try again.');
    }
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
                        <span>Session: {typeof fee.term === 'string' ? 'Unknown Session' : fee.term?.session?.name ?? 'Unknown Session'}</span>
                        <span>Term: {typeof fee.term === 'string' ? fee.term : fee.term?.name ?? 'Unknown'}</span>
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
                        <>
                          <button
                            onClick={() => handlePrintReceipt(fee)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <PrinterIcon className="h-4 w-4 mr-1" />
                            Print Receipt
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(fee)}
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                            Download Receipt
                          </button>
                        </>
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
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => handlePrintReceipt(fee)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <PrinterIcon className="h-4 w-4 mr-1" />
                        Print Receipt
                      </button>
                      <button
                        onClick={() => handleDownloadReceipt(fee)}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Download Receipt
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
