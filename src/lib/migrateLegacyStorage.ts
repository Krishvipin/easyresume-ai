import { getProjectCount, createProject } from "./projectDb";
import { createEmptyResume, createDefaultProject } from "./defaults";
import type { Project } from "../types/project";
import type { ResumeData } from "../types/resume";
import type { ATSAnalysisResult } from "../types/ats";

export const MIGRATION_KEY = "easyresume_project_migration_v1";

/**
 * Safely migrates existing localStorage data (resume, tailored resume, ATS scan, cover letter)
 * into a first Project in Dexie if no projects currently exist.
 *
 * Guaranteed to be idempotent: will only run once and never create duplicates.
 * Preserves legacy localStorage keys for backward compatibility.
 */
export async function runLegacyStorageMigration(): Promise<Project | null> {
  // 1. Check if migration has already completed
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }

  const isAlreadyMigrated = localStorage.getItem(MIGRATION_KEY) === "true";
  const existingCount = await getProjectCount();

  if (isAlreadyMigrated && existingCount > 0) {
    return null;
  }

  if (existingCount > 0) {
    localStorage.setItem(MIGRATION_KEY, "true");
    return null;
  }

  // 2. Read legacy data sources
  const legacyResumeRaw = localStorage.getItem("easyresume_data");
  const legacyModifiedRaw = localStorage.getItem("easyresume_modified_data");
  const legacyAtsRaw = localStorage.getItem("easyresume_ats_checker_data");
  const legacyCoverRaw = localStorage.getItem("easyresume_cover_letter_data");
  const legacyTailorInputRaw = localStorage.getItem("easyresume_tailor_input_data");

  const hasAnyLegacyData =
    Boolean(legacyResumeRaw) ||
    Boolean(legacyModifiedRaw) ||
    Boolean(legacyAtsRaw) ||
    Boolean(legacyCoverRaw) ||
    Boolean(legacyTailorInputRaw);

  if (!hasAnyLegacyData) {
    // Fresh user, no legacy data to migrate
    localStorage.setItem(MIGRATION_KEY, "true");
    return null;
  }

  try {
    // 3. Parse Master Resume
    let masterResume: ResumeData = createEmptyResume();
    if (legacyResumeRaw) {
      try {
        const parsed = JSON.parse(legacyResumeRaw);
        if (parsed && typeof parsed === "object") {
          masterResume = { ...createEmptyResume(), ...parsed };
        }
      } catch (e) {
        console.warn("[Migration] Could not parse legacy easyresume_data:", e);
      }
    }

    // 4. Parse Modified Resume
    let modifiedResume: ResumeData | null = null;
    if (legacyModifiedRaw) {
      try {
        const parsed = JSON.parse(legacyModifiedRaw);
        if (parsed && typeof parsed === "object") {
          modifiedResume = { ...createEmptyResume(), ...parsed };
        }
      } catch (e) {
        console.warn("[Migration] Could not parse legacy easyresume_modified_data:", e);
      }
    }

    // 5. Parse ATS Checker State & Job Description
    let atsResult: ATSAnalysisResult | null = null;
    let jobDescription = "";
    if (legacyAtsRaw) {
      try {
        const parsed = JSON.parse(legacyAtsRaw);
        if (parsed?.jobDescription) {
          jobDescription = parsed.jobDescription;
        }
        if (parsed?.results?.rawData) {
          atsResult = parsed.results.rawData;
        }
      } catch (e) {
        console.warn("[Migration] Could not parse legacy easyresume_ats_checker_data:", e);
      }
    }

    // Check tailor inputs for job description if missing
    if (!jobDescription && legacyTailorInputRaw) {
      try {
        const parsed = JSON.parse(legacyTailorInputRaw);
        if (parsed?.jobDescription) {
          jobDescription = parsed.jobDescription;
        }
      } catch (e) {}
    }

    // 6. Parse Cover Letter
    let coverLetter: string | null = null;
    let targetCompany = "";
    let targetJobTitle = "";
    if (legacyCoverRaw) {
      try {
        const parsed = JSON.parse(legacyCoverRaw);
        if (parsed?.generatedLetter) {
          coverLetter = parsed.generatedLetter;
        }
        if (parsed?.jobDetails?.[0]?.company) {
          targetCompany = parsed.jobDetails[0].company;
        }
        if (parsed?.jobDetails?.[0]?.role) {
          targetJobTitle = parsed.jobDetails[0].role;
        }
        if (!jobDescription && parsed?.jobDescription) {
          jobDescription = parsed.jobDescription;
        }
      } catch (e) {
        console.warn("[Migration] Could not parse legacy easyresume_cover_letter_data:", e);
      }
    }

    // 7. Resolve default company and job title
    const finalCompany =
      targetCompany ||
      masterResume.experiences?.[0]?.company ||
      "Primary Application";

    const finalJobTitle =
      targetJobTitle ||
      masterResume.role ||
      "Target Role";

    // 8. Create and save the migrated Project
    const migratedProject = createDefaultProject({
      company: finalCompany,
      jobTitle: finalJobTitle,
      notes: "Migrated from local storage session.",
      status: "Draft",
      jobDescription: jobDescription || "",
      masterResume: masterResume,
      modifiedResume: modifiedResume,
      atsResult: atsResult,
      coverLetter: coverLetter,
    });

    await createProject(migratedProject);
    localStorage.setItem(MIGRATION_KEY, "true");
    console.log("[Migration] Successfully migrated legacy localStorage to Dexie project:", migratedProject.projectId);

    return migratedProject;
  } catch (err) {
    console.error("[Migration] Error during legacy storage migration:", err);
    return null;
  }
}
