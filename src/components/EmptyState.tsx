import { Search, Plus } from "lucide-react";

interface EmptyStateProps {
  onNewProject: () => void;
}

export function EmptyState({ onNewProject }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center mt-4 shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-100 shadow-inner">
        <Search className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-black tracking-tight">No projects yet</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-xs font-medium">
        Create your first optimized resume workflow to track your job hunt.
      </p>
      <button
        onClick={onNewProject}
        className="mt-6 inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 transition-all shadow-md shadow-black/5 active:scale-95"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create First Project
      </button>
    </div>
  );
}
