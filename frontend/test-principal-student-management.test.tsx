// Test script to verify Principal Student Management functionality
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../src/components/providers/ThemeProvider';
import StudentManagementPage from '../src/pages/principal/StudentManagementPage';

// Mock the stores
jest.mock('../src/store/studentManagementStore', () => ({
  useStudentManagementStore: () => ({
    students: [
      {
        _id: '1',
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@student.com',
        regNo: 'REG001',
        academicInfo: { academicStatus: 'active' },
        createdAt: '2024-01-15T00:00:00.000Z'
      }
    ],
    isLoading: false,
    error: null,
    loadStudents: jest.fn()
  })
}));

describe('Principal Student Management', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          {component}
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  test('renders student management page without errors', () => {
    renderWithProviders(<StudentManagementPage />);
    
    expect(screen.getByText('Student Management')).toBeInTheDocument();
    expect(screen.getByText('Manage students for your school')).toBeInTheDocument();
  });

  test('displays navigation tabs', () => {
    renderWithProviders(<StudentManagementPage />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Create Student')).toBeInTheDocument();
    expect(screen.getByText('Bulk Upload')).toBeInTheDocument();
    expect(screen.getByText('Manage Students')).toBeInTheDocument();
  });

  test('shows student statistics', () => {
    renderWithProviders(<StudentManagementPage />);
    
    expect(screen.getByText('Total Students')).toBeInTheDocument();
    expect(screen.getByText('Active Students')).toBeInTheDocument();
    expect(screen.getByText('New This Month')).toBeInTheDocument();
  });
});
