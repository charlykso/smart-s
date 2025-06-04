import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NotificationService } from '../services/notificationService';
import type { Notification, NotificationPreferences, PaymentReminder } from '../services/notificationService';
import toast from 'react-hot-toast';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  paymentReminders: PaymentReminder[];
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

interface NotificationActions {
  // Notification management
  loadNotifications: (limit?: number, unreadOnly?: boolean) => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  
  // Payment reminders
  loadPaymentReminders: () => Promise<void>;
  createPaymentReminder: (data: any) => Promise<void>;
  sendPaymentReminder: (reminderId: string) => Promise<void>;
  
  // Preferences
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  
  // Real-time notifications
  addNotification: (notification: Notification) => void;
  removeNotification: (notificationId: string) => void;
  
  // Utility actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

interface NotificationStore extends NotificationState, NotificationActions {}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  paymentReminders: [],
  preferences: null,
  isLoading: false,
  error: null,
  lastFetch: null,
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Load notifications
      loadNotifications: async (limit = 20, unreadOnly = false) => {
        set({ isLoading: true, error: null });
        try {
          const notifications = await NotificationService.getNotifications(limit, unreadOnly);
          set({ 
            notifications, 
            isLoading: false, 
            lastFetch: new Date() 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Load unread count
      loadUnreadCount: async () => {
        try {
          const unreadCount = await NotificationService.getUnreadCount();
          set({ unreadCount });
        } catch (error) {
          // Silently handle errors to prevent console spam
          console.warn('Failed to load unread count:', error);
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId: string) => {
        try {
          await NotificationService.markAsRead(notificationId);
          const { notifications, unreadCount } = get();
          
          const updatedNotifications = notifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          );
          
          const wasUnread = notifications.find(n => n._id === notificationId && !n.read);
          const newUnreadCount = wasUnread ? Math.max(0, unreadCount - 1) : unreadCount;
          
          set({ 
            notifications: updatedNotifications, 
            unreadCount: newUnreadCount 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      // Mark all notifications as read
      markAllAsRead: async () => {
        try {
          await NotificationService.markAllAsRead();
          const { notifications } = get();
          
          const updatedNotifications = notifications.map(notification => ({
            ...notification,
            read: true,
          }));
          
          set({ 
            notifications: updatedNotifications, 
            unreadCount: 0 
          });
          toast.success('All notifications marked as read');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      // Delete notification
      deleteNotification: async (notificationId: string) => {
        try {
          await NotificationService.deleteNotification(notificationId);
          const { notifications, unreadCount } = get();
          
          const notificationToDelete = notifications.find(n => n._id === notificationId);
          const updatedNotifications = notifications.filter(n => n._id !== notificationId);
          const newUnreadCount = notificationToDelete && !notificationToDelete.read 
            ? Math.max(0, unreadCount - 1) 
            : unreadCount;
          
          set({ 
            notifications: updatedNotifications, 
            unreadCount: newUnreadCount 
          });
          toast.success('Notification deleted');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete notification';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      // Load payment reminders
      loadPaymentReminders: async () => {
        set({ isLoading: true, error: null });
        try {
          const paymentReminders = await NotificationService.getPaymentReminders();
          set({ paymentReminders, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load payment reminders';
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
        }
      },

      // Create payment reminder
      createPaymentReminder: async (data) => {
        try {
          const reminder = await NotificationService.createPaymentReminder(data);
          const { paymentReminders } = get();
          set({ paymentReminders: [...paymentReminders, reminder] });
          toast.success('Payment reminder created');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create payment reminder';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      // Send payment reminder
      sendPaymentReminder: async (reminderId: string) => {
        try {
          await NotificationService.sendPaymentReminder(reminderId);
          const { paymentReminders } = get();
          
          const updatedReminders = paymentReminders.map(reminder =>
            reminder._id === reminderId
              ? { ...reminder, sent: true, sentAt: new Date().toISOString() }
              : reminder
          );
          
          set({ paymentReminders: updatedReminders });
          toast.success('Payment reminder sent');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send payment reminder';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      // Load preferences
      loadPreferences: async () => {
        try {
          const preferences = await NotificationService.getNotificationPreferences();
          set({ preferences });
        } catch (error) {
          console.error('Failed to load notification preferences:', error);
        }
      },

      // Update preferences
      updatePreferences: async (newPreferences) => {
        try {
          const updatedPreferences = await NotificationService.updateNotificationPreferences(newPreferences);
          set({ preferences: updatedPreferences });
          toast.success('Notification preferences updated');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
          set({ error: errorMessage });
          toast.error(errorMessage);
        }
      },

      // Add notification (for real-time updates)
      addNotification: (notification: Notification) => {
        const { notifications, unreadCount } = get();
        
        // Check if notification already exists
        const exists = notifications.some(n => n._id === notification._id);
        if (exists) return;
        
        const updatedNotifications = [notification, ...notifications];
        const newUnreadCount = !notification.read ? unreadCount + 1 : unreadCount;
        
        set({ 
          notifications: updatedNotifications, 
          unreadCount: newUnreadCount 
        });

        // Show toast notification
        NotificationService.showToastNotification(notification);
        
        // Show browser notification if permission granted
        NotificationService.showBrowserNotification(notification);
      },

      // Remove notification
      removeNotification: (notificationId: string) => {
        const { notifications, unreadCount } = get();
        
        const notificationToRemove = notifications.find(n => n._id === notificationId);
        const updatedNotifications = notifications.filter(n => n._id !== notificationId);
        const newUnreadCount = notificationToRemove && !notificationToRemove.read 
          ? Math.max(0, unreadCount - 1) 
          : unreadCount;
        
        set({ 
          notifications: updatedNotifications, 
          unreadCount: newUnreadCount 
        });
      },

      // Utility actions
      clearError: () => {
        set({ error: null });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'notification-store',
      partialize: (state) => ({
        preferences: state.preferences,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

// Auto-refresh notifications every 30 seconds
let notificationInterval: NodeJS.Timeout | null = null;

export const startNotificationPolling = () => {
  if (notificationInterval) return;

  notificationInterval = setInterval(async () => {
    try {
      // Don't poll if page is hidden or document is not visible
      if (document.hidden || document.visibilityState === 'hidden') {
        return;
      }

      const store = useNotificationStore.getState();
      await store.loadUnreadCount();

      // Refresh notifications if last fetch was more than 5 minutes ago
      if (!store.lastFetch || Date.now() - store.lastFetch.getTime() > 5 * 60 * 1000) {
        await store.loadNotifications();
      }
    } catch (error) {
      console.warn('Error during notification polling:', error);
    }
  }, 30000);
};

export const stopNotificationPolling = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
};
