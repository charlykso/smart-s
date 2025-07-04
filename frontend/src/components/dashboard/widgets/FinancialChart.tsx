import React from 'react';

export interface FinancialChartProps {
  title: string;
  data: any[];
  type?: 'line' | 'bar' | 'pie';
  className?: string;
}

const FinancialChart: React.FC<FinancialChartProps> = ({
  title,
  data,
  type = 'line',
  className = '',
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900 border border-secondary-200 dark:border-gray-700 p-6 transition-colors duration-200 ${className}`}>
      <h3 className="text-lg font-semibold text-secondary-900 mb-4">
        {title}
      </h3>
      <div className="h-64 flex items-center justify-center bg-secondary-50 rounded-lg">
        <p className="text-secondary-500">Chart implementation coming soon...</p>
      </div>
    </div>
  );
};

export default FinancialChart;
