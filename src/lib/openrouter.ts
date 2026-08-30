import { jsonrepair } from "jsonrepair";
import { generateATSPrompt } from "./ats-prompt";
import type { ATSAnalysisResult } from "../types/ats";

const logDev = (...args: any[]) => {
  console.log("[EasyResume AI]", ...args);
};

/**
 * Verified live OpenRouter free model endpoints list.
 * Ordered by reliability and response speed.
 */
const ACTIVE_FREE_MODELS = [
  "dots-studio/dots-3-note-preview:free",
  "inclusionai/ling-3.0-flash-fin:free",
  "liquid/lfm-2.5-2.6b:free",
  "minimax/minimax-m3:free",
  "minimax/minimax-m2.7:free",
  "z-ai/glm-5.2:free",
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "poolside/laguna-s-2.1:free",
  "poolside/laguna-xs-2.1:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-3.5-lightning:free",
  "openrouter/free",
];

/**
 * Intelligent local offline resume tailoring engine.
 * Used as fallback when all remote AI providers are unavailable, rate-limited, or unconfigured.
 */
export function generateOfflineTailoredResume(
  formData: any,
  jobDescription: string,
  atsReport?: string,
): {
  summary?: string;
  experiences?: any[];
  skills?: string[];
  tools?: string[];
} {
  logDev("[OpenRouter] Generating offline tailored resume based on JD keywords and ATS report...");

  const cleanJD = (jobDescription || "").toLowerCase();
  const missingKeywords: string[] = [];
  const stopWords = new Set([
    "and", "the", "for", "with", "that", "this", "from", "have", "will",
    "your", "our", "are", "you", "about", "looking", "role", "work", "join", "team",
    "must", "should", "ability", "strong", "experience", "skills", "plus"
  ]);

  // 1. Extract keywords from ATS report if present
  if (atsReport) {
    const missingSkillsMatch = atsReport.match(/Missing Skills:\s*([^]+?)(?:\n\n|\n[A-Z]|$)/i);
    if (missingSkillsMatch && missingSkillsMatch[1]) {
      const parsed = missingSkillsMatch[1]
        .split(",")
        .map((s) => s.replace(/\(.*?\)/g, "").trim())
        .filter((s) => s.length > 1 && !stopWords.has(s.toLowerCase()));
      missingKeywords.push(...parsed);
    }
  }

  // 2. Extract prominent keywords from Job Description
  const words = cleanJD.match(/\b[a-z]{3,}\b/g) || [];
  words.forEach((w) => {
    if (!stopWords.has(w) && !missingKeywords.some((k) => k.toLowerCase() === w) && missingKeywords.length < 20) {
      missingKeywords.push(w);
    }
  });

  // 3. Inject missing keywords into skills
  const existingSkills = new Set((formData.skills || []).map((s: string) => s.toLowerCase()));
  const newSkillsToAdd = missingKeywords
    .filter((k) => !existingSkills.has(k.toLowerCase()))
    .slice(0, 6)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  const updatedSkills = [...(formData.skills || []), ...newSkillsToAdd];

  // 4. Tailor Summary
  const summaryPrefix = formData.role
    ? `Results-driven ${formData.role} specializing in ${newSkillsToAdd.slice(0, 3).join(", ") || "high-impact solutions"}. `
    : "";
  const updatedSummary = summaryPrefix + (formData.summary || "");

  // 5. Tailor Experiences with bullet enhancements
  const updatedExperiences = (formData.experiences || []).map((exp: any, idx: number) => {
    const rawBullets = Array.isArray(exp.description)
      ? [...exp.description]
      : typeof exp.description === "string"
        ? [exp.description]
        : [];
    
    const bullets = rawBullets.filter(Boolean);
    if (idx === 0 && newSkillsToAdd.length > 0) {
      bullets.unshift(
        `Applied ${newSkillsToAdd.slice(0, 2).join(" and ")} to optimize workflow efficiency, enhance product quality, and accelerate project delivery.`
      );
    }
    return {
      ...exp,
      description: bullets,
    };
  });

  return {
    summary: updatedSummary,
    experiences: updatedExperiences,
    skills: updatedSkills,
    tools: formData.tools || [],
  };
}

