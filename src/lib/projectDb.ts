import { db } from "./db";
import type { Project } from "../types/project";
import { createDefaultProject } from "./defaults";

/**
 * Creates and stores a new Project in Dexie.
 */
export async function createProject(projectData?: Partial<Project>): Promise<Project> {
  const newProject = createDefaultProject(projectData);
  await db.projects.add(newProject);
  return newProject;
}

/**
 * Retrieves a single Project by ID from Dexie.
 */
export async function getProject(projectId: string): Promise<Project | undefined> {
  if (!projectId) return undefined;
  return await db.projects.get(projectId);
}

/**
 * Retrieves all Projects ordered by most recently updated.
 */
export async function getAllProjects(): Promise<Project[]> {
  const projects = await db.projects.toArray();
  // Sort descending by updatedAt (most recent first)
  return projects.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/**
 * Updates a Project by ID with partial changes and refreshes the updatedAt timestamp.
 */
export async function updateProject(
  projectId: string,
  changes: Partial<Project>
): Promise<Project> {
  const existing = await getProject(projectId);
  if (!existing) {
    throw new Error(`[projectDb] Project with ID "${projectId}" not found.`);
  }

  const updated: Project = {
    ...existing,
    ...changes,
    projectId: existing.projectId, // Immutable ID
    dateCreated: existing.dateCreated, // Preserve creation timestamp
    updatedAt: Date.now(),
  };

  await db.projects.put(updated);
  return updated;
}

/**
 * Deletes a Project by ID from Dexie.
 */
export async function deleteProject(projectId: string): Promise<void> {
  if (!projectId) return;
  await db.projects.delete(projectId);
}

/**
 * Deletes all Projects from Dexie.
 */
export async function clearProjects(): Promise<void> {
  await db.projects.clear();
}

/**
 * Returns the total count of Projects in Dexie.
 */
export async function getProjectCount(): Promise<number> {
  return await db.projects.count();
}

/**
 * Checks if a Project with the given ID exists in Dexie.
 */
export async function projectExists(projectId: string): Promise<boolean> {
  if (!projectId) return false;
  const count = await db.projects.where("projectId").equals(projectId).count();
  return count > 0;
}
