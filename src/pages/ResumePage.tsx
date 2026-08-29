import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Layout,
  User,
  Link2,
  Briefcase,
  GraduationCap,
  Zap,
  Download,
  FileText,
  Upload,
  Mail,
  Phone,
  MapPin,
  RotateCcw,
  Info,
  ChevronUp,
  ChevronDown,
  Wrench,
  Award,
  Copy,
  CheckCircle2,
  Sparkles,
  PenLine,
  RefreshCw,
} from "lucide-react";
import { modifyResumeWithOpenRouter } from "../lib/openrouter";
import { copyToClipboard } from "../lib/utils";

export interface FormData {
  // Template & Personal Info
  template: "minimal" | "modern" | "professional";
  primaryColor: string;
  secondaryColor: string;
  photo?: string;

  // Personal Information
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  summary: string;

  // LinkedIn & Portfolio
  linksPortfolio: Array<{ label: string; url: string }>;

  // Work Experience
  experiences: Array<{
    id: string;
    position: string;
    company: string;
    duration: string;
    description: string[];
  }>;

  // Education
  education: Array<{
    id: string;
    degree: string;
    school: string;
    duration: string;
    details: string;
  }>;

  // Skills
  skills: string[];

  // Tools
  tools: string[];

  // Certifications
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
}

const initialFormData: FormData = {
  template: "minimal",
  primaryColor: "#1e3a8a",
  secondaryColor: "#475569",
  fullName: "Sarah",
  role: "UIUX Designer",
  email: "Sarah@email.com",
  phone: "+91 9876543210",
  location: "Texas",
  experience: 6,
  summary: "Tell me about yourself short...",
  linksPortfolio: [
    { label: "LinkedIn", url: "Sarah@linkedin.com" },
    { label: "Portfolio", url: "Sarah.com" },
  ],
  experiences: [
    {
      id: "1",
      position: "Designer",
      company: "Google",
      duration: "Jan 2020 - Jan 2026",
      description: ["Write about your job experience.."],
    },
    {
      id: "2",
      position: "Designer",
      company: "Google",
      duration: "Jan 2020 - Jan 2026",
      description: ["Write about your job experience.."],
    },
  ],
  education: [
    {
      id: "1",
      degree: "MBA",
      school: "University",
      duration: "Duration (eg., 2016 -2020)",
      details: "Details (eg., GPA, Honors)",
    },
    {
      id: "2",
      degree: "MBA",
      school: "University",
      duration: "Duration (eg., 2016 -2020)",
      details: "Details (eg., GPA, Honors)",
    },
  ],
  skills: ["Figma", "Agile/ Scrum", "User Research"],
  tools: ["Photoshop", "Illustrator", "Framer"],
  certifications: [
    {
      id: "1",
      name: "Google UX Design Professional Certificate",
      issuer: "Coursera",
      date: "2022",
    },
  ],
};

// Feature flag: set to false to render Modified Resume stacked below Default Resume,
// set to true to use tabbed version switcher in preview header.
const USE_TABBED_VERSION_SWITCHER = false;

