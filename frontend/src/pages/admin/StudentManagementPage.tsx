import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  AcademicCapIcon,
  ChartBarIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useStudentManagementStore } from '../../store/studentManagementStore';
import { useSchoolStore } from '../../store/schoolStore';
import { useAuthStore } from '../../store/authStore';
import type { Student, StudentFilters } from '../../types/student';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';
import StudentCard from '../../components/student/StudentCard';
import StudentModal from '../../components/student/StudentModal';
import StudentFiltersPanel from '../../components/student/StudentFiltersPanel';
import StudentStatsCards from '../../components/student/StudentStatsCards';
import Pagination from '../../components/common/Pagination';

const StudentManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    students,
    selectedStudent,
    studentStats,
    isLoading,
    error,
    filters,
    pagination,
    loadStudents,
    loadStudentStats,
    createStudent,
    updateStudent,
    deleteStudent,
    setSelectedStudent,
    setFilters,
    clearError,
  } = useStudentManagementStore();

  const { schools, loadSchools } = useSchoolStore();

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list');

  useEffect(() => {
    loadStudents();
    loadStudentStats();
    loadSchools();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters: StudentFilters = {
      ...filters,
      search: query,
      page: 1,
    };
    setFilters(newFilters);
    loadStudents(newFilters);
  };

  const handleFilterChange = (newFilters: Partial<StudentFilters>) => {
    const updatedFilters: StudentFilters = {
      ...filters,
      ...newFilters,
      page: 1,
    };
    setFilters(updatedFilters);
    loadStudents(updatedFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters: StudentFilters = {
      ...filters,
      page,
    };
    setFilters(newFilters);
    loadStudents(newFilters);
  };

  const handleCreateStudent = () => {
    setSelectedStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleDeleteStudent = async (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.firstname} ${student.lastname}?`)) {
      try {
        await deleteStudent(student._id);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const handleStudentSubmit = async (data: any) => {
    try {
      if (selectedStudent) {
        await updateStudent({ ...data, _id: selectedStudent._id });
      } else {
        await createStudent(data);
      }
      setIsStudentModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(student => student._id));
    }
  };

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s._id === schoolId);
    return school?.name || 'Unknown School';
  };

  // Check user permissions for student management
  const canManageStudents = user?.roles?.some(role =>
    ['Admin', 'Proprietor', 'ICT_administrator'].includes(role)
  );

  // If user doesn't have permission, show access denied
  if (!canManageStudents) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to manage students. Only Admin, Proprietor, and ICT Administrator can access this page.
          </p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading && students.length === 0) {
    return (
      <MainLayout>
        <CenteredLoader message="Loading students..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Student Management</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manage student records and academic information
                </p>
              </div>
            </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filters
                </button>

                <button
                  type="button"
                  onClick={handleCreateStudent}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Student
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-6">
              <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-6 xl:gap-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'list'
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Student List</span>
                  <span className="sm:hidden">List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('stats')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === 'stats'
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Statistics</span>
                  <span className="sm:hidden">Stats</span>
                </button>
              </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-4 transition-colors duration-200">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <StudentStatsCards stats={studentStats} isLoading={isLoading} />
        )}

        {/* Student List Tab */}
        {activeTab === 'list' && (
          <>
            {/* Filters Panel */}
            {isFiltersOpen && (
              <div className="mb-6">
                <StudentFiltersPanel
                  filters={filters}
                  schools={schools}
                  onFilterChange={handleFilterChange}
                  onClose={() => setIsFiltersOpen(false)}
                />
              </div>
            )}

            {/* Search and Actions */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-300 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Search students by name, email, or registration number..."
                  />
                </div>
              </div>

              {selectedStudents.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedStudents.length} selected
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    title="Export selected students"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                    Export
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1 border border-red-300 dark:border-red-600 rounded-md text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                    title="Delete selected students"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
            </div>

            {/* Students Grid */}
            {students.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {students.map((student) => (
                    <StudentCard
                      key={student._id}
                      student={student}
                      onEdit={handleEditStudent}
                      onDelete={handleDeleteStudent}
                      onSelect={() => handleSelectStudent(student._id)}
                      isSelected={selectedStudents.includes(student._id)}
                      schoolName={getSchoolName(typeof student.school === 'string' ? student.school : student.school._id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No students found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {searchQuery || Object.keys(filters).length > 2
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by adding your first student.'}
                </p>
                {!searchQuery && Object.keys(filters).length <= 2 && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={handleCreateStudent}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Student
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        schools={schools}
        onSubmit={handleStudentSubmit}
      />
    </MainLayout>
  );
};

export default StudentManagementPage;
