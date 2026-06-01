import React, { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface OnboardingProjectData {
  companyName: string;
  jobTitle: string;
  note: string;
}

interface OnboardingProjectModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSubmit: (data: OnboardingProjectData) => Promise<void>;
  isCancellable?: boolean;
}

export function OnboardingProjectModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isCancellable = false 
}: OnboardingProjectModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ companyName, jobTitle, note });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-[480px] overflow-hidden rounded-2xl bg-white p-8 shadow-2xl border border-gray-200 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-black font-display">Target Application</h3>
                  <p className="text-sm text-gray-500 mt-1">What role are you aiming for with this resume?</p>
                </div>
                {isCancellable && onClose && (
                  <button
                    onClick={onClose}
                    className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="company" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="company"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Acme Corp"
                    className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-gray-50/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="role" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="role"
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-gray-50/50 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="note" className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Need to highlight React and Framer Motion experience..."
                    className="w-full px-3 py-2 text-[14px] border border-gray-200 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-gray-50/50 transition-all resize-none h-24"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  {isCancellable && onClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-[14px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Skip
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting || !companyName || !jobTitle}
                    className="w-full sm:w-auto px-6 py-2.5 text-[14px] font-semibold text-white bg-[#27AE60] rounded-lg hover:bg-[#1E8E4D] shadow-lg shadow-green-600/20 disabled:opacity-50 transition-all active:scale-95"
                  >
                    {isSubmitting ? "Saving..." : "Start Building"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
