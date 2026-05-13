import { type ResumeProject } from "../types/resume";

export function createEmptyProject(name: string, company: string, role: string): ResumeProject {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    company,
    role,
    status: "Draft",
    createdAt: now,
    updatedAt: now,
    resumeData: {
      personalInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
      },
      experience: [],
      education: [],
      skills: [],
    },
  };
}
