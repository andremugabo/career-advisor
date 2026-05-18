import { apiFetch } from '../api/client';

export interface LoginResponse {
  access: string;
  refresh: string;
}

export const authService = {
  login: async (data: Record<string, any>) => {
    return apiFetch<LoginResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  register: async (data: Record<string, any>) => {
    return apiFetch<any>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
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
  }
};
