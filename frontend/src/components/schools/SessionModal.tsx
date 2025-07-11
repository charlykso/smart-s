import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSchoolStore } from '../../store/schoolStore';
import type { SessionModalProps, CreateSessionData, UpdateSessionData } from '../../types/school';

const sessionSchema = z.object({
  school_id: z.string().min(1, 'School is required'),
  name: z.string().min(1, 'Session name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type SessionFormData = z.infer<typeof sessionSchema>;

const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  session,
  schools,
  onSubmit,
}) => {
  const { createSession, updateSession, isLoading } = useSchoolStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (session) {
        // Editing mode - populate form with session data
        const schoolId = typeof session.school === 'string' 
          ? session.school 
          : session.school?._id || '';

        reset({
          school_id: schoolId,
          name: session.name,
          startDate: session.startDate.split('T')[0],
          endDate: session.endDate.split('T')[0],
        });
      } else {
        // Creating mode - reset form
        reset({
          school_id: '',
          name: '',
          startDate: '',
          endDate: '',
        });
      }
    }
  }, [isOpen, session, reset]);

  const handleFormSubmit = async (data: SessionFormData) => {
    try {
      if (session) {
        // Update existing session
        const updateData: UpdateSessionData = {
          _id: session._id,
          ...data,
        };
        await updateSession(updateData);
        await onSubmit(updateData);
      } else {
        // Create new session
        const createData: CreateSessionData = {
          school_id: data.school_id,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
        };
        await createSession(createData);
        await onSubmit(createData);
      }
      
      onClose();
    } catch (error) {
      console.error('Session submission error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <button
          type="button"
          className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity cursor-default"
          onClick={onClose}
          aria-label="Close modal"
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-gray-900 transform transition-all sm:my-8 sm:align-middle w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                {session ? 'Edit Session' : 'Create New Session'}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6 max-h-96 sm:max-h-[60vh] overflow-y-auto">
              <div className="space-y-4 sm:space-y-6">
                {/* School Selection */}
                <div>
                  <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    School *
                  </label>
                  <select
                    id="school_id"
                    {...register('school_id')}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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

                {/* Session Information */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter session name (e.g., 2024/2025)"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      {...register('startDate')}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      {...register('endDate')}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>
                    )}
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
                  return session ? 'Update Session' : 'Create Session';
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

export default SessionModal;
