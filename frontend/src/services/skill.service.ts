import { apiFetch } from '../api/client';
import { Skill } from '../types';

export const skillService = {
  // Search available skills (optional query)
  searchSkills: async (search?: string) => {
    const url = search ? `/skills/?search=${encodeURIComponent(search)}` : '/skills/';
    return apiFetch<Skill[]>(url);
  },
  // Add or update a student skill
  addMySkill: async (skillId: number, proficiency: string) => {
    // The backend expects a payload with skill (id) and proficiency_level
    return apiFetch<any>('/skills/my/', {
      method: 'POST',
      body: JSON.stringify({ skill: skillId, proficiency_level: proficiency }),
    });
  },
  // Remove a student skill
  deleteMySkill: async (skillId: number) => {
    return apiFetch<any>(`/skills/${skillId}/my-delete/`, {
      method: 'DELETE',
    });
  },

  // ─── Certification Methods ───

  // List all available certification templates
  listCertifications: async () => {
    const res = await apiFetch<any>('/certifications/');
    // Handle both paginated and non-paginated responses
    return Array.isArray(res) ? res : (res.results || []);
  },

  // Enroll student in a certification
  enrollCertification: async (certId: string, certStatus: string, completionDate?: string) => {
    return apiFetch<any>('/certifications/my/', {
      method: 'POST',
      body: JSON.stringify({
        cert_id: certId,
        status: certStatus,
        completion_date: completionDate || null,
      }),
    });
  },

  // Get student's own certifications
  getMyCertifications: async () => {
    return apiFetch<any[]>('/certifications/my/');
  },
};
