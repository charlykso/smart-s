import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  FunnelIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline';
import MainLayout from '../../components/layout/MainLayout';
import { useFeeStore } from '../../store/feeStore';
import { useSchoolStore } from '../../store/schoolStore';
import { FeeService } from '../../services/feeService';
import FeeCard from '../../components/fees/FeeCard';
import FeeApprovalModal from '../../components/fees/FeeApprovalModal';
import type { Fee } from '../../types/fee';

const PrincipalFeeApprovalPage: React.FC = () => {
  const {
    fees,
    pendingApprovals,
    isLoading,
    error,
    loadFees,
    loadUnapprovedFees,
    approveFee,
  } = useFeeStore();

  const {
    terms,
    loadTerms,
  } = useSchoolStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalFee, setApprovalFee] = useState<Fee | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'all'>('pending');

  useEffect(() => {
    loadTerms();
    loadFees();
    loadUnapprovedFees();
  }, [loadTerms, loadFees, loadUnapprovedFees]);

  const handleApproveFee = (fee: Fee) => {
    setApprovalFee(fee);
    setIsApprovalModalOpen(true);
  };

  const handleBulkApprove = async () => {
    if (window.confirm('Are you sure you want to approve all pending fees?')) {
      try {
        for (const fee of filteredPendingFees) {
          await approveFee(fee._id);
        }
      } catch {
        // Error handled in store
      }
    }
  };

  // Filter logic
  const filterFees = (feesToFilter: Fee[]) => {
    return feesToFilter.filter(fee => {
      const matchesSearch = !searchTerm || 
        fee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.decription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTerm = !selectedTerm || 
        (typeof fee.term === 'object' && fee.term._id === selectedTerm);

      const matchesType = !selectedType || fee.type === selectedType;

      return matchesSearch && matchesTerm && matchesType;
    });
  };

  const filteredPendingFees = filterFees(pendingApprovals);
  const filteredApprovedFees = filterFees(fees.filter(fee => fee.isApproved));
  const filteredAllFees = filterFees(fees);

  const stats = {
    totalFees: fees.length,
    pendingFees: pendingApprovals.length,
    approvedFees: fees.filter(fee => fee.isApproved).length,
    totalAmount: pendingApprovals.reduce((sum, fee) => sum + fee.amount, 0),
  };

  const tabs = [
    { 
      id: 'pending', 
      name: 'Pending Approval', 
      icon: ClockIcon, 
      count: filteredPendingFees.length,
      color: 'text-yellow-600' 
    },
    { 
      id: 'approved', 
      name: 'Approved', 
      icon: CheckCircleIcon, 
      count: filteredApprovedFees.length,
      color: 'text-green-600' 
    },
    { 
      id: 'all', 
      name: 'All Fees', 
      icon: CurrencyDollarIcon, 
      count: filteredAllFees.length,
      color: 'text-blue-600' 
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Approval</h1>
            <p className="text-gray-600 dark:text-gray-400">Review and approve fee structures for your school</p>
          </div>
          {filteredPendingFees.length > 0 && (
            <button
              onClick={handleBulkApprove}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <DocumentCheckIcon className="h-4 w-4 mr-2" />
              Approve All ({filteredPendingFees.length})
            </button>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fees</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalFees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approval</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pendingFees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.approvedFees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Amount</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {FeeService.formatAmount(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Alert */}
        {stats.pendingFees > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Action Required
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You have {stats.pendingFees} fee(s) awaiting approval with a total value of {FeeService.formatAmount(stats.totalAmount)}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search fees..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="term-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Term
              </label>
              <select
                id="term-filter"
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Terms</option>
                {terms.map((term) => (
                  <option key={term._id} value={term._id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="tuition">Tuition</option>
                <option value="sports">Sports</option>
                <option value="library">Library</option>
                <option value="transport">Transport</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTerm('');
                  setSelectedType('');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Clear
              </button>
            </div>
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
                  onClick={() => setActiveTab(tab.id as 'pending' | 'approved' | 'all')}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-2 ${tab.color}`} />
                  {tab.name}
                  {tab.count > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading fees...</span>
            </div>
          ) : (
            <div>
              {/* Pending Approval Tab */}
              {activeTab === 'pending' && (
                <div>
                  {filteredPendingFees.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        {searchTerm || selectedTerm || selectedType ? 'No matching fees found' : 'No pending approvals'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedTerm || selectedType 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'All fees have been reviewed and approved.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPendingFees.map((fee) => (
                        <FeeCard
                          key={fee._id}
                          fee={fee}
                          onApprove={handleApproveFee}
                          showActions={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Approved Tab */}
              {activeTab === 'approved' && (
                <div>
                  {filteredApprovedFees.length === 0 ? (
                    <div className="text-center py-12">
                      <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        {searchTerm || selectedTerm || selectedType ? 'No matching approved fees' : 'No approved fees yet'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedTerm || selectedType 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Approved fees will appear here once you start approving pending fees.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredApprovedFees.map((fee) => (
                        <FeeCard
                          key={fee._id}
                          fee={fee}
                          showActions={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* All Fees Tab */}
              {activeTab === 'all' && (
                <div>
                  {filteredAllFees.length === 0 ? (
                    <div className="text-center py-12">
                      <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                        {searchTerm || selectedTerm || selectedType ? 'No matching fees found' : 'No fees available'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm || selectedTerm || selectedType 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'All fees created by your bursars will appear here.'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredAllFees.map((fee) => (
                        <FeeCard
                          key={fee._id}
                          fee={fee}
                          onApprove={!fee.isApproved ? handleApproveFee : undefined}
                          showActions={!fee.isApproved}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fee Approval Modal */}
      <FeeApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        fee={approvalFee}
        onApprove={async (feeId) => {
          await approveFee(feeId);
          setIsApprovalModalOpen(false);
          loadUnapprovedFees(); // Refresh the list
        }}
        onReject={async () => {
          setIsApprovalModalOpen(false);
        }}
      />
    </MainLayout>
  );
};

export default PrincipalFeeApprovalPage;
