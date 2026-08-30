import type { ResumeData } from "../types/resume";
import type { Project } from "../types/project";

/**
 * Generate a unique ID using crypto.randomUUID() when available
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Safe RFC4122 v4 fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Creates a fresh, mutable instance of the default resume data.
 */
export function createEmptyResume(): ResumeData {
  return {
    template: "minimal",
    primaryColor: "#1e3a8a",
    secondaryColor: "#475569",
    fullName: "Sarah",
    role: "UIUX Designer",
    email: "Sarah@email.com",
    phone: "+91 9876543210",
    location: "Texas",
    experience: 6,
    summary: "Tell me about yourself short...",
    linksPortfolio: [
      { label: "LinkedIn", url: "Sarah@linkedin.com" },
      { label: "Portfolio", url: "Sarah.com" },
    ],
    experiences: [
      {
        id: "1",
        position: "Designer",
        company: "Google",
        duration: "Jan 2020 - Jan 2026",
        description: ["Write about your job experience.."],
      },
      {
        id: "2",
        position: "Designer",
        company: "Google",
        duration: "Jan 2020 - Jan 2026",
        description: ["Write about your job experience.."],
      },
    ],
    education: [
      {
        id: "1",
        degree: "MBA",
        school: "University",
        duration: "Duration (eg., 2016 -2020)",
        details: "Details (eg., GPA, Honors)",
      },
      {
        id: "2",
        degree: "MBA",
        school: "University",
        duration: "Duration (eg., 2016 -2020)",
        details: "Details (eg., GPA, Honors)",
      },
    ],
    skills: ["Figma", "Agile/ Scrum", "User Research"],
    tools: ["Photoshop", "Illustrator", "Framer"],
    certifications: [
      {
        id: "1",
        name: "Google UX Design Professional Certificate",
        issuer: "Coursera",
        date: "2022",
      },
    ],
  };
}

/**
 * Creates a fresh, default Project entity with a stable UUID.
 */
export function createDefaultProject(overrides?: Partial<Project>): Project {
  const now = Date.now();
  return {
    projectId: generateUUID(),
    company: "",
    jobTitle: "",
    notes: "",
    status: "Draft",
    dateCreated: now,
    updatedAt: now,
    jobDescription: "",
    masterResume: createEmptyResume(),
    modifiedResume: null,
    atsResult: null,
    coverLetter: null,
    ...overrides,
  };
}
