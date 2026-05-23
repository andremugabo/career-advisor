import { apiFetch } from '../api/client';
import { PaginatedResponse, User } from '../types';

export const adminService = {
  getUsers: async (page = 1) => {
    return apiFetch<PaginatedResponse<User>>(`/users/?page=${page}`);
  },
  
  updateUserRole: async (userId: number | string, newRole: string) => {
    return apiFetch<User>(`/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole })
    });
  },

  toggleUserActive: async (userId: number | string, isActive: boolean) => {
    return apiFetch<User>(`/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: !isActive })
    });
  },
  
  deleteUser: async (userId: number | string) => {
    return apiFetch<any>(`/users/${userId}/`, {
      method: 'DELETE'
    });
  },

  getAuditLogs: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/audit/?page=${page}`);
  },

  updateUser: async (userId: number | string, data: Partial<User>) => {
    return apiFetch<User>(`/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  getInternships: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/internships/?page=${page}`);
  },
  createInternship: async (data: any) => {
    return apiFetch<any>(`/internships/`, { method: 'POST', body: JSON.stringify(data) });
  },
  deleteInternship: async (id: string) => {
    return apiFetch<any>(`/internships/${id}/`, { method: 'DELETE' });
  },

  // Global Content (Skills & Certs)
  getSkills: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/skills/?page=${page}`);
  },
  createSkill: async (data: any) => {
    return apiFetch<any>(`/skills/`, { method: 'POST', body: JSON.stringify(data) });
  },
  deleteSkill: async (id: string) => {
    return apiFetch<any>(`/skills/${id}/`, { method: 'DELETE' });
  },

  getCertifications: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/certifications/?page=${page}`);
  },
  createCertification: async (data: any) => {
    return apiFetch<any>(`/certifications/`, { method: 'POST', body: JSON.stringify(data) });
  },
  deleteCertification: async (id: string) => {
    return apiFetch<any>(`/certifications/${id}/`, { method: 'DELETE' });
  },
  
  // Applications Tracking
  getApplications: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/applications/?page=${page}`);
  }
};
