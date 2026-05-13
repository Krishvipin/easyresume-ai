import Dexie, { type Table } from "dexie";
import { type ResumeProject } from "../types/resume";

export class EasyResumeDB extends Dexie {
  projects!: Table<ResumeProject>;

  constructor() {
    super("EasyResumeDB");
    this.version(1).stores({
      projects: "id, name, company, status, updatedAt",
    });
  }
}

export const db = new EasyResumeDB();

export const projectService = {
  async getAllProjects() {
    return await db.projects.orderBy("updatedAt").reverse().toArray();
  },

  async getProject(id: string) {
    return await db.projects.get(id);
  },

  async createProject(project: ResumeProject) {
    await db.projects.add(project);
    return project;
  },

  async updateProject(id: string, updates: Partial<ResumeProject>) {
    await db.projects.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async deleteProject(id: string) {
    await db.projects.delete(id);
  },
};
