import React, { useState, useEffect } from 'react';
import { UsersIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ClassArmCardProps } from '../../types/school';
import { ApiService } from '../../services/api';
import { useSchoolStore } from '../../store/schoolStore';

const ClassArmCard: React.FC<ClassArmCardProps> = ({
  classArm,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}) => {
  const { deleteClassArm } = useSchoolStore();
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentCount = async () => {
      try {
        setLoading(true);
        const response = await ApiService.get(`/classarm/${classArm._id}/student-count`);
        if (response.success) {
          setStudentCount(response.data.classArm.currentStudentCount);
        }
      } catch (error) {
        console.error('Error fetching student count:', error);
        setStudentCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentCount();
  }, [classArm._id]);

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
      return 'Loading...';
    }
    return classArm.school?.name || 'No School';
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border-2 transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900 ${
        isSelected
          ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                {classArm.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{getSchoolName()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-4 space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Total Students:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {loading ? (
                <span className="text-gray-400 dark:text-gray-500">Loading...</span>
              ) : (
                studentCount ?? 0
              )}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Created: {new Date(classArm.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(classArm.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg transition-colors duration-200">
        <div className="flex items-center justify-end space-x-2">
          {onEdit && (
            <button
              onClick={() => onEdit(classArm)}
              className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
              title="Edit class arm"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
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
