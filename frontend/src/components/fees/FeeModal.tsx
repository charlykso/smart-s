import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useFeeStore } from '../../store/feeStore';
import { FEE_TYPES } from '../../types/fee';
import type { FeeModalProps, CreateFeeData, UpdateFeeData } from '../../types/fee';

const feeSchema = z.object({
  term_id: z.string().min(1, 'Term is required'),
  school_id: z.string().min(1, 'School is required'),
  name: z.string().min(1, 'Fee name is required'),
  decription: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Fee type is required'),
  amount: z.number().min(0, 'Amount must be greater than 0'),
  isActive: z.boolean().optional(),
  isInstallmentAllowed: z.boolean().optional(),
  no_ofInstallments: z.number().min(1).optional(),
  isApproved: z.boolean().optional(),
});

type FeeFormData = z.infer<typeof feeSchema>;

const FeeModal: React.FC<FeeModalProps> = ({
  isOpen,
  onClose,
  fee,
  schools,
  terms,
  onSubmit,
}) => {
  const { createFee, updateFee, isLoading } = useFeeStore();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FeeFormData>({
    resolver: zodResolver(feeSchema),
  });

  const isInstallmentAllowed = watch('isInstallmentAllowed');

  useEffect(() => {
    if (isOpen) {
      if (fee) {
        const schoolId = typeof fee.school === 'string' ? fee.school : fee.school?._id || '';
        const termId = typeof fee.term === 'string' ? fee.term : fee.term?._id || '';

        reset({
          term_id: termId,
          school_id: schoolId,
          name: fee.name,
          decription: fee.decription,
          type: fee.type,
          amount: fee.amount,
          isActive: fee.isActive,
          isInstallmentAllowed: fee.isInstallmentAllowed,
          no_ofInstallments: fee.no_ofInstallments,
          isApproved: fee.isApproved,
        });
      } else {
        reset({
          term_id: '',
          school_id: '',
          name: '',
          decription: '',
          type: '',
          amount: 0,
          isActive: true,
          isInstallmentAllowed: false,
          no_ofInstallments: 1,
          isApproved: false,
        });
      }
    }
  }, [isOpen, fee, reset]);

  const handleFormSubmit = async (data: FeeFormData) => {
    try {
      if (fee) {
        const updateData: UpdateFeeData = {
          _id: fee._id,
          ...data,
        };
        await updateFee(updateData);
      } else {
        const createData: CreateFeeData = data;
        await createFee(createData);
      }
      
      onSubmit(data);
      onClose();
    } catch (error) {
      // Error is handled in the store
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {fee ? 'Edit Fee' : 'Create New Fee'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-6">
                {/* School and Term Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      School *
                    </label>
                    <select
                      {...register('school_id')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a school</option>
                      {schools.map((school) => (
                        <option key={school._id} value={school._id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                    {errors.school_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.school_id.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Term *
                    </label>
                    <select
                      {...register('term_id')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select a term</option>
                      {terms.map((term) => (
                        <option key={term._id} value={term._id}>
                          {term.name}
                        </option>
                      ))}
                    </select>
                    {errors.term_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.term_id.message}</p>
                    )}
                  </div>
                </div>

                {/* Fee Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fee Name *
                    </label>
                    <input
                      type="text"
                      {...register('name')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Tuition Fee"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fee Type *
                    </label>
                    <select
                      {...register('type')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select fee type</option>
                      {Object.entries(FEE_TYPES).map(([key, value]) => (
                        <option key={key} value={value}>
                          {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    {...register('decription')}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description of the fee"
                  />
                  {errors.decription && (
                    <p className="mt-1 text-sm text-red-600">{errors.decription.message}</p>
                  )}
                </div>

                {/* Amount and Installments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Amount (₦) *
                    </label>
                    <input
                      type="number"
                      {...register('amount', { valueAsNumber: true })}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>

                  {isInstallmentAllowed && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Number of Installments
                      </label>
                      <input
                        type="number"
                        {...register('no_ofInstallments', { valueAsNumber: true })}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="1"
                        min="1"
                        max="12"
                      />
                      {errors.no_ofInstallments && (
                        <p className="mt-1 text-sm text-red-600">{errors.no_ofInstallments.message}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active Fee
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isInstallmentAllowed')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Allow Installment Payments
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('isApproved')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Pre-approve Fee (Admin only)
                    </label>
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
                {isLoading ? 'Saving...' : fee ? 'Update Fee' : 'Create Fee'}
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

export default FeeModal;
