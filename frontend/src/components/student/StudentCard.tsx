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
    <div className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary-500 bg-primary-50' : ''
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          {onSelect && (
            <div className="mr-3">
              <button
                onClick={() => onSelect(student)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                {isSelected && <CheckIcon className="w-3 h-3" />}
              </button>
            </div>
          )}
          
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
            {getProfileImage() ? (
              <img 
                src={getProfileImage()} 
                alt={`${student.firstname} ${student.lastname}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-6 h-6 text-primary-600" />
            )}
          </div>
          
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {student.firstname} {student.lastname}
            </h3>
            <p className="text-sm text-gray-500">Reg: {student.regNo}</p>
            {schoolName && (
              <p className="text-xs text-gray-400">{schoolName}</p>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            {onView && (
              <button
                onClick={() => onView(student)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(student)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(student)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{student.email}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{student.phone}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <AcademicCapIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{getClassArmName()}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{getAge(student.DOB)} years old</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          student.type === 'boarding' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {student.type === 'boarding' ? 'Boarding' : 'Day Student'}
        </span>
        
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          student.gender === 'Male' 
            ? 'bg-indigo-100 text-indigo-800' 
            : 'bg-pink-100 text-pink-800'
        }`}>
          {student.gender}
        </span>
      </div>

      {/* Academic Status */}
      {student.academicInfo && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Status:</span>
            <span className={`font-medium capitalize ${
              student.academicInfo.academicStatus === 'active' 
                ? 'text-green-600' 
                : student.academicInfo.academicStatus === 'suspended'
                ? 'text-red-600'
                : 'text-yellow-600'
            }`}>
              {student.academicInfo.academicStatus}
            </span>
          </div>
          
          {student.academicInfo.currentGPA && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-500">GPA:</span>
              <span className="font-medium text-gray-900">
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
