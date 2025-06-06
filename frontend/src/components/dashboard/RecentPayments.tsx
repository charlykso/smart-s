import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';

interface Payment {
  id: string;
  studentName: string;
  feeName: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  date: string;
  method: string;
}

const RecentPayments: React.FC = () => {
  // Mock data - in real app, this would come from API
  const recentPayments: Payment[] = [
    {
      id: '1',
      studentName: 'John Doe',
      feeName: 'School Fees',
      amount: 45000,
      status: 'success',
      date: '2024-01-15',
      method: 'Paystack',
    },
    {
      id: '2',
      studentName: 'Jane Smith',
      feeName: 'Exam Fees',
      amount: 5000,
      status: 'pending',
      date: '2024-01-14',
      method: 'Bank Transfer',
    },
    {
      id: '3',
      studentName: 'Mike Johnson',
      feeName: 'Sports Fees',
      amount: 8000,
      status: 'success',
      date: '2024-01-13',
      method: 'Flutterwave',
    },
    {
      id: '4',
      studentName: 'Sarah Wilson',
      feeName: 'Library Fees',
      amount: 2500,
      status: 'failed',
      date: '2024-01-12',
      method: 'Paystack',
    },
    {
      id: '5',
      studentName: 'David Brown',
      feeName: 'School Fees',
      amount: 45000,
      status: 'success',
      date: '2024-01-11',
      method: 'Cash',
    },
  ];

  const getStatusBadge = (status: Payment['status']) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    
    switch (status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Payments
          </h3>
          <button className="text-sm text-primary-600 hover:text-primary-500">
            View all
          </button>
        </div>
        
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {recentPayments.map((payment) => (
              <li key={payment.id} className="py-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {payment.studentName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {payment.feeName} • {payment.method}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formatAmount(payment.amount)}
                    </p>
                    <span className={getStatusBadge(payment.status)}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <p className="text-xs text-gray-500">
                      {formatDate(payment.date)}
                    </p>
                    <button className="text-gray-400 hover:text-gray-500">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RecentPayments;
