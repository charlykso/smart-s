import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ROUTES } from './constants';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UserManagementPage from './pages/users/UserManagementPage';
import UserProfilePage from './pages/users/UserProfilePage';
import SchoolManagementPage from './pages/schools/SchoolManagementPage';
import FeeManagementPage from './pages/fees/FeeManagementPage';
import StudentFeePaymentPage from './pages/student/StudentFeePaymentPage';
import CashPaymentPage from './pages/bursar/CashPaymentPage';
import EmailConfigurationPage from './components/email/EmailConfigurationPage';
import PaymentConfigurationPage from './pages/admin/PaymentConfigurationPage';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import SystemOverviewPage from './pages/admin/SystemOverviewPage';
import FinancialOverviewPage from './pages/admin/FinancialOverviewPage';
import SessionsManagementPage from './pages/admin/SessionsManagementPage';
import TermsManagementPage from './pages/admin/TermsManagementPage';
import ClassArmsManagementPage from './pages/admin/ClassArmsManagementPage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';
import AuditPage from './pages/admin/AuditPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import PaymentReminderSystem from './components/notifications/PaymentReminderSystem';
import ThemeProvider from './components/providers/ThemeProvider';

function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage and validate tokens
    initializeAuth();

    // Global error handlers to prevent unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Prevent the default browser behavior (console error)
      event.preventDefault();

      const errorMessage = event.reason?.message || String(event.reason);

      // Filter out common browser extension and async listener errors
      const ignoredErrors = [
        'message channel closed',
        'listener indicated an asynchronous response',
        'Extension context invalidated',
        'chrome-extension://',
        'moz-extension://',
        'safari-extension://',
        'Page is being unloaded'
      ];

      const shouldIgnore = ignoredErrors.some(ignored =>
        errorMessage.toLowerCase().includes(ignored.toLowerCase())
      );

      if (shouldIgnore) {
        // Silently ignore these errors as they're usually from browser extensions
        return;
      }

      // Log the error for debugging but don't show to user unless critical
      console.warn('Unhandled promise rejection:', event.reason);

      // Only show user-facing errors for critical issues
      if (errorMessage.includes('Network Error') ||
          errorMessage.includes('timeout')) {
        console.error('Network error detected:', event.reason);
      }
    };

    const handleError = (event: ErrorEvent) => {
      // Handle general JavaScript errors
      console.warn('JavaScript error:', event.error);
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [initializeAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="/home"
            element={<LandingPage />}
          />
          <Route
            path={ROUTES.LOGIN}
            element={
              isAuthenticated ? (
                <Navigate to={ROUTES.DASHBOARD} replace />
              ) : (
                <LoginPage />
              )
            }
          />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              isAuthenticated ? (
                <DashboardPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.USERS}
            element={
              isAuthenticated ? (
                <UserManagementPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              isAuthenticated ? (
                <UserProfilePage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.SCHOOLS}
            element={
              isAuthenticated ? (
                <SchoolManagementPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.FEES}
            element={
              isAuthenticated ? (
                <FeeManagementPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path="/student/fees"
            element={
              isAuthenticated ? (
                <StudentFeePaymentPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path="/bursar/cash-payments"
            element={
              isAuthenticated ? (
                <CashPaymentPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.EMAIL_CONFIG}
            element={
              isAuthenticated ? (
                <EmailConfigurationPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.PAYMENT_CONFIG}
            element={
              isAuthenticated ? (
                <PaymentConfigurationPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.STUDENT_MANAGEMENT}
            element={
              <ProtectedRoute requiredRoles={['Admin', 'Proprietor', 'ICT_administrator']}>
                <StudentManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/system-overview"
            element={
              isAuthenticated ? (
                <SystemOverviewPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path="/admin/financial-overview"
            element={
              isAuthenticated ? (
                <FinancialOverviewPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.SESSIONS}
            element={
              isAuthenticated ? (
                <SessionsManagementPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.TERMS}
            element={
              isAuthenticated ? (
                <TermsManagementPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.CLASS_ARMS}
            element={
              isAuthenticated ? (
                <ClassArmsManagementPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.REPORTS}
            element={
              isAuthenticated ? (
                <ReportsPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              isAuthenticated ? (
                <SettingsPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.AUDIT}
            element={
              isAuthenticated ? (
                <AuditPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path={ROUTES.NOTIFICATIONS}
            element={
              isAuthenticated ? (
                <NotificationsPage />
              ) : (
                <Navigate to={ROUTES.LOGIN} replace />
              )
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN}
                replace
              />
            }
          />
        </Routes>

        {/* Payment Reminder System - runs in background for students */}
        {isAuthenticated && <PaymentReminderSystem />}

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
