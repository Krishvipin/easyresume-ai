import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { copyToClipboard } from "../lib/utils";
import {
  Upload,
  FileText,
  RefreshCw,
  Plus,
  Trash2,
  User,
  Briefcase,
  Sparkles,
  Copy,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { generateCoverLetterPrompt } from "../lib/cover-letter-prompt";
import { generateCoverLetterFromOpenRouter } from "../lib/openrouter";
import { SEO } from "../components/seo/SEO";
import { SITE, getCanonicalUrl } from "../config/site";

interface UserInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
}

interface JobDetail {
  id: string;
  role: string;
  company: string;
  hiringManager: string;
}

interface CoverLetterState {
  userInfo: UserInfo;
  jobDetails: JobDetail[];
  jobDescription: string;
  isGenerating: boolean;
  generatedLetter?: string;
}

export default function CoverLetterPage() {
  const [state, setState] = useState<CoverLetterState>(() => {
    const saved = localStorage.getItem("easyresume_cover_letter_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          userInfo: parsed.userInfo || { fullName: "", email: "", phone: "", location: "" },
          jobDetails: parsed.jobDetails || [{ id: "1", role: "", company: "", hiringManager: "" }],
          jobDescription: parsed.jobDescription || "",
          isGenerating: false,
          generatedLetter: parsed.generatedLetter,
        };
      } catch (e) {}
    }
    return {
      userInfo: { fullName: "", email: "", phone: "", location: "" },
      jobDetails: [{ id: "1", role: "", company: "", hiringManager: "" }],
      jobDescription: "",
      isGenerating: false,
    };
  });

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!state.isGenerating) {
      localStorage.setItem(
        "easyresume_cover_letter_data",
        JSON.stringify({
          userInfo: state.userInfo,
          jobDetails: state.jobDetails,
          jobDescription: state.jobDescription,
          generatedLetter: state.generatedLetter,
        })
      );
    }
  }, [state.userInfo, state.jobDetails, state.jobDescription, state.generatedLetter, state.isGenerating]);

  const handleResetForm = () => {
    setState({
      userInfo: { fullName: "", email: "", phone: "", location: "" },
      jobDetails: [{ id: "1", role: "", company: "", hiringManager: "" }],
      jobDescription: "",
      isGenerating: false,
      generatedLetter: undefined,
    });
    localStorage.removeItem("easyresume_cover_letter_data");
  };

  // User Info handlers
  const handleUserInfoChange = (field: keyof UserInfo, value: string) => {
    setState({
      ...state,
      userInfo: { ...state.userInfo, [field]: value },
    });
  };

  // Job Details handlers
  const handleAddJobDetail = () => {
    const newJobDetail: JobDetail = {
      id: Date.now().toString(),
      role: "",
      company: "",
      hiringManager: "",
    };
    setState({
      ...state,
      jobDetails: [...state.jobDetails, newJobDetail],
    });
  };

  const handleJobDetailChange = (
    id: string,
    field: keyof Omit<JobDetail, "id">,
    value: string,
  ) => {
    setState({
      ...state,
      jobDetails: state.jobDetails.map((detail) =>
        detail.id === id ? { ...detail, [field]: value } : detail,
      ),
    });
  };

  const handleRemoveJobDetail = (id: string) => {
    setState({
      ...state,
      jobDetails: state.jobDetails.filter((detail) => detail.id !== id),
    });
  };

  const handleJobDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setState({ ...state, jobDescription: e.target.value });
  };

  const handleGenerateLetter = async () => {
    if (
      !state.userInfo.fullName.trim() ||
      !state.userInfo.email.trim() ||
      state.jobDetails.length === 0 ||
      !state.jobDescription.trim()
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setState({ ...state, isGenerating: true });

    try {
      const jobDetail = state.jobDetails[0];
      const resumeDataStr =
        localStorage.getItem("easyresume_data") || "No resume data provided.";

      const prompt = generateCoverLetterPrompt(
        state.userInfo.fullName,
        state.userInfo.email,
        state.userInfo.phone,
        state.userInfo.location,
        jobDetail.role,
        jobDetail.company,
        jobDetail.hiringManager,
        state.jobDescription,
        resumeDataStr,
      );

      let letterText = "";

      // Call OpenRouter directly
      const envTimeout = parseInt(
        import.meta.env.VITE_OPENROUTER_TIMEOUT_SECONDS || "60",
        10,
      );
      const timeoutSeconds = isNaN(envTimeout) ? 60 : envTimeout;
      const abortController = new AbortController();
      const timeoutId = setTimeout(
        () => abortController.abort(),
        timeoutSeconds * 1000,
      );

      try {
        letterText = await generateCoverLetterFromOpenRouter(
          prompt,
          abortController.signal,
        );
        clearTimeout(timeoutId);
      } catch (openRouterError: any) {
        clearTimeout(timeoutId);
        if (openRouterError.name === "AbortError") {
          throw new Error("Generation timed out. Please try again.");
        }
        throw openRouterError;
      }

      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generatedLetter: letterText,
      }));
    } catch (error: any) {
      console.error("Cover letter generation failed:", error);
      alert(error.message || "Failed to generate cover letter.");
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleCopyText = async () => {
    if (!state.generatedLetter) return;
    const success = await copyToClipboard(state.generatedLetter);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setState({
      userInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
      },
      jobDetails: [
        {
          id: "1",
          role: "",
          company: "",
          hiringManager: "",
        },
      ],
      jobDescription: "",
      isGenerating: false,
      generatedLetter: undefined,
    });
  };

  const coverLetterJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE.url}/cover-letter#webpage`,
        "url": getCanonicalUrl("/cover-letter"),
        "name": "AI Cover Letter Generator | Create a Tailored Cover Letter | EasyResume AI",
        "description":
          "Generate a tailored cover letter based on your target role, company and job description with EasyResume AI.",
        "isPartOf": {
          "@id": `${SITE.url}/#website`,
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE.url}/cover-letter#app`,
        "name": "EasyResume AI Cover Letter Generator",
        "url": getCanonicalUrl("/cover-letter"),
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "description":
          "AI-powered cover letter generator that creates tailored, professional job application letters.",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE.url}/cover-letter#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": getCanonicalUrl("/"),
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Cover Letter",
            "item": getCanonicalUrl("/cover-letter"),
          },
        ],
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col pt-10 sm:pt-16 md:pt-20 pb-12 sm:pb-20">
      <SEO
        title="AI Cover Letter Generator | Create a Tailored Cover Letter | EasyResume AI"
        description="Generate a tailored cover letter based on your target role, company and job description with EasyResume AI."
        path="/cover-letter"
        ogImage="/og/cover-letter.png"
        ogAlt="EasyResume AI Cover Letter Generator"
        ogTitle="AI Cover Letter Generator | EasyResume AI"
        ogDescription="Generate a tailored cover letter based on your target role, company and job description."
        twitterTitle="AI Cover Letter Generator | EasyResume AI"
        twitterDescription="Create a tailored cover letter based on your job and company details."
        twitterImage="/og/cover-letter.png"
        twitterAlt="EasyResume AI Cover Letter Generator"
        jsonLd={coverLetterJsonLd}
      />
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-bold tracking-tight text-black font-display"
            >
              AI Cover Letter Generator
            </motion.h1>

            {/* Contextual Link to Resume Builder */}
            <Link
              to="/resume-builder"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#27AE60] hover:text-[#1e8e4d] bg-emerald-50/80 hover:bg-emerald-100 px-3.5 py-1.5 rounded-full transition-all border border-emerald-200/60 w-fit"
            >
              <span>Need a resume first? Create Resume</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base leading-relaxed sm:leading-[26px] text-[#4A4A57] font-normal max-w-3xl"
          >
            Create a tailored cover letter based on your target role, company and job description.
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          {/* Left Section - Inputs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-5"
          >
            {/* Your Info Section */}
            <div className="border border-[#E5E7EB] rounded-xl p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-900" />
                <h3 className="text-sm font-bold text-gray-900">
                  Your Info
                </h3>
              </div>
              <div className="border-t border-[#E5E7EB]" />

              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-gray-500">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={state.userInfo.fullName}
                    onChange={(e) =>
                      handleUserInfoChange("fullName", e.target.value)
                    }
                    placeholder="Sarah"
                    className="p-2.5 border border-[#E5E7EB] rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-gray-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={state.userInfo.email}
                    onChange={(e) =>
                      handleUserInfoChange("email", e.target.value)
                    }
                    placeholder="Sarah@email.com"
                    className="p-2.5 border border-[#E5E7EB] rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-gray-500">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={state.userInfo.phone}
                    onChange={(e) =>
                      handleUserInfoChange("phone", e.target.value)
                    }
                    placeholder="+1 202-555-0143"
                    className="p-2.5 border border-[#E5E7EB] rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-medium text-gray-500">
                    Location
                  </label>
                  <input
                    type="text"
                    value={state.userInfo.location}
                    onChange={(e) =>
                      handleUserInfoChange("location", e.target.value)
                    }
                    placeholder="United States"
                    className="p-2.5 border border-[#E5E7EB] rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="border border-[#E5E7EB] rounded-xl p-4 sm:p-6 flex flex-col gap-5 sm:gap-6 bg-white shadow-sm">
              <div className="flex items-center gap-2">
                <Briefcase size={18} className="text-gray-900" />
                <h3 className="text-[14px] font-bold text-gray-900">
                  Job Details
                </h3>
              </div>
              <div className="border-t border-[#E5E7EB]" />

              <div className="flex flex-col gap-5">
                {state.jobDetails.map((detail) => (
                  <React.Fragment key={detail.id}>
                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-medium text-gray-500">
                        Role Applying for
                      </label>
                      <input
                        type="text"
                        value={detail.role}
                        onChange={(e) =>
                          handleJobDetailChange(
                            detail.id,
                            "role",
                            e.target.value,
                          )
                        }
                        placeholder="Designer"
                        className="p-2.5 border border-[#E5E7EB] rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white placeholder-gray-400"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-medium text-gray-500">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={detail.company}
                        onChange={(e) =>
                          handleJobDetailChange(
                            detail.id,
                            "company",
                            e.target.value,
                          )
                        }
                        placeholder="Google"
                        className="p-2.5 border border-[#E5E7EB] rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white placeholder-gray-400"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[13px] font-medium text-gray-500">
                        Hiring Manager Name
                      </label>
                      <input
                        type="text"
                        value={detail.hiringManager}
                        onChange={(e) =>
                          handleJobDetailChange(
                            detail.id,
                            "hiringManager",
                            e.target.value,
                          )
                        }
                        placeholder="Mr. John"
                        className="p-2.5 border border-[#E5E7EB] rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white placeholder-gray-400"
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Job Description */}
            <div className="border border-[#E5E7EB] rounded-xl p-6 flex flex-col gap-4 bg-white shadow-sm">
              <label className="text-[14px] font-bold text-gray-900">
                Job description
              </label>
              <textarea
                value={state.jobDescription}
                onChange={handleJobDescriptionChange}
                placeholder="Paste the full job description here..."
                className="w-full h-[250px] p-4 border border-[#E5E7EB] rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent resize-none bg-white placeholder-gray-400"
              />
            </div>

            {/* Generate & Reset Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGenerateLetter}
                disabled={
                  state.isGenerating ||
                  !state.userInfo.fullName.trim() ||
                  state.jobDetails.length === 0 ||
                  !state.jobDescription.trim()
                }
                className={`flex-1 text-white py-3.5 px-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  state.userInfo.fullName.trim() &&
                  state.jobDetails.length > 0 &&
                  state.jobDescription.trim()
                    ? "bg-[#27AE60] hover:bg-[#1E8E4D] shadow-md shadow-[#27AE60]/20"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
              >
                {state.isGenerating ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <span>Generate Cover Letter</span>
                    <Sparkles size={18} />
                  </>
                )}
              </button>

              {(state.userInfo.fullName || state.jobDescription || state.generatedLetter) && (
                <button
                  onClick={handleResetForm}
                  title="Reset form fields and generated letter"
                  className="flex items-center justify-center gap-2 py-3.5 px-5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Right Section - Output */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4"
          >
            {/* Output Label */}
            <div className="flex items-center justify-between">
              <label className="text-[16px] font-normal text-black">
                Your Cover Letter
              </label>
              {state.generatedLetter && (
                <button
                  onClick={handleCopyText}
                  className={`flex items-center gap-2 px-3 py-2 border rounded text-[12px] font-medium transition-all ${
                    isCopied
                      ? "border-[#27AE60] text-[#27AE60] bg-green-50"
                      : "border-black text-black hover:bg-[#fcfcfc]"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 size={14} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      Copy Text
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Output Area */}
            <div className="border border-[#DADAE3] rounded-lg p-4 min-h-[540px] bg-white overflow-y-auto">
              {state.generatedLetter ? (
                <div className="text-[14px] font-normal text-[#2A2A2A] whitespace-pre-wrap leading-relaxed">
                  {state.generatedLetter}
                </div>
              ) : state.isGenerating ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw
                      size={48}
                      className="mx-auto text-[#27AE60] mb-4 animate-spin"
                    />
                    <p className="text-[16px] font-normal text-[#7A7A8C]">
                      AI is generating your cover letter...
                    </p>
                    <p className="text-[12px] text-[#7A7A8C] mt-2">
                      This usually takes a few minutes
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileText
                      size={48}
                      className="mx-auto text-[#7A7A8C] mb-4"
                    />
                    <h3 className="text-[16px] font-normal text-black mb-2">
                      No cover letter yet
                    </h3>
                    <p className="text-[16px] font-normal text-[#7A7A8C] max-w-xs">
                      Fill in your info, job details and job description, then
                      click Generate to get started.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {state.generatedLetter && (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border border-[#DADAE3] text-black rounded text-[14px] font-medium hover:bg-[#fcfcfc] transition-all"
                >
                  Start Over
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
