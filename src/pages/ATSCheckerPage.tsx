import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";

interface ATSCheckState {
  resume: string;
  jobDescription: string;
  isChecking: boolean;
  results?: {
    score: number;
    suggestions: string[];
    improvements: string[];
  };
}

export default function ATSCheckerPage() {
  const [state, setState] = useState<ATSCheckState>({
    resume: "",
    jobDescription: "",
    isChecking: false,
  });

  const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState({ ...state, resume: e.target.value });
  };

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setState({ ...state, jobDescription: e.target.value });
  };

  const handleCheckATS = async () => {
    if (!state.resume.trim() || !state.jobDescription.trim()) {
      alert("Please paste both your resume and job description");
      return;
    }

    setState({ ...state, isChecking: true });

    // TODO: Integrate with AI API to check ATS score
    // Placeholder for future AI integration
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isChecking: false,
        results: {
          score: 78,
          suggestions: [
            "Add more relevant keywords from the job description",
            "Include specific metrics and achievements",
            "Improve formatting for ATS compatibility",
          ],
          improvements: [
            "Use action verbs at the start of bullet points",
            "Match the job description language",
            "Highlight technical skills mentioned in the job posting",
          ],
        },
      }));
    }, 2000);
  };

  const handleDownload = (format: "jpg" | "pdf" | "docs") => {
    // TODO: Implement download functionality
    console.log(`Downloading as ${format.toUpperCase()}`);
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
            ATS Score Checker
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[16px] leading-[26px] text-[#4A4A57] font-normal max-w-[667px]"
          >
            Paste your resume + a job description — AI shows exactly what to
            change before you apply.
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8">
          {/* Left Section - Inputs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Resume Input */}
            <div className="border border-[#E5E7EB] rounded-xl p-5 flex flex-col gap-4">
              <label className="text-[16px] font-semibold text-gray-900">
                Your Resume
              </label>
              <div className="border border-[#E5E7EB] rounded-lg p-4">
                <textarea
                  value={state.resume}
                  onChange={handleResumeChange}
                  placeholder="Paste your resume content here..."
                  className="w-full h-[200px] text-[14px] text-gray-600 focus:outline-none resize-none bg-transparent placeholder-gray-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* Job Description Input */}
            <div className="border border-[#E5E7EB] rounded-xl p-5 flex flex-col gap-4">
              <label className="text-[16px] font-semibold text-gray-900">
                Job Description
              </label>
              <div className="border border-[#E5E7EB] rounded-lg p-4">
                <textarea
                  value={state.jobDescription}
                  onChange={handleJobDescriptionChange}
                  placeholder="Paste the full job description here..."
                  className="w-full h-[200px] text-[14px] text-gray-600 focus:outline-none resize-none bg-transparent placeholder-gray-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleCheckATS}
              disabled={state.isChecking || !state.resume.trim() || !state.jobDescription.trim()}
              className={`w-full py-4 px-6 rounded-xl text-[16px] font-semibold flex items-center justify-center gap-3 transition-all ${
                state.resume.trim() && state.jobDescription.trim()
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              } disabled:opacity-50`}
            >
              <FileText size={20} />
              {state.isChecking ? "Analyzing..." : "Analyze Match"}
            </button>
          </motion.div>

          {/* Right Section - Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col"
          >
            {/* Content Area */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 min-h-[500px]">
              {state.results ? (
                <div className="space-y-8">
                  {/* Score Card */}
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 text-center text-white shadow-xl">
                    <p className="text-[14px] font-medium uppercase tracking-wide mb-4 opacity-90">
                      ATS Compatibility Score
                    </p>
                    <div className="text-[72px] font-bold mb-3">
                      {state.results.score}%
                    </div>
                    <p className="text-[16px] opacity-90">
                      Your resume is moderately optimized for ATS systems
                    </p>
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Key Suggestions
                      </h4>
                      <div className="space-y-3">
                        {state.results.suggestions.map((suggestion, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-emerald-600 text-xs font-bold">•</span>
                            </div>
                            <p className="text-[15px] text-gray-700 leading-relaxed">
                              {suggestion}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Improvements to Make
                      </h4>
                      <div className="space-y-3">
                        {state.results.improvements.map((improvement, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-emerald-600 text-xs font-bold">•</span>
                            </div>
                            <p className="text-[15px] text-gray-700 leading-relaxed">
                              {improvement}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => handleDownload("jpg")}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Download size={16} />
                      Download JPG
                    </button>
                    <button
                      onClick={() => handleDownload("pdf")}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Download size={16} />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleDownload("docs")}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Download size={16} />
                      Download DOCS
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <p className="text-[18px] text-gray-500">
                    {state.isChecking
                      ? "Analyzing your resume..."
                      : "Results will appear here"}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
