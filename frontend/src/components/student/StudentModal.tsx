import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  XMarkIcon,
  UserIcon,
  AcademicCapIcon,
  MapPinIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import type { Student, CreateStudentData, UpdateStudentData } from '../../types/student';
import type { School, ClassArm } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

const studentSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  middlename: z.string().optional(),
  lastname: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  DOB: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female']),
  regNo: z.string().min(1, 'Registration number is required'),
  school_id: z.string().min(1, 'School is required'),
  classArm_id: z.string().min(1, 'Class is required'),
  type: z.enum(['day', 'boarding']),
  expectedGraduationYear: z.number().min(2020).max(2050),
  previousSchool: z.string().optional(),
  
  // Address
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    postalCode: z.string().optional(),
  }),
  
  // Guardian Information
  guardian: z.object({
    name: z.string().min(1, 'Guardian name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Guardian phone is required'),
    email: z.string().email('Invalid guardian email').optional().or(z.literal('')),
    occupation: z.string().optional(),
    workAddress: z.string().optional(),
    isEmergencyContact: z.boolean(),
  }),
  
  // Emergency Contact
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Emergency contact phone is required'),
    email: z.string().email('Invalid emergency contact email').optional().or(z.literal('')),
    address: z.string().optional(),
  }),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
  schools: School[];
  onSubmit: (data: CreateStudentData | UpdateStudentData) => Promise<void>;
}

