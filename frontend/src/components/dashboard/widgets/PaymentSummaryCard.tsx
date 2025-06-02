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
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        {title}
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-600">Total Expected</span>
          <span className="text-lg font-bold text-secondary-900">{formatAmount(totalAmount)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-600">Paid</span>
          <span className="text-sm font-medium text-green-600">{formatAmount(paidAmount)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-red-600">Pending</span>
          <span className="text-sm font-medium text-red-600">{formatAmount(pendingAmount)}</span>
        </div>
        
        <div className="w-full bg-secondary-200 rounded-full h-3">
          <div className="flex h-3 rounded-full overflow-hidden">
            <div
              className="bg-green-500"
              style={{ width: `${paidPercentage}%` }}
            ></div>
            <div
              className="bg-red-500"
              style={{ width: `${pendingPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-secondary-500">
          <span>{paidPercentage.toFixed(1)}% Paid</span>
          <span>{pendingPercentage.toFixed(1)}% Pending</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummaryCard;
