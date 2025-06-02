import React from 'react';
import { UsersIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ClassArmCardProps } from '../../types/school';
import { useSchoolStore } from '../../store/schoolStore';

const ClassArmCard: React.FC<ClassArmCardProps> = ({
  classArm,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}) => {
  const { deleteClassArm } = useSchoolStore();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${classArm.name}?`)) {
      try {
        await deleteClassArm(classArm._id);
        onDelete?.(classArm);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const getSchoolName = () => {
    if (typeof classArm.school === 'string') {
      return 'Unknown School';
    }
    return classArm.school?.name || 'No School';
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {classArm.name}
              </h3>
              <p className="text-sm text-gray-500">{getSchoolName()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Students:</span>
            <span className="font-medium text-gray-900">
              {classArm.totalNumberOfStudents || 0}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Created: {new Date(classArm.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(classArm.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-end space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(classArm)}
              className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Edit class arm"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete class arm"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassArmCard;
