import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { FeeService } from '../../services/feeService';
import type { Payment } from '../../types/fee';
import LoadingSpinner from '../common/LoadingSpinner';

interface PaymentMethodStats {
  method: string;
  name: string;
  count: number;
  total_amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
}

interface PaymentAnalytics {
  total_payments: number;
  total_amount: number;
  methods: PaymentMethodStats[];
  recent_payments: Payment[];
  monthly_trends: {
    month: string;
    paystack: number;
    flutterwave: number;
    bank_transfer: number;
    cash: number;
  }[];
}

const PaymentAnalyticsDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState<PaymentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    to: new Date().toISOString().split('T')[0], // Today
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    if (!user?.school) return;

    try {
      setIsLoading(true);
      
      // In a real implementation, this would be a single API call
      // For now, we'll simulate the analytics data
      const mockAnalytics: PaymentAnalytics = {
        total_payments: 156,
        total_amount: 2450000,
        methods: [
          {
            method: 'paystack',
            name: 'Paystack',
            count: 89,
            total_amount: 1340000,
            percentage: 54.7,
            trend: 'up',
            trend_percentage: 12.5,
          },
          {
            method: 'flutterwave',
            name: 'Flutterwave',
            count: 34,
            total_amount: 510000,
            percentage: 20.8,
            trend: 'up',
            trend_percentage: 8.3,
          },
          {
            method: 'bank_transfer',
            name: 'Bank Transfer',
            count: 21,
            total_amount: 420000,
            percentage: 17.1,
            trend: 'stable',
            trend_percentage: 0,
          },
          {
            method: 'cash',
            name: 'Cash Payment',
            count: 12,
            total_amount: 180000,
            percentage: 7.4,
            trend: 'down',
            trend_percentage: -5.2,
          },
        ],
        recent_payments: [],
        monthly_trends: [
          { month: 'Jan', paystack: 45, flutterwave: 20, bank_transfer: 15, cash: 8 },
          { month: 'Feb', paystack: 52, flutterwave: 25, bank_transfer: 18, cash: 10 },
          { month: 'Mar', paystack: 61, flutterwave: 30, bank_transfer: 20, cash: 12 },
        ],
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Failed to load payment analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'paystack':
      case 'flutterwave':
        return <CreditCardIcon className="h-6 w-6" />;
      case 'bank_transfer':
        return <BuildingLibraryIcon className="h-6 w-6" />;
      case 'cash':
        return <BanknotesIcon className="h-6 w-6" />;
      default:
        return <CreditCardIcon className="h-6 w-6" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'paystack':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'flutterwave':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'bank_transfer':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cash':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Range */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Payment Analytics</h2>
          <p className="text-sm text-gray-500">Overview of payment method performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Payments</p>
              <p className="text-2xl font-semibold text-gray-900">{analytics.total_payments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BanknotesIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₦{analytics.total_amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Method Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analytics.methods.map((method) => (
            <div
              key={method.method}
              className={`border rounded-lg p-4 ${getMethodColor(method.method)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-white bg-opacity-50 rounded-lg">
                  {getMethodIcon(method.method)}
                </div>
                <div className="flex items-center">
                  {getTrendIcon(method.trend)}
                  <span className={`text-xs ml-1 ${
                    method.trend === 'up' ? 'text-green-600' :
                    method.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {method.trend_percentage !== 0 && `${method.trend_percentage > 0 ? '+' : ''}${method.trend_percentage}%`}
                  </span>
                </div>
              </div>
              
              <h4 className="font-medium mb-1">{method.name}</h4>
              <p className="text-2xl font-bold mb-1">{method.count}</p>
              <p className="text-sm opacity-75">₦{method.total_amount.toLocaleString()}</p>
              <p className="text-xs opacity-75 mt-1">{method.percentage}% of total</p>
              
              {/* Progress Bar */}
              <div className="mt-3 bg-white bg-opacity-50 rounded-full h-2">
                <div
                  className="bg-current h-2 rounded-full opacity-75"
                  style={{ width: `${method.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends Chart (Simplified) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Monthly Trends</h3>
        <div className="space-y-4">
          {analytics.monthly_trends.map((trend, index) => (
            <div key={trend.month} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-gray-600">{trend.month}</div>
              <div className="flex-1 flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-6 flex overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${(trend.paystack / 100) * 100}%` }}
                    title={`Paystack: ${trend.paystack}`}
                  />
                  <div
                    className="bg-orange-500 h-full"
                    style={{ width: `${(trend.flutterwave / 100) * 100}%` }}
                    title={`Flutterwave: ${trend.flutterwave}`}
                  />
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${(trend.bank_transfer / 100) * 100}%` }}
                    title={`Bank Transfer: ${trend.bank_transfer}`}
                  />
                  <div
                    className="bg-purple-500 h-full"
                    style={{ width: `${(trend.cash / 100) * 100}%` }}
                    title={`Cash: ${trend.cash}`}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {trend.paystack + trend.flutterwave + trend.bank_transfer + trend.cash} total
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
            <span>Paystack</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded mr-2" />
            <span>Flutterwave</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2" />
            <span>Bank Transfer</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded mr-2" />
            <span>Cash</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {analytics.methods
            .filter(method => method.trend === 'down')
            .map(method => (
              <div key={method.method} className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-shrink-0 p-1 bg-yellow-100 rounded-lg mr-3">
                  {getMethodIcon(method.method)}
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {method.name} usage is declining
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Consider reviewing the configuration or promoting this payment method to students.
                  </p>
                </div>
              </div>
            ))}
          
          {analytics.methods.some(method => method.trend === 'up') && (
            <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex-shrink-0 p-1 bg-green-100 rounded-lg mr-3">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Online payment methods are performing well
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Consider promoting digital payment options to increase efficiency.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentAnalyticsDashboard;
