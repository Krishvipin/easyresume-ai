export interface ScoreBreakdown {
  score: number;
  maxScore: number;
}

export interface SkillMatch {
  term: string;
  importance: string;
  evidence: string;
}

export interface MissingSkill {
  term: string;
  importance: string;
  reason: string;
}

export interface RequirementMatch {
  requirement: string;
  evidence: string;
}

export interface GapOrIssue {
  issue: string;
  description: string;
  severity: "high" | "medium" | "low";
}

export interface Recommendation {
  priority: number;
  title: string;
  description: string;
}

export interface ATSAnalysisResult {
  score: number;
  scoreLabel: string;
  summary: string;
  breakdown: {
    requiredSkills: ScoreBreakdown;
    experience: ScoreBreakdown;
    keywords: ScoreBreakdown;
    seniority: ScoreBreakdown;
    education: ScoreBreakdown;
    atsReadability: ScoreBreakdown;
    achievements: ScoreBreakdown;
  };
  matchedSkills: SkillMatch[];
  missingSkills: MissingSkill[];
  matchedRequirements: RequirementMatch[];
  gaps: GapOrIssue[];
  resumeIssues: GapOrIssue[];
  recommendations: Recommendation[];
}
