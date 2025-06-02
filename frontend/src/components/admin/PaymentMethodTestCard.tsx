import React, { useState } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import type { PaymentMethod } from '../../types/fee';

interface PaymentMethodTestCardProps {
  method: PaymentMethod;
  onTest: (method: string) => Promise<{ success: boolean; message: string }>;
}

const PaymentMethodTestCard: React.FC<PaymentMethodTestCardProps> = ({ method, onTest }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await onTest(method.method);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodIcon = () => {
    switch (method.method) {
      case 'paystack':
      case 'flutterwave':
        return <CreditCardIcon className="h-6 w-6" />;
      case 'bank_transfer':
        return <BuildingLibraryIcon className="h-6 w-6" />;
      case 'cash':
        return <BanknotesIcon className="h-6 w-6" />;
      default:
        return <CreditCardIcon className="h-6 w-6" />;
    }
  };

  const getMethodColor = () => {
    switch (method.method) {
      case 'paystack':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'flutterwave':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'bank_transfer':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'cash':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = () => {
    if (!method.enabled) {
      return 'text-gray-500 bg-gray-100';
    }
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className={`border rounded-lg p-4 ${getMethodColor()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="p-2 bg-white bg-opacity-50 rounded-lg mr-3">
            {getMethodIcon()}
          </div>
          <div>
            <h4 className="font-medium">{method.name}</h4>
            <p className="text-sm opacity-75">{method.description}</p>
          </div>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {method.enabled ? 'Active' : 'Disabled'}
        </span>
      </div>

      {/* Bank Details for Bank Transfer */}
      {method.method === 'bank_transfer' && method.bank_details && (
        <div className="mb-3 p-3 bg-white bg-opacity-50 rounded-lg">
          <h5 className="text-sm font-medium mb-2">Bank Details</h5>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Bank:</span> {method.bank_details.bank_name}</p>
            <p><span className="font-medium">Account:</span> {method.bank_details.account_name}</p>
            <p><span className="font-medium">Number:</span> {method.bank_details.account_no}</p>
          </div>
        </div>
      )}

      {/* Test Button and Results */}
      {method.enabled && method.method !== 'cash' && (
        <div className="space-y-3">
          <button
            onClick={handleTest}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-gray-800 bg-opacity-75 rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Test {method.name}
              </>
            )}
          </button>

          {testResult && (
            <div className={`rounded-lg p-3 ${
              testResult.success 
                ? 'bg-green-100 border border-green-200' 
                : 'bg-red-100 border border-red-200'
            }`}>
              <div className="flex items-center">
                {testResult.success ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2" />
                )}
                <p className={`text-xs font-medium ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cash Payment Info */}
      {method.method === 'cash' && (
        <div className="p-3 bg-white bg-opacity-50 rounded-lg">
          <p className="text-xs">
            Cash payments are processed at the Bursar office. No configuration required.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodTestCard;
