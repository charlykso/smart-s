import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSchoolStore } from '../../store/schoolStore';
import type { ClassArmModalProps, CreateClassArmData, UpdateClassArmData } from '../../types/school';

const classArmSchema = z.object({
  school_id: z.string().min(1, 'School is required'),
  name: z.string().min(1, 'Class arm name is required'),
});

type ClassArmFormData = z.infer<typeof classArmSchema>;

const ClassArmModal: React.FC<ClassArmModalProps> = ({
  isOpen,
  onClose,
  classArm,
  schools,
}) => {
  const { createClassArm, updateClassArm, isLoading } = useSchoolStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClassArmFormData>({
    resolver: zodResolver(classArmSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (classArm) {
        const schoolId = typeof classArm.school === 'string'
          ? classArm.school
          : classArm.school?._id || '';

        reset({
          school_id: schoolId,
          name: classArm.name,
        });
      } else {
        reset({
          school_id: '',
          name: '',
        });
      }
    }
  }, [isOpen, classArm, reset]);

  const handleFormSubmit = async (data: ClassArmFormData) => {
    try {
      if (classArm) {
        const updateData: UpdateClassArmData = {
          _id: classArm._id,
          ...data,
        };
        await updateClassArm(updateData);
      } else {
        const createData: CreateClassArmData = {
          school_id: data.school_id,
          name: data.name,
        };
        await createClassArm(createData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting class arm:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-50 transition-opacity cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-gray-900 transform transition-all sm:my-8 sm:align-middle w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {classArm ? 'Edit Class Arm' : 'Create New Class Arm'}
              </h3>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    School *
                  </label>
                  <select
                    id="school_id"
                    {...register('school_id')}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a school</option>
                    {schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                  {errors.school_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.school_id.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Class Arm Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., JSS 1A, SS 2B, Primary 3"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(() => {
                  if (isLoading) return 'Saving...';
                  return classArm ? 'Update Class Arm' : 'Create Class Arm';
                })()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClassArmModal;
