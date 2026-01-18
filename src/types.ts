// Core data types for Resume Tailor

export interface BulletPoint {
  id: string;
  text: string;
  isEnabled: boolean;
  score?: number;
  optimizedText?: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: BulletPoint[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

export interface MasterProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  website?: string;
  summary: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
}

export interface JobDescription {
  id: string;
  company: string;
  title: string;
  text: string;
  keywords: string[];
}

export interface ResumeSnapshot {
  id: string;
  timestamp: number;
  company: string;
  jobTitle: string;
  profileSnapshot: MasterProfile;
  jobSnapshot: JobDescription;
  coverLetter?: string;
}

export enum AppView {
  MASTER_PROFILE = 'master_profile',
  JOB_MATCH = 'job_match',
  COVER_LETTER = 'cover_letter',
  PREVIEW = 'preview',
  HISTORY = 'history',
  BACKEND_SPEC = 'backend_spec'
}

export const INITIAL_PROFILE: MasterProfile = {
  id: 'master-1',
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  website: '',
  summary: '',
  skills: [],
  experiences: [],
  education: []
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
