import React from 'react';

export interface StudentOverviewCardProps {
  title: string;
  totalStudents: number;
  activeStudents: number;
  newEnrollments: number;
  className?: string;
}

const StudentOverviewCard: React.FC<StudentOverviewCardProps> = ({
  title,
  totalStudents,
  activeStudents,
  newEnrollments,
  className = '',
}) => {
  const activePercentage = (activeStudents / totalStudents) * 100;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-secondary-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        {title}
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary-600">Total Students</span>
          <span className="text-2xl font-bold text-secondary-900">{totalStudents.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-green-600">Active</span>
          <span className="text-sm font-medium text-green-600">{activeStudents.toLocaleString()}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-600">New This Term</span>
          <span className="text-sm font-medium text-blue-600">+{newEnrollments}</span>
        </div>
        
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${activePercentage}%` }}
          ></div>
        </div>
        
        <div className="text-center text-xs text-secondary-500">
          {activePercentage.toFixed(1)}% Active Students
        </div>
      </div>
    </div>
  );
};

export default StudentOverviewCard;
