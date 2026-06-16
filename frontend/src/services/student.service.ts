import { apiFetch } from '../api/client';
import { StudentProfile, PaginatedResponse, Recommendation, Internship, WorkExperience } from '../types';

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
  },

  // Transcript Upload
  uploadTranscript: async (file: File) => {
    const formData = new FormData();
    formData.append('transcript', file);
    return apiFetch<any>('/profiles/upload-transcript/', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  },

  // Career Assessment
  takeAssessment: async (answers: Record<string, any>) => {
    // Use the generic submit endpoint that accepts an "answers" payload
    // If it's already wrapped in { answers }, just send it. Otherwise wrap it.
    const payload = answers.answers ? answers : { answers };
    return apiFetch<any>('/careers/assessments/submit/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getAssessmentResults: async () => {
    return apiFetch<any>('/careers/assessments/');
  },

  // Favorites
  getFavoriteCareers: async () => {
    const response = await apiFetch<any>('/careers/favorites/');
    // Handle both paginated and non-paginated responses
    return response.results || response || [];
  },

  toggleFavoriteCareer: async (careerId: string) => {
    return apiFetch<any>('/careers/favorites/', {
      method: 'POST',
      body: JSON.stringify({ career_id: careerId }),
    });
  },

  removeFavoriteCareer: async (favoriteId: string) => {
    return apiFetch<any>(`/careers/favorites/${favoriteId}/`, {
      method: 'DELETE',
    });
  },

  getCareerClusters: async () => {
    return apiFetch<any[]>('/careers/clusters/');
  },

  // Career Comparison
  compareCareers: async (careerIds: string[]) => {
    const params = careerIds.map(id => `ids=${id}`).join('&');
    return apiFetch<any>(`/careers/compare/?${params}`);
  },

  // Career Path Visualization
  getCareerPathVisualization: async (careerId?: string) => {
    const url = careerId ? `/careers/path-visualization/?career_id=${careerId}` : '/careers/path-visualization/';
    return apiFetch<any>(url);
  },

  // Skill Gap Analysis
  getSkillGapAnalysis: async () => {
    return apiFetch<any>('/recommendations/skill-gap/');
  },

  // PDF Export
  exportRecommendationsPdf: async () => {
    const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api'}/recommendations/export-pdf/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    if (!response.ok) throw new Error('Failed to export PDF');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'career_recommendations.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Share Report with Advisor
  shareReport: async (advisorId: string) => {
    return apiFetch<any>('/profiles/share-report/', {
      method: 'POST',
      body: JSON.stringify({ advisor_id: advisorId }),
    });
  },

  // Get advisor interventions for the current student
  getMyInterventions: async () => {
    return apiFetch<any[]>('/profiles/my-interventions/');
  },

  // Get list of advisors (for sharing)
  getAdvisors: async () => {
    return apiFetch<{ id: string; email: string }[]>('/profiles/list-advisors/');
  },

  // Notifications (Student side)
  getNotifications: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/notifications/?page=${page}`);
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

  // Skill Development Tracking
  getSkillProgress: async () => {
    return apiFetch<any[]>('/skills/student-skills/');
  },

  // Saved & Applied Opportunities
  getApplications: async (page = 1) => {
    return apiFetch<PaginatedResponse<any>>(`/applications/?page=${page}`);
  },

  applyForInternship: async (internshipId: string) => {
    return apiFetch<any>(`/applications/`, {
      method: 'POST',
      body: JSON.stringify({ internship_id: internshipId })
    });
  },

  // --- Work Experience CRUD ---
  getWorkExperiences: async () => {
    return apiFetch<WorkExperience[]>('/profiles/work-experience/');
  },

  addWorkExperience: async (data: WorkExperience) => {
    return apiFetch<WorkExperience>('/profiles/work-experience/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateWorkExperience: async (id: string, data: Partial<WorkExperience>) => {
    return apiFetch<WorkExperience>(`/profiles/work-experience/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteWorkExperience: async (id: string) => {
    return apiFetch<void>(`/profiles/work-experience/${id}/`, {
      method: 'DELETE',
    });
  },
};
