import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TourWizardProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    title: "Welcome to EasyResume AI",
    description: "Your journey to the perfect resume starts here. Let us show you around so you can get the most out of our tools.",
    image: "/assets/illustrations/welcome.svg" // Placeholder illustration path
  },
  {
    title: "Fill in Your Details",
    description: "Start by providing your work experience, education, and skills. Our AI will use this foundation to craft your tailored resume.",
    image: "/assets/illustrations/details.svg"
  },
  {
    title: "Generate & Optimize",
    description: "With one click, generate an ATS-optimized resume. Use our ATS Checker to refine it against specific job descriptions before you apply.",
    image: "/assets/illustrations/optimize.svg"
  }
];

export function TourWizard({ onComplete }: TourWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        key="tour-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-[500px] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-200 flex flex-col"
      >
        {/* Progress bar */}
        <div className="flex h-1.5 w-full bg-gray-100">
          <div 
            className="bg-[#27AE60] transition-all duration-300 ease-in-out" 
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-8 flex flex-col items-center text-center gap-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center gap-4 w-full"
            >
              {/* Illustration Placeholder - Using a generic div block since assets might not exist */}
              <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner mb-2">
                <span className="text-[40px]">🚀</span>
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight text-black font-display">
                {step.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-[#7A7A8C] font-normal">
                {step.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex gap-2 my-2">
            {TOUR_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-[#27AE60]' : 'bg-gray-200'}`} 
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3.5 mt-2 bg-black text-white rounded-xl font-semibold text-[15px] hover:bg-black/90 active:scale-95 transition-all shadow-lg shadow-black/10"
          >
            {currentStep === TOUR_STEPS.length - 1 ? "Let's Get Started" : "Next"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