/**
 * Robust JSON extraction, repair, and sanitization helper for OpenRouter LLM outputs.
 * Powered by `jsonrepair` and heuristics to handle reasoning models, markdown fences, and truncated JSON.
 */
function extractAndParseJSON<T = any>(rawText: string): T | null {
  if (!rawText || typeof rawText !== "string") return null;

  // 1. Strip reasoning tags (<think>...</think>) and markdown fences
  let cleaned = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  // 2. Direct attempt with native JSON.parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      return parsed as T;
    }
  } catch (e) {}

  // 3. Direct attempt with jsonrepair
  try {
    const repaired = jsonrepair(cleaned);
    const parsed = JSON.parse(repaired);
    if (parsed && typeof parsed === "object") {
      logDev("[OpenRouter] jsonrepair successfully parsed whole response.");
      return parsed as T;
    }
  } catch (e) {}

  // 4. Find candidates between first '{' and last '}'
  const lastCloseIdx = cleaned.lastIndexOf("}");
  if (lastCloseIdx !== -1) {
    const openIndices: number[] = [];
    for (let i = 0; i <= lastCloseIdx; i++) {
      if (cleaned[i] === "{") openIndices.push(i);
    }

    for (const startIdx of openIndices) {
      const candidate = cleaned.slice(startIdx, lastCloseIdx + 1);
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && typeof parsed === "object") {
          return parsed as T;
        }
      } catch (e) {}

      try {
        const repaired = jsonrepair(candidate);
        const parsed = JSON.parse(repaired);
        if (parsed && typeof parsed === "object") {
          logDev("[OpenRouter] jsonrepair successfully parsed candidate substring.");
          return parsed as T;
        }
      } catch (e) {}
    }
  }

  // 5. Truncated JSON Repair: For responses cut off before the closing brace
  const firstOpenIdx = cleaned.indexOf("{");
  if (firstOpenIdx !== -1) {
    const unclosed = cleaned.slice(firstOpenIdx);
    try {
      const repaired = jsonrepair(unclosed);
      const parsed = JSON.parse(repaired);
      if (parsed && typeof parsed === "object") {
        logDev("[OpenRouter] jsonrepair successfully recovered truncated JSON.");
        return parsed as T;
      }
    } catch (e) {}
  }

  return null;
}

export const getDynamicSuggestionsFromOpenRouter = async (
  resume: string,
  jobDescription: string,
  parentSignal?: AbortSignal,
): Promise<ATSAnalysisResult | { error: true; message: string }> => {
  const apiKey =
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_OPENROUTER_API_KEY) ||
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ||
    "";

  if (!apiKey) {
    logDev("[OpenRouter] API key is not configured.");
    throw new Error("OpenRouter API key is not configured");
  }

  const prompt = generateATSPrompt(resume, jobDescription);
  const modelsToTry = ACTIVE_FREE_MODELS;

  let lastError: any = null;
  logDev("[OpenRouter] Initiating ATS analysis flow across candidate models:", modelsToTry);

  for (const model of modelsToTry) {
    if (parentSignal?.aborted) {
      logDev("[OpenRouter] Analysis request aborted by parent signal.");
      throw new Error("Analysis request was aborted");
    }

    logDev(`[OpenRouter] Trying model '${model}'...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const handleParentAbort = () => controller.abort();
    if (parentSignal) {
      parentSignal.addEventListener("abort", handleParentAbort);
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000",
            "X-Title": "EasyResume AI",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: "You are an ATS Resume Analyzer API. You must output ONLY a valid, parseable JSON object matching the requested schema. Do NOT output reasoning, thinking process, preambles, or markdown formatting outside the JSON."
              },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 4096,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorBody = await response.json();
          errorMsg = errorBody.error?.message || JSON.stringify(errorBody.error || errorBody);
        } catch (e) {}

        if (response.status === 429) {
          logDev(`[OpenRouter] Rate limit hit (429) for '${model}'. Trying next fallback model...`);
          lastError = new Error("OpenRouter free tier daily rate limit reached (50 requests/day). Please wait a few minutes or try again later.");
          continue;
        }

        logDev(`[OpenRouter] Model '${model}' HTTP Error (${response.status}):`, errorMsg);
        throw new Error(`OpenRouter API error (${response.status}) for ${model}: ${errorMsg}`);
      }

      const data = await response.json();
      logDev(`[OpenRouter] Model '${model}' raw API response received.`);
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        logDev(`[OpenRouter] Model '${model}' returned empty content.`);
        throw new Error(`Empty response content from OpenRouter model ${model}`);
      }

      const parsedJSON = extractAndParseJSON<ATSAnalysisResult>(text);
      if (parsedJSON) {
        logDev(`[OpenRouter] Model '${model}' successfully produced ATS result:`, parsedJSON);
        return parsedJSON;
      }

      logDev(`[OpenRouter] Model '${model}' failed JSON extraction. Raw text was:`, text.slice(0, 200) + "...");
      throw new Error(`Failed to parse valid JSON from OpenRouter model ${model}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (parentSignal?.aborted) {
        throw err;
      }

      logDev(`[OpenRouter] Model '${model}' failed or timed out:`, err?.message || err);
      lastError = err;
    }
  }

  logDev("[OpenRouter] All model attempts failed. Last error:", lastError);
  throw lastError || new Error("All OpenRouter models failed to respond");
};

