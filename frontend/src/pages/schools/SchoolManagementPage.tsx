import React, { useEffect, useState } from 'react';
import {
  BuildingOfficeIcon,
  AcademicCapIcon,
  CalendarDaysIcon,
  PlusIcon,
  ChartBarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useSchoolStore } from '../../store/schoolStore';
import { useAuthStore } from '../../store/authStore';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';
import SchoolCard from '../../components/schools/SchoolCard';
import SessionCard from '../../components/schools/SessionCard';
import TermCard from '../../components/schools/TermCard';
import ClassArmCard from '../../components/schools/ClassArmCard';
import SchoolModal from '../../components/schools/SchoolModal';
import SessionModal from '../../components/schools/SessionModal';
import TermModal from '../../components/schools/TermModal';
import ClassArmModal from '../../components/schools/ClassArmModal';
import GroupSchoolModal from '../../components/schools/GroupSchoolModal';
import SchoolStats from '../../components/schools/SchoolStats';

const SchoolManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    schools,
    groupSchools,
    sessions,
    terms,
    classArms,
    selectedSchool,
    selectedSession,
    selectedTerm,
    isLoading,
    error,
    loadSchools,
    loadGroupSchools,
    loadSessions,
    loadTerms,
    loadClassArms,
    setSelectedSchool,
    setSelectedSession,
    setSelectedTerm,
  } = useSchoolStore();

  // Modal states
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);
  const [isClassArmModalOpen, setIsClassArmModalOpen] = useState(false);
  const [isGroupSchoolModalOpen, setIsGroupSchoolModalOpen] = useState(false);
  
  // Edit states
  const [editingSchool, setEditingSchool] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [editingTerm, setEditingTerm] = useState(null);
  const [editingClassArm, setEditingClassArm] = useState(null);
  const [editingGroupSchool, setEditingGroupSchool] = useState(null);

  // Active tab state
  const [activeTab, setActiveTab] = useState<'overview' | 'schools' | 'sessions' | 'terms' | 'classes'>('overview');

  useEffect(() => {
    // Load initial data
    loadGroupSchools();
    loadSchools();
    loadSessions();
    loadTerms();
    loadClassArms();
  }, [loadGroupSchools, loadSchools, loadSessions, loadTerms, loadClassArms]);

  // Check user permissions
  const canManageSchools = user?.roles?.some(role => 
    ['Admin', 'ICT_administrator', 'Proprietor'].includes(role)
  );

  const canManageSessions = user?.roles?.some(role => 
    ['Admin', 'ICT_administrator', 'Proprietor', 'Principal'].includes(role)
  );

  if (isLoading && schools.length === 0) {
    return (
      <MainLayout>
        <CenteredLoader message="Loading school data..." />
      </MainLayout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'schools', name: 'Schools', icon: BuildingOfficeIcon },
    { id: 'sessions', name: 'Sessions', icon: CalendarDaysIcon },
    { id: 'terms', name: 'Terms', icon: AcademicCapIcon },
    { id: 'classes', name: 'Classes', icon: UsersIcon },
  ];

  const handleCreateSchool = () => {
    setEditingSchool(null);
    setIsSchoolModalOpen(true);
  };

  const handleEditSchool = (school: any) => {
    setEditingSchool(school);
    setIsSchoolModalOpen(true);
  };

  const handleCreateSession = () => {
    setEditingSession(null);
    setIsSessionModalOpen(true);
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setIsSessionModalOpen(true);
  };

  const handleCreateTerm = () => {
    setEditingTerm(null);
    setIsTermModalOpen(true);
  };

  const handleEditTerm = (term: any) => {
    setEditingTerm(term);
    setIsTermModalOpen(true);
  };

  const handleCreateClassArm = () => {
    setEditingClassArm(null);
    setIsClassArmModalOpen(true);
  };

  const handleEditClassArm = (classArm: any) => {
    setEditingClassArm(classArm);
    setIsClassArmModalOpen(true);
  };

  const handleCreateGroupSchool = () => {
    setEditingGroupSchool(null);
    setIsGroupSchoolModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BuildingOfficeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">
                  School Management
                </h1>
                <p className="text-secondary-600 dark:text-gray-400 mt-1">
                  Manage schools, academic sessions, terms, and class structures
                </p>
              </div>
            </div>

            {canManageSchools && (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCreateGroupSchool}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Group School
                </button>
                <button
                  type="button"
                  onClick={handleCreateSchool}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New School
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-4 lg:p-6 transition-colors duration-200">
          <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-6 xl:gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.charAt(0)}</span>
                </button>
              );
            })}
          </nav>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SchoolStats />

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 shadow dark:shadow-gray-900 rounded-lg border dark:border-gray-700 p-6 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {canManageSchools && (
                  <button
                    type="button"
                    onClick={handleCreateSchool}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <BuildingOfficeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">Add School</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Create new school</p>
                    </div>
                  </button>
                )}

                {canManageSessions && (
                  <button
                    type="button"
                    onClick={handleCreateSession}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <CalendarDaysIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-gray-100">New Session</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Create academic session</p>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCreateTerm}
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <AcademicCapIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Term</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create academic term</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleCreateClassArm}
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <UsersIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Class</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Create class arm</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schools Tab */}
        {activeTab === 'schools' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Schools ({schools.length})</h2>
              {canManageSchools && (
                <button
                  type="button"
                  onClick={handleCreateSchool}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add School
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {schools.map((school) => (
                <SchoolCard
                  key={school._id}
                  school={school}
                  onEdit={canManageSchools ? handleEditSchool : undefined}
                  onSelect={setSelectedSchool}
                  isSelected={selectedSchool?._id === school._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Academic Sessions ({sessions.length})</h2>
              {canManageSessions && (
                <button
                  type="button"
                  onClick={handleCreateSession}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Session
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {sessions.map((session) => (
                <SessionCard
                  key={session._id}
                  session={session}
                  onEdit={canManageSessions ? handleEditSession : undefined}
                  onSelect={setSelectedSession}
                  isSelected={selectedSession?._id === session._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Terms Tab */}
        {activeTab === 'terms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Academic Terms ({terms.length})</h2>
              <button
                type="button"
                onClick={handleCreateTerm}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Term
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {terms.map((term) => (
                <TermCard
                  key={term._id}
                  term={term}
                  onEdit={handleEditTerm}
                  onSelect={setSelectedTerm}
                  isSelected={selectedTerm?._id === term._id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Class Arms ({classArms.length})</h2>
              <button
                type="button"
                onClick={handleCreateClassArm}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Class
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {classArms.map((classArm) => (
                <ClassArmCard
                  key={classArm._id}
                  classArm={classArm}
                  onEdit={handleEditClassArm}
                  isSelected={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SchoolModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        school={editingSchool}
        groupSchools={groupSchools}
        onSubmit={async (data) => {
          // Handle in the modal component
          setIsSchoolModalOpen(false);
        }}
      />

      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        session={editingSession}
        schools={schools}
        onSubmit={async (data) => {
          // Handle in the modal component
          setIsSessionModalOpen(false);
        }}
      />

      <TermModal
        isOpen={isTermModalOpen}
        onClose={() => setIsTermModalOpen(false)}
        term={editingTerm}
        sessions={sessions}
        onSubmit={async (data) => {
          // Handle in the modal component
          setIsTermModalOpen(false);
        }}
      />

      <ClassArmModal
        isOpen={isClassArmModalOpen}
        onClose={() => setIsClassArmModalOpen(false)}
        classArm={editingClassArm}
        schools={schools}
        onSubmit={async (data) => {
          // Handle in the modal component
          setIsClassArmModalOpen(false);
        }}
      />

      <GroupSchoolModal
        isOpen={isGroupSchoolModalOpen}
        onClose={() => setIsGroupSchoolModalOpen(false)}
        groupSchool={editingGroupSchool}
        onSubmit={async (data) => {
          // Handle in the modal component
          setIsGroupSchoolModalOpen(false);
        }}
      />
    </MainLayout>
  );
};

export default SchoolManagementPage;
