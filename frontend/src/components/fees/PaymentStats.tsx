import React from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useFeeStore } from '../../store/feeStore';
import { FeeService } from '../../services/feeService';

const PaymentStats: React.FC = () => {
  const { payments, paymentStats } = useFeeStore();

  // Calculate stats from current payments if paymentStats is not available
  const calculateStats = () => {
    // Ensure payments is an array and handle null/undefined values
    const validPayments = Array.isArray(payments) ? payments.filter(payment => payment && typeof payment.amount === 'number') : [];

    const totalPayments = validPayments.length;
    const successfulPayments = validPayments.filter(payment => payment.status === 'success').length;
    const pendingPayments = validPayments.filter(payment => payment.status === 'pending').length;
    const failedPayments = validPayments.filter(payment => payment.status === 'failed').length;
    const totalAmount = validPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const successfulAmount = validPayments.filter(payment => payment.status === 'success').reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const pendingAmount = validPayments.filter(payment => payment.status === 'pending').reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const paymentsByMethod = {
      paystack: validPayments.filter(p => p.mode_of_payment === 'paystack').length,
      flutterwave: validPayments.filter(p => p.mode_of_payment === 'flutterwave').length,
      bank_transfer: validPayments.filter(p => p.mode_of_payment === 'bank_transfer').length,
      cash: validPayments.filter(p => p.mode_of_payment === 'cash').length,
    };

    return {
      totalPayments,
      successfulPayments,
      pendingPayments,
      failedPayments,
      totalAmount,
      successfulAmount,
      pendingAmount,
      paymentsByMethod,
      recentPayments: validPayments.slice(-5), // Add recent payments to match interface
    };
  };

  const stats = paymentStats || calculateStats();

  const statItems = [
    {
      name: 'Total Payments',
      value: stats.totalPayments || 0,
      icon: CreditCardIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Successful',
      value: stats.successfulPayments || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      percentage: (stats.totalPayments || 0) > 0 ? Math.round(((stats.successfulPayments || 0) / (stats.totalPayments || 1)) * 100) : 0,
    },
    {
      name: 'Pending',
      value: stats.pendingPayments || 0,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      percentage: (stats.totalPayments || 0) > 0 ? Math.round(((stats.pendingPayments || 0) / (stats.totalPayments || 1)) * 100) : 0,
    },
    {
      name: 'Failed',
      value: stats.failedPayments || 0,
      icon: XCircleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      percentage: (stats.totalPayments || 0) > 0 ? Math.round(((stats.failedPayments || 0) / (stats.totalPayments || 1)) * 100) : 0,
    },
  ];

  const paymentMethods = [
    { name: 'Paystack', value: stats.paymentsByMethod?.paystack || 0, icon: '💳', color: 'text-blue-600' },
    { name: 'Flutterwave', value: stats.paymentsByMethod?.flutterwave || 0, icon: '🦋', color: 'text-orange-600' },
    { name: 'Bank Transfer', value: stats.paymentsByMethod?.bank_transfer || 0, icon: '🏦', color: 'text-green-600' },
    { name: 'Cash', value: stats.paymentsByMethod?.cash || 0, icon: '💵', color: 'text-purple-600' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Payment Analytics</h3>
      
      {/* Payment Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="relative">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                  {stat.percentage !== undefined && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.percentage}%</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Payment Methods</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {paymentMethods.map((method) => (
            <div key={method.name} className="text-center">
              <div className="text-2xl mb-2">{method.icon}</div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{method.name}</p>
              <p className={`text-lg font-semibold ${method.color}`}>{method.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Amount Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Revenue Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {FeeService.formatAmount(stats.totalAmount || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful Payments</p>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              {FeeService.formatAmount(stats.successfulAmount || 0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Amount</p>
            <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">
              {FeeService.formatAmount(stats.pendingAmount || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Success Rate Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Payment Success Rate</span>
          <span>
            {(stats.totalPayments || 0) > 0 ? Math.round(((stats.successfulPayments || 0) / (stats.totalPayments || 1)) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: (stats.totalPayments || 0) > 0 ? `${((stats.successfulPayments || 0) / (stats.totalPayments || 1)) * 100}%` : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentStats;
