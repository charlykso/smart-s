import { ApiService } from './api';
import { API_ENDPOINTS } from '../constants';
import { EmailService } from './emailService';
import toast from 'react-hot-toast';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'payment_reminder' | 'payment_overdue';
  timestamp: string;
  read: boolean;
  userId: string;
  actionUrl?: string;
  metadata?: {
    feeId?: string;
    paymentId?: string;
    amount?: number;
    dueDate?: string;
    reminderType?: 'due_soon' | 'overdue' | 'payment_success' | 'payment_failed';
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReminder {
  _id: string;
  user: string;
  fee: string;
  reminderType: 'due_soon' | 'overdue' | 'final_notice';
  scheduledDate: string;
  sent: boolean;
  sentAt?: string;
  emailSent: boolean;
  smsSent: boolean;
  inAppSent: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  _id: string;
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  paymentReminders: boolean;
  systemAnnouncements: boolean;
  feeUpdates: boolean;
  paymentConfirmations: boolean;
  overdueNotices: boolean;
}

export class NotificationService {
  // Get user notifications
  static async getNotifications(limit: number = 20, unreadOnly: boolean = false): Promise<Notification[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (unreadOnly) params.append('unread_only', 'true');
    
    const response = await ApiService.get<Notification[]>(
      `${API_ENDPOINTS.NOTIFICATIONS.ALL}?${params.toString()}`
    );
    return response || [];
  }

  // Get unread notification count
  static async getUnreadCount(): Promise<number> {
    const response = await ApiService.get<{ count: number }>('/notification/unread-count');
    return response?.count || 0;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<void> {
    await ApiService.post(`/notification/${notificationId}/mark-read`);
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<void> {
    await ApiService.post('/notification/mark-all-read');
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    await ApiService.delete(`/notification/${notificationId}`);
  }

  // Get payment reminders for user
  static async getPaymentReminders(): Promise<PaymentReminder[]> {
    const response = await ApiService.get<PaymentReminder[]>('/notification/payment-reminders');
    return response || [];
  }

  // Create payment reminder notification
  static async createPaymentReminder(data: {
    userId: string;
    feeId: string;
    reminderType: 'due_soon' | 'overdue' | 'final_notice';
    scheduledDate?: string;
  }): Promise<PaymentReminder> {
    const response = await ApiService.post<PaymentReminder>('/notification/payment-reminder', data);
    if (!response) {
      throw new Error('Failed to create payment reminder');
    }
    return response;
  }

  // Send payment reminder
  static async sendPaymentReminder(reminderId: string): Promise<void> {
    await ApiService.post(`/notification/payment-reminder/${reminderId}/send`);
  }

  // Get notification preferences
  static async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await ApiService.get<NotificationPreferences>('/notification/preferences');
    if (!response) {
      throw new Error('Failed to get notification preferences');
    }
    return response;
  }

  // Update notification preferences
  static async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await ApiService.put<NotificationPreferences>('/notification/preferences', preferences);
    if (!response) {
      throw new Error('Failed to update notification preferences');
    }
    return response;
  }

  // Create system notification
  static async createSystemNotification(data: {
    title: string;
    message: string;
    type: Notification['type'];
    userId?: string;
    userRole?: string;
    actionUrl?: string;
    metadata?: any;
  }): Promise<Notification> {
    const response = await ApiService.post<Notification>('/notification/system', data);
    if (!response) {
      throw new Error('Failed to create system notification');
    }
    return response;
  }

  // Send bulk notifications
  static async sendBulkNotifications(data: {
    title: string;
    message: string;
    type: Notification['type'];
    userIds?: string[];
    userRoles?: string[];
    schoolIds?: string[];
    actionUrl?: string;
    metadata?: any;
  }): Promise<{ sent: number; failed: number }> {
    const response = await ApiService.post<{ sent: number; failed: number }>('/notification/bulk', data);
    if (!response) {
      throw new Error('Failed to send bulk notifications');
    }
    return response;
  }

  // Payment-specific notification methods with email integration
  static async notifyPaymentSuccess(data: {
    userId: string;
    paymentId: string;
    feeId: string;
    amount: number;
    userEmail?: string;
    userName?: string;
    feeName?: string;
    transactionRef?: string;
    paymentMethod?: string;
  }): Promise<void> {
    // Create in-app notification
    await this.createSystemNotification({
      title: 'Payment Successful',
      message: `Your payment of ₦${data.amount.toLocaleString()} has been processed successfully.`,
      type: 'success',
      userId: data.userId,
      actionUrl: '/student/fees',
      metadata: {
        paymentId: data.paymentId,
        feeId: data.feeId,
        amount: data.amount,
        reminderType: 'payment_success',
      },
    });

    // Send email notification if email is provided
    if (data.userEmail && data.userName && data.feeName && data.transactionRef) {
      try {
        await EmailService.sendPaymentSuccessEmail({
          recipientEmail: data.userEmail,
          studentName: data.userName,
          regNo: '', // TODO: Get from user data
          feeName: data.feeName,
          amount: data.amount,
          transactionRef: data.transactionRef,
          paymentDate: new Date().toISOString(),
          paymentMethod: data.paymentMethod || 'online',
          schoolName: 'Smart-S School',
        });
      } catch (error) {
        console.error('Failed to send payment success email:', error);
      }
    }
  }

  static async notifyPaymentFailed(data: {
    userId: string;
    feeId: string;
    amount: number;
    reason?: string;
  }): Promise<void> {
    await this.createSystemNotification({
      title: 'Payment Failed',
      message: `Your payment of ₦${data.amount.toLocaleString()} could not be processed. ${data.reason || 'Please try again.'}`,
      type: 'error',
      userId: data.userId,
      actionUrl: '/student/fees',
      metadata: {
        feeId: data.feeId,
        amount: data.amount,
        reminderType: 'payment_failed',
        reason: data.reason,
      },
    });
  }

  static async notifyFeeDueSoon(data: {
    userId: string;
    feeId: string;
    feeName: string;
    amount: number;
    dueDate: string;
    daysUntilDue: number;
    userEmail?: string;
    userName?: string;
    regNo?: string;
  }): Promise<void> {
    // Create in-app notification
    await this.createSystemNotification({
      title: 'Fee Payment Due Soon',
      message: `Your ${data.feeName} payment of ₦${data.amount.toLocaleString()} is due in ${data.daysUntilDue} day(s). Due date: ${new Date(data.dueDate).toLocaleDateString()}.`,
      type: 'warning',
      userId: data.userId,
      actionUrl: '/student/fees',
      metadata: {
        feeId: data.feeId,
        amount: data.amount,
        dueDate: data.dueDate,
        reminderType: 'due_soon',
      },
    });

    // Send email reminder if email is provided
    if (data.userEmail && data.userName) {
      try {
        await EmailService.sendPaymentReminderEmail({
          recipientEmail: data.userEmail,
          studentName: data.userName,
          regNo: data.regNo || '',
          feeName: data.feeName,
          amount: data.amount,
          dueDate: data.dueDate,
          daysUntilDue: data.daysUntilDue,
          isOverdue: false,
          schoolName: 'Smart-S School',
          paymentUrl: `${window.location.origin}/student/fees`,
        });
      } catch (error) {
        console.error('Failed to send payment reminder email:', error);
      }
    }
  }

  static async notifyFeeOverdue(data: {
    userId: string;
    feeId: string;
    feeName: string;
    amount: number;
    dueDate: string;
    daysOverdue: number;
    userEmail?: string;
    userName?: string;
    regNo?: string;
  }): Promise<void> {
    // Create in-app notification
    await this.createSystemNotification({
      title: 'Fee Payment Overdue',
      message: `Your ${data.feeName} payment of ₦${data.amount.toLocaleString()} is ${data.daysOverdue} day(s) overdue. Please make payment immediately to avoid penalties.`,
      type: 'error',
      userId: data.userId,
      actionUrl: '/student/fees',
      metadata: {
        feeId: data.feeId,
        amount: data.amount,
        dueDate: data.dueDate,
        reminderType: 'overdue',
      },
    });

    // Send urgent email reminder if email is provided
    if (data.userEmail && data.userName) {
      try {
        await EmailService.sendPaymentReminderEmail({
          recipientEmail: data.userEmail,
          studentName: data.userName,
          regNo: data.regNo || '',
          feeName: data.feeName,
          amount: data.amount,
          dueDate: data.dueDate,
          daysUntilDue: -data.daysOverdue, // Negative for overdue
          isOverdue: true,
          schoolName: 'Smart-S School',
          paymentUrl: `${window.location.origin}/student/fees`,
        });
      } catch (error) {
        console.error('Failed to send overdue payment email:', error);
      }
    }
  }

  static async notifyFeeApproved(data: {
    userId: string;
    feeId: string;
    feeName: string;
    amount: number;
    userEmail?: string;
    userName?: string;
    regNo?: string;
    termName?: string;
  }): Promise<void> {
    // Create in-app notification
    await this.createSystemNotification({
      title: 'New Fee Available',
      message: `A new fee "${data.feeName}" of ₦${data.amount.toLocaleString()} has been approved and is now available for payment.`,
      type: 'info',
      userId: data.userId,
      actionUrl: '/student/fees',
      metadata: {
        feeId: data.feeId,
        amount: data.amount,
        reminderType: 'fee_approved',
      },
    });

    // Send email notification if email is provided
    if (data.userEmail && data.userName) {
      try {
        await EmailService.sendFeeApprovalEmail({
          recipientEmail: data.userEmail,
          studentName: data.userName,
          regNo: data.regNo || '',
          feeName: data.feeName,
          amount: data.amount,
          termName: data.termName || 'Current Term',
          schoolName: 'Smart-S School',
          paymentUrl: `${window.location.origin}/student/fees`,
        });
      } catch (error) {
        console.error('Failed to send fee approval email:', error);
      }
    }
  }

  // Real-time notification helpers
  static showToastNotification(notification: Notification): void {
    const message = `${notification.title}: ${notification.message}`;
    
    switch (notification.type) {
      case 'success':
      case 'payment_reminder':
        toast.success(message);
        break;
      case 'warning':
        toast(message, { icon: '⚠️' });
        break;
      case 'error':
      case 'payment_overdue':
        toast.error(message);
        break;
      default:
        toast(message);
    }
  }

  // Browser notification (if permission granted)
  static async showBrowserNotification(notification: Notification): Promise<void> {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: notification._id,
          requireInteraction: notification.type === 'error' || notification.type === 'payment_overdue',
        });

        browserNotification.onclick = () => {
          try {
            window.focus();
            if (notification.actionUrl) {
              window.location.href = notification.actionUrl;
            }
            browserNotification.close();
          } catch (error) {
            console.warn('Error handling notification click:', error);
          }
        };

        browserNotification.onerror = (error) => {
          console.warn('Browser notification error:', error);
        };

        // Auto-close after 5 seconds for non-critical notifications
        if (notification.type !== 'error' && notification.type !== 'payment_overdue') {
          setTimeout(() => {
            try {
              browserNotification.close();
            } catch (error) {
              console.warn('Error closing notification:', error);
            }
          }, 5000);
        }
      }
    } catch (error) {
      console.warn('Failed to show browser notification:', error);
    }
  }

  // Request browser notification permission
  static async requestNotificationPermission(): Promise<NotificationPermission> {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission;
      }
      return 'denied';
    } catch (error) {
      console.warn('Failed to request notification permission:', error);
      return 'denied';
    }
  }

  // Utility methods
  static getNotificationIcon(type: Notification['type']): string {
    const iconMap = {
      info: '📢',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      payment_reminder: '💰',
      payment_overdue: '🚨',
    };
    return iconMap[type] || '📢';
  }

  static getNotificationColor(type: Notification['type']): string {
    const colorMap = {
      info: 'text-blue-600 bg-blue-100',
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      payment_reminder: 'text-purple-600 bg-purple-100',
      payment_overdue: 'text-red-600 bg-red-100',
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  }

  static formatNotificationTime(timestamp: string): string {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  }
}
