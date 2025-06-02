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
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {school.name}
              </h3>
              <p className="text-sm text-gray-500">{getGroupSchoolName()}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center">
            {school.isActive ? (
              <div className="flex items-center text-green-600">
                <CheckCircleIcon className="h-5 w-5 mr-1" />
                <span className="text-xs font-medium">Active</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <XCircleIcon className="h-5 w-5 mr-1" />
                <span className="text-xs font-medium">Inactive</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 space-y-3">
        {/* Contact Information */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{school.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span>{school.phoneNumber}</span>
          </div>
          
          <div className="flex items-start text-sm text-gray-600">
            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
            <span className="line-clamp-2">{getAddressString()}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Created: {new Date(school.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(school.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          {/* Select Button */}
          {onSelect && (
            <button
              onClick={() => onSelect(school)}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isSelected
                  ? 'text-primary-700 bg-primary-100 hover:bg-primary-200'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <EyeIcon className="h-3 w-3 mr-1" />
              {isSelected ? 'Selected' : 'Select'}
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={() => onEdit(school)}
                className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Edit school"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
