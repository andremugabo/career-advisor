export type Role = 'Student' | 'Advisor' | 'Admin';

export interface User {
  id: number | string;
  email: string;
  role: Role;
  is_active: boolean;
  mfa_enabled?: boolean;
}

export interface StudentProfile {
  id: number;
  full_name: string;
  reg_number: string;
  program: string;
  gpa: number;
  current_year: number;
  bio: string;
  skills: string[];
}

export interface Skill {
  id: number;
  name: string;
  type: string;
}

export interface StudentSkill {
  id: number;
  skill: Skill;
  proficiency_level: number;
}

export interface Recommendation {
  career_id: number;
  onet_code: string;
  title: string;
  match_percentage: number;
  missing_skills: string[];
  total_missing: number;
  required_education: string;
  work_experience: string;
  on_the_job_training: string;
  recommended_certs: { id: number; name: string; provider: string; }[];
}

export interface Internship {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  requirements: string;
  is_active: boolean;
  match_percentage?: number;
}

export interface Application {
  id: string;
  internship: Internship;
  status: 'Pending' | 'Reviewed' | 'Accepted' | 'Rejected';
  applied_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
