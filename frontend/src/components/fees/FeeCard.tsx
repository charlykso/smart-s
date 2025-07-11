import React from 'react';
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { FeeService } from '../../services/feeService';
import { useFeeStore } from '../../store/feeStore';
import type { FeeCardProps } from '../../types/fee';
import './FeeCard.css';

const FeeCard: React.FC<FeeCardProps> = ({
  fee,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  showActions = true,
}) => {
  const { deleteFee } = useFeeStore();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${fee.name}?`)) {
      try {
        await deleteFee(fee._id);
        onDelete?.(fee);
      } catch {
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
        <div className="flex items-center text-green-600 dark:text-green-400">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Approved</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-yellow-600 dark:text-yellow-400">
          <ClockIcon className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">Pending</span>
        </div>
      );
    }
  };

  const getActiveBadge = () => {
    if (fee.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start min-w-0 flex-1">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 title={fee.name} className="text-sm font-medium text-gray-900 dark:text-white fee-card-title">
                {fee.name}
              </h3>
              <p title={getSchoolName()} className="text-xs text-gray-500 dark:text-gray-400 mt-1 fee-card-school-name">
                {getSchoolName()}
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex flex-col items-end space-y-1 flex-shrink-0">
            {getStatusBadge()}
            {getActiveBadge()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 space-y-3">
        {/* Fee Details */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Amount:</span>
            <span className="font-medium text-gray-900 dark:text-white text-right">
              {FeeService.formatAmount(fee.amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Term:</span>
            <span title={getTermName()} className="font-medium text-gray-900 dark:text-white fee-card-term-name ml-2">
              {getTermName()}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Type:</span>
            <div className="flex-shrink-0">{getTypeBadge()}</div>
          </div>

          {fee.isInstallmentAllowed && (
            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Installments:</span>
              <span className="font-medium text-gray-900 dark:text-white fee-card-installment-text text-xs ml-2">
                {fee.no_ofInstallments} payments of {FeeService.formatAmount(FeeService.calculateInstallmentAmount(fee.amount, fee.no_ofInstallments))}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {fee.decription && (
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400 fee-card-description leading-relaxed">
              {fee.decription}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span title={`Created: ${new Date(fee.createdAt).toLocaleDateString()}`} className="fee-card-school-name">
              Created: {new Date(fee.createdAt).toLocaleDateString()}
            </span>
            <span title={`Updated: ${new Date(fee.updatedAt).toLocaleDateString()}`} className="fee-card-school-name">
              Updated: {new Date(fee.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 rounded-b-lg border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {/* Primary Actions */}
            <div className="flex items-center space-x-2">
              {!fee.isApproved && onApprove && (
                <button
                  onClick={() => onApprove(fee)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 rounded-md transition-colors"
                >
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Approve
                </button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="flex items-center space-x-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(fee)}
                  className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  title="Edit fee"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                  title="Delete fee"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}

              {!fee.isApproved && onReject && (
                <button
                  onClick={() => onReject(fee)}
                  className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
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
