import { create } from "zustand";
import { type ResumeProject } from "../types/resume";
import { projectService } from "../db/project-service";

interface ProjectStore {
  projects: ResumeProject[];
  currentProject: ResumeProject | null;
  isLoading: boolean;
  
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: ResumeProject | null) => void;
  createProject: (name: string, company: string, role: string) => Promise<ResumeProject>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const projects = await projectService.getAllProjects();
      set({ projects, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch projects", error);
      set({ isLoading: false });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  createProject: async (name, company, role) => {
    const { createEmptyProject } = await import("../utils/create-empty-project");
    const newProject = createEmptyProject(name, company, role);
    await projectService.createProject(newProject);
    await get().fetchProjects();
    return newProject;
  },

  deleteProject: async (id) => {
    await projectService.deleteProject(id);
    await get().fetchProjects();
    if (get().currentProject?.id === id) {
      set({ currentProject: null });
    }
  },
}));
