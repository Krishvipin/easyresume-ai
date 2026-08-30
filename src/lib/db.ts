import Dexie, { type Table } from "dexie";
import type { Project } from "../types/project";

export class EasyResumeDB extends Dexie {
  projects!: Table<Project, string>;

  constructor() {
    super("EasyResumeDB");
    this.version(1).stores({
      projects: "projectId, company, jobTitle, status, dateCreated, updatedAt",
    });
  }
}

export const db = new EasyResumeDB();
