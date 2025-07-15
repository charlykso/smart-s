import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { FeeService } from '../services/feeService';
import { bursarService } from '../services/bursarService';
import { ENV } from '../constants';

const DebugApiPage: React.FC = () => {
  const { user, token } = useAuthStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, success: boolean, data: any, error?: any) => {
    setResults(prev => [...prev, {
      test,
      success,
      data,
      error,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testFeeEndpoints = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Get all fees
    try {
      const fees = await FeeService.getFees();
      addResult('FeeService.getFees()', true, `Found ${fees.length} fees`);
    } catch (error: any) {
      addResult('FeeService.getFees()', false, null, error.message);
    }

    // Test 2: Get approved fees
    try {
      const approvedFees = await FeeService.getApprovedFees();
      addResult('FeeService.getApprovedFees()', true, `Found ${approvedFees.length} approved fees`);
    } catch (error: any) {
      addResult('FeeService.getApprovedFees()', false, null, error.message);
    }

    // Test 3: Get unapproved fees
    try {
      const unapprovedFees = await FeeService.getUnapprovedFees();
      addResult('FeeService.getUnapprovedFees()', true, `Found ${unapprovedFees.length} unapproved fees`);
    } catch (error: any) {
      addResult('FeeService.getUnapprovedFees()', false, null, error.message);
    }

    // Test 4: Bursar dashboard
    try {
      const dashboardData = await bursarService.getDashboardData();
      addResult('bursarService.getDashboardData()', true, 'Dashboard data loaded successfully');
    } catch (error: any) {
      addResult('bursarService.getDashboardData()', false, null, error.message);
    }

    // Test 5: Check payment data and school filtering
    try {
      const payments = await FeeService.getPayments();
      const paymentSchools = payments.map(p => ({
        paymentId: p._id,
        userSchool: p.user?.school?.name || 'No school',
        feeSchool: p.fee?.school?.name || 'No fee school',
        amount: p.amount
      }));
      addResult('Payment School Check', true, `Found ${payments.length} payments. Schools: ${JSON.stringify(paymentSchools.slice(0, 3))}`);
    } catch (error: any) {
      addResult('Payment School Check', false, null, error.message);
    }

    // Test 6: Check schools and terms loading
    try {
      const response = await fetch(`${baseUrl}/school/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const schools = await response.json();
        addResult('Schools Loading', true, `Found ${Array.isArray(schools) ? schools.length : 'unknown'} schools`);
      } else {
        const errorData = await response.text();
        addResult('Schools Loading', false, null, `Status: ${response.status}, Error: ${errorData}`);
      }
    } catch (error: any) {
      addResult('Schools Loading', false, null, error.message);
    }

    // Test 7: Check terms loading
    try {
      const response = await fetch(`${baseUrl}/Term/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const terms = await response.json();
        addResult('Terms Loading', true, `Found ${Array.isArray(terms) ? terms.length : 'unknown'} terms`);
      } else {
        const errorData = await response.text();
        addResult('Terms Loading', false, null, `Status: ${response.status}, Error: ${errorData}`);
      }
    } catch (error: any) {
      addResult('Terms Loading', false, null, error.message);
    }

    // Test 5: Payment reports
    try {
      const paymentReports = await bursarService.getPaymentReports();
      addResult('bursarService.getPaymentReports()', true, 'Payment reports loaded successfully');
    } catch (error: any) {
      addResult('bursarService.getPaymentReports()', false, null, error.message);
    }

    setLoading(false);
  };

  const testDirectApiCalls = async () => {
    setLoading(true);
    
    // Test direct API calls using fetch
    const baseUrl = ENV.API_BASE_URL;
    
    // Test 1: Direct fee/all call
    try {
      const response = await fetch(`${baseUrl}/fee/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Direct /fee/all', true, `Status: ${response.status}, Data: ${Array.isArray(data) ? data.length + ' items' : typeof data}`);
      } else {
        const errorData = await response.text();
        addResult('Direct /fee/all', false, null, `Status: ${response.status}, Error: ${errorData}`);
      }
    } catch (error: any) {
      addResult('Direct /fee/all', false, null, error.message);
    }

    // Test 2: Direct bursar/dashboard call
    try {
      const response = await fetch(`${baseUrl}/bursar/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addResult('Direct /bursar/dashboard', true, `Status: ${response.status}, Success: ${data.success}`);
      } else {
        const errorData = await response.text();
        addResult('Direct /bursar/dashboard', false, null, `Status: ${response.status}, Error: ${errorData}`);
      }
    } catch (error: any) {
      addResult('Direct /bursar/dashboard', false, null, error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          API Debug Page
        </h1>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Current User Info
          </h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user?.firstname} {user?.lastname}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Roles:</strong> {user?.roles?.join(', ')}</p>
            <p><strong>School:</strong> {user?.school?.name || 'No school'}</p>
            <p><strong>School ID:</strong> {user?.school?._id || 'No school ID'}</p>
            <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}</p>
            <p><strong>Token Length:</strong> {token?.length || 0}</p>
            <p><strong>API Base URL (ENV):</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</p>
            <p><strong>API Base URL (Resolved):</strong> {ENV.API_BASE_URL}</p>
            <p><strong>Is Development:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}</p>
            <p><strong>Current Window Location:</strong> {window.location.origin}</p>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            API Tests
          </h2>
          <div className="space-x-4">
            <button
              onClick={testFeeEndpoints}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Fee Service Endpoints
            </button>
            <button
              onClick={testDirectApiCalls}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Direct API Calls
            </button>
            <button
              onClick={() => setResults([])}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Test Results
          </h2>
          
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Running tests...</p>
            </div>
          )}

          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${
                    result.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {result.success ? '✅' : '❌'} {result.test}
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {result.timestamp}
                  </span>
                </div>
                
                {result.data && (
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    <strong>Result:</strong> {result.data}
                  </p>
                )}
                
                {result.error && (
                  <p className="mt-2 text-red-600 dark:text-red-400">
                    <strong>Error:</strong> {result.error}
                  </p>
                )}
              </div>
            ))}
          </div>

          {results.length === 0 && !loading && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No test results yet. Click a test button to start.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugApiPage;
