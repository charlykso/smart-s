import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import DashboardRouter from '../../components/dashboard/DashboardRouter';

const DashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <DashboardRouter />
    </MainLayout>
  );
};

export default DashboardPage;