const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  student,
  schools,
  onSubmit,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'guardian' | 'emergency'>('personal');
  const [classArms, setClassArms] = useState<ClassArm[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: 'Male',
      type: 'day',
      expectedGraduationYear: new Date().getFullYear() + 4,
      address: {
        country: 'Nigeria',
      },
      guardian: {
        isEmergencyContact: false,
      },
    },
  });

  const selectedSchoolId = watch('school_id');

  useEffect(() => {
    if (student) {
      // Populate form with student data
      setValue('firstname', student.firstname);
      setValue('middlename', student.middlename || '');
      setValue('lastname', student.lastname);
      setValue('email', student.email);
      setValue('phone', student.phone);
      setValue('DOB', student.DOB.split('T')[0]); // Format for date input
      setValue('gender', student.gender);
      setValue('regNo', student.regNo);
      setValue('school_id', typeof student.school === 'string' ? student.school : student.school._id);
      setValue('classArm_id', typeof student.classArm === 'string' ? student.classArm : student.classArm._id);
      setValue('type', student.type);
      
      // Set academic info if available
      if (student.academicInfo) {
        setValue('expectedGraduationYear', student.academicInfo.expectedGraduationYear);
        setValue('previousSchool', student.academicInfo.previousSchool || '');
      }
      
      // Set address if available
      if (typeof student.address === 'object' && student.address) {
        setValue('address.street', student.address.street || '');
        setValue('address.city', student.address.city || '');
        setValue('address.state', student.address.state || '');
        setValue('address.country', student.address.country || 'Nigeria');
        setValue('address.postalCode', student.address.postalCode || '');
      }
    } else {
      reset();
    }
  }, [student, setValue, reset]);

  useEffect(() => {
    if (selectedSchoolId) {
      // Load class arms for selected school
      // This would typically be an API call
      // For now, we'll use mock data
      setClassArms([
        { _id: '1', name: 'JSS 1A', school: selectedSchoolId },
        { _id: '2', name: 'JSS 1B', school: selectedSchoolId },
        { _id: '3', name: 'JSS 2A', school: selectedSchoolId },
        { _id: '4', name: 'JSS 2B', school: selectedSchoolId },
        { _id: '5', name: 'JSS 3A', school: selectedSchoolId },
        { _id: '6', name: 'JSS 3B', school: selectedSchoolId },
        { _id: '7', name: 'SS 1A', school: selectedSchoolId },
        { _id: '8', name: 'SS 1B', school: selectedSchoolId },
        { _id: '9', name: 'SS 2A', school: selectedSchoolId },
        { _id: '10', name: 'SS 2B', school: selectedSchoolId },
        { _id: '11', name: 'SS 3A', school: selectedSchoolId },
        { _id: '12', name: 'SS 3B', school: selectedSchoolId },
      ]);
    }
  }, [selectedSchoolId]);

  const handleFormSubmit = async (data: StudentFormData) => {
    setIsLoading(true);
    try {
      if (student) {
        await onSubmit({ ...data, _id: student._id } as UpdateStudentData);
      } else {
        await onSubmit(data as CreateStudentData);
      }
      onClose();
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setActiveTab('personal');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {student ? 'Edit Student' : 'Add New Student'}
            </h3>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-6 xl:gap-8 px-4 sm:px-6">
              {[
                { id: 'personal', name: 'Personal Info', icon: UserIcon },
                { id: 'academic', name: 'Academic Info', icon: AcademicCapIcon },
                { id: 'guardian', name: 'Guardian Info', icon: PhoneIcon },
                { id: 'emergency', name: 'Emergency Contact', icon: MapPinIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.name}</span>
                    <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        {...register('firstname')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.firstname && (
                        <p className="mt-1 text-sm text-red-600">{errors.firstname.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        {...register('middlename')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        {...register('lastname')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.lastname && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastname.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        {...register('DOB')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.DOB && (
                        <p className="mt-1 text-sm text-red-600">{errors.DOB.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                      </label>
                      <select
                        {...register('gender')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                      {errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Registration Number *
                      </label>
                      <input
                        type="text"
                        {...register('regNo')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.regNo && (
                        <p className="mt-1 text-sm text-red-600">{errors.regNo.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Address Section */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          {...register('address.street')}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.address?.street && (
                          <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            {...register('address.city')}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                          {errors.address?.city && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            {...register('address.state')}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                          {errors.address?.state && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Country *
                          </label>
                          <input
                            type="text"
                            {...register('address.country')}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                          {errors.address?.country && (
                            <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            {...register('address.postalCode')}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Academic Information Tab */}
              {activeTab === 'academic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School *
                      </label>
                      <select
                        {...register('school_id')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select School</option>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class *
                      </label>
                      <select
                        {...register('classArm_id')}
                        disabled={!selectedSchoolId}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                      >
                        <option value="">Select Class</option>
                        {classArms.map((classArm) => (
                          <option key={classArm._id} value={classArm._id}>
                            {classArm.name}
                          </option>
                        ))}
                      </select>
                      {errors.classArm_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.classArm_id.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Student Type *
                      </label>
                      <select
                        {...register('type')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="day">Day Student</option>
                        <option value="boarding">Boarding Student</option>
                      </select>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Graduation Year *
                      </label>
                      <input
                        type="number"
                        min="2020"
                        max="2050"
                        {...register('expectedGraduationYear', { valueAsNumber: true })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.expectedGraduationYear && (
                        <p className="mt-1 text-sm text-red-600">{errors.expectedGraduationYear.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Previous School
                    </label>
                    <input
                      type="text"
                      {...register('previousSchool')}
                      placeholder="Name of previous school (if any)"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Guardian Information Tab */}
              {activeTab === 'guardian' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Name *
                      </label>
                      <input
                        type="text"
                        {...register('guardian.name')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.guardian?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.guardian.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship *
                      </label>
                      <select
                        {...register('guardian.relationship')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Relationship</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Grandmother">Grandmother</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.guardian?.relationship && (
                        <p className="mt-1 text-sm text-red-600">{errors.guardian.relationship.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Phone *
                      </label>
                      <input
                        type="tel"
                        {...register('guardian.phone')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.guardian?.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.guardian.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guardian Email
                      </label>
                      <input
                        type="email"
                        {...register('guardian.email')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.guardian?.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.guardian.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Occupation
                      </label>
                      <input
                        type="text"
                        {...register('guardian.occupation')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('guardian.isEmergencyContact')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Use as Emergency Contact
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Address
                    </label>
                    <textarea
                      {...register('guardian.workAddress')}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Emergency Contact Tab */}
              {activeTab === 'emergency' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Name *
                      </label>
                      <input
                        type="text"
                        {...register('emergencyContact.name')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.emergencyContact?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship *
                      </label>
                      <select
                        {...register('emergencyContact.relationship')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select Relationship</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Uncle">Uncle</option>
                        <option value="Aunt">Aunt</option>
                        <option value="Grandfather">Grandfather</option>
                        <option value="Grandmother">Grandmother</option>
                        <option value="Family Friend">Family Friend</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.emergencyContact?.relationship && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.relationship.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Phone *
                      </label>
                      <input
                        type="tel"
                        {...register('emergencyContact.phone')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.emergencyContact?.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Email
                      </label>
                      <input
                        type="email"
                        {...register('emergencyContact.email')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.emergencyContact?.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Contact Address
                    </label>
                    <textarea
                      {...register('emergencyContact.address')}
                      rows={3}
                      placeholder="Full address of emergency contact"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    {student ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  student ? 'Update Student' : 'Create Student'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentModal;
