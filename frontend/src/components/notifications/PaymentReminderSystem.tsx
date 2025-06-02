import React, { useEffect, useState } from 'react';
import {
  ClockIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useNotificationStore } from '../../store/notificationStore';
import { useFeeStore } from '../../store/feeStore';
import { useAuthStore } from '../../store/authStore';
import { NotificationService } from '../../services/notificationService';
import { FeeService } from '../../services/feeService';

interface PaymentReminderSystemProps {
  className?: string;
}

const PaymentReminderSystem: React.FC<PaymentReminderSystemProps> = ({ className = '' }) => {
  const { user } = useAuthStore();
  const { fees, loadApprovedFees } = useFeeStore();
  const { addNotification } = useNotificationStore();
  const [reminderChecked, setReminderChecked] = useState(false);

  useEffect(() => {
    if (user && user.roles?.includes('Student') && !reminderChecked) {
      checkPaymentReminders();
      setReminderChecked(true);
    }
  }, [user, reminderChecked]);

  const checkPaymentReminders = async () => {
    try {
      await loadApprovedFees();
      
      // Check for fees that need reminders
      const today = new Date();
      const reminderThresholds = {
        dueSoon: 7, // 7 days before due date
        urgent: 3,  // 3 days before due date
        overdue: 0, // Past due date
      };

      fees.forEach(fee => {
        if (!fee.isApproved || !fee.isActive) return;

        // Calculate due date (assuming fees have a due date or we calculate based on term)
        const dueDate = calculateFeeDueDate(fee);
        if (!dueDate) return;

        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Create appropriate notifications based on due date
        if (daysUntilDue < 0) {
          // Overdue
          createOverdueNotification(fee, Math.abs(daysUntilDue), dueDate);
        } else if (daysUntilDue <= reminderThresholds.urgent) {
          // Urgent (3 days or less)
          createUrgentNotification(fee, daysUntilDue, dueDate);
        } else if (daysUntilDue <= reminderThresholds.dueSoon) {
          // Due soon (7 days or less)
          createDueSoonNotification(fee, daysUntilDue, dueDate);
        }
      });
    } catch (error) {
      console.error('Error checking payment reminders:', error);
    }
  };

  const calculateFeeDueDate = (fee: any): Date | null => {
    // If fee has explicit due date
    if (fee.dueDate) {
      return new Date(fee.dueDate);
    }

    // Calculate based on term end date (assuming 30 days before term end)
    if (fee.term && typeof fee.term === 'object' && fee.term.endDate) {
      const termEndDate = new Date(fee.term.endDate);
      const dueDate = new Date(termEndDate);
      dueDate.setDate(dueDate.getDate() - 30); // 30 days before term end
      return dueDate;
    }

    // Default: 60 days from fee creation
    if (fee.createdAt) {
      const createdDate = new Date(fee.createdAt);
      const dueDate = new Date(createdDate);
      dueDate.setDate(dueDate.getDate() + 60);
      return dueDate;
    }

    return null;
  };

  const createDueSoonNotification = async (fee: any, daysUntilDue: number, dueDate: Date) => {
    try {
      await NotificationService.notifyFeeDueSoon({
        userId: user!._id,
        feeId: fee._id,
        feeName: fee.name,
        amount: fee.amount,
        dueDate: dueDate.toISOString(),
        daysUntilDue,
      });
    } catch (error) {
      console.error('Error creating due soon notification:', error);
    }
  };

  const createUrgentNotification = async (fee: any, daysUntilDue: number, dueDate: Date) => {
    try {
      await NotificationService.notifyFeeDueSoon({
        userId: user!._id,
        feeId: fee._id,
        feeName: fee.name,
        amount: fee.amount,
        dueDate: dueDate.toISOString(),
        daysUntilDue,
      });

      // Also create a local urgent notification
      const urgentNotification = {
        _id: `urgent-${fee._id}-${Date.now()}`,
        title: 'Urgent: Fee Payment Due Soon!',
        message: `Your ${fee.name} payment of ₦${fee.amount.toLocaleString()} is due in ${daysUntilDue} day(s). Please pay immediately to avoid penalties.`,
        type: 'payment_overdue' as const,
        timestamp: new Date().toISOString(),
        read: false,
        userId: user!._id,
        actionUrl: '/student/fees',
        metadata: {
          feeId: fee._id,
          amount: fee.amount,
          dueDate: dueDate.toISOString(),
          reminderType: 'urgent' as const,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNotification(urgentNotification);
    } catch (error) {
      console.error('Error creating urgent notification:', error);
    }
  };

  const createOverdueNotification = async (fee: any, daysOverdue: number, dueDate: Date) => {
    try {
      await NotificationService.notifyFeeOverdue({
        userId: user!._id,
        feeId: fee._id,
        feeName: fee.name,
        amount: fee.amount,
        dueDate: dueDate.toISOString(),
        daysOverdue,
      });

      // Also create a local overdue notification
      const overdueNotification = {
        _id: `overdue-${fee._id}-${Date.now()}`,
        title: 'OVERDUE: Fee Payment Required!',
        message: `Your ${fee.name} payment of ₦${fee.amount.toLocaleString()} is ${daysOverdue} day(s) overdue. Pay now to avoid additional penalties.`,
        type: 'payment_overdue' as const,
        timestamp: new Date().toISOString(),
        read: false,
        userId: user!._id,
        actionUrl: '/student/fees',
        metadata: {
          feeId: fee._id,
          amount: fee.amount,
          dueDate: dueDate.toISOString(),
          reminderType: 'overdue' as const,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNotification(overdueNotification);
    } catch (error) {
      console.error('Error creating overdue notification:', error);
    }
  };

  // Auto-refresh reminders every hour
  useEffect(() => {
    if (!user?.roles?.includes('Student')) return;

    const interval = setInterval(() => {
      setReminderChecked(false); // Reset to trigger new check
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, [user]);

  // Component doesn't render anything visible - it's a background service
  return null;
};

export default PaymentReminderSystem;

// Utility component for displaying payment reminder alerts
export const PaymentReminderAlert: React.FC<{
  fee: any;
  daysUntilDue: number;
  isOverdue: boolean;
  onPayNow: () => void;
}> = ({ fee, daysUntilDue, isOverdue, onPayNow }) => {
  const getAlertStyle = () => {
    if (isOverdue) {
      return 'bg-red-50 border-red-200 text-red-800';
    } else if (daysUntilDue <= 3) {
      return 'bg-orange-50 border-orange-200 text-orange-800';
    } else {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getIcon = () => {
    if (isOverdue) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    } else if (daysUntilDue <= 3) {
      return <ClockIcon className="h-5 w-5 text-orange-600" />;
    } else {
      return <BellIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getMessage = () => {
    if (isOverdue) {
      return `Payment is ${Math.abs(daysUntilDue)} day(s) overdue. Pay now to avoid penalties.`;
    } else if (daysUntilDue === 0) {
      return 'Payment is due today!';
    } else if (daysUntilDue === 1) {
      return 'Payment is due tomorrow!';
    } else {
      return `Payment is due in ${daysUntilDue} day(s).`;
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getAlertStyle()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">
            {isOverdue ? 'Payment Overdue' : 'Payment Reminder'}
          </h3>
          <div className="mt-1 text-sm">
            <p>{getMessage()}</p>
            <div className="mt-2 flex items-center space-x-4 text-xs">
              <span className="flex items-center">
                <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                {FeeService.formatAmount(fee.amount)}
              </span>
              <span className="flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {fee.name}
              </span>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={onPayNow}
              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isOverdue
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : daysUntilDue <= 3
                  ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                  : 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
              }`}
            >
              Pay Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
