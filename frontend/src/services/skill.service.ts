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
};
