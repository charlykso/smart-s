import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import MainLayout from '../../components/layout/MainLayout';
import { useAuthStore } from '../../store/authStore';
import CreateUserModal from '../../components/users/CreateUserModal';
import BulkUserActions from '../../components/users/BulkUserActions';
import UserService from '../../services/userService';
import toast from 'react-hot-toast';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  roles: string[];
  status: 'active' | 'inactive';
  lastLogin: Date | null;
  createdAt: Date;
}

const UserManagementPage: React.FC = () => {
  const { hasAnyRole } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Check if user has permission to access this page
  const hasPermission = hasAnyRole(['Admin', 'ICT_administrator']);

  // Load users from API
  const loadUsers = async () => {
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
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');

      // Fallback to mock data for development
      const mockUsers: User[] = [
        {
          id: '1',
          firstname: 'John',
          lastname: 'Doe',
          email: 'john.doe@school.com',
          roles: ['Principal'],
          status: 'active',
          lastLogin: new Date(Date.now() - 1000 * 60 * 30),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        },
        {
          id: '2',
          firstname: 'Jane',
          lastname: 'Smith',
          email: 'jane.smith@school.com',
          roles: ['Bursar'],
          status: 'active',
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
        },
        {
          id: '3',
          firstname: 'Mike',
          lastname: 'Johnson',
          email: 'mike.johnson@school.com',
          roles: ['Headteacher'],
          status: 'inactive',
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
        },
      ];
      setUsers(mockUsers);
      setTotal(mockUsers.length);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount and when filters change
  useEffect(() => {
    if (hasPermission) {
      loadUsers();
    }
  }, [hasPermission, searchTerm, selectedRole, selectedStatus]);

  const handleUserCreated = async (newUser: User) => {
    // Reload users to get the latest data
    await loadUsers();
    toast.success('User created successfully!');
  };

  const handleBulkAction = async (action: string, userIds: string[]) => {
    try {
      switch (action) {
        case 'activate':
          // await UserService.bulkUpdateUsers(userIds, { status: 'active' });
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          setUsers(prev => prev.map(user =>
            userIds.includes(user.id) ? { ...user, status: 'active' as const } : user
          ));
          break;
        case 'deactivate':
          // await UserService.bulkUpdateUsers(userIds, { status: 'inactive' });
          await new Promise(resolve => setTimeout(resolve, 1000));
          setUsers(prev => prev.map(user =>
            userIds.includes(user.id) ? { ...user, status: 'inactive' as const } : user
          ));
          break;
        case 'delete':
          // await UserService.bulkDeleteUsers(userIds);
          await new Promise(resolve => setTimeout(resolve, 1000));
          setUsers(prev => prev.filter(user => !userIds.includes(user.id)));
          break;
        case 'export':
          // Export users to CSV
          const csvContent = generateUserCSV((users || []).filter(user => userIds.includes(user.id)));
          downloadCSV(csvContent, 'users.csv');
          break;
      }
    } catch (error) {
      throw error;
    }
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
      user.lastLogin ? user.lastLogin.toISOString() : 'Never',
      user.createdAt.toISOString(),
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

    const matchesRole = selectedRole === 'all' || user.roles.includes(selectedRole);
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      'Admin': 'bg-red-100 text-red-800',
      'ICT_administrator': 'bg-blue-100 text-blue-800',
      'Principal': 'bg-purple-100 text-purple-800',
      'Headteacher': 'bg-green-100 text-green-800',
      'Bursar': 'bg-yellow-100 text-yellow-800',
      'Auditor': 'bg-orange-100 text-orange-800',
      'Student': 'bg-gray-100 text-gray-800',
      'Parent': 'bg-pink-100 text-pink-800',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (!hasPermission) {
    return (
      <MainLayout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Access Denied
          </h3>
          <p className="text-red-700">
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
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                  User Management
                </h1>
                <p className="text-secondary-600 mt-1">
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
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
              className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Advanced Filters */}
            <button className="flex items-center justify-center px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors">
              <FunnelIcon className="h-5 w-5 mr-2 text-secondary-600" />
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
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-200">
            <h3 className="text-lg font-semibold text-secondary-900">
              Users ({filteredUsers.length})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-secondary-600">Loading users...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">
                        No users found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-secondary-900">
                              {user.firstname} {user.lastname}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, index) => (
                              <span
                                key={index}
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-secondary-400 hover:text-secondary-600">
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
