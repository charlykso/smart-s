import React from 'react';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { FeeService } from '../../services/feeService';
import { useFeeStore } from '../../store/feeStore';
import type { FeeCardProps } from '../../types/fee';

const FeeCard: React.FC<FeeCardProps> = ({
  fee,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onInitiatePayment,
  showActions = true,
}) => {
  const { deleteFee } = useFeeStore();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${fee.name}?`)) {
      try {
        await deleteFee(fee._id);
        onDelete?.(fee);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const getSchoolName = () => {
    if (typeof fee.school === 'string') {
      return 'Unknown School';
    }
    return fee.school?.name || 'No School';
  };

  const getTermName = () => {
    if (typeof fee.term === 'string') {
      return 'Unknown Term';
    }
    return fee.term?.name || 'No Term';
  };

  const getStatusBadge = () => {
    if (fee.isApproved) {
      return (
        <div className="flex items-center text-green-600">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Approved</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-yellow-600">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Pending</span>
        </div>
      );
    }
  };

  const getActiveBadge = () => {
    if (fee.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inactive
        </span>
      );
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {fee.name}
              </h3>
              <p className="text-sm text-gray-500">{getSchoolName()}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-1">
            {getStatusBadge()}
            {getActiveBadge()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 space-y-3">
        {/* Fee Details */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount:</span>
            <span className="font-medium text-gray-900">
              {FeeService.formatAmount(fee.amount)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Term:</span>
            <span className="font-medium text-gray-900">{getTermName()}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Type:</span>
            <div>{getTypeBadge()}</div>
          </div>

          {fee.isInstallmentAllowed && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Installments:</span>
              <span className="font-medium text-gray-900">
                {fee.no_ofInstallments} payments of {FeeService.formatAmount(FeeService.calculateInstallmentAmount(fee.amount, fee.no_ofInstallments))}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {fee.decription && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-600 line-clamp-2">{fee.decription}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Created: {new Date(fee.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(fee.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            {/* Primary Actions */}
            <div className="flex items-center space-x-2">
              {!fee.isApproved && onApprove && (
                <button
                  onClick={() => onApprove(fee)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors"
                >
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Approve
                </button>
              )}
              
              {fee.isApproved && onInitiatePayment && (
                <button
                  onClick={() => onInitiatePayment(fee)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-md transition-colors"
                >
                  <CreditCardIcon className="h-3 w-3 mr-1" />
                  Pay Now
                </button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(fee)}
                  className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  title="Edit fee"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete fee"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}

              {!fee.isApproved && onReject && (
                <button
                  onClick={() => onReject(fee)}
                  className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Reject fee"
                >
                  <XCircleIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCard;
