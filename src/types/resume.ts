/**
 * Canonical Resume Data Types for EasyResume AI
 */

export interface ResumeLink {
  label: string;
  url: string;
}

export interface ResumeExperience {
  id: string;
  position: string;
  company: string;
  duration: string;
  description: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  duration: string;
  details: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface ResumeData {
  // Template & Styling
  template: "minimal" | "modern" | "professional";
  primaryColor: string;
  secondaryColor: string;
  photo?: string;

  // Personal Information
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  summary: string;

  // Portfolio & Links
  linksPortfolio: ResumeLink[];

  // Work Experience
  experiences: ResumeExperience[];

  // Education
  education: ResumeEducation[];

  // Skills & Tools
  skills: string[];
  tools: string[];

  // Certifications
  certifications: ResumeCertification[];
}

/** Compatibility alias for existing components */
export type FormData = ResumeData;
