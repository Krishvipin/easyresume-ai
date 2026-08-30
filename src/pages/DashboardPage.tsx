import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Briefcase,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Building2,
  FileText,
  Sparkles,
  X,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useWorkspaceStore } from "../store/workspaceStore";
import { SEO } from "../components/seo/SEO";
import type { Project, ProjectStatus } from "../types/project";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { projects, selectProject, createProject, deleteProject } =
    useWorkspaceStore();

  // Create Project Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ company?: string; jobTitle?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort projects by updatedAt DESC
  const sortedProjects = [...projects].sort(
    (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
  );

  const handleOpenProject = async (projectId: string) => {
    await selectProject(projectId);
    navigate("/resume-builder");
  };

  const handleOpenCreateModal = () => {
    setCompany("");
    setJobTitle("");
    setNotes("");
    setErrors({});
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCompany = company.trim();
    const cleanJobTitle = jobTitle.trim();
    const newErrors: { company?: string; jobTitle?: string } = {};

    if (!cleanCompany) {
      newErrors.company = "Company name is required.";
    }
    if (!cleanJobTitle) {
      newErrors.jobTitle = "Job title is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createProject({
        company: cleanCompany,
        jobTitle: cleanJobTitle,
        notes: notes.trim(),
        status: "Draft",
      });

      setIsCreateModalOpen(false);
      navigate("/resume-builder");
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete.projectId);
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "Offer":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Offer
          </span>
        );
      case "Interview":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Interview
          </span>
        );
      case "Applied":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Applied
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      case "Draft":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200">
            Draft
          </span>
        );
    }
  };

  return (
    <>
      <SEO
        title="Dashboard | EasyResume AI"
        description="Manage your job applications, resumes, and ATS scores in one place."
        path="/dashboard"
        robots="noindex, nofollow"
      />

      <div className="flex-1 flex flex-col pt-10 sm:pt-14 pb-16 sm:pb-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-display">
                My Applications
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Track your resumes, ATS scores, and job applications in one place.
              </p>
            </div>

            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#27AE60] hover:bg-[#219653] text-white font-medium text-sm transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer w-full sm:w-auto"
            >
              <Plus size={16} />
              <span>New Project</span>
            </button>
          </div>

          {/* Projects Content */}
          {sortedProjects.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-gray-200 rounded-3xl p-8 sm:p-16 text-center max-w-xl mx-auto shadow-sm my-8">
              <div className="w-16 h-16 bg-emerald-50 text-[#27AE60] rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Briefcase className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">
                No applications yet
              </h2>
              <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
                Create your first project to start building a resume tailored to a specific job and tracking your ATS compatibility.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-black text-white hover:bg-[#27AE60] font-semibold text-sm transition-all shadow hover:shadow-md cursor-pointer"
              >
                <Plus size={16} />
                <span>Create Your First Project</span>
              </button>
            </div>
          ) : (
            /* Project Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProjects.map((project) => {
                const updatedTimeAgo = project.updatedAt
                  ? formatDistanceToNow(new Date(project.updatedAt), {
                      addSuffix: true,
                    })
                  : "recently";

                const atsScore = project.atsResult?.score;

                return (
                  <motion.div
                    key={project.projectId}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top bar: Company & Status */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700 font-bold shrink-0">
                            <Building2 className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-base font-bold text-gray-900 truncate font-display">
                              {project.company || "Untitled Company"}
                            </h2>
                            <p className="text-xs text-gray-500 truncate">
                              {project.jobTitle || "Untitled Role"}
                            </p>
                          </div>
                        </div>

                        {getStatusBadge(project.status)}
                      </div>

                      {/* Notes / Details */}
                      {project.notes && (
                        <p className="text-xs text-gray-600 line-clamp-2 mb-4 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          {project.notes}
                        </p>
                      )}

                      {/* Stats & Meta Grid */}
                      <div className="grid grid-cols-2 gap-3 py-3 my-3 border-y border-gray-100 text-xs">
                        <div>
                          <span className="text-gray-400 block mb-0.5">ATS Score</span>
                          {typeof atsScore === "number" ? (
                            <span
                              className={`font-bold text-sm ${
                                atsScore >= 80
                                  ? "text-emerald-600"
                                  : atsScore >= 50
                                  ? "text-amber-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {atsScore}%
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">Not analyzed</span>
                          )}
                        </div>

                        <div>
                          <span className="text-gray-400 block mb-0.5">Last Updated</span>
                          <span className="text-gray-600 font-medium truncate block">
                            {updatedTimeAgo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <button
                        onClick={() => handleOpenProject(project.projectId)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-[#27AE60] text-white text-xs font-semibold transition-all cursor-pointer shadow-sm flex-1 justify-center"
                      >
                        <span>Open Project</span>
                        <ArrowRight size={13} />
                      </button>

                      <button
                        onClick={() => setProjectToDelete(project)}
                        aria-label={`Delete ${project.company || "project"}`}
                        className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer border border-transparent hover:border-rose-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#27AE60] flex items-center justify-center">
                    <Briefcase size={18} />
                  </div>
                  <h2
                    id="create-project-title"
                    className="text-lg sm:text-xl font-bold text-gray-900 font-display"
                  >
                    New Job Application
                  </h2>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-800 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="project-company"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="project-company"
                    type="text"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      if (errors.company) setErrors((prev) => ({ ...prev, company: undefined }));
                    }}
                    placeholder="e.g. Google, Acme Corp"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#27AE60] transition-all ${
                      errors.company
                        ? "border-rose-300 bg-rose-50/50"
                        : "border-gray-200 bg-white"
                    }`}
                  />
                  {errors.company && (
                    <p className="text-xs text-rose-600 mt-1">{errors.company}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="project-job-title"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="project-job-title"
                    type="text"
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value);
                      if (errors.jobTitle) setErrors((prev) => ({ ...prev, jobTitle: undefined }));
                    }}
                    placeholder="e.g. Senior Frontend Engineer, Product Designer"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#27AE60] transition-all ${
                      errors.jobTitle
                        ? "border-rose-300 bg-rose-50/50"
                        : "border-gray-200 bg-white"
                    }`}
                  />
                  {errors.jobTitle && (
                    <p className="text-xs text-rose-600 mt-1">{errors.jobTitle}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="project-notes"
                    className="block text-xs font-semibold text-gray-700 mb-1.5"
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    id="project-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. Applied via referral, hiring manager name, link to posting..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#27AE60] resize-none transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#27AE60] hover:bg-[#219653] text-white text-sm font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {projectToDelete && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProjectToDelete(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 p-6 sm:p-8"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <AlertTriangle size={24} />
              </div>

              <h2
                id="delete-dialog-title"
                className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-display"
              >
                Delete this application?
              </h2>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                This will permanently remove the project for{" "}
                <span className="font-semibold text-gray-900">
                  {projectToDelete.company || "this application"}
                </span>{" "}
                and its associated resume, ATS analysis, and cover letter from this device.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProjectToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
