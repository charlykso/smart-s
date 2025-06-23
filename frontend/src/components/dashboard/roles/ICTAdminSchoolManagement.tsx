import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  UserPlusIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { ApiService } from '../../../services/api';

interface School {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  isActive: boolean;
  groupSchool: {
    _id: string;
    name: string;
  };
  createdAt: string;
  userCount?: number;
}

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  roles: string[];
  type: 'day' | 'boarding';
  gender: 'Male' | 'Female';
  regNo: string;
  school: {
    _id: string;
    name: string;
  };  status: 'active' | 'inactive';
  isActive: boolean;
}

interface CreateSchoolData {
  name: string;
  email: string;
  phoneNumber: string;
  address?: string;
  isActive: boolean;
}

interface CreateUserData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  roles: string[];
  type: 'day' | 'boarding';
  gender: 'Male' | 'Female';
  regNo: string;
  school: string;
}

const ICTAdminSchoolManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schools' | 'users'>('schools');
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateSchool, setShowCreateSchool] = useState(false);  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [bulkUploadSchool, setBulkUploadSchool] = useState('');
  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);  const [selectedSchool, setSelectedSchool] = useState('');
  const [currentGroupSchool, setCurrentGroupSchool] = useState<string>('');

  // User roles that ICT Admin can create (excluding ICT_administrator and Admin)
  const availableRoles = ['Principal', 'Bursar', 'Teacher', 'Student', 'Parent'];
  const userTypes = ['day', 'boarding'];
  const genders = ['Male', 'Female'];

  useEffect(() => {
    fetchSchools();
    fetchUsers();
    getCurrentUserGroupSchool();
  }, []);

  const getCurrentUserGroupSchool = async () => {
    try {
      const data = await ApiService.get('/users/me');
      if (data.user?.school?.groupSchool) {
        setCurrentGroupSchool(data.user.school.groupSchool.name);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get('/schools/by-group');
      setSchools(data.schools ?? []);
    } catch (error) {
      console.error('Error fetching schools:', error);
      toast.error('Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  };  const fetchUsers = async () => {
    try {
      const data = await ApiService.get('/users/managed-schools');
      setUsers(data.users ?? []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };  const handleCreateSchool = async (schoolData: CreateSchoolData) => {
    try {
      await ApiService.post('/schools', schoolData);
      toast.success('School created successfully');
      fetchSchools();
      setShowCreateSchool(false);
    } catch (error) {
      console.error('Error creating school:', error);
      toast.error('Failed to create school');
    }
  };

  const handleCreateUser = async (userData: CreateUserData) => {
    try {
      await ApiService.post('/users', userData);
      toast.success('User created successfully');
      fetchUsers();
      setShowCreateUser(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };
  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      return;
    }
    
    try {
      await ApiService.delete(`/schools/${schoolId}`);
      toast.success('School deleted successfully');
      fetchSchools();
    } catch (error) {
      console.error('Error deleting school:', error);
      toast.error('Failed to delete school');
    }
  };
  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await ApiService.patch(`/users/${userId}/status`, { isActive: !isActive });
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Bulk upload functions
  const handleDownloadTemplate = async () => {
    try {
      // Build URL with school_id parameter if a school is selected
      let url = '/bulk-students/template';
      if (bulkUploadSchool) {
        url += `?school_id=${bulkUploadSchool}`;
      }

      // Set filename
      const selectedSchoolName = schools.find(s => s._id === bulkUploadSchool)?.name;
      const filename = selectedSchoolName 
        ? `${selectedSchoolName.replace(/[^a-zA-Z0-9]/g, '_')}_students.xlsx`
        : 'student_upload_template.xlsx';

      await ApiService.downloadFile(url, filename);
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile || !bulkUploadSchool) {
      toast.error('Please select a file and school');
      return;
    }

    setBulkUploadLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('studentFile', bulkUploadFile);
      formData.append('school_id', bulkUploadSchool);

      const result = await ApiService.postFormData('/bulk-students/upload', formData);

      toast.success(`Successfully uploaded ${result.data?.successful ?? 0} students`);
      if (result.data?.failed > 0) {
        toast.error(`${result.data.failed} errors occurred. Check console for details.`);
        console.error('Upload errors:', result.data.results?.failed);
      }
      fetchUsers();
      setShowBulkUpload(false);
      setBulkUploadFile(null);
      setBulkUploadSchool('');
    } catch (error) {
      console.error('Error uploading students:', error);
      toast.error('Failed to upload students');
    } finally {
      setBulkUploadLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.name.endsWith('.xlsx')) {
      setBulkUploadFile(file);
    } else {
      toast.error('Please select a valid Excel (.xlsx) file');
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                ICT Administrator Dashboard
              </h1>
              <p className="text-gray-600">
                Manage schools and users within <span className="font-semibold text-blue-600">{currentGroupSchool}</span>
              </p>
              <div className="mt-2 text-sm text-gray-500">
                You can create schools under your group and manage users across multiple schools
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{schools.length}</div>
                <div className="text-xs text-gray-500">Managed Schools</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{users.length}</div>
                <div className="text-xs text-gray-500">Total Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('schools')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'schools'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BuildingOfficeIcon className="w-4 h-4 mr-2" />
                Schools Management
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UsersIcon className="w-4 h-4 mr-2" />
                Users Management
              </button>
            </nav>
          </div>
        </div>

        {/* Schools Management Tab */}
        {activeTab === 'schools' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Schools Under Your Management
              </h2>
              <button
                onClick={() => setShowCreateSchool(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create School
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading schools...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {schools.map((school) => (
                  <div key={school._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <BuildingOfficeIcon className="w-8 h-8 text-blue-600" />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedSchool(school._id);
                            setShowCreateUser(true);
                          }}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Add Users"
                        >
                          <UserPlusIcon className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600 p-1" title="Edit">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteSchool(school._id)}
                          className="text-gray-400 hover:text-red-600 p-1" 
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{school.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{school.email}</p>
                    <p className="text-sm text-gray-600 mb-3">{school.phoneNumber}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        school.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {school.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="text-xs text-gray-500">
                        Users: {school.userCount || 0}
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Group: {school.groupSchool.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {schools.length === 0 && !loading && (
              <div className="text-center py-12">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No schools found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first school.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateSchool(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    Create School
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Users in Managed Schools
              </h2>
              <div className="flex space-x-3">                <select
                  id="school-select"
                  title="Select School"
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select School</option>
                  {schools.map((school) => (
                    <option key={school._id} value={school._id}>
                      {school.name}
                    </option>
                  ))}
                </select>                <button
                  onClick={() => setShowCreateUser(true)}
                  disabled={!selectedSchool}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 disabled:hover:bg-green-600"
                >
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Create User
                </button>
                <button
                  onClick={() => setShowBulkUpload(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Bulk Upload Students
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role & Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      School
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.firstname[0]}{user.lastname[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstname} {user.lastname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.regNo}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {user.roles[0]}
                        </span>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {user.type} • {user.gender}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.school?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                            className={`${
                              user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="text-blue-600 hover:text-blue-900" title="Edit User">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Create users for your schools to get started.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create School Modal */}
        {showCreateSchool && (
          <CreateSchoolModal
            onClose={() => setShowCreateSchool(false)}
            onSubmit={handleCreateSchool}
            groupSchoolName={currentGroupSchool}
          />
        )}        {/* Create User Modal */}
        {showCreateUser && (
          <CreateUserModal
            onClose={() => setShowCreateUser(false)}
            onSubmit={handleCreateUser}
            schools={schools}
            selectedSchool={selectedSchool}
            availableRoles={availableRoles}
            userTypes={userTypes}
            genders={genders}
          />
        )}

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <BulkUploadModal
            onClose={() => setShowBulkUpload(false)}
            onSubmit={handleBulkUpload}
            onDownloadTemplate={handleDownloadTemplate}
            schools={schools}
            selectedSchool={bulkUploadSchool}
            onSchoolChange={setBulkUploadSchool}
            onFileChange={handleFileChange}
            loading={bulkUploadLoading}
            selectedFile={bulkUploadFile}
          />
        )}
      </div>
    </div>
  );
};

// Create School Modal Component
interface CreateSchoolModalProps {
  onClose: () => void;
  onSubmit: (data: CreateSchoolData) => void;
  groupSchoolName: string;
}

const CreateSchoolModal: React.FC<CreateSchoolModalProps> = ({ onClose, onSubmit, groupSchoolName }) => {
  const [formData, setFormData] = useState<CreateSchoolData>({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New School</h3>
        <p className="text-sm text-gray-600 mb-4">
          This school will be created under <span className="font-semibold">{groupSchoolName}</span>
        </p>
        <form onSubmit={handleSubmit}>          <div className="mb-4">
            <label htmlFor="school-name" className="block text-sm font-medium text-gray-700 mb-2">
              School Name *
            </label>
            <input
              id="school-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter school name"
            />
          </div>          <div className="mb-4">
            <label htmlFor="school-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="school-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="school@example.com"
            />
          </div>          <div className="mb-4">
            <label htmlFor="school-phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              id="school-phone"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="school-address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="school-address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="School address (optional)"
            />
          </div>
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">School is active</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create School
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Create User Modal Component
interface CreateUserModalProps {
  onClose: () => void;
  onSubmit: (data: CreateUserData) => void;
  schools: School[];
  selectedSchool: string;
  availableRoles: string[];
  userTypes: string[];
  genders: string[];
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ 
  onClose, 
  onSubmit, 
  schools, 
  selectedSchool,
  availableRoles,
  userTypes,
  genders
}) => {
  const [formData, setFormData] = useState<CreateUserData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    roles: ['Student'],
    type: 'day',
    gender: 'Male',
    regNo: '',
    school: selectedSchool
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  React.useEffect(() => {
    setFormData(prev => ({ ...prev, school: selectedSchool }));
  }, [selectedSchool]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Create New User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                id="firstname"
                type="text"
                required
                value={formData.firstname}
                onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                id="lastname"
                type="text"
                required
                value={formData.lastname}
                onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone *
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>          <div>
            <label htmlFor="regNo" className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number *
            </label>
            <input
              id="regNo"
              type="text"
              required
              value={formData.regNo}
              onChange={(e) => setFormData({...formData, regNo: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., STU001, PRIN001"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">            <div>
              <label htmlFor="user-role" className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                id="user-role"
                value={formData.roles[0]}
                onChange={(e) => setFormData({...formData, roles: [e.target.value]})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div>              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as 'Male' | 'Female'})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value as 'day' | 'boarding'})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {userTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>            <div>
              <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-2">
                School *
              </label>
              <select
                id="school"
                value={formData.school}
                onChange={(e) => setFormData({...formData, school: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select School</option>
                {schools.map(school => (
                  <option key={school._id} value={school._id}>{school.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Bulk Upload Modal Component
interface BulkUploadModalProps {
  onClose: () => void;
  onSubmit: () => void;
  onDownloadTemplate: () => void;
  schools: School[];
  selectedSchool: string;
  onSchoolChange: (schoolId: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
  selectedFile: File | null;
}

const BulkUploadModal: React.FC<BulkUploadModalProps> = ({
  onClose,
  onSubmit,
  onDownloadTemplate,
  schools,
  selectedSchool,
  onSchoolChange,
  onFileChange,
  loading,
  selectedFile
}) => {  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Upload Students</h2>          <button
            onClick={onClose}
            title="Close modal"
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 space-y-4">          {/* Download Template Section */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-1">Step 1: Download Template</h3>
            <p className="text-sm text-blue-600 mb-2">
              Download the Excel template with the correct format.
            </p>
            <button
              onClick={onDownloadTemplate}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              Download Excel Template
            </button>
          </div>

          {/* School Selection */}
          <div>
            <label htmlFor="bulk-school" className="block text-sm font-medium text-gray-700 mb-2">
              Select School *
            </label>
            <select
              id="bulk-school"
              value={selectedSchool}
              onChange={(e) => onSchoolChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a school...</option>
              {schools.map((school) => (
                <option key={school._id} value={school._id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label htmlFor="bulk-file" className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File *
            </label>
            <input
              id="bulk-file"
              type="file"
              accept=".xlsx"
              onChange={onFileChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {selectedFile && (
              <p className="text-sm text-green-600 mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>          {/* Upload Instructions */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-1 text-sm">Important Notes:</h4>
            <ul className="text-xs text-yellow-700 space-y-0.5">
              <li>• Only .xlsx files supported (max 5MB)</li>
              <li>• Duplicate emails will be skipped</li>
              <li>• Invalid rows will be reported</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!selectedSchool || !selectedFile || loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600"
          >
            {loading ? 'Uploading...' : 'Upload Students'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ICTAdminSchoolManagement;
