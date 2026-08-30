import type { ResumeData } from "./resume";
import type { ATSAnalysisResult } from "./ats";

export type { ResumeData, ResumeExperience, ResumeEducation, ResumeCertification, ResumeLink, FormData } from "./resume";
export type { ATSAnalysisResult } from "./ats";

export type ProjectStatus =
  | "Draft"
  | "Applied"
  | "Interview"
  | "Rejected"
  | "Offer";

export interface Project {
  projectId: string;
  company: string;
  jobTitle: string;
  notes: string;
  status: ProjectStatus;
  dateCreated: number;
  updatedAt: number;
  jobDescription: string;
  masterResume: ResumeData;
  modifiedResume: ResumeData | null;
  atsResult: ATSAnalysisResult | null;
  coverLetter: string | null;
}
