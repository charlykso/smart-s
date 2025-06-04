import React, { useState, useEffect } from 'react';
import {
  CalendarDaysIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';

interface Term {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  session: {
    _id: string;
    name: string;
  };
  school: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

const TermsManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockTerms: Term[] = [
      {
        _id: '1',
        name: 'First Term',
        startDate: '2023-09-01',
        endDate: '2023-12-15',
        isActive: true,
        session: {
          _id: 'session1',
          name: '2023/2024 Academic Session',
        },
        school: {
          _id: 'school1',
          name: 'Green Valley High School',
        },
        createdAt: '2023-08-15T10:00:00Z',
      },
      {
        _id: '2',
        name: 'Second Term',
        startDate: '2024-01-08',
        endDate: '2024-04-12',
        isActive: false,
        session: {
          _id: 'session1',
          name: '2023/2024 Academic Session',
        },
        school: {
          _id: 'school1',
          name: 'Green Valley High School',
        },
        createdAt: '2023-08-15T10:00:00Z',
      },
      {
        _id: '3',
        name: 'Third Term',
        startDate: '2024-04-29',
        endDate: '2024-07-31',
        isActive: false,
        session: {
          _id: 'session1',
          name: '2023/2024 Academic Session',
        },
        school: {
          _id: 'school1',
          name: 'Green Valley High School',
        },
        createdAt: '2023-08-15T10:00:00Z',
      },
    ];

    setTimeout(() => {
      setTerms(mockTerms);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTerms = terms.filter(term =>
    term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTerm = () => {
    setSelectedTerm(null);
    setShowCreateModal(true);
  };

  const handleEditTerm = (term: Term) => {
    setSelectedTerm(term);
    setShowCreateModal(true);
  };

  const handleDeleteTerm = (termId: string) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      setTerms(terms.filter(term => term._id !== termId));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTermStatus = (term: Term) => {
    const now = new Date();
    const startDate = new Date(term.startDate);
    const endDate = new Date(term.endDate);

    if (term.isActive && now >= startDate && now <= endDate) {
      return { label: 'Active', color: 'bg-green-100 text-green-800' };
    } else if (now < startDate) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
    } else if (now > endDate) {
      return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
    } else {
      return { label: 'Inactive', color: 'bg-yellow-100 text-yellow-800' };
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
                  Academic Terms
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Terms</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage academic terms for all sessions and schools
              </p>
            </div>
            <button
              onClick={handleCreateTerm}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Term
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
                  placeholder="Search terms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Terms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerms.map((term) => {
            const status = getTermStatus(term);
            
            return (
              <div
                key={term._id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
                      <h3 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
                        {term.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>
                        {formatDate(term.startDate)} - {formatDate(term.endDate)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Session:</span> {term.session.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">School:</span> {term.school.name}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditTerm(term)}
                      className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTerm(term._id)}
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
        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No terms found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new academic term.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleCreateTerm}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Term
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
                {selectedTerm ? 'Edit Term' : 'Create New Term'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Term creation/editing form will be implemented here.
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
                  {selectedTerm ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default TermsManagementPage;
