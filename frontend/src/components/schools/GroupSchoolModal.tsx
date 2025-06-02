import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSchoolStore } from '../../store/schoolStore';
import type { CreateGroupSchoolData, UpdateGroupSchoolData, GroupSchool } from '../../types/school';

const groupSchoolSchema = z.object({
  name: z.string().min(1, 'Group school name is required'),
  description: z.string().min(1, 'Description is required'),
  logo: z.string().optional(),
});

type GroupSchoolFormData = z.infer<typeof groupSchoolSchema>;

interface GroupSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupSchool?: GroupSchool | null;
  onSubmit: (data: CreateGroupSchoolData | UpdateGroupSchoolData) => Promise<void>;
}

const GroupSchoolModal: React.FC<GroupSchoolModalProps> = ({
  isOpen,
  onClose,
  groupSchool,
  onSubmit,
}) => {
  const { createGroupSchool, updateGroupSchool, isLoading } = useSchoolStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupSchoolFormData>({
    resolver: zodResolver(groupSchoolSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (groupSchool) {
        reset({
          name: groupSchool.name,
          description: groupSchool.description,
          logo: groupSchool.logo || '',
        });
      } else {
        reset({
          name: '',
          description: '',
          logo: '',
        });
      }
    }
  }, [isOpen, groupSchool, reset]);

  const handleFormSubmit = async (data: GroupSchoolFormData) => {
    try {
      if (groupSchool) {
        const updateData: UpdateGroupSchoolData = {
          _id: groupSchool._id,
          ...data,
        };
        await updateGroupSchool(updateData);
      } else {
        const createData: CreateGroupSchoolData = {
          ...data,
          logo: data.logo || '',
        };
        await createGroupSchool(createData);
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
                {groupSchool ? 'Edit Group School' : 'Create New Group School'}
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
                    Group School Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., ABC Education Group"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description of the group school"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    {...register('logo')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/logo.png"
                  />
                  {errors.logo && (
                    <p className="mt-1 text-sm text-red-600">{errors.logo.message}</p>
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
                {isLoading ? 'Saving...' : groupSchool ? 'Update Group School' : 'Create Group School'}
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

export default GroupSchoolModal;
