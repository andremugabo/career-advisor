import toast from 'react-hot-toast';

/**
 * Centralized Toaster Utility
 * Provides a standardized way to trigger UI notifications across the platform.
 */
export const notify = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: '#ffffff',
        color: '#146C94',
        border: '1px solid rgba(25, 167, 206, 0.2)',
      },
      iconTheme: {
        primary: '#19A7CE',
        secondary: '#ffffff',
      },
    });
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: '#ffffff',
        color: '#e11d48',
        border: '1px solid rgba(225, 29, 72, 0.2)',
      },
    });
  },
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#ffffff',
        color: '#475569',
        border: '1px solid rgba(71, 85, 105, 0.2)',
      },
    });
  },
};
