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
  }
};
