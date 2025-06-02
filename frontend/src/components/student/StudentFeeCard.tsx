import React from 'react';
import {
  CurrencyDollarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CreditCardIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { FeeService } from '../../services/feeService';

interface StudentFeeCardProps {
  fee: {
    _id: string;
    name: string;
    amount: number;
    type: string;
    term: {
      _id: string;
      name: string;
    };
    dueDate?: string;
    description?: string;
    isInstallmentAllowed?: boolean;
    no_ofInstallments?: number;
  };
  onPayNow: (fee: any) => void;
  isOverdue?: boolean;
  isDueSoon?: boolean;
}

const StudentFeeCard: React.FC<StudentFeeCardProps> = ({
  fee,
  onPayNow,
  isOverdue = false,
  isDueSoon = false,
}) => {
  const getStatusBadge = () => {
    if (isOverdue) {
      return (
        <div className="flex items-center text-red-600">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">OVERDUE</span>
        </div>
      );
    } else if (isDueSoon) {
      return (
        <div className="flex items-center text-yellow-600">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">DUE SOON</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-blue-600">
          <InformationCircleIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">PENDING</span>
        </div>
      );
    }
  };

  const getCardBorderColor = () => {
    if (isOverdue) return 'border-red-200 bg-red-50';
    if (isDueSoon) return 'border-yellow-200 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    
    const dueDate = new Date(dateString);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) {
      return `Overdue by ${Math.abs(daysUntilDue)} day(s)`;
    } else if (daysUntilDue === 0) {
      return 'Due today';
    } else if (daysUntilDue <= 7) {
      return `Due in ${daysUntilDue} day(s)`;
    } else {
      return dueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getTypeBadge = () => {
    const colorClass = FeeService.getFeeTypeColor(fee.type);
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {fee.type.charAt(0).toUpperCase() + fee.type.slice(1)}
      </span>
    );
  };

  const installmentAmount = fee.isInstallmentAllowed && fee.no_ofInstallments
    ? FeeService.calculateInstallmentAmount(fee.amount, fee.no_ofInstallments)
    : fee.amount;

  return (
    <div className={`rounded-lg shadow-sm border-2 hover:shadow-md transition-all duration-200 ${getCardBorderColor()}`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className={`h-8 w-8 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-primary-600'}`} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {fee.name}
              </h3>
              <p className="text-sm text-gray-500">{fee.term.name}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-1">
            {getStatusBadge()}
            {getTypeBadge()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 space-y-3">
        {/* Fee Amount */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Total Amount:</span>
            <span className="text-xl font-bold text-gray-900">
              {FeeService.formatAmount(fee.amount)}
            </span>
          </div>

          {fee.isInstallmentAllowed && fee.no_ofInstallments && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center mb-2">
                <InformationCircleIcon className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm font-medium text-blue-900">Installment Option Available</span>
              </div>
              <div className="text-sm text-blue-800">
                <p>Pay in {fee.no_ofInstallments} installments of {FeeService.formatAmount(installmentAmount)} each</p>
              </div>
            </div>
          )}

          {/* Due Date */}
          {fee.dueDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Due Date:
              </span>
              <span className={`font-medium ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-yellow-600' : 'text-gray-900'}`}>
                {formatDueDate(fee.dueDate)}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {fee.description && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">{fee.description}</p>
          </div>
        )}

        {/* Payment Options Info */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <CreditCardIcon className="h-3 w-3 mr-1" />
            <span>Pay with Paystack, Flutterwave, or Cash (via Bursar)</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <button
          onClick={() => onPayNow(fee)}
          className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
            isOverdue
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : isDueSoon
              ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
              : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          <CreditCardIcon className="h-4 w-4 mr-2" />
          {isOverdue ? 'Pay Now (Overdue)' : isDueSoon ? 'Pay Now (Due Soon)' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
};

export default StudentFeeCard;
