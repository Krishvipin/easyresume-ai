import { generateATSPrompt } from "./ats-prompt";
import type { ATSAnalysisResult } from "../types/ats";

const logDev = (...args: any[]) => {
  console.log("[EasyResume AI]", ...args);
};

/**
 * Robust JSON extraction and sanitization helper for OpenRouter LLM outputs.
 * Handles markdown fences, text headers/footers, trailing commas, and control characters.
 * Cross-browser safe (avoids lookbehind assertions for Safari / legacy JS engines).
 */
function extractAndParseJSON<T = any>(rawText: string): T | null {
  if (!rawText || typeof rawText !== "string") return null;

  // 1. Strip Markdown code block fences
  let cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/g, "")
    .trim();

  // 2. Extract substring between first '{' and last '}'
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return null;
  }

  const jsonSubstring = cleaned.slice(startIdx, endIdx + 1);

  // 3. Direct JSON parsing attempt
  try {
    const parsed = JSON.parse(jsonSubstring);
    if (parsed && typeof parsed === "object") {
      return parsed as T;
    }
  } catch (directErr) {
    logDev("[OpenRouter] Direct JSON.parse failed. Attempting JSON sanitization...");
  }

  // 4. Fallback: Sanitize common model formatting issues (trailing commas, unescaped newlines)
  try {
    const sanitized = jsonSubstring
      // Remove trailing commas in objects or arrays: e.g. ", ]" or ", }"
      .replace(/,\s*([\]}])/g, "$1")
      // Remove or normalize raw line breaks inside values
      .replace(/[\r\n]+/g, "\\n");

    const parsed = JSON.parse(sanitized);
    if (parsed && typeof parsed === "object") {
      logDev("[OpenRouter] Sanitized JSON parse succeeded.");
      return parsed as T;
    }
  } catch (sanitizedErr) {
    logDev("[OpenRouter] Sanitized JSON parse failed.");
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

  const modelsToTry = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "thinkingmachines/inkling-small:free",
    "nvidia/nemotron-3.5-lightning:free",
    "openrouter/free",
  ];

  let lastError: any = null;
  logDev("[OpenRouter] Initiating ATS analysis flow across candidate models:", modelsToTry);

  for (const model of modelsToTry) {
    if (parentSignal?.aborted) {
      logDev("[OpenRouter] Analysis request aborted by parent signal.");
      throw new Error("Analysis request was aborted");
    }

    logDev(`[OpenRouter] Trying model '${model}'...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000); // 22s limit per model attempt

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
            temperature: 0.2,
            max_tokens: 2500,
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
          errorMsg = JSON.stringify(errorBody.error || errorBody);
        } catch (e) {
          // Ignore if not JSON
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

  const modelsToTry = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "thinkingmachines/inkling-small:free",
    "nvidia/nemotron-3.5-lightning:free",
    "openrouter/free",
  ];

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
          errorMsg = JSON.stringify(errorBody.error || errorBody);
        } catch (e) {}
        throw new Error(`OpenRouter API error (${response.status}) for ${model}: ${errorMsg}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;

      if (!text) {
        throw new Error(`Empty response content from model ${model}`);
      }

      return text.trim();
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

  const modelsToTry = [
    "meta-llama/llama-3.3-70b-instruct:free",
    "thinkingmachines/inkling-small:free",
    "nvidia/nemotron-3.5-lightning:free",
    "openrouter/free",
  ];

  let lastError: any = null;
  logDev("[OpenRouter] Initiating Tailor Resume flow across models:", modelsToTry);

  for (const model of modelsToTry) {
    if (parentSignal?.aborted) {
      throw new Error("Tailor resume request was aborted");
    }

    logDev(`[OpenRouter] Trying model '${model}' for resume tailoring...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s per attempt limit

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
            temperature: 0.2,
            max_tokens: 3500,
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
          errorMsg = JSON.stringify(errorBody.error || errorBody);
        } catch (e) {}
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
        return parsedJSON;
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

  throw lastError || new Error("All OpenRouter fallback models failed to tailor resume");
};
