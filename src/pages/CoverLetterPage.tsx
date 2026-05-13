import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, RefreshCw, Plus, Trash2 } from "lucide-react";

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
  const [state, setState] = useState<CoverLetterState>({
    userInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
    },
    jobDetails: [],
    jobDescription: "",
    isGenerating: false,
  });

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
    value: string
  ) => {
    setState({
      ...state,
      jobDetails: state.jobDetails.map((detail) =>
        detail.id === id ? { ...detail, [field]: value } : detail
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
    e: React.ChangeEvent<HTMLTextAreaElement>
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

    // TODO: Integrate with AI API to generate cover letter
    setTimeout(() => {
      const jobDetail = state.jobDetails[0];
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        generatedLetter: `Dear ${jobDetail.hiringManager || "Hiring Manager"},

I am writing to express my strong interest in the ${jobDetail.role} position at ${jobDetail.company}. With my experience and passion for the role, I am confident that I would be an excellent fit for your team.

[AI-generated cover letter content based on job description...]

I am excited about the opportunity to contribute to ${jobDetail.company} and would welcome the chance to discuss how my skills and background align with your needs.

Thank you for considering my application. I look forward to hearing from you.

Sincerely,
${prev.userInfo.fullName}
${prev.userInfo.email}
${prev.userInfo.phone}`,
      }));
    }, 3000);
  };

  const handleDownload = () => {
    if (!state.generatedLetter) return;

    const element = document.createElement("a");
    const file = new Blob([state.generatedLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "cover-letter.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleReset = () => {
    setState({
      userInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
      },
      jobDetails: [],
      jobDescription: "",
      isGenerating: false,
      generatedLetter: undefined,
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
            Generate Cover Letter
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[16px] leading-[26px] text-[#4A4A57] font-normal max-w-[667px]"
          >
            Create a personalized cover letter in minutes with AI assistance.
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
            <div className="border border-[#DADAE3] rounded-lg p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-black rounded" />
                <h3 className="text-[12px] font-medium text-black">
                  Your Info
                </h3>
              </div>
              <div className="border-t border-[#DADAE3]" />

              {/* Full Name & Email */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#7A7A8C]">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={state.userInfo.fullName}
                    onChange={(e) =>
                      handleUserInfoChange("fullName", e.target.value)
                    }
                    placeholder="Prashanth"
                    className="p-2 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#7A7A8C]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={state.userInfo.email}
                    onChange={(e) =>
                      handleUserInfoChange("email", e.target.value)
                    }
                    placeholder="prashanth@email.com"
                    className="p-2 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#7A7A8C]">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={state.userInfo.phone}
                    onChange={(e) =>
                      handleUserInfoChange("phone", e.target.value)
                    }
                    placeholder="+91 9962139116"
                    className="p-2 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-medium text-[#7A7A8C]">
                    Location
                  </label>
                  <input
                    type="text"
                    value={state.userInfo.location}
                    onChange={(e) =>
                      handleUserInfoChange("location", e.target.value)
                    }
                    placeholder="Chennai"
                    className="p-2 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="border border-[#DADAE3] rounded-lg p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-black rounded" />
                  <h3 className="text-[12px] font-medium text-black">
                    Job Details
                  </h3>
                </div>
                <button
                  onClick={handleAddJobDetail}
                  className="flex items-center gap-1 px-2 py-1 bg-[#27AE60] text-white rounded text-[12px] font-medium hover:bg-[#1E8E4D] transition-all"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
              <div className="border-t border-[#DADAE3]" />

              {/* Job Details List */}
              <div className="flex flex-col gap-4">
                {state.jobDetails.map((detail) => (
                  <div key={detail.id} className="flex flex-col gap-3 pb-4 border-b border-[#DADAE3] last:border-b-0 last:pb-0">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#7A7A8C]">
                        Role Applying for
                      </label>
                      <input
                        type="text"
                        value={detail.role}
                        onChange={(e) =>
                          handleJobDetailChange(detail.id, "role", e.target.value)
                        }
                        placeholder="Designer"
                        className="p-2 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#7A7A8C]">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={detail.company}
                        onChange={(e) =>
                          handleJobDetailChange(
                            detail.id,
                            "company",
                            e.target.value
                          )
                        }
                        placeholder="Google"
                        className="p-2 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] font-medium text-[#7A7A8C]">
                        Hiring Manager Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={detail.hiringManager}
                          onChange={(e) =>
                            handleJobDetailChange(
                              detail.id,
                              "hiringManager",
                              e.target.value
                            )
                          }
                          placeholder="Mr. John"
                          className="flex-1 p-2 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent bg-white"
                        />
                        <button
                          onClick={() => handleRemoveJobDetail(detail.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {state.jobDetails.length === 0 && (
                  <p className="text-[12px] text-[#7A7A8C] text-center py-2">
                    Click "Add" to add job details
                  </p>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="border border-[#DADAE3] rounded-lg p-4 flex flex-col gap-3">
              <label className="text-[12px] font-medium text-black">
                Job description
              </label>
              <textarea
                value={state.jobDescription}
                onChange={handleJobDescriptionChange}
                placeholder="Paste the full job description here..."
                className="w-full h-[200px] p-3 border border-[#DADAE3] rounded text-[12px] font-medium text-[#7A7A8C] focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent resize-none bg-white"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateLetter}
              disabled={
                state.isGenerating ||
                !state.userInfo.fullName.trim() ||
                state.jobDetails.length === 0 ||
                !state.jobDescription.trim()
              }
              className={`w-full text-white py-2 px-3 rounded text-[16px] font-normal flex items-center justify-center gap-2 transition-all ${
                state.userInfo.fullName.trim() &&
                state.jobDetails.length > 0 &&
                state.jobDescription.trim()
                  ? "bg-[#27AE60] hover:bg-[#1E8E4D]"
                  : "bg-[#7A7A8C] hover:bg-[#6A6A7C]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {state.isGenerating ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Resume
                  <Plus size={16} />
                </>
              )}
            </button>
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
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 border border-black rounded text-[12px] font-medium text-black hover:bg-[#fcfcfc] transition-all"
                >
                  <Upload size={14} />
                  Download
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
                    <FileText size={48} className="mx-auto text-[#7A7A8C] mb-4" />
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
