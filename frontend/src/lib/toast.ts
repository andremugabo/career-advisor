import toast from 'react-hot-toast';
import { createElement } from 'react';
import { Info } from 'lucide-react';

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
      icon: createElement(Info, { size: 18, color: '#475569' }),
      style: {
        background: '#ffffff',
        color: '#475569',
        border: '1px solid rgba(71, 85, 105, 0.2)',
      },
    });
  },
};
