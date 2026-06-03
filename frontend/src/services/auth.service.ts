import { apiFetch } from '../api/client';

export interface LoginResponse {
  access?: string;
  refresh?: string;
  mfa_required?: boolean;
  email?: string;
}

export const authService = {
  login: async (data: Record<string, any>) => {
    return apiFetch<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  mfaVerify: async (email: string, token: string) => {
    return apiFetch<LoginResponse>('/auth/mfa-verify/', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    });
  },
  
  register: async (data: Record<string, any>) => {
    return apiFetch<any>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyEmail: async (email: string, token: string) => {
    return apiFetch<any>('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ email, token }),
    });
  },

  forgotPassword: async (email: string) => {
    return apiFetch<any>('/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (data: Record<string, any>) => {
    return apiFetch<any>('/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPrograms: async () => {
    return apiFetch<any[]>('/auth/programs/');
  },
  
  getCurrentUser: async () => {
    return apiFetch<any>('/users/me/');
  }
};
