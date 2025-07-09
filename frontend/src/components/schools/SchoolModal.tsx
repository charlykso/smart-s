import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSchoolStore } from '../../store/schoolStore';
import type { SchoolModalProps, CreateSchoolData, UpdateSchoolData } from '../../types/school';

const schoolSchema = z.object({
  groupSchool_id: z.string().min(1, 'Group school is required'),
  name: z.string().min(1, 'School name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  town: z.string().min(1, 'Town is required'),
  street: z.string().min(1, 'Street is required'),
  street_no: z.string().min(1, 'Street number is required'),
  zip_code: z.string().min(1, 'ZIP code is required'),
});

type SchoolFormData = z.infer<typeof schoolSchema>;

const SchoolModal: React.FC<SchoolModalProps> = ({
  isOpen,
  onClose,
  school,
  groupSchools,
}) => {
  const { createSchool, updateSchool, isLoading } = useSchoolStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (school) {
        // Editing mode - populate form with school data
        const addressData = typeof school.address === 'object' ? school.address : null;
        const groupSchoolId = typeof school.groupSchool === 'string' 
          ? school.groupSchool 
          : school.groupSchool?._id || '';

        reset({
          groupSchool_id: groupSchoolId,
          name: school.name,
          email: school.email,
          phoneNumber: school.phoneNumber,
          country: addressData?.country || '',
          state: addressData?.state || '',
          town: addressData?.town || '',
          street: addressData?.street || '',
          street_no: addressData?.street_no || '',
          zip_code: addressData?.zip_code || '',
        });
      } else {
        // Creating mode - reset form
        reset({
          groupSchool_id: '',
          name: '',
          email: '',
          phoneNumber: '',
          country: '',
          state: '',
          town: '',
          street: '',
          street_no: '',
          zip_code: '',
        });
      }
    }
  }, [isOpen, school, reset]);

  const handleFormSubmit = async (data: SchoolFormData) => {
    try {
      if (school) {
        // Update existing school
        const updateData: UpdateSchoolData = {
          _id: school._id,
          ...data,
        };
        await updateSchool(updateData);
      } else {
        // Create new school
        const createData: CreateSchoolData = {
          groupSchool_id: data.groupSchool_id,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          country: data.country,
          state: data.state,
          town: data.town,
          street: data.street,
          street_no: data.street_no,
          zip_code: data.zip_code,
        };
        await createSchool(createData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting school:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-gray-900 transform transition-all sm:my-8 sm:align-middle w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                {school ? 'Edit School' : 'Create New School'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6 max-h-96 sm:max-h-[70vh] overflow-y-auto">
              <div className="space-y-4 sm:space-y-6">
                {/* Group School Selection */}
                <div>
                  <label htmlFor="groupSchool_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Group School *
                  </label>
                  <select
                    id="groupSchool_id"
                    {...register('groupSchool_id')}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a group school</option>
                    {groupSchools.map((groupSchool) => (
                      <option key={groupSchool._id} value={groupSchool._id}>
                        {groupSchool.name}
                      </option>
                    ))}
                  </select>
                  {errors.groupSchool_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.groupSchool_id.message}</p>
                  )}
                </div>

                {/* School Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      School Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register('name')}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter school name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="school@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number *
                    </label>
                    <input
                      id="phoneNumber"
                      type="tel"
                      {...register('phoneNumber')}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+1234567890"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Country *
                      </label>
                      <input
                        id="country"
                        type="text"
                        {...register('country')}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Country"
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        State *
                      </label>
                      <input
                        id="state"
                        type="text"
                        {...register('state')}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="State"
                      />
                      {errors.state && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="town" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Town/City *
                      </label>
                      <input
                        id="town"
                        type="text"
                        {...register('town')}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Town or City"
                      />
                      {errors.town && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.town.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        ZIP Code *
                      </label>
                      <input
                        id="zip_code"
                        type="text"
                        {...register('zip_code')}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="ZIP Code"
                      />
                      {errors.zip_code && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.zip_code.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Street *
                      </label>
                      <input
                        id="street"
                        type="text"
                        {...register('street')}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Street name"
                      />
                      {errors.street && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.street.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="street_no" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Street Number *
                      </label>
                      <input
                        id="street_no"
                        type="text"
                        {...register('street_no')}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Street number"
                      />
                      {errors.street_no && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.street_no.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {(() => {
                  if (isLoading) return 'Saving...';
                  return school ? 'Update School' : 'Create School';
                })()}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
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

export default SchoolModal;