export const generateCoverLetterFromOpenRouter = async (
  prompt: string,
  parentSignal?: AbortSignal,
): Promise<string> => {
  const apiKey =
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_OPENROUTER_API_KEY) ||
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ||
    "";

  if (!apiKey) {
    throw new Error("OpenRouter API key is not configured");
  }

  const modelsToTry = ACTIVE_FREE_MODELS;
  let lastError: any = null;

  for (const model of modelsToTry) {
    if (parentSignal?.aborted) {
      throw new Error("Cover letter request was aborted");
    }

    logDev(`[OpenRouter] Trying model '${model}' for cover letter generation...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const handleParentAbort = () => controller.abort();
    if (parentSignal) {
      parentSignal.addEventListener("abort", handleParentAbort);
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000",
            "X-Title": "EasyResume AI",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 2000,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorBody = await response.json();
          errorMsg = errorBody.error?.message || JSON.stringify(errorBody.error || errorBody);
        } catch (e) {}

        if (response.status === 429) {
          logDev(`[OpenRouter] Rate limit hit (429) for '${model}'. Trying next fallback model...`);
          lastError = new Error("OpenRouter free tier daily rate limit reached. Please wait a few minutes or try again later.");
          continue;
        }

        throw new Error(`OpenRouter API error (${response.status}) for ${model}: ${errorMsg}`);
      }

      const data = await response.json();
      let text: string = data.choices?.[0]?.message?.content || "";

      if (!text) {
        throw new Error(`Empty response content from model ${model}`);
      }

      // 1. Remove reasoning / thinking process blocks e.g. <think>...</think> or [Thinking]...
      text = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
      text = text.replace(/^[\s\S]*?(?=Dear\s|To\s|Hi\s|Greetings\s)/i, "");

      // 2. Remove markdown code fences if present
      text = text
        .replace(/^```[a-z]*\s*/i, "")
        .replace(/\s*```$/g, "")
        .trim();

      return text;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (parentSignal?.aborted) {
        throw err;
      }

      logDev(`[OpenRouter] Model '${model}' failed during cover letter generation:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("All OpenRouter fallback models failed to generate cover letter");
};

export const modifyResumeWithOpenRouter = async (
  formData: any,
  jobDescription: string,
  atsReport?: string,
  parentSignal?: AbortSignal,
): Promise<{
  summary?: string;
  experiences?: any[];
  skills?: string[];
  tools?: string[];
}> => {
  const apiKey =
    (typeof process !== "undefined" && process.env?.OPENROUTER_API_KEY) ||
    (typeof process !== "undefined" && process.env?.VITE_OPENROUTER_API_KEY) ||
    (import.meta.env && import.meta.env.VITE_OPENROUTER_API_KEY) ||
    "";

  if (!apiKey) {
    logDev("[OpenRouter] API key is not configured for resume modification.");
    throw new Error("OpenRouter API key is not configured");
  }

  const { generateTailorResumePrompt } = await import("./tailor-prompt");
  const prompt = generateTailorResumePrompt(formData, jobDescription, atsReport);

  const modelsToTry = ACTIVE_FREE_MODELS;
  let lastError: any = null;
  logDev("[OpenRouter] Initiating Tailor Resume flow across models:", modelsToTry);

  for (const model of modelsToTry) {
    if (parentSignal?.aborted) {
      throw new Error("Tailor resume request was aborted");
    }

    logDev(`[OpenRouter] Trying model '${model}' for resume tailoring...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const handleParentAbort = () => controller.abort();
    if (parentSignal) {
      parentSignal.addEventListener("abort", handleParentAbort);
    }

    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer":
              typeof window !== "undefined"
                ? window.location.origin
                : "http://localhost:3000",
            "X-Title": "EasyResume AI",
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: "system",
                content: "You are a resume tailoring API. You must output ONLY a valid, parseable JSON object matching the requested schema with tailored summary, experiences, skills, and tools. Do NOT output reasoning, thinking process, preambles, or markdown formatting outside the JSON."
              },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
            max_tokens: 4096,
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (!response.ok) {
        let errorMsg = response.statusText;
        try {
          const errorBody = await response.json();
          errorMsg = errorBody.error?.message || JSON.stringify(errorBody.error || errorBody);
        } catch (e) {}

        if (response.status === 429) {
          logDev(`[OpenRouter] Rate limit hit (429) for '${model}'. Trying next fallback model...`);
          lastError = new Error("OpenRouter free tier daily rate limit reached. Please wait a few minutes or try again later.");
          continue;
        }

        throw new Error(`OpenRouter API error (${response.status}) for ${model}: ${errorMsg}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error(`Empty response content from model ${model}`);
      }

      const parsedJSON = extractAndParseJSON(text);
      if (parsedJSON) {
        logDev(`[OpenRouter] Successfully tailored resume with model '${model}':`, parsedJSON);

        const tr = parsedJSON.tailoredResume || parsedJSON;
        const summary = tr.professionalSummary || tr.summary || parsedJSON.summary || "";

        let skills: string[] = [];
        if (Array.isArray(tr.skills)) {
          if (tr.skills.length > 0 && typeof tr.skills[0] === "object" && tr.skills[0].items) {
            skills = tr.skills.flatMap((s: any) => Array.isArray(s.items) ? s.items : []);
          } else {
            skills = tr.skills.map((s: any) => typeof s === "string" ? s : s.name || s.item || "").filter(Boolean);
          }
        }

        let experiences = tr.experience || tr.experiences || parsedJSON.experiences || [];
        if (Array.isArray(experiences)) {
          experiences = experiences.map((exp: any, idx: number) => ({
            id: exp.id || formData.experiences?.[idx]?.id || `exp-${Date.now()}-${idx}`,
            position: exp.jobTitle || exp.position || formData.experiences?.[idx]?.position || "Role",
            company: exp.company || formData.experiences?.[idx]?.company || "Company",
            duration: exp.duration || (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : exp.startDate || formData.experiences?.[idx]?.duration || "Duration"),
            description: Array.isArray(exp.bullets)
              ? exp.bullets
              : Array.isArray(exp.description)
                ? exp.description
                : typeof exp.description === "string"
                  ? [exp.description]
                  : formData.experiences?.[idx]?.description || [],
          }));
        }

        return {
          ...parsedJSON,
          summary: summary || formData.summary,
          experiences: experiences.length > 0 ? experiences : formData.experiences,
          skills: skills.length > 0 ? skills : formData.skills,
          tools: parsedJSON.tools || formData.tools || [],
        };
      }

      logDev(`[OpenRouter] Model '${model}' returned invalid/truncated JSON. Raw snippet:`, text.slice(0, 250) + "...");
      throw new Error(`Failed to parse valid JSON from OpenRouter model ${model}`);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (parentSignal) {
        parentSignal.removeEventListener("abort", handleParentAbort);
      }

      if (parentSignal?.aborted) {
        throw err;
      }

      logDev(`[OpenRouter] Model '${model}' failed during resume tailoring:`, err?.message || err);
      lastError = err;
    }
  }

  logDev("[OpenRouter] All candidate remote models failed or were rate-limited. Activating intelligent offline tailoring engine...");
  return generateOfflineTailoredResume(formData, jobDescription, atsReport);
};
