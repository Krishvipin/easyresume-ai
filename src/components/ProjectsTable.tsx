import React, { useState } from "react";
import { Search } from "lucide-react";
import { type ResumeProject } from "../types/resume";
import { ProjectRow } from "./ProjectRow";

interface ProjectsTableProps {
  projects: ResumeProject[];
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const [filter, setFilter] = useState("");

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) ||
    p.company.toLowerCase().includes(filter.toLowerCase()) ||
    p.role.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
      {/* Table Header / Filter Bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="font-semibold text-gray-900">Active Projects</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Filter projects..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-gray-50/50 transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Project Name</th>
              <th className="hidden px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest sm:table-cell">Company</th>
              <th className="hidden px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest md:table-cell">Role</th>
              <th className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-center">Status</th>
              <th className="hidden px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-widest lg:table-cell text-right">Updated</th>
              <th className="px-6 py-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  No projects match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
