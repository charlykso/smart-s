import React from 'react';
import {
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import type { StudentStats } from '../../types/student';
import LoadingSpinner from '../common/LoadingSpinner';

interface StudentStatsCardsProps {
  stats: StudentStats | null;
  isLoading: boolean;
}

const StudentStatsCards: React.FC<StudentStatsCardsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <LoadingSpinner />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No statistics available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'increase' as const,
    },
    {
      title: 'Active Students',
      value: stats.activeStudents,
      icon: AcademicCapIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+8%',
      changeType: 'increase' as const,
    },
    {
      title: 'Male Students',
      value: stats.maleStudents || 0,
      icon: UserIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      percentage: stats.totalStudents > 0 ? (((stats.maleStudents || 0) / stats.totalStudents) * 100).toFixed(1) : '0.0',
    },
    {
      title: 'Female Students',
      value: stats.femaleStudents || 0,
      icon: UserIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      percentage: stats.totalStudents > 0 ? (((stats.femaleStudents || 0) / stats.totalStudents) * 100).toFixed(1) : '0.0',
    },
    {
      title: 'Day Students',
      value: stats.dayStudents || 0,
      icon: CalendarIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      percentage: stats.totalStudents > 0 ? (((stats.dayStudents || 0) / stats.totalStudents) * 100).toFixed(1) : '0.0',
    },
    {
      title: 'Boarding Students',
      value: stats.boardingStudents || 0,
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      percentage: stats.totalStudents > 0 ? (((stats.boardingStudents || 0) / stats.totalStudents) * 100).toFixed(1) : '0.0',
    },
    {
      title: 'New Enrollments',
      value: stats.newEnrollments,
      icon: ArrowTrendingUpIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+15%',
      changeType: 'increase' as const,
    },
    {
      title: 'Graduated Students',
      value: stats.graduatedStudents,
      icon: AcademicCapIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+5%',
      changeType: 'increase' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">
                      {stat.value.toLocaleString()}
                    </p>
                    {stat.percentage && (
                      <p className="ml-2 text-sm text-gray-500">
                        ({stat.percentage}%)
                      </p>
                    )}
                  </div>
                  {stat.change && (
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${
                        stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
                      }`} />
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Average Attendance</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${stats.averageAttendance}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.averageAttendance.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Average GPA</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(stats.averageGPA / 4) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.averageGPA.toFixed(2)}/4.0
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Students by Class */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Students by Class</h3>
          <div className="space-y-3">
            {stats.studentsByClass.map((classData, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {classData.className}
                </span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(classData.count / Math.max(...stats.studentsByClass.map(c => c.count))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                    {classData.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enrollment Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Trends</h3>
        <div className="space-y-4">
          {stats.enrollmentTrends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {trend.month}
              </span>
              <div className="flex items-center">
                <div className="w-40 bg-gray-200 rounded-full h-3 mr-3">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full" 
                    style={{ 
                      width: `${(trend.enrollments / Math.max(...stats.enrollmentTrends.map(t => t.enrollments))) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                  {trend.enrollments}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <UserGroupIcon className="h-5 w-5 mr-2" />
            Export Student List
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Generate Report
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentStatsCards;
