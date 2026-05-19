import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, AlertCircle, Upload, Copy, CheckCircle2 } from "lucide-react";
import { calculateATSScore } from "../utils/keyword-extractor";
import { analyzeATS } from "../lib/gemini";
import { getDynamicSuggestionsFromOpenRouter } from "../lib/openrouter";
import { extractTextFromFile } from "../utils/file-parser";

interface ATSCheckState {
  resume: string;
  jobDescription: string;
  isChecking: boolean;
  error?: string;
  results?: {
    score: number;
    summary?: string;
    strengths?: string[];
    suggestions: string[];
    missingKeywords?: string[];
    improvements: string[];
    isAI?: boolean;
  };
}

export default function ATSCheckerPage() {
  const [copied, setCopied] = useState(false);
  const [isExportCopied, setIsExportCopied] = useState(false);
  const [state, setState] = useState<ATSCheckState>({
    resume: "",
    jobDescription: "",
    isChecking: false,
  });

  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Scanning resume for ATS keywords...",
    "Comparing experience with job requirements...",
    "Checking formatting and structure...",
    "Generating personalized improvements...",
    "Finalizing score..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isChecking) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [state.isChecking]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await extractTextFromFile(file);
      setState((prev) => ({ ...prev, resume: content }));
    } catch (err) {
      console.error("File parsing error:", err);
      alert("Failed to read file. Please ensure it's a valid text, PDF, or DOCX file.");
    }
    
    // Reset the input so the same file can be uploaded again
    e.target.value = '';
  };

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

    setState({ ...state, isChecking: true, error: undefined });

    try {
      // 1. Try Gemini AI for robust analysis
      try {
        const aiResults = await analyzeATS(state.resume, state.jobDescription);
        setState((prev) => ({
          ...prev,
          isChecking: false,
          results: {
            ...aiResults,
            isAI: true,
          },
        }));
        return;
      } catch (aiError) {
        console.warn("Gemini AI analysis failed, falling back to manual logic:", aiError);
      }

      // 2. Fallback to improved manual scoring based on keyword overlap
      // 2. Fallback to improved manual scoring based on keyword overlap
      const manual = calculateATSScore(state.resume, state.jobDescription);
      let score = manual.score;
      let missing = manual.missing;

      let summary: string | undefined;
      let strengths: string[] | undefined;
      let suggestions: string[] = [];
      let missingKeywords: string[] | undefined;
      let improvements: string[] = [];
      let isAI = false;

      // Wrap OpenRouter call in a timeout configured by environment variable
      const envTimeout = parseInt(import.meta.env.VITE_OPENROUTER_TIMEOUT_SECONDS || "60", 10);
      const timeoutSeconds = isNaN(envTimeout) ? 60 : envTimeout;
      
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutSeconds * 1000);

      try {
        const dynamicFeedback = await getDynamicSuggestionsFromOpenRouter(state.resume, state.jobDescription, abortController.signal);
        clearTimeout(timeoutId);
        score = dynamicFeedback.score ?? score;
        summary = dynamicFeedback.summary;
        strengths = dynamicFeedback.strengths;
        suggestions = dynamicFeedback.suggestions || [];
        missingKeywords = dynamicFeedback.missingKeywords;
        improvements = dynamicFeedback.improvements || [];
        isAI = true;
      } catch (openRouterError: any) {
        clearTimeout(timeoutId);
        
        if (openRouterError.name === 'AbortError') {
          throw new Error("Analysis timed out. Too many requests. Please try again.");
        }

        console.warn("OpenRouter dynamic feedback failed, falling back to static suggestions:", openRouterError);
        suggestions = missing.slice(0, 5).map((kw) => `Add the keyword "${kw}" to your resume`).concat([
          "Include specific metrics and achievements",
          "Improve formatting for ATS compatibility",
        ]);

        improvements = [
          "Use action verbs at the start of bullet points",
          "Match the job description language",
          "Highlight technical skills mentioned in the job posting",
        ];
        isAI = false;
      }

      setState((prev) => ({
        ...prev,
        isChecking: false,
        results: {
          score,
          summary,
          strengths,
          suggestions,
          missingKeywords,
          improvements,
          isAI,
        },
      }));
    } catch (error: any) {
      console.error("ATS checking failed:", error);
      setState((prev) => ({
        ...prev,
        isChecking: false,
        error: error.message || "Something went wrong. Please try again.",
      }));
    }
  };

  const generateExportText = () => {
    if (!state.results) return "";
    let text = `ATS Compatibility Score: ${state.results.score}%\n\n`;
    if (state.results.summary) text += `Executive Summary:\n${state.results.summary}\n\n`;
    if (Array.isArray(state.results.strengths) && state.results.strengths.length) {
      text += `Key Strengths:\n${state.results.strengths.map(s => `- ${s}`).join("\n")}\n\n`;
    }
    if (Array.isArray(state.results.missingKeywords) && state.results.missingKeywords.length) {
      text += `Missing Keywords:\n${state.results.missingKeywords.join(", ")}\n\n`;
    }
    if (Array.isArray(state.results.suggestions) && state.results.suggestions.length) {
      text += `Key Suggestions:\n${state.results.suggestions.map(s => `- ${s}`).join("\n")}\n\n`;
    }
    if (Array.isArray(state.results.improvements) && state.results.improvements.length) {
      text += `Improvements to Make:\n${state.results.improvements.map(s => `- ${s}`).join("\n")}\n`;
    }
    return text;
  };

  const handleCopyTxt = () => {
    navigator.clipboard.writeText(generateExportText());
    setIsExportCopied(true);
    setTimeout(() => setIsExportCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generateExportText()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ATS_Review_Results.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Loading Overlay */}
      {state.isChecking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-md transition-all duration-300">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4 border border-gray-100"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-4 border-[#0066FF] border-t-transparent"
              ></motion.div>
              <FileText className="text-[#0066FF] w-6 h-6" />
            </div>
            
            <div className="flex flex-col items-center gap-2 mt-2">
              <h3 className="text-[18px] font-bold text-gray-900 font-display">Analyzing Resume</h3>
              <div className="h-[20px] flex items-center justify-center">
                <motion.p 
                  key={loadingStep}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[14px] text-gray-500 text-center"
                >
                  {loadingMessages[loadingStep]}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
              <div className="flex justify-between items-center">
                <label className="text-[16px] font-semibold text-gray-900">
                  Your Resume
                </label>
                <label className="cursor-pointer flex items-center gap-1.5 text-sm text-[#0066FF] hover:text-blue-700 font-medium transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload file
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
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
              {state.error ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <p className="text-[18px] text-gray-900 font-medium mb-2">Timeout Error</p>
                  <p className="text-[14px] text-gray-500 max-w-xs">{state.error}</p>
                  <button 
                    onClick={handleCheckATS}
                    className="mt-6 text-emerald-600 font-semibold hover:underline"
                  >
                    Try Again
                  </button>
                </div>
              ) : state.results ? (
                <div className="space-y-8">
                  {/* Score Card */}
                  <div className={`bg-gradient-to-br ${
                    state.results.score >= 80 
                      ? "from-emerald-500 to-emerald-600" 
                      : state.results.score >= 50
                      ? "from-amber-500 to-amber-600"
                      : "from-red-500 to-red-600"
                  } rounded-2xl p-8 text-center text-white shadow-xl relative overflow-hidden transition-colors duration-500`}>
                    {state.results.isAI && (
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        AI Powered
                      </div>
                    )}
                    <p className="text-[14px] font-medium uppercase tracking-wide mb-4 opacity-90">
                      ATS Compatibility Score
                    </p>
                    <div className="text-[72px] font-bold mb-3">
                      {state.results.score}%
                    </div>
                    <p className="text-[16px] opacity-90">
                      {state.results.score >= 80 
                        ? "Excellent match! Your resume is highly optimized." 
                        : state.results.score >= 50 
                        ? "Good match, but there's room for improvement."
                        : "Low match. Consider adding more keywords from the job description."}
                    </p>
                  </div>

                  {/* Summary */}
                  {state.results.summary && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                      <h4 className="text-[16px] font-semibold text-blue-900 mb-2">Executive Summary</h4>
                      <p className="text-[14px] text-blue-800 leading-relaxed">
                        {state.results.summary}
                      </p>
                    </div>
                  )}

                  {/* Strengths */}
                  {Array.isArray(state.results.strengths) && state.results.strengths.length > 0 && (
                    <div>
                      <h4 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Key Strengths
                      </h4>
                      <div className="space-y-3">
                        {state.results.strengths.map((strength, idx) => (
                          <div key={idx} className="flex gap-3 items-start">
                            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-blue-600 text-xs font-bold">✓</span>
                            </div>
                            <p className="text-[15px] text-gray-700 leading-relaxed">
                              {strength}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {Array.isArray(state.results.missingKeywords) && state.results.missingKeywords.length > 0 && (
                    <div>
                      <h4 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {state.results.missingKeywords.map((kw, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-sm font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-[18px] font-semibold text-gray-900 flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Key Suggestions
                        </h4>
                        <button 
                          onClick={() => {
                            if (state.results?.suggestions) {
                              navigator.clipboard.writeText(state.results.suggestions.join('\n'));
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }
                          }}
                          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                        >
                          {copied ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {Array.isArray(state.results.suggestions) && state.results.suggestions.map((suggestion, idx) => (
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
                        {Array.isArray(state.results.improvements) && state.results.improvements.map((improvement, idx) => (
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
                      onClick={handleCopyTxt}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      {isExportCopied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      {isExportCopied ? "Copied!" : "Copy TXT"}
                    </button>
                    <button
                      onClick={handleDownloadTxt}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <Download size={16} />
                      Download TXT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <p className="text-[18px] text-gray-500">
                    Results will appear here
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}
