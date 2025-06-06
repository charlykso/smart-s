import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ChevronRightIcon,
  AcademicCapIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';

interface ClassArm {
  _id: string;
  name: string;
  className: string;
  armName: string;
  capacity: number;
  currentStudents: number;
  school: {
    _id: string;
    name: string;
  };
  classTeacher?: {
    _id: string;
    firstname: string;
    lastname: string;
  };
  createdAt: string;
}

const ClassArmsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClassArm, setSelectedClassArm] = useState<ClassArm | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockClassArms: ClassArm[] = [
      {
        _id: '1',
        name: 'JSS 1A',
        className: 'JSS 1',
        armName: 'A',
        capacity: 40,
        currentStudents: 35,
        school: {
          _id: 'school1',
          name: 'Green Valley High School',
        },
        classTeacher: {
          _id: 'teacher1',
          firstname: 'John',
          lastname: 'Doe',
        },
        createdAt: '2023-08-15T10:00:00Z',
      },
      {
        _id: '2',
        name: 'JSS 1B',
        className: 'JSS 1',
        armName: 'B',
        capacity: 40,
        currentStudents: 38,
        school: {
          _id: 'school1',
          name: 'Green Valley High School',
        },
        classTeacher: {
          _id: 'teacher2',
          firstname: 'Jane',
          lastname: 'Smith',
        },
        createdAt: '2023-08-15T10:00:00Z',
      },
      {
        _id: '3',
        name: 'SS 3A',
        className: 'SS 3',
        armName: 'A',
        capacity: 35,
        currentStudents: 32,
        school: {
          _id: 'school1',
          name: 'Green Valley High School',
        },
        createdAt: '2023-08-15T10:00:00Z',
      },
    ];

    setTimeout(() => {
      setClassArms(mockClassArms);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredClassArms = classArms.filter(classArm =>
    classArm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classArm.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classArm.school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (classArm.classTeacher && 
     `${classArm.classTeacher.firstname} ${classArm.classTeacher.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateClassArm = () => {
    setSelectedClassArm(null);
    setShowCreateModal(true);
  };

  const handleEditClassArm = (classArm: ClassArm) => {
    setSelectedClassArm(classArm);
    setShowCreateModal(true);
  };

  const handleDeleteClassArm = (classArmId: string) => {
    if (window.confirm('Are you sure you want to delete this class arm?')) {
      setClassArms(classArms.filter(classArm => classArm._id !== classArmId));
    }
  };

  const getCapacityStatus = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) {
      return { label: 'Full', color: 'bg-red-100 text-red-800' };
    } else if (percentage >= 75) {
      return { label: 'Nearly Full', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'Available', color: 'bg-green-100 text-green-800' };
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <CenteredLoader />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-400 dark:hover:text-white"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Dashboard
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  Class Arms
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Class Arms Management</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage class arms, capacity, and assignments across all schools
              </p>
            </div>
            <button
              onClick={handleCreateClassArm}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Class Arm
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search class arms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Class Arms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassArms.map((classArm) => {
            const capacityStatus = getCapacityStatus(classArm.currentStudents, classArm.capacity);
            
            return (
              <div
                key={classArm._id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-6 w-6 text-primary-600" />
                      <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                        {classArm.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${capacityStatus.color}`}
                    >
                      {capacityStatus.label}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Students:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {classArm.currentStudents} / {classArm.capacity}
                      </span>
                    </div>
                    
                    {/* Capacity Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((classArm.currentStudents / classArm.capacity) * 100, 100)}%`
                        }}
                      ></div>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">School:</span> {classArm.school.name}
                    </div>
                    
                    {classArm.classTeacher && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        <span>
                          {classArm.classTeacher.firstname} {classArm.classTeacher.lastname}
                        </span>
                      </div>
                    )}
                    
                    {!classArm.classTeacher && (
                      <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                        <AcademicCapIcon className="h-4 w-4 mr-2" />
                        <span>No class teacher assigned</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditClassArm(classArm)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClassArm(classArm._id)}
                      className="inline-flex items-center p-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-700 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredClassArms.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No class arms found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new class arm.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleCreateClassArm}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Class Arm
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {selectedClassArm ? 'Edit Class Arm' : 'Create New Class Arm'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Class arm creation/editing form will be implemented here.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                >
                  {selectedClassArm ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default ClassArmsManagementPage;
