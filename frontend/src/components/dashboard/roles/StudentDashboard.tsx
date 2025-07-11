import React, { useEffect, useState, useCallback } from 'react';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingLibraryIcon,
  ExclamationTriangleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction } from '../widgets/QuickActionCard';
import type { Activity } from '../widgets/RecentActivityCard';
import { useAuthStore } from '../../../store/authStore';

// Payment method interface
interface PaymentMethod {
  method: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

// Student financial data interface
interface StudentFinancialData {
  totalOutstanding: number;
  totalPaid: number;
  currentSession: string;
  currentTerm: string;
  recentPayments: Array<{
    _id: string;
    amount: number;
    date: string;
    fee: { name: string };
    paymentMethod: string;
  }>;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  
  const [financialData, setFinancialData] = useState<StudentFinancialData | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to make authenticated API calls
  const makeApiCall = useCallback(async (url: string) => {
    const accessToken = token || localStorage.getItem('accessToken');
    
    if (!accessToken) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(url, {
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

    return response.json();
  }, [token]);

  // Load student financial data
  const loadFinancialData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get student dashboard data from the API
      const data = await makeApiCall('/api/v1/student/dashboard');
      
      if (data.success && data.data) {
        const dashboardData = data.data;
        
        // Transform the API response to match our interface
        const financialData: StudentFinancialData = {
          totalOutstanding: dashboardData.financial?.totalOutstanding ?? 0,
          totalPaid: dashboardData.financial?.totalPaid ?? 0,
          currentSession: dashboardData.currentTerm?.session?.name ?? 'N/A',
          currentTerm: dashboardData.currentTerm?.name ?? 'N/A',
          recentPayments: (dashboardData.financial?.recentPayments ?? []).map((payment: {
            _id: string;
            amount: number;
            date: string;
            fee?: { name?: string };
            mode?: string;
          }) => ({
            _id: payment._id,
            amount: payment.amount,
            date: payment.date,
            fee: { name: payment.fee?.name ?? 'Unknown Fee' },
            paymentMethod: payment.mode ?? 'unknown'
          }))
        };
        
        setFinancialData(financialData);
      } else {
        throw new Error(data.message ?? 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }, [user, makeApiCall]);

  // Load available payment methods
  const loadAvailablePaymentMethods = useCallback(async () => {
    if (!user?.school) {
      // If no school is assigned, show default online methods
      const defaultMethods: PaymentMethod[] = [
        {
          method: 'paystack',
          name: 'Paystack',
          description: 'Pay online with card or bank transfer',
          icon: 'credit-card',
          enabled: true,
        },
        {
          method: 'flutterwave',
          name: 'Flutterwave',
          description: 'Secure online payment platform',
          icon: 'credit-card',
          enabled: true,
        },
        {
          method: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Direct bank transfer (online banking)',
          icon: 'building-library',
          enabled: true,
        },
      ];
      setAvailablePaymentMethods(defaultMethods);
      return;
    }

    try {
      // Extract school ID properly (handle both string and object formats)
      const schoolId = typeof user.school === 'string' ? user.school : user.school._id;
      const data = await makeApiCall(`/api/v1/payment/available-methods/${schoolId}`);
      
      if (data.success && data.data) {
        // Filter out cash payment for students
        const onlinePaymentMethods = data.data.filter((method: PaymentMethod) => 
          method.method !== 'cash'
        );
        setAvailablePaymentMethods(onlinePaymentMethods);
      } else {
        throw new Error('Failed to load payment methods');
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Fallback to default online methods
      const fallbackMethods: PaymentMethod[] = [
        {
          method: 'paystack',
          name: 'Paystack',
          description: 'Pay online with card or bank transfer',
          icon: 'credit-card',
          enabled: true,
        },
        {
          method: 'flutterwave',
          name: 'Flutterwave',
          description: 'Secure online payment platform',
          icon: 'credit-card',
          enabled: true,
        },
        {
          method: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Direct bank transfer (online banking)',
          icon: 'building-library',
          enabled: true,
        },
      ];
      setAvailablePaymentMethods(fallbackMethods);
    }
  }, [user?.school, makeApiCall]);

  // Fetch data on component mount
  useEffect(() => {
    loadFinancialData();
    loadAvailablePaymentMethods();
  }, [loadFinancialData, loadAvailablePaymentMethods]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'paystack':
      case 'flutterwave':
      case 'credit-card':
        return <CreditCardIcon className="h-5 w-5" />;
      case 'bank_transfer':
        return <BuildingLibraryIcon className="h-5 w-5" />;
      default:
        return <CreditCardIcon className="h-5 w-5" />;
    }
  };

  // Get payment method color
  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'paystack':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'flutterwave':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'bank_transfer':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Generate statistics for accounting dashboard
  const stats = financialData ? [
    {
      title: 'Outstanding Fees',
      value: formatCurrency(financialData.totalOutstanding),
      change: financialData.totalOutstanding > 0 ? 'Payment due' : 'Paid up',
      changeType: financialData.totalOutstanding > 0 ? 'decrease' as const : 'neutral' as const,
      description: financialData.totalOutstanding > 0 ? 'Payment due this term' : 'All fees paid',
      icon: CurrencyDollarIcon,
      iconColor: financialData.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600',
    },
    {
      title: 'Total Paid',
      value: formatCurrency(financialData.totalPaid),
      change: 'This session',
      changeType: 'neutral' as const,
      description: 'Total payments made this session',
      icon: CreditCardIcon,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Current Session',
      value: financialData.currentSession,
      change: financialData.currentTerm,
      changeType: 'neutral' as const,
      description: 'Academic session and term',
      icon: CalendarIcon,
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Payment History',
      value: financialData.recentPayments.length.toString(),
      change: 'Recent payments',
      changeType: 'neutral' as const,
      description: 'Payments made this term',
      icon: DocumentTextIcon,
      iconColor: 'text-gray-600',
    },
  ] : [];

  // Quick actions for accounting features only
  const quickActions: QuickAction[] = [
    {
      id: 'make-payment',
      title: 'Make Payment',
      description: 'Pay outstanding fees',
      icon: CreditCardIcon,
      onClick: () => { navigate('/student/fees'); },
      color: 'primary',
    },
    {
      id: 'download-receipt',
      title: 'Download Receipt',
      description: 'Get payment receipts',
      icon: DocumentTextIcon,
      onClick: () => { navigate('/student/receipts'); },
      color: 'secondary',
    },
    {
      id: 'view-statement',
      title: 'View Statement',
      description: 'Check fee statement',
      icon: DocumentTextIcon,
      onClick: () => { navigate('/student/statement'); },
      color: 'success',
    },
  ];

  // Generate recent activities from financial data
  const recentActivities: Activity[] = financialData ? 
    financialData.recentPayments.slice(0, 5).map((payment) => ({
      id: `payment-${payment._id}`,
      title: 'Payment Received',
      description: `${payment.fee.name} payment of ${formatCurrency(payment.amount)} processed`,
      timestamp: new Date(payment.date),
      type: 'payment' as const,
      user: 'Payment System',
    })) : [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard />

      {/* Outstanding Fees Notice */}
      {financialData && financialData.totalOutstanding > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <BellIcon className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Outstanding Fees Notice
              </h4>
              <p className="text-sm text-red-700 mt-1">
                You have outstanding fees of {formatCurrency(financialData.totalOutstanding)}.
                Please make payment before the deadline to avoid penalties.
              </p>
              <p className="text-xs text-red-600 mt-2">
                💳 Pay online below or 💰 visit the Bursar's office for cash payment
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/student/fees')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Pay Fees Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-secondary-600">Loading dashboard...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Error Loading Dashboard
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {error}. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      {!loading && financialData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:gap-6">
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              iconColor={stat.iconColor}
              description={stat.description}
            />
          ))}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActionCard
            title="Fee Management"
            actions={quickActions}
          />
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <RecentActivityCard
            title="Recent Payments"
            activities={recentActivities}
            onViewAll={() => navigate('/student/payments')}
          />
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Online Payment Methods</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Secure online payment options available for fee payments
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/fees')}
              className="inline-flex items-center px-3 py-2 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <CreditCardIcon className="h-4 w-4 mr-2" />
              Make Payment
            </button>
          </div>
        </div>

        <div className="p-6">
          {availablePaymentMethods.length > 0 ? (
            <>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800 font-medium">
                    Online Payment Options - Pay Securely from Your Dashboard
                  </p>
                </div>
                <p className="text-xs text-blue-600 mt-1 ml-7">
                  Cash payments must be made directly at the Bursar's office
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availablePaymentMethods.map((method) => (
                  <button
                    key={method.method}
                    onClick={() => navigate('/student/fees', { state: { selectedMethod: method.method } })}
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-105 text-left ${getPaymentMethodColor(method.method)}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getPaymentMethodIcon(method.method)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {method.name}
                        </p>
                        <p className="text-xs opacity-75 truncate">
                          {method.description}
                        </p>
                        <p className="text-xs font-medium mt-1 opacity-90">
                          Click to pay →
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-secondary-600">No online payment methods available</p>
              <p className="text-sm text-secondary-500 mt-1">Contact the school administrator or visit the Bursar's office for cash payment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
