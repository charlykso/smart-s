import React, { useState } from 'react';
import {
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface BulkUserActionsProps {
  selectedUserIds: string[];
  onBulkAction: (action: string, userIds: string[]) => Promise<void>;
  onClearSelection: () => void;
}

const BulkUserActions: React.FC<BulkUserActionsProps> = ({
  selectedUserIds,
  onBulkAction,
  onClearSelection,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

  const handleBulkAction = async (action: string) => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select users first');
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkAction(action, selectedUserIds);
      onClearSelection();
      setShowConfirmDialog(null);
      
      const actionMessages = {
        activate: 'Users activated successfully',
        deactivate: 'Users deactivated successfully',
        delete: 'Users deleted successfully',
        export: 'Users exported successfully',
      };
      
      toast.success(actionMessages[action as keyof typeof actionMessages] || 'Action completed');
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to perform bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAction = (action: string) => {
    setShowConfirmDialog(action);
  };

  const bulkActions = [
    {
      id: 'activate',
      label: 'Activate Users',
      icon: CheckCircleIcon,
      color: 'text-green-600 hover:text-green-700',
      bgColor: 'hover:bg-green-50',
      requiresConfirm: true,
    },
    {
      id: 'deactivate',
      label: 'Deactivate Users',
      icon: XCircleIcon,
      color: 'text-yellow-600 hover:text-yellow-700',
      bgColor: 'hover:bg-yellow-50',
      requiresConfirm: true,
    },
    {
      id: 'export',
      label: 'Export Users',
      icon: ArrowDownTrayIcon,
      color: 'text-blue-600 hover:text-blue-700',
      bgColor: 'hover:bg-blue-50',
      requiresConfirm: false,
    },
    {
      id: 'delete',
      label: 'Delete Users',
      icon: TrashIcon,
      color: 'text-red-600 hover:text-red-700',
      bgColor: 'hover:bg-red-50',
      requiresConfirm: true,
    },
  ];

  if (selectedUserIds.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-secondary-200 dark:border-gray-700 rounded-lg shadow-sm p-4 mb-4 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserIcon className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-sm font-medium text-secondary-900 dark:text-gray-100">
              {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {bulkActions.map((action) => (
              <button
                key={action.id}
                onClick={() => action.requiresConfirm ? confirmAction(action.id) : handleBulkAction(action.id)}
                disabled={isProcessing}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border border-transparent transition-colors ${action.color} ${action.bgColor} dark:hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <action.icon className="h-4 w-4 mr-1" />
                {action.label}
              </button>
            ))}
            
            <button
              onClick={onClearSelection}
              className="text-sm text-secondary-500 dark:text-gray-400 hover:text-secondary-700 dark:hover:text-gray-300 px-2 py-1 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-gray-900 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                      Confirm Bulk Action
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to {showConfirmDialog} {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''}? 
                        {showConfirmDialog === 'delete' && ' This action cannot be undone.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleBulkAction(showConfirmDialog)}
                  disabled={isProcessing}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    showConfirmDialog === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(null)}
                  disabled={isProcessing}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkUserActions;
