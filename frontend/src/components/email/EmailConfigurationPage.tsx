import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CogIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { EmailService } from '../../services/emailService';
import { EmailTemplatePreview } from './EmailTemplates';
import MainLayout from '../layout/MainLayout';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const emailConfigSchema = z.object({
  provider: z.literal('zoho'),
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().min(1, 'Port is required').max(65535, 'Invalid port number'),
  secure: z.boolean(),
  auth: z.object({
    user: z.string().email('Valid email is required'),
    pass: z.string().min(1, 'Password is required'),
  }),
  from: z.object({
    name: z.string().min(1, 'Sender name is required'),
    email: z.string().email('Valid email is required'),
  }),
});

type EmailConfigFormData = z.infer<typeof emailConfigSchema>;

const EmailConfigurationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'stats'>('config');
  const [emailStats, setEmailStats] = useState<any>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmailConfigFormData>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      provider: 'zoho',
      host: 'smtp.zoho.com',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: '',
      },
      from: {
        name: 'Ledgrio School',
        email: '',
      },
    },
  });

  useEffect(() => {
    loadEmailConfig();
    loadEmailStats();
  }, []);

  const loadEmailConfig = async () => {
    try {
      setIsLoading(true);
      const config = await EmailService.getEmailConfig();
      
      // Populate form with existing config
      setValue('host', config.host);
      setValue('port', config.port);
      setValue('secure', config.secure);
      setValue('auth.user', config.auth.user);
      setValue('from.name', config.from.name);
      setValue('from.email', config.from.email);
      // Don't populate password for security
    } catch (error) {
      console.error('Failed to load email config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailStats = async () => {
    try {
      const stats = await EmailService.getEmailStats();
      setEmailStats(stats);
    } catch (error) {
      console.error('Failed to load email stats:', error);
    }
  };

  const handleConfigSubmit = async (data: EmailConfigFormData) => {
    try {
      setIsLoading(true);
      await EmailService.updateEmailConfig(data);
      toast.success('Email configuration updated successfully!');
    } catch (error) {
      toast.error('Failed to update email configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEmail = async () => {
    const testEmail = watch('auth.user');
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    try {
      setIsTesting(true);
      const result = await EmailService.testEmailConfig(testEmail);
      setTestResult(result);
      
      if (result.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error('Test email failed');
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Failed to send test email' });
      toast.error('Test email failed');
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading && !emailStats) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200">
          <div className="flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Email Configuration</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Configure Zoho email integration for notifications
              </p>
            </div>
          </div>

            {/* Tab Navigation */}
            <div className="mt-6">
              <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-6 xl:gap-8">
                {[
                  { id: 'config', name: 'Configuration', icon: CogIcon },
                  { id: 'templates', name: 'Templates', icon: EnvelopeIcon },
                  { id: 'stats', name: 'Statistics', icon: CheckCircleIcon },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
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
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            {/* Zoho Setup Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6 transition-colors duration-200">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">Zoho Email Setup Instructions</h3>
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>1.</strong> Create a Zoho Mail account or use your existing one</p>
                <p><strong>2.</strong> Enable IMAP/SMTP access in your Zoho Mail settings</p>
                <p><strong>3.</strong> Generate an App Password for SMTP authentication</p>
                <p><strong>4.</strong> Use the following SMTP settings:</p>
                <ul className="ml-4 space-y-1">
                  <li>• <strong>Host:</strong> smtp.zoho.com</li>
                  <li>• <strong>Port:</strong> 587 (TLS) or 465 (SSL)</li>
                  <li>• <strong>Security:</strong> TLS/STARTTLS</li>
                </ul>
              </div>
            </div>

            {/* Configuration Form */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">SMTP Configuration</h3>
              
              <form onSubmit={handleSubmit(handleConfigSubmit)} className="space-y-6">
                {/* SMTP Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Host *
                    </label>
                    <input
                      type="text"
                      {...register('host')}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="smtp.zoho.com"
                    />
                    {errors.host && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.host.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Port *
                    </label>
                    <input
                      type="number"
                      {...register('port', { valueAsNumber: true })}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="587"
                    />
                    {errors.port && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.port.message}</p>
                    )}
                  </div>
                </div>

                {/* Security */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('secure')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Use SSL/TLS (Port 465)
                  </label>
                </div>

                {/* Authentication */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Authentication</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      {...register('auth.user')}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="your-email@zoho.com"
                    />
                    {errors.auth?.user && (
                      <p className="mt-1 text-sm text-red-600">{errors.auth.user.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...register('auth.pass')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Your Zoho app password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.auth?.pass && (
                      <p className="mt-1 text-sm text-red-600">{errors.auth.pass.message}</p>
                    )}
                  </div>
                </div>

                {/* Sender Information */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900">Sender Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sender Name *
                      </label>
                      <input
                        type="text"
                        {...register('from.name')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Smart-S School"
                      />
                      {errors.from?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.from.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sender Email *
                      </label>
                      <input
                        type="email"
                        {...register('from.email')}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="noreply@smart-s.com"
                      />
                      {errors.from?.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.from.email.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Test Result */}
                {testResult && (
                  <div className={`rounded-lg p-4 ${
                    testResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center">
                      {testResult.success ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <p className={`text-sm font-medium ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    disabled={isTesting}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isTesting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      'Test Configuration'
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Email Templates Preview</h3>
              
              <div className="space-y-8">
                {/* Payment Reminder Template */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Payment Reminder Template</h4>
                  <EmailTemplatePreview
                    template="payment_reminder"
                    variables={{
                      studentName: 'John Student',
                      feeName: 'Tuition Fee',
                      formattedAmount: '₦50,000',
                      dueDate: 'December 31, 2024',
                      daysUntilDue: 7,
                      schoolName: 'Ledgrio School Accounting',
                      paymentUrl: 'https://ledgrio.com/student/fees',
                      supportEmail: 'accounting@ledgrio.com',
                    }}
                  />
                </div>

                {/* Payment Success Template */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Payment Success Template</h4>
                  <EmailTemplatePreview
                    template="payment_success"
                    variables={{
                      studentName: 'John Student',
                      feeName: 'Tuition Fee',
                      formattedAmount: '₦50,000',
                      transactionRef: 'TXN123456789',
                      paymentDate: 'December 24, 2024 at 2:30 PM',
                      paymentMethod: 'paystack',
                      schoolName: 'Smart-S School',
                      supportEmail: 'support@smart-s.com',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {emailStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <EnvelopeIcon className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Sent</p>
                      <p className="text-2xl font-semibold text-gray-900">{emailStats.totalSent}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Delivered</p>
                      <p className="text-2xl font-semibold text-gray-900">{emailStats.totalDelivered}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Failed</p>
                      <p className="text-2xl font-semibold text-gray-900">{emailStats.totalFailed}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        %
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Delivery Rate</p>
                      <p className="text-2xl font-semibold text-gray-900">{emailStats.deliveryRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
    </MainLayout>
  );
};

export default EmailConfigurationPage;
