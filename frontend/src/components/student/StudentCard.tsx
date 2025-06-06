import React from 'react';
import { 
  UserIcon, 
  AcademicCapIcon, 
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import type { Student } from '../../types/student';

interface StudentCardProps {
  student: Student;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onView?: (student: Student) => void;
  onSelect?: (student: Student) => void;
  isSelected?: boolean;
  schoolName?: string;
  showActions?: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  onEdit, 
  onDelete, 
  onView,
  onSelect,
  isSelected = false,
  schoolName,
  showActions = true,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getClassArmName = () => {
    if (typeof student.classArm === 'string') {
      return 'Unknown Class';
    }
    return student.classArm?.name || 'No Class Assigned';
  };

  const getProfileImage = () => {
    if (typeof student.profile === 'object' && student.profile?.img) {
      return student.profile.img;
    }
    return null;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 p-6 hover:shadow-lg dark:hover:shadow-gray-900 transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {onSelect && (
            <div className="mr-3">
              <button
                type="button"
                onClick={() => onSelect(student)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
                }`}
              >
                {isSelected && <CheckIcon className="w-3 h-3" />}
              </button>
            </div>
          )}

          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center overflow-hidden">
            {getProfileImage() ? (
              <img
                src={getProfileImage()}
                alt={`${student.firstname} ${student.lastname}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            )}
          </div>

          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {student.firstname} {student.lastname}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Reg: {student.regNo}</p>
            {schoolName && (
              <p className="text-xs text-gray-400 dark:text-gray-500">{schoolName}</p>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {onView && (
              <button
                type="button"
                onClick={() => onView(student)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                View
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(student)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(student)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{student.email}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{student.phone}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <AcademicCapIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{getClassArmName()}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{getAge(student.DOB)} years old</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          student.type === 'boarding'
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
        }`}>
          {student.type === 'boarding' ? 'Boarding' : 'Day Student'}
        </span>

        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          student.gender === 'Male'
            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
            : 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200'
        }`}>
          {student.gender}
        </span>
      </div>

      {/* Academic Status */}
      {student.academicInfo && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            <span className={`font-medium capitalize ${
              student.academicInfo.academicStatus === 'active'
                ? 'text-green-600 dark:text-green-400'
                : student.academicInfo.academicStatus === 'suspended'
                ? 'text-red-600 dark:text-red-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {student.academicInfo.academicStatus}
            </span>
          </div>

          {student.academicInfo.currentGPA && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-500 dark:text-gray-400">GPA:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {student.academicInfo.currentGPA.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentCard;
