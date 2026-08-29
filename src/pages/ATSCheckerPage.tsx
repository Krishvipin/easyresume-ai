import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, FileText, AlertCircle, Copy, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { calculateATSScore } from "../utils/keyword-extractor";
import { getDynamicSuggestionsFromOpenRouter } from "../lib/openrouter";
import { copyToClipboard } from "../lib/utils";

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

const logDev = (...args: any[]) => {
  console.log("[EasyResume AI]", ...args);
};

export default function ATSCheckerPage() {
  const navigate = useNavigate();

  const [state, setState] = useState<ATSCheckState>(() => {
    const saved = localStorage.getItem("easyresume_ats_checker_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          resume: parsed.resume || "",
          jobDescription: parsed.jobDescription || "",
          isChecking: false,
          error: parsed.error,
          results: parsed.results,
        };
      } catch (e) {}
    }
    return {
      resume: "",
      jobDescription: "",
      isChecking: false,
    };
  });

  const [loadingStep, setLoadingStep] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!state.isChecking) {
      localStorage.setItem(
        "easyresume_ats_checker_data",
        JSON.stringify({
          resume: state.resume,
          jobDescription: state.jobDescription,
          error: state.error,
          results: state.results,
        })
      );
    }
  }, [state.resume, state.jobDescription, state.results, state.error, state.isChecking]);

  const handleResetScan = () => {
    logDev("[ATSChecker] Resetting ATS scanner state");
    setState({
      resume: "",
      jobDescription: "",
      isChecking: false,
    });
    localStorage.removeItem("easyresume_ats_checker_data");
  };

  const handleSendToTailorResume = () => {
    const rawData = state.results?.rawData;
    let atsReportSummary = "";
    if (rawData) {
      const summaryText = rawData.summary || "";
      const missingSkills = (rawData.missingSkills || [])
        .map((s: any) => typeof s === "string" ? s : `${s.term || s.skill || s.name || ""} (${s.importance || "Required"})`)
        .join(", ");
      const recs = (rawData.recommendations || []).map((r: any) => typeof r === "string" ? r : `${r.title || r.name || "Recommendation"}: ${r.description || r.desc || ""}`).join("\n- ");
      
      atsReportSummary = `Summary: ${summaryText}\n\nMissing Skills: ${missingSkills}\n\nKey Recommendations:\n- ${recs}`;
    } else if (state.results?.suggestions) {
      atsReportSummary = state.results.suggestions.join("\n");
    }

    const tailorData = {
      jobDescription: state.jobDescription,
      atsReport: atsReportSummary,
    };

    logDev("[ATSChecker] Sending Job Description and ATS Report to Tailor Resume page:", tailorData);
    localStorage.setItem("easyresume_tailor_input_data", JSON.stringify(tailorData));
    navigate("/resume-builder");
  };

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

    logDev("[ATSChecker] Starting ATS analysis...");
    setState({ ...state, isChecking: true, error: undefined });

    try {
      let aiResult: any = null;

      // Call OpenRouter AI directly
      const envTimeout = parseInt(import.meta.env.VITE_OPENROUTER_TIMEOUT_SECONDS || "60", 10);
      const timeoutSeconds = isNaN(envTimeout) ? 60 : envTimeout;
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), timeoutSeconds * 1000);

      try {
        logDev("[ATSChecker] Calling OpenRouter AI...");
        const openRouterRes: any = await getDynamicSuggestionsFromOpenRouter(
          state.resume,
          state.jobDescription,
          abortController.signal
        );
        clearTimeout(timeoutId);
        if (openRouterRes && !("error" in openRouterRes)) {
          logDev("[ATSChecker] OpenRouter AI succeeded:", openRouterRes);
          aiResult = openRouterRes;
        }
      } catch (openRouterError: any) {
        clearTimeout(timeoutId);
        logDev("[ATSChecker] OpenRouter AI analysis failed:", openRouterError);
      }

      // 3. If any AI provider succeeded, populate result state
      if (aiResult) {
        logDev("[ATSChecker] Displaying AI result in UI:", aiResult);
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
      logDev("[ATSChecker] Step 3: Falling back to local keyword overlap algorithm...");
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
    
    copyToClipboard(text.trim()).then((success) => {
      if (success) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    });
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

      <div className="flex-1 flex flex-col pt-10 sm:pt-16 md:pt-20 pb-12 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-8 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight text-black font-display"
          >
            ATS Score Checker
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base leading-relaxed sm:leading-[26px] text-[#4A4A57] font-normal max-w-[667px]"
          >
            Paste your resume + a job description — AI shows exactly what to
            change before you apply.
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 sm:gap-8">
          {/* Left Section - Inputs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Resume Input */}
            <div className="border border-[#E5E7EB] rounded-xl p-4 sm:p-5 flex flex-col gap-4">
              <label className="text-base font-semibold text-gray-900">
                Your Resume
              </label>
              <div className="border border-[#E5E7EB] rounded-lg p-3 sm:p-4">
                <textarea
                  value={state.resume}
                  onChange={handleResumeChange}
                  placeholder="Paste your resume content here..."
                  className="w-full h-[180px] sm:h-[200px] text-sm text-gray-600 focus:outline-none resize-none bg-transparent placeholder-gray-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* Job Description Input */}
            <div className="border border-[#E5E7EB] rounded-xl p-4 sm:p-5 flex flex-col gap-4">
              <label className="text-base font-semibold text-gray-900">
                Job Description
              </label>
              <div className="border border-[#E5E7EB] rounded-lg p-3 sm:p-4">
                <textarea
                  value={state.jobDescription}
                  onChange={handleJobDescriptionChange}
                  placeholder="Paste the full job description here..."
                  className="w-full h-[180px] sm:h-[200px] text-sm text-gray-600 focus:outline-none resize-none bg-transparent placeholder-gray-400"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* Analyze & Reset Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCheckATS}
                disabled={state.isChecking || !state.resume.trim() || !state.jobDescription.trim()}
                className={`flex-1 py-4 px-6 rounded-xl text-[16px] font-semibold flex items-center justify-center gap-3 transition-all ${
                  state.resume.trim() && state.jobDescription.trim()
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                } disabled:opacity-50`}
              >
                <FileText size={20} />
                {state.isChecking ? "Analyzing..." : "Analyze Match"}
              </button>

              {(state.resume || state.jobDescription || state.results) && (
                <button
                  onClick={handleResetScan}
                  title="Reset inputs and scan results"
                  className="px-4 py-4 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 text-[14px]"
                >
                  <RotateCcw size={18} />
                  <span>Reset</span>
                </button>
              )}
            </div>
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
                  <div
                    className={`rounded-2xl p-8 text-center text-white shadow-xl bg-gradient-to-br ${
                      state.results.score >= 80
                        ? "from-emerald-500 to-emerald-600"
                        : state.results.score >= 60
                        ? "from-amber-500 to-amber-600"
                        : "from-amber-600 to-rose-600"
                    }`}
                  >
                    <p className="text-[14px] font-medium uppercase tracking-wide mb-2 opacity-90">
                      ATS Compatibility Score
                    </p>
                    <div className="text-[64px] font-extrabold mb-1 leading-none">
                      {state.results.score}%
                    </div>
                    {state.results.rawData?.scoreLabel && (
                      <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-[13px] font-semibold mb-4 backdrop-blur-sm">
                        {state.results.rawData.scoreLabel}
                      </span>
                    )}
                    <p className="text-[15px] opacity-95 leading-relaxed max-w-lg mx-auto">
                      {state.results.rawData?.summary ||
                        "Your resume alignment score evaluated against job requirements."}
                    </p>
                  </div>

                  {/* Score Breakdown (if rawData breakdown exists) */}
                  {state.results.rawData?.breakdown && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
                      <h4 className="text-[16px] font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Category Score Breakdown
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {Object.entries(state.results.rawData.breakdown).map(
                          ([key, item]: [string, any]) => {
                            if (!item || typeof item.score !== "number") return null;
                            const label = key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase());
                            const percentage = Math.round(
                              (item.score / (item.maxScore || 1)) * 100
                            );
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-[13px] text-gray-700 font-medium">
                                  <span>{label}</span>
                                  <span>
                                    {item.score} / {item.maxScore}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* Matched Skills */}
                  {Array.isArray(state.results.rawData?.matchedSkills) &&
                    state.results.rawData.matchedSkills.length > 0 && (
                      <div>
                        <h4 className="text-[18px] font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          Matched Skills ({state.results.rawData.matchedSkills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {state.results.rawData.matchedSkills.map((ms: any, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[13px] font-medium"
                              title={ms.evidence || ""}
                            >
                              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
                              {ms.term}
                              {ms.importance && (
                                <span className="text-[10px] uppercase font-bold text-emerald-600 opacity-75">
                                  ({ms.importance})
                                </span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Missing Skills / Key Suggestions */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        Missing Qualifications & Keywords
                      </h4>
                      {Array.isArray(state.results.rawData?.missingSkills) &&
                      state.results.rawData.missingSkills.length > 0 ? (
                        <div className="space-y-3">
                          {state.results.rawData.missingSkills.map((ms: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                              <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-amber-700 text-xs font-bold">•</span>
                              </div>
                              <div className="text-[14px]">
                                <span className="font-semibold text-gray-900">{ms.term}</span>
                                {ms.importance && (
                                  <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-100 text-amber-800">
                                    {ms.importance}
                                  </span>
                                )}
                                <p className="text-gray-600 mt-1 text-[13.5px] leading-relaxed">
                                  {ms.reason}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Array.isArray(state.results.suggestions) &&
                            state.results.suggestions.map((suggestion, idx) => (
                              <div key={idx} className="flex gap-3 items-start">
                                <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-amber-700 text-xs font-bold">•</span>
                                </div>
                                <p className="text-[15px] text-gray-700 leading-relaxed">
                                  {suggestion}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Recommendations / Improvements to Make */}
                    <div>
                      <h4 className="text-[18px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Top Recommendations & Improvements
                      </h4>
                      {Array.isArray(state.results.rawData?.recommendations) &&
                      state.results.rawData.recommendations.length > 0 ? (
                        <div className="space-y-3">
                          {state.results.rawData.recommendations.map((rec: any, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                              <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-700 text-xs font-bold">
                                {rec.priority || idx + 1}
                              </div>
                              <div className="text-[14px]">
                                <span className="font-semibold text-gray-900">{rec.title}</span>
                                <p className="text-gray-600 mt-1 text-[13.5px] leading-relaxed">
                                  {rec.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {Array.isArray(state.results.improvements) &&
                            state.results.improvements.map((improvement, idx) => (
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
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleCopyText}
                      className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-all"
                    >
                      {isCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                      {isCopied ? "Copied!" : "Copy Text"}
                    </button>
                    <button
                      onClick={handleSendToTailorResume}
                      className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 bg-[#27AE60] text-white rounded-xl text-sm font-semibold hover:bg-[#1E8E4D] shadow-md hover:shadow-lg transition-all"
                    >
                      <Sparkles size={16} />
                      <span>Send to Tailor Resume</span>
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
