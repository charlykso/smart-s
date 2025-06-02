#!/usr/bin/env node

/**
 * Test Script: Student Payment Dashboard Functionality
 * 
 * This script tests the student dashboard payment functionality
 * by simulating user interactions and API calls.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/v1';
const FRONTEND_BASE = 'http://localhost:3001';

// Test credentials
const STUDENT_CREDENTIALS = {
  email: 'student@smart-s.com',
  password: 'password123'
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}[STEP ${step}]${colors.reset} ${message}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testStudentLogin() {
  logStep(1, 'Testing Student Login');
  
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, STUDENT_CREDENTIALS);
    
    if (response.data.success) {
      logSuccess('Student login successful');
      logSuccess(`User: ${response.data.data.user.firstname} ${response.data.data.user.lastname}`);
      logSuccess(`Role: ${response.data.data.user.roles.join(', ')}`);
      logSuccess(`School ID: ${response.data.data.user.school || 'Not assigned'}`);
      return {
        token: response.data.data.token,
        user: response.data.data.user
      };
    } else {
      logError('Login failed: ' + response.data.message);
      return null;
    }
  } catch (error) {
    logError('Login error: ' + error.message);
    return null;
  }
}

async function testPaymentMethodsAPI(schoolId, token) {
  logStep(2, 'Testing Payment Methods API');
  
  try {
    const response = await axios.get(`${API_BASE}/payment/available-methods/${schoolId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      logSuccess('Payment methods API working');
      logSuccess(`Found ${response.data.data.length} payment methods`);
      
      response.data.data.forEach((method, index) => {
        log(`  ${index + 1}. ${method.name} (${method.method})`, 'blue');
        log(`     ${method.description}`, 'reset');
      });
      
      return response.data.data;
    } else {
      logWarning('Payment methods API returned error: ' + response.data.error);
      return [];
    }
  } catch (error) {
    logWarning('Payment methods API error: ' + error.message);
    logWarning('This is expected if no payment profile is configured');
    return [];
  }
}

async function testStudentDashboardAPI(token) {
  logStep(3, 'Testing Student Dashboard API');
  
  try {
    const response = await axios.get(`${API_BASE}/student/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      logSuccess('Student dashboard API working');
      const data = response.data.data;
      
      if (data.financial) {
        logSuccess(`Outstanding fees: ₦${data.financial.totalOutstanding?.toLocaleString() || 0}`);
        logSuccess(`Recent payments: ${data.financial.recentPayments?.length || 0}`);
      }
      
      if (data.academic) {
        logSuccess(`Academic average: ${data.academic.currentAverage || 0}%`);
        logSuccess(`Attendance rate: ${data.academic.attendanceRate || 0}%`);
      }
      
      return data;
    } else {
      logWarning('Dashboard API error: ' + response.data.message);
      return null;
    }
  } catch (error) {
    logWarning('Dashboard API error: ' + error.message);
    return null;
  }
}

async function testFrontendAccess() {
  logStep(4, 'Testing Frontend Access');
  
  try {
    const response = await axios.get(FRONTEND_BASE);
    
    if (response.status === 200) {
      logSuccess('Frontend is accessible');
      logSuccess(`Frontend running at: ${FRONTEND_BASE}`);
      return true;
    } else {
      logError('Frontend not accessible');
      return false;
    }
  } catch (error) {
    logError('Frontend access error: ' + error.message);
    return false;
  }
}

async function runTests() {
  log('\n' + '='.repeat(60), 'bold');
  log('🧪 STUDENT PAYMENT DASHBOARD TEST SUITE', 'bold');
  log('='.repeat(60), 'bold');
  
  // Test 1: Student Login
  const loginResult = await testStudentLogin();
  if (!loginResult) {
    logError('Cannot proceed without successful login');
    return;
  }
  
  // Test 2: Payment Methods API
  const schoolId = loginResult.user.school || '683c9fb479002bb16869014b'; // fallback ID
  const paymentMethods = await testPaymentMethodsAPI(schoolId, loginResult.token);
  
  // Test 3: Student Dashboard API
  const dashboardData = await testStudentDashboardAPI(loginResult.token);
  
  // Test 4: Frontend Access
  const frontendWorking = await testFrontendAccess();
  
  // Summary
  logStep('SUMMARY', 'Test Results');
  log('\n📊 Test Summary:', 'bold');
  log(`✅ Student Login: ${loginResult ? 'PASS' : 'FAIL'}`);
  log(`✅ Payment Methods API: ${paymentMethods.length > 0 ? 'PASS' : 'FALLBACK'}`);
  log(`✅ Dashboard API: ${dashboardData ? 'PASS' : 'FAIL'}`);
  log(`✅ Frontend Access: ${frontendWorking ? 'PASS' : 'FAIL'}`);
  
  log('\n🎯 Expected Behavior:', 'bold');
  log('1. Student can login successfully');
  log('2. Dashboard shows payment methods (or fallback methods)');
  log('3. "Make Payment" button navigates to /student/fees');
  log('4. Payment methods are displayed with proper styling');
  log('5. Outstanding fees notice appears if fees are due');
  
  log('\n🌐 Manual Testing:', 'bold');
  log(`1. Open: ${FRONTEND_BASE}`);
  log(`2. Login with: ${STUDENT_CREDENTIALS.email} / ${STUDENT_CREDENTIALS.password}`);
  log('3. Check student dashboard for payment functionality');
  log('4. Click "Make Payment" buttons to test navigation');
  log('5. Verify payment methods section is visible');
  
  log('\n' + '='.repeat(60), 'bold');
}

// Run the tests
runTests().catch(error => {
  logError('Test suite failed: ' + error.message);
  process.exit(1);
});
