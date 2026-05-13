import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ExternalLink, MoreVertical } from "lucide-react";
import { type ResumeProject, type ProjectStatus } from "../types/resume";
import { cn } from "../lib/utils";

interface ProjectRowProps {
  project: ResumeProject;
}

const statusStyles: Record<ProjectStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-orange-100 text-orange-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export const ProjectRow: React.FC<ProjectRowProps> = ({ project }) => {
  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="px-6 py-4 font-semibold text-sm text-gray-900 border-none">
        {project.name}
      </td>
      <td className="hidden px-6 py-4 text-sm text-gray-600 sm:table-cell border-none">
        {project.company}
      </td>
      <td className="hidden px-6 py-4 text-sm text-gray-600 md:table-cell border-none">
        {project.role}
      </td>
      <td className="px-6 py-4 text-center border-none">
        <span className={cn(
          "inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium",
          statusStyles[project.status]
        )}>
          {project.status}
        </span>
      </td>
      <td className="hidden px-6 py-4 text-sm text-gray-400 lg:table-cell border-none text-right">
        {formatDistanceToNow(project.updatedAt, { addSuffix: true })}
      </td>
      <td className="px-6 py-4 text-right border-none">
        <div className="flex items-center justify-end gap-2">
          <button className="text-black font-semibold text-xs py-1 px-3 border border-gray-200 rounded-md bg-white hover:border-black transition-all active:scale-95 shadow-sm">
            Open
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
