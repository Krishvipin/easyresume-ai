import { create } from "zustand";
import type { Project } from "../types/project";
import * as projectDb from "../lib/projectDb";
import { runLegacyStorageMigration } from "../lib/migrateLegacyStorage";

export interface WorkspaceState {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  isLoading: boolean;
  isInitialized: boolean;

  /**
   * Initializes the workspace store, running legacy migration if needed
   * and loading all projects from Dexie.
   */
  initialize: (force?: boolean) => Promise<void>;

  /**
   * Manually sets the current active project in memory.
   */
  setCurrentProject: (project: Project | null) => void;

  /**
   * Selects an active project by ID and loads it from Dexie.
   */
  selectProject: (projectId: string) => Promise<void>;

  /**
   * Creates a new project in Dexie and selects it.
   */
  createProject: (data?: Partial<Project>) => Promise<Project>;

  /**
   * Updates an existing project in Dexie and updates state.
   */
  updateProject: (projectId: string, changes: Partial<Project>) => Promise<Project>;

  /**
   * Updates the currently active project in Dexie and state.
   */
  updateCurrentProject: (changes: Partial<Project>) => Promise<Project | null>;

  /**
   * Deletes a project from Dexie and clears/switches current project if active.
   */
  deleteProject: (projectId: string) => Promise<void>;

  /**
   * Refreshes the projects list from Dexie.
   */
  refreshProjects: () => Promise<Project[]>;
}

export const ACTIVE_PROJECT_KEY = "easyresume_active_project_id";

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  projects: [],
  currentProjectId: null,
  currentProject: null,
  isLoading: false,
  isInitialized: false,

  initialize: async (force = false) => {
    if (get().isInitialized && !force) return;

    set({ isLoading: true });
    try {
      // 1. Run migration if legacy localStorage data exists
      await runLegacyStorageMigration();

      // 2. Load all projects from Dexie
      const projects = await projectDb.getAllProjects();

      // 3. Resolve active project from localStorage or fallback to first
      let currentProject: Project | null = null;
      let currentProjectId: string | null = null;

      const savedActiveId = typeof localStorage !== "undefined"
        ? localStorage.getItem(ACTIVE_PROJECT_KEY)
        : null;

      if (savedActiveId && projects.some((p) => p.projectId === savedActiveId)) {
        currentProject = projects.find((p) => p.projectId === savedActiveId) || null;
        currentProjectId = currentProject ? currentProject.projectId : null;
      } else if (projects.length > 0) {
        currentProject = projects[0];
        currentProjectId = projects[0].projectId;
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(ACTIVE_PROJECT_KEY, currentProjectId);
        }
      } else {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(ACTIVE_PROJECT_KEY);
        }
      }

      set({
        projects,
        currentProject,
        currentProjectId,
        isInitialized: true,
        isLoading: false,
      });
    } catch (err) {
      console.error("[WorkspaceStore] Initialization failed:", err);
      set({ isLoading: false, isInitialized: true });
    }
  },

  setCurrentProject: (project: Project | null) => {
    const currentProjectId = project ? project.projectId : null;
    if (typeof localStorage !== "undefined") {
      if (currentProjectId) {
        localStorage.setItem(ACTIVE_PROJECT_KEY, currentProjectId);
      } else {
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
    }
    set({
      currentProject: project,
      currentProjectId,
    });
  },

  selectProject: async (projectId: string) => {
    if (!projectId) {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(ACTIVE_PROJECT_KEY);
      }
      set({ currentProject: null, currentProjectId: null });
      return;
    }

    set({ isLoading: true });
    try {
      const project = await projectDb.getProject(projectId);
      if (project) {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(ACTIVE_PROJECT_KEY, project.projectId);
        }
        set({
          currentProject: project,
          currentProjectId: project.projectId,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error(`[WorkspaceStore] Failed to select project ${projectId}:`, err);
      set({ isLoading: false });
    }
  },

  createProject: async (data?: Partial<Project>) => {
    set({ isLoading: true });
    try {
      const newProject = await projectDb.createProject(data);
      const updatedList = await projectDb.getAllProjects();

      if (typeof localStorage !== "undefined") {
        localStorage.setItem(ACTIVE_PROJECT_KEY, newProject.projectId);
      }

      set({
        projects: updatedList,
        currentProject: newProject,
        currentProjectId: newProject.projectId,
        isLoading: false,
      });

      return newProject;
    } catch (err) {
      console.error("[WorkspaceStore] Failed to create project:", err);
      set({ isLoading: false });
      throw err;
    }
  },

  updateProject: async (projectId: string, changes: Partial<Project>) => {
    try {
      const updated = await projectDb.updateProject(projectId, changes);
      const updatedList = await projectDb.getAllProjects();

      const state = get();
      const isCurrent = state.currentProjectId === projectId;

      set({
        projects: updatedList,
        currentProject: isCurrent ? updated : state.currentProject,
      });

      return updated;
    } catch (err) {
      console.error(`[WorkspaceStore] Failed to update project ${projectId}:`, err);
      throw err;
    }
  },

  updateCurrentProject: async (changes: Partial<Project>) => {
    const currentId = get().currentProjectId;
    if (!currentId) return null;
    return await get().updateProject(currentId, changes);
  },

  deleteProject: async (projectId: string) => {
    set({ isLoading: true });
    try {
      await projectDb.deleteProject(projectId);
      const updatedList = await projectDb.getAllProjects();

      const state = get();
      let nextProject: Project | null = null;
      let nextProjectId: string | null = null;

      if (state.currentProjectId === projectId) {
        if (updatedList.length > 0) {
          nextProject = updatedList[0];
          nextProjectId = updatedList[0].projectId;
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(ACTIVE_PROJECT_KEY, nextProjectId);
          }
        } else {
          if (typeof localStorage !== "undefined") {
            localStorage.removeItem(ACTIVE_PROJECT_KEY);
          }
        }
      } else {
        nextProject = state.currentProject;
        nextProjectId = state.currentProjectId;
      }

      set({
        projects: updatedList,
        currentProject: nextProject,
        currentProjectId: nextProjectId,
        isLoading: false,
      });
    } catch (err) {
      console.error(`[WorkspaceStore] Failed to delete project ${projectId}:`, err);
      set({ isLoading: false });
      throw err;
    }
  },

  refreshProjects: async () => {
    const projects = await projectDb.getAllProjects();
    const state = get();
    let currentProject = state.currentProject;
    let currentProjectId = state.currentProjectId;

    if (currentProjectId) {
      const match = projects.find((p) => p.projectId === currentProjectId);
      currentProject = match || (projects.length > 0 ? projects[0] : null);
      currentProjectId = currentProject ? currentProject.projectId : null;
    } else if (projects.length > 0) {
      currentProject = projects[0];
      currentProjectId = projects[0].projectId;
    }

    set({ projects, currentProject, currentProjectId });
    return projects;
  },
}));
