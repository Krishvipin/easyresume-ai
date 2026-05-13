export type ProjectStatus = "Draft" | "Applied" | "Interview" | "Offer" | "Rejected";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
  };
  experience: {
    id: string;
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string[];
  }[];
  education: {
    id: string;
    school: string;
    degree: string;
    date: string;
  }[];
  skills: string[];
}

export interface ResumeProject {
  id: string;
  name: string;
  company: string;
  role: string;
  status: ProjectStatus;
  updatedAt: number;
  createdAt: number;
  resumeData: ResumeData;
}
