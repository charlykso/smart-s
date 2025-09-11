import React, { useState, useEffect, useCallback } from 'react';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import MainLayout from '../../components/layout/MainLayout';
import { Badge } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { canManageUsers, getSchoolAccessDeniedMessage } from '../../utils/schoolAccess';
import CreateUserModal from '../../components/users/CreateUserModal';
import BulkUserActions from '../../components/users/BulkUserActions';
import UserService from '../../services/userService';
import toast from 'react-hot-toast';
import type { User } from '../../types/auth';
import type { User as IndexUser, UserRole } from '../../types/index';

const UserManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Check permissions using new school access controls
  const hasManagePermission = canManageUsers(user as IndexUser);

  // Load users from API
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await UserService.getUsers({
        search: searchTerm || undefined,
        role: selectedRole !== 'all' ? selectedRole : undefined,
        status: selectedStatus !== 'all' ? selectedStatus as 'active' | 'inactive' : undefined,
        page: 1,
        limit: 50,
      });

      setUsers(response.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRole, selectedStatus]);

  // Load users on component mount and when filters change
  useEffect(() => {
    if (hasManagePermission) {
      loadUsers();
    }
  }, [hasManagePermission, loadUsers]);

  // If user doesn't have permission, show access denied
  if (!hasManagePermission) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-secondary-50 dark:bg-gray-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Access Denied</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {getSchoolAccessDeniedMessage(user as IndexUser)}
              </p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleUserCreated = async () => {
    // Reload users to get the latest data
    await loadUsers();
    toast.success('User created successfully!');
  };

  const handleBulkAction = async (action: string, userIds: string[]) => {
    try {
      switch (action) {
        case 'activate':
          await UserService.bulkUpdateUsers(userIds, { status: 'active' });
          setUsers(prev => prev.map(user =>
            userIds.includes(user.id) ? { ...user, status: 'active' as const } : user
          ));
          break;
        case 'deactivate':
          await UserService.bulkUpdateUsers(userIds, { status: 'inactive' });
          setUsers(prev => prev.map(user =>
            userIds.includes(user.id) ? { ...user, status: 'inactive' as const } : user
          ));
          break;
        case 'delete':
          await UserService.bulkDeleteUsers(userIds);
          setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
          break;
        case 'export': {
          // Export users to CSV
          const csvContent = generateUserCSV((users || []).filter(user => userIds.includes(user.id)));
          downloadCSV(csvContent, 'users.csv');
          break;
        }
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      throw error;
    }
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Never';
    if (date instanceof Date) return date.toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  const generateUserCSV = (usersToExport: User[]) => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Roles', 'Status', 'Last Login', 'Created At'];
    const rows = usersToExport.map(user => [
      user.id,
      user.firstname,
      user.lastname,
      user.email,
      user.roles.join('; '),
      user.status,
      formatDate(user.lastLogin),
      formatDate(user.createdAt),
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(user => user.id));
    }
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch =
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'all' || user.roles.includes(selectedRole as UserRole);
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'Admin': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      'ICT_administrator': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'Principal': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      'Headteacher': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'Bursar': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'Auditor': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
      'Student': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'Parent': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    };
    return colorMap[role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
  };

  if (!hasManagePermission) {
    return (
      <MainLayout>
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            Access Denied
          </h3>
          <p className="text-red-700 dark:text-red-300">
            You don't have permission to access user management. This feature is only available to Administrators and ICT Administrators.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">
                  User Management
                </h1>
                <p className="text-secondary-600 dark:text-gray-400 mt-1">
                  Manage system users and their roles
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              title="Filter by role"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="ICT_administrator">ICT Administrator</option>
              <option value="Principal">Principal</option>
              <option value="Headteacher">Head Teacher</option>
              <option value="Bursar">Bursar</option>
              <option value="Auditor">Auditor</option>
              <option value="Student">Student</option>
              <option value="Parent">Parent</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Advanced Filters */}
            <button
              type="button"
              className="flex items-center justify-center px-4 py-2 border border-secondary-300 dark:border-gray-600 rounded-lg hover:bg-secondary-50 dark:hover:bg-gray-700 transition-colors text-secondary-600 dark:text-gray-300"
              title="More filters"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              More Filters
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <BulkUserActions
          selectedUserIds={selectedUserIds}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedUserIds([])}
        />

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          <div className="px-6 py-4 border-b border-secondary-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-gray-100">
              Users ({filteredUsers.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
              <span className="ml-3 text-secondary-600 dark:text-gray-400">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-secondary-200 dark:divide-gray-700">
                <thead className="bg-secondary-50 dark:bg-gray-700">
                  <tr>
                    <th className="w-12 px-3 py-3 text-left text-xs font-medium text-secondary-500 dark:text-gray-400 uppercase tracking-wider">
                      <span className="sr-only">Select all</span>
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                        title="Select all users"
                      />
                    </th>
                    <th className="min-w-0 px-3 py-3 text-left text-xs font-medium text-secondary-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="w-32 px-3 py-3 text-left text-xs font-medium text-secondary-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium text-secondary-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-32 px-3 py-3 text-left text-xs font-medium text-secondary-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="w-20 px-3 py-3 text-left text-xs font-medium text-secondary-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-secondary-200 dark:divide-gray-700">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-secondary-500 dark:text-gray-400">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="w-12 px-3 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                            title={`Select ${user.firstname} ${user.lastname}`}
                          />
                        </td>
                        <td className="min-w-0 px-3 py-4">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-secondary-900 dark:text-gray-100 truncate">
                              {user.firstname} {user.lastname}
                            </div>
                            <div className="text-sm text-secondary-500 dark:text-gray-400 truncate">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="w-32 px-3 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.slice(0, 2).map((role) => (
                              <Badge
                                key={`${user.id}-${role}`}
                                className={`uppercase ${getRoleColor(role)}`}
                                size="sm"
                                title={user.roles.join(', ')}
                              >
                                {role}
                              </Badge>
                            ))}
                            {user.roles.length > 2 && (
                              <Badge variant="secondary" size="sm">+{user.roles.length - 2}</Badge>
                            )}
                          </div>
                        </td>
                        <td className="w-24 px-3 py-4 whitespace-nowrap">
                          <Badge className={`uppercase ${getStatusColor(user.status)}`} size="sm">
                            {user.status}
                          </Badge>
                        </td>
                        <td className="w-32 px-3 py-4 whitespace-nowrap text-sm text-secondary-500 dark:text-gray-400">
                          <span className="truncate block">
                            {formatDate(user.lastLogin)}
                          </span>
                        </td>
                        <td className="w-20 px-3 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            type="button"
                            className="text-secondary-400 dark:text-gray-500 hover:text-secondary-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-secondary-100 dark:hover:bg-gray-600"
                            title={`Actions for ${user.firstname} ${user.lastname}`}
                          >
                            <EllipsisVerticalIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      </div>
    </MainLayout>
  );
};

export default UserManagementPage;
