import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { ROUTES } from './constants';

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
import PaymentReminderSystem from './components/notifications/PaymentReminderSystem';

function App() {
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage and validate tokens
    initializeAuth();
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
    <Router>
      <div className="min-h-screen">
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
              isAuthenticated ? (
                <StudentManagementPage />
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
  );
}

export default App;
