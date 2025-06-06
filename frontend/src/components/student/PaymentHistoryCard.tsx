import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { FeeService } from '../../services/feeService';

interface PaymentHistoryCardProps {
  payment: {
    _id: string;
    amount: number;
    fee: {
      _id: string;
      name: string;
      amount: number;
      type: string;
      term?: any;
    };
    status: string;
    mode_of_payment: string;
    trans_date: string;
    trx_ref: string;
    trans_id?: string;
    channel?: string;
    isInstallment?: boolean;
  };
}

const PaymentHistoryCard: React.FC<PaymentHistoryCardProps> = ({ payment }) => {
  const getStatusIcon = () => {
    switch (payment.status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    const colorClass = FeeService.getPaymentStatusColor(payment.status);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
      </span>
    );
  };

  const getMethodIcon = () => {
    switch (payment.mode_of_payment) {
      case 'paystack':
        return '💳';
      case 'flutterwave':
        return '🦋';
      case 'bank_transfer':
        return '🏦';
      case 'cash':
        return <BanknotesIcon className="h-5 w-5 text-green-600" />;
      default:
        return <CreditCardIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTermName = () => {
    if (payment.fee.term && typeof payment.fee.term === 'object') {
      return payment.fee.term.name;
    }
    return 'Unknown Term';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {getStatusIcon()}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">
                {payment.fee.name}
              </h3>
              <p className="text-sm text-gray-500">{getTermName()}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {getStatusBadge()}
            <span className="text-lg font-bold text-gray-900">
              {FeeService.formatAmount(payment.amount)}
            </span>
          </div>
        </div>

        {/* Payment Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Payment Method */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Method:</span>
            <div className="flex items-center">
              <span className="mr-2">
                {typeof getMethodIcon() === 'string' ? getMethodIcon() : getMethodIcon()}
              </span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {payment.mode_of_payment.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Payment Date */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Date:</span>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">
                {formatDate(payment.trans_date)}
              </span>
            </div>
          </div>

          {/* Fee Type */}
          <div className="flex items-center">
            <span className="text-sm text-gray-500 w-24">Fee Type:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${FeeService.getFeeTypeColor(payment.fee.type)}`}>
              {payment.fee.type.charAt(0).toUpperCase() + payment.fee.type.slice(1)}
            </span>
          </div>

          {/* Channel (if available) */}
          {payment.channel && (
            <div className="flex items-center">
              <span className="text-sm text-gray-500 w-24">Channel:</span>
              <span className="text-sm font-medium text-gray-900 capitalize">
                {payment.channel}
              </span>
            </div>
          )}
        </div>

        {/* Transaction References */}
        <div className="space-y-2 mb-4">
          {payment.trx_ref && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Reference:</span>
              <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {payment.trx_ref}
              </span>
            </div>
          )}

          {payment.trans_id && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Transaction ID:</span>
              <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {payment.trans_id}
              </span>
            </div>
          )}
        </div>

        {/* Payment Type Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {payment.isInstallment && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Installment Payment
              </span>
            )}
            
            {payment.status === 'success' && (
              <span className="text-xs text-green-600 font-medium">✓ Payment Successful</span>
            )}
            
            {payment.status === 'pending' && (
              <span className="text-xs text-yellow-600 font-medium">⏳ Payment Pending</span>
            )}
            
            {payment.status === 'failed' && (
              <span className="text-xs text-red-600 font-medium">✗ Payment Failed</span>
            )}
          </div>

          {/* Receipt/Download Action */}
          {payment.status === 'success' && (
            <button
              onClick={() => {
                // TODO: Implement receipt download
                console.log('Download receipt for payment:', payment._id);
              }}
              className="inline-flex items-center text-xs text-primary-600 hover:text-primary-800 font-medium"
            >
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Receipt
            </button>
          )}
        </div>

        {/* Progress Bar for Installments */}
        {payment.isInstallment && payment.status === 'success' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Payment Progress</span>
              <span>
                {FeeService.formatAmount(payment.amount)} of {FeeService.formatAmount(payment.fee.amount)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(payment.amount / payment.fee.amount) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryCard;
