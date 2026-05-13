import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col pt-20 pb-20 items-center">
      {/* Hero Content */}
      <div className="max-w-4xl px-4 text-center mb-16 flex flex-col items-center">
        <div className="flex flex-col gap-[12px] items-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[42px] font-semibold tracking-tight text-black font-display text-center"
          >
            Create your <span className="text-[#27AE60]">Resume</span> superfast.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[16px] leading-[26px] text-[#7A7A8C] font-normal max-w-[568px] text-center"
          >
            Tired of wasting hours or days crafting your resume to apply different jobs? No more frustration!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link 
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-full font-semibold text-[14px] hover:bg-[#27AE60] active:scale-95 transition-all"
            >
              Get Started →
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Visual Previews */}
      <div className="relative w-full max-w-7xl mx-auto h-[600px] mt-12 mb-[80px] flex justify-center items-center px-4">
        {/* Left Rotated Resume */}
        <motion.div 
          initial={{ opacity: 0, rotate: 0, x: -100 }}
          whileInView={{ opacity: 1, rotate: 15, x: -280 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute hidden lg:block w-[450px] aspect-[1/1.4] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-10"
        >
          <ResumeSkeleton color="bg-blue-50" />
        </motion.div>

        {/* Right Rotated Resume */}
        <motion.div 
          initial={{ opacity: 0, rotate: 0, x: 100 }}
          whileInView={{ opacity: 1, rotate: -15, x: 280 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute hidden lg:block w-[450px] aspect-[1/1.4] bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden z-10"
        >
          <ResumeSkeleton color="bg-purple-50" />
        </motion.div>

        {/* Center Resume */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative w-full max-w-[500px] aspect-[1/1.4] bg-white rounded-2xl border border-gray-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.12)] overflow-hidden z-20"
        >
          <ResumeSkeleton color="bg-[#fcfcfc]" />
        </motion.div>
      </div>
    </div>
  );
}

function ResumeSkeleton({ color }: { color: string }) {
  return (
    <div className={`w-full h-full p-12 ${color} flex flex-col gap-6`}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-3 w-48 bg-gray-100 rounded-full"></div>
        </div>
        <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
      </div>
      
      <div className="space-y-3 mt-4">
        <div className="h-3 w-full bg-gray-200 rounded-full"></div>
        <div className="h-3 w-[90%] bg-gray-100 rounded-full"></div>
        <div className="h-3 w-[95%] bg-gray-100 rounded-full"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-2 w-full bg-gray-100 rounded-full"></div>
          <div className="h-2 w-[80%] bg-gray-100 rounded-full"></div>
        </div>
        <div className="space-y-2">
          <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-2 w-full bg-gray-100 rounded-full"></div>
          <div className="h-2 w-[80%] bg-gray-100 rounded-full"></div>
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div className="h-2 w-24 bg-gray-200 rounded-full"></div>
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-100 rounded-md border border-gray-200"></div>
          <div className="h-6 w-16 bg-gray-100 rounded-md border border-gray-200"></div>
          <div className="h-6 w-16 bg-gray-100 rounded-md border border-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
