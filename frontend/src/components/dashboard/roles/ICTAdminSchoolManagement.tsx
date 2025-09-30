import React, { useEffect, useState } from 'react';
import {
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  UserPlusIcon,
  DocumentArrowUpIcon,
  UserGroupIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import {
  WelcomeCard,
  StatCard,
  QuickActionCard,
  RecentActivityCard,
} from '../widgets';

import type { QuickAction } from '../widgets/QuickActionCard';
import type { Activity } from '../widgets/RecentActivityCard';
import { useSchoolStore } from '../../../store/schoolStore';
import { useAuthStore } from '../../../store/authStore';
import { ictAdminService, ICTAdminDashboardData } from '../../../services/ictAdminService';
import type {
  CreateSchoolData,
  UpdateSchoolData,
  CreateSessionData,
  UpdateSessionData,
  CreateTermData,
  UpdateTermData,
  CreateClassArmData,
  UpdateClassArmData,
} from '../../../types/school';

// Import modals
import SchoolModal from '../../schools/SchoolModal';
import SessionModal from '../../schools/SessionModal';
import TermModal from '../../schools/TermModal';
import GroupSchoolModal from '../../schools/GroupSchoolModal';
import ClassArmModal from '../../schools/ClassArmModal';

const ICTAdminSchoolManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    schools,
    sessions,
    classArms,
    isLoading,
    loadSchools,
    loadSessions,
    loadClassArms,
  } = useSchoolStore();

  // ICT Admin dashboard data
  const [dashboardData, setDashboardData] = useState<ICTAdminDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Modal states
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [isGroupSchoolModalOpen, setIsGroupSchoolModalOpen] = useState(false);
  const [isClassArmModalOpen, setIsClassArmModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  // Bulk upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Bulk upload functions
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv', // .csv
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid Excel (.xlsx, .xls) or CSV file');
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const downloadTemplate = async () => {
    try {
      const authStore = useAuthStore.getState();
      const token = authStore.token;
      
      if (!token) {
        toast.error('Please log in to download template');
        return;
      }

      const schoolParam = selectedSchoolId ? `?school_id=${selectedSchoolId}` : '';
      const response = await fetch(`/api/v1/bulk-students/template${schoolParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message ?? 'Failed to download template');
        } else {
          throw new Error(`Failed to download template (${response.status})`);
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = selectedSchoolId ? 
        `student_template_${schools.find(s => s._id === selectedSchoolId)?.name || 'school'}.xlsx` : 
        'student_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download template');
    }
  };

  const handleBulkUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!selectedSchoolId) {
      toast.error('Please select a school');
      return;
    }

    setIsUploading(true);
    
    try {
      const authStore = useAuthStore.getState();
      const token = authStore.token;
      
      if (!token) {
        toast.error('Please log in to upload students');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('school_id', selectedSchoolId);

      console.log('🔧 Making bulk upload request...');
      console.log('URL: /api/v1/bulk-students/upload');
      console.log('School ID:', selectedSchoolId);
      console.log('File:', selectedFile?.name);

      const response = await fetch('/api/v1/bulk-students/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📥 Response received:');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));

      // Check response type and handle accordingly
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!response.ok) {
        // For error responses, expect JSON
        let result;
        if (contentType?.includes('application/json')) {
          result = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Upload failed: ${text.substring(0, 200)}...`);
        }
        
        console.log('Upload failed response:', result);
        
        // Check if there are detailed conflicts/duplicate information
        if (result.conflicts && Array.isArray(result.conflicts) && result.conflicts.length > 0) {
          console.log('Conflicts found:', result.conflicts);
          let conflictSummary: string;
          if (result.conflicts.length === 1) {
            conflictSummary = result.conflicts[0];
          } else {
            const firstThree = result.conflicts.slice(0, 3).join(', ');
            const hasMore = result.conflicts.length > 3 ? '...' : '';
            conflictSummary = `${result.conflicts.length} duplicate records found: ${firstThree}${hasMore}`;
          }
          throw new Error(`${result.message ?? 'Upload failed'} - ${conflictSummary}`);
        } else if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          console.log('Validation errors found:', result.errors);
          const errorSummary = result.errors.length === 1 
            ? result.errors[0]
            : `${result.errors.length} validation errors. First error: ${result.errors[0]}`;
          throw new Error(`${result.message ?? 'Validation errors found'} - ${errorSummary}`);
        } else {
          throw new Error(result.message ?? 'Upload failed');
        }
      }

      // For successful responses, check if it's a PDF (student credentials) or JSON
      if (contentType?.includes('application/pdf')) {
        console.log('✅ PDF response detected, processing download...');

        // Handle PDF response - download the student credentials
        const blob = await response.blob();
        console.log('Blob size:', blob.size, 'bytes');
        console.log('Blob type:', blob.type);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;

        // Get filename from response headers or use default
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'student_credentials.pdf';
        if (contentDisposition) {
          console.log('Content-Disposition header:', contentDisposition);
          const regex = /filename="(.+)"/;
          const filenameMatch = regex.exec(contentDisposition);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        console.log('Download filename:', filename);

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ PDF download initiated');
        toast.success('Students uploaded successfully! Student credentials PDF downloaded.');
      } else if (contentType?.includes('application/json')) {
        // Handle JSON response (fallback case)
        const result = await response.json();
        toast.success(`Successfully uploaded ${result.data?.successCount ?? 0} students`);
      } else {
        // Unknown success response type
        toast.success('Students uploaded successfully!');
      }
      
      // Reset form
      setSelectedFile(null);
      setSelectedSchoolId('');
      setIsBulkUploadModalOpen(false);
      
      // Reset file input
      const fileInput = document.getElementById('bulk-upload-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (error) {
      console.error('❌ Bulk upload error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);

      // If we have detailed error information, log it for developers
      if (error instanceof Error && error.message.includes('duplicate records found')) {
        console.error('Detailed conflict information available in server response');
      }

      // Log the full error for debugging
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }

      toast.error(error instanceof Error ? error.message : 'Internal server error during bulk upload');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    // Fetch school-related data on component mount for ICT Admin
    const loadData = async () => {
      try {
        setDashboardLoading(true);

        // Load ICT admin dashboard data
        console.log('Starting to load ICT admin dashboard data...');
        const dashboardPromise = ictAdminService.getDashboardData()
          .then(data => {
            console.log('ICT Admin dashboard data loaded successfully:', data);
            setDashboardData(data);
          })
          .catch(error => {
            console.error('Failed to load ICT admin dashboard data:', error);
            console.error('Error details:', error.response?.data || error.message);
          });

        // For ICT administrators, only load the data they have access to
        const promises = [dashboardPromise];

        // Always try to load these
        promises.push(loadSessions());
        promises.push(loadClassArms());

        // Try to load schools, but handle gracefully if access is restricted
        promises.push(
          loadSchools().catch(() => {
            console.warn('Could not load all schools - this may be expected for ICT admins');
          })
        );

        await Promise.all(promises);

        // If schools array is empty but user is ICT admin, this is expected
        if (schools.length === 0 && user?.roles?.includes('ICT_administrator')) {
          console.info('ICT admin showing role-specific dashboard');
        }

      } catch (error) {
        console.warn('Some data failed to load, but this may be expected for ICT admins:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    loadData();
  }, [loadSchools, loadSessions, loadClassArms, schools.length, user?.roles]);

  // Quick actions for ICT Admin School Management
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Bulk Upload Students',
      description: 'Upload multiple students using Excel/CSV',
      icon: DocumentArrowUpIcon,
      color: 'primary',
      onClick: () => setIsBulkUploadModalOpen(true),
    },
    {
      id: '2',
      title: 'User Management',
      description: 'Manage users, roles and permissions',
      icon: UserGroupIcon,
      color: 'primary',
      onClick: () => { navigate('/users'); },
    },
    {
      id: '3',
      title: 'Add New User',
      description: 'Create individual user accounts',
      icon: UserPlusIcon,
      color: 'success',
      onClick: () => { navigate('/users/create'); },
    },
    {
      id: '4',
      title: 'Add New School',
      description: 'Register a new school in the system',
      icon: PlusIcon,
      color: 'success',
      onClick: () => setIsSchoolModalOpen(true),
    },
    {
      id: '5',
      title: 'Create Academic Session',
      description: 'Set up a new academic session',
      icon: CalendarDaysIcon,
      color: 'primary',
      onClick: () => setIsSessionModalOpen(true),
    },
    {
      id: '6',
      title: 'Add Term',
      description: 'Create a new academic term',
      icon: AcademicCapIcon,
      color: 'warning',
      onClick: () => setIsTermModalOpen(true),
    },
    {
      id: '7',
      title: 'Setup Class Arms',
      description: 'Configure class arms for schools',
      icon: UsersIcon,
      color: 'secondary',
      onClick: () => setIsClassArmModalOpen(true),
    },
    {
      id: '8',
      title: 'View All Schools',
      description: 'Browse and manage all schools',
      icon: EyeIcon,
      color: 'secondary',
      onClick: () => { navigate('/schools'); },
    },
    {
      id: '9',
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: CogIcon,
      color: 'error',
      onClick: () => { navigate('/settings'); },
    },
  ];

  // Recent activities - you might want to implement this with real data
  const recentActivities: Activity[] = [
    {
      id: '1',
      title: 'Bulk student upload completed',
      description: '150 students uploaded successfully to Greenwood High School',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      type: 'user',
    },
    {
      id: '2',
      title: 'New school registered',
      description: 'Greenwood High School was added to the system',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'academic',
    },
    {
      id: '3',
      title: 'User roles updated',
      description: '5 new teachers assigned to various schools',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      type: 'user',
    },
    {
      id: '4',
      title: 'Academic session created',
      description: '2024/2025 session was created for all schools',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      type: 'academic',
    },
    {
      id: '5',
      title: 'Term setup completed',
      description: 'First term 2024/2025 configured for 5 schools',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      type: 'academic',
    },
  ];

  // Modal submit handlers
  const handleSchoolSubmit = async (data: CreateSchoolData | UpdateSchoolData) => {
    // The createSchool/updateSchool function is called inside the modal
    console.log('School created/updated:', data);
  };

  const handleSessionSubmit = async (data: CreateSessionData | UpdateSessionData) => {
    // The createSession/updateSession function is called inside the modal
    console.log('Session created/updated:', data);
  };

  const handleTermSubmit = async (data: CreateTermData | UpdateTermData) => {
    // The createTerm/updateTerm function is called inside the modal
    console.log('Term created/updated:', data);
  };

  const handleClassArmSubmit = async (data: CreateClassArmData | UpdateClassArmData) => {
    // The createClassArm/updateClassArm function is called inside the modal
    console.log('Class arm created/updated:', data);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <WelcomeCard
        customMessage={`Welcome back, ${user?.firstname ?? 'ICT Administrator'}!`}
        showDate={true}
        showRole={true}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title={user?.roles?.includes('ICT_administrator') ? "Accessible Schools" : "Total Schools"}
          value={dashboardData?.technicalStats?.totalSchools || 1}
          icon={AcademicCapIcon}
          iconColor="text-green-600"
          changeType="increase"
          loading={dashboardLoading}
        />
        <StatCard
          title="Active Sessions"
          value={sessions.length}
          icon={CalendarDaysIcon}
          iconColor="text-purple-600"
          changeType="increase"
          loading={isLoading}
        />
        <StatCard
          title="Class Arms"
          value={classArms.length}
          icon={UsersIcon}
          iconColor="text-orange-600"
          changeType="increase"
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <QuickActionCard
        title="ICT Administrator Actions"
        actions={quickActions}
      />

      {/* Recent Activities */}
      {/* <RecentActivityCard
        title="Recent ICT Administration Activities"
        activities={recentActivities}
      /> */}

      {/* Modals */}
      <SchoolModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        onSubmit={handleSchoolSubmit}
        groupSchools={[]}
      />

      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSubmit={handleSessionSubmit}
        schools={schools}
      />

      <TermModal
        isOpen={isTermModalOpen}
        onClose={() => setIsTermModalOpen(false)}
        onSubmit={handleTermSubmit}
        sessions={sessions}
      />

      <GroupSchoolModal
        isOpen={isGroupSchoolModalOpen}
        onClose={() => setIsGroupSchoolModalOpen(false)}
      />

      <ClassArmModal
        isOpen={isClassArmModalOpen}
        onClose={() => setIsClassArmModalOpen(false)}
        onSubmit={handleClassArmSubmit}
        schools={schools}
      />

      {/* Bulk Upload Modal */}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-upload-modal-headline"
          >
            <button
              type="button"
              className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"
              onClick={() => setIsBulkUploadModalOpen(false)}
              aria-label="Close modal"
            />
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-gray-900 transform transition-all sm:my-8 sm:align-middle w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
              {/* Header */}
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <h3 id="bulk-upload-modal-headline" className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
                    Bulk Upload Students
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsBulkUploadModalOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-6">
                  {/* School Selection */}
                  <div>
                    <label htmlFor="school-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select School *
                    </label>
                    <select
                      id="school-select"
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                      required
                      aria-label="Select school for bulk upload"
                    >
                      <option value="">Choose a school...</option>
                      {schools.map((school) => (
                        <option key={school._id} value={school._id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                    <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <div className="mt-4">
                      <label htmlFor="bulk-upload-file" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedFile ? selectedFile.name : 'Drop files here or click to upload'}
                        </span>
                        <input
                          id="bulk-upload-file"
                          name="bulk-upload-file"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Excel (.xlsx, .xls) or CSV files up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* Template Download */}
                  <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <DocumentArrowDownIcon className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Need a template?
                        </h3>
                        <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                          <p>Download our Excel template to ensure your data is formatted correctly.</p>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                            onClick={downloadTemplate}
                          >
                            Download Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Upload Instructions:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Use the provided template for best results</li>
                      <li>Ensure all required fields are filled</li>
                      <li>Maximum 1000 students per upload</li>
                      <li>Check for duplicate registration numbers</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex flex-col sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={!selectedFile || !selectedSchoolId || isUploading}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Upload Students'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBulkUploadModalOpen(false)}
                  disabled={isUploading}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ICTAdminSchoolManagement;
