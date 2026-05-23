import { apiFetch } from '../api/client';
import { StudentProfile, PaginatedResponse, Recommendation, Internship } from '../types';

export const studentService = {
  getProfile: async () => {
    return apiFetch<StudentProfile>('/profiles/me/');
  },
  
  updateProfile: async (data: Partial<StudentProfile>) => {
    return apiFetch<StudentProfile>('/profiles/me/', {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },
  
  getRecommendations: async () => {
    const results = await apiFetch<Recommendation[]>('/recommendations/');
    return {
      count: results.length,
      next: null,
      previous: null,
      results: results
    };
  },

  getInternships: async (page = 1) => {
    return apiFetch<PaginatedResponse<Internship>>(`/internships/?page=${page}`);
  }
};
