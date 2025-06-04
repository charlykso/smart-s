import React from 'react';
import {
  CalendarDaysIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type { SessionCardProps } from '../../types/school';
import { useSchoolStore } from '../../store/schoolStore';

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
}) => {
  const { deleteSession } = useSchoolStore();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${session.name}?`)) {
      try {
        await deleteSession(session._id);
        onDelete?.(session);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const getSchoolName = () => {
    if (typeof session.school === 'string') {
      return 'Loading...';
    }
    return session.school?.name || 'No School';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isCurrentSession = () => {
    const now = new Date();
    const startDate = new Date(session.startDate);
    const endDate = new Date(session.endDate);
    return now >= startDate && now <= endDate;
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
              <CalendarDaysIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {session.name}
              </h3>
              <p className="text-sm text-gray-500">{getSchoolName()}</p>
            </div>
          </div>
          
          {/* Status Badge */}
          {isCurrentSession() && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Current
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-4 space-y-3">
        {/* Date Information */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Start Date:</span>
            <span className="font-medium text-gray-900">{formatDate(session.startDate)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">End Date:</span>
            <span className="font-medium text-gray-900">{formatDate(session.endDate)}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Created: {new Date(session.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(session.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          {/* Select Button */}
          {onSelect && (
            <button
              onClick={() => onSelect(session)}
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
                onClick={() => onEdit(session)}
                className="inline-flex items-center p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Edit session"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete session"
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

export default SessionCard;
