import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  XMarkIcon,
  CreditCardIcon,
  BanknotesIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useFeeStore } from '../../store/feeStore';
import { useAuthStore } from '../../store/authStore';
import { FeeService } from '../../services/feeService';
import toast from 'react-hot-toast';

interface StudentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: any;
  onSuccess: () => void;
}

const paymentSchema = z.object({
  payment_method: z.enum(['paystack', 'flutterwave', 'cash']),
  payment_type: z.enum(['full', 'installment']).optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const StudentPaymentModal: React.FC<StudentPaymentModalProps> = ({
  isOpen,
  onClose,
  fee,
  onSuccess,
}) => {
  const { initiatePayment, isLoading } = useFeeStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: 'paystack',
      payment_type: 'full',
    },
  });

  const selectedMethod = watch('payment_method');
  const selectedType = watch('payment_type');

  const handleFormSubmit = async (data: PaymentFormData) => {
    if (!fee || !user) return;

    setStep('processing');

    try {
      if (data.payment_method === 'cash') {
        // For cash payments, show instructions to visit bursar
        setStep('success');
        toast.success('Please visit the Bursar office to complete your cash payment');
        return;
      }

      // For online payments (Paystack/Flutterwave)
      const result = await initiatePayment({
        user_id: user._id,
        fee_id: fee._id,
      });

      if (result.paymentUrl) {
        setPaymentUrl(result.paymentUrl);
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
      setStep('method');
      toast.error('Payment initiation failed. Please try again.');
    }
  };

  const handleClose = () => {
    setStep('method');
    setPaymentUrl(null);
    reset();
    onClose();
  };

  if (!isOpen || !fee) return null;

  const fullAmount = fee.amount;
  const installmentAmount = fee.isInstallmentAllowed && fee.no_ofInstallments
    ? FeeService.calculateInstallmentAmount(fee.amount, fee.no_ofInstallments)
    : fee.amount;

  const paymentAmount = selectedType === 'installment' ? installmentAmount : fullAmount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCardIcon className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Pay Fee
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Fee Information */}
          <div className="px-4 pb-4 sm:px-6">
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">{fee.name}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Term: <span className="font-medium text-gray-900">{fee.term.name}</span></p>
                <p>Type: <span className="font-medium text-gray-900 capitalize">{fee.type}</span></p>
                <p>Total Amount: <span className="font-medium text-gray-900">{FeeService.formatAmount(fullAmount)}</span></p>
                {fee.isInstallmentAllowed && (
                  <p>Installment Option: <span className="font-medium text-gray-900">
                    {FeeService.formatAmount(installmentAmount)} × {fee.no_ofInstallments} payments
                  </span></p>
                )}
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 'method' && (
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-6">
                  {/* Payment Type Selection (if installments available) */}
                  {fee.isInstallmentAllowed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Type
                      </label>
                      <div className="space-y-3">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            {...register('payment_type')}
                            value="full"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              Full Payment - {FeeService.formatAmount(fullAmount)}
                            </p>
                            <p className="text-xs text-gray-500">Pay the complete fee amount</p>
                          </div>
                        </label>
                        
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            {...register('payment_type')}
                            value="installment"
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              Installment Payment - {FeeService.formatAmount(installmentAmount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Pay in {fee.no_ofInstallments} installments
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      {/* Paystack */}
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          {...register('payment_method')}
                          value="paystack"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          <span className="text-lg mr-3">💳</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Paystack</p>
                            <p className="text-xs text-gray-500">Pay with debit/credit card via Paystack</p>
                          </div>
                        </div>
                      </label>

                      {/* Flutterwave */}
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          {...register('payment_method')}
                          value="flutterwave"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          <span className="text-lg mr-3">🦋</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Flutterwave</p>
                            <p className="text-xs text-gray-500">Pay with card, bank transfer, or mobile money</p>
                          </div>
                        </div>
                      </label>

                      {/* Cash Payment */}
                      <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          {...register('payment_method')}
                          value="cash"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          <BanknotesIcon className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Cash Payment</p>
                            <p className="text-xs text-gray-500">Visit the Bursar office to pay with cash</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Cash Payment Instructions */}
                  {selectedMethod === 'cash' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <h5 className="text-sm font-medium text-blue-900">Cash Payment Instructions</h5>
                      </div>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Visit the Bursar office during working hours</p>
                        <p>• Bring your student ID and fee details</p>
                        <p>• Payment will be processed by the Bursar</p>
                        <p>• You will receive a receipt upon payment</p>
                      </div>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-green-900 mb-2">Payment Summary</h5>
                    <div className="space-y-1 text-sm text-green-800">
                      <div className="flex justify-between">
                        <span>Amount to Pay:</span>
                        <span className="font-medium">{FeeService.formatAmount(paymentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment Method:</span>
                        <span className="font-medium capitalize">{selectedMethod}</span>
                      </div>
                      {selectedType === 'installment' && (
                        <div className="flex justify-between">
                          <span>Payment Type:</span>
                          <span className="font-medium">Installment ({fee.no_ofInstallments} payments)</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : selectedMethod === 'cash' ? 'Get Instructions' : 'Proceed to Payment'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h4>
                <p className="text-sm text-gray-500">
                  {selectedMethod === 'cash' 
                    ? 'Preparing cash payment instructions...'
                    : 'Redirecting to payment gateway...'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedMethod === 'cash' ? 'Instructions Ready' : 'Payment Initiated'}
                </h4>
                <p className="text-sm text-gray-500 mb-6">
                  {selectedMethod === 'cash' 
                    ? 'Please visit the Bursar office to complete your payment.'
                    : 'Complete your payment in the opened window.'
                  }
                </p>
                <button
                  onClick={handleClose}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPaymentModal;
