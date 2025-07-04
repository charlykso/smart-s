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
import './PaymentCard.css';

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
    if (!payment.user) {
      return 'No User';
    }
    const firstName = payment.user.firstname || '';
    const lastName = payment.user.lastname || '';
    if (!firstName && !lastName) {
      return 'Anonymous User';
    }
    return `${firstName} ${lastName}`.trim();
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start min-w-0 flex-1">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white line-clamp-3 break-words leading-tight">
                {getFeeName()}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 break-words">{getUserName()}</p>
            </div>
          </div>
          
          {/* Status */}
          <div className="flex flex-col items-end space-y-2 flex-shrink-0">
            <div className="flex items-center">
              {getStatusIcon()}
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 pb-4 space-y-3">
        {/* Payment Details */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-sm gap-1">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">Amount:</span>
            <span className="font-semibold text-gray-900 dark:text-white text-base">
              {FeeService.formatAmount(payment.amount)}
            </span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-sm gap-1">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">Payment Method:</span>
            <div className="flex items-center">
              <span className="mr-1">{getMethodIcon()}</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {payment.mode_of_payment.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-sm gap-1">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">Transaction Date:</span>
            <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm break-words">
              {formatDate(payment.trans_date)}
            </span>
          </div>

          {payment.trx_ref && (
            <div className="space-y-1">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Reference:</span>
              <div className="font-mono text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all word-break-break-all max-w-full">
                {payment.trx_ref}
              </div>
            </div>
          )}

          {payment.trans_id && (
            <div className="space-y-1">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Transaction ID:</span>
              <div className="font-mono text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded break-all word-break-break-all max-w-full">
                {payment.trans_id}
              </div>
            </div>
          )}

          {payment.channel && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-sm gap-1">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">Channel:</span>
              <span className="font-medium text-gray-900 dark:text-white capitalize">
                {payment.channel}
              </span>
            </div>
          )}

          {payment.isInstallment && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-sm gap-1">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">Payment Type:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                Installment
              </span>
            </div>
          )}
        </div>

        {/* Payment Date */}
        {payment.paid_at && (
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start text-sm gap-1">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">Paid At:</span>
              <span className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm break-words">
                {formatDate(payment.paid_at)}
              </span>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 space-x-2">
            <span className="truncate">Created: {new Date(payment.createdAt).toLocaleDateString()}</span>
            <span className="truncate">Updated: {new Date(payment.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-750 rounded-b-lg">
          <div className="flex items-center justify-between">
            {/* Status Indicator */}
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {payment.status === 'success' && (
                <span className="text-xs text-green-600 dark:text-green-400 font-medium truncate">✓ Payment Successful</span>
              )}
              {payment.status === 'pending' && (
                <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium truncate">⏳ Payment Pending</span>
              )}
              {payment.status === 'failed' && (
                <span className="text-xs text-red-600 dark:text-red-400 font-medium truncate">✗ Payment Failed</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {onView && (
                <button
                  onClick={() => onView(payment)}
                  className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="View payment details"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}
              
              {onRefund && payment.status === 'success' && (
                <button
                  onClick={() => onRefund(payment)}
                  className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors"
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
