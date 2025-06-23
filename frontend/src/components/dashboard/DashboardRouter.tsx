import React from 'react';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types/roles';

// Import role-specific dashboard components
import AdminDashboard from './roles/AdminDashboard';
import ICTAdminSchoolManagement from './roles/ICTAdminSchoolManagement';
import ProprietorDashboard from './roles/ProprietorDashboard';
import PrincipalDashboard from './roles/PrincipalDashboard';
import HeadteacherDashboard from './roles/HeadteacherDashboard';
import BursarDashboard from './roles/BursarDashboard';
import AuditorDashboard from './roles/AuditorDashboard';
import StudentDashboard from './roles/StudentDashboard';
import ParentDashboard from './roles/ParentDashboard';

// Fallback dashboard for unknown roles
import DefaultDashboard from './DefaultDashboard';

interface DashboardRouterProps {
  className?: string;
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ className }) => {
  const { user } = useAuthStore();

  // Get the primary role (first role in the array)
  const primaryRole = user?.roles?.[0] as UserRole;

  // Render the appropriate dashboard based on the user's primary role
  const renderDashboard = () => {
    switch (primaryRole) {
      case 'Admin':
        return <AdminDashboard />;      case 'ICT_administrator':
        return <ICTAdminSchoolManagement />;
      case 'Proprietor':
        return <ProprietorDashboard />;
      case 'Principal':
        return <PrincipalDashboard />;
      case 'Headteacher':
        return <HeadteacherDashboard />;
      case 'Bursar':
        return <BursarDashboard />;
      case 'Auditor':
        return <AuditorDashboard />;
      case 'Student':
        return <StudentDashboard />;
      case 'Parent':
        return <ParentDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div className={className}>
      {renderDashboard()}
    </div>
  );
};

export default DashboardRouter;
