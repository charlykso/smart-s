import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { UserService } from '../../services/userService';
import { SchoolService } from '../../services/schoolService';
import { useAuthStore } from '../../store/authStore';
import type { School } from '../../types/school';

// Base validation schema
const baseUserSchema = z.object({
  firstname: z.string().min(2, 'First name must be at least 2 characters'),
  lastname: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  roles: z.array(z.string()).min(1, 'Please select at least one role'),
});

// Extended schema for students
const studentSchema = baseUserSchema.extend({
  gender: z.enum(['Male', 'Female'], { required_error: 'Please select a gender' }),
  type: z.enum(['day', 'boarding'], { required_error: 'Please select a type' }),
  regNo: z.string().min(1, 'Registration number is required'),
  school: z.string().optional(), // Optional for System Admin
});

// Schema for non-students (optional student fields)
const nonStudentSchema = baseUserSchema.extend({
  gender: z.enum(['Male', 'Female']).optional(),
  type: z.enum(['day', 'boarding']).optional(),
  regNo: z.string().optional(),
  school: z.string().optional(), // Optional for System Admin
});

type CreateUserFormData = z.infer<typeof studentSchema>; // Use the most complete schema for typing

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
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const { user: currentUser } = useAuthStore();

  // Determine if we're creating a student
  const isCreatingStudent = selectedRoles.includes('Student');

  // Determine if current user is System Admin (can select schools)
  const isSystemAdmin = currentUser?.roles?.includes('Admin') || false;

  // Use appropriate schema based on role
  const currentSchema = isCreatingStudent ? studentSchema : nonStudentSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(currentSchema),
  });

  // Define available roles based on current user's role
  const getAvailableRoles = () => {
    const currentUserRoles = currentUser?.roles || [];

    // System Admin can create all roles except other Admins
    if (currentUserRoles.includes('Admin')) {
      return [
        { value: 'ICT_administrator', label: 'ICT Administrator', description: 'Technical system management' },
        { value: 'Auditor', label: 'Auditor', description: 'Financial auditing and oversight' },
        { value: 'Proprietor', label: 'Proprietor', description: 'School ownership and governance' },
        { value: 'Principal', label: 'Principal', description: 'School management' },
        { value: 'Headteacher', label: 'Head Teacher', description: 'Academic oversight' },
        { value: 'Bursar', label: 'Bursar', description: 'Financial management' },
        { value: 'Student', label: 'Student', description: 'Student account' },
        { value: 'Parent', label: 'Parent', description: 'Parent/Guardian account' },
      ];
    }

    // ICT Administrator can create school-level roles
    if (currentUserRoles.includes('ICT_administrator')) {
      return [
        { value: 'Principal', label: 'Principal', description: 'School management' },
        { value: 'Headteacher', label: 'Head Teacher', description: 'Academic oversight' },
        { value: 'Bursar', label: 'Bursar', description: 'Financial management' },
        { value: 'Student', label: 'Student', description: 'Student account' },
        { value: 'Parent', label: 'Parent', description: 'Parent/Guardian account' },
      ];
    }

    // Principal can create school staff and students
    if (currentUserRoles.includes('Principal')) {
      return [
        { value: 'Headteacher', label: 'Head Teacher', description: 'Academic oversight' },
        { value: 'Bursar', label: 'Bursar', description: 'Financial management' },
        { value: 'Student', label: 'Student', description: 'Student account' },
        { value: 'Parent', label: 'Parent', description: 'Parent/Guardian account' },
      ];
    }

    // Default roles for other users
    return [
      { value: 'Student', label: 'Student', description: 'Student account' },
      { value: 'Parent', label: 'Parent', description: 'Parent/Guardian account' },
    ];
  };

  const availableRoles = getAvailableRoles();

  // Load schools when modal opens (only for System Admin)
  useEffect(() => {
    const loadSchools = async () => {
      if (isOpen && isSystemAdmin) {
        setIsLoadingSchools(true);
        try {
          const schools = await SchoolService.getSchools();
          setAvailableSchools(schools);

          // Set default school to current user's school if they have one
          if (currentUser?.school?._id) {
            setSelectedSchool(currentUser.school._id);
            setValue('school', currentUser.school._id);
          }
        } catch (error) {
          console.error('Failed to load schools:', error);
          toast.error('Failed to load schools');
        } finally {
          setIsLoadingSchools(false);
        }
      } else if (isOpen && !isSystemAdmin) {
        // For non-system admin, use their current school
        const userSchoolId = currentUser?.school?._id || currentUser?.school;
        if (userSchoolId) {
          setSelectedSchool(userSchoolId);
          setValue('school', userSchoolId);
        }
      }
    };

    loadSchools();
  }, [isOpen, isSystemAdmin, currentUser, setValue]);

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
      // Determine school ID to use
      let userSchoolId: string;

      if (isSystemAdmin) {
        // System Admin can select school or use form data
        userSchoolId = data.school || selectedSchool;
        if (!userSchoolId) {
          toast.error('Please select a school for the user.');
          return;
        }
      } else {
        // Other users use their current school
        userSchoolId = currentUser?.school?._id || currentUser?.school;
        if (!userSchoolId) {
          toast.error('Unable to determine school. Please contact administrator.');
          return;
        }
      }

      // Call the actual API to create user
      const userData = {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        phone: data.phone,
        roles: data.roles,
        school: userSchoolId,
        // Include student-specific fields only if creating a student
        ...(isCreatingStudent && {
          gender: data.gender,
          type: data.type,
          regNo: data.regNo,
        }),
        // Backend will generate default password
      };

      const newUser = await UserService.createUser(userData);

      onUserCreated(newUser);
      toast.success(`${data.roles[0]} created successfully! Default password: password123`);
      handleClose();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedRoles([]);
    setSelectedSchool('');
    setAvailableSchools([]);
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

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Student-specific fields (only show when creating a student) */}
              {isCreatingStudent && (
                <>
                  {/* Registration Number and Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        {...register('regNo')}
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                        placeholder="Enter reg number"
                      />
                      {errors.regNo && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.regNo.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                        Gender
                      </label>
                      <select
                        {...register('gender')}
                        className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {errors.gender && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.gender.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Student Type */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                      Student Type
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      <option value="">Select type</option>
                      <option value="day">Day Student</option>
                      <option value="boarding">Boarding Student</option>
                    </select>
                    {errors.type && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.type.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* School Selection */}
              {isSystemAdmin ? (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                    School *
                  </label>
                  {isLoadingSchools ? (
                    <div className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      Loading schools...
                    </div>
                  ) : (
                    <select
                      {...register('school')}
                      value={selectedSchool}
                      onChange={(e) => {
                        setSelectedSchool(e.target.value);
                        setValue('school', e.target.value);
                      }}
                      className="w-full px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                    >
                      <option value="">Select a school</option>
                      {availableSchools.map((school) => (
                        <option key={school._id} value={school._id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {!selectedSchool && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">Please select a school</p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-gray-300 mb-1">
                    School
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentUser?.school?.name || 'Current School'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Users will be created for your school automatically
                  </p>
                </div>
              )}

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

              {/* Password Note */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> A default password "password123" will be assigned to this user.
                  They can change it after their first login.
                </p>
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
