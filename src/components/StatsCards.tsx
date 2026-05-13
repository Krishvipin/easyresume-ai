import { Briefcase, CheckCircle2, FileText, MessagesSquare } from "lucide-react";
import { type ResumeProject } from "../types/resume";

interface StatsCardsProps {
  projects: ResumeProject[];
}

export function StatsCards({ projects }: StatsCardsProps) {
  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FileText,
      badge: "+2 this week",
      badgeColor: "text-green-600 bg-green-50",
    },
    {
      label: "Applied",
      value: projects.filter(p => p.status === "Applied").length,
      icon: Briefcase,
      badge: "66% rate",
      badgeColor: "text-gray-400 bg-gray-50",
    },
    {
      label: "Interviews",
      value: projects.filter(p => p.status === "Interview").length,
      icon: MessagesSquare,
      badge: "1 upcoming",
      badgeColor: "text-orange-600 bg-orange-50",
    },
    {
      label: "Offers",
      value: projects.filter(p => p.status === "Offer").length,
      icon: CheckCircle2,
      badge: "Active",
      badgeColor: "text-blue-600 bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${stat.badgeColor}`}>
                {stat.badge}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
