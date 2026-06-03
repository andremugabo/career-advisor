import { apiFetch } from '../api/client';
import { PaginatedResponse, Recommendation } from '../types';

export const advisorService = {
  getStudents: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/advisors/students/?page=${page}`);
  },

  getStudentRecommendations: async (studentId: string) => {
    return apiFetch<Recommendation[]>(`/recommendations/?student_id=${studentId}`);
  },

  getAnalytics: async () => {
    return apiFetch<{ total_students: number; average_gpa: number; top_missing: Array<{ name: string; count: number }> }>(
      '/advisors/students/analytics/'
    );
  },

  logIntervention: async (data: { student: string; notes: string; intervention_type: string }) => {
    return apiFetch<any>('/advisors/interventions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getInterventions: async (studentId?: string) => {
    const url = studentId
      ? `/advisors/interventions/?student_id=${studentId}`
      : '/advisors/interventions/';
    return apiFetch<PaginatedResponse<any>>(url);
  },

  // Notifications (Advisor communication with students)
  getNotifications: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/notifications/?page=${page}`);
  },

  sendNotification: async (data: { recipient: string; subject: string; message: string }) => {
    return apiFetch<any>('/notifications/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  markNotificationRead: async (id: string) => {
    return apiFetch<any>(`/notifications/${id}/mark-read/`, {
      method: 'POST',
    });
  },

  // Resource Library
  getResources: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/resources/?page=${page}`);
  },

  createResource: async (data: { title: string; file_path: string; category: string }) => {
    return apiFetch<any>('/resources/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateResource: async (id: string, data: { title: string; file_path: string; category: string }) => {
    return apiFetch<any>(`/resources/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteResource: async (id: string) => {
    return apiFetch<any>(`/resources/${id}/`, {
      method: 'DELETE',
    });
  },
};

