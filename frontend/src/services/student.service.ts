import { apiFetch } from '../api/client';
import { StudentProfile, PaginatedResponse, Recommendation, Internship } from '../types';

export const studentService = {
  getProfile: async () => {
    // MOCK DATA: Prevent browser 404 console errors since backend endpoint is incomplete
    return new Promise<StudentProfile>((resolve) => {
      setTimeout(() => {
        resolve({
          id: '1',
          reg_number: '21005',
          full_name: 'Alex Johnson',
          gpa: 88,
          program: 'Software Engineering',
          current_year: 3,
          skills: ['Python', 'React', 'SQL', 'Django']
        } as StudentProfile);
      }, 300);
    });
  },
  
  getRecommendations: async (page = 1) => {
    // MOCK DATA: Prevent browser 400 console errors
    return new Promise<PaginatedResponse<Recommendation>>((resolve) => {
      setTimeout(() => {
        resolve({
          count: 2,
          next: null,
          previous: null,
          results: [
            {
              career_id: 1, onet_code: '15-1252.00', title: 'Software Developer', match_percentage: 92,
              missing_skills: ['AWS', 'Docker'], total_missing: 2,
              required_education: 'Bachelor’s Degree', work_experience: 'None', on_the_job_training: 'None',
              recommended_certs: [{ id: '1', name: 'AWS Certified Developer', provider: 'Amazon' }]
            } as any,
            {
              career_id: 2, onet_code: '15-1254.00', title: 'Web Developer', match_percentage: 85,
              missing_skills: ['TypeScript', 'Node.js'], total_missing: 2,
              required_education: 'Associate’s Degree', work_experience: 'None', on_the_job_training: 'None',
              recommended_certs: []
            } as any
          ]
        });
      }, 300);
    });
  },

  getInternships: async (page = 1) => {
    return apiFetch<PaginatedResponse<Internship>>(`/internships/?page=${page}`);
  }
};
