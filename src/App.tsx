/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { Navbar } from "./shared/components/navbar";
import { Footer } from "./shared/components/footer";
import { ScrollToTopButton } from "./shared/components/ScrollToTopButton";
import LandingPage from "./pages/LandingPage";

import PlaceholderPage from "./pages/PlaceholderPage";
import ResumePage from "./pages/ResumePage";
import ATSCheckerPage from "./pages/ATSCheckerPage";
import ModifyResumePage from "./pages/ModifyResumePage";
import CoverLetterPage from "./pages/CoverLetterPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white flex flex-col w-full overflow-x-hidden relative">
        <Navbar />
        
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/resume-builder" element={<ResumePage />} />
          <Route path="/ats-checker" element={<ATSCheckerPage />} />
          <Route path="/modify-resume" element={<ModifyResumePage />} />
          <Route path="/cover-letter" element={<CoverLetterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <Footer />
        <ScrollToTopButton />
        <Analytics />
      </div>
    </Router>
  );
}

