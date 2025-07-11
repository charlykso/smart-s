import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSchoolStore } from '../../store/schoolStore';
import type { TermModalProps, CreateTermData, UpdateTermData } from '../../types/school';

const termSchema = z.object({
  session: z.string().min(1, 'Session is required'),
  name: z.string().min(1, 'Term name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type TermFormData = z.infer<typeof termSchema>;

const TermModal: React.FC<TermModalProps> = ({
  isOpen,
  onClose,
  term,
  sessions,
}) => {
  const { createTerm, updateTerm, isLoading } = useSchoolStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TermFormData>({
    resolver: zodResolver(termSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (term) {
        const sessionId = typeof term.session === 'string' 
          ? term.session 
          : term.session?._id || '';

        reset({
          session: sessionId,
          name: term.name,
          startDate: term.startDate.split('T')[0],
          endDate: term.endDate.split('T')[0],
        });
      } else {
        reset({
          session: '',
          name: '',
          startDate: '',
          endDate: '',
        });
      }
    }
  }, [isOpen, term, reset]);

  const handleFormSubmit = async (data: TermFormData) => {
    try {
      if (term) {
        const updateData: UpdateTermData = {
          _id: term._id,
          ...data,
        };
        await updateTerm(updateData);
      } else {
        const createData: CreateTermData = {
          session: data.session,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
        };
        await createTerm(createData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting term:', error);
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
                {term ? 'Edit Term' : 'Create New Term'}
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
                  <label htmlFor="session" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Session *
                  </label>
                  <select
                    id="session"
                    {...register('session')}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a session</option>
                    {sessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                  {errors.session && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.session.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Term Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., First Term, Second Term"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Date *
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.endDate.message}</p>
                    )}
                  </div>
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
                  return term ? 'Update Term' : 'Create Term';
                })()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TermModal;