export default function ResumePage() {
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem("easyresume_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.experiences) {
          parsed.experiences = parsed.experiences.map((exp: any) => ({
            ...exp,
            description: Array.isArray(exp.description)
              ? exp.description
              : [exp.description].filter(Boolean),
          }));
        }
        if (!parsed.tools) parsed.tools = initialFormData.tools;
        if (!parsed.certifications)
          parsed.certifications = initialFormData.certifications;
        return parsed;
      } catch (e) {
        return initialFormData;
      }
    }
    return initialFormData;
  });

  const [modifiedFormData, setModifiedFormData] = useState<FormData | null>(
    () => {
      const saved = localStorage.getItem("easyresume_modified_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return null;
        }
      }
      return null;
    },
  );

  const [activeResumeVersion, setActiveResumeVersion] = useState<
    "default" | "modified"
  >("default");
  const [isModifiedTextCopied, setIsModifiedTextCopied] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isTextCopied, setIsTextCopied] = useState(false);

  const [tailorJobDescription, setTailorJobDescription] = useState<string>(
    () => {
      const saved = localStorage.getItem("easyresume_tailor_input_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.jobDescription || "";
        } catch (e) {}
      }
      return "";
    },
  );

  const [tailorAtsReport, setTailorAtsReport] = useState<string>(() => {
    const saved = localStorage.getItem("easyresume_tailor_input_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.atsReport || "";
      } catch (e) {}
    }
    return "";
  });

  useEffect(() => {
    localStorage.setItem(
      "easyresume_tailor_input_data",
      JSON.stringify({
        jobDescription: tailorJobDescription,
        atsReport: tailorAtsReport,
      }),
    );
  }, [tailorJobDescription, tailorAtsReport]);

  useEffect(() => {
    const loadTailorInputs = () => {
      const saved = localStorage.getItem("easyresume_tailor_input_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.jobDescription)
            setTailorJobDescription(parsed.jobDescription);
          if (parsed.atsReport) setTailorAtsReport(parsed.atsReport);
        } catch (e) {}
      }
    };
    window.addEventListener("focus", loadTailorInputs);
    return () => window.removeEventListener("focus", loadTailorInputs);
  }, []);

  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorError, setTailorError] = useState<string | undefined>();
  const [tailorSuccessMessage, setTailorSuccessMessage] = useState<
    string | undefined
  >();

  const handleTailorResume = async () => {
    if (!tailorJobDescription.trim()) {
      alert("Please enter a Job Description to modify your resume.");
      return;
    }

    setIsTailoring(true);
    setTailorError(undefined);
    setTailorSuccessMessage(undefined);

    try {
      const tailored = await modifyResumeWithOpenRouter(
        formData,
        tailorJobDescription,
        tailorAtsReport,
      );

      if (tailored) {
        const newModifiedData: FormData = {
          ...formData,
          summary: tailored.summary || formData.summary,
          experiences:
            Array.isArray(tailored.experiences) &&
            tailored.experiences.length > 0
              ? tailored.experiences.map((exp: any, idx: number) => ({
                  id:
                    formData.experiences[idx]?.id ||
                    exp.id ||
                    `exp-${Date.now()}-${idx}`,
                  position:
                    exp.position ||
                    formData.experiences[idx]?.position ||
                    "Role",
                  company:
                    exp.company ||
                    formData.experiences[idx]?.company ||
                    "Company",
                  duration:
                    exp.duration ||
                    formData.experiences[idx]?.duration ||
                    "Duration",
                  description: Array.isArray(exp.description)
                    ? exp.description
                    : typeof exp.description === "string"
                      ? [exp.description]
                      : formData.experiences[idx]?.description || [],
                }))
              : formData.experiences,
          skills:
            Array.isArray(tailored.skills) && tailored.skills.length > 0
              ? tailored.skills
              : formData.skills,
          tools:
            Array.isArray(tailored.tools) && tailored.tools.length > 0
              ? tailored.tools
              : formData.tools,
        };

        setModifiedFormData(newModifiedData);
        localStorage.setItem(
          "easyresume_modified_data",
          JSON.stringify(newModifiedData),
        );

        if (USE_TABBED_VERSION_SWITCHER) {
          setActiveResumeVersion("modified");
        }

        setTailorSuccessMessage(
          "✨ Modified Resume created! Scroll down or preview below.",
        );
        setTimeout(() => setTailorSuccessMessage(undefined), 6000);
      }
    } catch (err: any) {
      console.error("Resume tailoring failed:", err);
      setTailorError(
        err.message || "Failed to modify resume. Please try again.",
      );
    } finally {
      setIsTailoring(false);
    }
  };

  useEffect(() => {
    localStorage.setItem("easyresume_data", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (modifiedFormData) {
      localStorage.setItem(
        "easyresume_modified_data",
        JSON.stringify(modifiedFormData),
      );
    } else {
      localStorage.removeItem("easyresume_modified_data");
    }
  }, [modifiedFormData]);

  const logDev = (...args: any[]) => {
    console.log("[EasyResume AI]", ...args);
  };

  const handleTemplateChange = (
    tmpl: "minimal" | "modern" | "professional",
  ) => {
    logDev(
      `Template changed to '${tmpl}'. Syncing Default and Modified resumes.`,
    );
    setFormData((prev) => ({ ...prev, template: tmpl }));
    setModifiedFormData((prev) => (prev ? { ...prev, template: tmpl } : null));
  };

  const handlePrimaryColorChange = (color: string) => {
    logDev(
      `Primary color changed to '${color}'. Syncing Default and Modified resumes.`,
    );
    setFormData((prev) => ({ ...prev, primaryColor: color }));
    setModifiedFormData((prev) =>
      prev ? { ...prev, primaryColor: color } : null,
    );
  };

  const handleSecondaryColorChange = (color: string) => {
    logDev(
      `Secondary color changed to '${color}'. Syncing Default and Modified resumes.`,
    );
    setFormData((prev) => ({ ...prev, secondaryColor: color }));
    setModifiedFormData((prev) =>
      prev ? { ...prev, secondaryColor: color } : null,
    );
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target?.result as string;
        logDev("Profile photo updated. Syncing Default and Modified resumes.");
        setFormData((prev) => ({ ...prev, photo: photoData }));
        setModifiedFormData((prev) =>
          prev ? { ...prev, photo: photoData } : null,
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    logDev("Profile photo removed. Syncing Default and Modified resumes.");
    setFormData((prev) => ({ ...prev, photo: undefined }));
    setModifiedFormData((prev) =>
      prev ? { ...prev, photo: undefined } : null,
    );
  };

  const handleExportJSON = () => {
    const exportData = {
      ...formData,
      _isEasyResume: true,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume_${formData.fullName.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyModifiedText = () => {
    if (!modifiedFormData) return;
    const text = [
      modifiedFormData.fullName,
      modifiedFormData.role,
      `${modifiedFormData.email} | ${modifiedFormData.phone} | ${modifiedFormData.location}`,
      modifiedFormData.summary,
      ...modifiedFormData.experiences.map(
        (e) =>
          `${e.position} at ${e.company} (${e.duration})\n${e.description.map((d) => `- ${d}`).join("\n")}`,
      ),
      ...modifiedFormData.education.map(
        (e) => `${e.degree} at ${e.school} (${e.duration})\n${e.details}`,
      ),
      `Skills: ${modifiedFormData.skills.join(", ")}`,
      `Tools: ${modifiedFormData.tools.join(", ")}`,
      ...modifiedFormData.certifications.map(
        (c) => `${c.name} - ${c.issuer} (${c.date})`,
      ),
    ]
      .filter(Boolean)
      .join("\n\n");

    copyToClipboard(text).then((success) => {
      if (success) {
        setIsModifiedTextCopied(true);
        setTimeout(() => setIsModifiedTextCopied(false), 2000);
      }
    });
  };

  const handleExportModifiedJSON = () => {
    if (!modifiedFormData) return;
    const exportData = {
      ...modifiedFormData,
      _isEasyResume: true,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `modified_resume_${modifiedFormData.fullName.replace(/\s+/g, "_")}_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearModifiedResume = () => {
    logDev("Clearing modified resume data.");
    setModifiedFormData(null);
    localStorage.removeItem("easyresume_modified_data");
  };

  const handleCopyText = () => {
    const text = [
      formData.fullName,
      formData.role,
      `${formData.email} | ${formData.phone} | ${formData.location}`,
      formData.summary,
      ...formData.experiences.map(
        (e) =>
          `${e.position} at ${e.company} (${e.duration})\n${e.description.map((d) => `- ${d}`).join("\n")}`,
      ),
      ...formData.education.map(
        (e) => `${e.degree} at ${e.school} (${e.duration})\n${e.details}`,
      ),
      `Skills: ${formData.skills.join(", ")}`,
      `Tools: ${formData.tools.join(", ")}`,
      ...formData.certifications.map(
        (c) => `${c.name} - ${c.issuer} (${c.date})`,
      ),
    ]
      .filter(Boolean)
      .join("\n\n");

    copyToClipboard(text).then((success) => {
      if (success) {
        setIsTextCopied(true);
        setTimeout(() => setIsTextCopied(false), 2000);
      }
    });
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (!importedData._isEasyResume) {
          alert("Invalid JSON: This file was not exported from EasyResume.");
          return;
        }
        if (importedData.experiences) {
          importedData.experiences = importedData.experiences.map(
            (exp: any) => ({
              ...exp,
              description: Array.isArray(exp.description)
                ? exp.description
                : [exp.description].filter(Boolean),
            }),
          );
        }
        setFormData(importedData);
        alert("Resume imported successfully!");
      } catch (error) {
        alert("Error importing file. Please ensure it's a valid JSON.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleExportPDF = () => {
    const preview = document.getElementById("resumePreview");
    if (!preview) return;

    const originalTitle = document.title;
    document.title = "";

    // Remember where the preview lives in the DOM
    const originalParent = preview.parentElement;
    const originalNextSibling = preview.nextElementSibling;

    // Move preview to body root and add "printing" class
    // CSS uses body.printing > *:not(#resumePreview) { display: none }
    // so hidden elements take ZERO space (no blank first page)
    document.body.classList.add("printing");
    document.body.appendChild(preview);

    // Print — this blocks until the print dialog is dismissed
    window.print();

    // Restore everything
    document.body.classList.remove("printing");
    if (originalParent) {
      if (originalNextSibling) {
        originalParent.insertBefore(preview, originalNextSibling);
      } else {
        originalParent.appendChild(preview);
      }
    }
    document.title = originalTitle;
  };

  const handleReset = () => {
    localStorage.removeItem("easyresume_data");
    setFormData(initialFormData);
    setShowResetConfirm(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experiences: [
        ...prev.experiences,
        {
          id: Date.now().toString(),
          position: "",
          company: "",
          duration: "",
          description: [""],
        },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((exp) => exp.id !== id),
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp,
      ),
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          id: Date.now().toString(),
          degree: "",
          school: "",
          duration: "",
          details: "",
        },
      ],
    }));
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu,
      ),
    }));
  };

  const addSkill = () => {
    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, ""],
    }));
  };

  const updateSkill = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.map((skill, i) => (i === index ? value : skill)),
    }));
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addTool = () => {
    setFormData((prev) => ({
      ...prev,
      tools: [...prev.tools, ""],
    }));
  };

  const updateTool = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.map((tool, i) => (i === index ? value : tool)),
    }));
  };

  const removeTool = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((_, i) => i !== index),
    }));
  };

  const moveTool = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const items = [...prev.tools];
      if (direction === "up" && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      } else if (direction === "down" && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      return { ...prev, tools: items };
    });
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { id: Date.now().toString(), name: "", issuer: "", date: "" },
      ],
    }));
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert,
      ),
    }));
  };

  const removeCertification = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }));
  };

  const moveCertification = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const items = [...prev.certifications];
      if (direction === "up" && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      } else if (direction === "down" && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      return { ...prev, certifications: items };
    });
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const items = [...prev.experiences];
      if (direction === "up" && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      } else if (direction === "down" && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      return { ...prev, experiences: items };
    });
  };

  const moveEducation = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const items = [...prev.education];
      if (direction === "up" && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      } else if (direction === "down" && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      return { ...prev, education: items };
    });
  };

  const moveSkill = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const items = [...prev.skills];
      if (direction === "up" && index > 0) {
        [items[index - 1], items[index]] = [items[index], items[index - 1]];
      } else if (direction === "down" && index < items.length - 1) {
        [items[index], items[index + 1]] = [items[index + 1], items[index]];
      }
      return { ...prev, skills: items };
    });
  };

  return (
    <div className="flex-1 flex flex-col pt-20 pb-20 print:pt-0 print:pb-0 print:bg-white">
      <style>{`
        @page {
          margin: 0;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 w-full">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-12 print:hidden">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[24px] font-bold tracking-tight text-black font-display"
          >
            Resume Builder
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[16px] leading-[26px] text-[#4A4A57] font-normal max-w-[667px]"
          >
            Fill in your details - AI writes a clean, ATS-optimized resume. Then
            tweak it to perfection.
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 print:block print:overflow-visible">
          {/* Left Section - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-5 print:hidden"
          >
            <FormSection title="Template" icon={<Layout size={20} />}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Template
                  </label>
                  <div className="flex gap-3">
                    {["minimal", "modern"].map((tmpl) => (
                      <button
                        key={tmpl}
                        onClick={() =>
                          handleTemplateChange(
                            tmpl as "minimal" | "modern" | "professional",
                          )
                        }
                        className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                          formData.template === tmpl
                            ? "bg-black text-white"
                            : "border border-[#DADBDE] text-gray-600"
                        }`}
                      >
                        {tmpl.charAt(0).toUpperCase() + tmpl.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) =>
                          handlePrimaryColorChange(e.target.value)
                        }
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {formData.primaryColor}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) =>
                          handleSecondaryColorChange(e.target.value)
                        }
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-600">
                        {formData.secondaryColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Personal Info */}
            <FormSection title="Personal Info" icon={<User size={20} />}>
              <div className="space-y-4">
                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    Upload Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={photoInputRef}
                    onChange={handlePhotoUpload}
                  />
                  <div className="flex gap-4 items-center">
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all overflow-hidden"
                    >
                      {formData.photo ? (
                        <img
                          src={formData.photo}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-2xl">+</span>
                      )}
                    </div>
                    {formData.photo && (
                      <button
                        onClick={removePhoto}
                        className="text-sm text-red-500 hover:text-red-600 font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Full name"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                  <FormInput
                    label="Role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <FormInput
                    label="Phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormInput
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                  <FormInput
                    label="Experience"
                    name="experience"
                    type="number"
                    value={formData.experience.toString()}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-medium text-gray-700 mb-2">
                    Summary
                  </label>
                  <textarea
                    name="summary"
                    value={formData.summary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] text-gray-900 resize-none h-24 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Tell me about yourself..."
                  />
                </div>
              </div>
            </FormSection>

            {/* LinkedIn & Portfolio */}
            <FormSection
              title="LinkedIn & Portfolio"
              icon={<Link2 size={20} />}
            >
              <div className="space-y-3">
                {formData.linksPortfolio.map((link, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <FormInput
                      label={index === 0 ? "LinkedIn" : "Portfolio"}
                      value={link.url}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          linksPortfolio: prev.linksPortfolio.map((l, i) =>
                            i === index ? { ...l, url: e.target.value } : l,
                          ),
                        }));
                      }}
                    />
                  </div>
                ))}
              </div>
            </FormSection>

            {/* Work Experience */}
            <FormSection title="Work Experience" icon={<Briefcase size={20} />}>
              <div className="space-y-4">
                {formData.experiences.map((exp, index) => (
                  <ExperienceForm
                    key={exp.id}
                    experience={exp}
                    onUpdate={(field, value) =>
                      updateExperience(exp.id, field, value)
                    }
                    onRemove={() => removeExperience(exp.id)}
                    onMoveUp={() => moveExperience(index, "up")}
                    onMoveDown={() => moveExperience(index, "down")}
                    isFirst={index === 0}
                    isLast={index === formData.experiences.length - 1}
                  />
                ))}
                <button
                  onClick={addExperience}
                  className="w-full py-3 bg-[#27AE60] text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-[#1E8E4D] transition-all"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </FormSection>

            {/* Education */}
            <FormSection title="Education" icon={<GraduationCap size={20} />}>
              <div className="space-y-4">
                {formData.education.map((edu, index) => (
                  <EducationForm
                    key={edu.id}
                    education={edu}
                    onUpdate={(field, value) =>
                      updateEducation(edu.id, field, value)
                    }
                    onRemove={() => removeEducation(edu.id)}
                    onMoveUp={() => moveEducation(index, "up")}
                    onMoveDown={() => moveEducation(index, "down")}
                    isFirst={index === 0}
                    isLast={index === formData.education.length - 1}
                  />
                ))}
                <button
                  onClick={addEducation}
                  className="w-full py-3 bg-[#27AE60] text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-[#1E8E4D] transition-all"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </FormSection>

            {/* Skills */}
            <FormSection title="Skills" icon={<Zap size={20} />}>
              <div className="space-y-3">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="flex gap-2 w-full max-w-full">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg text-[14px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder={`Skill ${index + 1}`}
                    />
                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                      <button
                        onClick={() => moveSkill(index, "up")}
                        disabled={index === 0}
                        className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveSkill(index, "down")}
                        disabled={index === formData.skills.length - 1}
                        className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => removeSkill(index)}
                        className="px-3 py-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-r-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addSkill}
                  className="w-full py-3 bg-[#27AE60] text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-[#1E8E4D] transition-all"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </FormSection>

            {/* Tools */}
            <FormSection title="Tools" icon={<Wrench size={20} />}>
              <div className="space-y-3">
                {formData.tools.map((tool, index) => (
                  <div key={index} className="flex gap-2 w-full max-w-full">
                    <input
                      type="text"
                      value={tool}
                      onChange={(e) => updateTool(index, e.target.value)}
                      className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg text-[14px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder={`Tool ${index + 1}`}
                    />
                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                      <button
                        onClick={() => moveTool(index, "up")}
                        disabled={index === 0}
                        className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveTool(index, "down")}
                        disabled={index === formData.tools.length - 1}
                        className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => removeTool(index)}
                        className="px-3 py-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-r-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addTool}
                  className="w-full py-3 bg-[#27AE60] text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-[#1E8E4D] transition-all"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </FormSection>

            {/* Certifications */}
            <FormSection title="Certifications" icon={<Award size={20} />}>
              <div className="space-y-4">
                {formData.certifications.map((cert, index) => (
                  <CertificationForm
                    key={cert.id}
                    certification={cert}
                    onUpdate={(field, value) =>
                      updateCertification(cert.id, field, value)
                    }
                    onRemove={() => removeCertification(cert.id)}
                    onMoveUp={() => moveCertification(index, "up")}
                    onMoveDown={() => moveCertification(index, "down")}
                    isFirst={index === 0}
                    isLast={index === formData.certifications.length - 1}
                  />
                ))}
                <button
                  onClick={addCertification}
                  className="w-full py-3 bg-[#27AE60] text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-[#1E8E4D] transition-all"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </FormSection>

          </motion.div>

          {/* Right Section - Default Resume Preview Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-8 print:block print:w-full print:static print:overflow-visible print:self-auto lg:sticky lg:top-24 self-start"
          >
            {/* Privacy Banner */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[13px] flex items-start gap-2 print:hidden">
              <Info size={16} className="mt-0.5 flex-shrink-0" />
              <p>
                <strong>Privacy Note:</strong> We do not store your data. All
                data is stored locally in your browser. Please remember to{" "}
                <strong>Export JSON</strong> so you can import it anytime to
                continue working.
              </p>
            </div>

            {/* DEFAULT RESUME CARD */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#DADAE3] pb-4 flex-wrap gap-2 print:hidden">
                <div className="flex items-center gap-2">
                  <div className="text-[22px] font-bold text-black font-display">
                    Default Resume
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                  <button
                    onClick={handleCopyText}
                    className={`flex items-center justify-center gap-2 w-[110px] py-2 border rounded text-[12px] font-medium transition-all ${
                      isTextCopied
                        ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                        : "border-black text-black hover:bg-gray-50"
                    }`}
                  >
                    {isTextCopied ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    {isTextCopied ? "Copied!" : "Copy Text"}
                  </button>
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImportJSON}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 border border-black rounded text-[12px] font-medium text-black hover:bg-[#fcfcfc] transition-all"
                  >
                    <Upload size={14} />
                    Import JSON
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 px-3 py-2 bg-[#27AE60] text-white rounded text-[12px] font-medium hover:bg-[#1E8E4D] transition-all"
                  >
                    <Download size={14} />
                    Export JSON
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded text-[12px] font-medium hover:bg-red-600 transition-all"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                </div>
              </div>

              <div
                className="bg-white overflow-x-auto print:overflow-visible print:h-auto"
                id="resumePreview"
              >
                {formData.fullName || formData.role || formData.summary ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formData.template === "minimal" && (
                      <MinimalTemplate data={formData} />
                    )}
                    {formData.template === "professional" && (
                      <ProfessionalTemplate data={formData} />
                    )}
                    {formData.template === "modern" && (
                      <ModernTemplate data={formData} />
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center py-20">
                    <FileText
                      size={48}
                      className="mx-auto text-[#7A7A8C] mb-4"
                    />
                    <h3 className="text-[16px] font-normal text-black mb-2">
                      No resume data yet
                    </h3>
                    <p className="text-[16px] font-normal text-[#7A7A8C] max-w-xs mx-auto">
                      Fill in your details on the left to see a live preview
                      of your resume.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* BOTTOM SECTION: DEDICATED FULL-WIDTH MODIFY RESUME SECTION */}
        <div className="mt-16 pt-10 border-t-2 border-dashed border-emerald-500/30 print:hidden" id="modify-resume">
          <div className="flex flex-col gap-6">
            {/* Section Header */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-emerald-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-display flex items-center gap-2">
                    Modify Resume
                  </h2>
                  <p className="text-sm text-gray-600">
                    Tailor your resume for specific job descriptions without altering your default resume.
                  </p>
                </div>
              </div>
              <span className="px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                AI Powered
              </span>
            </div>

            {/* Modify Resume Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[450px_1fr] xl:grid-cols-[500px_1fr] gap-8">
              {/* Left Column: Job Description & ATS Suggestions Input Box */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden flex flex-col gap-5">
                <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100">
                  <PenLine className="w-5 h-5 text-gray-800" />
                  <h3 className="text-[17px] font-bold text-gray-900 font-display tracking-tight">
                    Modify Resume Inputs
                  </h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-gray-700">
                    Job Description
                  </label>
                  <div className="border border-gray-200 rounded-xl p-3.5 bg-gray-50/50 focus-within:bg-white focus-within:border-emerald-500 transition-all">
                    <textarea
                      value={tailorJobDescription}
                      onChange={(e) => setTailorJobDescription(e.target.value)}
                      placeholder="Enter your Job Description & Modify your resume instantly..."
                      className="w-full h-[140px] text-[14px] text-gray-700 focus:outline-none resize-none bg-transparent placeholder-gray-400 leading-relaxed font-sans"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-semibold text-gray-700 flex items-center justify-between">
                    <span>ATS Report / Suggestions</span>
                    <span className="text-[11px] font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>
                  <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus-within:bg-white focus-within:border-emerald-500 transition-all">
                    <textarea
                      value={tailorAtsReport}
                      onChange={(e) => setTailorAtsReport(e.target.value)}
                      placeholder="Paste ATS Score Report or key suggestions from the ATS Checker page..."
                      className="w-full h-[80px] text-[13px] text-gray-700 focus:outline-none resize-none bg-transparent placeholder-gray-400 leading-relaxed font-sans"
                    />
                  </div>
                </div>

                {tailorError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg">
                    {tailorError}
                  </div>
                )}
                {tailorSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[13px] rounded-lg font-medium flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600 flex-shrink-0"
                    />
                    {tailorSuccessMessage}
                  </div>
                )}

                <button
                  onClick={handleTailorResume}
                  disabled={isTailoring || !tailorJobDescription.trim()}
                  className={`w-full py-3.5 px-6 rounded-xl text-[16px] font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${
                    tailorJobDescription.trim() && !isTailoring
                      ? "bg-[#27AE60] hover:bg-[#1E8E4D] text-white shadow-emerald-200 hover:shadow-lg"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  } disabled:opacity-60`}
                >
                  {isTailoring ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Modifying Resume...</span>
                    </>
                  ) : (
                    <>
                      <span>Modify Resume</span>
                      <Sparkles size={18} />
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: AI Tailored Modified Resume Card */}
              <div className="flex flex-col gap-4">
                {modifiedFormData ? (
                  <div className="flex flex-col gap-6 bg-[#F4FAF6] border-2 border-[#27AE60]/40 rounded-2xl p-4 sm:p-6 shadow-md">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="text-[22px] font-bold text-emerald-950 font-display flex items-center gap-2">
                          Modified Resume
                          <Sparkles size={18} className="text-emerald-600" />
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
                          AI Tailored
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                        <button
                          onClick={handleCopyModifiedText}
                          className={`flex items-center justify-center gap-2 w-[165px] py-2 border rounded text-[12px] font-medium transition-all ${
                            isModifiedTextCopied
                              ? "border-emerald-500 text-emerald-600 bg-emerald-50"
                              : "border-emerald-700 text-emerald-800 bg-white hover:bg-emerald-50"
                          }`}
                        >
                          {isModifiedTextCopied ? (
                            <CheckCircle2 size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                          {isModifiedTextCopied
                            ? "Copied!"
                            : "Copy Modified Text"}
                        </button>
                        <button
                          onClick={handleExportModifiedJSON}
                          className="flex items-center gap-2 px-3 py-2 bg-[#27AE60] text-white rounded text-[12px] font-medium hover:bg-[#1E8E4D] transition-all shadow-sm"
                        >
                          <Download size={14} />
                          Export Modified JSON
                        </button>
                        <button
                          onClick={handleExportPDF}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded text-[12px] font-medium hover:bg-red-600 transition-all shadow-sm"
                        >
                          <Download size={14} />
                          Download PDF
                        </button>
                        <button
                          onClick={handleClearModifiedResume}
                          title="Clear / Discard Modified Resume"
                          className="flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 bg-white rounded text-[12px] font-medium hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                        >
                          <Trash2 size={14} />
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    <div
                      id="modifiedResumePreview"
                      className="bg-white overflow-x-auto print:overflow-visible rounded-xl p-3 sm:p-5 border border-emerald-100 shadow-sm"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {modifiedFormData.template === "minimal" && (
                          <MinimalTemplate data={modifiedFormData} />
                        )}
                        {modifiedFormData.template === "professional" && (
                          <ProfessionalTemplate data={modifiedFormData} />
                        )}
                        {modifiedFormData.template === "modern" && (
                          <ModernTemplate data={modifiedFormData} />
                        )}
                      </motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50/40 border-2 border-dashed border-emerald-200/80 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="p-4 bg-emerald-100/80 rounded-full text-emerald-600 mb-4">
                      <Sparkles size={36} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2 font-display">
                      No Modified Resume Yet
                    </h4>
                    <p className="text-sm text-gray-600 max-w-md leading-relaxed">
                      Enter your target Job Description on the left and click <strong>Modify Resume ✨</strong>. Your tailored resume will appear right here as a separate entity without altering your default resume.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm print:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <h3 className="text-[18px] font-semibold text-gray-900 mb-2">
              Reset Resume?
            </h3>
            <p className="text-[14px] text-gray-600 mb-6">
              Are you sure you want to reset all data to the default template?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg text-[14px] font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden w-full max-w-full box-border">
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="text-gray-900">{icon}</div>}
        <h3 className="text-[18px] font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  name?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-[14px] font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
    </div>
  );
}

function ExperienceForm({
  experience,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  experience: any;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-3.5 sm:p-5 space-y-4 overflow-hidden w-full max-w-full box-border">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[16px] font-medium text-gray-900">Experience</h4>
        <div className="flex bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-r-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <FormInput
          label="Position"
          value={experience.position}
          onChange={(e) => onUpdate("position", e.target.value)}
        />
        <FormInput
          label="Company"
          value={experience.company}
          onChange={(e) => onUpdate("company", e.target.value)}
        />
        <FormInput
          label="Duration"
          value={experience.duration}
          onChange={(e) => onUpdate("duration", e.target.value)}
        />
        <div>
          <label className="block text-[14px] font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="space-y-3">
            {experience.description.map((desc: string, index: number) => (
              <div key={index} className="flex gap-2 w-full max-w-full">
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => {
                    const newDesc = [...experience.description];
                    newDesc[index] = e.target.value;
                    onUpdate("description", newDesc);
                  }}
                  className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg text-[14px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Write a bullet point..."
                />
                <div className="flex bg-gray-50 border border-gray-200 rounded-lg flex-shrink-0">
                  <button
                    onClick={() => {
                      const newDesc = [...experience.description];
                      [newDesc[index - 1], newDesc[index]] = [
                        newDesc[index],
                        newDesc[index - 1],
                      ];
                      onUpdate("description", newDesc);
                    }}
                    disabled={index === 0}
                    className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const newDesc = [...experience.description];
                      [newDesc[index], newDesc[index + 1]] = [
                        newDesc[index + 1],
                        newDesc[index],
                      ];
                      onUpdate("description", newDesc);
                    }}
                    disabled={index === experience.description.length - 1}
                    className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const newDesc = experience.description.filter(
                        (_: any, i: number) => i !== index,
                      );
                      onUpdate("description", newDesc);
                    }}
                    className="px-3 py-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-r-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                onUpdate("description", [...experience.description, ""])
              }
              className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-lg font-medium text-[13px] flex items-center justify-center gap-2 hover:bg-gray-50 hover:text-gray-700 transition-all"
            >
              <Plus size={14} />
              Add Bullet Point
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EducationForm({
  education,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  education: any;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[16px] font-medium text-gray-900">Education</h4>
        <div className="flex bg-gray-50 border border-gray-200 rounded-lg">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-r-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <FormInput
          label="Degree"
          value={education.degree}
          onChange={(e) => onUpdate("degree", e.target.value)}
        />
        <FormInput
          label="School"
          value={education.school}
          onChange={(e) => onUpdate("school", e.target.value)}
        />
        <FormInput
          label="Duration"
          value={education.duration}
          onChange={(e) => onUpdate("duration", e.target.value)}
        />
        <FormInput
          label="Details"
          value={education.details}
          onChange={(e) => onUpdate("details", e.target.value)}
        />
      </div>
    </div>
  );
}

function CertificationForm({
  certification,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  certification: any;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[16px] font-medium text-gray-900">Certification</h4>
        <div className="flex bg-gray-50 border border-gray-200 rounded-lg">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronUp size={16} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="px-2 py-2 text-gray-400 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
          >
            <ChevronDown size={16} />
          </button>
          <button
            onClick={onRemove}
            className="px-3 py-2 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-r-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <FormInput
          label="Certification Name"
          value={certification.name}
          onChange={(e) => onUpdate("name", e.target.value)}
        />
        <FormInput
          label="Issuing Organization"
          value={certification.issuer}
          onChange={(e) => onUpdate("issuer", e.target.value)}
        />
        <FormInput
          label="Date/Year"
          value={certification.date}
          onChange={(e) => onUpdate("date", e.target.value)}
        />
      </div>
    </div>
  );
}

function MinimalTemplate({ data }: { data: FormData }) {
  const links = data.linksPortfolio.filter((l) => l.url).map((l) => l.url);
  return (
    <div
      className="template-minimal p-8 space-y-6 bg-white w-full max-w-[210mm] print:max-w-none print:w-full mx-auto border border-gray-200 print:border-none print:shadow-none"
      style={{ minHeight: "297mm" }}
    >
      <div className="flex items-start gap-6 mb-6">
        {data.photo && (
          <img
            src={data.photo}
            alt="Profile"
            className="w-[100px] h-[100px] rounded-full object-cover shrink-0"
          />
        )}
        <div className="flex-1">
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: data.primaryColor }}
          >
            {data.fullName || "Your Name"}
          </h1>
          <div className="text-[13px] text-gray-600 mb-2">{data.role}</div>

          <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-600 mb-1">
            {data.email && (
              <div className="flex items-center gap-1">
                <Mail size={12} /> {data.email}
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-1">
                <Phone size={12} /> {data.phone}
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} /> {data.location}
              </div>
            )}
          </div>

          {links.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-600">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <Link2 size={12} /> {link}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.summary && (
        <div className="mb-6">
          <div
            className="text-base font-bold mb-2 pb-1 border-b"
            style={{
              borderColor: data.secondaryColor,
              color: data.primaryColor,
            }}
          >
            Summary
          </div>
          <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
            {data.summary}
          </div>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div className="mb-6">
          <div
            className="text-base font-bold mb-2 pb-1 border-b"
            style={{
              borderColor: data.secondaryColor,
              color: data.primaryColor,
            }}
          >
            Work Experience
          </div>
          <div className="space-y-3">
            {data.experiences.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between mb-1">
                  <div className="font-bold text-[13px] text-gray-900">
                    {exp.position}
                  </div>
                  <div className="text-xs text-gray-600">{exp.duration}</div>
                </div>
                <div className="text-[13px] text-gray-600 mb-1">
                  {exp.company}
                </div>
                <ul className="list-disc list-outside ml-4 text-[13px] text-gray-700 leading-relaxed space-y-1">
                  {exp.description
                    .filter(Boolean)
                    .map((desc: string, i: number) => (
                      <li key={i}>{desc}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-6">
          <div
            className="text-base font-bold mb-2 pb-1 border-b"
            style={{
              borderColor: data.secondaryColor,
              color: data.primaryColor,
            }}
          >
            Education
          </div>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between mb-1">
                  <div className="font-bold text-[13px] text-gray-900">
                    {edu.degree}
                  </div>
                  <div className="text-xs text-gray-600">{edu.duration}</div>
                </div>
                <div className="text-[13px] text-gray-600">{edu.school}</div>
                <div className="text-[13px] text-gray-600">{edu.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="mb-6">
          <div
            className="text-base font-bold mb-2 pb-1 border-b"
            style={{
              borderColor: data.secondaryColor,
              color: data.primaryColor,
            }}
          >
            Certifications
          </div>
          <div className="space-y-3">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="mb-3">
                <div className="flex justify-between mb-1">
                  <div className="font-bold text-[13px] text-gray-900">
                    {cert.name}
                  </div>
                  <div className="text-xs text-gray-600">{cert.date}</div>
                </div>
                <div className="text-[13px] text-gray-600">{cert.issuer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="mb-6">
          <div
            className="text-base font-bold mb-2 pb-1 border-b"
            style={{
              borderColor: data.secondaryColor,
              color: data.primaryColor,
            }}
          >
            Skills
          </div>
          <div className="text-[13px] text-gray-700">
            {data.skills.join(" • ")}
          </div>
        </div>
      )}

      {data.tools.length > 0 && (
        <div className="mb-6">
          <div
            className="text-base font-bold mb-2 pb-1 border-b"
            style={{
              borderColor: data.secondaryColor,
              color: data.primaryColor,
            }}
          >
            Tools
          </div>
          <div className="text-[13px] text-gray-700">
            {data.tools.join(" • ")}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfessionalTemplate({ data }: { data: FormData }) {
  const links = data.linksPortfolio.filter((l) => l.url).map((l) => l.url);
  return (
    <div
      className="template-professional p-8 bg-white w-[210mm] max-w-full print:max-w-none print:w-full mx-auto border border-gray-200 print:border-none print:shadow-none"
      style={{ minHeight: "297mm" }}
    >
      <div
        className="flex items-start gap-6 mb-6 pb-4 border-b-2"
        style={{ borderColor: data.secondaryColor }}
      >
        {data.photo && (
          <img
            src={data.photo}
            alt="Profile"
            className="w-[80px] h-[80px] rounded-full object-cover shrink-0"
          />
        )}
        <div className="flex-1">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: data.secondaryColor }}
          >
            {data.fullName || "Your Name"}
          </h1>
          <div className="text-[13px] font-medium mb-2 text-gray-800">
            {data.role}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-600 mb-1">
            {data.email && (
              <div className="flex items-center gap-1">
                <Mail size={12} className="shrink-0" /> {data.email}
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-1">
                <Phone size={12} className="shrink-0" /> {data.phone}
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-1">
                <MapPin size={12} className="shrink-0" /> {data.location}
              </div>
            )}
          </div>

          {links.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-600 mt-2">
              {links.map((link, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <Link2 size={12} /> {link}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {data.summary && (
        <div className="mb-4">
          <div
            className="text-[13px] font-bold uppercase tracking-wider mb-2"
            style={{ color: data.secondaryColor }}
          >
            Summary
          </div>
          <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
            {data.summary}
          </div>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div className="mb-4">
          <div
            className="text-[13px] font-bold uppercase tracking-wider mb-2"
            style={{ color: data.secondaryColor }}
          >
            Experience
          </div>
          <div className="space-y-4">
            {data.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between mb-1">
                  <div className="font-bold text-[13px] text-gray-900">
                    {exp.position}
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    {exp.duration}
                  </div>
                </div>
                <div
                  className="text-[13px] font-medium mb-1"
                  style={{ color: data.primaryColor }}
                >
                  {exp.company}
                </div>
                <ul className="list-disc list-outside ml-4 text-[13px] text-gray-700 leading-relaxed space-y-1">
                  {exp.description
                    .filter(Boolean)
                    .map((desc: string, i: number) => (
                      <li key={i}>{desc}</li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.education.length > 0 && (
        <div className="mb-4">
          <div
            className="text-[13px] font-bold uppercase tracking-wider mb-2"
            style={{ color: data.secondaryColor }}
          >
            Education
          </div>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between mb-1">
                  <div className="font-bold text-[13px] text-gray-900">
                    {edu.degree}
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    {edu.duration}
                  </div>
                </div>
                <div
                  className="text-[13px] font-medium"
                  style={{ color: data.primaryColor }}
                >
                  {edu.school}
                </div>
                <div className="text-[13px] text-gray-700 mt-1">
                  {edu.details}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.certifications.length > 0 && (
        <div className="mb-4">
          <div
            className="text-[13px] font-bold uppercase tracking-wider mb-2"
            style={{ color: data.secondaryColor }}
          >
            Certifications
          </div>
          <div className="space-y-4">
            {data.certifications.map((cert) => (
              <div key={cert.id}>
                <div className="flex justify-between mb-1">
                  <div className="font-bold text-[13px] text-gray-900">
                    {cert.name}
                  </div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">
                    {cert.date}
                  </div>
                </div>
                <div
                  className="text-[13px] font-medium"
                  style={{ color: data.primaryColor }}
                >
                  {cert.issuer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.skills.length > 0 && (
        <div className="mb-4">
          <div
            className="text-[13px] font-bold uppercase tracking-wider mb-2"
            style={{ color: data.secondaryColor }}
          >
            Skills
          </div>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded text-xs text-white"
                style={{ backgroundColor: data.secondaryColor }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {data.tools.length > 0 && (
        <div className="mb-4">
          <div
            className="text-[13px] font-bold uppercase tracking-wider mb-2"
            style={{ color: data.secondaryColor }}
          >
            Tools
          </div>
          <div className="flex flex-wrap gap-2">
            {data.tools.map((tool, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded text-xs text-white"
                style={{ backgroundColor: data.secondaryColor }}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModernTemplate({ data }: { data: FormData }) {
  return (
    <div
      className="template-modern flex bg-white w-full max-w-[210mm] print:max-w-none print:w-full print:mx-0 mx-auto border border-gray-200 print:border-none print:shadow-none relative"
      style={{
        minHeight: "297mm",
        "--sidebar-color": data.primaryColor,
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      <div
        className="modern-sidebar w-1/3 p-5 text-white shrink-0"
        style={{ backgroundColor: data.primaryColor }}
      >
        {data.photo && (
          <img
            src={data.photo}
            alt="Profile"
            className="w-[80px] h-[80px] rounded-full object-cover mb-5 border-2 border-white/30 mx-auto"
          />
        )}
        <h1 className="text-[24px] font-bold mb-6 break-words text-white text-center leading-tight">
          {data.fullName || "Your Name"}
        </h1>

        <div className="mb-5 pb-5 border-b border-white/20 last:border-0 last:mb-0 last:pb-0">
          <div className="text-[12px] font-bold uppercase tracking-wider text-white mb-3">
            Contact
          </div>
          {data.email && (
            <div className="flex items-center gap-2 text-[11px] text-white/90 mb-2.5">
              <Mail size={10} className="shrink-0" /> {data.email}
            </div>
          )}
          {data.phone && (
            <div className="flex items-center gap-2 text-[11px] text-white/90 mb-2.5">
              <Phone size={10} className="shrink-0" /> {data.phone}
            </div>
          )}
          {data.location && (
            <div className="flex items-center gap-2 text-[11px] text-white/90 mb-2.5">
              <MapPin size={10} className="shrink-0" /> {data.location}
            </div>
          )}
        </div>

        {data.linksPortfolio.filter((l) => l.url).length > 0 && (
          <div className="mb-5 pb-5 border-b border-white/20 last:border-0 last:mb-0 last:pb-0">
            <div className="text-[12px] font-bold uppercase tracking-wider text-white mb-3">
              Links
            </div>
            {data.linksPortfolio
              .filter((l) => l.url)
              .map((link, idx) => {
                const cleanUrl = link.url
                  .replace(/^https?:\/\/(www\.)?/, "")
                  .replace(/\/$/, "");
                return (
                  <div
                    key={idx}
                    className="flex flex-col min-w-0 leading-tight mb-2.5 last:mb-0"
                  >
                    {link.label && (
                      <span className="text-[11px] font-semibold text-white">
                        {link.label}
                      </span>
                    )}
                    <span className="break-all text-[11px] text-white/90 mt-0.5">
                      {cleanUrl}
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {data.skills.length > 0 && (
          <div className="mb-5 pb-5 border-b border-white/20 last:border-0 last:mb-0 last:pb-0">
            <div className="text-[12px] font-bold uppercase tracking-wider text-white mb-3">
              Skills
            </div>
            <ul className="list-disc list-outside ml-4 space-y-1.5">
              {data.skills.map((skill, index) => (
                <li
                  key={index}
                  className="text-[11px] text-white/90 break-words"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.tools.length > 0 && (
          <div className="mb-5 pb-5 border-b border-white/20 last:border-0 last:mb-0 last:pb-0">
            <div className="text-[12px] font-bold uppercase tracking-wider text-white mb-3">
              Tools
            </div>
            <ul className="list-disc list-outside ml-4 space-y-1.5">
              {data.tools.map((tool, index) => (
                <li
                  key={index}
                  className="text-[11px] text-white/90 break-words"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-6 pt-5 print:pb-0 relative z-10">
        {data.summary && (
          <div className="mb-5 pb-5 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
            <div
              className="text-[12px] font-bold uppercase tracking-wider mb-3"
              style={{ color: data.primaryColor }}
            >
              Profile
            </div>
            <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
              {data.summary}
            </div>
          </div>
        )}

        {data.experiences.length > 0 && (
          <div className="mb-5 pb-5 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
            <div
              className="text-[12px] font-bold uppercase tracking-wider mb-3"
              style={{ color: data.primaryColor }}
            >
              Experience
            </div>
            <div className="space-y-4">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="font-bold text-[13px] text-gray-900 mb-0.5">
                    {exp.position}
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div
                      className="text-[13px] font-medium"
                      style={{ color: data.secondaryColor }}
                    >
                      {exp.company}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {exp.duration}
                    </div>
                  </div>
                  <ul className="list-disc list-outside ml-4 text-[13px] text-gray-700 leading-relaxed space-y-1">
                    {exp.description
                      .filter(Boolean)
                      .map((desc: string, i: number) => (
                        <li key={i}>{desc}</li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-5 pb-5 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
            <div
              className="text-[12px] font-bold uppercase tracking-wider mb-3"
              style={{ color: data.primaryColor }}
            >
              Education
            </div>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-bold text-[13px] text-gray-900 mb-0.5">
                    {edu.degree}
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div
                      className="text-[13px] font-medium"
                      style={{ color: data.secondaryColor }}
                    >
                      {edu.school}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {edu.duration}
                    </div>
                  </div>
                  <div className="text-[13px] text-gray-700">{edu.details}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.certifications.length > 0 && (
          <div className="mb-5 pb-5 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
            <div
              className="text-[12px] font-bold uppercase tracking-wider mb-3"
              style={{ color: data.primaryColor }}
            >
              Certifications
            </div>
            <div className="space-y-4">
              {data.certifications.map((cert) => (
                <div key={cert.id}>
                  <div className="font-bold text-[13px] text-gray-900 mb-0.5">
                    {cert.name}
                  </div>
                  <div className="flex justify-between items-center mb-1.5">
                    <div
                      className="text-[13px] font-medium"
                      style={{ color: data.secondaryColor }}
                    >
                      {cert.issuer}
                    </div>
                    <div className="text-[11px] text-gray-500">{cert.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
