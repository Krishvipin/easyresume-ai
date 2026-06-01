import React, { useState, useEffect } from "react";
import { useAuth } from "../shared/hooks/use-auth";
import { logUserToFirestore, createProjectInFirestore } from "../firebase/firestore";
import { TourWizard } from "./TourWizard";
import { OnboardingProjectModal, type OnboardingProjectData } from "./OnboardingProjectModal";
import { useProjectStore } from "../store/use-project-store";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const { createProject: createLocalProject } = useProjectStore();

  const [onboardingState, setOnboardingState] = useState<"loading" | "auth" | "tour" | "project" | "done">("loading");

  useEffect(() => {
    if (authLoading) {
      setOnboardingState("loading");
      return;
    }

    if (!user) {
      setOnboardingState("auth");
      return;
    }

    // User is authenticated, log them to Firestore
    logUserToFirestore({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      createdAt: Date.now(),
    }).catch(console.error);

    // Check if onboarding is completed
    const hasCompletedOnboarding = localStorage.getItem("easyresume_onboarding_completed");
    if (hasCompletedOnboarding) {
      setOnboardingState("done");
    } else {
      setOnboardingState("tour");
    }
  }, [user, authLoading]);

  const handleTourComplete = () => {
    setOnboardingState("project");
  };

  const handleProjectSubmit = async (data: OnboardingProjectData) => {
    if (!user) return;

    try {
      // 1. Save to local IndexedDB store (for the Dashboard)
      // The store's createProject expects (name, company, role). We'll use the company name as the project name for now.
      const localProject = await createLocalProject(`${data.companyName} Application`, data.companyName, data.jobTitle);

      // 2. Log to Firestore (non-blocking to prevent UI hangs if Firestore is unprovisioned)
      createProjectInFirestore({
        uid: user.uid,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        note: data.note,
        date: Date.now(),
        localProjectId: localProject.id,
      }).catch(err => console.error("Firestore sync failed:", err));

      // 3. Mark onboarding as complete
      localStorage.setItem("easyresume_onboarding_completed", "true");
      
      setOnboardingState("done");
    } catch (error) {
      console.error("Failed to create onboarding project:", error);
    }
  };

  if (onboardingState === "loading") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (onboardingState === "auth") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl max-w-md w-full text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mb-6">
            <FileText className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-black font-display mb-2">Sign In Required</h2>
          <p className="text-gray-500 text-[15px] mb-8 leading-relaxed">
            Please sign in with Google to access the Resume Builder and save your progress across devices.
          </p>
          <button
            onClick={() => signIn()}
            className="w-full flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-black/90 active:scale-95 transition-all shadow-lg shadow-black/10"
          >
            <LogIn size={18} />
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  if (onboardingState === "tour") {
    return <TourWizard onComplete={handleTourComplete} />;
  }

  if (onboardingState === "project") {
    return <OnboardingProjectModal isOpen={true} onSubmit={handleProjectSubmit} />;
  }

  return <>{children}</>;
}
