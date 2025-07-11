import React, { useState } from 'react';
import {
  PlusIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  UserPlusIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import MainLayout from '../../components/layout/MainLayout';

const StaffManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'create-bursar' | 'create-teacher' | 'create-auditor' | 'manage'>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStaffType, setSelectedStaffType] = useState<'bursar' | 'teacher' | 'auditor'>('bursar');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real implementation, this would come from store
  const staffMembers = [
    { id: 1, name: 'John Doe', email: 'john@school.com', role: 'Bursar', status: 'Active', created: '2024-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@school.com', role: 'Teacher', status: 'Active', created: '2024-02-10' },
    { id: 3, name: 'Mike Johnson', email: 'mike@school.com', role: 'Auditor', status: 'Active', created: '2024-02-20' },
  ];

  const getRoleColor = (role: string) => {
    if (role === 'Bursar') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (role === 'Teacher') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: UserGroupIcon },
    { id: 'create-bursar', name: 'Create Bursar', icon: BriefcaseIcon },
    { id: 'create-teacher', name: 'Create Teacher', icon: UserPlusIcon },
    { id: 'create-auditor', name: 'Create Auditor', icon: CheckBadgeIcon },
    { id: 'manage', name: 'Manage Staff', icon: UserGroupIcon },
  ];

  const handleCreateStaff = (type: 'bursar' | 'teacher' | 'auditor') => {
    setSelectedStaffType(type);
    setIsCreateModalOpen(true);
  };

  const filteredStaff = staffMembers.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const bursarCount = staffMembers.filter(s => s.role === 'Bursar').length;
  const teacherCount = staffMembers.filter(s => s.role === 'Teacher').length;
  const auditorCount = staffMembers.filter(s => s.role === 'Auditor').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Create and manage staff for your school</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'create-bursar' | 'create-teacher' | 'create-auditor' | 'manage')}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Staff</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{staffMembers.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BriefcaseIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bursars</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{bursarCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserPlusIcon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Teachers</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{teacherCount}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckBadgeIcon className="h-8 w-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Auditors</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{auditorCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleCreateStaff('bursar')}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <BriefcaseIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Create Bursar</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add a new bursar for fee management</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCreateStaff('teacher')}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <UserPlusIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Create Teacher</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add a new teacher for academic activities</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleCreateStaff('auditor')}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <CheckBadgeIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Create Auditor</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add a new auditor for financial oversight</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Staff */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Staff Members</h3>
                {staffMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No staff members yet</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by creating your first staff member.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Created
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {staffMembers.slice(0, 5).map((staff) => (
                          <tr key={staff.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {staff.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{staff.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(staff.role)}`}>
                                {staff.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {staff.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(staff.created).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Bursar Tab */}
          {activeTab === 'create-bursar' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Create New Bursar</h3>
              <div className="text-center py-8">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Bursar Creation Form</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This feature will be implemented to include a comprehensive bursar creation form.
                </p>
                <button
                  onClick={() => handleCreateStaff('bursar')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Bursar
                </button>
              </div>
            </div>
          )}

          {/* Create Teacher Tab */}
          {activeTab === 'create-teacher' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Create New Teacher</h3>
              <div className="text-center py-8">
                <UserPlusIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Teacher Creation Form</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This feature will be implemented to include a comprehensive teacher creation form.
                </p>
                <button
                  onClick={() => handleCreateStaff('teacher')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Teacher
                </button>
              </div>
            </div>
          )}

          {/* Create Auditor Tab */}
          {activeTab === 'create-auditor' && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Create New Auditor</h3>
              <div className="text-center py-8">
                <CheckBadgeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Auditor Creation Form</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  This feature will be implemented to include a comprehensive auditor creation form.
                </p>
                <button
                  onClick={() => handleCreateStaff('auditor')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Auditor
                </button>
              </div>
            </div>
          )}

          {/* Manage Staff Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search staff by name, email, or role..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff List */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    All Staff Members ({filteredStaff.length})
                  </h3>
                </div>
                
                {filteredStaff.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      {searchTerm ? 'No staff found' : 'No staff members yet'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {searchTerm 
                        ? 'Try adjusting your search terms.'
                        : 'Get started by creating your first staff member.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredStaff.map((staff) => (
                          <tr key={staff.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {staff.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">{staff.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(staff.role)}`}>
                                {staff.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {staff.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(staff.created).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-4">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Staff Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="staff-modal-headline"
          >
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setIsCreateModalOpen(false)}
              onKeyDown={(e) => e.key === 'Escape' && setIsCreateModalOpen(false)}
              tabIndex={-1}
            />
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Create {selectedStaffType.charAt(0).toUpperCase() + selectedStaffType.slice(1)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedStaffType.charAt(0).toUpperCase() + selectedStaffType.slice(1)} creation form will be implemented here with all necessary fields including email, name, and role-specific settings.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default StaffManagementPage;
