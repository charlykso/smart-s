import React from 'react';

export interface PaymentSummaryCardProps {
  title: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  currency?: string;
  className?: string;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  title,
  totalAmount,
  paidAmount,
  pendingAmount,
  currency = '₦',
  className = '',
}) => {
  const paidPercentage = (paidAmount / totalAmount) * 100;
  const pendingPercentage = (pendingAmount / totalAmount) * 100;

  const formatAmount = (amount: number) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200 ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
        {title}
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-600 dark:text-gray-400">Total Expected</span>
          <span className="text-lg font-bold text-secondary-900 dark:text-white">{formatAmount(totalAmount)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-600 dark:text-green-400">Paid</span>
          <span className="text-sm font-medium text-green-600 dark:text-green-400">{formatAmount(paidAmount)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-600 dark:text-red-400">Pending</span>
          <span className="text-sm font-medium text-red-600 dark:text-red-400">{formatAmount(pendingAmount)}</span>
        </div>
        
        <div className="w-full bg-secondary-200 dark:bg-gray-600 rounded-full h-3">
          <div className="flex h-3 rounded-full overflow-hidden">
            <div
              className="bg-green-500 dark:bg-green-400"
              style={{ width: `${paidPercentage}%` }}
            ></div>
            <div
              className="bg-red-500 dark:bg-red-400"
              style={{ width: `${pendingPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-gray-400">
          <span>{paidPercentage.toFixed(1)}% Paid</span>
          <span>{pendingPercentage.toFixed(1)}% Pending</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;
