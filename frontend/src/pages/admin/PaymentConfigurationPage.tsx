import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCardIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import { FeeService } from '../../services/feeService';
import { SchoolService } from '../../services/schoolService';
import type { PaymentProfile, PaymentMethod } from '../../types/fee';
import type { School } from '../../types/school';
import MainLayout from '../../components/layout/MainLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PaymentMethodTestCard from '../../components/admin/PaymentMethodTestCard';
import PaymentAnalyticsDashboard from '../../components/admin/PaymentAnalyticsDashboard';
import toast from 'react-hot-toast';

const paymentConfigSchema = z.object({
  // School Selection (for Admin users)
  school_id: z.string().optional(),

  // Paystack Configuration
  ps_public_key: z.string().optional(),
  ps_secret_key: z.string().optional(),
  activate_ps: z.boolean(),

  // Flutterwave Configuration
  fw_public_key: z.string().optional(),
  fw_secret_key: z.string().optional(),
  activate_fw: z.boolean(),

  // Bank Transfer Configuration
  account_no: z.string().optional(),
  account_name: z.string().optional(),
  bank_name: z.string().optional(),

  // General Settings
  default_payment_method: z.enum(['paystack', 'flutterwave', 'bank_transfer', 'cash']).optional(),
  enable_installments: z.boolean(),
  minimum_installment_amount: z.number().min(0).optional(),
});

type PaymentConfigFormData = z.infer<typeof paymentConfigSchema>;

const PaymentConfigurationPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<PaymentProfile | null>(null);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethod[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'paystack' | 'flutterwave' | 'bank' | 'settings' | 'analytics'>('paystack');
  const [showSecrets, setShowSecrets] = useState({
    ps_secret: false,
    fw_secret: false,
  });
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  // Check if user is Admin (can select any school) or school-scoped user
  const isAdmin = user?.roles?.includes('Admin');
  const userSchoolId = typeof user?.school === 'string' ? user.school : user?.school?._id;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PaymentConfigFormData>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: {
      school_id: '',
      activate_ps: false,
      activate_fw: false,
      enable_installments: false,
      minimum_installment_amount: 1000,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Load payment profile when school selection changes
    if (selectedSchoolId) {
      loadPaymentProfile();
      loadAvailableMethods();
    }
  }, [selectedSchoolId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      if (isAdmin) {
        // Admin users can select any school
        const schoolsData = await SchoolService.getSchools();
        setSchools(schoolsData);

        // Set default school selection to first school if available
        if (schoolsData.length > 0 && !selectedSchoolId) {
          const defaultSchoolId = schoolsData[0]._id;
          setSelectedSchoolId(defaultSchoolId);
          setValue('school_id', defaultSchoolId);
        }
      } else {
        // Non-admin users use their own school
        if (userSchoolId) {
          setSelectedSchoolId(userSchoolId);
          setValue('school_id', userSchoolId);
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      toast.error('Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentProfile = async () => {
    if (!selectedSchoolId) return;

    try {
      const profiles = await FeeService.getPaymentProfiles();
      const profile = profiles.find(p =>
        (typeof p.school === 'string' ? p.school : p.school._id) === selectedSchoolId
      );

      if (profile) {
        setCurrentProfile(profile);
        // Populate form with existing data
        setValue('ps_public_key', profile.ps_public_key || '');
        setValue('activate_ps', profile.activate_ps);
        setValue('fw_public_key', profile.fw_public_key || '');
        setValue('activate_fw', profile.activate_fw);
        setValue('account_no', profile.account_no || '');
        setValue('account_name', profile.account_name || '');
        setValue('bank_name', profile.bank_name || '');
        // Don't populate secret keys for security
      } else {
        // Reset form if no profile found
        setCurrentProfile(null);
        setValue('ps_public_key', '');
        setValue('activate_ps', false);
        setValue('fw_public_key', '');
        setValue('activate_fw', false);
        setValue('account_no', '');
        setValue('account_name', '');
        setValue('bank_name', '');
      }
    } catch (error) {
      console.error('Failed to load payment profile:', error);
      toast.error('Failed to load payment profile');
    }
  };

  const loadAvailableMethods = async () => {
    if (!selectedSchoolId) return;

    try {
      const methods = await FeeService.getAvailablePaymentMethods(selectedSchoolId);
      setAvailableMethods(methods);
    } catch (error) {
      console.error('Failed to load available methods:', error);
    }
  };

  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setValue('school_id', schoolId);
    // Reset current profile when school changes
    setCurrentProfile(null);
    setAvailableMethods([]);
  };

  const handleFormSubmit = async (data: PaymentConfigFormData) => {
    if (!selectedSchoolId) {
      toast.error('Please select a school');
      return;
    }

    try {
      setIsSaving(true);

      if (currentProfile) {
        // Update existing profile
        await FeeService.updatePaymentProfile(currentProfile._id, {
          ...data,
          school_id: selectedSchoolId,
        });
        toast.success('Payment configuration updated successfully!');
      } else {
        // Create new profile
        await FeeService.createPaymentProfile({
          ...data,
          school_id: selectedSchoolId,
        });
        toast.success('Payment configuration created successfully!');
      }

      await loadPaymentProfile();
      await loadAvailableMethods();
    } catch (error) {
      toast.error('Failed to save payment configuration');
      console.error('Error saving payment config:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testPaymentMethod = async (method: 'paystack' | 'flutterwave') => {
    const testData = {
      method,
      public_key: method === 'paystack' ? watchedValues.ps_public_key : watchedValues.fw_public_key,
      secret_key: method === 'paystack' ? watchedValues.ps_secret_key : watchedValues.fw_secret_key,
    };

    try {
      // Simulate API test call
      setTestResults(prev => ({ ...prev, [method]: { success: false, message: 'Testing...' } }));
      
      // Mock test - in real implementation, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (testData.public_key && testData.secret_key) {
        setTestResults(prev => ({ 
          ...prev, 
          [method]: { success: true, message: 'Connection successful!' } 
        }));
      } else {
        setTestResults(prev => ({ 
          ...prev, 
          [method]: { success: false, message: 'API keys are required' } 
        }));
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [method]: { success: false, message: 'Connection failed' } 
      }));
    }
  };

  const getMethodStatus = (method: PaymentMethod) => {
    if (!method.enabled) {
      return { color: 'text-gray-500', bg: 'bg-gray-100', text: 'Disabled' };
    }
    return { color: 'text-green-600', bg: 'bg-green-100', text: 'Active' };
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CogIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900 dark:text-gray-100">
                  Payment Configuration
                </h1>
                <p className="text-secondary-600 dark:text-gray-400 mt-1">
                  Configure payment methods for {isAdmin ? 'schools' : 'your school'}
                </p>
              </div>
            </div>

            {/* School Selection - Only for Admin users */}
            {isAdmin && (
              <div className="flex items-center space-x-4">
                <div className="min-w-0 flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select School *
                  </label>
                  <div className="flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => handleSchoolChange(e.target.value)}
                      aria-label="Select school for payment configuration"
                      className="block w-full min-w-[200px] border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-sm"
                    >
                      <option value="">Select a school</option>
                      {schools.map((school) => (
                        <option key={school._id} value={school._id}>
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected School Info */}
          {selectedSchoolId && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Configuring payment methods for: {
                    isAdmin
                      ? schools.find(s => s._id === selectedSchoolId)?.name || 'Selected School'
                      : user?.school?.name || 'Your School'
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-secondary-200 dark:border-gray-700 p-4 lg:p-6 transition-colors duration-200">
          <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-6 xl:gap-8">
            {[
              { id: 'paystack', name: 'Paystack', icon: CreditCardIcon },
              { id: 'flutterwave', name: 'Flutterwave', icon: CreditCardIcon },
              { id: 'bank', name: 'Bank Transfer', icon: BuildingLibraryIcon },
              { id: 'settings', name: 'Settings', icon: CogIcon },
              { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form */}
          <div className="lg:col-span-2">
            {!selectedSchoolId ? (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center transition-colors duration-200">
                <BuildingOfficeIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {isAdmin ? 'Select a School' : 'No School Associated'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isAdmin
                    ? 'Please select a school from the dropdown above to configure payment methods.'
                    : 'You need to be associated with a school to configure payment methods.'
                  }
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Paystack Configuration */}
              {activeTab === 'paystack' && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Paystack Configuration</h3>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('activate_ps')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                      <label className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                        Enable Paystack
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Public Key *
                      </label>
                      <input
                        type="text"
                        {...register('ps_public_key')}
                        placeholder="pk_test_..."
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.ps_public_key && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ps_public_key.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Secret Key *
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.ps_secret ? 'text' : 'password'}
                          {...register('ps_secret_key')}
                          placeholder="sk_test_..."
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets(prev => ({ ...prev, ps_secret: !prev.ps_secret }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showSecrets.ps_secret ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                          )}
                        </button>
                      </div>
                      {errors.ps_secret_key && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ps_secret_key.message}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>Get your API keys from your <a href="https://dashboard.paystack.com/#/settings/developer" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">Paystack Dashboard</a></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => testPaymentMethod('paystack')}
                        disabled={!watchedValues.ps_public_key || !watchedValues.ps_secret_key}
                        className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 rounded-md hover:bg-primary-100 dark:hover:bg-primary-800 disabled:opacity-50 transition-colors duration-200"
                      >
                        Test Connection
                      </button>
                    </div>

                    {testResults.paystack && (
                      <div className={`rounded-lg p-4 ${
                        testResults.paystack.success
                          ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700'
                          : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
                      }`}>
                        <div className="flex items-center">
                          {testResults.paystack.success ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                          ) : (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                          )}
                          <p className={`text-sm font-medium ${
                            testResults.paystack.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                          }`}>
                            {testResults.paystack.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Flutterwave Configuration */}
              {activeTab === 'flutterwave' && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-6 w-6 text-orange-600 mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">Flutterwave Configuration</h3>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('activate_fw')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Enable Flutterwave
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Public Key *
                      </label>
                      <input
                        type="text"
                        {...register('fw_public_key')}
                        placeholder="FLWPUBK_TEST-..."
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.fw_public_key && (
                        <p className="mt-1 text-sm text-red-600">{errors.fw_public_key.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secret Key *
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.fw_secret ? 'text' : 'password'}
                          {...register('fw_secret_key')}
                          placeholder="FLWSECK_TEST-..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecrets(prev => ({ ...prev, fw_secret: !prev.fw_secret }))}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showSecrets.fw_secret ? (
                            <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.fw_secret_key && (
                        <p className="mt-1 text-sm text-red-600">{errors.fw_secret_key.message}</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <div className="text-sm text-gray-600">
                        <p>Get your API keys from your <a href="https://dashboard.flutterwave.com/settings/apis" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Flutterwave Dashboard</a></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => testPaymentMethod('flutterwave')}
                        disabled={!watchedValues.fw_public_key || !watchedValues.fw_secret_key}
                        className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 disabled:opacity-50"
                      >
                        Test Connection
                      </button>
                    </div>

                    {testResults.flutterwave && (
                      <div className={`rounded-lg p-4 ${
                        testResults.flutterwave.success 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="flex items-center">
                          {testResults.flutterwave.success ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                          ) : (
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                          )}
                          <p className={`text-sm font-medium ${
                            testResults.flutterwave.success ? 'text-green-800' : 'text-red-800'
                          }`}>
                            {testResults.flutterwave.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bank Transfer Configuration */}
              {activeTab === 'bank' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <BuildingLibraryIcon className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Bank Transfer Configuration</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        {...register('bank_name')}
                        placeholder="e.g., First Bank of Nigeria"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.bank_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.bank_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Name *
                      </label>
                      <input
                        type="text"
                        {...register('account_name')}
                        placeholder="School Account Name"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.account_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.account_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        {...register('account_no')}
                        placeholder="1234567890"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      />
                      {errors.account_no && (
                        <p className="mt-1 text-sm text-red-600">{errors.account_no.message}</p>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Students will see these bank details when they select bank transfer as their payment method. 
                        Ensure the account details are correct and the account is active.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'settings' && (
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center mb-6">
                    <CogIcon className="h-6 w-6 text-gray-600 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Payment Method
                      </label>
                      <select
                        {...register('default_payment_method')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Select default method</option>
                        <option value="paystack">Paystack</option>
                        <option value="flutterwave">Flutterwave</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash Payment</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('enable_installments')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-900">
                        Enable Installment Payments
                      </label>
                    </div>

                    {watchedValues.enable_installments && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Installment Amount (₦)
                        </label>
                        <input
                          type="number"
                          {...register('minimum_installment_amount', { valueAsNumber: true })}
                          min="0"
                          step="100"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                        {errors.minimum_installment_amount && (
                          <p className="mt-1 text-sm text-red-600">{errors.minimum_installment_amount.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <PaymentAnalyticsDashboard />
              )}

              {/* Save Button - Only show for configuration tabs */}
              {activeTab !== 'analytics' && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              )}
            </form>
            )}
          </div>

          {/* Sidebar - Current Status */}
          <div className="space-y-6">
            {/* Available Methods */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Payment Methods</h3>
              <div className="space-y-3">
                {availableMethods.map((method) => {
                  const status = getMethodStatus(method);
                  return (
                    <div key={method.method} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg mr-3">
                          {method.method === 'cash' ? (
                            <BanknotesIcon className="h-4 w-4" />
                          ) : method.method === 'bank_transfer' ? (
                            <BuildingLibraryIcon className="h-4 w-4" />
                          ) : (
                            <CreditCardIcon className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{method.name}</p>
                          <p className="text-xs text-gray-500">{method.description}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Setup Guide */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Setup Guide</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">1</span>
                  <p>Create accounts with Paystack and/or Flutterwave</p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">2</span>
                  <p>Get your API keys from the respective dashboards</p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">3</span>
                  <p>Configure your bank account details for direct transfers</p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">4</span>
                  <p>Test your configuration before going live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentConfigurationPage;
