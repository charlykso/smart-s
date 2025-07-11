import React from 'react';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useFeeStore } from '../../store/feeStore';
import { FeeService } from '../../services/feeService';

const FeeStats: React.FC = () => {
  const { fees, feeStats } = useFeeStore();

  // Calculate stats from current fees if feeStats is not available
  const calculateStats = () => {
    const totalFees = fees.length;
    const approvedFees = fees.filter(fee => fee.isApproved).length;
    const pendingApproval = fees.filter(fee => !fee.isApproved).length;
    const activeFees = fees.filter(fee => fee.isActive).length;
    const totalAmount = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const approvedAmount = fees.filter(fee => fee.isApproved).reduce((sum, fee) => sum + fee.amount, 0);
    const pendingAmount = fees.filter(fee => !fee.isApproved).reduce((sum, fee) => sum + fee.amount, 0);

    return {
      totalFees,
      approvedFees,
      pendingApproval,
      activeFees,
      totalAmount,
      approvedAmount,
      pendingAmount,
    };
  };

  const stats = feeStats || calculateStats();

  const statItems = [
    {
      name: 'Total Fees',
      value: stats.totalFees,
      icon: CurrencyDollarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: null,
    },
    {
      name: 'Approved Fees',
      value: stats.approvedFees,
      icon: CheckCircleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: stats.totalFees > 0 ? `${Math.round((stats.approvedFees / stats.totalFees) * 100)}%` : '0%',
    },
    {
      name: 'Pending Approval',
      value: stats.pendingApproval,
      icon: ClockIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: stats.totalFees > 0 ? `${Math.round((stats.pendingApproval / stats.totalFees) * 100)}%` : '0%',
    },
    {
      name: 'Active Fees',
      value: stats.activeFees,
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: stats.totalFees > 0 ? `${Math.round((stats.activeFees / stats.totalFees) * 100)}%` : '0%',
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Fee Management Overview</h3>
      
      {/* Stats Grid */}
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
                  {stat.change && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.change} of total</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Amount Summary */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Financial Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fee Amount</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {FeeService.formatAmount(stats.totalAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved Amount</p>
            <p className="text-xl font-semibold text-green-600 dark:text-green-400">
              {FeeService.formatAmount(stats.approvedAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Amount</p>
            <p className="text-xl font-semibold text-yellow-600 dark:text-yellow-400">
              {FeeService.formatAmount(stats.pendingAmount)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Fee Approval Progress</span>
          <span>
            {stats.totalFees > 0 ? Math.round((stats.approvedFees / stats.totalFees) * 100) : 0}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: stats.totalFees > 0 ? `${(stats.approvedFees / stats.totalFees) * 100}%` : '0%'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FeeStats;
