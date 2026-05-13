import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, RefreshCw } from "lucide-react";

interface ModifyResumeState {
  resume: string;
  jobDescription: string;
  targetRole: string;
  isModifying: boolean;
  modifiedResume?: string;
}

export default function ModifyResumePage() {
  const [state, setState] = useState<ModifyResumeState>({
    resume: "",
    jobDescription: "",
    targetRole: "",
    isModifying: false,
  });

  const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState({ ...state, resume: e.target.value });
  };

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setState({ ...state, jobDescription: e.target.value });
  };

  const handleModifyResume = async () => {
    if (!state.resume.trim() || !state.jobDescription.trim()) {
      alert("Please paste both your resume and job description");
      return;
    }

    setState({ ...state, isModifying: true });

    // TODO: Integrate with AI API to modify resume
    // Placeholder for future AI integration
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isModifying: false,
        modifiedResume: `Modified Resume based on Job Description:\n\n${prev.resume}\n\n[AI-generated modifications applied to match job description keywords and requirements...]`,
      }));
    }, 3000);
  };

  const handleDownload = () => {
    if (!state.modifiedResume) return;
    
    const element = document.createElement("a");
    const file = new Blob([state.modifiedResume], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "modified-resume.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    setState({
      resume: "",
      jobDescription: "",
      targetRole: "",
      isModifying: false,
      modifiedResume: undefined,
    });
  };

  return (
    <div className="flex-1 flex flex-col pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[24px] font-bold tracking-tight text-black font-display"
          >
            Modify you resume
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[16px] leading-[26px] text-[#4A4A57] font-normal max-w-[667px]"
          >
            Instantly modify your resume based on Job description in few mins.
          </motion.p>
        </div>

        {/* Main Content Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Job Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1"
          >
            <div className="border border-[#DADAE3] rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-white border border-black rounded" />
                <label className="text-[12px] font-medium text-black">
                  Job description
                </label>
              </div>
              <textarea
                value={state.jobDescription}
                onChange={handleJobDescriptionChange}
                placeholder="Paste the full job description here..."
                className="w-full h-[240px] p-3 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent resize-none bg-white"
              />
            </div>
          </motion.div>

          {/* Right Column - Resume Upload & Target Role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex-1 flex flex-col gap-4"
          >
            {/* Resume Input */}
            <div className="border border-[#DADAE3] rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-4 h-4 bg-white border border-black rounded" />
                <label className="text-[12px] font-medium text-black">
                  Your Resume
                </label>
              </div>
              <textarea
                value={state.resume}
                onChange={handleResumeChange}
                placeholder="Paste your resume here..."
                className="w-full h-[240px] p-3 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent resize-none bg-white"
              />
            </div>

            {/* Target Role Input */}
            <div className="border border-[#DADAE3] rounded-lg p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-black rounded" />
                <label className="text-[12px] font-medium text-black">
                  Target Role (eg., UIUX designer)
                </label>
              </div>
              <input
                type="text"
                value={state.targetRole}
                onChange={(e) => setState({ ...state, targetRole: e.target.value })}
                placeholder="UIUX designer"
                className="w-full px-3 py-2 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white"
              />
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleModifyResume}
            disabled={state.isModifying || !state.resume.trim() || !state.jobDescription.trim()}
            className="px-8 py-3 bg-[#27AE60] text-white rounded text-[14px] font-medium hover:bg-[#229954] disabled:bg-[#DADAE3] disabled:cursor-not-allowed transition-all"
          >
            {state.isModifying ? "Modifying..." : "Modify Resume"}
          </button>
        </div>

        {/* Output Section */}
        {state.modifiedResume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <label className="text-[16px] font-normal text-black">
                  Modified Resume
                </label>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 border border-black rounded text-[12px] font-medium text-black hover:bg-[#fcfcfc] transition-all"
                >
                  <Upload size={14} />
                  Download
                </button>
              </div>

              <div className="border border-[#DADAE3] rounded-lg p-4 min-h-[540px] bg-white overflow-y-auto">
                {state.modifiedResume ? (
                  <div className="text-[12px] font-medium text-[#2A2A2A] whitespace-pre-wrap leading-relaxed">
                    {state.modifiedResume}
                  </div>
                ) : state.isModifying ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw
                        size={48}
                        className="mx-auto text-[#27AE60] mb-4 animate-spin"
                      />
                      <p className="text-[16px] font-normal text-[#7A7A8C]">
                        AI is modifying your resume...
                      </p>
                      <p className="text-[12px] text-[#7A7A8C] mt-2">
                        This usually takes a few minutes
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <FileText size={48} className="mx-auto text-[#7A7A8C] mb-4" />
                      <h3 className="text-[16px] font-normal text-black mb-2">
                        No modified resume yet
                      </h3>
                      <p className="text-[16px] font-normal text-[#7A7A8C] max-w-xs">
                        Add your resume and job description, then click Modify
                        Resume to get started.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-[#DADAE3] text-black rounded text-[14px] font-medium hover:bg-[#fcfcfc] transition-all"
                >
                  Start Over
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

