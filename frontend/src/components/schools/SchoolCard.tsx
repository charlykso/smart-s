import React from 'react';
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import type { SchoolCardProps } from '../../types/school';
import { useSchoolStore } from '../../store/schoolStore';

const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}) => {
  const { deleteSchool } = useSchoolStore();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${school.name}?`)) {
      try {
        await deleteSchool(school._id);
        onDelete?.(school);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const getGroupSchoolName = () => {
    if (typeof school.groupSchool === 'string') {
      return 'Unknown Group';
    }
    return school.groupSchool?.name || 'No Group';
  };

  const getAddressString = () => {
    if (typeof school.address === 'string') {
      return 'Address not loaded';
    }
    const addr = school.address;
    if (!addr) return 'No address';
    
    return `${addr.street} ${addr.street_no}, ${addr.town}, ${addr.state}, ${addr.country}`;
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border-2 transition-all duration-200 hover:shadow-md dark:hover:shadow-gray-900 card-responsive ${
        isSelected
          ? 'border-primary-500 dark:border-primary-400 ring-2 ring-primary-200 dark:ring-primary-800'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start min-w-0 flex-1">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 break-words leading-tight">
                {school.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{getGroupSchoolName()}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {school.isActive ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium whitespace-nowrap">Active</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <XCircleIcon className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium whitespace-nowrap">Inactive</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 space-y-3 flex-1">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 min-w-0">
            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate" title={school.email}>{school.email}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 min-w-0">
            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="truncate" title={school.phoneNumber}>{school.phoneNumber}</span>
          </div>

          <div className="flex items-start text-sm text-gray-600 dark:text-gray-300 min-w-0">
            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="line-clamp-2 leading-relaxed" title={getAddressString()}>
              {getAddressString()}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-auto">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="truncate">Created: {new Date(school.createdAt).toLocaleDateString()}</span>
            <span className="truncate">Updated: {new Date(school.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-b-lg transition-colors duration-200">
        <div className="flex items-center justify-between gap-2">
          {/* Select Button */}
          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(school)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isSelected
                  ? 'text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900 hover:bg-primary-200 dark:hover:bg-primary-800'
                  : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500'
              }`}
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              {isSelected ? 'Selected' : 'Select'}
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(school)}
                className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                title="Edit school"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition-colors"
                title="Delete school"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolCard;
