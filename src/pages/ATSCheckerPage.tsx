import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, FileText, AlertCircle, Copy, CheckCircle2 } from "lucide-react";
import { calculateATSScore } from "../utils/keyword-extractor";
import { analyzeATS } from "../lib/gemini";
import { getDynamicSuggestionsFromOpenRouter } from "../lib/openrouter";

interface ATSCheckState {
  resume: string;
  jobDescription: string;
  isChecking: boolean;
  error?: string;
  results?: {
    score: number;
    suggestions: string[];
    improvements: string[];
    rawData?: any;
  };
}

export default function ATSCheckerPage() {
  const [state, setState] = useState<ATSCheckState>({
    resume: "",
    jobDescription: "",
    isChecking: false,
  });
  const [loadingStep, setLoadingStep] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

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
      let aiResult: any = null;

      // 1. Try Gemini AI if key is configured
      try {
        const geminiRes: any = await analyzeATS(state.resume, state.jobDescription);
        if (geminiRes && !("error" in geminiRes)) {
          aiResult = geminiRes;
        }
      } catch (geminiError) {
        console.warn("Gemini AI analysis unavailable, attempting OpenRouter:", geminiError);
      }

      // 2. Try OpenRouter (with model fallbacks inside) if Gemini was not available or failed
      if (!aiResult) {
        const envTimeout = parseInt(import.meta.env.VITE_OPENROUTER_TIMEOUT_SECONDS || "60", 10);
        const timeoutSeconds = isNaN(envTimeout) ? 60 : envTimeout;
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), timeoutSeconds * 1000);

        try {
          const openRouterRes: any = await getDynamicSuggestionsFromOpenRouter(
            state.resume,
            state.jobDescription,
            abortController.signal
          );
          clearTimeout(timeoutId);
          if (openRouterRes && !("error" in openRouterRes)) {
            aiResult = openRouterRes;
          }
        } catch (openRouterError: any) {
          clearTimeout(timeoutId);
          console.warn("OpenRouter AI analysis failed:", openRouterError);
        }
      }

      // 3. If any AI provider succeeded, populate result state
      if (aiResult) {
        const suggestions = (aiResult.missingSkills || []).map(
          (ms: any) => `Add the keyword "${ms.term}": ${ms.reason || "Missing requirement from job description."}`
        );
        const improvements = (aiResult.recommendations || []).map(
          (r: any) => `${r.title}: ${r.description}`
        );

        setState((prev) => ({
          ...prev,
          isChecking: false,
          results: {
            score: typeof aiResult.score === "number" ? aiResult.score : 70,
            suggestions: suggestions.length > 0 ? suggestions : ["Align experience bullets with job description requirements."],
            improvements: improvements.length > 0 ? improvements : ["Add measurable outcomes and specific metrics."],
            rawData: aiResult,
          },
        }));
        return;
      }

      // 4. Local Keyword Overlap Fallback when AI models fail or are unconfigured
      const manual = calculateATSScore(state.resume, state.jobDescription);
      const score = manual.score;
      const missing = manual.missing;

      const suggestions = missing
        .slice(0, 5)
        .map((kw) => `Add the keyword "${kw}" to your resume`)
        .concat([
          "Include specific metrics and achievements",
          "Improve formatting for ATS compatibility",
        ]);

      const improvements = [
        "Use action verbs at the start of bullet points",
        "Match the job description language",
        "Highlight technical skills mentioned in the job posting",
      ];

      const rawData = {
        score,
        scoreLabel: score >= 80 ? "Strong Match" : score >= 50 ? "Moderate Match" : "Weak Match",
        summary: "This is a basic keyword matching score generated locally because AI providers are unavailable.",
        matchedSkills: manual.matched.map((m: string) => ({ term: m, importance: "keyword" })),
        missingSkills: manual.missing.map((m: string) => ({ term: m, importance: "keyword" })),
        recommendations: missing.slice(0, 5).map((m: string) => ({ title: `Add missing keyword: ${m}`, description: "This keyword is present in the job description." }))
      };

      setState((prev) => ({
        ...prev,
        isChecking: false,
        results: {
          score,
          suggestions,
          improvements,
          rawData,
        },
      }));
    } catch (error: any) {
      console.error("ATS checking failed:", error);
      setState((prev) => ({
        ...prev,
        isChecking: false,
        error: error.message || "Something went wrong. Please try again.",
      }));
    } finally {
      setState((prev) => ({ ...prev, isChecking: false }));
    }
  };

  const handleCopyText = () => {
    if (!state.results) return;
    
    let text = "";
    if (state.results.rawData) {
      const rd = state.results.rawData;
      text += `ATS Compatibility Score: ${rd.score}% - ${rd.scoreLabel}\n\n`;
      text += `Executive Summary:\n${rd.summary}\n\n`;
      
      if (rd.matchedSkills && rd.matchedSkills.length > 0) {
        text += `Matched Skills:\n`;
        rd.matchedSkills.forEach((s: any) => {
          text += `- ${s.term} (${s.importance})\n`;
        });
        text += `\n`;
      }
      
      if (rd.missingSkills && rd.missingSkills.length > 0) {
        text += `Missing Skills:\n`;
        rd.missingSkills.forEach((s: any) => {
          text += `- ${s.term} (${s.importance})\n`;
        });
        text += `\n`;
      }
      
      if (rd.recommendations && rd.recommendations.length > 0) {
        text += `Top Recommendations:\n`;
        rd.recommendations.forEach((r: any) => {
          text += `- ${r.title}: ${r.description}\n`;
        });
        text += `\n`;
      }
    } else {
      text = `ATS Compatibility Score: ${state.results.score}%\n\n`;
      
      if (state.results.suggestions && state.results.suggestions.length > 0) {
        text += `Key Suggestions:\n`;
        state.results.suggestions.forEach(s => {
          text += `- ${s}\n`;
        });
        text += `\n`;
      }
      
      if (state.results.improvements && state.results.improvements.length > 0) {
        text += `Improvements to Make:\n`;
        state.results.improvements.forEach(i => {
          text += `- ${i}\n`;
        });
        text += `\n`;
      }
    }
    
    navigator.clipboard.writeText(text.trim());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
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

                  {/* Action Buttons */}
                  <div className="flex justify-end items-center gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCopyText}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[14px] font-medium hover:bg-emerald-100 transition-all"
                    >
                      {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {isCopied ? "Copied!" : "Copy Text"}
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
