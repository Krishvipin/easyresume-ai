import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useProjectStore } from "../store/use-project-store";
import { StatsCards } from "../components/StatsCards";
import { ProjectsTable } from "../components/ProjectsTable";
import { EmptyState } from "../components/EmptyState";
import { NewProjectModal } from "../components/NewProjectModal";

export default function DashboardPage() {
  const { 
    projects, 
    isLoading, 
    fetchProjects, 
    createProject 
  } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col gap-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black font-display">Dashboard</h1>
          <p className="text-sm text-[#7A7A8C] font-medium mt-1">Manage and track your job applications</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-black/10 hover:bg-black/90 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </button>
      </div>

      <div className="flex flex-col gap-8">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : (
          <>
            <StatsCards projects={projects} />

            <div className="flex flex-col min-h-0">
              {projects.length === 0 ? (
                <EmptyState onNewProject={() => setIsModalOpen(true)} />
              ) : (
                <ProjectsTable projects={projects} />
              )}
            </div>
          </>
        )}
      </div>

      <NewProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={async (name, company, role) => {
          await createProject(name, company, role);
        }} 
      />
    </main>
  );
}
