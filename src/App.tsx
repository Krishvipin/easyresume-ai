/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./shared/components/navbar";
import { Footer } from "./shared/components/footer";
import { ScrollToTopButton } from "./shared/components/ScrollToTopButton";
import LandingPage from "./pages/LandingPage";

import PlaceholderPage from "./pages/PlaceholderPage";
import ResumePage from "./pages/ResumePage";
import ATSCheckerPage from "./pages/ATSCheckerPage";
import ModifyResumePage from "./pages/ModifyResumePage";
import CoverLetterPage from "./pages/CoverLetterPage";


export default function App() {
  return (
    <Router>
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
      </div>
    </Router>
  );
}

