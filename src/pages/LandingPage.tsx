import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { SEO } from "../components/seo/SEO";
import { SITE, getCanonicalUrl, getAbsoluteAssetUrl } from "../config/site";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/resume-builder");
  };

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        "url": getCanonicalUrl("/"),
        "name": SITE.name,
        "alternateName": SITE.shortName,
        "description": SITE.description,
      },
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        "name": SITE.name,
        "url": getCanonicalUrl("/"),
        "logo": getAbsoluteAssetUrl("/assets/logos/EasyResume%20AI.svg"),
        "founder": {
          "@type": "Person",
          "name": SITE.founder.name,
          "sameAs": [
            SITE.founder.twitter,
            SITE.founder.linkedin,
            SITE.founder.github,
          ],
        },
      },
      {
        "@type": "WebApplication",
        "@id": `${SITE.url}/#app`,
        "name": SITE.name,
        "url": getCanonicalUrl("/"),
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "description":
          "AI Resume Builder, ATS Resume Compatibility Checker, and AI Cover Letter Generator.",
        "isAccessibleForFree": true,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
      },
      {
        "@type": "WebPage",
        "@id": `${SITE.url}/#webpage`,
        "url": getCanonicalUrl("/"),
        "name": "EasyResume AI – Resume Builder, ATS Checker & Cover Letter Generator",
        "description":
          "Create a professional resume, check ATS compatibility with a job description, and generate a tailored cover letter with EasyResume AI.",
        "isPartOf": {
          "@id": `${SITE.url}/#website`,
        },
        "about": {
          "@id": `${SITE.url}/#app`,
        },
      },
    ],
  };

  return (
    <>
      <SEO
        title="EasyResume AI – Resume Builder, ATS Checker & Cover Letter Generator"
        description="Create a professional resume, check ATS compatibility with a job description, and generate a tailored cover letter with EasyResume AI."
        path="/"
        ogImage="/og/home.png"
        ogAlt="EasyResume AI – Resume Builder, ATS Checker and Cover Letter Generator"
        twitterTitle="EasyResume AI – Resume Builder, ATS Checker & Cover Letter Generator"
        twitterDescription="Create resumes, check ATS compatibility, and generate tailored cover letters with AI."
        twitterImage="/og/home.png"
        twitterAlt="EasyResume AI job application tools"
        jsonLd={homeJsonLd}
      />

      <div className="flex-1 flex flex-col pt-10 sm:pt-16 md:pt-20 pb-12 sm:pb-20 items-center overflow-x-hidden">
        {/* Hero Content */}
        <div className="max-w-4xl px-4 text-center mb-8 sm:mb-16 flex flex-col items-center">
          <div className="flex flex-col gap-3 sm:gap-4 items-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[42px] font-semibold tracking-tight text-black font-display text-center leading-tight"
            >
              Create your <span className="text-[#27AE60]">Resume</span>{" "}
              superfast.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm sm:text-base leading-relaxed sm:leading-[26px] text-[#7A7A8C] font-normal max-w-[568px] text-center px-2"
            >
              Tired of wasting hours or days crafting your resume to apply
              different jobs? No more frustration!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-black text-white rounded-full font-semibold text-sm hover:bg-[#27AE60] active:scale-95 transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Get Started →
              </button>
            </motion.div>
          </div>
        </div>

        {/* Visual Previews */}
        <div className="relative w-full max-w-7xl mx-auto h-[360px] sm:h-[480px] md:h-[550px] lg:h-[600px] mt-4 sm:mt-8 md:mt-12 mb-12 sm:mb-[80px] flex justify-center items-center px-4">
          {/* Left Rotated Resume */}
          <motion.div
            initial={{ opacity: 0, rotate: 0, x: -50 }}
            whileInView={{ opacity: 1, rotate: -15, x: -160 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute hidden md:block w-[300px] lg:w-[450px] aspect-[1/1.4] z-10 md:-translate-x-12 lg:-translate-x-28"
          >
            <img
              src="/assets/Reference%20resume/Rectangle%20412.png"
              alt="EasyResume AI minimalist resume template preview"
              className="w-full h-full object-contain rotate-[15deg]"
            />
          </motion.div>

          {/* Right Rotated Resume */}
          <motion.div
            initial={{ opacity: 0, rotate: 0, x: 50 }}
            whileInView={{ opacity: 1, rotate: 15, x: 160 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute hidden md:block w-[300px] lg:w-[450px] aspect-[1/1.4] z-10 md:translate-x-12 lg:translate-x-28"
          >
            <img
              src="/assets/Reference%20resume/Rectangle%20413.png"
              alt="EasyResume AI modern resume template preview"
              className="w-full h-full object-contain -rotate-[15deg]"
            />
          </motion.div>

          {/* Center Resume */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative w-full max-w-[280px] sm:max-w-[380px] md:max-w-[440px] lg:max-w-[500px] aspect-[1/1.4] z-20"
          >
            <img
              src="/assets/Reference%20resume/Rectangle%20411.png"
              alt="EasyResume AI professional resume layout preview"
              className="w-full h-full object-contain"
            />
          </motion.div>
        </div>

        {/* Feature Tools Internal Navigation Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-display">
              All the tools you need to land your next job
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-2 max-w-2xl mx-auto">
              From building ATS-optimized resumes to tailoring cover letters and checking keyword match scores.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tool Card 1: Resume Builder */}
            <Link
              to="/resume-builder"
              className="group p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#27AE60] hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#27AE60] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#27AE60] transition-colors">
                  Free Resume Builder
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Add your experience, skills, and education to build a clear, ATS-friendly resume in minutes.
                </p>
              </div>
              <div className="flex items-center text-sm font-semibold text-[#27AE60] gap-1 group-hover:gap-2 transition-all">
                <span>Build Resume</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Tool Card 2: ATS Checker */}
            <Link
              to="/ats-checker"
              className="group p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#27AE60] hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#27AE60] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#27AE60] transition-colors">
                  ATS Resume Checker
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Compare your resume against a target job description to identify missing keywords and qualification gaps.
                </p>
              </div>
              <div className="flex items-center text-sm font-semibold text-[#27AE60] gap-1 group-hover:gap-2 transition-all">
                <span>Check ATS Score</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Tool Card 3: Cover Letter */}
            <Link
              to="/cover-letter"
              className="group p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 hover:border-[#27AE60] hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#27AE60] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#27AE60] transition-colors">
                  AI Cover Letter Generator
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Generate tailored, human-sounding cover letters targeted specifically to your role, company, and skills.
                </p>
              </div>
              <div className="flex items-center text-sm font-semibold text-[#27AE60] gap-1 group-hover:gap-2 transition-all">
                <span>Generate Cover Letter</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
