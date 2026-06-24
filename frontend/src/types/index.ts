export type Role = 'Student' | 'Advisor' | 'Admin';

export interface User {
  id: number | string;
  email: string;
  role: Role;
  is_active: boolean;
  mfa_enabled?: boolean;
}

export interface StudentCertification {
  id: number;
  name: string;
  provider: string;
  status: 'Planning' | 'Completed';
  completion_date: string | null;
  target_cluster: string | null;
}

export interface WorkExperience {
  id?: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface ProfileStrength {
  total: number;
  personal_info: number;
  academic_data: number;
  skills_certs: number;
  experience: number;
  career_interests: number;
}

export interface StudentProfile {
  id: number;
  full_name: string;
  reg_number: string;
  program: string;
  gpa: number;
  current_year: number;
  bio: string;
  skills: Skill[];
  verified_competency_skills: Skill[];
  certifications: StudentCertification[];
  transcript_uploaded: boolean;
  transcript_text: string | null;
  // Personal information
  email: string;
  phone_number: string | null;
  date_of_birth: string | null;
  profile_photo_url: string | null;
  // Academic information
  institution_name: string | null;
  expected_graduation: string | null;
  courses_completed: string | null;
  // Career interests
  career_goals: string | null;
  preferred_industries: string | null;
  extracurricular_activities: string | null;
  // Nested relations
  work_experiences: WorkExperience[];
  profile_strength: ProfileStrength;
}

export interface Skill {
  id: number;
  name: string;
  type: string;
  proficiency_level?: number;
}

export interface StudentSkill {
  id: number;
  skill: Skill;
  proficiency_level: number;
}

export interface Recommendation {
  career_id: string;
  onet_code: string;
  title: string;
  match_percentage: number;
  missing_skills: string[];
  total_missing: number;
  required_education: string;
  work_experience: string;
  on_the_job_training: string;
  recommended_certs: { id: string; name: string; provider: string; }[];
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
  date_applied?: string;
  match_score?: number | null;
}

export interface CareerCluster {
  id: string;
  onet_code?: string;
  name: string;
  description: string;
  required_skills: Record<string, unknown>;
}

export interface FavoriteCareer {
  id: number;
  career: CareerCluster;
  saved_at?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
