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
  totalNumberOfStudents: z.number().min(0, 'Number of students must be 0 or greater').optional(),
});

type ClassArmFormData = z.infer<typeof classArmSchema>;

const ClassArmModal: React.FC<ClassArmModalProps> = ({
  isOpen,
  onClose,
  classArm,
  schools,
  onSubmit,
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
          totalNumberOfStudents: classArm.totalNumberOfStudents || 0,
        });
      } else {
        reset({
          school_id: '',
          name: '',
          totalNumberOfStudents: 0,
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
        const createData: CreateClassArmData = data;
        await createClassArm(createData);
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {classArm ? 'Edit Class Arm' : 'Create New Class Arm'}
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
                    Class Arm Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., JSS 1A, SS 2B, Primary 3"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Number of Students
                  </label>
                  <input
                    type="number"
                    {...register('totalNumberOfStudents', { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0"
                    min="0"
                  />
                  {errors.totalNumberOfStudents && (
                    <p className="mt-1 text-sm text-red-600">{errors.totalNumberOfStudents.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : classArm ? 'Update Class Arm' : 'Create Class Arm'}
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

export default ClassArmModal;
