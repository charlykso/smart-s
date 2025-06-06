import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useFeeStore } from '../../store/feeStore';
import { useAuthStore } from '../../store/authStore';
import { FeeService } from '../../services/feeService';
import type { Fee, PaymentMethod } from '../../types/fee';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const paymentSchema = z.object({
  payment_method: z.enum(['paystack', 'flutterwave', 'bank_transfer', 'cash']),
  payment_type: z.enum(['full', 'installment']).optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface EnhancedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: Fee;
  onSuccess: () => void;
}

const EnhancedPaymentModal: React.FC<EnhancedPaymentModalProps> = ({
  isOpen,
  onClose,
  fee,
  onSuccess,
}) => {
  const { initiatePayment, isLoading } = useFeeStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<'methods' | 'processing' | 'bank_details' | 'success'>('methods');
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: 'paystack',
      payment_type: 'full',
    },
  });

  const selectedPaymentMethod = watch('payment_method');

  useEffect(() => {
    if (isOpen && user?.school) {
      loadAvailablePaymentMethods();
    }
  }, [isOpen, user?.school]);

  useEffect(() => {
    if (availableMethods.length > 0) {
      const method = availableMethods.find(m => m.method === selectedPaymentMethod);
      setSelectedMethod(method || null);
    }
  }, [selectedPaymentMethod, availableMethods]);

  const loadAvailablePaymentMethods = async () => {
    if (!user?.school) return;

    try {
      setLoadingMethods(true);
      const methods = await FeeService.getAvailablePaymentMethods(
        typeof user.school === 'string' ? user.school : user.school._id
      );
      setAvailableMethods(methods);
      
      // Set default to first available method
      if (methods.length > 0) {
        setValue('payment_method', methods[0].method);
      }
    } catch (error) {
      toast.error('Failed to load payment methods');
      console.error('Error loading payment methods:', error);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleFormSubmit = async (data: PaymentFormData) => {
    if (!fee || !user) return;

    if (data.payment_method === 'bank_transfer') {
      setStep('bank_details');
      return;
    }

    if (data.payment_method === 'cash') {
      setStep('success');
      toast.success('Please visit the Bursar office to complete your cash payment');
      return;
    }

    setStep('processing');

    try {
      const result = await initiatePayment({
        user_id: user._id,
        fee_id: fee._id,
        school_id: typeof user.school === 'string' ? user.school : user.school._id,
        payment_method: data.payment_method,
      });

      if (result.paymentUrl) {
        // Open payment gateway in new window
        const paymentWindow = window.open(result.paymentUrl, '_blank', 'width=600,height=700');
        
        // Monitor payment window
        const checkClosed = setInterval(() => {
          if (paymentWindow?.closed) {
            clearInterval(checkClosed);
            setStep('success');
            onSuccess();
          }
        }, 1000);
      } else {
        setStep('success');
        toast.success(result.message);
        onSuccess();
      }
    } catch (error) {
      setStep('methods');
      // Error is handled in the store
    }
  };

  const handleClose = () => {
    setStep('methods');
    setSelectedMethod(null);
    reset();
    onClose();
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'paystack':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      case 'flutterwave':
        return 'border-orange-200 bg-orange-50 text-orange-700';
      case 'bank_transfer':
        return 'border-green-200 bg-green-50 text-green-700';
      case 'cash':
        return 'border-purple-200 bg-purple-50 text-purple-700';
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  if (!isOpen || !fee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {step === 'methods' && 'Choose Payment Method'}
              {step === 'processing' && 'Processing Payment'}
              {step === 'bank_details' && 'Bank Transfer Details'}
              {step === 'success' && 'Payment Initiated'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Fee Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{fee.name}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Amount: <span className="font-medium text-green-600">₦{fee.amount.toLocaleString()}</span></p>
                <p>Type: <span className="capitalize">{fee.type}</span></p>
                {fee.description && <p>Description: {fee.description}</p>}
              </div>
            </div>

            {/* Payment Method Selection */}
            {step === 'methods' && (
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                {loadingMethods ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Available Payment Methods
                      </label>
                      
                      {availableMethods.map((method) => (
                        <label
                          key={method.method}
                          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedPaymentMethod === method.method
                              ? `${getPaymentMethodColor(method.method)} border-current`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={method.method}
                            {...register('payment_method')}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`p-2 rounded-lg ${
                              selectedPaymentMethod === method.method
                                ? 'bg-white bg-opacity-50'
                                : 'bg-gray-100'
                            }`}>
                              {getPaymentMethodIcon(method.method)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm opacity-75">{method.description}</p>
                            </div>
                            {selectedPaymentMethod === method.method && (
                              <CheckCircleIcon className="h-5 w-5" />
                            )}
                          </div>
                        </label>
                      ))}
                    </div>

                    {availableMethods.length === 0 && (
                      <div className="text-center py-8">
                        <ExclamationTriangleIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                        <p className="text-gray-500">No payment methods available</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Please contact the school administration
                        </p>
                      </div>
                    )}

                    {errors.payment_method && (
                      <p className="text-sm text-red-600">{errors.payment_method.message}</p>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || availableMethods.length === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                      >
                        {isLoading ? 'Processing...' : 'Continue'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* Processing State */}
            {step === 'processing' && (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600">Initiating payment...</p>
                <p className="text-sm text-gray-500 mt-2">
                  You will be redirected to the payment gateway
                </p>
              </div>
            )}

            {/* Bank Transfer Details */}
            {step === 'bank_details' && selectedMethod?.bank_details && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Bank Transfer Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Bank Name:</span>
                      <span className="font-medium">{selectedMethod.bank_details.bank_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Account Name:</span>
                      <span className="font-medium">{selectedMethod.bank_details.account_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Account Number:</span>
                      <span className="font-medium font-mono">{selectedMethod.bank_details.account_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Amount:</span>
                      <span className="font-medium text-green-600">₦{fee.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Please use your registration number as the transfer reference 
                    and contact the Bursar office after making the transfer for confirmation.
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setStep('methods')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setStep('success');
                      toast.success('Bank transfer details provided. Please make the transfer and contact the Bursar office.');
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                  >
                    I Understand
                  </button>
                </div>
              </div>
            )}

            {/* Success State */}
            {step === 'success' && (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Payment Initiated</h4>
                <p className="text-gray-600 mb-6">
                  {selectedPaymentMethod === 'cash' && 'Please visit the Bursar office to complete your payment.'}
                  {selectedPaymentMethod === 'bank_transfer' && 'Please make the bank transfer and contact the Bursar office.'}
                  {(selectedPaymentMethod === 'paystack' || selectedPaymentMethod === 'flutterwave') && 'Your payment is being processed.'}
                </p>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPaymentModal;
