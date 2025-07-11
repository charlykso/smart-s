import toast from 'react-hot-toast';

// Custom toast helper functions with proper icons and styling
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      icon: '✅',
      style: {
        background: '#059669',
        color: '#ffffff',
        fontWeight: '600',
        border: '2px solid #10b981',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#059669',
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      icon: '❌',
      style: {
        background: '#dc2626',
        color: '#ffffff',
        fontWeight: '600',
        border: '2px solid #ef4444',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      },
      iconTheme: {
        primary: '#ffffff',
        secondary: '#dc2626',
      },
    });
  },
  
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
      },
    });
  },
};

export default showToast;
