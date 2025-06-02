import React, { useState } from 'react';
import { XMarkIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useFeeStore } from '../../store/feeStore';
import { FeeService } from '../../services/feeService';
import type { FeeApprovalModalProps } from '../../types/fee';

const FeeApprovalModal: React.FC<FeeApprovalModalProps> = ({
  isOpen,
  onClose,
  fee,
  onApprove,
  onReject,
}) => {
  const { approveFee, isLoading } = useFeeStore();
  const [rejectionReason, setRejectionReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    try {
      await approveFee(fee._id);
      onApprove(fee._id);
      onClose();
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      // Note: Backend doesn't have reject endpoint, so we'll just close for now
      onReject(fee._id, rejectionReason);
      onClose();
    } catch (error) {
      // Error handling
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

  if (!isOpen || !fee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Fee Approval Review
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Fee Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">{fee.name}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">School:</span>
                  <p className="font-medium text-gray-900">{getSchoolName()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Term:</span>
                  <p className="font-medium text-gray-900">{getTermName()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <p className="font-medium text-gray-900">{FeeService.formatAmount(fee.amount)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium text-gray-900 capitalize">{fee.type}</p>
                </div>
                {fee.isInstallmentAllowed && (
                  <>
                    <div>
                      <span className="text-gray-500">Installments:</span>
                      <p className="font-medium text-gray-900">{fee.no_ofInstallments} payments</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Per Installment:</span>
                      <p className="font-medium text-gray-900">
                        {FeeService.formatAmount(FeeService.calculateInstallmentAmount(fee.amount, fee.no_ofInstallments))}
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {fee.decription && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <span className="text-gray-500 text-sm">Description:</span>
                  <p className="text-sm text-gray-900 mt-1">{fee.decription}</p>
                </div>
              )}
            </div>

            {/* Action Selection */}
            {!action && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please review the fee details above and choose an action:
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setAction('approve')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approve Fee
                  </button>
                  
                  <button
                    onClick={() => setAction('reject')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircleIcon className="h-4 w-4 mr-2" />
                    Reject Fee
                  </button>
                </div>
              </div>
            )}

            {/* Approval Confirmation */}
            {action === 'approve' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                    <h5 className="text-sm font-medium text-green-900">Approve Fee</h5>
                  </div>
                  <p className="text-sm text-green-800 mt-2">
                    This fee will be approved and made available for payment by students.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Approving...' : 'Confirm Approval'}
                  </button>
                  <button
                    onClick={() => setAction(null)}
                    className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Rejection Form */}
            {action === 'reject' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <h5 className="text-sm font-medium text-red-900">Reject Fee</h5>
                  </div>
                  <p className="text-sm text-red-800 mt-2">
                    Please provide a reason for rejecting this fee. This will be communicated to the fee creator.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Please explain why this fee is being rejected..."
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={handleReject}
                    disabled={isLoading || !rejectionReason.trim()}
                    className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => setAction(null)}
                    className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer - only show if no action selected */}
          {!action && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeApprovalModal;
