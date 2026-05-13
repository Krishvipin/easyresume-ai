import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Layout, User, Link2, Briefcase, GraduationCap, Zap, Download, FileText } from "lucide-react";

interface FormData {
  // Template & Personal Info
  template: "minimal" | "modern";
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

  // Links & Portfolio
  linksPortfolio: Array<{ label: string; url: string }>;

  // Work Experience
  experiences: Array<{
    id: string;
    position: string;
    company: string;
    duration: string;
    description: string;
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
}

const initialFormData: FormData = {
  template: "minimal",
  primaryColor: "#1e3a8a",
  secondaryColor: "#475569",
  fullName: "Prashanth",
  role: "UIUX Designer",
  email: "prashanth@email.com",
  phone: "+91 9962139116",
  location: "Chennai",
  experience: 6,
  summary: "Tell me about yourself short...",
  linksPortfolio: [
    { label: "LinkedIn", url: "prashanth@linkedin.com" },
    { label: "Portfolio", url: "prashanth.com" },
  ],
  experiences: [
    {
      id: "1",
      position: "Designer",
      company: "Google",
      duration: "Jan 2020 - Jan 2026",
      description: "Write about your job experience..",
    },
    {
      id: "2",
      position: "Designer",
      company: "Google",
      duration: "Jan 2020 - Jan 2026",
      description: "Write about your job experience..",
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
};

export default function ResumePage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
          description: "",
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

  const updateExperience = (
    id: string,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
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

  const updateEducation = (
    id: string,
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
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
            Resume Builder
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[16px] leading-[26px] text-[#4A4A57] font-normal max-w-[667px]"
          >
            Fill in your details - AI writes a clean, ATS-optimized resume. Then tweak it to perfection.
          </motion.p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          {/* Left Section - Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col gap-5"
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
                          setFormData((prev) => ({
                            ...prev,
                            template: tmpl as "minimal" | "modern",
                          }))
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
                          setFormData((prev) => ({
                            ...prev,
                            primaryColor: e.target.value,
                          }))
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
                          setFormData((prev) => ({
                            ...prev,
                            secondaryColor: e.target.value,
                          }))
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
                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all">
                    <span className="text-gray-400 text-2xl">+</span>
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

            {/* Links & Portfolio */}
            <FormSection title="Links & Portfolio" icon={<Link2 size={20} />}>
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
                            i === index ? { ...l, url: e.target.value } : l
                          ),
                        }));
                      }}
                    />
                  </div>
                ))}
                <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </FormSection>

            {/* Work Experience */}
            <FormSection title="Work Experience" icon={<Briefcase size={20} />}>
              <div className="space-y-4">
                {formData.experiences.map((exp) => (
                  <ExperienceForm
                    key={exp.id}
                    experience={exp}
                    onUpdate={(field, value) =>
                      updateExperience(exp.id, field, value)
                    }
                    onRemove={() => removeExperience(exp.id)}
                  />
                ))}
                <button
                  onClick={addExperience}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </FormSection>

            {/* Education */}
            <FormSection title="Education" icon={<GraduationCap size={20} />}>
              <div className="space-y-4">
                {formData.education.map((edu) => (
                  <EducationForm
                    key={edu.id}
                    education={edu}
                    onUpdate={(field, value) =>
                      updateEducation(edu.id, field, value)
                    }
                    onRemove={() => removeEducation(edu.id)}
                  />
                ))}
                <button
                  onClick={addEducation}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
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
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateSkill(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-[14px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder={`Skill ${index + 1}`}
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="px-3 py-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSkill}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium text-[14px] flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
            </FormSection>

            {/* Generate Resume Button */}
            <button className="w-full py-2 px-3 rounded text-[16px] font-normal flex items-center justify-center gap-2 transition-all bg-[#27AE60] hover:bg-[#1E8E4D] text-white">
              Generate Resume
            </button>
          </motion.div>

          {/* Right Section - Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-0"
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between border-b border-[#DADAE3] pb-4 mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <div className="text-[24px] font-bold transition-all text-black">
                  Live Preview
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-2 border border-black rounded text-[12px] font-medium text-black hover:bg-[#fcfcfc] transition-all">
                  <Download size={14} />
                  Copy Text
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-[#27AE60] text-white rounded text-[12px] font-medium hover:bg-[#1E8E4D] transition-all">
                  <Download size={14} />
                  Download JSON
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded text-[12px] font-medium hover:bg-red-600 transition-all">
                  <Download size={14} />
                  Download PDF
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded text-[12px] font-medium hover:bg-blue-600 transition-all">
                  <Download size={14} />
                  Download DOCX
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white overflow-auto">
              {formData.fullName || formData.role || formData.summary ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto space-y-6 border border-gray-200 p-8"
                >
              {/* Preview Header */}
              <div className="text-center pb-6 border-b-2" style={{ borderColor: formData.primaryColor }}>
                <h1 className="text-3xl font-bold" style={{ color: formData.primaryColor }}>
                  {formData.fullName}
                </h1>
                <p className="text-gray-600 font-medium">{formData.role}</p>
                <div className="flex justify-center gap-4 mt-2 text-sm text-gray-600">
                  <span>{formData.email}</span>
                  <span>•</span>
                  <span>{formData.phone}</span>
                  <span>•</span>
                  <span>{formData.location}</span>
                </div>
              </div>

              {/* Summary */}
              {formData.summary && (
                <div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {formData.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {formData.experiences.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: formData.primaryColor }}>
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {formData.experiences.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900">
                              {exp.position}
                            </p>
                            <p className="text-sm text-gray-600">
                              {exp.company}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            {exp.duration}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 mt-2">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {formData.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: formData.primaryColor }}>
                    Education
                  </h3>
                  <div className="space-y-4">
                    {formData.education.map((edu) => (
                      <div key={edu.id}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-gray-900">
                              {edu.degree}
                            </p>
                            <p className="text-sm text-gray-600">
                              {edu.school}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            {edu.duration}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {formData.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: formData.primaryColor }}>
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm text-white"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
                </motion.div>
              ) : (
                <div className="text-center">
                  <FileText size={48} className="mx-auto text-[#7A7A8C] mb-4" />
                  <h3 className="text-[16px] font-normal text-black mb-2">
                    No resume data yet
                  </h3>
                  <p className="text-[16px] font-normal text-[#7A7A8C] max-w-xs">
                    Fill in your details on the left to see a live preview of your resume.
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
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
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
}: {
  experience: any;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[16px] font-medium text-gray-900">Experience</h4>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
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
          <textarea
            value={experience.description}
            onChange={(e) => onUpdate("description", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] resize-none h-24 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}

function EducationForm({
  education,
  onUpdate,
  onRemove,
}: {
  education: any;
  onUpdate: (field: string, value: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[16px] font-medium text-gray-900">Education</h4>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
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
