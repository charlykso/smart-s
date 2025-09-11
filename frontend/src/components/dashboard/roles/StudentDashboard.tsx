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
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Alert } from '../../ui/Alert';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import StatCard from '../../ui/StatCard';
import DashboardLayout from '../../layout/DashboardLayout';

import type { QuickAction } from '../widgets/QuickActionCard';
import type { Activity } from '../widgets/RecentActivityCard';
import { useAuthStore } from '../../../store/authStore';
import { ApiService } from '../../../services/api';
import { API_ENDPOINTS } from '../../../constants';

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

  // Helper function to make authenticated API calls using ApiService
  const makeApiCall = useCallback(async (url: string) => {
    try {
      return await ApiService.get(url);
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(error.response?.data?.message || error.message || 'API call failed');
    }
  }, []);

  // Load student financial data
  const loadFinancialData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Get student dashboard data from the API
      const data = await makeApiCall(API_ENDPOINTS.STUDENT.DASHBOARD);
      
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
      const data = await makeApiCall(`${API_ENDPOINTS.PAYMENTS.AVAILABLE_METHODS}/${schoolId}`);
      
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
      description: financialData.totalOutstanding > 0 ? 'Due this term' : 'All fees paid',
      icon: CurrencyDollarIcon,
      iconColor: financialData.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600',
      className: 'bg-white dark:bg-gray-800'
    },
    {
      title: 'Total Paid',
      value: formatCurrency(financialData.totalPaid),
      change: 'This session',
      changeType: 'neutral' as const,
      description: 'Total payments this session',
      icon: CreditCardIcon,
      iconColor: 'text-blue-600',
      className: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10'
    },
    {
      title: 'Current Session',
      value: financialData.currentSession || 'Not set',
      change: financialData.currentTerm || 'No active term',
      changeType: 'neutral' as const,
      description: 'Set by your school',
      icon: CalendarIcon,
      iconColor: 'text-indigo-600',
      className: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10'
    },
    {
      title: 'Payment History',
      value: financialData.recentPayments.length.toString(),
      change: 'Last 5 payments',
      changeType: 'neutral' as const,
      description: 'Successful payments',
      icon: DocumentTextIcon,
      iconColor: 'text-gray-600',
      className: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/10'
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
    <DashboardLayout
      title="Student Dashboard"
      subtitle="Manage your fees, payments, and academic information"
      loading={loading}
      error={error}
    >
      {/* Welcome Section */}
      <WelcomeCard />


      {/* Statistics Grid */}
      {financialData && (
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
              className={(stat as any).className}
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

     
    </DashboardLayout>
  );
};

export default StudentDashboard;
