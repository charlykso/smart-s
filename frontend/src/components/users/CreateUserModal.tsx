import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import toast from 'react-hot-toast';

// Validation schema
const createUserSchema = z.object({
  firstname: z.string().min(2, 'First name must be at least 2 characters'),
  lastname: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  roles: z.array(z.string()).min(1, 'Please select at least one role'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: any) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserFormData>();

  const availableRoles = [
    { value: 'Admin', label: 'Administrator', description: 'Full system access' },
    { value: 'ICT_administrator', label: 'ICT Administrator', description: 'Technical management' },
    { value: 'Proprietor', label: 'Proprietor', description: 'Multi-school oversight' },
    { value: 'Principal', label: 'Principal', description: 'School management' },
    { value: 'Headteacher', label: 'Head Teacher', description: 'Academic oversight' },
    { value: 'Bursar', label: 'Bursar', description: 'Financial management' },
    { value: 'Auditor', label: 'Auditor', description: 'Audit and compliance' },
    { value: 'Student', label: 'Student', description: 'Student access' },
    { value: 'Parent', label: 'Parent', description: 'Parent access' },
  ];

  const handleRoleToggle = (roleValue: string) => {
    const newRoles = selectedRoles.includes(roleValue)
      ? selectedRoles.filter(r => r !== roleValue)
      : [...selectedRoles, roleValue];
    
    setSelectedRoles(newRoles);
    setValue('roles', newRoles);
  };

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: Date.now().toString(),
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        roles: data.roles,
        status: 'active' as const,
        lastLogin: null,
        createdAt: new Date(),
      };

      onUserCreated(newUser);
      toast.success('User created successfully!');
      handleClose();
    } catch (error) {
      toast.error('Failed to create user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedRoles([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-gray-900 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-gray-100">
                Create New User
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-secondary-400 dark:text-gray-500 hover:text-secondary-600 dark:hover:text-gray-300 transition-colors"
                title="Close modal"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    {...register('firstname')}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    placeholder="Enter first name"
                  />
                  {errors.firstname && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.firstname.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    {...register('lastname')}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    placeholder="Enter last name"
                  />
                  {errors.lastname && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.lastname.message}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-2">
                  User Roles
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-secondary-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 transition-colors">
                  {availableRoles.map((role) => (
                    <label key={role.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(role.value)}
                        onChange={() => handleRoleToggle(role.value)}
                        className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-secondary-900 dark:text-gray-100">
                          {role.label}
                        </div>
                        <div className="text-xs text-secondary-500 dark:text-gray-400">
                          {role.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.roles && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.roles.message}</p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-secondary-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-secondary-300 dark:border-gray-600 rounded-lg hover:bg-secondary-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 focus:ring-primary-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-gray-800 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;
