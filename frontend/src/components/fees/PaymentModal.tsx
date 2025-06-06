import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useFeeStore } from '../../store/feeStore';
import { useAuthStore } from '../../store/authStore';
import { FeeService } from '../../services/feeService';
import { PAYMENT_METHODS } from '../../types/fee';
import type { PaymentModalProps, InitiatePaymentData } from '../../types/fee';

const paymentSchema = z.object({
  user_id: z.string().min(1, 'User is required'),
  fee_id: z.string().min(1, 'Fee is required'),
  mode_of_payment: z.enum(['paystack', 'flutterwave', 'bank_transfer', 'cash']),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  fee,
  user,
  onSubmit,
}) => {
  const { initiatePayment, processCashPayment, isLoading } = useFeeStore();
  const { user: currentUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      user_id: user?._id || currentUser?._id || '',
      fee_id: fee?._id || '',
      mode_of_payment: 'paystack',
    },
  });

  const handleFormSubmit = async (data: PaymentFormData) => {
    try {
      if (data.mode_of_payment === 'cash') {
        await processCashPayment({
          user_id: data.user_id,
          fee_id: data.fee_id,
        });
      } else {
        const result = await initiatePayment({
          user_id: data.user_id,
          fee_id: data.fee_id,
        });
        
        // If there's a payment URL, redirect to it
        if (result.paymentUrl) {
          window.open(result.paymentUrl, '_blank');
        }
      }
      
      onSubmit(data);
      onClose();
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (!isOpen || !fee) return null;

  const installmentAmount = fee.isInstallmentAllowed 
    ? FeeService.calculateInstallmentAmount(fee.amount, fee.no_ofInstallments)
    : fee.amount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCardIcon className="h-6 w-6 text-primary-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Process Payment
                </h3>
              </div>
              <button
                onClick={onClose}
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
                <p>Amount: <span className="font-medium text-gray-900">{FeeService.formatAmount(fee.amount)}</span></p>
                {fee.isInstallmentAllowed && (
                  <p>Installment: <span className="font-medium text-gray-900">
                    {FeeService.formatAmount(installmentAmount)} × {fee.no_ofInstallments} payments
                  </span></p>
                )}
                <p>Type: <span className="font-medium text-gray-900 capitalize">{fee.type}</span></p>
                <p className="text-xs">{fee.decription}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-6">
                {/* Hidden fields */}
                <input type="hidden" {...register('user_id')} />
                <input type="hidden" {...register('fee_id')} />

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Payment Method *
                  </label>
                  <div className="space-y-3">
                    {Object.entries(PAYMENT_METHODS).map(([key, value]) => (
                      <label key={key} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          {...register('mode_of_payment')}
                          value={value}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          <span className="text-lg mr-2">{FeeService.getPaymentMethodIcon(value)}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {key.replace('_', ' ').toLowerCase()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {value === 'paystack' && 'Pay with card via Paystack'}
                              {value === 'flutterwave' && 'Pay with card via Flutterwave'}
                              {value === 'bank_transfer' && 'Pay via bank transfer'}
                              {value === 'cash' && 'Pay with cash (in-person)'}
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.mode_of_payment && (
                    <p className="mt-1 text-sm text-red-600">{errors.mode_of_payment.message}</p>
                  )}
                </div>

                {/* Payment Amount Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 mb-2">Payment Summary</h5>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Fee Amount:</span>
                      <span className="font-medium">{FeeService.formatAmount(fee.amount)}</span>
                    </div>
                    {fee.isInstallmentAllowed && (
                      <>
                        <div className="flex justify-between">
                          <span>Installment Amount:</span>
                          <span className="font-medium">{FeeService.formatAmount(installmentAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Number of Installments:</span>
                          <span className="font-medium">{fee.no_ofInstallments}</span>
                        </div>
                      </>
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
                {isLoading ? 'Processing...' : 'Proceed to Payment'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
