import React from 'react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import type { StudentFilters } from '../../types/student';
import type { School } from '../../types';

interface StudentFiltersPanelProps {
  filters: StudentFilters;
  schools: School[];
  onFilterChange: (filters: Partial<StudentFilters>) => void;
  onClose: () => void;
}

const StudentFiltersPanel: React.FC<StudentFiltersPanelProps> = ({
  filters,
  schools,
  onFilterChange,
  onClose,
}) => {
  const handleFilterChange = (key: keyof StudentFilters, value: any) => {
    onFilterChange({ [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      school: undefined,
      classArm: undefined,
      academicYear: undefined,
      gender: undefined,
      type: undefined,
      academicStatus: undefined,
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.school ||
      filters.classArm ||
      filters.academicYear ||
      filters.gender ||
      filters.type ||
      filters.academicStatus
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* School Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              School
            </label>
            <select
              value={filters.school || ''}
              onChange={(e) => handleFilterChange('school', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Schools</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Class
            </label>
            <select
              value={filters.classArm || ''}
              onChange={(e) => handleFilterChange('classArm', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Classes</option>
              <option value="JSS 1">JSS 1</option>
              <option value="JSS 2">JSS 2</option>
              <option value="JSS 3">JSS 3</option>
              <option value="SS 1">SS 1</option>
              <option value="SS 2">SS 2</option>
              <option value="SS 3">SS 3</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Year
            </label>
            <select
              value={filters.academicYear || ''}
              onChange={(e) => handleFilterChange('academicYear', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Years</option>
              <option value="2023/2024">2023/2024</option>
              <option value="2024/2025">2024/2025</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={filters.gender || ''}
              onChange={(e) => handleFilterChange('gender', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          {/* Student Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option value="day">Day Student</option>
              <option value="boarding">Boarding Student</option>
            </select>
          </div>

          {/* Academic Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Academic Status
            </label>
            <select
              value={filters.academicStatus || ''}
              onChange={(e) => handleFilterChange('academicStatus', e.target.value || undefined)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="graduated">Graduated</option>
              <option value="transferred">Transferred</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters() && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              
              {filters.school && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  School: {schools.find(s => s._id === filters.school)?.name || 'Unknown'}
                  <button
                    onClick={() => handleFilterChange('school', undefined)}
                    className="ml-1 text-primary-600 hover:text-primary-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.classArm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Class: {filters.classArm}
                  <button
                    onClick={() => handleFilterChange('classArm', undefined)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.academicYear && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Year: {filters.academicYear}
                  <button
                    onClick={() => handleFilterChange('academicYear', undefined)}
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.gender && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Gender: {filters.gender}
                  <button
                    onClick={() => handleFilterChange('gender', undefined)}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Type: {filters.type === 'day' ? 'Day Student' : 'Boarding Student'}
                  <button
                    onClick={() => handleFilterChange('type', undefined)}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.academicStatus && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Status: {filters.academicStatus}
                  <button
                    onClick={() => handleFilterChange('academicStatus', undefined)}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFiltersPanel;
