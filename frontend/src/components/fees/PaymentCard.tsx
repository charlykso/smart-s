import React from 'react';
import {
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { FeeService } from '../../services/feeService';
import type { PaymentCardProps } from '../../types/fee';

const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onView,
  onRefund,
  showActions = true,
}) => {
  const getUserName = () => {
    if (typeof payment.user === 'string') {
      return 'Unknown User';
    }
    return payment.user ? `${payment.user.firstname} ${payment.user.lastname}` : 'No User';
  };

  const getFeeName = () => {
    if (typeof payment.fee === 'string') {
      return 'Unknown Fee';
    }
    return payment.fee?.name || 'No Fee';
  };

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
    return FeeService.getPaymentMethodIcon(payment.mode_of_payment);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {getFeeName()}
              </h3>
              <p className="text-sm text-gray-500">{getUserName()}</p>
            </div>
          </div>
          
          {/* Status */}
          <div className="flex flex-col items-end space-y-1">
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="ml-1 text-sm font-medium text-gray-900">
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 space-y-3">
        {/* Payment Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount:</span>
            <span className="font-medium text-gray-900">
              {FeeService.formatAmount(payment.amount)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Payment Method:</span>
            <div className="flex items-center">
              <span className="mr-1">{getMethodIcon()}</span>
              <span className="font-medium text-gray-900 capitalize">
                {payment.mode_of_payment.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Transaction Date:</span>
            <span className="font-medium text-gray-900">
              {formatDate(payment.trans_date)}
            </span>
          </div>

          {payment.trx_ref && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Reference:</span>
              <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {payment.trx_ref}
              </span>
            </div>
          )}

          {payment.trans_id && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction ID:</span>
              <span className="font-mono text-xs text-gray-900 bg-gray-100 px-2 py-1 rounded">
                {payment.trans_id}
              </span>
            </div>
          )}

          {payment.channel && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Channel:</span>
              <span className="font-medium text-gray-900 capitalize">
                {payment.channel}
              </span>
            </div>
          )}

          {payment.isInstallment && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment Type:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Installment
              </span>
            </div>
          )}
        </div>

        {/* Payment Date */}
        {payment.paid_at && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Paid At:</span>
              <span className="font-medium text-gray-900">
                {formatDate(payment.paid_at)}
              </span>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Created: {new Date(payment.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(payment.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2">
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

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {onView && (
                <button
                  onClick={() => onView(payment)}
                  className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="View payment details"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}
              
              {onRefund && payment.status === 'success' && (
                <button
                  onClick={() => onRefund(payment)}
                  className="inline-flex items-center p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
                  title="Refund payment"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentCard;
