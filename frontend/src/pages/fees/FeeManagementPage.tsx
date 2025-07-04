import React, { useEffect, useState } from 'react';
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ChartBarIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useFeeStore } from '../../store/feeStore';
import { useSchoolStore } from '../../store/schoolStore';
import { useAuthStore } from '../../store/authStore';
import MainLayout from '../../components/layout/MainLayout';
import CenteredLoader from '../../components/common/CenteredLoader';
import FeeCard from '../../components/fees/FeeCard';
import PaymentCard from '../../components/fees/PaymentCard';
import FeeModal from '../../components/fees/FeeModal';
import FeeApprovalModal from '../../components/fees/FeeApprovalModal';
import FeeStats from '../../components/fees/FeeStats';
import PaymentStats from '../../components/fees/PaymentStats';
import type { Fee } from '../../types/fee';

const FeeManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    fees,
    payments,
    pendingApprovals,
    isLoading,
    error,
    loadFees,
    loadPayments,
    loadUnapprovedFees,
    loadFeeStats,
    loadPaymentStats,
  } = useFeeStore();

  const {
    schools,
    terms,
    loadSchools,
    loadTerms,
  } = useSchoolStore();

  // Modal states
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  
  // Edit states
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [approvalFee, setApprovalFee] = useState<Fee | null>(null);

  // Filter states
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'payments' | 'approvals'>('overview');
  const [feeFilters, setFeeFilters] = useState({
    school: '',
    term: '',
    type: '',
    isActive: undefined as boolean | undefined,
    isApproved: undefined as boolean | undefined,
    search: '',
  });

  useEffect(() => {
    // Load initial data
    loadSchools();
    loadTerms();
    loadFees();
    loadPayments();
    loadUnapprovedFees();
    loadFeeStats();
    loadPaymentStats();
  }, [loadSchools, loadTerms, loadFees, loadPayments, loadUnapprovedFees, loadFeeStats, loadPaymentStats]);

  // Check user permissions
  const canManageFees = user?.roles?.some(role => 
    ['Admin', 'ICT_administrator', 'Bursar'].includes(role)
  );

  const canApproveFees = user?.roles?.some(role => 
    ['Admin', 'ICT_administrator', 'Principal', 'Bursar'].includes(role)
  );

  const canProcessPayments = user?.roles?.some(role => 
    ['Admin', 'ICT_administrator', 'Bursar', 'Student', 'Parent'].includes(role)
  );

  if (isLoading && fees.length === 0) {
    return (
      <MainLayout>
        <CenteredLoader message="Loading fee data..." />
      </MainLayout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'fees', name: 'Fee Management', icon: CurrencyDollarIcon },
    { id: 'payments', name: 'Payments', icon: CreditCardIcon },
    { id: 'approvals', name: 'Approvals', icon: CheckCircleIcon, badge: pendingApprovals.length },
  ];

  const handleCreateFee = () => {
    setEditingFee(null);
    setIsFeeModalOpen(true);
  };

  const handleEditFee = (fee: Fee) => {
    setEditingFee(fee);
    setIsFeeModalOpen(true);
  };

  const handleApproveFee = (fee: Fee) => {
    setApprovalFee(fee);
    setIsApprovalModalOpen(true);
  };

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    setFeeFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredFees = fees.filter(fee => {
    if (feeFilters.school && typeof fee.school === 'object' && fee.school._id !== feeFilters.school) return false;
    if (feeFilters.term && typeof fee.term === 'object' && fee.term._id !== feeFilters.term) return false;
    if (feeFilters.type && fee.type !== feeFilters.type) return false;
    if (feeFilters.isActive !== undefined && fee.isActive !== feeFilters.isActive) return false;
    if (feeFilters.isApproved !== undefined && fee.isApproved !== feeFilters.isApproved) return false;
    if (feeFilters.search) {
      const searchLower = feeFilters.search.toLowerCase();
      return (fee.name?.toLowerCase().includes(searchLower)) ||
             (fee.decription?.toLowerCase().includes(searchLower)) ||
             (fee.type?.toLowerCase().includes(searchLower));
    }
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-secondary-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
                  Fee Management
                </h1>
                <p className="text-secondary-600 dark:text-gray-300 mt-1">
                  Manage fees, process payments, and track financial transactions
                </p>
              </div>
            </div>

            {canManageFees && (
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCreateFee}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Fee
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-secondary-200 dark:border-gray-700 p-4 lg:p-6">
          <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-6 xl:gap-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as 'overview' | 'fees' | 'payments' | 'approvals')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                  {!!(tab.badge && tab.badge > 0) && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <FeeStats />
            <PaymentStats />
            
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {canManageFees && (
                  <button
                    onClick={handleCreateFee}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <CurrencyDollarIcon className="h-8 w-8 text-primary-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Create Fee</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add new fee structure</p>
                    </div>
                  </button>
                )}
                
                {canProcessPayments && (
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <CreditCardIcon className="h-8 w-8 text-primary-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Process Payment</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Handle fee payments</p>
                    </div>
                  </button>
                )}
                
                {canApproveFees && pendingApprovals.length > 0 && (
                  <button
                    onClick={() => setActiveTab('approvals')}
                    className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 relative"
                  >
                    <ClockIcon className="h-8 w-8 text-orange-600 mr-3" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">Pending Approvals</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{pendingApprovals.length} fees awaiting approval</p>
                    </div>
                    <span className="absolute -top-2 -right-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {pendingApprovals.length}
                    </span>
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('fees')}
                  className="flex items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ChartBarIcon className="h-8 w-8 text-primary-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">View Reports</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Financial reports & analytics</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fees Tab */}
        {activeTab === 'fees' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fee Filters</h3>
                <button
                  onClick={() => setFeeFilters({
                    school: '',
                    term: '',
                    type: '',
                    isActive: undefined,
                    isApproved: undefined,
                    search: '',
                  })}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  Clear Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="school-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">School</label>
                  <select
                    id="school-filter"
                    value={feeFilters.school}
                    onChange={(e) => handleFilterChange('school', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Schools</option>
                    {schools.map(school => (
                      <option key={school._id} value={school._id}>{school.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="term-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Term</label>
                  <select
                    id="term-filter"
                    value={feeFilters.term}
                    onChange={(e) => handleFilterChange('term', e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Terms</option>
                    {terms.map(term => (
                      <option key={term._id} value={term._id}>{term.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    id="status-filter"
                    value={feeFilters.isApproved === undefined ? '' : feeFilters.isApproved.toString()}
                    onChange={(e) => handleFilterChange('isApproved', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">All Status</option>
                    <option value="true">Approved</option>
                    <option value="false">Pending Approval</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                  <input
                    id="search-filter"
                    type="text"
                    value={feeFilters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search fees..."
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Fee List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Fees ({filteredFees.length})</h2>
                {canManageFees && (
                  <button
                    onClick={handleCreateFee}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Fee
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFees.map((fee) => (
                  <FeeCard
                    key={fee._id}
                    fee={fee}
                    onEdit={canManageFees ? handleEditFee : undefined}
                    onApprove={canApproveFees ? handleApproveFee : undefined}
                    showActions={canManageFees || canApproveFees || canProcessPayments}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Payments ({payments.length})</h2>
            </div>
            
            <div className="payment-card-grid grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {payments.map((payment) => (
                <PaymentCard
                  key={payment._id}
                  payment={payment}
                  showActions={canProcessPayments}
                />
              ))}
            </div>
          </div>
        )}

        {/* Approvals Tab */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Pending Approvals ({pendingApprovals.length})
              </h2>
            </div>
            
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All fees have been reviewed and approved.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingApprovals.map((fee) => (
                  <FeeCard
                    key={fee._id}
                    fee={fee}
                    onApprove={canApproveFees ? handleApproveFee : undefined}
                    showActions={canApproveFees}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <FeeModal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        fee={editingFee}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        schools={schools as unknown as any[]}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        terms={terms as unknown as any[]}
        onSubmit={async () => {
          setIsFeeModalOpen(false);
        }}
      />

      <FeeApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        fee={approvalFee}
        onApprove={async () => {
          setIsApprovalModalOpen(false);
        }}
        onReject={async () => {
          setIsApprovalModalOpen(false);
        }}
      />
    </MainLayout>
  );
};

export default FeeManagementPage;
